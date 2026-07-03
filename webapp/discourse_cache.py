"""Response cache and circuit breaker for Discourse-backed views.

``discourse.ubuntu.com`` rate-limits our admin Data Explorer API. When a burst
of crawler traffic causes cache misses, every request hits Discourse, we start
getting HTTP 429s, and the retries turn it into a self-sustaining 429 storm.

This module provides a small per-worker response cache with a shared circuit
breaker: when Discourse returns 429 we open the breaker and serve stale data
(or 503) for a short cooldown instead of hammering Discourse. The breaker state
is module-level so every Discourse-backed view (engage pages, takeovers) shares
one cooldown -- a 429 from any of them protects all of them.
"""

# Standard library
import time

# Packages
import sentry_sdk
from requests.exceptions import ConnectionError as RequestsConnectionError
from requests.exceptions import HTTPError, RequestException, Timeout
from werkzeug.exceptions import ServiceUnavailable

# Circuit breaker state, shared across all Discourse-backed views in a worker.
_DISCOURSE_COOLDOWN = {"until": 0.0}
_DISCOURSE_COOLDOWN_MIN = 60
_DISCOURSE_COOLDOWN_MAX = 600
# While Discourse is erroring, retry a stale entry at most this often
_ERROR_RETRY = 30


def _http_error_status_code(error):
    response = getattr(error, "response", None)
    if response is None:
        return None
    return response.status_code


def _cooldown_retry_after():
    """Seconds until the breaker closes, for Retry-After headers."""
    remaining = _DISCOURSE_COOLDOWN["until"] - time.time()
    if remaining <= 0:
        return _DISCOURSE_COOLDOWN_MIN
    # min() before int() so an unbounded cooldown doesn't overflow
    return max(1, int(min(remaining, _DISCOURSE_COOLDOWN_MAX)))


def _serve_stale(cache, key, cached, ttl):
    """Serve a stale entry, re-stamped so the next retry against a
    failing Discourse happens after _ERROR_RETRY instead of per request.
    """
    entry_ttl = ttl if cached["data"] else min(ttl, 60)
    cache[key] = {
        "data": cached["data"],
        "ts": time.time() - entry_ttl + _ERROR_RETRY,
    }
    return cached["data"]


def _start_discourse_cooldown(error):
    delay = _DISCOURSE_COOLDOWN_MIN
    response = getattr(error, "response", None)
    if response is not None:
        retry_after = response.headers.get("Retry-After", "").strip()
        if retry_after.isdigit():
            delay = int(retry_after)
    delay = min(max(delay, _DISCOURSE_COOLDOWN_MIN), _DISCOURSE_COOLDOWN_MAX)
    _DISCOURSE_COOLDOWN["until"] = time.time() + delay


def cached_fetch(cache, key, fetcher, ttl, max_size=512):
    """Return cached data, refreshing via ``fetcher`` when stale.

    Fresh data is served from ``cache`` for ``ttl`` seconds. When Discourse
    rate-limits us (HTTP 429) we open a circuit breaker: subsequent calls
    serve stale data if available, otherwise raise ``ServiceUnavailable``
    (503) without calling Discourse until the cooldown expires.

    ``cache`` is any dict-like object owned by the caller (typically a
    per-view dict living in a closure, so it is scoped to the worker process).
    ``max_size`` caps the number of entries: once reached, the oldest entry
    (by insertion order) is evicted to keep per-worker memory bounded even
    when bots crawl large numbers of distinct query-parameter combinations.
    """
    cached = cache.get(key)
    now = time.time()

    if cached:
        # "Not found" results expire quickly so newly published
        # pages appear promptly
        entry_ttl = ttl if cached["data"] else min(ttl, 60)
        if now - cached["ts"] < entry_ttl:
            cache.pop(key, None)
            cache[key] = cached
            return cached["data"]

    if now < _DISCOURSE_COOLDOWN["until"]:
        if cached:
            return cached["data"]
        raise ServiceUnavailable(
            "Discourse is rate-limiting requests; please retry shortly.",
            retry_after=_cooldown_retry_after(),
        )

    try:
        data = fetcher()
    except HTTPError as error:
        sentry_sdk.capture_exception(error)
        if _http_error_status_code(error) == 429:
            _start_discourse_cooldown(error)
            if cached:
                return _serve_stale(cache, key, cached, ttl)
            raise ServiceUnavailable(
                "Discourse is rate-limiting requests; please retry shortly.",
                retry_after=_cooldown_retry_after(),
            )
        if cached:
            return _serve_stale(cache, key, cached, ttl)
        raise
    except (RequestsConnectionError, Timeout, RequestException) as error:
        sentry_sdk.capture_exception(error)
        if cached:
            return _serve_stale(cache, key, cached, ttl)
        raise ServiceUnavailable(
            "Discourse is unavailable; please retry shortly.",
            retry_after=_ERROR_RETRY,
        )

    # Move key to insertion-order tail so the oldest unrefreshed entry is
    # always evicted first, then enforce the size cap.
    cache.pop(key, None)
    cache[key] = {"data": data, "ts": time.time()}
    while len(cache) > max_size:
        cache.pop(next(iter(cache)))
    return data


def install_topic_cache(api, ttl=600):
    """Wrap ``api.get_topic`` with the shared response cache and breaker.

    ``get_topic`` is the only Discourse call the docs, tutorials and community
    views make -- both for the index topic (via the parser's ``parse()``) and
    for each individual document. Wrapping it per topic id means repeated
    views and every ``parse()`` are served from memory, and a 429 opens the
    shared circuit breaker so these views stop hammering Discourse during a
    rate-limit storm instead of cascading into 500s.

    ``api`` is mutated in place; the cache dict is returned for inspection.
    """
    topic_cache = {}
    fetch_topic = api.get_topic
    check_updates = api.check_for_topic_updates

    def get_topic(topic_id):
        return cached_fetch(
            topic_cache,
            # str() so int and str topic ids share one cache entry
            str(topic_id),
            lambda: fetch_topic(topic_id),
            ttl=ttl,
        )

    def check_for_topic_updates(topic_id, last_updated=None):
        updated, updated_at = check_updates(topic_id, last_updated)
        if updated:
            # Drop the cached topic so the caller's re-parse sees the
            # new content instead of latching the stale cached copy
            topic_cache.pop(str(topic_id), None)
        return updated, updated_at

    api.get_topic = get_topic
    api.check_for_topic_updates = check_for_topic_updates
    return topic_cache
