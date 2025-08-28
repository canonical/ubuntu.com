import unittest
import talisker.requests
import json
from requests import Session
from pathlib import Path

import logging

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

        changed_forms = get_flask_env("CHANGED_FORMS").strip().split()

        if changed_forms:
            logging.info(f"Changed forms: {changed_forms}")
            self.form_files = changed_forms
        else:
            logging.info("No form files")
            self.form_files = [
                f
                for f in Path("templates").rglob("form-data.json")
                if "templates/tests" not in str(f)
            ]

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
        self.assertIsNotNone(self.marketo_api.token)

    def test_forms_with_marketo(self):
        for form in self.form_files:
            self._check_form_with_marketo(form)

    def _check_form_with_marketo(self, form_path):
        # Function to check form fields and Marketo fields against one another
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


if __name__ == "__main__":
    unittest.main()
