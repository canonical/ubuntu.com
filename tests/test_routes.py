# Standard library
import unittest

# Packages
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestRoutes(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don't record auth parameters
        """
        return {"filter_headers": ["Authorization", "Cookie"]}

    def setUp(self):
        """
        Set up Flask app for testing
        """

        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_homepage(self):
        """
        When given the index URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/").status_code, 200)

    def test_blog(self):
        """
        Check blog pages work.
        This checks that the blog module is correctly
        integrated.
        """

        self.assertEqual(self.client.get("/blog").status_code, 200)
        self.assertEqual(
            self.client.get("/blog/topics/design").status_code, 200
        )
        self.assertEqual(
            self.client.get("/blog/press-centre").status_code, 200
        )
        self.assertEqual(
            self.client.get("/blog/internet-of-things").status_code, 200
        )
        self.assertEqual(
            self.client.get("/blog/installing-ros-in-lxd").status_code, 200
        )

    def test_server_docs(self):
        """
        Check the server docs homepage loads
        """

        self.assertEqual(self.client.get("/server/docs").status_code, 200)

    def test_tutorials(self):
        """
        Check the tutorials homepage loads
        """

        self.assertEqual(self.client.get("/tutorials").status_code, 200)
        self.assertEqual(
            self.client.get("/tutorials?topic=cloud").status_code, 200
        )
        self.assertEqual(
            self.client.get(
                "/tutorials/create-a-usb-stick-on-windows"
            ).status_code,
            200,
        )

    def test_download(self):
        """
        Check download thank-you pages have ISOs in them
        """

        desktop_response = self.client.get(
            "/download/desktop/thank-you?version=20.04&architecture=amd64"
        )

        self.assertEqual(desktop_response.status_code, 200)

        self.assertIn(b"ubuntu-20.04-desktop-amd64.iso", desktop_response.data)

    def test_contribution(self):
        """
        Check contribution thank-you pages render
        """

        thank_you_response = self.client.get("/download/desktop/thank-you")

        self.assertEqual(thank_you_response.status_code, 200)

        self.assertIn(
            b"Thank you for your contribution", thank_you_response.data
        )

    def test_advantage(self):
        """
        When given the advantage URL,
        we should return a 200 status code

        When logged in, we should still get a 200 status code
        """
        self.assertEqual(self.client.get("/advantage").status_code, 200)

        with self.client.session_transaction() as s:
            s["openid"] = {
                "fullname": "Joe Bloggs",
                "email": "hello@example.com",
            }
            s["authentication_token"] = "test_token"

        self.assertEqual(self.client.get("/advantage").status_code, 200)

    def test_ceph(self):
        """
        When given the ceph docs URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/ceph").status_code, 200)

    def test_ceph_docs(self):
        """
        When given the ceph docs URL,
        we should return a 200 status code
        """

        self.assertEqual(self.client.get("/ceph/docs").status_code, 200)

    def test_not_found(self):
        """
        When given a non-existent URL,
        we should return a 404 status code
        """

        self.assertEqual(self.client.get("/not-found-url").status_code, 404)

    def test_engage_index(self):
        """
        When given a /engage URL,
        we should return a 200 status code
        This also tests that discourse module
        for engage pages work
        """

        self.assertEqual(self.client.get("/engage").status_code, 200)


if __name__ == "__main__":
    unittest.main()
