import unittest

import flask

from webapp.utils import safe_redirect_url


class TestSafeRedirectUrl(unittest.TestCase):
    def setUp(self):
        app = flask.Flask(__name__)
        self.context = app.test_request_context(
            base_url="https://ubuntu-com-123.demos.haus"
        )
        self.context.push()

    def tearDown(self):
        self.context.pop()

    def test_keeps_relative_paths(self):
        self.assertEqual(safe_redirect_url("/pro"), "/pro")
        self.assertEqual(
            safe_redirect_url("/blog?topic=cloud#posts"),
            "/blog?topic=cloud#posts",
        )
        self.assertEqual(safe_redirect_url("/#unsubscribed"), "/#unsubscribed")

    def test_collapses_scheme_relative_tricks(self):
        for url in ["//evil.com/x", "/\\evil.com/x", "/\t/evil.com/x"]:
            self.assertEqual(safe_redirect_url(url), "/", url)
        # Stays on this site as a plain path.
        self.assertEqual(safe_redirect_url("///evil.com/x"), "/evil.com/x")
        self.assertEqual(safe_redirect_url("/ /x"), "/ /x")

    def test_allows_current_host_and_canonical_domains(self):
        for url in [
            "https://ubuntu-com-123.demos.haus/pro",
            "https://ubuntu.com/pro",
            "https://jp.ubuntu.com/",
            "https://assets.ubuntu.com/v1/file.zip",
            "https://canonical.com/contact-us",
            "https://snapcraft.io/store",
            "http://ubuntu.com:8001/pro",
        ]:
            self.assertEqual(safe_redirect_url(url), url)

    def test_rejects_other_hosts_and_schemes(self):
        for url in [
            "https://evil.com/",
            "https://ubuntu.com.evil.com/",
            "https://evilubuntu.com/",
            "https://ubuntu.com@evil.com/",
            "javascript:alert(1)",
            "data:text/html,hi",
            "http:evil.com",
            "https://[::1",
        ]:
            self.assertEqual(safe_redirect_url(url, "/fallback"), "/fallback")

    def test_returns_default_for_empty(self):
        self.assertEqual(safe_redirect_url(None), "/")
        self.assertEqual(
            safe_redirect_url("", "https://ubuntu.com"), "https://ubuntu.com"
        )


if __name__ == "__main__":
    unittest.main()
