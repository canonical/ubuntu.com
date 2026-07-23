import unittest
from unittest.mock import patch

from webapp.app import app
from webapp.constants import (
    CSP,
    CSP_REPORT_MAX_BYTES,
    CSP_REPORT_ONLY,
    CSP_REPORT_PATH,
    NONCED_DIRECTIVES,
)


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

    def test_report_only_drops_suspected_stale_sources(self):
        # Guards the CSP_REPORT_ONLY bake-in mechanism itself: a source
        # marked stale in _CSP_REPORT_ONLY_REMOVALS must still be allowed
        # by the enforced CSP (nothing breaks for real users) but absent
        # from the report-only variant (so violations get surfaced).
        self.assertIn("script.crazyegg.com", CSP["script-src-elem"])
        self.assertNotIn(
            "script.crazyegg.com", CSP_REPORT_ONLY["script-src-elem"]
        )

    def test_report_uri_present_in_both_policies(self):
        self.assertEqual(CSP["report-uri"], [CSP_REPORT_PATH])
        self.assertEqual(CSP_REPORT_ONLY["report-uri"], [CSP_REPORT_PATH])


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

    def test_report_only_header_present_with_nonce_and_report_uri(self):
        response = self.client.get("/non-existent-csp-test-path")
        csp_ro = response.headers.get("Content-Security-Policy-Report-Only")
        self.assertIsNotNone(csp_ro)

        for directive in NONCED_DIRECTIVES:
            value = self._get_directive(csp_ro, directive)
            self.assertIsNotNone(
                value, f"{directive} missing from CSP-Report-Only header"
            )
            self.assertIn("'nonce-", value)
            self.assertNotIn("'unsafe-inline'", value)

        report_uri = self._get_directive(csp_ro, "report-uri")
        self.assertIsNotNone(report_uri)
        self.assertIn(CSP_REPORT_PATH, report_uri)


class TestCSPReportEndpoint(unittest.TestCase):
    """/csp-report is public and unauthenticated by necessity (browsers
    send violation reports with no credentials), so it must reject
    oversized bodies and reports whose document-uri isn't this host
    before anything gets forwarded to Sentry."""

    def setUp(self):
        self.client = app.test_client()
        self.valid_report = {
            "csp-report": {
                "disposition": "report",
                "violated-directive": "script-src-elem",
                "blocked-uri": "https://js.zi-scripts.com/tag.js",
                "document-uri": "https://localhost/16-04",
            }
        }

    @patch("webapp.handlers._forward_csp_violation")
    def test_valid_same_host_report_is_forwarded(self, forward_mock):
        response = self.client.post(
            CSP_REPORT_PATH,
            json=self.valid_report,
            base_url="https://localhost",
        )
        self.assertEqual(response.status_code, 204)
        forward_mock.assert_called_once()

    @patch("webapp.handlers._forward_csp_violation")
    def test_mismatched_document_uri_host_is_dropped(self, forward_mock):
        report = {
            "csp-report": {
                **self.valid_report["csp-report"],
                "document-uri": "https://not-this-site.example/page",
            }
        }
        response = self.client.post(
            CSP_REPORT_PATH, json=report, base_url="https://localhost"
        )
        self.assertEqual(response.status_code, 204)
        forward_mock.assert_not_called()

    def test_oversized_body_is_rejected(self):
        oversized_uri = "a" * (CSP_REPORT_MAX_BYTES + 1)
        report = {
            "csp-report": {
                **self.valid_report["csp-report"],
                "blocked-uri": oversized_uri,
            }
        }
        response = self.client.post(
            CSP_REPORT_PATH, json=report, base_url="https://localhost"
        )
        self.assertEqual(response.status_code, 413)


if __name__ == "__main__":
    unittest.main()
