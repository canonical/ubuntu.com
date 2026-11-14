import contextlib
import http.client
import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

import link_report  # noqa: E402

DOC = "https://docs.google.com/document/d/abc123/edit"
PAGE_HTML = """
<html><head>
<meta name="description" content="ignore me" />
<meta name="copydoc" content="
  {}" />
</head></html>
"""


class TestFindCopydoc(unittest.TestCase):
    def test_trims_whitespace_from_the_meta_content(self):
        self.assertEqual(link_report.find_copydoc(PAGE_HTML.format(DOC)), DOC)

    def test_returns_none_without_a_copydoc_tag(self):
        self.assertIsNone(link_report.find_copydoc("<html></html>"))

    def test_returns_none_for_an_empty_copydoc(self):
        html = '<meta name="copydoc" content="  " />'
        self.assertIsNone(link_report.find_copydoc(html))


class TestBuildPayload(unittest.TestCase):
    report = [
        {
            "url": "https://dead.example/1",
            "result": "404 Not Found",
            "parents": ["https://ubuntu.com/a", "https://ubuntu.com/b"],
        },
        {
            "url": "https://dead.example/2",
            "result": "500 Server Error",
            "parents": ["https://ubuntu.com/a"],
        },
    ]

    def fetch(self, url):
        return {
            "https://ubuntu.com/a": PAGE_HTML.format(DOC),
            "https://ubuntu.com/b": None,
        }[url]

    def test_groups_broken_links_by_parent_page(self):
        payload = link_report.build_payload(
            self.report, "test-room", "https://ci/run/1", self.fetch
        )

        self.assertEqual(payload["room"], "test-room")
        self.assertEqual(payload["run_url"], "https://ci/run/1")
        self.assertEqual(
            payload["pages"],
            [
                {
                    "page_url": "https://ubuntu.com/a",
                    "copydoc_url": DOC,
                    "broken_links": [
                        {
                            "url": "https://dead.example/1",
                            "result": "404 Not Found",
                        },
                        {
                            "url": "https://dead.example/2",
                            "result": "500 Server Error",
                        },
                    ],
                },
                {
                    "page_url": "https://ubuntu.com/b",
                    "copydoc_url": None,
                    "fetch_failed": True,
                    "broken_links": [
                        {
                            "url": "https://dead.example/1",
                            "result": "404 Not Found",
                        }
                    ],
                },
            ],
        )

    def test_omits_run_url_when_unknown(self):
        payload = link_report.build_payload([], "room", None, self.fetch)
        self.assertNotIn("run_url", payload)

    def test_caps_pages_and_links_per_page(self):
        many_links = [
            {"url": f"https://dead.example/{i}", "parents": ["p"]}
            for i in range(link_report.MAX_LINKS_PER_PAGE + 5)
        ]
        many_pages = [
            {"url": f"https://dead.example/{i}", "parents": [f"page-{i:03}"]}
            for i in range(link_report.MAX_PAGES + 5)
        ]

        links_payload = link_report.build_payload(
            many_links, "room", fetch=lambda url: None
        )
        pages_payload = link_report.build_payload(
            many_pages, "room", fetch=lambda url: None
        )

        self.assertEqual(
            len(links_payload["pages"][0]["broken_links"]),
            link_report.MAX_LINKS_PER_PAGE,
        )
        self.assertEqual(len(pages_payload["pages"]), link_report.MAX_PAGES)

    def test_counts_what_the_caps_leave_out(self):
        links = [
            {"url": f"https://dead.example/{i}", "parents": ["p"]}
            for i in range(link_report.MAX_LINKS_PER_PAGE + 5)
        ]
        pages = [
            {"url": f"https://dead.example/{i}", "parents": [f"page-{i:03}"]}
            for i in range(link_report.MAX_PAGES + 5)
        ]

        links_payload = link_report.build_payload(
            links, "room", fetch=lambda url: None
        )
        pages_payload = link_report.build_payload(
            pages, "room", fetch=lambda url: None
        )

        self.assertEqual(links_payload["omitted_links"], 5)
        self.assertNotIn("omitted_pages", links_payload)
        self.assertEqual(pages_payload["omitted_pages"], 5)
        self.assertEqual(pages_payload["omitted_links"], 5)

    def test_leaves_out_nothing_when_everything_fits(self):
        payload = link_report.build_payload(
            self.report, "room", fetch=self.fetch
        )
        self.assertNotIn("omitted_pages", payload)
        self.assertNotIn("omitted_links", payload)

    def test_keeps_the_payload_under_the_size_limit(self):
        long_path = "x" * 300
        report = [
            {
                "url": f"https://dead.example/{long_path}{p}-{i}",
                "parents": [f"https://ubuntu.com/page-{p:03}"],
            }
            for p in range(link_report.MAX_PAGES)
            for i in range(link_report.MAX_LINKS_PER_PAGE)
        ]

        payload = link_report.build_payload(
            report, "room", fetch=lambda url: None
        )

        self.assertLessEqual(
            len(link_report.to_json(payload)), link_report.MAX_PAYLOAD_BYTES
        )
        self.assertGreater(payload["omitted_pages"], 0)
        self.assertEqual(
            len(payload["pages"]) + payload["omitted_pages"],
            link_report.MAX_PAGES,
        )

    def test_marks_a_dry_run_only_when_asked(self):
        dry = link_report.build_payload([], "room", dry_run=True)
        normal = link_report.build_payload([], "room")
        self.assertIs(dry["dry_run"], True)
        self.assertNotIn("dry_run", normal)

    def test_a_page_without_a_copydoc_is_not_a_failed_fetch(self):
        report = [{"url": "https://dead.example/1", "parents": ["p"]}]
        payload = link_report.build_payload(
            report, "room", fetch=lambda url: "<html></html>"
        )
        page = payload["pages"][0]
        self.assertIsNone(page["copydoc_url"])
        self.assertNotIn("fetch_failed", page)


class TestWidespreadLinks(unittest.TestCase):
    def footer_report(self, parent_count):
        return [
            {
                "url": "https://dead.example/footer",
                "result": "404 Not Found",
                "parents": [
                    f"https://ubuntu.com/page-{i:03}"
                    for i in range(parent_count)
                ],
            },
            {
                "url": "https://dead.example/own",
                "result": "500 Server Error",
                "parents": ["https://ubuntu.com/page-000"],
            },
        ]

    def test_reports_a_link_on_many_pages_once(self):
        fetched = []
        payload = link_report.build_payload(
            self.footer_report(300),
            "room",
            fetch=lambda url: fetched.append(url) or None,
        )

        self.assertEqual(
            payload["widespread_links"],
            [
                {
                    "url": "https://dead.example/footer",
                    "result": "404 Not Found",
                    "page_count": 300,
                }
            ],
        )
        # Only the page with a link of its own is left, and fetched.
        self.assertEqual(fetched, ["https://ubuntu.com/page-000"])
        self.assertEqual(
            [link["url"] for link in payload["pages"][0]["broken_links"]],
            ["https://dead.example/own"],
        )
        self.assertNotIn("omitted_pages", payload)
        self.assertNotIn("omitted_links", payload)

    def test_keeps_a_link_on_up_to_the_threshold_with_its_pages(self):
        payload = link_report.build_payload(
            self.footer_report(link_report.WIDESPREAD_MIN_PAGES),
            "room",
            fetch=lambda url: None,
        )
        self.assertNotIn("widespread_links", payload)
        self.assertEqual(
            len(payload["pages"]), link_report.WIDESPREAD_MIN_PAGES
        )

    def test_counts_a_link_just_over_the_threshold_as_widespread(self):
        payload = link_report.build_payload(
            self.footer_report(link_report.WIDESPREAD_MIN_PAGES + 1),
            "room",
            fetch=lambda url: None,
        )
        self.assertEqual(payload["widespread_links"][0]["page_count"], 11)

    def test_counts_a_repeated_parent_once(self):
        report = [
            {
                "url": "https://dead.example/x",
                "parents": ["https://ubuntu.com/a"]
                * (link_report.WIDESPREAD_MIN_PAGES + 5),
            }
        ]
        payload = link_report.build_payload(
            report, "room", fetch=lambda url: None
        )
        self.assertNotIn("widespread_links", payload)

    def test_lists_the_most_widespread_first_and_caps_the_list(self):
        report = [
            {
                "url": f"https://dead.example/{i:03}",
                "parents": [
                    f"https://ubuntu.com/p{j}"
                    for j in range(link_report.WIDESPREAD_MIN_PAGES + 1 + i)
                ],
            }
            for i in range(link_report.MAX_WIDESPREAD_LINKS + 3)
        ]
        payload = link_report.build_payload(
            report, "room", fetch=lambda url: None
        )

        counts = [link["page_count"] for link in payload["widespread_links"]]
        self.assertEqual(len(counts), link_report.MAX_WIDESPREAD_LINKS)
        self.assertEqual(counts, sorted(counts, reverse=True))
        self.assertEqual(payload["omitted_links"], 3)
        self.assertNotIn("omitted_pages", payload)


class TestFetchPage(unittest.TestCase):
    def fetch_logging(self, error, url="https://ubuntu.com/page"):
        stderr = io.StringIO()
        with mock.patch.object(
            link_report, "urlopen", side_effect=error
        ), contextlib.redirect_stderr(stderr):
            self.assertIsNone(link_report.fetch_page(url))
        return stderr.getvalue()

    def test_returns_none_for_unexpected_http_errors(self):
        for error in (
            http.client.IncompleteRead(b""),
            http.client.BadStatusLine("closed"),
            ValueError("bad"),
        ):
            self.assertIn(type(error).__name__, self.fetch_logging(error))

    def test_does_not_log_the_text_of_non_os_errors(self):
        url = "https://ubuntu.com/page?token=secret"
        error = http.client.InvalidURL(f"nonnumeric port in {url}")
        logged = self.fetch_logging(error, url)
        self.assertNotIn("secret", logged)
        self.assertEqual(
            logged,
            "Could not fetch https://ubuntu.com/page: InvalidURL\n",
        )

    def test_ignores_non_http_urls(self):
        self.assertIsNone(link_report.fetch_page("file:///etc/passwd"))

    def test_logs_failures_without_credentials_query_or_fragment(self):
        url = "https://user:pw@ubuntu.com/page?token=secret#frag"
        stderr = io.StringIO()

        with mock.patch.object(
            link_report, "urlopen", side_effect=OSError("timed out")
        ), contextlib.redirect_stderr(stderr):
            self.assertIsNone(link_report.fetch_page(url))

        self.assertEqual(
            stderr.getvalue(),
            "Could not fetch https://ubuntu.com/page: timed out\n",
        )


class TestLoggableUrl(unittest.TestCase):
    def test_keeps_only_scheme_host_port_and_path(self):
        self.assertEqual(
            link_report.loggable_url("http://u:p@host:8080/a/b?x=1#f"),
            "http://host:8080/a/b",
        )
        self.assertEqual(
            link_report.loggable_url("https://ubuntu.com/"),
            "https://ubuntu.com/",
        )


if __name__ == "__main__":
    unittest.main()
