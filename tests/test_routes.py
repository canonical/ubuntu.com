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


class TestRoutes(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don"t record auth parameters
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

        self.assertEqual(self.client.get("/").status_code, 200)

    def test_mirrors(self):
        """
        When given the mirrors.json endpoint URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/mirrors.json").status_code, 200)

    def test_blog(self):
        """
        Check blog pages work.
        This checks that the blog module is correctly
        integrated.
        """

        self.assertEqual(self.client.get("/blog").status_code, 200)
        self.assertEqual(
            self.client.get("/blog/topics/design").status_code, 200
        )
        self.assertEqual(
            self.client.get("/blog/internet-of-things").status_code, 200
        )
        self.assertEqual(
            self.client.get("/blog/installing-ros-in-lxd").status_code, 200
        )

    def test_tutorials_homepage(self):
        """
        Check the tutorials homepage loads
        """

        self.assertEqual(self.client.get("/tutorials").status_code, 200)
        self.assertEqual(
            self.client.get("/tutorials?topic=cloud").status_code, 200
        )
        self.assertEqual(
            self.client.get(
                "/tutorials/create-a-usb-stick-on-windows"
            ).status_code,
            200,
        )

    def test_tutorials_search(self):
        """
        Check the tutorials search works
        """

        search_response = self.client.get("/tutorials?q=ubuntu")

        self.assertEqual(search_response.status_code, 200)
        self.assertIn(b"search results", search_response.data)

    def test_download(self):
        """
        Check download thank-you pages have ISOs in them
        """

        desktop_response = self.client.get(
            "/download/desktop/thank-you?version=20.04&architecture=amd64"
        )

        self.assertEqual(desktop_response.status_code, 200)

        self.assertIn(b"ubuntu-20.04-desktop-amd64.iso", desktop_response.data)

    def test_contribution(self):
        """
        Check contribution thank-you pages render
        """

        thank_you_response = self.client.get("/download/desktop/thank-you")

        self.assertEqual(thank_you_response.status_code, 200)

        self.assertIn(
            b"Thank you for your contribution", thank_you_response.data
        )

    def test_advantage(self):
        """
        When given the advantage URL,
        we should return a 200 status code

        When logged in, we should still get a 200 status code
        """

        self.assertEqual(self.client.get("/pro").status_code, 200)

    def test_ceph(self):
        """
        When given the ceph docs URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/ceph").status_code, 200)

    def test_ceph_docs(self):
        """
        When given the ceph docs URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/ceph/docs").status_code, 200)

    def test_not_found(self):
        """
        When given a non-existent URL,
        we should return a 404 status code
        """

        self.assertEqual(self.client.get("/not-found-url").status_code, 404)

    def test_engage_index(self):
        response = self.client.get("/engage")
        self.assertEqual(response.status_code, 200)

    def test_active_page_returns_200(self):
        response = self.client.get("/engage/micro-clouds")
        self.assertEqual(response.status_code, 200)

        soup = BeautifulSoup(response.data, "html.parser")
        self.assertIsNone(soup.find("meta", {"name": "robots"}))

    def test_security_certs_docs(self):
        """
        When given the Security certs docs URL,
        we should return a 200 status code
        """
        response = self.client.get("/security/certifications/docs")
        self.assertEqual(response.status_code, 200)
        soup = BeautifulSoup(response.data, "html.parser")
        self.assertIsNotNone(soup.find("meta", {"name": "description"}))

    def test_18_04_bubble(self):
        """
        When given the 18-04 page,
        we should return a 200 status code
        """
        response = self.client.get("/18-04")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/18-04/oci")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/18-04/aws")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/18-04/azure")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/18-04/gcp")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/18-04/ibm")
        self.assertEqual(response.status_code, 200)

    def test_get_country_code(self):
        """
        Test that the country code is extracted from the timezone
        """
        # Case 1: American timezone
        response = self.client.get("/user-country-tz.json?tz=America/Detroit")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json,
            {"country": "United States of America", "country_code": "US"},
        )

        # Case 2: European timezone
        response = self.client.get("/user-country-tz.json?tz=Europe/Vilnius")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json, {"country": "Lithuania", "country_code": "LT"}
        )

        # Case 3: African timezone
        response = self.client.get("/user-country-tz.json?tz=Africa/Bissau")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json, {"country": "Guinea-Bissau", "country_code": "GW"}
        )

        # Case 4: Asian timezone
        response = self.client.get("/user-country-tz.json?tz=Asia/Kolkata")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json, {"country": "India", "country_code": "IN"}
        )


if __name__ == "__main__":
    unittest.main()
