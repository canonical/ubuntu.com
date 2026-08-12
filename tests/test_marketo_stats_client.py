import unittest
from datetime import datetime, timezone

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


if __name__ == "__main__":
    unittest.main()
