import unittest

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

        self.assertEqual("http://localhost/", response.location)

    def test_logout_with_return(self):
        response = self.client.get("/logout?return_to=/pro")

        self.assertEqual(302, response.status_code)

        self.assertEqual("http://localhost/pro", response.location)
