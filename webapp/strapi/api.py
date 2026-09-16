"""
A small read-only client for the Strapi CMS that backs CMS-authored pages.

Two things matter here:

- Every request to the site that does not match a template would otherwise
  become a request to Strapi. Instead the client keeps the (small) list of
  routes Strapi owns and only fetches a page when the path is on it.
- Strapi being slow or down must never take ubuntu.com with it. Every
  lookup falls back to the last good value, and then to "no CMS page",
  which lands the request on the normal 404.
"""

# Standard library
import logging
import threading
import time
from urllib.parse import urljoin

# Packages
import requests
from canonicalwebteam.flask_base.env import get_flask_env
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

# How long a page and the route list stay usable before a refresh. Edits
# reach the site sooner than this: Strapi calls /_cms/cache/purge on save.
DEFAULT_CACHE_TTL = 60

# Strapi should answer in milliseconds; anything slower is a fault, and
# waiting on it would hold a worker open.
REQUEST_TIMEOUT = 5

# After a failure, stop asking for a moment. Without this, an outage turns
# every 404 on a busy site into a failed request and a log line.
ERROR_BACKOFF = 10


class StrapiError(Exception):
    """Raised when Strapi cannot be reached or answers unexpectedly."""


class _TTLCache:
    """
    A tiny TTL cache that also keeps the last good value past expiry, so a
    Strapi outage degrades to stale content rather than to an error.
    """

    def __init__(self, ttl):
        self.ttl = ttl
        self._lock = threading.Lock()
        self._entries = {}

    def get(self, key):
        """Return (value, is_fresh). Misses are (None, False)."""
        with self._lock:
            entry = self._entries.get(key)

        if entry is None:
            return None, False

        value, stored_at = entry

        return value, (time.monotonic() - stored_at) < self.ttl

    def set(self, key, value):
        with self._lock:
            self._entries[key] = (value, time.monotonic())

    def clear(self, key=None):
        with self._lock:
            if key is None:
                self._entries.clear()
            else:
                self._entries.pop(key, None)


class StrapiAPI:
    def __init__(
        self,
        base_url,
        token=None,
        preview_token=None,
        session=None,
        cache_ttl=DEFAULT_CACHE_TTL,
        media_url=None,
    ):
        self.base_url = base_url.rstrip("/") + "/"
        self.token = token
        self.preview_token = preview_token
        self.media_url = (media_url or base_url).rstrip("/")
        self.session = session or self._build_session()
        self._pages = _TTLCache(cache_ttl)
        self._routes = _TTLCache(cache_ttl)
        self._backoff = {}
        self._backoff_lock = threading.Lock()

    def _in_backoff(self, key):
        with self._backoff_lock:
            return time.monotonic() < self._backoff.get(key, 0)

    def _start_backoff(self, key):
        with self._backoff_lock:
            self._backoff[key] = time.monotonic() + ERROR_BACKOFF

    def _clear_backoff(self):
        with self._backoff_lock:
            self._backoff.clear()

    @staticmethod
    def _build_session():
        session = requests.Session()
        retries = Retry(
            total=2,
            backoff_factor=0.1,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        session.mount("http://", HTTPAdapter(max_retries=retries))
        session.mount("https://", HTTPAdapter(max_retries=retries))

        return session

    def _get(self, path, params=None, preview=False):
        """
        GET from Strapi, returning the parsed body, or None for a 404.
        """
        headers = {"Accept": "application/json"}

        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        if preview and self.preview_token:
            headers["x-preview-token"] = self.preview_token

        url = urljoin(self.base_url, path.lstrip("/"))

        try:
            response = self.session.get(
                url,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
            )
        except requests.RequestException as error:
            raise StrapiError(f"Could not reach {url}: {error}") from error

        if response.status_code == 404:
            return None

        if not response.ok:
            raise StrapiError(
                f"{url} returned {response.status_code}: {response.text[:200]}"
            )

        try:
            return response.json()
        except ValueError as error:
            raise StrapiError(f"{url} did not return JSON") from error

    # Routes
    # ===

    def get_route_entries(self, preview=False):
        """
        Every route Strapi serves, with its title and last edit. Cached,
        because it is consulted for every request that misses the template
        tree.
        """
        key = "draft" if preview else "published"
        cached, is_fresh = self._routes.get(key)

        if is_fresh or self._in_backoff(key):
            return cached if cached is not None else []

        params = {"status": "draft"} if preview else None

        try:
            payload = self._get(
                "api/pages/routes", params=params, preview=preview
            )
        # Deliberately broad: a page on ubuntu.com must not 500 because
        # the CMS is unreachable, misconfigured, or intercepted by a test
        # HTTP recorder. Anything unexpected degrades to "no CMS pages".
        except Exception as error:  # noqa: BLE001
            self._start_backoff(key)

            if cached is not None:
                logger.warning("Using the stale CMS route list: %s", error)
                return cached

            logger.warning("Could not load the CMS route list: %s", error)

            return []

        entries = [
            entry
            for entry in (payload or {}).get("data", [])
            if entry.get("route")
        ]
        self._routes.set(key, entries)

        return entries

    def get_routes(self, preview=False):
        """The set of paths Strapi serves."""
        return {
            entry["route"] for entry in self.get_route_entries(preview=preview)
        }

    def has_route(self, route, preview=False):
        return route in self.get_routes(preview=preview)

    # Pages
    # ===

    def get_page(self, route, preview=False):
        """
        The page published at `route`, or None. Returns the raw Strapi
        document; webapp.strapi.content turns it into template context.
        """
        key = f"{'draft' if preview else 'published'}:{route}"
        cached, is_fresh = self._pages.get(key)

        if is_fresh or self._in_backoff(key):
            return cached

        params = {"route": route}

        if preview:
            params["status"] = "draft"

        try:
            payload = self._get(
                "api/pages/by-route", params=params, preview=preview
            )
        # Broad for the same reason as get_route_entries: a failure here
        # falls through to the normal 404 rather than an error page.
        except Exception as error:  # noqa: BLE001
            self._start_backoff(key)

            if cached is not None:
                logger.warning(
                    "Using the stale CMS copy of %s: %s", route, error
                )
                return cached

            logger.warning("Could not load the CMS page %s: %s", route, error)

            return None

        page = (payload or {}).get("data")
        self._pages.set(key, page)

        return page

    def purge(self, route=None):
        """Drop cached content so the next request refetches it."""
        self._clear_backoff()
        self._routes.clear()

        if route is None:
            self._pages.clear()
            return

        for prefix in ("published", "draft"):
            self._pages.clear(f"{prefix}:{route}")


def build_api():
    """
    Build the client from the environment, or return None when no CMS is
    configured — the site then behaves exactly as it did before.
    """
    base_url = get_flask_env("STRAPI_API_URL")

    if not base_url:
        return None

    ttl = get_flask_env("STRAPI_CACHE_TTL")

    return StrapiAPI(
        base_url=base_url,
        token=get_flask_env("STRAPI_API_TOKEN"),
        preview_token=get_flask_env("STRAPI_PREVIEW_TOKEN"),
        media_url=get_flask_env("STRAPI_MEDIA_URL"),
        cache_ttl=int(ttl) if ttl else DEFAULT_CACHE_TTL,
    )
