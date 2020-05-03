import unittest
from webapp.app import app


class TestRoutes(unittest.TestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """
        app.testing = True
        self.client = app.test_client()

    def test_homepage(self):
        """
        When given the index URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/").status_code, 200)

    def test_advantage(self):
        """
        When given the advantage URL,
        we should return a 200 status code
        """
        self.assertEqual(self.client.get("/advantage").status_code, 200)

    def test_advantage_logged_in(self):
        """
        When given the advantage URL,
        and the user is logged in,
        we should return a 200 status code
        """
        with self.client.session_transaction() as s:
            s["openid"] = "openid"

        self.assertEqual(self.client.get("/advantage").status_code, 200)

    def test_not_found(self):
        """
        When given a non-existent URL,
        we should return a 404 status code
        """

        self.assertEqual(self.client.get("/not-found-url").status_code, 404)


if __name__ == "__main__":
    unittest.main()
