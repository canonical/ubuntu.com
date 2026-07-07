import unittest
import os
import json
import sentry_sdk
from unittest.mock import Mock, patch

from webapp.app import app
from tests.helpers import MarketoFormTestCase


class TestFormGenerator(MarketoFormTestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """
        super().setUp()
        app.testing = True
        self.client = app.test_client()
        self.form_gen_files = self._get_form_gen_files()

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

    def test_form_gen_files_with_marketo(self):
        """
        Test form generator files against Marketo fields.
        """
        for form_path in self.form_gen_files:
            with open(form_path, "r") as f:
                forms = json.load(f).get("form", {})
                self.assertIsNotNone(
                    forms,
                    f"Form data could not be loaded from {form_path}",
                )

            # form-data.json may have multiple forms
            for form_data in forms.values():
                form_data_obj = form_data.get("formData", {})
                form_id = form_data_obj.get("formId")

                self.assertIsNotNone(
                    form_id,
                    f"formId not found in form data for {form_path}",
                )

                # Check that marketo form exists
                marketo_fields = self._get_marketo_fields(form_id)

                # Check that form fields match Marketo fields
                form_fields = form_data.get("fieldsets", [])
                for field in form_fields:
                    field_id = field.get("id")

                    # Check that individual fields are all expected
                    # in the Marketo fields
                    if field.get("noCommentsFromLead"):
                        if field_id != "about-you":
                            self.assertIsNotNone(
                                field_id,
                                f"Field ID is None for marketo "
                                f"fields in {form_path}",
                            )

                            clean_field_id, marketo_field_ids = (
                                self._process_form_fields(
                                    "marketo", field_id, marketo_fields
                                )
                            )
                            self.assertIn(
                                clean_field_id,
                                marketo_field_ids,
                                f"Field {clean_field_id} is not present in "
                                f"Marketo fields "
                                f"for form {form_path} ID {form_id}",
                            )
                        else:
                            # Check enrichment fields separately
                            contact_fields = field.get("fields", [])
                            for contact_field in contact_fields:
                                clean_field_id, marketo_field_ids = (
                                    self._process_form_fields(
                                        "marketo",
                                        contact_field.get("id"),
                                        marketo_fields,
                                    )
                                )
                                self.assertIn(
                                    clean_field_id,
                                    marketo_field_ids,
                                    f"Field {clean_field_id} is not present "
                                    f"in Marketo fields "
                                    f"for form {form_path} ID {form_id}",
                                )

                # Check that Marketo required fields are included in form
                for marketo_field in marketo_fields:
                    id = marketo_field.get("id")
                    required = marketo_field.get("required")
                    if required:
                        self.assertIsNotNone(
                            field_id,
                            f"Field ID is None for form-data.json "
                            f"fields in {form_path}",
                        )

                        clean_marketo_id, form_field_ids = (
                            self._process_form_fields(
                                "form-data", id, form_fields
                            )
                        )

                        if clean_marketo_id and form_field_ids:
                            self.assertIn(
                                clean_marketo_id,
                                form_field_ids,
                                f"Field {clean_marketo_id} is not present in "
                                f"form-data fields"
                                f" for form {form_path}",
                            )


class TestStaticContactForms(MarketoFormTestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """
        super().setUp()
        app.testing = True
        self.client = app.test_client()

        self.contact_us_files = self._get_contact_us_files()
        self.contact_us_template_fields = (
            self._get_contact_us_template_fields()
        )

    def test_contact_us_files(self):
        """
        Test contact us files are discovered
        """
        self.assertGreater(len(self.contact_us_files), 0)

    def test_contact_us_template_fields(self):
        """
        Test contact us template fields are discovered
        """
        self.assertGreater(len(self.contact_us_template_fields), 0)
        for template in self.contact_us_template_fields:
            processed = self.contact_us_template_fields[template]["processed"]
            unprocessed = self.contact_us_template_fields[template][
                "unprocessed"
            ]
            for field in processed:
                self.assertNotIn(field, self.SET_FIELDS)
            for field in unprocessed:
                self.assertIn(field, self.SET_FIELDS)

    def test_contact_us_files_with_marketo(self):
        """
        Test contact us files with Marketo integration
        """
        for file in self.contact_us_files:
            template_path = os.getcwd() + "/templates" + file + ".html"
            fields = self._get_fields_from_file(template_path)
            # Check if not using shared template, process file directly
            if fields["processed"] and fields["unprocessed"]:
                form_id = fields.get("formId")
                if form_id:
                    marketo_fields = self._get_marketo_fields(form_id)

                    self._check_marketo_and_form_fields(
                        form_id, marketo_fields, fields, template_path
                    )

            else:
                # Get shared template and form_id
                extracted = self._extract_formid_from_template(template_path)

                for template, form_id in extracted:
                    # Check if template is in contact_us_template_fields
                    if template in self.contact_us_template_fields:
                        fields = self.contact_us_template_fields[template]
                        marketo_fields = self._get_marketo_fields(form_id)

                        self._check_marketo_and_form_fields(
                            form_id, marketo_fields, fields, template_path
                        )
                    else:
                        self.fail(
                            "Template not found in "
                            "contact_us_template_fields: " + template,
                        )


class TestMarketoSubmit(unittest.TestCase):
    """
    Tests for market_submit()
    Two form submissions (payload + enrichment) have to go through
    to be considered successful and avoid a Sentry alert.

    The Marketo API and Sentry reporting are mocked, so these tests do not
    require live Marketo credentials.
    """

    def setUp(self):
        app.testing = True
        if not app.config.get("SECRET_KEY"):
            app.config["SECRET_KEY"] = "test-secret-key"
        self.client = app.test_client()

    @staticmethod
    def _mock_response(json_body):
        """Build a fake requests.Response whose .json() returns json_body."""
        response = Mock()
        response.json.return_value = json_body
        return response

    @classmethod
    def setUpClass(cls):
        # Drop Sentry client so test alerts do not get sent to Sentry
        cls._sentry_client = sentry_sdk.get_client()
        sentry_sdk.get_global_scope().set_client(None)

    @classmethod
    def tearDownClass(cls):
        # Reinstantiate Sentry client
        sentry_sdk.get_global_scope().set_client(cls._sentry_client)

    def _submit(self, payload_response, enrichment_response):
        """
        POST a minimal valid form to /marketo/submit with the two Marketo
        API calls (payload first, then enrichment) mocked to return the given
        responses. Returns (http_response, mock_sentry_report).
        """
        with patch(
            "webapp.views.marketo_api.submit_form"
        ) as mock_submit, patch(
            "webapp.views.marketo_sentry_report"
        ) as mock_sentry:
            mock_submit.side_effect = [
                self._mock_response(payload_response),
                self._mock_response(enrichment_response),
            ]
            http_response = self.client.post(
                "/marketo/submit",
                data={
                    "formid": "1234",
                    "email": "test@example.com",
                    "firstName": "Test",
                },
            )
        return http_response, mock_sentry

    @staticmethod
    def _sentry_messages(mock_sentry):
        """
        Return the list of human-readable messages passed to
        marketo_sentry_report (the first positional argument of each call).
        """
        return [
            call.args[0] if call.args else ""
            for call in mock_sentry.call_args_list
        ]

    def test_both_submissions_succeed_no_alert(self):
        """
        When both the payload and enrichment submissions succeed, no Sentry
        alert is raised and the user is redirected to the thank-you page.
        """
        http_response, mock_sentry = self._submit(
            payload_response={
                "success": True,
                "result": [{"status": "created"}],
            },
            enrichment_response={"success": True},
        )
        mock_sentry.assert_not_called()
        self.assertEqual(http_response.status_code, 302)
        self.assertIn("/thank-you", http_response.headers["Location"])

    def test_both_submissions_fail_single_alert(self):
        """
        When both submissions fail (payload skipped and enrichment
        unsuccessful), a single combined-failure Sentry alert is raised.
        """
        http_response, mock_sentry = self._submit(
            payload_response={
                "success": True,
                "result": [{"status": "skipped"}],
            },
            enrichment_response={"success": False},
        )
        self.assertEqual(mock_sentry.call_count, 1)
        self.assertEqual(
            self._sentry_messages(mock_sentry),
            ["Marketo form 1234 and enrichment payload failed to submit"],
        )
        self.assertEqual(http_response.status_code, 302)
        self.assertIn(
            "contact-form-fail", http_response.headers["Location"]
        )

    def test_payload_succeeds_enrichment_fails_single_alert(self):
        """
        When only the payload submission goes through, exactly one Sentry
        alert is raised, identifying the enrichment submission as the failure.
        """
        http_response, mock_sentry = self._submit(
            payload_response={
                "success": True,
                "result": [{"status": "created"}],
            },
            enrichment_response={"success": False},
        )
        self.assertEqual(mock_sentry.call_count, 1)
        self.assertEqual(
            self._sentry_messages(mock_sentry),
            ["Marketo form 1234 enrichment payload failed"],
        )
        self.assertEqual(http_response.status_code, 302)
        self.assertIn(
            "contact-form-fail", http_response.headers["Location"]
        )

    def test_enrichment_succeeds_payload_skipped_single_alert(self):
        """
        When only the enrichment submission goes through (the payload was
        skipped), exactly one Sentry alert is raised, identifying the payload
        submission as the failure.
        """
        http_response, mock_sentry = self._submit(
            payload_response={
                "success": True,
                "result": [{"status": "skipped"}],
            },
            enrichment_response={"success": True},
        )
        self.assertEqual(mock_sentry.call_count, 1)
        self.assertEqual(
            self._sentry_messages(mock_sentry),
            ["Marketo form 1234 payload failed to submit"],
        )
        self.assertEqual(http_response.status_code, 302)
        self.assertIn(
            "contact-form-fail", http_response.headers["Location"]
        )


if __name__ == "__main__":
    unittest.main()
