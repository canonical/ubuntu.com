import logging
import os
import tempfile
import unittest

import flask

from webapp import llms
from webapp.app import app
from webapp.llms import build_llms_txt

logging.getLogger("talisker.context").disabled = True


class TestLlmsTxt(unittest.TestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """

        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_llms_txt(self):
        """
        Check that /llms.txt serves the manually maintained base file
        """

        response = self.client.get("/llms.txt")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["Content-Type"], "text/plain; charset=utf-8"
        )

        body = response.data.decode("utf-8")
        self.assertTrue(body.startswith("# Ubuntu"))
        self.assertIn("## Main pages", body)


BASE_WITH_MAIN_PAGES = (
    "# Example\n\n"
    "> Description.\n\n"
    "## Main pages\n\n"
    "- [Home](https://example.com): Home page.\n\n"
    "## Other section\n\n"
    "- [Other](https://example.com/other): Other page.\n"
)

BASE_WITHOUT_MAIN_PAGES = (
    "# Example\n\n"
    "> Description.\n\n"
    "## Other section\n\n"
    "- [Other](https://example.com/other): Other page.\n"
)


class TestBuildLlmsTxt(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmpdir.cleanup)
        self.llms_txt_path = os.path.join(self.tmpdir.name, "llms.txt")
        self.llms_yaml_path = os.path.join(self.tmpdir.name, "llms.yaml")
        with open(self.llms_txt_path, "w") as f:
            f.write(BASE_WITH_MAIN_PAGES)

    def _write_yaml(self, contents):
        with open(self.llms_yaml_path, "w") as f:
            f.write(contents)

    def test_no_config_file(self):
        """
        Missing llms.yaml just returns the base file untouched
        """

        result = build_llms_txt(self.llms_txt_path, self.llms_yaml_path)
        self.assertEqual(result, BASE_WITH_MAIN_PAGES)

    def test_missing_base_file_does_not_raise(self):
        """
        A missing templates/llms.txt degrades to a minimal header instead
        of raising - this runs at app import time, so an unhandled error
        here would crash the whole app
        """

        missing_path = os.path.join(self.tmpdir.name, "does-not-exist.txt")

        result = build_llms_txt(missing_path, self.llms_yaml_path)
        self.assertEqual(result, "# Ubuntu\n")

    def test_malformed_config_file(self):
        """
        Malformed llms.yaml is ignored rather than breaking the base file
        """

        self._write_yaml("extra: [this is not: valid: yaml")

        result = build_llms_txt(self.llms_txt_path, self.llms_yaml_path)
        self.assertEqual(result, BASE_WITH_MAIN_PAGES)

    def test_extra_sections_inserted_after_main_pages(self):
        """
        Extra sections from llms.yaml are inserted right after "Main
        pages", ahead of the rest of the manually written content
        """

        self._write_yaml(
            "extra:\n"
            "  - heading: Documentation\n"
            "    links:\n"
            "      - title: Server docs\n"
            "        url: https://example.com/server-docs\n"
            "        description: Server documentation.\n"
        )

        result = build_llms_txt(self.llms_txt_path, self.llms_yaml_path)
        self.assertEqual(
            result,
            (
                "# Example\n\n"
                "> Description.\n\n"
                "## Main pages\n\n"
                "- [Home](https://example.com): Home page.\n\n"
                "## Documentation\n\n"
                "- [Server docs](https://example.com/server-docs): "
                "Server documentation.\n\n"
                "## Other section\n\n"
                "- [Other](https://example.com/other): Other page.\n"
            ),
        )

    def test_extra_link_missing_title_or_url_is_dropped(self):
        """
        Links without both a title and a url are skipped
        """

        self._write_yaml(
            "extra:\n"
            "  - heading: Documentation\n"
            "    links:\n"
            "      - title: No URL\n"
            "        description: Missing a url.\n"
        )

        result = build_llms_txt(self.llms_txt_path, self.llms_yaml_path)
        self.assertEqual(result, BASE_WITH_MAIN_PAGES)

    def test_no_main_pages_heading_appends_at_end(self):
        """
        Without a "Main pages" section to anchor on, extras are appended
        at the end instead
        """

        with open(self.llms_txt_path, "w") as f:
            f.write(BASE_WITHOUT_MAIN_PAGES)
        self._write_yaml(
            "extra:\n"
            "  - heading: Documentation\n"
            "    links:\n"
            "      - title: Server docs\n"
            "        url: https://example.com/server-docs\n"
            "        description: Server documentation.\n"
        )

        result = build_llms_txt(self.llms_txt_path, self.llms_yaml_path)
        self.assertEqual(
            result,
            BASE_WITHOUT_MAIN_PAGES.rstrip("\n") + "\n\n## Documentation\n\n"
            "- [Server docs](https://example.com/server-docs): "
            "Server documentation.\n",
        )


class TestLlmsFullTxt(unittest.TestCase):
    def setUp(self):
        """
        Pre-seed templates/llms-full.txt so the route serves it straight
        from disk instead of triggering a full-site render.
        """

        app.testing = True
        self.client = app.test_client()
        self.file_path = os.path.join(
            os.getcwd(), "templates", "llms-full.txt"
        )
        self.pre_existing = os.path.exists(self.file_path)
        if not self.pre_existing:
            with open(self.file_path, "w") as f:
                f.write("# Ubuntu\n\n> Stub content for testing.\n")

    def tearDown(self):
        if not self.pre_existing and os.path.exists(self.file_path):
            os.remove(self.file_path)

    def test_llms_full_txt_serves_existing_file(self):
        """
        Check that /llms-full.txt serves the pre-generated file as-is
        """

        response = self.client.get("/llms-full.txt")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["Content-Type"], "text/plain; charset=utf-8"
        )
        self.assertIn(
            "Stub content for testing.", response.data.decode("utf-8")
        )


class TestIterLinks(unittest.TestCase):
    def test_iter_links(self):
        """
        Only markdown link bullets are picked up; plain bullets are ignored
        """

        content = (
            "# Ubuntu\n\n"
            "## Main pages\n\n"
            "- [Foo](https://ubuntu.com/foo?format=md): Foo page.\n"
            "- Not a link, just text.\n"
            "- [Bar](https://ubuntu.com/bar?format=md)\n"
        )
        result = list(llms._iter_links(content))
        self.assertEqual(
            result,
            [
                ("Foo", "https://ubuntu.com/foo?format=md"),
                ("Bar", "https://ubuntu.com/bar?format=md"),
            ],
        )


class TestIsRenderable(unittest.TestCase):
    def test_external_domain_excluded(self):
        self.assertFalse(
            llms._is_renderable("https://example.com/foo?format=md")
        )

    def test_missing_format_md_excluded(self):
        self.assertFalse(llms._is_renderable("https://ubuntu.com/foo"))

    def test_excluded_paths(self):
        self.assertFalse(
            llms._is_renderable("https://ubuntu.com/tutorials?format=md")
        )
        self.assertFalse(
            llms._is_renderable("https://ubuntu.com/community?format=md")
        )
        self.assertFalse(
            llms._is_renderable("https://ubuntu.com/security/cves?format=md")
        )
        self.assertFalse(
            llms._is_renderable(
                "https://ubuntu.com/security/notices?format=md"
            )
        )
        self.assertFalse(
            llms._is_renderable("https://ubuntu.com/engage?format=md")
        )
        self.assertFalse(
            llms._is_renderable("https://ubuntu.com/pro/dashboard?format=md")
        )

    def test_own_renderable_page_included(self):
        self.assertTrue(
            llms._is_renderable("https://ubuntu.com/about?format=md")
        )


def _stub_app():
    """A tiny Flask app standing in for the real site, for fast tests."""

    stub_app = flask.Flask(__name__)

    @stub_app.route("/foo")
    def foo():
        response = flask.make_response("Foo content.")
        response.headers["Content-Type"] = "text/markdown; charset=utf-8"
        return response

    @stub_app.route("/bar")
    def bar():
        # Not served as markdown, so build_llms_full_txt should skip it.
        return "Bar content."

    return stub_app


class TestBuildLlmsFullTxt(unittest.TestCase):
    def test_renders_own_pages_and_skips_others(self):
        """
        Own markdown-rendered pages are included; external domains,
        non-markdown responses, and Discourse/security-API-backed paths
        are skipped
        """

        content = (
            "# Ubuntu\n\n"
            "## Main pages\n\n"
            "- [Foo](https://ubuntu.com/foo?format=md): Foo page.\n"
            "- [Bar](https://ubuntu.com/bar?format=md): Bar page.\n"
            "- [External](https://example.com/other?format=md): Elsewhere.\n"
            "- [Tutorials](https://ubuntu.com/tutorials?format=md): "
            "Tutorials.\n"
        )

        result = llms.build_llms_full_txt(_stub_app(), content)

        self.assertIn("Foo content.", result)
        self.assertIn("Source: https://ubuntu.com/foo?format=md", result)
        self.assertNotIn("Bar content.", result)
        self.assertNotIn("example.com", result)
        self.assertNotIn("Source: https://ubuntu.com/tutorials", result)


if __name__ == "__main__":
    unittest.main()
