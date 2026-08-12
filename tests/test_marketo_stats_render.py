import csv
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from webapp.marketo_stats.aggregate import SubmissionRow
from webapp.marketo_stats.render import (
    CSV_HEADER,
    csv_rows,
    format_report,
    write_csv,
)

REPO_ROOT = Path(__file__).resolve().parent.parent

NON_ASCII_FORM_NAME = "Zürich — formulaire d'inscription"

# Runs in a child interpreter started under LC_ALL=C. Kept ASCII-only;
# the form name arrives as an escaped literal via ascii().
ASCII_LOCALE_CHILD = """
import sys
from webapp.marketo_stats.aggregate import SubmissionRow
from webapp.marketo_stats.render import csv_rows, write_csv

rows = [SubmissionRow("2026-08-05", "5883", "", "ubuntu.com")]
write_csv(sys.argv[1], csv_rows(rows, {"5883": %s}))
"""

ROWS = [
    SubmissionRow("2026-08-05", "5883", "https://ubuntu.com/a", "ubuntu.com"),
    SubmissionRow("2026-08-05", "5883", "https://ubuntu.com/a", "ubuntu.com"),
    SubmissionRow(
        "2026-08-06", "1240", "https://canonical.com/b", "canonical.com"
    ),
]

ACTIVITIES = [
    {
        "primaryAttributeValueId": 5883,
        "primaryAttributeValue": "Form: Microk8sconfinement",
    },
    {"primaryAttributeValueId": 4198},
]


class TestFormatReport(unittest.TestCase):
    def test_includes_all_three_sections(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertIn("Submissions per form per day", report)
        self.assertIn("Submissions per site", report)
        self.assertIn("Top referrer URLs", report)

    def test_shows_form_names_when_known(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertIn("Form: Microk8sconfinement", report)

    def test_warns_loudly_when_truncated(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=True)
        self.assertIn("INCOMPLETE", report)

    def test_no_warning_when_not_truncated(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertNotIn("INCOMPLETE", report)

    def test_handles_an_empty_window(self):
        report = format_report([], [], 10, truncated=False)
        self.assertIn("No submissions", report)

    def test_raw_totals_survive_an_empty_enrichment_result(self):
        # Enrichment dead while forms keep flowing is the most alarming
        # state this tool can detect. It must not render as a quiet
        # window: the evidence is the raw totals table.
        report = format_report([], ACTIVITIES, 10, truncated=False)
        self.assertIn("Marketo totals per form", report)
        self.assertIn("5883", report)
        self.assertIn("NO ENRICHMENT RECORDS AT ALL", report)

    def test_a_genuinely_quiet_window_reads_differently(self):
        report = format_report([], [], 10, truncated=False)
        self.assertNotIn("NO ENRICHMENT RECORDS AT ALL", report)

    def test_no_blind_warning_when_enrichment_produced_rows(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertNotIn("NO ENRICHMENT RECORDS AT ALL", report)

    def test_totals_caption_names_both_causes_of_a_gap(self):
        # raw_form_totals counts the form id across the whole Marketo
        # instance, including pages that never touch our app, so
        # attributing every gap to enrichment invents a failure rate.
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertIn("did not come through our sites", report)
        self.assertIn("enrichment call failed", report)

    def test_dates_are_labelled_utc(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertIn("UTC", report)

    def test_totals_table_breaks_ties_deterministically(self):
        tied = [
            {"primaryAttributeValueId": form_id, "primaryAttributeValue": "f"}
            for form_id in ("300", "100", "200")
        ]
        report = format_report(ROWS, tied, 10, truncated=False)
        totals = report.split("Marketo totals per form")[1]
        self.assertLess(totals.index("100"), totals.index("200"))
        self.assertLess(totals.index("200"), totals.index("300"))


class TestCsv(unittest.TestCase):
    def test_first_row_is_the_header(self):
        self.assertEqual(
            csv_rows(ROWS, {})[0],
            ["date", "form_id", "form_name", "site", "referrer", "count"],
        )

    def test_groups_identical_rows_into_a_count(self):
        body = csv_rows(ROWS, {"5883": "Microk8s"})[1:]
        self.assertIn(
            [
                "2026-08-05",
                "5883",
                "Microk8s",
                "ubuntu.com",
                "https://ubuntu.com/a",
                "2",
            ],
            body,
        )

    def test_write_csv_round_trips(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "out.csv"
            write_csv(path, csv_rows(ROWS, {}))
            with open(path, newline="", encoding="utf-8") as handle:
                written = list(csv.reader(handle))
        self.assertEqual(written[0][0], "date")
        self.assertEqual(len(written), 3)

    def test_truncation_marker_leads_the_file_when_capped(self):
        # A CSV emailed onward carries no stderr, so the page cap has to
        # be inside the file or it is invisible.
        rows = csv_rows(ROWS, {}, truncated=True)
        self.assertIn("INCOMPLETE", rows[0][0])
        self.assertEqual(len(rows[0]), len(CSV_HEADER))
        self.assertEqual(rows[1], CSV_HEADER)

    def test_no_marker_by_default(self):
        self.assertEqual(csv_rows(ROWS, {})[0], CSV_HEADER)

    def test_marker_row_is_not_shared_state(self):
        first = csv_rows(ROWS, {}, truncated=True)[0]
        first[1] = "mutated"
        self.assertEqual(csv_rows(ROWS, {}, truncated=True)[0][1], "")

    def test_write_csv_survives_an_ascii_locale(self):
        # LANG=C in a container makes the locale default encoding ASCII,
        # so a non-ASCII Marketo form name raises UnicodeEncodeError --
        # a ValueError, not an OSError, so it slips straight past the
        # CLI's exit-3 guard and crashes anyway.
        #
        # This has to be a subprocess: the interpreter resolves the
        # locale encoding at start-up, so patching `locale` in-process
        # changes nothing. The child's source is kept pure ASCII because
        # under LC_ALL=C the -c argument itself decodes as ASCII.
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "out.csv"
            result = subprocess.run(
                [
                    sys.executable,
                    "-c",
                    ASCII_LOCALE_CHILD % ascii(NON_ASCII_FORM_NAME),
                    str(path),
                ],
                cwd=REPO_ROOT,
                env={
                    **os.environ,
                    "LC_ALL": "C",
                    "LANG": "C",
                    "PYTHONUTF8": "0",
                    "PYTHONCOERCECLOCALE": "0",
                },
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            with open(path, newline="", encoding="utf-8") as handle:
                written = list(csv.reader(handle))
        self.assertIn(NON_ASCII_FORM_NAME, written[1])


if __name__ == "__main__":
    unittest.main()
