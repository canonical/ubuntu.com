# Packages
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestCertification(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don't record auth parameters
        """
        return {
            "decode_compressed_response": True,
            "filter_headers": ["Authorization", "Cookie"],
        }

    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_home(self):
        response = self.client.get("/certified")
        self.assertEqual(response.status_code, 200)

    def test_search_results(self):
        response = self.client.get(
            "/certified?q=xps&category=Laptop&category=Desktop&vendor=Dell"
        )
        self.assertEqual(response.status_code, 200)

    def test_model_details(self):
        response = self.client.get("/certified/201807-26311")
        self.assertEqual(response.status_code, 200)

    def test_hardware_details(self):
        response = self.client.get("/certified/201906-27091/18.04%20LTS")
        self.assertEqual(response.status_code, 200)

    def test_component_details(self):
        response = self.client.get("/certified/component/682")
        self.assertEqual(response.status_code, 200)

    def test_vendor_pages(self):
        response = self.client.get("/certified/vendors/HP")
        self.assertEqual(response.status_code, 200)
