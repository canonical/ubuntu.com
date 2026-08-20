import logging
import os
import tempfile
import unittest
from unittest.mock import patch

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


class TestBuildLlmsTxt(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmpdir.cleanup)
        self.llms_txt_path = os.path.join(self.tmpdir.name, "llms.txt")
        with open(self.llms_txt_path, "w") as f:
            f.write(BASE_WITH_MAIN_PAGES)

    def test_reads_file_untouched(self):
        """
        build_llms_txt returns the file's contents as-is
        """

        result = build_llms_txt(self.llms_txt_path)
        self.assertEqual(result, BASE_WITH_MAIN_PAGES)

    def test_missing_base_file_does_not_raise(self):
        """
        A missing templates/llms.txt degrades to a minimal header instead
        of raising - this runs at app import time, so an unhandled error
        here would crash the whole app
        """

        missing_path = os.path.join(self.tmpdir.name, "does-not-exist.txt")

        result = build_llms_txt(missing_path)
        self.assertEqual(result, "# Ubuntu\n")


class TestLlmsFullTxt(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_llms_full_txt_serves_hardcoded_file(self):
        """
        Check that /llms-full.txt serves the hand-written, committed
        templates/llms-full.txt
        """

        response = self.client.get("/llms-full.txt")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["Content-Type"], "text/plain; charset=utf-8"
        )
        self.assertTrue(response.data.decode("utf-8").startswith("# Ubuntu"))

    @patch("webapp.app.os.path.exists", return_value=False)
    def test_llms_full_txt_missing_returns_503(self, mock_exists):
        """
        Check that /llms-full.txt returns 503 if the file is missing
        """

        response = self.client.get("/llms-full.txt")
        self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
