import unittest

from webapp.app import app
from webapp.constants import CSP, NONCED_DIRECTIVES


class TestCSPConstants(unittest.TestCase):
    """The CSP dict should no longer allow inline scripts."""

    def test_strict_dynamic_in_script_src_elem(self):
        self.assertIn("'strict-dynamic'", CSP["script-src-elem"])

    def test_no_unsafe_inline_in_script_directives(self):
        self.assertNotIn("'unsafe-inline'", CSP["script-src"])
        self.assertNotIn("'unsafe-inline'", CSP["script-src-elem"])

    def test_no_unsafe_hashes_in_script_src(self):
        self.assertNotIn("'unsafe-hashes'", CSP["script-src"])

    def test_unsafe_eval_kept_in_script_src(self):
        # 'unsafe-eval' is intentionally out of scope and retained.
        self.assertIn("'unsafe-eval'", CSP["script-src"])

    def test_nonced_directives(self):
        self.assertEqual(NONCED_DIRECTIVES, ("script-src", "script-src-elem"))


class TestCSPHeader(unittest.TestCase):
    """The response header should carry a per-request nonce on the script
    directives and never fall back to 'unsafe-inline'."""

    def setUp(self):
        self.client = app.test_client()

    @staticmethod
    def _get_directive(csp_header, directive):
        for part in csp_header.split(";"):
            part = part.strip()
            if part.startswith(directive + " "):
                return part
        return None

    def test_script_directives_carry_nonce_not_unsafe_inline(self):
        # 404 responses still pass through the after_request CSP handler,
        # which avoids depending on external API calls.
        response = self.client.get("/non-existent-csp-test-path")
        csp = response.headers.get("Content-Security-Policy")
        self.assertIsNotNone(csp)

        for directive in NONCED_DIRECTIVES:
            value = self._get_directive(csp, directive)
            self.assertIsNotNone(value, f"{directive} missing from CSP header")
            self.assertIn("'nonce-", value)
            self.assertNotIn("'unsafe-inline'", value)

    def test_nonce_is_per_request(self):
        first = self.client.get("/non-existent-csp-test-path")
        second = self.client.get("/non-existent-csp-test-path")
        first_csp = first.headers.get("Content-Security-Policy")
        second_csp = second.headers.get("Content-Security-Policy")
        first_script = self._get_directive(first_csp, "script-src")
        second_script = self._get_directive(second_csp, "script-src")
        self.assertNotEqual(first_script, second_script)


if __name__ == "__main__":
    unittest.main()
