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
from requests.exceptions import HTTPError
from werkzeug.exceptions import ServiceUnavailable

# Circuit breaker state, shared across all Discourse-backed views in a worker.
_DISCOURSE_COOLDOWN = {"until": 0.0}
_DISCOURSE_COOLDOWN_MIN = 60
_DISCOURSE_COOLDOWN_MAX = 600


def _http_error_status_code(error):
    response = getattr(error, "response", None)
    if response is None:
        return None
    return response.status_code


def _start_discourse_cooldown(error):
    delay = _DISCOURSE_COOLDOWN_MIN
    response = getattr(error, "response", None)
    if response is not None:
        retry_after = response.headers.get("Retry-After", "")
        if retry_after.isdigit():
            delay = int(retry_after)
    delay = min(max(delay, _DISCOURSE_COOLDOWN_MIN), _DISCOURSE_COOLDOWN_MAX)
    _DISCOURSE_COOLDOWN["until"] = time.time() + delay


def cached_fetch(cache, key, fetcher, ttl):
    """Return cached data, refreshing via ``fetcher`` when stale.

    Fresh data is served from ``cache`` for ``ttl`` seconds. When Discourse
    rate-limits us (HTTP 429) we open a circuit breaker: subsequent calls
    serve stale data if available, otherwise raise ``ServiceUnavailable``
    (503) without calling Discourse until the cooldown expires.

    ``cache`` is any dict-like object owned by the caller (typically a
    per-view dict living in a closure, so it is scoped to the worker process).
    """
    cached = cache.get(key)
    now = time.time()

    if cached and now - cached["ts"] < ttl:
        return cached["data"]

    if now < _DISCOURSE_COOLDOWN["until"]:
        if cached:
            return cached["data"]
        raise ServiceUnavailable(
            "Discourse is rate-limiting requests; please retry shortly."
        )

    try:
        data = fetcher()
    except HTTPError as error:
        sentry_sdk.capture_exception(error)
        if _http_error_status_code(error) == 429:
            _start_discourse_cooldown(error)
            if cached:
                return cached["data"]
            raise ServiceUnavailable(
                "Discourse is rate-limiting requests; please retry shortly."
            )
        if cached:
            return cached["data"]
        raise

    cache[key] = {"data": data, "ts": now}
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

    def get_topic(topic_id):
        return cached_fetch(
            topic_cache,
            topic_id,
            lambda: fetch_topic(topic_id),
            ttl=ttl,
        )

    api.get_topic = get_topic
    return topic_cache
