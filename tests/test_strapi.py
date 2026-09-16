# Standard library
import os
import unittest
from unittest.mock import patch

# Local
from webapp.app import app
from webapp.strapi.api import StrapiAPI, StrapiError
from webapp.strapi.content import normalise_page, render_markdown
from webapp.strapi.routing import cms_route, normalise_path, resolve
from webapp.strapi.views import CMSTemplateFinder


class FakeStrapiAPI:
    """Stands in for webapp.strapi.api.StrapiAPI in tests."""

    media_url = "http://cms.test"

    def __init__(self, pages=None):
        self.pages = pages or {}
        self.purged = []

    def has_route(self, route, preview=False):
        return route in self.pages

    def get_page(self, route, preview=False):
        return self.pages.get(route)

    def purge(self, route=None):
        self.purged.append(route)


def body(response):
    """The HTML of a view's return value, which may be a Response."""
    if hasattr(response, "get_data"):
        return response.get_data(as_text=True)

    return str(response)


def a_page(**overrides):
    """A minimal Strapi page document."""
    document = {
        "title": "A CMS page",
        "route": "/a-cms-page",
        "theme": "paper",
        "show_navigation": True,
        "show_footer": True,
        "publishedAt": "2026-01-01T00:00:00.000Z",
        "seo": {"meta_description": "About this page"},
        "sections": [
            {
                "__component": "vanilla.hero",
                "title": "Hello",
                "subtitle": "A subtitle",
                "layout": "fifty_fifty",
                "links": [
                    {
                        "label": "Read more",
                        "url": "/more",
                        "appearance": "positive",
                    }
                ],
            }
        ],
    }
    document.update(overrides)

    return document


class TestPathHelpers(unittest.TestCase):
    def test_normalise_path_adds_a_leading_slash(self):
        self.assertEqual(normalise_path("desktop"), "/desktop")

    def test_normalise_path_strips_a_trailing_slash(self):
        self.assertEqual(normalise_path("/desktop/"), "/desktop")

    def test_normalise_path_collapses_repeated_slashes(self):
        self.assertEqual(normalise_path("//a//b/"), "/a/b")

    def test_normalise_path_keeps_the_root(self):
        self.assertEqual(normalise_path("/"), "/")

    def test_normalise_path_drops_query_and_fragment(self):
        self.assertEqual(normalise_path("/a?b=c#d"), "/a")

    def test_normalise_path_preserves_case(self):
        """
        Templates are matched case-sensitively, so lowercasing here would
        start serving paths that 404 today.
        """
        self.assertEqual(normalise_path("/Desktop"), "/Desktop")

    def test_cms_route_lowercases(self):
        self.assertEqual(cms_route("/Desktop/"), "/desktop")


class TestRouteResolution(unittest.TestCase):
    def setUp(self):
        self.context = app.test_request_context("/")
        self.context.push()

    def tearDown(self):
        self.context.pop()

    def test_a_url_rule_owns_its_path(self):
        resolution = resolve("/takeovers.json")

        self.assertEqual(resolution.source, "flask")
        self.assertFalse(resolution.is_available)

    def test_a_template_owns_its_path(self):
        resolution = resolve("/desktop")

        self.assertEqual(resolution.source, "template")
        self.assertEqual(resolution.detail, "desktop/index.html")
        self.assertFalse(resolution.is_available)

    def test_an_unused_path_is_available(self):
        resolution = resolve("/nothing-is-here-42")

        self.assertEqual(resolution.source, "none")
        self.assertTrue(resolution.is_available)

    def test_a_cms_page_is_found_when_no_template_matches(self):
        api = FakeStrapiAPI({"/from-the-cms": a_page()})

        resolution = resolve("/from-the-cms", strapi_api=api)

        self.assertEqual(resolution.source, "cms")
        self.assertTrue(resolution.is_available)

    def test_a_template_wins_over_a_cms_page(self):
        api = FakeStrapiAPI({"/desktop": a_page()})

        resolution = resolve("/desktop", strapi_api=api)

        self.assertEqual(resolution.source, "template")

    def test_a_partial_is_never_a_page(self):
        resolution = resolve("/shared/_breadcrumbs")

        self.assertEqual(resolution.source, "none")

    def test_an_empty_path_is_invalid(self):
        self.assertEqual(resolve("").source, "invalid")


class TestPageNormalisation(unittest.TestCase):
    def test_markdown_is_rendered(self):
        self.assertIn("<strong>bold</strong>", render_markdown("**bold**"))

    def test_markdown_tables_are_supported(self):
        html = render_markdown("| a | b |\n| --- | --- |\n| 1 | 2 |")

        self.assertIn("<table>", html)

    def test_scripts_are_stripped_from_rich_text(self):
        html = render_markdown("<script>alert(1)</script>Safe")

        self.assertNotIn("<script>", html)
        self.assertIn("Safe", html)

    def test_sections_are_mapped_to_templates(self):
        page = normalise_page(a_page())

        self.assertEqual(len(page["sections"]), 1)
        self.assertEqual(
            page["sections"][0]["template"], "_cms/components/_hero.html"
        )

    def test_unknown_components_are_dropped(self):
        document = a_page(
            sections=[
                {"__component": "vanilla.not-a-real-pattern", "title": "?"}
            ]
        )

        self.assertEqual(normalise_page(document)["sections"], [])

    def test_links_become_vanilla_buttons(self):
        page = normalise_page(a_page())
        link = page["sections"][0]["data"]["links"][0]

        self.assertEqual(link["class"], "p-button--positive")
        self.assertEqual(link["url"], "/more")

    def test_a_new_tab_link_is_given_a_rel(self):
        document = a_page(
            sections=[
                {
                    "__component": "vanilla.cta-block",
                    "title": "Go",
                    "links": [
                        {
                            "label": "Docs",
                            "url": "https://docs.ubuntu.com",
                            "appearance": "default",
                            "open_in_new_tab": True,
                        }
                    ],
                }
            ]
        )

        link = normalise_page(document)["sections"][0]["data"]["links"][0]

        self.assertEqual(link["target"], "_blank")
        self.assertEqual(link["rel"], "noopener noreferrer")

    def test_the_theme_becomes_a_body_class(self):
        self.assertEqual(normalise_page(a_page())["body_class"], "is-paper")

    def test_layouts_become_grid_classes(self):
        document = a_page(
            sections=[
                {
                    "__component": "vanilla.section",
                    "title": "Split",
                    "layout": "twentyfive_seventyfive",
                }
            ]
        )

        data = normalise_page(document)["sections"][0]["data"]

        self.assertEqual(data["row_class"], "row--25-75")

    def test_uploaded_images_are_served_from_the_cms(self):
        document = a_page(
            sections=[
                {
                    "__component": "vanilla.image-block",
                    "aspect_ratio": "ratio_16_9",
                    "width": "fixed",
                    "image": {
                        "file": {
                            "url": "/uploads/diagram.png",
                            "width": 800,
                            "height": 450,
                            "alternativeText": "A diagram",
                        }
                    },
                }
            ]
        )

        data = normalise_page(document, media_url="http://cms.test")[
            "sections"
        ][0]["data"]

        self.assertEqual(
            data["image"]["url"], "http://cms.test/uploads/diagram.png"
        )
        self.assertEqual(data["image"]["alt"], "A diagram")
        # Cloudinary cannot fetch from the CMS, so these stay plain <img>.
        self.assertFalse(data["image"]["use_macro"])
        self.assertEqual(data["aspect_ratio_class"], "p-image-container--16-9")

    def test_asset_urls_use_the_image_macro(self):
        document = a_page(
            sections=[
                {
                    "__component": "vanilla.image-block",
                    "aspect_ratio": "none",
                    "width": "fixed",
                    "image": {
                        "url": "https://assets.ubuntu.com/v1/a-logo.png",
                        "width": 200,
                        "height": 100,
                    },
                }
            ]
        )

        data = normalise_page(document)["sections"][0]["data"]

        self.assertTrue(data["image"]["use_macro"])

    def test_a_draft_is_flagged(self):
        page = normalise_page(a_page(publishedAt=None))

        self.assertTrue(page["is_draft"])

    def test_sections_are_numbered_for_unique_ids(self):
        document = a_page(
            sections=[
                {"__component": "vanilla.separator", "style": "muted"},
                {"__component": "vanilla.separator", "style": "muted"},
            ]
        )

        indexes = [s["index"] for s in normalise_page(document)["sections"]]

        self.assertEqual(indexes, [1, 2])


class TestCMSTemplateFinder(unittest.TestCase):
    def test_a_template_is_served_before_the_cms(self):
        api = FakeStrapiAPI({"/desktop": a_page()})
        view = CMSTemplateFinder(strapi_api=api)

        with app.test_request_context("/desktop"):
            response = view.dispatch_request()

        # The desktop template, not the CMS page.
        self.assertNotIn("A CMS page", body(response))

    def test_a_cms_page_is_served_when_no_template_matches(self):
        api = FakeStrapiAPI({"/a-cms-page": a_page()})
        view = CMSTemplateFinder(strapi_api=api)

        with app.test_request_context("/a-cms-page"):
            response = view.dispatch_request()

        html = body(response)

        self.assertIn("Hello", html)
        self.assertIn("p-section--hero", html)
        self.assertIn("p-button--positive", html)

    def test_an_unknown_path_is_still_a_404(self):
        from werkzeug.exceptions import NotFound

        view = CMSTemplateFinder(strapi_api=FakeStrapiAPI())

        with app.test_request_context("/nothing-is-here-42"):
            with self.assertRaises(NotFound):
                view.dispatch_request()

    def test_the_cms_can_be_told_to_win(self):
        api = FakeStrapiAPI({"/desktop": a_page()})
        view = CMSTemplateFinder(strapi_api=api)

        with patch.dict(
            os.environ, {"STRAPI_OVERRIDE_TEMPLATES": "true"}, clear=False
        ):
            with app.test_request_context("/desktop"):
                response = view.dispatch_request()

        self.assertIn("Hello", body(response))


class TestStrapiClient(unittest.TestCase):
    def _client(self, responses):
        """A StrapiAPI whose HTTP layer is replaced by `responses`."""
        api = StrapiAPI(base_url="http://cms.test", cache_ttl=60)
        calls = []

        def fake_get(path, params=None, preview=False):
            calls.append(path)
            result = responses.pop(0)

            if isinstance(result, Exception):
                raise result

            return result

        api._get = fake_get
        api.calls = calls

        return api

    def test_routes_are_cached(self):
        api = self._client([{"data": [{"route": "/one"}]}])

        self.assertTrue(api.has_route("/one"))
        self.assertTrue(api.has_route("/one"))
        self.assertEqual(len(api.calls), 1)

    def test_an_outage_does_not_raise(self):
        api = self._client([StrapiError("connection refused")])

        self.assertEqual(api.get_routes(), set())

    def test_an_outage_backs_off_instead_of_retrying(self):
        api = self._client(
            [StrapiError("connection refused"), {"data": [{"route": "/one"}]}]
        )

        api.get_routes()
        api.get_routes()

        # The second call is served by the backoff, not by Strapi.
        self.assertEqual(len(api.calls), 1)

    def test_purging_clears_the_backoff(self):
        api = self._client(
            [StrapiError("connection refused"), {"data": [{"route": "/one"}]}]
        )

        api.get_routes()
        api.purge()

        self.assertEqual(api.get_routes(), {"/one"})

    def test_a_stale_page_is_served_during_an_outage(self):
        api = self._client(
            [{"data": {"title": "Cached"}}, StrapiError("gone away")]
        )

        self.assertEqual(api.get_page("/a-page")["title"], "Cached")

        api._pages.ttl = -1  # Expire the entry.

        self.assertEqual(api.get_page("/a-page")["title"], "Cached")


class TestCMSEndpoints(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_route_check_reports_a_taken_template_path(self):
        response = self.client.get("/_cms/route-check?path=/desktop")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertFalse(payload["available"])
        self.assertEqual(payload["served_by"], "template")
        self.assertIn("template already exists", payload["reason"])

    def test_route_check_reports_a_taken_flask_path(self):
        payload = self.client.get(
            "/_cms/route-check?path=/takeovers.json"
        ).get_json()

        self.assertFalse(payload["available"])
        self.assertEqual(payload["served_by"], "flask")

    def test_route_check_reports_a_free_path(self):
        payload = self.client.get(
            "/_cms/route-check?path=/nothing-is-here-42"
        ).get_json()

        self.assertTrue(payload["available"])

    def test_route_check_needs_a_path(self):
        response = self.client.get("/_cms/route-check")

        self.assertEqual(response.status_code, 400)

    def test_purging_requires_the_secret(self):
        with patch.dict(
            os.environ, {"CMS_PURGE_SECRET": "a-secret"}, clear=False
        ):
            response = self.client.post(
                "/_cms/cache/purge",
                json={"route": "/a-cms-page"},
                headers={"x-cms-secret": "wrong"},
            )

        self.assertEqual(response.status_code, 403)

    def test_purging_is_off_without_a_secret(self):
        environment = dict(os.environ)
        environment.pop("CMS_PURGE_SECRET", None)
        environment.pop("FLASK_CMS_PURGE_SECRET", None)

        with patch.dict(os.environ, environment, clear=True):
            response = self.client.post("/_cms/cache/purge", json={})

        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
