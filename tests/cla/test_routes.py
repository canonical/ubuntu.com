import unittest
from unittest.mock import patch, MagicMock
import base64
from webapp.app import app
from webapp.canonical_cla.views import validate_agreement_url


class TestCLARoutes(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    @patch("requests.request")
    def test_canonical_cla_api_proxy(self, mock_request):
        mock_response = MagicMock()
        mock_response.content = b"Test content"
        mock_response.headers = {"Content-Type": "application/json"}
        mock_response.status_code = 200
        mock_request.return_value = mock_response
        # /github/profile -> L2dpdGh1Yi9wcm9maWxl
        github_profile_endpoint = base64.b64encode(b"/github/profile").decode(
            "utf-8"
        )
        response = self.client.get(
            f"https://canonical.com/legal/contributors/agreement/api"
            f"?request_url={github_profile_endpoint}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b"Test content")
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    @patch("requests.request")
    def test_canonical_cla_api_proxy_non_json_response(self, mock_request):
        mock_response = MagicMock()
        mock_response.content = b"""
        <html>
            <head><title>502 Bad Gateway</title></head>
            <body>
                <center><h1>502 Bad Gateway</h1></center>
                <hr><center>nginx/1.10.3 (Ubuntu)</center>
            </body>
        </html>
        """
        mock_response.headers = {"Content-Type": "text/html"}
        mock_response.status_code = 502
        mock_request.return_value = mock_response
        # /github/profile -> L2dpdGh1Yi9wcm9maWxl
        github_profile_endpoint = base64.b64encode(b"/github/profile").decode(
            "utf-8"
        )
        response = self.client.get(
            f"https://canonical.com/legal/contributors/agreement/api"
            f"?request_url={github_profile_endpoint}"
        )

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(
            response.get_json(),
            {
                "detail": "Internal server error",
            },
        )

    def test_canonical_cla_api_proxy_disallowed_endpoint(self):
        # Test that disallowed endpoints return 403
        # /api/malicious -> L2FwaS9tYWxpY2lvdXM=
        malicious_endpoint = base64.b64encode(b"/api/malicious").decode(
            "utf-8"
        )
        response = self.client.get(
            f"https://canonical.com/legal/contributors/agreement/api"
            f"?request_url={malicious_endpoint}"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(
            response.get_json(),
            {
                "detail": "Endpoint not allowed",
            },
        )

    def test_canonical_cla_api_github_logout(self):
        response = self.client.get(
            "https://canonical.com/legal/contributors/agreement/api/github/logout"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "https://canonical.com/legal/contributors/agreement")
        self.assertIn("github_oauth2_session", response.headers["Set-Cookie"])
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    @patch("webapp.canonical_cla.views.get_query_param")
    def test_canonical_cla_api_github_login(self, mock_get_query_param):
        mock_get_query_param.side_effect = [
            # agreement_url (valid internal)
            "https://canonical.com/legal/contributors/agreement",
            "test_access_token",  # access_token
            None,  # github_error
        ]

        response = self.client.get(
            "https://canonical.com/legal/contributors/agreement/api/github/login"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.location, "https://canonical.com/legal/contributors/agreement?github_error="
        )
        self.assertIn("github_oauth2_session", response.headers["Set-Cookie"])
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    def test_canonical_cla_api_launchpad_logout(self):
        response = self.client.get(
            "https://canonical.com/legal/contributors/agreement/api/launchpad/logout"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "https://canonical.com/legal/contributors/agreement")
        self.assertIn(
            "launchpad_oauth_session", response.headers["Set-Cookie"]
        )
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    @patch("webapp.canonical_cla.views.get_query_param")
    def test_canonical_cla_api_launchpad_login(self, mock_get_query_param):
        mock_get_query_param.side_effect = [
            # agreement_url (valid internal)
            "https://canonical.com/legal/contributors/agreement?",
            "test_access_token",  # access_token
            None,  # launchpad_error
        ]

        response = self.client.get(
            "https://canonical.com/legal/contributors/agreement/api/launchpad/login"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.location, "https://canonical.com/legal/contributors/agreement?launchpad_error="
        )
        self.assertIn(
            "launchpad_oauth_session", response.headers["Set-Cookie"]
        )
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    def test_validate_agreement_url_valid_path(self):
        """Test that valid internal paths are allowed"""
        with app.test_request_context("/", base_url="https://ubuntu.com"):
            result = validate_agreement_url("https://canonical.com/legal/contributors/agreement")
            self.assertEqual(result, "https://canonical.com/legal/contributors/agreement")

    def test_validate_agreement_url_same_hostname_allowed(self):
        """Test that URLs with same hostname are allowed"""
        with app.test_request_context("/", base_url="https://ubuntu.com"):
            result = validate_agreement_url(
                "https://ubuntu.com/legal/contributors/agreement"
            )
            self.assertEqual(
                result, "https://ubuntu.com/legal/contributors/agreement"
            )

    def test_validate_agreement_url_different_hostname_blocked(self):
        """Test that URLs with different hostname are blocked"""
        with app.test_request_context("/", base_url="https://ubuntu.com"):
            result = validate_agreement_url("https://example.com/malicious")
            self.assertEqual(result, "https://canonical.com/legal/contributors/agreement")

    def test_validate_agreement_url_empty_returns_default(self):
        """Test that empty URLs return default"""
        result = validate_agreement_url(None)
        self.assertEqual(result, "https://canonical.com/legal/contributors/agreement")


if __name__ == "__main__":
    unittest.main()
