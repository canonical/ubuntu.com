from urllib.parse import quote_plus

# Packages
from flask import template_rendered
from vcr_unittest import VCRTestCase
import requests

# Local
from webapp.app import app


def captured_templates(app, recorded, **extra):
    def record(sender, template, context):
        recorded.append((template, context))

    return template_rendered.connected_to(record, app)


class TestCube(VCRTestCase):
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

    def _test_microcerts_content(self, content):
        """
        Check content of microcerts listing
        """
        expected_module = {
            "course-v1:CUBE+admintasks+2020": "enrolled",
            "course-v1:CUBE+commands+2020": "not-enrolled",
            "course-v1:CUBE+devices+2020": "not-enrolled",
            "course-v1:CUBE+juju+2020": "enrolled",
            "course-v1:CUBE+kernel+2020": "not-enrolled",
            "course-v1:CUBE+maas+2020": "enrolled",
            "course-v1:CUBE+microk8s+2020": "enrolled",
            "course-v1:CUBE+networking+2020": "not-enrolled",
            "course-v1:CUBE+package+2020": "passed",
            "course-v1:CUBE+security+2020": "not-enrolled",
            "course-v1:CUBE+shellscript+2020": "not-enrolled",
            "course-v1:CUBE+storage+2020": "not-enrolled",
            "course-v1:CUBE+sysarch+2020": "enrolled",
            "course-v1:CUBE+systemd+2020": "not-enrolled",
            "course-v1:CUBE+virtualisation+2020": "not-enrolled",
        }

        for module in content["modules"]:
            self.assertGreater(len(module["topics"]), 0)
            self.assertEqual(module["status"], expected_module[module["id"]])
            self.assertTrue(
                module["take_url"].endswith(
                    quote_plus(
                        f"{module['id']}/courseware/2020/start/?child=first"
                    )
                )
            )

    def test_microcerts_json(self):
        with app.test_request_context():
            with self.client.session_transaction() as session:
                session["authentication_token"] = "auth-token"
                session["openid"] = {
                    "fullname": "Cube Engineer",
                    "email": "cube@canonical.com",
                }
                headers = {
                    "Content-type": "application/json",
                    "Accept": "application/json",
                }
                cookie = {"session": "session-key"}

                response = requests.get(
                    "http://localhost:8001/cube/microcerts.json"
                    "?test_backend=true",
                    headers=headers,
                    cookies=cookie,
                )
                self.assertEqual(response.status_code, 200)
                content = response.json()
                self._test_microcerts_content(content)

    def test_study_login_required(self):
        response = self.client.get("/cube/study")
        self.assertEqual(response.status_code, 302)
