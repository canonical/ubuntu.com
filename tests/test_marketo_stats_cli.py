import contextlib
import csv
import importlib.util
import io
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from webapp.marketo_stats.client import MarketoActivityClient
from webapp.marketo_stats.render import CSV_HEADER

MODULE_PATH = (
    Path(__file__).resolve().parent.parent
    / "scripts"
    / "marketo_form_stats.py"
)
spec = importlib.util.spec_from_file_location("marketo_cli", MODULE_PATH)
marketo_cli = importlib.util.module_from_spec(spec)
spec.loader.exec_module(marketo_cli)

ENV = {
    "MARKETO_API_URL": "https://example.mktorest.com",
    "MARKETO_API_CLIENT": "id",
    "MARKETO_API_SECRET": "secret",
}


def blob(**fields):
    """Serialise a PHP array the way Marketo stores Form Fields."""
    parts = "".join(
        's:%d:"%s";s:%d:"%s";' % (len(key), key, len(str(value)), value)
        for key, value in fields.items()
    )
    return "a:%d:{%s}" % (len(fields), parts)


def enrichment_activity(date="2026-07-15T10:00:00Z"):
    return {
        "activityDate": date,
        "primaryAttributeValueId": 4198,
        "primaryAttributeValue": "Global_marketing_optin.Lead enrichment",
        "attributes": [
            {
                "name": "Form Fields",
                "value": blob(
                    original_form_id="5883",
                    acquisition_url="https://ubuntu.com/kubernetes",
                ),
            }
        ],
    }


@contextlib.contextmanager
def captured():
    """Run main() without letting its output pollute the test run."""
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out):
        with contextlib.redirect_stderr(err):
            yield out


def fake_marketo(page):
    """Return a fetch callable serving one activities page forever."""

    def fetch(url):
        if "/identity/oauth/token" in url:
            return {"access_token": "tok", "expires_in": 3600}
        if "pagingtoken" in url:
            return {"nextPageToken": "PAGE0"}
        return page

    return fetch


class TestParseArgs(unittest.TestCase):
    def test_defaults(self):
        args = marketo_cli.parse_args([])
        self.assertEqual(args.days, 30)
        self.assertEqual(args.max_pages, 50)
        self.assertEqual(args.top_referrers, 25)
        self.assertFalse(args.dry_run)

    def test_explicit_window(self):
        args = marketo_cli.parse_args(
            ["--from", "2026-07-01", "--to", "2026-07-31"]
        )
        self.assertEqual(getattr(args, "from"), "2026-07-01")


class TestResolveWindow(unittest.TestCase):
    def test_days_counts_back_from_now(self):
        now = datetime(2026, 8, 12, tzinfo=timezone.utc)
        since, until = marketo_cli.resolve_window(
            marketo_cli.parse_args(["--days", "7"]), now
        )
        self.assertEqual(since, datetime(2026, 8, 5, tzinfo=timezone.utc))
        self.assertEqual(until, now)

    def test_explicit_dates_win_over_days(self):
        now = datetime(2026, 8, 12, tzinfo=timezone.utc)
        since, until = marketo_cli.resolve_window(
            marketo_cli.parse_args(
                ["--from", "2026-07-01", "--to", "2026-07-31"]
            ),
            now,
        )
        self.assertEqual(since, datetime(2026, 7, 1, tzinfo=timezone.utc))
        # --to names an inclusive day, so the exclusive bound handed to
        # the client is midnight at the start of the following day.
        # Anything else drops the whole of July 31.
        self.assertEqual(until, datetime(2026, 8, 1, tzinfo=timezone.utc))

    def test_a_single_day_window_is_not_empty(self):
        now = datetime(2026, 8, 12, tzinfo=timezone.utc)
        since, until = marketo_cli.resolve_window(
            marketo_cli.parse_args(
                ["--from", "2026-07-01", "--to", "2026-07-01"]
            ),
            now,
        )
        self.assertEqual(since, datetime(2026, 7, 1, tzinfo=timezone.utc))
        self.assertEqual(until, datetime(2026, 7, 2, tzinfo=timezone.utc))

    def test_activity_late_on_the_final_named_day_is_inside_the_window(self):
        # The bug this guards: with an exclusive midnight bound the
        # client's `return` fired on the first July 31 record, silently
        # truncating a month-boundary report by a day.
        since, until = marketo_cli.resolve_window(
            marketo_cli.parse_args(
                ["--from", "2026-07-01", "--to", "2026-07-31"]
            ),
            datetime(2026, 8, 12, tzinfo=timezone.utc),
        )
        client = MarketoActivityClient(
            "https://example.mktorest.com",
            "id",
            "secret",
            fetch=fake_marketo(
                {
                    "result": [
                        enrichment_activity(date="2026-07-31T23:59:59Z")
                    ],
                    "moreResult": False,
                    "success": True,
                }
            ),
            sleeper=lambda _: None,
        )
        self.assertEqual(len(list(client.iter_activities(since, until))), 1)

    def test_banner_shows_the_inclusive_end_date_the_user_asked_for(self):
        with captured() as out:
            marketo_cli.main(
                ["--from", "2026-07-01", "--to", "2026-07-31", "--dry-run"],
                env=ENV,
            )
        self.assertIn("2026-07-01 to 2026-07-31", out.getvalue())
        self.assertNotIn("2026-08-01", out.getvalue())

    def test_rejects_backwards_window(self):
        now = datetime(2026, 8, 12, tzinfo=timezone.utc)
        with self.assertRaises(SystemExit):
            marketo_cli.resolve_window(
                marketo_cli.parse_args(
                    ["--from", "2026-07-31", "--to", "2026-07-01"]
                ),
                now,
            )


class TestMainDryRun(unittest.TestCase):
    def test_dry_run_makes_no_requests(self):
        calls = []

        def exploding_fetch(url):
            calls.append(url)
            raise AssertionError("dry run must not call Marketo")

        with captured():
            exit_code = marketo_cli.main(
                ["--dry-run", "--days", "7"],
                fetch=exploding_fetch,
                env=ENV,
            )
        self.assertEqual(exit_code, 0)
        self.assertEqual(calls, [])

    def test_missing_credentials_exit_non_zero(self):
        with captured():
            exit_code = marketo_cli.main(["--days", "7"], env={})
        self.assertEqual(exit_code, 2)


class TestMainCsvWriteFailure(unittest.TestCase):
    def test_unwritable_out_path_exits_three(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            bad_path = str(Path(tmpdir) / "missing-subdir" / "report.csv")

            with captured() as out:
                exit_code = marketo_cli.main(
                    ["--days", "7", "--out", bad_path],
                    fetch=fake_marketo(
                        {
                            "result": [],
                            "moreResult": False,
                            "success": True,
                        }
                    ),
                    env=ENV,
                )
            self.assertEqual(exit_code, 3)
            self.assertFalse(Path(bad_path).exists())
            # The write failure must short-circuit before the report is
            # printed, so a failed run cannot look like a good one.
            self.assertNotIn("Marketo totals per form", out.getvalue())


class TestMainReportsTruncation(unittest.TestCase):
    """The page cap has to survive onto whichever artefact travels."""

    # max_pages=1 also keeps the client's real 0.5s inter-page sleep out
    # of the test: the cap trips before a second page is ever requested.
    CAPPED_PAGE = {
        "result": [enrichment_activity()],
        "moreResult": True,
        "nextPageToken": "NEXT",
        "success": True,
    }
    COMPLETE_PAGE = {
        "result": [enrichment_activity()],
        "moreResult": False,
        "success": True,
    }

    def run_cli(self, page, extra_args=()):
        with captured() as out:
            exit_code = marketo_cli.main(
                [
                    "--from",
                    "2026-07-01",
                    "--to",
                    "2026-07-31",
                    "--max-pages",
                    "1",
                    *extra_args,
                ],
                fetch=fake_marketo(page),
                env=ENV,
            )
        return exit_code, out.getvalue()

    def test_truncation_warning_reaches_stdout(self):
        exit_code, out = self.run_cli(self.CAPPED_PAGE)
        self.assertEqual(exit_code, 0)
        self.assertIn("INCOMPLETE", out)

    def test_no_truncation_warning_when_the_walk_completed(self):
        _, out = self.run_cli(self.COMPLETE_PAGE)
        self.assertNotIn("INCOMPLETE", out)

    def read_csv_with_out(self, page):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "report.csv"
            exit_code, out = self.run_cli(page, ["--out", str(path)])
            self.assertEqual(exit_code, 0)
            with open(path, newline="", encoding="utf-8") as handle:
                return list(csv.reader(handle)), out

    def test_csv_carries_the_truncation_marker_when_capped(self):
        written, _ = self.read_csv_with_out(self.CAPPED_PAGE)
        self.assertEqual(len(written[0]), len(CSV_HEADER))
        self.assertIn("INCOMPLETE", written[0][0])
        self.assertEqual(written[1], CSV_HEADER)

    def test_csv_has_no_marker_when_the_walk_completed(self):
        written, _ = self.read_csv_with_out(self.COMPLETE_PAGE)
        self.assertEqual(written[0], CSV_HEADER)

    def test_out_still_prints_the_report_tables(self):
        # The CSV cannot carry the raw per-form totals, so the operator
        # only ever sees the undercount evidence on stdout.
        _, out = self.read_csv_with_out(self.CAPPED_PAGE)
        self.assertIn("Marketo totals per form", out)
        self.assertIn("INCOMPLETE", out)


if __name__ == "__main__":
    unittest.main()
