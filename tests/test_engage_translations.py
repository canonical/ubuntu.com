"""Tests for ENGAGE_UI_TRANSLATIONS thank-you keys.

Covers:
  • Every thank_you_* key has at least an "en" entry.
  • All language entries within a key contain the same {placeholders}
    as the English entry (catches a translator dropping {resource_name}).
"""

import re
from unittest import TestCase

from webapp.constants import ENGAGE_UI_TRANSLATIONS


PLACEHOLDER_RE = re.compile(r"\{(\w+)\}")


class TestThankYouTranslations(TestCase):
    def _thank_you_keys(self):
        return [
            k for k in ENGAGE_UI_TRANSLATIONS if k.startswith("thank_you_")
        ]

    def test_every_thank_you_key_has_english(self):
        for key in self._thank_you_keys():
            self.assertIn(
                "en",
                ENGAGE_UI_TRANSLATIONS[key],
                f"thank-you key {key!r} missing English entry",
            )

    def test_placeholders_match_english_per_key(self):
        for key in self._thank_you_keys():
            entries = ENGAGE_UI_TRANSLATIONS[key]
            english_placeholders = set(PLACEHOLDER_RE.findall(entries["en"]))
            for lang, text in entries.items():
                with self.subTest(key=key, lang=lang):
                    self.assertEqual(
                        set(PLACEHOLDER_RE.findall(text)),
                        english_placeholders,
                        f"{key}[{lang!r}] placeholders differ from English",
                    )

    def test_required_thank_you_keys_present(self):
        required = {
            "thank_you_page_title",
            "thank_you_heading",
            "thank_you_ready_to_download",
            "thank_you_email_sent",
            "thank_you_go_back",
            "thank_you_contact_us",
            "thank_you_download",
            "thank_you_additional_resources",
        }
        self.assertLessEqual(
            required,
            set(ENGAGE_UI_TRANSLATIONS.keys()),
            "Missing required thank-you translation keys",
        )
