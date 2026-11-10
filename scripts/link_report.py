#!/usr/bin/env python3
"""Build the webbot /webhooks/dead-links payload from a check-links.sh report.

Usage:
    link_report.py REPORT.json [--room ROOM] [--run-url URL] [--dry-run]
        > payload.json

REPORT.json is the file check-links.sh writes when LINK_REPORT_PATH is set.
Each page that links to a broken URL is fetched to read its copydoc URL from
the <meta name="copydoc"> tag.
"""

import argparse
import json
import os
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

# The webbot request body is limited to 100 kB.
MAX_PAYLOAD_BYTES = 90_000
MAX_PAGES = 40
MAX_LINKS_PER_PAGE = 15
MAX_PAGE_BYTES = 2_000_000
FETCH_TIMEOUT = 15


class CopydocParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.copydoc = None

    def handle_starttag(self, tag, attrs):
        if tag != "meta" or self.copydoc is not None:
            return
        attributes = dict(attrs)
        if (attributes.get("name") or "").lower() == "copydoc":
            self.copydoc = (attributes.get("content") or "").strip() or None


def find_copydoc(html):
    parser = CopydocParser()
    parser.feed(html)
    return parser.copydoc


def loggable_url(url):
    """The URL without credentials, query string or fragment."""
    parts = urlsplit(url)
    host = parts.netloc.rpartition("@")[2]
    return f"{parts.scheme}://{host}{parts.path}"


def fetch_page(url):
    """Return the page HTML, or None if it cannot be fetched."""
    if not url.startswith(("http://", "https://")):
        return None
    request = Request(url, headers={"User-Agent": "ubuntu.com-link-report"})
    try:
        with urlopen(request, timeout=FETCH_TIMEOUT) as response:
            body = response.read(MAX_PAGE_BYTES)
    except OSError as error:
        # The CI log is public: a query string can carry tokens.
        print(f"Could not fetch {loggable_url(url)}: {error}", file=sys.stderr)
        return None
    return body.decode("utf-8", errors="replace")


def to_json(payload):
    return json.dumps(payload, separators=(",", ":"))


def build_payload(report, room, run_url=None, fetch=fetch_page, dry_run=False):
    """Group broken links by the page they are on and attach each copydoc.

    Pages and links that do not fit the size limits are left out and counted
    in omitted_pages and omitted_links.
    """
    links_by_page = {}
    for entry in report:
        for parent in entry.get("parents", []):
            links_by_page.setdefault(parent, []).append(
                {"url": entry["url"], "result": entry.get("result", "")}
            )

    total_links = sum(len(links) for links in links_by_page.values())
    page_urls = sorted(links_by_page)
    pages = []
    for page_url in page_urls[:MAX_PAGES]:
        html = fetch(page_url)
        pages.append(
            {
                "page_url": page_url,
                "copydoc_url": find_copydoc(html) if html else None,
                "broken_links": links_by_page[page_url][:MAX_LINKS_PER_PAGE],
            }
        )

    payload = {"room": room, "pages": pages}
    if run_url:
        payload["run_url"] = run_url
    if dry_run:
        # Webbot then sends no direct messages but still lists the copydocs
        # whose owner it could not find.
        payload["dry_run"] = True

    # Leave room for the two omitted_* fields added below.
    while pages and len(to_json(payload)) > MAX_PAYLOAD_BYTES - 100:
        pages.pop()

    included_links = sum(len(page["broken_links"]) for page in pages)
    omitted_pages = len(page_urls) - len(pages)
    omitted_links = total_links - included_links
    if omitted_pages:
        payload["omitted_pages"] = omitted_pages
    if omitted_links:
        payload["omitted_links"] = omitted_links
    return payload


def default_run_url():
    repository = os.environ.get("GITHUB_REPOSITORY")
    run_id = os.environ.get("GITHUB_RUN_ID")
    if repository and run_id:
        return f"https://github.com/{repository}/actions/runs/{run_id}"
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", help="JSON file from check-links.sh")
    parser.add_argument(
        "--room",
        default="web-alerts",
        help="Mattermost channel for the unresolved-owner summary",
    )
    parser.add_argument(
        "--run-url", default=default_run_url(), help="Link to the CI run"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ask webbot not to send direct messages",
    )
    args = parser.parse_args()

    with open(args.report) as report_file:
        report = json.load(report_file)

    payload = build_payload(
        report, args.room, args.run_url, dry_run=args.dry_run
    )
    sys.stdout.write(to_json(payload) + "\n")


if __name__ == "__main__":
    main()
