# Standard library
import os
import unittest

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app

TITLES = [
    "Developers",
    "DevOps engineers",
    "Data analysts and AI engineers",
    "System administrators",
    "Site reliability engineers",
    "CTOs, CIOs and CISOs",
]


class TestHomepageOpenSource(VCRTestCase):
    def _get_cassette_name(self):
        return "TestRoutes.test_homepage.yaml"

    def _get_vcr_kwargs(self):
        return {
            "record_mode": os.environ.get("VCR_RECORD_MODE", "none"),
            "filter_query_parameters": ["key", "api_key", "api_username"],
        }

    def setUp(self):
        super().setUp()
        app.testing = True
        response = app.test_client().get("/")
        self.soup = BeautifulSoup(response.get_data(as_text=True), "lxml")
        self.slides = self.soup.select(".p-open-source__slide")

    def test_renders_six_slides_with_first_active(self):
        titles = [s.select_one("h3").get_text(strip=True) for s in self.slides]
        self.assertEqual(titles, TITLES)
        active = [s for s in self.slides if "is-active" in s["class"]]
        self.assertEqual(active, self.slides[:1])

    def test_titles_link_to_their_slides(self):
        for slide in self.slides:
            link = slide.select_one("a.p-open-source__title")
            self.assertEqual(link["href"], "#" + slide["id"])

    def test_images_go_through_image_template(self):
        images = self.soup.select("img.p-open-source__image")
        self.assertEqual(len(images), 6)
        for image in images:
            self.assertIn("res.cloudinary.com", image["src"])

    def test_developers_logos_are_named_images(self):
        logos = self.slides[0].select(".p-logo-section__logo")
        self.assertEqual(
            [logo["alt"] for logo in logos],
            ["Helm", "Jenkins", "Juju", "Kubernetes", "Spring", "Terraform"],
        )


if __name__ == "__main__":
    unittest.main()
