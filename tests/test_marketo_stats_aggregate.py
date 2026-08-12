import unittest

from webapp.marketo_stats.aggregate import (
    classify_site,
    normalise_referrer,
)


class TestNormaliseReferrer(unittest.TestCase):
    def test_strips_query_and_fragment(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/core?utm_source=x#f"),
            "https://ubuntu.com/core",
        )

    def test_lowercases_host_but_preserves_path_case(self):
        self.assertEqual(
            normalise_referrer("https://Ubuntu.COM/Core/Docs"),
            "https://ubuntu.com/Core/Docs",
        )

    def test_strips_trailing_slash_except_at_root(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/core/"),
            "https://ubuntu.com/core",
        )
        self.assertEqual(
            normalise_referrer("https://ubuntu.com/"),
            "https://ubuntu.com/",
        )

    def test_empty_path_becomes_root(self):
        self.assertEqual(
            normalise_referrer("https://ubuntu.com"),
            "https://ubuntu.com/",
        )

    def test_returns_empty_string_for_junk(self):
        self.assertEqual(normalise_referrer(""), "")
        self.assertEqual(normalise_referrer("not a url"), "")

    def test_returns_empty_string_for_malformed_ipv6(self):
        # Malformed IPv6 literals should not raise ValueError
        self.assertEqual(normalise_referrer("https://[::1"), "")
        self.assertEqual(normalise_referrer("https://[gg]/x"), "")
        self.assertEqual(normalise_referrer("//[bad"), "")


class TestClassifySite(unittest.TestCase):
    def test_recognises_ubuntu_and_canonical(self):
        self.assertEqual(
            classify_site("https://ubuntu.com/core"), "ubuntu.com"
        )
        self.assertEqual(
            classify_site("https://canonical.com/blog"), "canonical.com"
        )

    def test_recognises_subdomains(self):
        self.assertEqual(
            classify_site("https://discourse.ubuntu.com/t/1"), "ubuntu.com"
        )

    def test_does_not_match_lookalike_domains(self):
        # The bug this guards: endswith("ubuntu.com") would match these.
        self.assertEqual(classify_site("https://notubuntu.com/x"), "other")
        self.assertEqual(
            classify_site("https://ubuntu.com.evil.net/x"), "other"
        )

    def test_unknown_and_junk_are_other(self):
        self.assertEqual(classify_site("https://example.com"), "other")
        self.assertEqual(classify_site(""), "other")

    def test_returns_other_for_malformed_ipv6(self):
        # Malformed IPv6 literals should not raise ValueError
        self.assertEqual(classify_site("https://[::1"), "other")
        self.assertEqual(classify_site("https://[gg]/x"), "other")
        self.assertEqual(classify_site("//[bad"), "other")


if __name__ == "__main__":
    unittest.main()
