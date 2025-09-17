import unittest
import os
import json

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
            # self._check_form_gen_with_marketo(form_path)

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
                marketo_fields = self._get_marketo_fields(form_id)

                # Check that form fields match Marketo fields
                form_fields = form_data.get("fieldsets", [])
                for field in form_fields:
                    field_id = field.get("id")

                    # Check that individual fields are all expected
                    # in the Marketo fields
                    if field.get("noCommentsFromLead"):
                        if field_id != "about-you":
                            self._check_form_fields(
                                field_id,
                                form_id,
                                "marketo",
                                marketo_fields,
                                form_fields,
                                form_path,
                            )
                        else:
                            # Check enrichment fields separately
                            contact_fields = field.get("fields", [])
                            for contact_field in contact_fields:
                                self._check_form_fields(
                                    contact_field.get("id"),
                                    form_id,
                                    "marketo",
                                    marketo_fields,
                                    form_fields,
                                    form_path,
                                )

                # Check that Marketo required fields are included in form
                for marketo_field in marketo_fields:
                    id = marketo_field.get("id")
                    required = marketo_field.get("required")
                    if required:
                        self._check_form_fields(
                            id,
                            form_id,
                            "form-data",
                            marketo_fields,
                            form_fields,
                            form_path,
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
                    # TODO: Uncomment when resolved
                    # https://warthogs.atlassian.net/browse/WD-26789
                    # else:
                    #     self.fail(
                    #         "Template not found in "
                    #         "contact_us_template_fields: " + template,
                    #     )


if __name__ == "__main__":
    unittest.main()
