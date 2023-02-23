# Standard library
import unittest
import logging

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from tests.shop.advantage.helpers import (
    Response,
    Session,
    make_client,
    get_fixture,
)
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper
from webapp.app import app


# Suppress talisker warnings, that get annoying
logging.getLogger("talisker.context").disabled = True


class TestCredRoutes(VCRTestCase):
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

    def test_your_exams(self):
        """
        When given the your-exams page URL,
        we should get a 302 status as the route exists but a user must be
        logged in to access it
        """
        self.assertEqual(
            self.client.get("/credentials/your-exams").status_code, 302
        )

    def test_syllabus(self):
        """
        When given the syllabus URL,
        we should return a 200 status code
        """
        self.assertEqual(
            self.client.get("/credentials/syllabus").status_code, 200
        )

    def test_self_study(self):
        """
        When given the self study URL,
        we should return a 200 status code
        """
        self.assertEqual(
            self.client.get("/credentials/self-study").status_code, 200
        )


if __name__ == "__main__":
    unittest.main()
