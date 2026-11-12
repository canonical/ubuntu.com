from unittest import TestCase

from webapp.security.helpers import (
    get_cvss_entries,
    get_cvss_severity,
    get_headline_cvss,
)


class TestCvssEntries(TestCase):
    def test_sources_are_returned_with_their_source(self):
        metric = {
            "cvssV3": {"baseScore": 7.0},
            "sources": [
                {"source": "nvd", "cvssV3": {"baseScore": 7.0}},
                {"source": "ubuntu", "cvssV3": {"baseScore": 5.5}},
            ],
        }

        entries = get_cvss_entries(metric, "cvssV3")

        self.assertEqual(
            [(e["source"], e["cvss"]["baseScore"]) for e in entries],
            [("nvd", 7.0), ("ubuntu", 5.5)],
        )

    def test_falls_back_to_legacy_score_without_source(self):
        metric = {"cvssV4": {"baseScore": 8.2}}

        self.assertEqual(
            get_cvss_entries(metric, "cvssV4"),
            [
                {
                    "source": None,
                    "cvss": {"baseScore": 8.2},
                    "severity": "HIGH",
                }
            ],
        )

    def test_sent_severity_is_preferred_over_the_calculated_one(self):
        metric = {
            "sources": [
                {
                    "source": "nvd",
                    "cvssV3": {"baseScore": 6.5, "baseSeverity": "MEDIUM"},
                }
            ]
        }

        self.assertEqual(
            get_cvss_entries(metric, "cvssV3")[0]["severity"], "MEDIUM"
        )

    def test_missing_or_null_metric_has_no_entries(self):
        self.assertEqual(get_cvss_entries(None, "cvssV3"), [])
        self.assertEqual(get_cvss_entries({"cvssV4": None}, "cvssV4"), [])


class TestHeadlineCvss(TestCase):
    def test_headline_is_used_as_sent(self):
        cve = {
            "cvss3": 9.1,
            "headline_cvss": {
                "version": "4.0",
                "source": "ubuntu",
                "baseScore": 8.9,
                "baseSeverity": "HIGH",
            },
        }

        self.assertEqual(
            get_headline_cvss(cve, []),
            {
                "version": "4.0",
                "source": "ubuntu",
                "baseScore": 8.9,
                "baseSeverity": "HIGH",
            },
        )

    def test_falls_back_to_legacy_v3_score(self):
        entries = [{"source": None, "cvss": {"baseScore": 9.1}}]

        headline = get_headline_cvss({}, entries)

        self.assertEqual(headline["version"], "3")
        self.assertEqual(headline["baseScore"], 9.1)
        self.assertEqual(headline["baseSeverity"], "CRITICAL")

    def test_falls_back_to_top_level_cvss3(self):
        headline = get_headline_cvss({"cvss3": 5.0}, [])

        self.assertEqual(headline["baseScore"], 5.0)
        self.assertEqual(headline["baseSeverity"], "MEDIUM")

    def test_no_score_means_no_headline(self):
        self.assertIsNone(get_headline_cvss({}, []))

    def test_severity_bands(self):
        self.assertEqual(get_cvss_severity(0), "NONE")
        self.assertEqual(get_cvss_severity(3.9), "LOW")
        self.assertEqual(get_cvss_severity(6.9), "MEDIUM")
        self.assertEqual(get_cvss_severity(8.9), "HIGH")
        self.assertEqual(get_cvss_severity(10), "CRITICAL")
