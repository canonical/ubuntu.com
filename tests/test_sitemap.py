import unittest
import re
import os
import logging
from unittest.mock import patch
import xml.etree.ElementTree as ET
from webapp.app import app
from webapp.views import build_sitemap_tree

logging.getLogger("talisker.context").disabled = True


class TestSitemap(unittest.TestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """

        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_sitemap(self):
        """
        Check that the sitemap tree endpoint returns a valid XML response
        """

        response = self.client.get("/sitemap_tree.xml")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/xml")
        self.assertIn("<urlset", response.data.decode("utf-8"))

    def test_sitemap_parser(self):
        """
        Check that the sitemap parser endpoint returns a valid JSON response
        """

        response = self.client.get("/sitemap_parser")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")

    def test_sitemap_sites(self):
        """
        Check that sites in sitemap tree are the same as in the sitemap parser
        """

        def extract_urls(data, urls=None):
            """
            Extract URLs from the sitemap parser data
            """
            if urls is None:
                urls = {}

            self.assertIn("name", data)
            self.assertIn("last_modified", data)
            if "sitemap_exclude" not in data:
                urls[data["name"]] = data["last_modified"]

            if "children" in data:
                for child in data["children"]:
                    extract_urls(child, urls)
            return urls

        xml_response = self.client.get("/sitemap_tree.xml")
        self.assertEqual(xml_response.status_code, 200)
        root = ET.fromstring(xml_response.data.decode("utf-8"))

        xml_urls = set()
        for node in root:
            url = node[0].text
            path = re.sub(r"https://ubuntu.com", "", url)
            xml_urls.add(path)

        self.assertGreater(
            len(xml_urls), 0, "No URLs found in sitemap_tree.xml"
        )

        parser_response = self.client.get("/sitemap_parser")
        self.assertEqual(parser_response.status_code, 200)

        parser_data = parser_response.get_json()
        parser_urls = extract_urls(parser_data)

        self.assertGreater(
            len(parser_urls), 0, "No URLs found in sitemap_parser"
        )
        self.assertEqual(
            len(parser_urls),
            len(xml_urls),
            (
                "Number of URLs in sitemap_tree.xml and "
                "sitemap_parser do not match"
            ),
        )

        for url in parser_urls:
            self.assertIn(
                url, xml_urls, f"URL {url} not found in sitemap_tree.xml"
            )

    def test_sitemap_post_unauthorized(self):
        """
        Check that unauthorized access to the sitemap post endpoint returns 401
        """
        response = self.client.post(
            "/sitemap_tree.xml",
            headers={"Authorization": "Bearer unauthorized-secret"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn(b"Unauthorized", response.data)

    def test_sitemap_post_authorized(self):
        """
        Check that authorized access to the sitemap post endpoint returns 200
        """
        os.environ["SITEMAP_SECRET"] = "test-secret"
        response = self.client.post(
            "/sitemap_tree.xml",
            headers={"Authorization": "Bearer test-secret"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Sitemap successfully generated", response.data)

    @patch("webapp.views.generate_sitemap", return_value="")
    @patch("builtins.open")
    @patch("os.getcwd", return_value="/invalid/path")
    def test_create_sitemap_empty(self, mock_getcwd, mock_open, mock_generate):
        """
        Test create_sitemap returns error for empty xml_sitemap
        """
        create_sitemap = build_sitemap_tree().__closure__[0].cell_contents
        result = create_sitemap("/invalid/path/sitemap_tree.xml")
        self.assertEqual(result, ({"error:", "Sitemap is empty"}, 400))

    @patch("webapp.views.generate_sitemap", side_effect=Exception("fail"))
    @patch("builtins.open")
    @patch("os.getcwd", return_value="/invalid/path")
    def test_create_sitemap_exception(
        self, mock_getcwd, mock_open, mock_generate
    ):
        """
        Test create_sitemap returns error for Exception in generate_sitemap
        """
        create_sitemap = build_sitemap_tree().__closure__[0].cell_contents
        result = create_sitemap("/invalid/path/sitemap_tree.xml")
        self.assertIn("Generate_sitemap error", result[0])
        self.assertEqual(result[1], 500)


if __name__ == "__main__":
    unittest.main()
