import unittest
from tests.fixtures.flask import client


class TestRoutes(unittest.TestCase):
    def test_homepage(self):
        """
        When given the index URL,
        we should return a 200 status code
        """

        self.assertEqual(client().get("/").status_code, 200)

    def test_not_found(self):
        """
        When given a non-existent URL,
        we should return a 404 status code
        """

        self.assertEqual(client().get("/not-found-url").status_code, 404)


if __name__ == "__main__":
    unittest.main()
