# Standard library
import os
import unittest

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


TAKEOVER_SCRIPT_IDS = [
    "takeover",
    "takeover-animation",
    "takeover-title",
    "takeover-subtitle",
    "takeover-image",
    "takeover-primary-url",
    "takeover-secondary-url",
    "test-takeover",
    "test-takeover-animation",
    "test-takeover-title",
    "test-takeover-subtitle",
    "test-takeover-image",
    "test-takeover-primary-url",
]


class TestHomepageLatest(VCRTestCase):
    def _get_cassette_name(self):
        return "TestRoutes.test_homepage.yaml"

    def _get_vcr_kwargs(self):
        return {
            "record_mode": os.environ.get("VCR_RECORD_MODE", "none"),
            "filter_headers": [
                "Authorization",
                "Cookie",
                "Api-Key",
                "X-Discourse-Username",
                "Api-Username",
            ],
            "filter_query_parameters": ["key", "api_key", "api_username"],
        }

    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        response = self.client.get("/")
        self.html = response.get_data(as_text=True)
        self.soup = BeautifulSoup(self.html, "lxml")
        return super().setUp()

    def test_takeover_renders_as_latest_block(self):
        takeover = self.soup.find(id="takeover")
        self.assertIn("p-latest-block", takeover["class"])
        chip = takeover.select_one(".p-chip")
        self.assertEqual(chip.get_text(strip=True), "Latest")
        self.assertEqual(self.soup.find(id="takeover-title").name, "h1")
        self.assertIn(
            "p-button", self.soup.find(id="takeover-primary-url")["class"]
        )

        secondary = self.soup.find(id="takeover-secondary-url")
        self.assertIn("p-cta-text", secondary["class"])
        self.assertIsNotNone(secondary.select_one("i.p-icon--arrow-right"))
        self.assertTrue(secondary.span.get_text(strip=True))

    def test_takeover_script_hooks_exist_once(self):
        for element_id in TAKEOVER_SCRIPT_IDS:
            self.assertEqual(
                len(self.soup.find_all(id=element_id)), 1, element_id
            )
        self.assertTrue(self.soup.find(id="test-takeover").has_attr("hidden"))

    def test_latest_block_comes_before_the_sections(self):
        self.assertLess(
            self.html.index('id="takeover"'),
            self.html.index("Go further and faster with certified hardware"),
        )


if __name__ == "__main__":
    unittest.main()
