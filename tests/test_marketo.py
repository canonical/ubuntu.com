import unittest
import talisker.requests
import json
from requests import Session
from pathlib import Path

from canonicalwebteam.flask_base.env import get_flask_env

from webapp.app import app
from webapp.marketo import MarketoAPI

# Fields that are already hardcoded into form-fields.html
SET_FIELDS = set(
    {
        "firstname",
        "lastname",
        "email",
        "company",
        "title",
        "country",
        "phone",
        "comments_from_lead__c",
    }
)


class TestMarketo(unittest.TestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """
        app.testing = True
        self.client = app.test_client()

        # Get all form files
        self.form_gen_files = self._get_form_gen_files()
        self.contact_us_files = self._get_contact_us_files()
        self.modal_files = self._get_modal_files()

        marketo_session = Session()
        talisker.requests.configure(marketo_session)
        self.marketo_api = MarketoAPI(
            get_flask_env("MARKETO_API_URL"),
            get_flask_env("MARKETO_API_CLIENT"),
            get_flask_env("MARKETO_API_SECRET"),
            marketo_session,
        )
        self.marketo_api._authenticate()
        return super().setUp()

    def test_marketo_api(self):
        """
        Test Marketo API authentication
        """
        self.assertIsNotNone(self.marketo_api.token)

    def test_form_gen_files(self):
        """
        Test form generator files are discovered
        """
        self.assertGreater(len(self.form_gen_files), 0)

    def test_contact_us_files(self):
        """
        Test contact us files are discovered
        """
        self.assertGreater(len(self.contact_us_files), 0)

    def test_modal_files(self):
        """
        Test modal files are discovered
        """
        self.assertGreater(len(self.modal_files), 0)

    def test_form_gen_files_with_marketo(self):
        """
        Test form generator files against Marketo fields.
        """
        for form in self.form_gen_files:
            self._check_form_gen_with_marketo(form)

    # Helper methods
    def _get_form_gen_files(self):
        """
        Helper function to get form generator files.
        """
        return [
            f
            for f in Path("templates").rglob("form-data.json")
            if "templates/tests" not in str(f)
        ]

    def _get_contact_us_files(self):
        """
        Helper function to get static contact us form files.
        """
        response = self.client.get("/sitemap_parser")
        sitemap = json.loads(response.data)
        return self._discover_contact_us_pages(sitemap)

    def _get_modal_files(self):
        """
        Helper function to get shared interactive modal files.
        """
        return [
            f
            for f in Path("templates").rglob("*.html")
            if "shared/forms/interactive" in str(f)
            and "templates/tests" not in str(f)
        ]

    def _check_form_gen_with_marketo(self, form_path):
        """
        Helper function to check form generator files against Marketo fields.
        """

        def _check_form_fields(field_id, check_form):
            self.assertIsNotNone(
                field_id,
                f"Field ID is None for {check_form} fields in {form_path}",
            )

            field_id = field_id.lower()
            if check_form == "marketo":
                marketo_field_ids = [
                    f.get("id", "").lower() for f in marketo_fields
                ]
                self.assertIn(
                    field_id,
                    marketo_field_ids,
                    f"Field {field_id} is not present in "
                    f"{check_form} fields"
                    f" for form {form_path}",
                )

            elif check_form == "form-data":
                if field_id not in SET_FIELDS:
                    form_field_ids = [
                        f.get("id", "").lower() for f in form_fields
                    ]
                    self.assertIn(
                        field_id,
                        form_field_ids,
                        f"Field {field_id} is not present in "
                        f"{check_form} fields"
                        f" for form {form_path}",
                    )

        with open(form_path, "r") as f:
            forms = json.load(f).get("form", {})
            self.assertIsNotNone(
                forms,
                f"Form data could not be loaded from {form_path}",
            )

        # form-data.json may have multiple forms
        for form_data in forms.values():
            form_id = form_data.get("formData").get("formId")

            # Check that marketo form exists
            marketo_response = self.marketo_api.get_form_fields(form_id)
            self.assertEqual(marketo_response.status_code, 200)
            self.assertIsNotNone(
                marketo_response,
                f"Marketo fields should not be None, form {form_path}",
            )
            marketo_fields = marketo_response.json().get("result", [])

            # Check that form fields match Marketo fields
            form_fields = form_data.get("fieldsets", [])
            for field in form_fields:
                field_id = field.get("id")

                # Check that individual fields are all expected
                # in the Marketo fields
                if field.get("noCommentsFromLead"):
                    if field_id != "about-you":
                        _check_form_fields(field_id, "marketo")
                    else:
                        # Check enrichment fields separately
                        contact_fields = field.get("fields", [])
                        for contact_field in contact_fields:
                            _check_form_fields(
                                contact_field.get("id"), "marketo"
                            )

            # Check that Marketo required fields are included in form
            for marketo_field in marketo_fields:
                id = marketo_field.get("id")
                required = marketo_field.get("required")
                if required:
                    _check_form_fields(id, "form-data")

    def _discover_contact_us_pages(self, sitemap):
        """
        Discover all /contact-us pages in the sitemap recursively.
        """
        results = []

        def collect(node):
            name = node.get("name")
            if name and name != "/contact-us" and name.endswith("/contact-us"):
                results.append(name)
            for child in node.get("children", []):
                collect(child)

        collect(sitemap)
        return results


if __name__ == "__main__":
    unittest.main()
