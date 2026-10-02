import unittest
from unittest.mock import Mock, patch

# Local
from webapp.app import app


class LogoutRedirects(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_logout(self):
        response = self.client.get("/logout")

        self.assertEqual(302, response.status_code)

        self.assertEqual("/", response.location)

    def test_logout_with_return(self):
        response = self.client.get("/logout?return_to=/pro")

        self.assertEqual(302, response.status_code)

        self.assertEqual("/pro", response.location)


class LoginHandler(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_contracts_api_unavailable_returns_503(self):
        response_mock = Mock()
        response_mock.status_code = 503
        response_mock.json.side_effect = ValueError("No JSON")

        with patch("webapp.login.session.request", return_value=response_mock):
            response = self.client.get("/login")

        self.assertEqual(503, response.status_code)

    def test_malformed_macaroon_response_returns_503(self):
        response_mock = Mock()
        response_mock.status_code = 200
        response_mock.json.return_value = {}

        with patch("webapp.login.session.request", return_value=response_mock):
            response = self.client.get("/login")

        self.assertEqual(503, response.status_code)
