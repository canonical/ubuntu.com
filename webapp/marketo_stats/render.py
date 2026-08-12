"""Render aggregated submissions as tables and CSV.

Everything here operates on SubmissionRow values, which carry no
personal data by construction.
"""

import csv
from collections import Counter

from webapp.marketo_stats.aggregate import (
    counts_by_site,
    daily_counts_by_form,
    form_names,
    raw_form_totals,
    top_referrers,
)

TRUNCATION_WARNING = (
    "*** INCOMPLETE: the page cap stopped this walk before Marketo ran "
    "out of activities. These counts are a floor, not a total. Re-run "
    "with a larger --max-pages or a shorter window. ***"
)

CSV_HEADER = ["date", "form_id", "form_name", "site", "referrer", "count"]


def _table(title, headings, body_rows):
    if not body_rows:
        return f"{title}\n{'-' * len(title)}\n  (nothing)\n"

    columns = [headings] + [[str(cell) for cell in r] for r in body_rows]
    widths = [
        max(len(row[index]) for row in columns)
        for index in range(len(headings))
    ]
    lines = [title, "-" * len(title)]
    for row in columns:
        lines.append(
            "  ".join(
                cell.ljust(widths[index]) for index, cell in enumerate(row)
            )
        )
    return "\n".join(lines) + "\n"


def format_report(rows, activities, top_referrers_limit, truncated):
    """Build the full human-readable report."""
    sections = []
    if truncated:
        sections.append(TRUNCATION_WARNING + "\n")

    if not rows:
        sections.append(
            "No submissions found from our sites in this window.\n"
        )
        return "\n".join(sections)

    names = form_names(activities)
    raw_totals = raw_form_totals(activities)

    daily = daily_counts_by_form(rows)
    sections.append(
        _table(
            "Submissions per form per day",
            ["date", "form id", "form name", "count"],
            [
                [
                    date,
                    form_id,
                    names.get(form_id, "(unknown)"),
                    count,
                ]
                for (date, form_id), count in sorted(daily.items())
            ],
        )
    )

    sections.append(
        _table(
            "Submissions per site",
            ["site", "count"],
            sorted(
                counts_by_site(rows).items(),
                key=lambda item: (-item[1], item[0]),
            ),
        )
    )

    sections.append(
        _table(
            "Top referrer URLs",
            ["referrer", "count"],
            top_referrers(rows, top_referrers_limit),
        )
    )

    sections.append(
        _table(
            "Marketo totals per form, all sources "
            "(a gap vs the counts above means enrichment submissions "
            "failed)",
            ["form id", "form name", "count"],
            [
                [form_id, names.get(form_id, "(unknown)"), count]
                for form_id, count in sorted(
                    raw_totals.items(), key=lambda item: -item[1]
                )
            ],
        )
    )

    return "\n".join(sections)


def csv_rows(rows, names):
    """Return header-first CSV rows, grouped and counted."""
    grouped = Counter(
        (row.date, row.form_id, row.site, row.referrer) for row in rows
    )
    body = [
        [date, form_id, names.get(form_id, ""), site, referrer, str(count)]
        for (date, form_id, site, referrer), count in sorted(grouped.items())
    ]
    return [CSV_HEADER] + body


def write_csv(path, rows):
    """Write CSV rows to path."""
    with open(path, "w", newline="") as handle:
        csv.writer(handle).writerows(rows)
