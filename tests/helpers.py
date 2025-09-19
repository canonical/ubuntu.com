import unittest
import talisker.requests
import json
import re
from requests import Session
from pathlib import Path
from bs4 import BeautifulSoup

from webapp.marketo import MarketoAPI
from canonicalwebteam.flask_base.env import get_flask_env


class MarketoFormTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Fields that are allowed in payload
        cls.SET_FIELDS = set(
            {
                "firstname",
                "lastname",
                "email",
                "company",
                "title",
                "country",
                "phone",
                "comments_from_lead__c",
                "facebook_click_id__c",
                "gclid__c",
                "utm_content",
                "utm_term",
                "utm_medium",
                "utm_source",
                "utm_campaign",
                "formid",
                "returnurl",
                "consent_to_processing__c",
                "canonicalupdatesoptin",
            }
        )

        marketo_session = Session()
        talisker.requests.configure(marketo_session)
        cls.marketo_api = MarketoAPI(
            get_flask_env("MARKETO_API_URL"),
            get_flask_env("MARKETO_API_CLIENT"),
            get_flask_env("MARKETO_API_SECRET"),
            marketo_session,
        )
        cls.marketo_api._authenticate()

    def _process_form_fields(self, check_form, field_id, fields):
        """
        Helper function to process form fields for checking.
        """
        field_id = field_id.lower()

        if check_form == "marketo":
            if field_id == "utm_content":
                field_id = "utmcontent"

            marketo_field_ids = [f.get("id", "").lower() for f in fields]
            return field_id, marketo_field_ids

        elif check_form == "form-data":
            if field_id not in self.SET_FIELDS:
                form_field_ids = [f.get("id", "").lower() for f in fields]
                return field_id, form_field_ids
            # Skip checking fields that are in SET_FIELDS
            else:
                return None, None
        else:
            self.fail(f"Unknown check_form: {check_form}")

    def _get_marketo_fields(self, form_id):
        """
        Helper function to get Marketo fields for a form ID.
        """
        marketo_response = self.marketo_api.get_form_fields(form_id)
        self.assertEqual(marketo_response.status_code, 200)
        self.assertIsNotNone(
            marketo_response,
            f"Marketo response should not be None for form ID {form_id}",
        )
        return marketo_response.json().get("result", [])

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
        Helper function to get static contact us form files recursively.
        """
        response = self.client.get("/sitemap_parser")
        sitemap = json.loads(response.data)
        results = []

        def collect(node):
            name = node.get("name")
            if name and name != "/contact-us" and name.endswith("/contact-us"):
                results.append(name)
            for child in node.get("children", []):
                collect(child)

        collect(sitemap)
        return results

    def _get_contact_us_template_fields(self):
        """
        Helper function to get contact us template files and their fields.
        Fields are either:
        - "processed": not in payload individually but as Comments_from_lead__c
        - "unprocessed": in payload individually
        """
        # Get the template files: /templates/shared/*-contact-us.html
        template_files = [
            f
            for f in Path("templates/shared").rglob("*contact-us-form.html")
            if "templates/tests" not in str(f)
        ]

        template_fields = {}
        for template in template_files:
            # Append /shared/ to template name to match include pattern
            # e.g {% include "shared/_default-contact-us-form.html" %}
            template_name = "shared/" + str(template.name)
            template_fields[template_name] = self._get_fields_from_file(
                template
            )

        return template_fields

    def _get_fields_from_file(self, template):
        """
        Helper function to get fields from a template file.
        Returns a dict with:
        - processed: set of fields that are processed
          (in Comments_from_lead__c)
        - unprocessed: set of fields that are unprocessed
          (in payload individually)
        - formId: formId of the form
        """
        with open(template, "r") as f:
            soup = BeautifulSoup(f, "html.parser")

            processed_fields = soup.find_all(class_="js-formfield")
            # Create a set of processed_fields that have input
            # with name attributes
            processed_field_names = set()
            for field in processed_fields:
                input_tag = field.find("input", attrs={"name": True})
                if input_tag:
                    processed_field_names.add(input_tag["name"].lower())

            # Get formid from form tag
            form_id_tag = soup.find("input", attrs={"name": "formid"})
            # Check that formid value is numerical
            form_id = None
            if form_id_tag and "value" in form_id_tag.attrs:
                form_id_value = form_id_tag["value"]
                if form_id_value.isdigit():
                    form_id = form_id_value

            # Create a set of input fields that have name attributes and
            # are not in processed_field_names
            input_fields = soup.find_all(
                ["input", "textarea"], attrs={"name": True}
            )
            input_field_names = set(
                input_field["name"].lower() for input_field in input_fields
            )

            # Add "country" to input_field_names if there is an import
            # {% include "shared/forms/_country.html" %}
            if soup.find(
                string=re.compile(
                    r'{%\s*include\s*"shared/forms/_country.html"\s*%}'
                )
            ):
                input_field_names.add("country")

            # Discard fields that are not submitted to Marketo
            # note: preferredlanguage is submitted to engagement form
            # not individual forms
            discard_fields = {
                "name",
                "website",
                "formid",
                "returnurl",
                "preferredlanguage",
            }
            unprocessed_field_names = (
                input_field_names - processed_field_names - discard_fields
            )

            return {
                "processed": processed_field_names,
                "unprocessed": unprocessed_field_names,
                "formId": form_id,
            }

    def _extract_formid_from_template(self, template_path):
        """
        Helper function to extract formid and form template from a file.
        """
        with open(template_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Regex to find formid in {% with ... formid="xxxx" ... %}
        matches = re.findall(r'formid\s*=\s*"(\d+)"', content)

        # Regex to find included template in {% include "template-name" %}
        include_match = re.search(r'{%\s*include\s*"([^"]+)"\s*%}', content)
        included_template = include_match.group(1) if include_match else None

        # Store as tuple (included_template, formid)
        # If the tuple pair already exists, do not add it again
        unique_formid_template = set()
        for formid in matches:
            unique_formid_template.add((included_template, formid))

        return list(unique_formid_template)

    def _check_marketo_and_form_fields(
        self, form_id, marketo_fields, form_fields, template_path
    ):
        """
        Helper function to check form fields and marketo fields
        against each other.
        """
        # Check mkto expected fields are in unprocessed
        for field in marketo_fields:
            id = field.get("id").lower()
            required = field.get("required")
            if required:
                self.assertIn(
                    id,
                    form_fields["unprocessed"],
                    f"Required field {id} is not in unprocessed fields "
                    f"for template {template_path} form ID {form_id}. ",
                )

        # Check that unprocessed fields are in mkto fields
        for field in form_fields["unprocessed"]:
            clean_field_id, marketo_field_ids = self._process_form_fields(
                "marketo", field, marketo_fields
            )

            self.assertIn(
                clean_field_id,
                marketo_field_ids,
                f"Field {clean_field_id} is not present in "
                f"Marketo fields "
                f"for form {template_path} ID {form_id}",
            )
