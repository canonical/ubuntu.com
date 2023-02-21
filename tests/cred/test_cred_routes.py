# Standard library
import unittest
import logging

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


# Suppress talisker warnings, that get annoying
logging.getLogger("talisker.context").disabled = True


class TestCredRoutes(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don't record auth parameters
        """
        return {
            "filter_headers": [
                "Authorization",
                "Cookie",
                "Api-Key",
                "Api-Username",
            ],
            "filter_query_parameters": ["key"],
        }

    def setUp(self):
        """
        Set up Flask app for testing
        """

        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_homepage(self):
        """
        When given the index URL,
        we should return a 200 status code
        """
        self.assertEqual(self.client.get("/credentials").status_code, 200)


if __name__ == "__main__":
    unittest.main()
