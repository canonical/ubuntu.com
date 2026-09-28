# Standard library
import unittest

# Packages
from vcr.request import Request

# Local
from tests.playwright.cassette import data_explorer_only, scrub_response

DATA_EXPLORER_URI = (
    "https://discourse.ubuntu.com/admin/plugins/explorer/queries/16/run"
)


class TestPlaywrightCassette(unittest.TestCase):
    def test_only_data_explorer_requests_use_the_cassette(self):
        explorer = Request("POST", DATA_EXPLORER_URI, None, {})
        public_topic = Request(
            "GET",
            "https://discourse.ubuntu.com/t/some-topic/123.json",
            None,
            {},
        )
        other_host = Request(
            "POST", "https://example.com/admin/plugins/explorer/x", None, {}
        )
        self.assertIs(data_explorer_only(explorer), explorer)
        self.assertIsNone(data_explorer_only(public_topic))
        self.assertIsNone(data_explorer_only(other_host))

    def test_scrub_response_drops_identifying_headers(self):
        response = {
            "status": {"code": 200},
            "headers": {
                "Set-Cookie": ["_t=abc"],
                "X-Discourse-Username": ["bot"],
                "Content-Type": ["application/json"],
            },
        }
        self.assertEqual(
            scrub_response(response)["headers"],
            {"Content-Type": ["application/json"]},
        )

    def test_scrub_response_skips_transient_failures(self):
        for code in (429, 500, 503):
            response = {"status": {"code": code}, "headers": {}}
            self.assertIsNone(scrub_response(response))
        not_found = {"status": {"code": 404}, "headers": {}}
        self.assertIs(scrub_response(not_found), not_found)
