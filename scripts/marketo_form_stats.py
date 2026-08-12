#!/usr/bin/env python3
"""Report form submissions from ubuntu.com and canonical.com over time.

Reads Marketo's Activities API. Makes no writes, and touches nothing in
the request path of the site.

Credentials come from the environment, matching the names the app
already uses (see konf/site.yaml):

    MARKETO_API_URL, MARKETO_API_CLIENT, MARKETO_API_SECRET

Example:

    python3 scripts/marketo_form_stats.py --days 30 --out report.csv
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from webapp.marketo_stats.aggregate import (  # noqa: E402
    form_names,
    row_from_activity,
)
from webapp.marketo_stats.client import (  # noqa: E402
    MarketoActivityClient,
    MarketoError,
)
from webapp.marketo_stats.render import (  # noqa: E402
    csv_rows,
    format_report,
    write_csv,
)

ACTIVITIES_PER_PAGE = 300


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description=(
            "Report Marketo form submissions from our marketing sites."
        )
    )
    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Look back this many days (default: 30).",
    )
    parser.add_argument("--from", dest="from", help="Start date, YYYY-MM-DD.")
    parser.add_argument("--to", dest="to", help="End date, YYYY-MM-DD.")
    parser.add_argument(
        "--out", help="Write CSV here instead of printing tables."
    )
    parser.add_argument(
        "--top-referrers",
        type=int,
        default=25,
        help="How many referrer URLs to list (default: 25).",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=50,
        help=(
            "Stop after this many API pages (default: 50, about 15,000 "
            "submissions). Guards the quota shared with live form "
            "submissions."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the window and page ceiling, then exit.",
    )
    return parser.parse_args(argv)


def _parse_date(value, label):
    try:
        return datetime.strptime(value, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
    except ValueError:
        raise SystemExit(f"{label} must be YYYY-MM-DD, got {value!r}")


def resolve_window(args, now):
    explicit_from = getattr(args, "from")
    if explicit_from and args.to:
        since = _parse_date(explicit_from, "--from")
        until = _parse_date(args.to, "--to")
    elif explicit_from or args.to:
        raise SystemExit("--from and --to must be given together")
    else:
        until = now
        since = now - timedelta(days=args.days)

    if since >= until:
        raise SystemExit("the start of the window must precede its end")
    return since, until


def main(argv=None, fetch=None, env=None):
    args = parse_args(argv if argv is not None else sys.argv[1:])
    env = os.environ if env is None else env

    since, until = resolve_window(args, datetime.now(timezone.utc))

    print(
        f"Window: {since:%Y-%m-%d} to {until:%Y-%m-%d}  "
        f"(page ceiling {args.max_pages}, up to "
        f"{args.max_pages * ACTIVITIES_PER_PAGE:,} activities)"
    )

    if args.dry_run:
        print("Dry run: no requests made.")
        return 0

    missing = [
        name
        for name in (
            "MARKETO_API_URL",
            "MARKETO_API_CLIENT",
            "MARKETO_API_SECRET",
        )
        if not env.get(name)
    ]
    if missing:
        print(
            f"Missing credentials: {', '.join(missing)}",
            file=sys.stderr,
        )
        return 2

    client = MarketoActivityClient(
        env["MARKETO_API_URL"],
        env["MARKETO_API_CLIENT"],
        env["MARKETO_API_SECRET"],
        fetch=fetch,
    )

    try:
        activities = list(
            client.iter_activities(since, until, max_pages=args.max_pages)
        )
    except MarketoError as error:
        print(f"Marketo request failed: {error}", file=sys.stderr)
        return 1

    rows = [
        row
        for row in (row_from_activity(a) for a in activities)
        if row is not None
    ]

    print(
        f"Read {len(activities):,} activities over "
        f"{client.pages_fetched} pages; {len(rows):,} from our sites.\n"
    )

    if args.out:
        write_csv(args.out, csv_rows(rows, form_names(activities)))
        print(f"Wrote {args.out}")
        if client.hit_page_cap:
            print(
                "WARNING: page cap reached -- this CSV is incomplete.",
                file=sys.stderr,
            )
    else:
        print(
            format_report(
                rows,
                activities,
                args.top_referrers,
                truncated=client.hit_page_cap,
            )
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
