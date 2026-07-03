"""
Unit tests for webapp.discourse_cache (response cache + circuit breaker).
"""

import time
from unittest import TestCase

from requests import Response
from requests.exceptions import HTTPError
from werkzeug.exceptions import ServiceUnavailable

from webapp import discourse_cache


def _http_error(status_code, retry_after=None):
    response = Response()
    response.status_code = status_code
    if retry_after is not None:
        response.headers["Retry-After"] = str(retry_after)
    return HTTPError(response=response)


class TestCachedFetch(TestCase):
    def setUp(self):
        # The circuit breaker is module-level state shared with the live
        # views; reset it before and after every test so cases cannot leak
        # an open breaker into each other or into other test modules.
        discourse_cache._DISCOURSE_COOLDOWN["until"] = 0.0
        self.addCleanup(
            discourse_cache._DISCOURSE_COOLDOWN.__setitem__, "until", 0.0
        )

    def test_fresh_value_is_cached_within_ttl(self):
        calls = []

        def fetcher():
            calls.append(1)
            return "value"

        cache = {}
        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", fetcher, ttl=100),
            "value",
        )
        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", fetcher, ttl=100),
            "value",
        )
        self.assertEqual(len(calls), 1, "value should be served from cache")

    def test_expired_value_is_refetched(self):
        values = iter(["first", "second"])
        cache = {}

        discourse_cache.cached_fetch(cache, "k", lambda: next(values), ttl=0)
        self.assertEqual(
            discourse_cache.cached_fetch(
                cache, "k", lambda: next(values), ttl=0
            ),
            "second",
        )

    def test_max_size_evicts_oldest_entry(self):
        cache = {}
        for i in range(5):
            discourse_cache.cached_fetch(
                cache, f"k{i}", lambda i=i: i, ttl=100, max_size=3
            )
        self.assertEqual(len(cache), 3)
        self.assertNotIn("k0", cache, "oldest entry should have been evicted")
        self.assertNotIn("k1", cache)
        self.assertIn("k4", cache)

    def test_refreshed_entry_moves_to_tail(self):
        # k0 refreshed after k1, k2 are written → k1 should be evicted next.
        cache = {}
        for i in range(3):
            discourse_cache.cached_fetch(
                cache, f"k{i}", lambda i=i: i, ttl=100, max_size=3
            )
        # Re-fetch k0 (ttl=0 forces a refresh) → moves k0 to tail.
        discourse_cache.cached_fetch(
            cache, "k0", lambda: "k0-refreshed", ttl=0, max_size=3
        )
        # Add a 4th entry → oldest (k1) should be evicted, not k0.
        discourse_cache.cached_fetch(
            cache, "k3", lambda: 3, ttl=100, max_size=3
        )
        self.assertNotIn("k1", cache)
        self.assertIn("k0", cache)
        self.assertIn("k3", cache)

    def test_429_serves_stale_and_opens_breaker(self):
        cache = {}
        discourse_cache.cached_fetch(cache, "k", lambda: "stale", ttl=100)

        def rate_limited():
            raise _http_error(429)

        # ttl=0 forces a refresh attempt, which hits 429 and serves stale.
        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", rate_limited, ttl=0),
            "stale",
        )
        self.assertGreater(discourse_cache._DISCOURSE_COOLDOWN["until"], 0.0)

    def test_429_without_cache_raises_service_unavailable(self):
        def rate_limited():
            raise _http_error(429)

        with self.assertRaises(ServiceUnavailable):
            discourse_cache.cached_fetch({}, "k", rate_limited, ttl=0)

    def test_open_breaker_short_circuits_without_calling_fetcher(self):
        discourse_cache._DISCOURSE_COOLDOWN["until"] = float("inf")
        calls = []

        def fetcher():
            calls.append(1)
            return "value"

        with self.assertRaises(ServiceUnavailable):
            discourse_cache.cached_fetch({}, "k", fetcher, ttl=0)
        self.assertEqual(calls, [], "fetcher must not be called while cooling")

    def test_open_breaker_serves_stale_without_calling_fetcher(self):
        cache = {}
        discourse_cache.cached_fetch(cache, "k", lambda: "stale", ttl=100)
        discourse_cache._DISCOURSE_COOLDOWN["until"] = float("inf")
        calls = []

        def fetcher():
            calls.append(1)
            return "fresh"

        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", fetcher, ttl=0),
            "stale",
        )
        self.assertEqual(calls, [])

    def test_retry_after_header_sets_cooldown_length(self):
        def rate_limited():
            raise _http_error(429, retry_after=300)

        with self.assertRaises(ServiceUnavailable):
            discourse_cache.cached_fetch({}, "k", rate_limited, ttl=0)

        remaining = discourse_cache._DISCOURSE_COOLDOWN["until"] - time.time()
        # Retry-After of 300s should be honoured (within the allowed bounds).
        self.assertGreater(remaining, 200)

    def test_non_429_http_error_serves_stale_when_available(self):
        cache = {}
        discourse_cache.cached_fetch(cache, "k", lambda: "stale", ttl=100)

        def server_error():
            raise _http_error(500)

        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", server_error, ttl=0),
            "stale",
        )
        # A 500 must NOT open the circuit breaker.
        self.assertEqual(discourse_cache._DISCOURSE_COOLDOWN["until"], 0.0)

    def test_non_429_http_error_without_cache_reraises(self):
        def server_error():
            raise _http_error(500)

        with self.assertRaises(HTTPError):
            discourse_cache.cached_fetch({}, "k", server_error, ttl=0)

    def test_connection_error_serves_stale_when_available(self):
        from requests.exceptions import (
            ConnectionError as RequestsConnectionError,
        )

        cache = {}
        discourse_cache.cached_fetch(cache, "k", lambda: "stale", ttl=100)

        def connection_error():
            raise RequestsConnectionError("connection refused")

        self.assertEqual(
            discourse_cache.cached_fetch(cache, "k", connection_error, ttl=0),
            "stale",
        )
        # Connection errors must NOT open the circuit breaker.
        self.assertEqual(discourse_cache._DISCOURSE_COOLDOWN["until"], 0.0)

    def test_connection_error_without_cache_raises_service_unavailable(self):
        from requests.exceptions import Timeout

        def timed_out():
            raise Timeout("read timeout")

        with self.assertRaises(ServiceUnavailable):
            discourse_cache.cached_fetch({}, "k", timed_out, ttl=0)


class _FakeAPI:
    def __init__(self, error=None):
        self.calls = 0
        self.error = error

    def get_topic(self, topic_id):
        self.calls += 1
        if self.error is not None:
            raise self.error
        return {"id": topic_id}

    def check_for_topic_updates(self, topic_id, last_updated=None):
        return False, None


class TestInstallTopicCache(TestCase):
    def setUp(self):
        discourse_cache._DISCOURSE_COOLDOWN["until"] = 0.0
        self.addCleanup(
            discourse_cache._DISCOURSE_COOLDOWN.__setitem__, "until", 0.0
        )

    def test_wrapped_get_topic_caches_per_topic_id(self):
        api = _FakeAPI()
        discourse_cache.install_topic_cache(api, ttl=100)

        self.assertEqual(api.get_topic(5), {"id": 5})
        self.assertEqual(api.get_topic(5), {"id": 5})
        self.assertEqual(api.calls, 1, "second call should hit the cache")

        # A different topic id is a distinct cache entry.
        self.assertEqual(api.get_topic(6), {"id": 6})
        self.assertEqual(api.calls, 2)

    def test_wrapped_get_topic_opens_breaker_on_429(self):
        api = _FakeAPI(error=_http_error(429))
        discourse_cache.install_topic_cache(api, ttl=0)

        with self.assertRaises(ServiceUnavailable):
            api.get_topic(1)
        self.assertGreater(discourse_cache._DISCOURSE_COOLDOWN["until"], 0.0)

    def test_wrapped_get_topic_reraises_non_429(self):
        api = _FakeAPI(error=_http_error(404))
        discourse_cache.install_topic_cache(api, ttl=0)

        with self.assertRaises(HTTPError):
            api.get_topic(1)


class TestServiceUnavailableRendering(TestCase):
    """The open breaker should return the app's styled error page, not the
    bare werkzeug 503, and must not leak the internal reason to users."""

    def setUp(self):
        from webapp.app import app

        app.testing = True
        self.client = app.test_client()
        discourse_cache._DISCOURSE_COOLDOWN["until"] = float("inf")
        self.addCleanup(
            discourse_cache._DISCOURSE_COOLDOWN.__setitem__, "until", 0.0
        )

    def test_open_breaker_renders_styled_503(self):
        # A unique page slug guarantees an empty per-view cache regardless of
        # what other tests ran first, so the open breaker deterministically
        # raises ServiceUnavailable instead of serving a cached response.
        response = self.client.get("/engage/__breaker-test-503__")

        self.assertEqual(response.status_code, 503)
        body = response.get_data(as_text=True)
        self.assertIn("Server error", body)
        self.assertNotIn("Discourse is rate-limiting", body)
