import importlib.util
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

MODULE_PATH = (
    Path(__file__).resolve().parent.parent
    / "scripts"
    / "marketo_form_stats.py"
)
spec = importlib.util.spec_from_file_location("marketo_cli", MODULE_PATH)
marketo_cli = importlib.util.module_from_spec(spec)
spec.loader.exec_module(marketo_cli)


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
        self.assertEqual(until, datetime(2026, 7, 31, tzinfo=timezone.utc))

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

        exit_code = marketo_cli.main(
            ["--dry-run", "--days", "7"],
            fetch=exploding_fetch,
            env={
                "MARKETO_API_URL": "https://example.mktorest.com",
                "MARKETO_API_CLIENT": "id",
                "MARKETO_API_SECRET": "secret",
            },
        )
        self.assertEqual(exit_code, 0)
        self.assertEqual(calls, [])

    def test_missing_credentials_exit_non_zero(self):
        exit_code = marketo_cli.main(["--days", "7"], env={})
        self.assertEqual(exit_code, 2)


class TestMainCsvWriteFailure(unittest.TestCase):
    def test_unwritable_out_path_exits_three(self):
        def fake_fetch(url):
            if "/identity/oauth/token" in url:
                return {"access_token": "tok", "expires_in": 3600}
            if "pagingtoken" in url:
                return {"nextPageToken": "PAGE0"}
            return {"result": [], "moreResult": False, "success": True}

        with tempfile.TemporaryDirectory() as tmpdir:
            bad_path = str(Path(tmpdir) / "missing-subdir" / "report.csv")

            exit_code = marketo_cli.main(
                ["--days", "7", "--out", bad_path],
                fetch=fake_fetch,
                env={
                    "MARKETO_API_URL": "https://example.mktorest.com",
                    "MARKETO_API_CLIENT": "id",
                    "MARKETO_API_SECRET": "secret",
                },
            )
            self.assertEqual(exit_code, 3)
            self.assertFalse(Path(bad_path).exists())


if __name__ == "__main__":
    unittest.main()
