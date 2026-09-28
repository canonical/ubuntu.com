"""
Unit tests for webapp.announcement_bar.
"""

from unittest import TestCase
from unittest.mock import patch

from webapp.app import app
from webapp.announcement_bar import (
    DISMISS_COOKIE_NAME,
    get_announcement_bar_context,
    is_announcement_dismissed,
    should_show_announcement_bar,
)

TEST_CONFIG = {
    "enabled": True,
    "id": "test-id",
    "title": "Test title",
    "message": "Test message",
    "cta_text": "Learn more",
    "cta_url": "https://ubuntu.com/test",
    "exclude_paths": ["pro"],
}


@patch("webapp.announcement_bar._config", TEST_CONFIG)
class TestShouldShowAnnouncementBar(TestCase):
    def test_shows_by_default(self):
        self.assertTrue(should_show_announcement_bar("/aws"))

    def test_shows_on_root(self):
        self.assertTrue(should_show_announcement_bar("/"))

    def test_excludes_listed_top_level_segment(self):
        self.assertFalse(should_show_announcement_bar("/pro"))

    def test_excludes_child_pages_of_listed_segment(self):
        self.assertFalse(should_show_announcement_bar("/pro/free-trial"))

    def test_excludes_docs_segment_anywhere_in_path(self):
        self.assertFalse(should_show_announcement_bar("/docs"))
        self.assertFalse(should_show_announcement_bar("/support/docs/foo"))

    def test_does_not_exclude_docs_substring(self):
        # "/documentation" contains "docs" as a substring but not as a
        # standalone path segment, so it must not be excluded.
        self.assertTrue(should_show_announcement_bar("/documentation"))

    def test_disabled_config_never_shows(self):
        with patch(
            "webapp.announcement_bar._config",
            {**TEST_CONFIG, "enabled": False},
        ):
            self.assertFalse(should_show_announcement_bar("/aws"))


@patch("webapp.announcement_bar._config", TEST_CONFIG)
class TestIsAnnouncementDismissed(TestCase):
    def test_not_dismissed_without_cookie(self):
        with app.test_request_context("/aws"):
            self.assertFalse(is_announcement_dismissed())

    def test_dismissed_when_cookie_matches_current_id(self):
        with app.test_request_context(
            "/aws", headers={"Cookie": f"{DISMISS_COOKIE_NAME}=test-id"}
        ):
            self.assertTrue(is_announcement_dismissed())

    def test_not_dismissed_when_cookie_is_a_stale_id(self):
        # Simulates the content id having been bumped since the visitor's
        # cookie was set, so the (now outdated) dismissal no longer counts.
        with app.test_request_context(
            "/aws", headers={"Cookie": f"{DISMISS_COOKIE_NAME}=old-id"}
        ):
            self.assertFalse(is_announcement_dismissed())


@patch("webapp.announcement_bar._config", TEST_CONFIG)
class TestGetAnnouncementBarContext(TestCase):
    def test_show_true_when_eligible_and_not_dismissed(self):
        with app.test_request_context("/aws"):
            context = get_announcement_bar_context()
        self.assertTrue(context["show"])
        self.assertEqual(context["cta_url"], "https://ubuntu.com/test")

    def test_show_false_on_excluded_path(self):
        with app.test_request_context("/pro"):
            context = get_announcement_bar_context()
        self.assertFalse(context["show"])

    def test_show_false_when_dismissed(self):
        with app.test_request_context(
            "/aws", headers={"Cookie": f"{DISMISS_COOKIE_NAME}=test-id"}
        ):
            context = get_announcement_bar_context()
        self.assertFalse(context["show"])
