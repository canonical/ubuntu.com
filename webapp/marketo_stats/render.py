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

# Marketo saw forms being filled in, but not one of them carried an
# enrichment record. That is not a quiet window -- it is the beacon
# itself failing, and it looks identical to "nothing happened" unless we
# say so.
ENRICHMENT_BLIND_WARNING = (
    "*** NO ENRICHMENT RECORDS AT ALL: Marketo recorded form submissions "
    "in this window (see the totals below) but none of them carried an "
    "enrichment record, so no per-site or per-referrer breakdown could "
    "be built. This points at the enrichment path -- the form 4198 call "
    "in webapp/views.py -- rather than at a quiet period. ***"
)

CSV_HEADER = ["date", "form_id", "form_name", "site", "referrer", "count"]

# Six cells, matching the header width, so the marker does not skew the
# column count for anything reading the file.
CSV_TRUNCATION_MARKER = [
    "# INCOMPLETE: page cap reached; counts are a floor, not a total",
    "",
    "",
    "",
    "",
    "",
]


def _rule(title):
    """Underline as wide as the widest line of a heading."""
    return "-" * max(len(line) for line in title.splitlines())


def _table(title, headings, body_rows):
    if not body_rows:
        return f"{title}\n{_rule(title)}\n  (nothing)\n"

    columns = [headings] + [[str(cell) for cell in r] for r in body_rows]
    widths = [
        max(len(row[index]) for row in columns)
        for index in range(len(headings))
    ]
    lines = [title, _rule(title)]
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

    names = form_names(activities)
    raw_totals = raw_form_totals(activities)

    if not rows:
        # Additive, not an early return: the totals table below is the
        # only evidence distinguishing a quiet window from a dead
        # enrichment beacon, so it has to render either way.
        sections.append(
            "No submissions found from our sites in this window.\n"
        )
        if raw_totals:
            sections.append(ENRICHMENT_BLIND_WARNING + "\n")
    else:
        daily = daily_counts_by_form(rows)
        sections.append(
            _table(
                "Submissions per form per day (dates are UTC calendar days)",
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
            # These are every Fill Out Form activity for the form id
            # anywhere in the Marketo instance, including Marketo-hosted
            # landing pages and partner pages that never touch our Flask
            # app. So a gap has two possible causes, and the caption must
            # name both -- reading it as an enrichment failure rate would
            # invent a number.
            "Marketo totals per form, all sources\n"
            "(a gap vs the counts above means the submission did not come "
            "through our sites,\n"
            "or it did and its enrichment call failed)",
            ["form id", "form name", "count"],
            [
                [form_id, names.get(form_id, "(unknown)"), count]
                for form_id, count in sorted(
                    raw_totals.items(), key=lambda item: (-item[1], item[0])
                )
            ],
        )
    )

    return "\n".join(sections)


def csv_rows(rows, names, truncated=False):
    """Return header-first CSV rows, grouped and counted.

    When truncated, a marker row is prepended so that a CSV travelling
    on its own still says the counts are a floor rather than a total.
    """
    grouped = Counter(
        (row.date, row.form_id, row.site, row.referrer) for row in rows
    )
    body = [
        [date, form_id, names.get(form_id, ""), site, referrer, str(count)]
        for (date, form_id, site, referrer), count in sorted(grouped.items())
    ]
    prefix = [list(CSV_TRUNCATION_MARKER)] if truncated else []
    return prefix + [CSV_HEADER] + body


def write_csv(path, rows):
    """Write CSV rows to path."""
    with open(path, "w", newline="", encoding="utf-8") as handle:
        csv.writer(handle).writerows(rows)
