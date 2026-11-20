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
    form_totals,
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

MERGED_TABLE_TITLE = (
    "Submissions per form (window total)\n"
    "(a gap = the submission bypassed our sites, or its enrichment "
    "call failed)"
)

# Display-only cap on the form-name column. The form id is always shown
# alongside it and the CSV carries the untruncated name, so cutting the
# name here loses nothing a reader actually needs to identify the row.
FORM_NAME_MAX_WIDTH = 48
_ELLIPSIS = "…"
_FORM_PREFIXES = ("Form: ", "FORM: ")

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


def _fmt(n):
    """Thousands-separated count for a human-readable table cell."""
    return f"{n:,}"


def _strip_form_prefix(text):
    for prefix in _FORM_PREFIXES:
        if text.startswith(prefix):
            return text.removeprefix(prefix)
    return text


def _normalise_for_comparison(text):
    return "".join(ch for ch in text.lower() if ch.isalnum())


def short_form_name(raw_name):
    """Shorten a Marketo `Program.FormName` into a compact display label.

    Taking everything after the first dot is the obvious approach and
    it is wrong: some form halves are uninformative on their own (e.g.
    "form fieldsets (2.0)") while the program half carries the only
    identifying text. Instead:

      1. Split on the first "." into program and form. No dot -> the
         whole string is the form half, with no program half.
      2. Strip a leading "Form: " / "FORM: " from the form half.
      3. If program and form are redundant (one, normalised to
         lowercase alphanumerics, contains the other), keep only the
         longer of the two original halves.
      4. Otherwise keep the full "program.form" string, prefix
         stripped.

    The result is truncated to FORM_NAME_MAX_WIDTH for display only --
    the form id is always shown next to it and the CSV carries the
    untruncated name.
    """
    if not raw_name:
        return raw_name

    if "." in raw_name:
        program, _, form_part = raw_name.partition(".")
    else:
        program, form_part = None, raw_name

    form_part = _strip_form_prefix(form_part)

    if program is None:
        display = form_part
    else:
        norm_program = _normalise_for_comparison(program)
        norm_form = _normalise_for_comparison(form_part)
        redundant = (
            norm_program
            and norm_form
            and (norm_program in norm_form or norm_form in norm_program)
        )
        if redundant:
            longer_is_program = len(program) >= len(form_part)
            display = program if longer_is_program else form_part
        elif program:
            display = f"{program}.{form_part}"
        else:
            display = form_part

    if len(display) > FORM_NAME_MAX_WIDTH:
        display = display[: FORM_NAME_MAX_WIDTH - 1] + _ELLIPSIS
    return display


def _display_name(names, form_id):
    """Return a display label for form_id, falling back to the id itself.

    A form with enrichment records but zero raw Marketo activities in
    the window never appears in `names` (form_names() only sees the id
    on an activity). "(unknown)" would read like an error; the form id
    is always a real, useful label on its own.
    """
    raw = names.get(form_id)
    if not raw:
        return f"form {form_id}"
    return short_form_name(raw)


def _merge_form_totals(our_totals, raw_totals):
    """Union our-sites and all-sources counts per form id.

    Returns (form_id, our_sites, all_sources, gap) tuples, sorted by
    our-sites descending, then all-sources descending, then form id
    ascending -- deterministic regardless of dict iteration order.
    """
    form_ids = set(our_totals) | set(raw_totals)
    merged = [
        (
            form_id,
            our_totals.get(form_id, 0),
            raw_totals.get(form_id, 0),
            raw_totals.get(form_id, 0) - our_totals.get(form_id, 0),
        )
        for form_id in form_ids
    ]
    merged.sort(key=lambda item: (-item[1], -item[2], item[0]))
    return merged


def _format_gap(gap, all_sources):
    """Render a gap cell, never dividing by zero, never a bogus percentage.

    A negative gap is not missing data -- it is the enrichment beacon
    recording more submissions than Marketo has Fill Out Form
    activities for, i.e. Marketo skipped or dropped the real
    submission. That is named explicitly as "(excess)" rather than
    forced through the percentage math (which would otherwise need
    all_sources > 0 to avoid a ZeroDivisionError, and produces a
    meaningless number for a negative numerator regardless).
    """
    if gap < 0:
        return f"{_fmt(gap)} (excess)"
    pct = round(gap / all_sources * 100) if all_sources > 0 else 0
    return f"{_fmt(gap)} ({pct}%)"


def _rule(title):
    """Underline as wide as the widest line of a heading."""
    return "-" * max(len(line) for line in title.splitlines())


def _table(title, headings, body_rows, numeric_columns=frozenset()):
    """Render a title, rule, heading row and body rows as fixed columns.

    Columns named in `numeric_columns` (by index) are right-aligned --
    including their heading -- so counts of differing digit widths
    line up on their units digit; every other column stays
    left-aligned. Every rendered line is stripped of trailing
    whitespace, since padding a column that happens to be last in a
    row is otherwise invisible noise.
    """
    if not body_rows:
        return f"{title}\n{_rule(title)}\n  (nothing)\n"

    columns = [headings] + [[str(cell) for cell in r] for r in body_rows]
    widths = [
        max(len(row[index]) for row in columns)
        for index in range(len(headings))
    ]
    lines = [title, _rule(title)]
    for row in columns:
        rendered = "  ".join(
            (
                cell.rjust(widths[index])
                if index in numeric_columns
                else cell.ljust(widths[index])
            )
            for index, cell in enumerate(row)
        )
        lines.append(rendered.rstrip())
    return "\n".join(lines) + "\n"


def format_report(
    rows, activities, top_referrers_limit, truncated, daily=False
):
    """Build the full human-readable report.

    Section order is the per-form table (the headline), then the
    per-site split, then top referrers, then -- only with `daily` --
    the date x form breakdown, since that one is thousands of rows
    over a wide window and is opt-in.
    """
    sections = []
    if truncated:
        sections.append(TRUNCATION_WARNING + "\n")

    names = form_names(activities)
    raw_totals = raw_form_totals(activities)
    our_totals = form_totals(rows)

    merged = _merge_form_totals(our_totals, raw_totals)
    merged_body = [
        [
            form_id,
            _display_name(names, form_id),
            _fmt(our_sites),
            _fmt(all_sources),
            _format_gap(gap, all_sources),
        ]
        for form_id, our_sites, all_sources, gap in merged
    ]
    if merged:
        total_our = sum(item[1] for item in merged)
        total_all = sum(item[2] for item in merged)
        merged_body.append(
            [
                "TOTAL",
                "",
                _fmt(total_our),
                _fmt(total_all),
                _fmt(total_all - total_our),
            ]
        )

    sections.append(
        _table(
            MERGED_TABLE_TITLE,
            ["form id", "form name", "our sites", "all sources", "gap"],
            merged_body,
            numeric_columns={2, 3, 4},
        )
    )

    if not rows:
        # Additive, not an early return: the totals table above is the
        # only evidence distinguishing a quiet window from a dead
        # enrichment beacon, so it has to render either way.
        sections.append(
            "No submissions found from our sites in this window.\n"
        )
        if raw_totals:
            sections.append(ENRICHMENT_BLIND_WARNING + "\n")
    else:
        site_counts = counts_by_site(rows)
        site_body = [
            [site, _fmt(count)]
            for site, count in sorted(
                site_counts.items(), key=lambda item: (-item[1], item[0])
            )
        ]
        site_body.append(["TOTAL", _fmt(sum(site_counts.values()))])
        sections.append(
            _table(
                "Submissions per site",
                ["site", "count"],
                site_body,
                numeric_columns={1},
            )
        )

        sections.append(
            _table(
                "Top referrer URLs",
                ["referrer", "count"],
                [
                    [referrer, _fmt(count)]
                    for referrer, count in top_referrers(
                        rows, top_referrers_limit
                    )
                ],
                numeric_columns={1},
            )
        )

        if daily:
            daily_counts = daily_counts_by_form(rows)
            sections.append(
                _table(
                    "Submissions per form per day "
                    "(dates are UTC calendar days)",
                    ["date", "form id", "form name", "count"],
                    [
                        [
                            date,
                            form_id,
                            _display_name(names, form_id),
                            _fmt(count),
                        ]
                        for (date, form_id), count in sorted(
                            daily_counts.items()
                        )
                    ],
                    numeric_columns={3},
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
