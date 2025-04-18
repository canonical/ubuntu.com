# Packages
import unittest
import logging
import re
import xml.etree.ElementTree as ET
from webapp.app import app

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
        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/xml"
        assert "<urlset" in response.data.decode("utf-8")

    def test_sitemap_parser(self):
        """
        Check that the sitemap parser endpoint returns a valid JSON response
        """

        response = self.client.get("/sitemap_parser")
        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/json"

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

            assert "name" in data
            assert "last_modified" in data
            if "sitemap_exclude" not in data:
                urls[data["name"]] = data["last_modified"]

            if "children" in data:
                for child in data["children"]:
                    extract_urls(child, urls)
            return urls

        xml_response = self.client.get("/sitemap_tree.xml")
        assert xml_response.status_code == 200
        root = ET.fromstring(xml_response.data.decode("utf-8"))

        xml_urls = set()
        for node in root:
            url = node[0].text
            path = re.sub(r"https://ubuntu.com", "", url)
            xml_urls.add(path)
        assert len(xml_urls) > 0, "No URLs found in sitemap_tree.xml"

        parser_response = self.client.get("/sitemap_parser")
        assert parser_response.status_code == 200

        parser_data = parser_response.get_json()["children"]
        parser_urls = {}
        for site in parser_data:
            parser_urls = extract_urls(site, parser_urls)

        assert len(parser_urls) > 0, "No URLs found in sitemap_parser"
        assert len(parser_urls) == len(
            xml_urls
        ), "Number of URLs in sitemap_tree.xml and sitemap_parser do not match"

        for url in parser_urls:
            assert url in xml_urls, f"URL {url} not found in sitemap_tree.xml"


if __name__ == "__main__":
    unittest.main()
