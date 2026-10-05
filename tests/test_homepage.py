# Standard library
import os
import re
import unittest

# Packages
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


BASE_INDEX = os.path.join(
    os.path.dirname(__file__), "..", "templates", "base_index.html"
)

EXPECTED_ORDER = [
    "latest",
    "performance",
    "hardware",
    "pro",
    "open-source",
    "containers",
    "stories",
    "community",
    "closer",
]


class TestHomepageTemplate(unittest.TestCase):
    def test_sections_follow_framer_order(self):
        """
        The homepage includes one partial per section,
        in the order of the redesign
        """

        with open(BASE_INDEX) as template:
            found = re.findall(
                r'{%\s*include\s+"home/_([a-z-]+)\.html"\s*%}',
                template.read(),
            )

        self.assertEqual(found, EXPECTED_ORDER)


class TestHomepageRender(VCRTestCase):
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
        return super().setUp()

    def test_renders_redesign_shell(self):
        """
        The homepage loads the redesign bundle, keeps the takeovers,
        notices and latest news, and drops the old sections
        """

        response = self.client.get("/")
        html = response.get_data(as_text=True)

        self.assertEqual(response.status_code, 200)
        for expected in [
            "js/dist/homepage.js",
            'id="takeover"',
            'id="test-takeover"',
            'data-js="latest-news"',
            "The Standard Support period for Ubuntu 20.04 LTS has ended",
        ]:
            self.assertTrue(expected in html, f"Missing: {expected}")
        for removed in [
            "Energize your engineers",
            "Carrier–grade private cloud",
        ]:
            self.assertFalse(removed in html, f"Still present: {removed}")


if __name__ == "__main__":
    unittest.main()
