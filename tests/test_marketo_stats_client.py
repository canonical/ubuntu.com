import contextlib
import io
import unittest
import urllib.error
from datetime import datetime, timezone
from unittest import mock

from webapp.marketo_stats import client as client_module
from webapp.marketo_stats.client import (
    MarketoActivityClient,
    MarketoError,
)


class FakeMarketo:
    """Stands in for the Marketo HTTP API. Records every URL requested."""

    def __init__(self, pages, token_response=None):
        self.pages = list(pages)
        self.urls = []
        self.token_response = token_response or {
            "access_token": "tok",
            "expires_in": 3600,
        }

    def __call__(self, url):
        self.urls.append(url)
        if "/identity/oauth/token" in url:
            return self.token_response
        if "pagingtoken" in url:
            return {"nextPageToken": "PAGE0"}
        if self.pages:
            return self.pages.pop(0)
        return {"result": [], "moreResult": False, "success": True}


def activity(date="2026-08-05T10:00:00Z", form_id=4198):
    return {
        "activityDate": date,
        "primaryAttributeValueId": form_id,
        "attributes": [],
    }


class TestMarketoActivityClient(unittest.TestCase):
    def build(self, pages, **kwargs):
        self.slept = []
        fake = FakeMarketo(pages)
        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fake,
            sleeper=self.slept.append,
            **kwargs,
        )
        return client, fake

    def window(self):
        return (
            datetime(2026, 8, 1, tzinfo=timezone.utc),
            datetime(2026, 8, 31, tzinfo=timezone.utc),
        )

    def test_walks_every_page_until_more_result_is_false(self):
        client, _ = self.build(
            [
                {
                    "result": [activity(), activity()],
                    "moreResult": True,
                    "nextPageToken": "PAGE1",
                    "success": True,
                },
                {
                    "result": [activity()],
                    "moreResult": False,
                    "success": True,
                },
            ]
        )
        since, until = self.window()
        self.assertEqual(len(list(client.iter_activities(since, until))), 3)
        self.assertFalse(client.hit_page_cap)

    def test_sleeps_between_pages(self):
        # Sleep and fetch are independent injected callables with no
        # shared timeline of their own, so recording their call counts
        # separately can't prove ordering -- a regression that moved the
        # sleep to fire once *after* all pages are fetched would still
        # produce the same counts and pass. Log both into one shared,
        # ordered list instead, tagged by kind, and assert the sleep
        # entry falls strictly between the two fetch entries.
        log = []
        base_fetch = FakeMarketo(
            [
                {
                    "result": [activity()],
                    "moreResult": True,
                    "nextPageToken": "PAGE1",
                    "success": True,
                },
                {
                    "result": [activity()],
                    "moreResult": False,
                    "success": True,
                },
            ]
        )

        def fetch(url):
            payload = base_fetch(url)
            if "/rest/v1/activities.json" in url:
                log.append("fetch")
            return payload

        def sleeper(seconds):
            self.assertEqual(seconds, 0.5)
            log.append("sleep")

        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fetch,
            sleeper=sleeper,
            sleep_seconds=0.5,
        )
        since, until = self.window()
        list(client.iter_activities(since, until))
        self.assertEqual(log, ["fetch", "sleep", "fetch"])

    def test_stops_at_max_pages_and_flags_truncation(self):
        endless = [
            {
                "result": [activity()],
                "moreResult": True,
                "nextPageToken": "NEXT",
                "success": True,
            }
            for _ in range(10)
        ]
        client, _ = self.build(endless)
        since, until = self.window()
        rows = list(client.iter_activities(since, until, max_pages=3))
        self.assertEqual(len(rows), 3)
        self.assertTrue(client.hit_page_cap)
        self.assertEqual(client.pages_fetched, 3)

    def test_stops_once_activities_pass_the_until_bound(self):
        client, fake = self.build(
            [
                {
                    "result": [
                        activity(date="2026-08-05T10:00:00Z"),
                        activity(date="2026-09-05T10:00:00Z"),
                    ],
                    "moreResult": True,
                    "nextPageToken": "PAGE1",
                    "success": True,
                }
            ]
        )
        since, until = self.window()
        rows = list(client.iter_activities(since, until))
        self.assertEqual(len(rows), 1)
        # Filtering alone doesn't prove pagination actually halted: if
        # the implementation used `continue` instead of `return` on the
        # out-of-window record (skip it but keep paginating), this would
        # still yield 1 row, because the fake returns an empty,
        # moreResult=False page once its page list is exhausted. Assert
        # on the call count itself -- the safety-critical behaviour --
        # so a regression that keeps paginating past the bound is
        # actually caught.
        activity_calls = [
            url for url in fake.urls if "/rest/v1/activities.json" in url
        ]
        self.assertEqual(len(activity_calls), 1)
        self.assertEqual(client.pages_fetched, 1)

    def test_requests_only_the_given_activity_type(self):
        client, fake = self.build(
            [{"result": [], "moreResult": False, "success": True}]
        )
        since, until = self.window()
        list(client.iter_activities(since, until, activity_type_id=2))
        self.assertTrue(any("activityTypeIds=2" in url for url in fake.urls))

    def test_raises_on_api_reported_errors(self):
        client, _ = self.build(
            [
                {
                    "success": False,
                    "errors": [{"code": "603", "message": "Access denied"}],
                }
            ]
        )
        since, until = self.window()
        with self.assertRaises(MarketoError) as caught:
            list(client.iter_activities(since, until))
        self.assertIn("603", str(caught.exception))

    def test_raises_on_missing_activity_date(self):
        client, _ = self.build(
            [
                {
                    "result": [
                        {
                            "primaryAttributeValueId": 4198,
                            "attributes": [],
                        }
                    ],
                    "moreResult": False,
                    "success": True,
                }
            ]
        )
        since, until = self.window()
        with self.assertRaises(MarketoError):
            list(client.iter_activities(since, until))

    def test_raises_when_more_results_but_no_paging_token(self):
        # Carrying the old token forward would re-fetch the same page up
        # to max_pages times and multiply every activity on it. An
        # overcount nobody notices is worse than a loud stop.
        client, fake = self.build(
            [
                {
                    "result": [activity()],
                    "moreResult": True,
                    "success": True,
                }
            ]
        )
        since, until = self.window()
        with self.assertRaises(MarketoError) as caught:
            list(client.iter_activities(since, until))
        self.assertIn("nextPageToken", str(caught.exception))
        activity_calls = [
            url for url in fake.urls if "/rest/v1/activities.json" in url
        ]
        self.assertEqual(len(activity_calls), 1)

    def test_raises_when_authentication_returns_no_token(self):
        fake = FakeMarketo([], token_response={"error": "unauthorized"})
        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fake,
            sleeper=lambda _: None,
        )
        since, until = self.window()
        with self.assertRaises(MarketoError):
            list(client.iter_activities(since, until))


class TestTokenExpiryRetry(unittest.TestCase):
    """A shared token can expire mid-walk regardless of page count --

    Marketo returns 601/602 for an invalid/expired token, and the
    remaining lifetime on a shared token can be minutes, not a fresh
    hour. Abandoning the whole walk (and the quota already spent on it)
    on the first expiry is what actually happened in production. The
    fix mirrors webapp/marketo.py's existing retry-once pattern: on
    601/602, re-authenticate and retry the same request exactly once.
    """

    def window(self):
        return (
            datetime(2026, 8, 1, tzinfo=timezone.utc),
            datetime(2026, 8, 31, tzinfo=timezone.utc),
        )

    def test_retries_once_after_token_expiry_then_succeeds(self):
        token_calls = []
        activities_calls = []

        def fetch(url):
            if "/identity/oauth/token" in url:
                token_calls.append(url)
                return {
                    "access_token": f"tok{len(token_calls)}",
                    "expires_in": 3600,
                }
            if "pagingtoken" in url:
                return {"nextPageToken": "PAGE0"}
            activities_calls.append(url)
            if len(activities_calls) == 1:
                return {
                    "success": False,
                    "errors": [
                        {"code": "601", "message": "Access token invalid"}
                    ],
                }
            return {
                "result": [activity()],
                "moreResult": False,
                "success": True,
            }

        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fetch,
            sleeper=lambda _: None,
        )
        since, until = self.window()
        rows = list(client.iter_activities(since, until))

        self.assertEqual(len(rows), 1)
        # Re-authenticated once: the initial auth plus one retry auth.
        self.assertEqual(len(token_calls), 2)
        # The retried request is not a second page.
        self.assertEqual(client.pages_fetched, 1)
        self.assertFalse(client.hit_page_cap)

    def test_raises_after_two_consecutive_token_errors(self):
        token_calls = []
        activities_calls = []

        def fetch(url):
            if "/identity/oauth/token" in url:
                token_calls.append(url)
                return {"access_token": "tok", "expires_in": 3600}
            if "pagingtoken" in url:
                return {"nextPageToken": "PAGE0"}
            activities_calls.append(url)
            return {
                "success": False,
                "errors": [{"code": "601", "message": "Access token invalid"}],
            }

        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fetch,
            sleeper=lambda _: None,
        )
        since, until = self.window()
        with self.assertRaises(MarketoError) as caught:
            list(client.iter_activities(since, until))
        self.assertIn("601", str(caught.exception))
        # Pins "retries at most once": the original attempt plus
        # exactly one retry, not a bounded loop that keeps trying a
        # few times before giving up. A regression that widened the
        # single retry into e.g. a 3-iteration loop would still raise
        # MarketoError mentioning "601" but would fail these counts.
        self.assertEqual(len(activities_calls), 2)
        # One re-authentication for the one retry, on top of the
        # initial auth before the walk started.
        self.assertEqual(len(token_calls), 2)

    def test_sleeps_before_reauthenticating_after_token_expiry(self):
        # The retry itself must not burst against the shared quota:
        # sleep the same inter-page pause before re-authenticating,
        # not fire the failed request, the re-auth, and the retry
        # back-to-back. Log calls into one shared, ordered list (as in
        # test_sleeps_between_pages) so the ordering -- not just the
        # count -- is proven.
        log = []

        def fetch(url):
            if "/identity/oauth/token" in url:
                log.append("auth")
                return {"access_token": "tok", "expires_in": 3600}
            if "pagingtoken" in url:
                return {"nextPageToken": "PAGE0"}
            log.append("fetch")
            if log.count("fetch") == 1:
                return {
                    "success": False,
                    "errors": [
                        {"code": "601", "message": "Access token invalid"}
                    ],
                }
            return {"result": [], "moreResult": False, "success": True}

        def sleeper(seconds):
            self.assertEqual(seconds, 0.5)
            log.append("sleep")

        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fetch,
            sleeper=sleeper,
            sleep_seconds=0.5,
        )
        since, until = self.window()
        list(client.iter_activities(since, until))
        # initial auth -> failed page fetch -> paced pause -> re-auth
        # -> retried fetch (succeeds).
        self.assertEqual(log, ["auth", "fetch", "sleep", "auth", "fetch"])

    def test_retries_paging_token_request_after_token_expiry(self):
        token_calls = []
        paging_calls = []

        def fetch(url):
            if "/identity/oauth/token" in url:
                token_calls.append(url)
                return {
                    "access_token": f"tok{len(token_calls)}",
                    "expires_in": 3600,
                }
            if "pagingtoken" in url:
                paging_calls.append(url)
                if len(paging_calls) == 1:
                    return {
                        "success": False,
                        "errors": [
                            {
                                "code": "602",
                                "message": "Access token expired",
                            }
                        ],
                    }
                return {"nextPageToken": "PAGE0"}
            return {"result": [], "moreResult": False, "success": True}

        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fetch,
            sleeper=lambda _: None,
        )
        since, until = self.window()
        rows = list(client.iter_activities(since, until))

        self.assertEqual(rows, [])
        self.assertEqual(len(token_calls), 2)
        self.assertEqual(len(paging_calls), 2)


class TestDefaultFetchErrorHandling(unittest.TestCase):
    """The real fetch path, which the FakeMarketo tests never exercise.

    A transient 5xx on page 40 of 50 used to abort with a raw traceback
    and discard 40 pages of already-spent quota. It also means the
    authentication test above is optimistic: a bad client secret really
    returns HTTP 401, so urlopen raises before any payload is inspected.
    """

    def fetch_with(self, error):
        @contextlib.contextmanager
        def fake_urlopen(url, timeout=None):
            raise error
            yield  # pragma: no cover

        with mock.patch("urllib.request.urlopen", fake_urlopen):
            return client_module._http_get_json(
                "https://example.mktorest.com/rest/v1/activities.json"
            )

    def test_http_error_becomes_a_marketo_error(self):
        error = urllib.error.HTTPError(
            "https://example.mktorest.com/identity/oauth/token",
            401,
            "Unauthorized",
            {},
            None,
        )
        with self.assertRaises(MarketoError) as caught:
            self.fetch_with(error)
        self.assertIn("401", str(caught.exception))

    def test_url_error_becomes_a_marketo_error(self):
        with self.assertRaises(MarketoError) as caught:
            self.fetch_with(urllib.error.URLError("name resolution failed"))
        self.assertIn("could not reach Marketo", str(caught.exception))

    def test_a_non_json_body_becomes_a_marketo_error(self):
        @contextlib.contextmanager
        def fake_urlopen(url, timeout=None):
            yield io.BytesIO(b"<html>502 Bad Gateway</html>")

        with mock.patch("urllib.request.urlopen", fake_urlopen):
            with self.assertRaises(MarketoError) as caught:
                client_module._http_get_json(
                    "https://example.mktorest.com/rest/v1/activities.json"
                )
        self.assertIn("not JSON", str(caught.exception))

    def test_the_failure_message_never_leaks_the_credentials(self):
        secret_url = (
            "https://example.mktorest.com/identity/oauth/token"
            "?client_secret=s3cr3t&access_token=t0ken"
        )
        error = urllib.error.HTTPError(
            secret_url, 500, "Server Error", {}, None
        )
        with self.assertRaises(MarketoError) as caught:
            self.fetch_with(error)
        self.assertNotIn("s3cr3t", str(caught.exception))
        self.assertNotIn("t0ken", str(caught.exception))


if __name__ == "__main__":
    unittest.main()
