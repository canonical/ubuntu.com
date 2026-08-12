import unittest

from webapp.marketo_stats.aggregate import (
    SubmissionRow,
    classify_site,
    normalise_referrer,
    row_from_activity,
)


class TestNormaliseReferrer(unittest.TestCase):
    def test_strips_query_and_fragment(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/core?utm_source=x#f"),
            "https://ubuntu.com/core",
        )

    def test_lowercases_host_but_preserves_path_case(self):
        self.assertEqual(
            normalise_referrer("https://Ubuntu.COM/Core/Docs"),
            "https://ubuntu.com/Core/Docs",
        )

    def test_strips_trailing_slash_except_at_root(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/core/"),
            "https://ubuntu.com/core",
        )
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/"),
            "https://ubuntu.com/",
        )

    def test_empty_path_becomes_root(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com"),
            "https://ubuntu.com/",
        )

    def test_returns_empty_string_for_junk(self):
        self.assertEqual(normalise_referrer(""), "")
        self.assertEqual(normalise_referrer("not a url"), "")

    def test_returns_empty_string_for_malformed_ipv6(self):
        # Malformed IPv6 literals should not raise ValueError
        self.assertEqual(normalise_referrer("https://[::1"), "")
        self.assertEqual(normalise_referrer("https://[gg]/x"), "")
        self.assertEqual(normalise_referrer("//[bad"), "")


class TestClassifySite(unittest.TestCase):
    def test_recognises_ubuntu_and_canonical(self):
        self.assertEqual(
            classify_site("https://ubuntu.com/core"), "ubuntu.com"
        )
        self.assertEqual(
            classify_site("https://canonical.com/blog"), "canonical.com"
        )

    def test_recognises_subdomains(self):
        self.assertEqual(
            classify_site("https://discourse.ubuntu.com/t/1"), "ubuntu.com"
        )

    def test_does_not_match_lookalike_domains(self):
        # The bug this guards: endswith("ubuntu.com") would match these.
        self.assertEqual(classify_site("https://notubuntu.com/x"), "other")
        self.assertEqual(
            classify_site("https://ubuntu.com.evil.net/x"), "other"
        )

    def test_unknown_and_junk_are_other(self):
        self.assertEqual(classify_site("https://example.com"), "other")
        self.assertEqual(classify_site(""), "other")

    def test_returns_other_for_malformed_ipv6(self):
        # Malformed IPv6 literals should not raise ValueError
        self.assertEqual(classify_site("https://[::1"), "other")
        self.assertEqual(classify_site("https://[gg]/x"), "other")
        self.assertEqual(classify_site("//[bad"), "other")


def build_blob(fields):
    """Serialise a flat dict the way Marketo does, for fixtures."""
    parts = []
    for key, value in fields.items():
        parts.append(
            's:%d:"%s";s:%d:"%s";'
            % (
                len(key.encode("utf-8")),
                key,
                len(str(value).encode("utf-8")),
                value,
            )
        )
    return "a:%d:{%s}" % (len(fields), "".join(parts))


def build_activity(form_id=4198, date="2026-08-05T15:42:05Z", **fields):
    return {
        "activityDate": date,
        "activityTypeId": 2,
        "primaryAttributeValueId": form_id,
        "primaryAttributeValue": "Global_marketing_optin.Lead enrichment",
        "attributes": [
            {"name": "Client IP Address", "value": "203.0.113.4"},
            {"name": "Form Fields", "value": build_blob(fields)},
        ],
    }


class TestRowFromActivity(unittest.TestCase):
    def test_extracts_a_row_from_an_enrichment_record(self):
        activity = build_activity(
            original_form_id="5883",
            acquisition_url="https://ubuntu.com/kubernetes?utm_source=x",
        )
        self.assertEqual(
            row_from_activity(activity),
            SubmissionRow(
                date="2026-08-05",
                form_id="5883",
                referrer="https://ubuntu.com/kubernetes",
                site="ubuntu.com",
            ),
        )

    def test_classifies_canonical_com_submissions(self):
        activity = build_activity(
            original_form_id="1240",
            acquisition_url="https://canonical.com/contact-us",
        )
        self.assertEqual(row_from_activity(activity).site, "canonical.com")

    def test_ignores_records_for_other_forms(self):
        activity = build_activity(
            form_id=3485,
            original_form_id="3485",
            acquisition_url="https://ubuntu.com/x",
        )
        self.assertIsNone(row_from_activity(activity))

    def test_returns_none_when_form_fields_missing(self):
        activity = build_activity()
        activity["attributes"] = [
            {"name": "Client IP Address", "value": "203.0.113.4"}
        ]
        self.assertIsNone(row_from_activity(activity))

    def test_returns_none_on_unparseable_blob(self):
        activity = build_activity()
        activity["attributes"] = [
            {"name": "Form Fields", "value": "corrupted"}
        ]
        self.assertIsNone(row_from_activity(activity))

    def test_missing_original_form_id_becomes_unknown(self):
        activity = build_activity(acquisition_url="https://ubuntu.com/x")
        self.assertEqual(row_from_activity(activity).form_id, "unknown")

    def test_row_carries_no_personal_data(self):
        # The blob holds names and emails. The row must not.
        activity = build_activity(
            original_form_id="5883",
            acquisition_url="https://ubuntu.com/x",
            Email="person@example.com",
            FirstName="Ada",
        )
        row = row_from_activity(activity)
        self.assertNotIn("person@example.com", str(row))
        self.assertNotIn("Ada", str(row))


if __name__ == "__main__":
    unittest.main()
