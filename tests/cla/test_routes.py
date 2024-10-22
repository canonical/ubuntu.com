import unittest
from unittest.mock import patch, MagicMock
from webapp.app import app


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
        # https://example.com/api -> aHR0cHM6Ly9leGFtcGxlLmNvbS9hcGk=
        response = self.client.get(
            """/legal/contributors/agreement/api
?request_url=aHR0cHM6Ly9leGFtcGxlLmNvbS9hcGk="""
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
        response = self.client.get(
            """/legal/contributors/agreement/api
?request_url=aHR0cHM6Ly9leGFtcGxlLmNvbS9hcGk="""
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

    def test_canonical_cla_api_github_logout(self):
        response = self.client.get(
            "/legal/contributors/agreement/api/github/logout"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "/legal/contributors/agreement")
        self.assertIn("github_oauth2_session", response.headers["Set-Cookie"])
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    @patch("webapp.canonical_cla.views.get_query_param")
    def test_canonical_cla_api_github_login(self, mock_get_query_param):
        mock_get_query_param.side_effect = [
            "https://example.com/agreement",  # agreement_url
            "test_access_token",  # access_token
            None,  # github_error
        ]

        response = self.client.get(
            "/legal/contributors/agreement/api/github/login"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.location, "https://example.com/agreement?github_error="
        )
        self.assertIn("github_oauth2_session", response.headers["Set-Cookie"])
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    def test_canonical_cla_api_launchpad_logout(self):
        response = self.client.get(
            "/legal/contributors/agreement/api/launchpad/logout"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "/legal/contributors/agreement")
        self.assertIn(
            "launchpad_oauth_session", response.headers["Set-Cookie"]
        )
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    @patch("webapp.canonical_cla.views.get_query_param")
    def test_canonical_cla_api_launchpad_login(self, mock_get_query_param):
        mock_get_query_param.side_effect = [
            "https://example.com/agreement",  # agreement_url
            "test_access_token",  # access_token
            None,  # launchpad_error
        ]

        response = self.client.get(
            "/legal/contributors/agreement/api/launchpad/login"
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.location, "https://example.com/agreement?launchpad_error="
        )
        self.assertIn(
            "launchpad_oauth_session", response.headers["Set-Cookie"]
        )
        self.assertEqual(response.headers["Cache-Control"], "no-store")


if __name__ == "__main__":
    unittest.main()
