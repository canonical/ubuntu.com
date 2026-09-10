import re
import unittest
from html.parser import HTMLParser

from tests.helpers import ALLOWED_HIDDEN_FIELDS, get_marketo_template_files


class TestMarketoTemplateHiddenFields(unittest.TestCase):
    def test_no_unexpected_hidden_fields(self):
        """
        Test that no unexpected hidden fields are present in Marketo form
        templates. All hidden field names must be in ALLOWED_HIDDEN_FIELDS.
        Does not require Marketo API credentials.
        """

        class HiddenFieldCollector(HTMLParser):
            def __init__(self):
                super().__init__()
                self.hidden_fields = []

            def handle_starttag(self, tag, attrs):
                if tag == "input":
                    attrs_dict = dict(attrs)
                    if attrs_dict.get("type", "").lower() == "hidden":
                        name = attrs_dict.get("name", "")
                        # Skip Jinja template expressions
                        if name and not re.match(r"^\s*\{", name):
                            self.hidden_fields.append(name.lower())

        template_files = get_marketo_template_files()
        self.assertGreater(
            len(template_files),
            0,
            "No Marketo template files were found",
        )
        for template_path in template_files:
            collector = HiddenFieldCollector()
            collector.feed(template_path.read_text())
            for field_name in collector.hidden_fields:
                self.assertIn(
                    field_name,
                    ALLOWED_HIDDEN_FIELDS,
                    f"Unexpected hidden field '{field_name}' found in "
                    f"{template_path}. Add it to ALLOWED_HIDDEN_FIELDS in "
                    f"tests/helpers.py if it is intentional.",
                )


if __name__ == "__main__":
    unittest.main()
