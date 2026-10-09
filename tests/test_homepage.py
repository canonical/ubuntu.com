# Standard library
import os
import re
import unittest

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


BASE_INDEX = os.path.join(
    os.path.dirname(__file__), "..", "templates", "base_index.html"
)

# The homepage sections, in page order. If you reorder, add or remove a
# section, update this list to match the home/_*.html includes in
# templates/base_index.html.
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

        self.assertEqual(
            found,
            EXPECTED_ORDER,
            "The homepage sections changed. If that was intended, update "
            "EXPECTED_ORDER in tests/test_homepage.py to match the "
            "home/_*.html includes in templates/base_index.html.",
        )


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
        self._soup = None
        return super().setUp()

    def get_soup(self):
        if self._soup is None:
            response = self.client.get("/")
            self._soup = BeautifulSoup(response.get_data(as_text=True), "lxml")
        return self._soup

    def get_section(self, heading_text):
        soup = self.get_soup()
        heading = next(
            (
                h2
                for h2 in soup.find_all("h2")
                if " ".join(h2.get_text(" ").split()) == heading_text
            ),
            None,
        )
        self.assertIsNotNone(heading, f"Missing heading: {heading_text}")
        # Vanilla section macros render a <section>; the tiered list
        # renders a div.p-section instead
        return heading.find_parent("section") or heading.find_parent(
            "div", class_="p-section"
        )

    def arrow_link_hrefs(self, root):
        return [link["href"] for link in root.select("a.p-cta-text")]

    def test_homepage_body_is_scoped(self):
        """
        Only the homepage body carries the class that scopes homepage styles
        """

        body_classes = self.get_soup().body.get("class", [])
        self.assertIn("p-homepage", body_classes)
        self.assertIn("is-dark", body_classes)

        response = self.client.get("/what-is-enterprise-linux")
        self.assertEqual(response.status_code, 200)
        other = BeautifulSoup(response.get_data(as_text=True), "lxml")
        self.assertNotIn("p-homepage", other.body.get("class", []))

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

    def test_hardware_section(self):
        section = self.get_section(
            "Go further and faster with certified hardware"
        )
        self.assertEqual(self.arrow_link_hrefs(section), ["/certified"])
        # Split 50/50 from medium up, not only on large
        self.assertIsNotNone(section.select_one(".grid-row--50-50"))
        self.assertIsNone(section.select_one(".grid-row--50-50-on-large"))

        logos = self.get_soup().select(
            ".p-logo-section__items img.p-logo-section__logo"
        )
        self.assertEqual(
            [logo["alt"] for logo in logos],
            [
                "AMD",
                "Dell Technologies",
                "HP",
                "Intel",
                "Lenovo",
                "NVIDIA",
            ],
        )

    def test_arrow_links_use_an_empty_vanilla_icon(self):
        links = self.get_soup().select("a.p-cta-text")
        self.assertTrue(links, "No arrow links found")
        for link in links:
            icons = link.select("i.p-icon--arrow-right")
            self.assertEqual(len(icons), 1, link)
            self.assertEqual(icons[0].get_text(strip=True), "")

    def test_images_go_through_the_image_template(self):
        logos = self.get_soup().select("img.p-logo-section__logo")
        self.assertTrue(logos, "No logos found")
        for logo in logos:
            self.assertIn("res.cloudinary.com", logo["src"], logo)

    def row_titles(self, section):
        return [
            title.get_text(strip=True)
            for title in section.select("h3.p-heading--5")
        ]

    def test_pro_section(self):
        section = self.get_section("15 years of peace of mind with Ubuntu Pro")
        self.assertEqual(
            self.row_titles(section),
            [
                "Enterprise-grade security, support and compliance",
                "A unified Ubuntu experience",
            ],
        )
        self.assertEqual(
            self.arrow_link_hrefs(section),
            ["/pro", "/what-is-enterprise-linux"],
        )

    def test_containers_section(self):
        section = self.get_section("The standard for modern containers")
        self.assertEqual(
            len(section.select(".p-divided__block .p-divided__heading")), 3
        )
        self.assertEqual(
            self.row_titles(section),
            [
                "1 billion Docker image pulls and counting",
                "An efficient, minimal footprint",
                "Build minimal, OCI-compliant containers",
            ],
        )
        self.assertEqual(
            self.arrow_link_hrefs(section),
            [
                "https://hub.docker.com/_/ubuntu",
                "/chisel/docs/latest/",
                "/containers/rockcraft",
            ],
        )

    def test_tiered_list_placeholders_do_not_render(self):
        text = self.get_soup().get_text()
        for placeholder in [
            "Tiered List",
            "This is a tiered list.",
            "No CTA provided.",
        ]:
            self.assertNotIn(placeholder, text)

    def test_closer_section(self):
        heading = next(
            (
                h2
                for h2 in self.get_soup().select("section.p-strip.is-deep h2")
                if "Discover more about Canonical" in h2.get_text()
            ),
            None,
        )
        self.assertIsNotNone(heading, "Missing closer heading")
        self.assertEqual(
            list(heading.stripped_strings),
            [
                "Discover more about Canonical",
                "Trusted source for your whole stack",
            ],
        )
        self.assertIsNotNone(heading.find("br"))

        section = heading.find_parent("section")
        self.assertIn(
            "covered through Ubuntu Pro", section.get_text(" ", strip=True)
        )
        self.assertEqual(
            self.arrow_link_hrefs(section), ["https://canonical.com/"]
        )


if __name__ == "__main__":
    unittest.main()
