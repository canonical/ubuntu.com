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

        self.assertEqual("/", response.location)

    def test_logout_with_return(self):
        response = self.client.get("/logout?return_to=/pro")

        self.assertEqual(302, response.status_code)

        self.assertEqual("/pro", response.location)

    def test_logout_with_return_to_same_host(self):
        response = self.client.get("/logout?return_to=http://localhost/pro")

        self.assertEqual(302, response.status_code)

        self.assertEqual("http://localhost/pro", response.location)

    def test_logout_rejects_offsite_return_to(self):
        for return_to in ["https://evil.example/", "//evil.example/"]:
            response = self.client.get(f"/logout?return_to={return_to}")

            self.assertEqual(302, response.status_code)

            self.assertEqual("/", response.location)
