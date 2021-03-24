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

    def test_certification_home(self):
        response = self.client.get("/certification")
        self.assertEqual(response.status_code, 200)

    def test_search_results(self):
        response = self.client.get(
            "/certification?text=lenovo&form=Desktop&release=\
            20.04+LTS&vendors=Lenovo"
        )
        self.assertEqual(response.status_code, 200)
