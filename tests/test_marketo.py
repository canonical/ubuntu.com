import unittest
import os
import json
import sentry_sdk
from unittest.mock import Mock, patch

from requests import Session

from webapp.app import app
from webapp.marketo import REQUEST_TIMEOUT, MarketoAPI, MarketoAPIError
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
    Tests for marketo_submit()
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
        self.assertIn("contact-form-fail", http_response.headers["Location"])

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
        self.assertIn("contact-form-fail", http_response.headers["Location"])

    def test_html_injection_attempt_blocked_without_marketo_call(self):
        """
        A submission containing HTML markup (detected structurally via
        nh3, regardless of the exact tag/attribute used) is never forwarded
        to Marketo. The requester is redirected back with a contact-form-
        fail flash message, and no Sentry alert is raised (this endpoint
        is public and can be hit by scanners repeatedly).
        """
        with patch(
            "webapp.views.marketo_api.submit_form"
        ) as mock_submit, patch(
            "webapp.views.marketo_sentry_report"
        ) as mock_sentry:
            http_response = self.client.post(
                "/marketo/submit",
                data={
                    "formid": "1234",
                    "email": "test@example.com",
                    "firstName": "Test",
                    "Comments_from_lead__c": "<svg onload=alert(1)>",
                },
            )
        mock_submit.assert_not_called()
        mock_sentry.assert_not_called()
        self.assertEqual(http_response.status_code, 302)
        self.assertIn("contact-form-fail", http_response.headers["Location"])

    def test_non_html_injection_attempt_blocked_without_marketo_call(self):
        """
        A submission containing a non-HTML injection signature (path
        traversal, command injection, scanner-domain fingerprint, etc.) is
        matched against the literal MARKETO_INJECTION_PATTERNS list and
        blocked the same way, since nh3 has no HTML to detect there.
        """
        with patch(
            "webapp.views.marketo_api.submit_form"
        ) as mock_submit, patch(
            "webapp.views.marketo_sentry_report"
        ) as mock_sentry:
            http_response = self.client.post(
                "/marketo/submit",
                data={
                    "formid": "1234",
                    "email": "test@example.com",
                    "firstName": "Test",
                    "Comments_from_lead__c": "../../../etc/passwd",
                },
            )
        mock_submit.assert_not_called()
        mock_sentry.assert_not_called()
        self.assertEqual(http_response.status_code, 302)
        self.assertIn("contact-form-fail", http_response.headers["Location"])

    def test_thankyoumessage_html_not_blocked(self):
        """
        ``thankyoumessage`` is a template-controlled, non user-typed field
        (listed in MARKETO_NON_LEAD_FIELDS) that legitimately contains HTML
        markup. Its markup must not be treated as an injection attempt, so
        the submission is still forwarded to Marketo and succeeds.
        """
        with patch(
            "webapp.views.marketo_api.submit_form"
        ) as mock_submit, patch(
            "webapp.views.marketo_sentry_report"
        ) as mock_sentry:
            mock_submit.side_effect = [
                self._mock_response(
                    {"success": True, "result": [{"status": "created"}]}
                ),
                self._mock_response({"success": True}),
            ]
            http_response = self.client.post(
                "/marketo/submit",
                data={
                    "formid": "1234",
                    "email": "test@example.com",
                    "firstName": "Test",
                    "thankyoumessage": (
                        "<p>Thanks for <strong>subscribing</strong>!</p>"
                    ),
                },
            )
        mock_submit.assert_called()
        mock_sentry.assert_not_called()
        self.assertEqual(http_response.status_code, 302)
        self.assertIn("/thank-you", http_response.headers["Location"])

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
        self.assertIn("contact-form-fail", http_response.headers["Location"])


class TestMarketoAPIClient(unittest.TestCase):
    """
    Tests for MarketoAPI, the client wrapping the Marketo REST API.
    The session is mocked, so no credentials or network access are needed.
    """

    @staticmethod
    def _api(token="token"):
        """Build a MarketoAPI with a mocked session, returning both."""
        session = Mock()
        api = MarketoAPI("https://marketo.test", "id", "secret", session)
        api.token = token
        return api, session

    @staticmethod
    def _mock_response(json_body=None, status_code=200, text=""):
        """
        Build a fake requests.Response. Passing no json_body makes .json()
        raise, as an HTML error page or empty body would.
        """
        response = Mock()
        response.status_code = status_code
        response.text = text
        if json_body is None:
            response.json.side_effect = ValueError("No JSON object")
        else:
            response.json.return_value = json_body
        return response

    def test_non_json_response_raises_marketo_error(self):
        """A gateway error page is reported as a MarketoAPIError."""
        api, session = self._api()
        session.request.return_value = self._mock_response(
            status_code=502, text="<html>Bad gateway</html>"
        )

        with self.assertRaises(MarketoAPIError) as error:
            api.submit_form({})

        self.assertIn("502", str(error.exception))
        self.assertIn("Bad gateway", str(error.exception))

    def test_missing_access_token_raises_marketo_error(self):
        """Rejected credentials report why, instead of a KeyError."""
        api, session = self._api(token=None)
        session.get.return_value = self._mock_response(
            {
                "error": "invalid_client",
                "error_description": "Bad client credentials",
            },
            status_code=401,
        )

        with self.assertRaises(MarketoAPIError) as error:
            api.submit_form({})

        self.assertIn("Bad client credentials", str(error.exception))

    def test_requests_are_sent_with_a_timeout(self):
        """A stalled connection cannot hold a worker open."""
        api, session = self._api()
        session.request.return_value = self._mock_response(
            {"success": True, "result": [{"status": "created"}]}
        )

        api.submit_form({})

        self.assertEqual(
            session.request.call_args.kwargs["timeout"], REQUEST_TIMEOUT
        )

    def test_expired_token_is_refreshed_and_the_call_replayed(self):
        """Error 602 triggers one re-authentication and a replay."""
        api, session = self._api()
        succeeded = self._mock_response(
            {"success": True, "result": [{"status": "created"}]}
        )
        session.request.side_effect = [
            self._mock_response({"errors": [{"code": "602"}]}),
            succeeded,
        ]
        session.get.return_value = self._mock_response(
            {"access_token": "fresh-token"}
        )

        self.assertIs(api.submit_form({}), succeeded)
        self.assertEqual(session.request.call_count, 2)
        self.assertEqual(api.token, "fresh-token")

    def test_throttled_call_is_replayed_after_backing_off(self):
        """The concurrency limit (615) is transient, so replay it."""
        api, session = self._api()
        throttled = self._mock_response({"errors": [{"code": "615"}]})
        succeeded = self._mock_response(
            {"success": True, "result": [{"status": "created"}]}
        )
        session.request.side_effect = [throttled, throttled, succeeded]

        with patch("webapp.marketo.time.sleep") as mock_sleep:
            self.assertIs(api.submit_form({}), succeeded)

        self.assertEqual(
            [call.args[0] for call in mock_sleep.call_args_list], [1, 3]
        )

    def test_persistent_throttling_returns_the_last_response(self):
        """
        When the rate limit (606) outlasts every backoff, the last response
        is handed back for the view to report to Sentry.
        """
        api, session = self._api()
        throttled = self._mock_response({"errors": [{"code": "606"}]})
        session.request.return_value = throttled

        with patch("webapp.marketo.time.sleep"):
            self.assertIs(api.submit_form({}), throttled)

        self.assertEqual(session.request.call_count, 3)

    def test_other_errors_are_returned_without_a_replay(self):
        """Errors that retrying cannot fix are handed straight back."""
        api, session = self._api()
        failed = self._mock_response(
            {"success": False, "errors": [{"code": "1003"}]}
        )
        session.request.return_value = failed

        self.assertIs(api.submit_form({}), failed)
        self.assertEqual(session.request.call_count, 1)

    def test_malformed_errors_are_returned_without_raising(self):
        """An unexpected errors shape does not break the client."""
        api, session = self._api()
        malformed = self._mock_response({"errors": "not-a-list"})
        session.request.return_value = malformed

        self.assertIs(api.submit_form({}), malformed)

    def test_server_errors_are_replayed_for_get_only(self):
        """
        A POST may already have created a lead, so only GET is replayed.
        """
        session = Session()
        MarketoAPI("https://marketo.test", "id", "secret", session)

        retries = session.get_adapter("https://marketo.test").max_retries

        self.assertEqual(retries.connect, 2)
        self.assertTrue(retries.is_retry("GET", 503))
        self.assertFalse(retries.is_retry("POST", 503))


if __name__ == "__main__":
    unittest.main()
