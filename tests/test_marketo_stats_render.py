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
    short_form_name,
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
    def test_omits_the_daily_breakdown_by_default(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        self.assertNotIn("Submissions per form per day", report)
        self.assertIn("Submissions per site", report)
        self.assertIn("Top referrer URLs", report)
        self.assertIn("Submissions per form (window total)", report)

    def test_daily_flag_adds_the_date_by_form_breakdown(self):
        report = format_report(
            ROWS, ACTIVITIES, 10, truncated=False, daily=True
        )
        self.assertIn("Submissions per form per day", report)

    def test_shows_form_names_when_known(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        # "Form: " is stripped by the name-shortening rule; the
        # informative remainder must still show up.
        self.assertIn("Microk8sconfinement", report)

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
        self.assertIn("Submissions per form (window total)", report)
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
        self.assertIn("bypassed our sites", report)
        self.assertIn("enrichment call failed", report)

    def test_caption_lines_fit_comfortably_in_an_80_column_terminal(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        merged_section = report.split("Submissions per form (window total)")[1]
        lines = merged_section.splitlines()
        caption_line, rule_line = lines[1], lines[2]
        self.assertLess(len(caption_line), 80)
        # The rule line is as wide as the widest heading line, so
        # bounding it independently catches a rule that has blown out
        # even if the caption text itself looks short.
        self.assertLess(len(rule_line), 80)
        self.assertEqual(len(rule_line), len(caption_line))

    def test_sections_are_ordered_per_form_then_site_then_referrers(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        form_pos = report.index("Submissions per form (window total)")
        site_pos = report.index("Submissions per site")
        referrers_pos = report.index("Top referrer URLs")
        self.assertLess(form_pos, site_pos)
        self.assertLess(site_pos, referrers_pos)

    def test_daily_breakdown_comes_last_when_requested(self):
        report = format_report(
            ROWS, ACTIVITIES, 10, truncated=False, daily=True
        )
        referrers_pos = report.index("Top referrer URLs")
        daily_pos = report.index("Submissions per form per day")
        self.assertLess(referrers_pos, daily_pos)

    def test_no_line_has_trailing_whitespace(self):
        report = format_report(
            ROWS, ACTIVITIES, 10, truncated=False, daily=True
        )
        for line in report.splitlines():
            self.assertEqual(line, line.rstrip(), repr(line))

    def test_numeric_columns_are_right_aligned(self):
        # Right-aligned counts of differing digit widths produce equal
        # line lengths once trailing whitespace is stripped; a
        # left-aligned column would not, since a shorter count leaves
        # less padding before the (stripped) line end.
        rows = [
            SubmissionRow(
                "2026-08-05",
                "5883",
                "https://ubuntu.com/a",
                "ubuntu.com",
            )
        ] * 123 + [
            SubmissionRow(
                "2026-08-05",
                "1240",
                "https://canonical.com/b",
                "canonical.com",
            )
        ] * 4
        report = format_report(rows, ACTIVITIES, 10, truncated=False)
        site_section = report.split("Submissions per site")[1].split(
            "Top referrer URLs"
        )[0]
        body_lines = [
            line
            for line in site_section.splitlines()
            if line.strip() and not line.startswith("-")
        ]
        lengths = {len(line) for line in body_lines}
        self.assertEqual(
            len(lengths), 1, f"lines are not aligned: {body_lines}"
        )

    def test_dates_are_labelled_utc(self):
        report = format_report(
            ROWS, ACTIVITIES, 10, truncated=False, daily=True
        )
        self.assertIn("UTC", report)

    def test_totals_table_breaks_ties_deterministically(self):
        tied = [
            {"primaryAttributeValueId": form_id, "primaryAttributeValue": "f"}
            for form_id in ("300", "100", "200")
        ]
        report = format_report(ROWS, tied, 10, truncated=False)
        totals = report.split("Submissions per form (window total)")[1]
        self.assertLess(totals.index("100"), totals.index("200"))
        self.assertLess(totals.index("200"), totals.index("300"))

    def test_per_site_table_has_a_total_row(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        site_section = report.split("Submissions per site")[1].split(
            "Top referrer URLs"
        )[0]
        self.assertIn("TOTAL", site_section)
        self.assertIn("3", site_section)  # 2 ubuntu.com + 1 canonical.com

    def test_merged_table_has_a_total_row(self):
        report = format_report(ROWS, ACTIVITIES, 10, truncated=False)
        merged_section = report.split("Submissions per form (window total)")[1]
        self.assertIn("TOTAL", merged_section)

    def test_counts_get_thousands_separators(self):
        big_rows = [ROWS[0]] * 1234
        report = format_report(big_rows, ACTIVITIES, 10, truncated=False)
        self.assertIn("1,234", report)


class TestMergedFormTable(unittest.TestCase):
    """The per-form table unions enrichment-derived and all-sources ids."""

    def test_form_only_in_enrichment_rows_still_appears(self):
        # 9999 has an enrichment row but no matching "Fill Out Form"
        # activity anywhere in `activities` -- all_sources is 0.
        rows = [
            SubmissionRow(
                "2026-08-05", "9999", "https://ubuntu.com/x", "ubuntu.com"
            )
        ]
        activities = [
            {"primaryAttributeValueId": 4198},
        ]
        report = format_report(rows, activities, 10, truncated=False)
        merged = report.split("Submissions per form (window total)")[1]
        line = [row for row in merged.splitlines() if row.startswith("9999")][
            0
        ]
        # all_sources is 0: the percentage is undefined, never a
        # ZeroDivisionError, and must render as "-" rather than a bogus
        # percentage.
        self.assertIn("(-)", line)

    def test_form_only_in_all_sources_still_appears_with_zero_our_sites(self):
        rows = []
        activities = [
            {"primaryAttributeValueId": 5883, "primaryAttributeValue": "f"},
        ]
        report = format_report(rows, activities, 10, truncated=False)
        merged = report.split("Submissions per form (window total)")[1]
        self.assertIn("5883", merged)

    def test_negative_gap_shows_the_number_without_a_percentage(self):
        # our-sites exceeds all-sources: an enrichment call succeeded but
        # the main "Fill Out Form" activity never landed, or fell
        # outside the window boundary.
        rows = [
            SubmissionRow(
                "2026-08-05", "5883", "https://ubuntu.com/x", "ubuntu.com"
            ),
            SubmissionRow(
                "2026-08-05", "5883", "https://ubuntu.com/x", "ubuntu.com"
            ),
        ]
        activities = [
            {"primaryAttributeValueId": 5883, "primaryAttributeValue": "f"},
        ]
        report = format_report(rows, activities, 10, truncated=False)
        merged = report.split("Submissions per form (window total)")[1]
        merged_form_line = [
            line for line in merged.splitlines() if line.startswith("5883")
        ][0]
        self.assertIn("-1", merged_form_line)
        self.assertNotIn("%", merged_form_line)

    def test_sorted_by_our_sites_desc_then_all_sources_desc_then_form_id(self):
        rows = [
            SubmissionRow(
                "2026-08-05", "100", "https://ubuntu.com/x", "ubuntu.com"
            ),
        ]
        activities = [
            {"primaryAttributeValueId": "300", "primaryAttributeValue": "a"},
            {"primaryAttributeValueId": "200", "primaryAttributeValue": "b"},
        ]
        report = format_report(rows, activities, 10, truncated=False)
        merged = report.split("Submissions per form (window total)")[1]
        # our-sites=1 (form 100) sorts ahead of the two all-sources-only
        # forms (our-sites=0), which then break the tie by form id.
        self.assertLess(merged.index("100"), merged.index("200"))
        self.assertLess(merged.index("200"), merged.index("300"))


class TestShortFormName(unittest.TestCase):
    def test_program_and_form_are_redundant_keeps_the_longer_original(self):
        # form is "Form: <same as program>" once the prefix is stripped
        # -- displaying both would just repeat the same text twice.
        name = (
            "CY19_DC_UbuntuServer_eBook_CLI_CheatSheet.Form: "
            "CY19_DC_UbuntuServer_eBook_CLI_CheatSheet"
        )
        self.assertEqual(
            short_form_name(name),
            "CY19_DC_UbuntuServer_eBook_CLI_CheatSheet",
        )

    def test_uninformative_form_half_keeps_the_program_name_visible(self):
        # The obvious "take everything after the first dot" approach
        # would reduce this to "form fieldsets (2.0)", discarding the
        # only informative part of the name.
        name = "Cloud_Form - Contact us Management.form fieldsets (2.0)"
        result = short_form_name(name)
        self.assertTrue(result.startswith("Cloud_Form - Contact us"))
        self.assertNotEqual(result, "form fieldsets (2.0)")

    def test_strips_leading_form_colon_prefix(self):
        name = "Global_marketing_optin.Form: Microk8sconfinement"
        self.assertEqual(
            short_form_name(name),
            "Global_marketing_optin.Microk8sconfinement",
        )

    def test_name_with_no_dot_is_used_as_is(self):
        name = "StandaloneFormNameWithNoDotAtAll"
        self.assertEqual(short_form_name(name), name)

    def test_name_with_no_dot_still_strips_form_prefix(self):
        self.assertEqual(
            short_form_name("Form: Microk8sconfinement"),
            "Microk8sconfinement",
        )

    def test_result_never_exceeds_the_max_width(self):
        long_name = "A" * 40 + "." + "B" * 40
        result = short_form_name(long_name)
        self.assertLessEqual(len(result), 48)
        self.assertTrue(result.endswith("…"))

    def test_empty_name_is_returned_unchanged(self):
        self.assertEqual(short_form_name(""), "")
        self.assertIsNone(short_form_name(None))


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

    def test_counts_stay_raw_integers_without_thousands_separators(self):
        # Table rendering formats counts with commas; the CSV must not,
        # or a downstream parser expecting an int column silently
        # breaks. This pins the grouped count as a plain digit string
        # even well past 1,000, so a refactor that routes both through
        # one shared formatting helper gets caught here.
        big = [ROWS[0]] * 1234
        body = csv_rows(big, {})[1:]
        self.assertEqual(body[0][-1], "1234")
        self.assertNotIn(",", body[0][-1])

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
