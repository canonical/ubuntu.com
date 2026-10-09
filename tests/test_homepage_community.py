# Standard library
import os
import unittest
from urllib.parse import unquote

# Packages
from bs4 import BeautifulSoup
from flask import render_template_string
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestHomepageCommunity(VCRTestCase):
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

    def get_section(self):
        response = self.client.get("/")
        soup = BeautifulSoup(response.get_data(as_text=True), "lxml")
        heading = soup.find(
            "h2",
            string=lambda text: text
            and text.strip() == "Built by you. For you.",
        )
        self.assertIsNotNone(heading, "Missing community heading")
        return heading.find_parent("section")

    def test_community_section(self):
        section = self.get_section()
        self.assertIn("js-community-tiles", section["class"])
        self.assertIn("p-homepage", section.find_parent("body")["class"])
        self.assertIn(
            "Hover over the media below to see more.", section.get_text()
        )

        tiles = section.select("article.p-community-tile")
        self.assertEqual(
            [tile.h3.get_text(strip=True) for tile in tiles],
            [
                "Join us in making software freely available to all",
                "Discover the Ubuntu Summit",
                "Our contributions",
            ],
        )
        buttons = [tile.select_one("a.p-button") for tile in tiles]
        self.assertEqual(
            [(b.get_text(strip=True), b["href"]) for b in buttons],
            [
                ("Join the community", "/community"),
                ("Learn about the Ubuntu Summit", "/summit"),
                ("Find out more", "#"),
            ],
        )

    def test_community_media_goes_through_the_image_template(self):
        section = self.get_section()
        images = section.select("img.p-community-tile__media")
        self.assertEqual(len(images), 1)
        self.assertIn("res.cloudinary.com", images[0]["src"])
        for video in section.select("video.p-community-tile__media"):
            self.assertIn("res.cloudinary.com", video["poster"])

    def test_community_videos_use_the_encoded_assets(self):
        videos = self.get_section().select("video.p-community-tile__media")
        self.assertEqual(
            [
                [source["src"] for source in video.find_all("source")]
                for video in videos
            ],
            [
                [
                    f"https://assets.ubuntu.com/v1/{name}"
                    for name in [
                        "0a97871a-community_square.webm",
                        "3028ccff-community_square_hevc.mp4",
                        "2cef91fa-community_square.mp4",
                    ]
                ],
                [
                    f"https://assets.ubuntu.com/v1/{name}"
                    for name in [
                        "3d238b5e-community_summit.webm",
                        "bc4cf331-community_summit_hevc.mp4",
                        "bbddfc33-community_summit.mp4",
                    ]
                ],
            ],
        )
        posters = [unquote(video["poster"]) for video in videos]
        self.assertTrue(posters[0].endswith("community_square_poster.jpg"))
        self.assertTrue(posters[1].endswith("community_summit_poster.jpg"))


class TestCommunityTileMacro(unittest.TestCase):
    def render_tile(self, video):
        tile = {
            "title": "Title",
            "body": "Body",
            "button": {"text": "Go", "href": "/go"},
            "image": {
                "url": "https://assets.ubuntu.com/v1/b129df29-community.jpg",
                "width": "2048",
                "height": "807",
            },
            "video": video,
            "is_square": False,
        }
        with app.test_request_context("/"):
            html = render_template_string(
                '{% from "home/_community-tile.html" import community_tile '
                "with context %}{{ community_tile(tile) }}",
                tile=tile,
            )
        return BeautifulSoup(html, "lxml")

    def test_tile_with_video_renders_a_muted_looping_video(self):
        soup = self.render_tile(
            {
                "webm": "https://example.com/a.webm",
                "hevc": "https://example.com/a-hevc.mp4",
                "mp4": "https://example.com/a.mp4",
            }
        )
        video = soup.select_one("video.p-community-tile__media")
        self.assertIsNotNone(video)
        for attribute in ["muted", "loop", "playsinline"]:
            self.assertTrue(video.has_attr(attribute), attribute)
        self.assertEqual(video["preload"], "none")
        self.assertEqual(video["aria-hidden"], "true")
        self.assertIn("res.cloudinary.com", video["poster"])
        # Codec strings let a browser skip a file it can't decode, such as
        # AV1 on older Safari, and fall through to the next source
        self.assertEqual(
            [
                (source["src"], source["type"])
                for source in video.find_all("source")
            ],
            [
                (
                    "https://example.com/a.webm",
                    'video/webm; codecs="av01.0.05M.08"',
                ),
                (
                    "https://example.com/a-hevc.mp4",
                    'video/mp4; codecs="hvc1.1.6.L93.B0"',
                ),
                ("https://example.com/a.mp4", "video/mp4"),
            ],
        )
        self.assertIsNone(soup.find("img"))

    def test_tile_without_video_renders_the_image(self):
        soup = self.render_tile(None)
        self.assertIsNone(soup.find("video"))
        self.assertIsNotNone(soup.select_one("img.p-community-tile__media"))


if __name__ == "__main__":
    unittest.main()
