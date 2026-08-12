import csv
import tempfile
import unittest
from pathlib import Path

from webapp.marketo_stats.aggregate import SubmissionRow
from webapp.marketo_stats.render import (
    csv_rows,
    format_report,
    write_csv,
)


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
            with open(path, newline="") as handle:
                written = list(csv.reader(handle))
        self.assertEqual(written[0][0], "date")
        self.assertEqual(len(written), 3)


if __name__ == "__main__":
    unittest.main()
