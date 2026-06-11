# Standard library
import os
import unittest
from unittest.mock import patch

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestRoutes(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don"t record auth parameters

        IMPORTANT: If there are changes to the APIs called in these tests,
        they need to be re-recorded in cassettes. See HACKING.md for
        instructions on how to update cassettes.
        """
        return {
            "record_mode": os.environ.get("VCR_RECORD_MODE", "none"),
            "filter_headers": [
                "Authorization",
                "Cookie",
                "Api-Key",
                "X-Discourse-Username",
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

    @patch.dict(os.environ, {"SEARCH_API_KEY": "fake-key"})
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

    def test_staging_no_robots_header(self):
        """Test that staging does not return a X-Robots-Tag header"""
        os.environ["FLASK_ENV"] = "staging"
        response = self.client.get("/robots.txt")
        self.assertTrue(response.headers["X-Robots-Tag"] == "none")

    def test_production_robots_header(self):
        """Test only production returns X-Robots-Tag header"""
        os.environ["FLASK_ENV"] = "production"
        response = self.client.get("/robots.txt")
        self.assertTrue(response.headers.get("X-Robots-Tag") != "none")

    def test_wsl_install_redirect(self):
        """
        Check WSL install redirect endpoint returns 302 redirect
        to the GitHub release URL
        """
        response = self.client.get("/wsl/install")
        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response.location.startswith(
                "https://github.com/canonical/ubuntu-pro-for-wsl/releases/"
            )
        )

    def test_release_notes_redirect_no_version(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        generic documentation releases notes URL
        """
        response = self.client.get("/getubuntu/releasenotes?os=ubuntu")
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/",
            response.location,
        )

    def test_release_notes_redirect_invalid_version(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        generic documentation releases notes URL
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=00.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/",
            response.location,
        )

    def test_release_notes_redirect_focal(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        wiki release URL for 20.04
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=20.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://wiki.ubuntu.com/FocalFossa/ReleaseNotes",
            response.location,
        )

    def test_release_notes_redirect_lacking_version_information(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        generic documentation release URL
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=24.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/",
            response.location,
        )

    def test_release_notes_missing_values(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        generic documentation release URL
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=99.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/",
            response.location,
        )

    def test_release_notes_missing_values_works_for_valid_ones(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        wiki release URL for 24.04 if the data is invalid for other versions
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=26.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/26.04/",
            response.location,
        )

    def test_release_notes_redirect_jammy(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        documentation release URL for 22.04
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=22.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/22.04/",
            response.location,
        )

    def test_release_notes_redirect_mantic(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        wiki release URL for 23.10
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=23.10"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://wiki.ubuntu.com/ManticMinotaur/ReleaseNotes",
            response.location,
        )

    def test_release_notes_redirect_noble(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        wiki release URL for 24.04
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=24.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/24.04/",
            response.location,
        )

    def test_format_md_returns_markdown_content_type(self):
        """
        When ?format=md is set on an HTML page,
        the response should have text/markdown content type
        """
        response = self.client.get("/?format=md")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/markdown", response.content_type)

    def test_format_md_body_is_not_html(self):
        """
        When ?format=md is set on an HTML page,
        the response body should not contain typical HTML tags
        """
        response = self.client.get("/?format=md")
        self.assertEqual(response.status_code, 200)
        data = response.get_data(as_text=True)
        self.assertNotIn("<!doctype html>", data.lower())
        self.assertNotIn("<html", data.lower())

    def test_normal_request_returns_html(self):
        """
        A normal request without ?format=md should return text/html
        """
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.content_type)

    def test_format_md_does_not_transform_json(self):
        """
        JSON endpoints should not be transformed by ?format=md
        """
        response = self.client.get("/mirrors.json?format=md")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("text/markdown", response.content_type)

    def test_format_md_does_not_transform_redirects(self):
        """
        Redirect responses should not be transformed by ?format=md
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&format=md"
        )
        self.assertEqual(response.status_code, 302)
        self.assertNotIn("text/markdown", response.content_type)

    def test_format_md_does_not_transform_404(self):
        """
        404 responses should not be transformed by ?format=md
        """
        response = self.client.get("/not-found-url?format=md")
        self.assertEqual(response.status_code, 404)
        self.assertNotIn("text/markdown", response.content_type)

    def test_release_notes_redirect_resolute(self):
        """
        Check that release notes redirect endpoint returns 302 redirect to the
        wiki release URL for 26.04
        """
        response = self.client.get(
            "/getubuntu/releasenotes?os=ubuntu&ver=26.04"
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(
            "https://documentation.ubuntu.com/release-notes/26.04/",
            response.location,
        )


if __name__ == "__main__":
    unittest.main()
