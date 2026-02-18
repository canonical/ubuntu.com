# Standard library
import os
import re

import time_machine

# Packages
from bs4 import BeautifulSoup
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestBlogNotice(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don't record auth parameters

        IMPORTANT: If there are changes to the APIs called in these tests,
        they need to be re-recorded in cassettes. See HACKING.md for
        instructions on how to update cassettes.
        """
        return {
            "record_mode": os.environ.get("VCR_RECORD_MODE", "none"),
            "decode_compressed_response": True,
            "filter_headers": ["Authorization", "Cookie"],
        }

    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_blog_date_notice(self):
        """
        Check old blog posts contain a message notifying the reader
        that the blog post is old.
        """

        # Make sure the date is consistent
        with time_machine.travel("2023-10-10"):
            # posts written more than one year ago should
            # contain "more than x year(s) old"
            one_year_old = self.client.get(
                "/blog/level-up-linux-gaming-new-steam-snap"
            )
            self.assertEqual(one_year_old.status_code, 200)
            one_year_old_soup = BeautifulSoup(one_year_old.data, "html.parser")
            one_year_old_notice = one_year_old_soup.find(id="date-notice")
            self.assertTrue(
                re.search(r"1\s+year\s+ago", one_year_old_notice.text)
            )

            # posts updated more than one year ago should
            # contain "last updated x year(s) ago"
            three_years_old = self.client.get(
                "/blog/tutorials-for-everyone-from-everyone"
            )
            self.assertEqual(three_years_old.status_code, 200)
            three_years_old_soup = BeautifulSoup(
                three_years_old.data, "html.parser"
            )
            three_years_old_notice = three_years_old_soup.find(
                id="date-notice"
            )
            self.assertTrue(
                re.search(
                    r"last\s+updated\s+3\s+years\s+ago",
                    three_years_old_notice.text,
                )
            )

            # posts updated less that a year ago should not have a notice
            updated_recently = self.client.get(
                "/blog/top-6-projects-from-our-hackathon"
            )
            self.assertEqual(updated_recently.status_code, 200)
            updated_recently_soup = BeautifulSoup(
                updated_recently.data, "html.parser"
            )
            updated_recently_notice = updated_recently_soup.find(
                id="date-notice"
            )
            self.assertIsNone(updated_recently_notice)

            # posts written less that a year ago should not have a notice
            new_blog = self.client.get("/blog/kubeflow-appliance-aws")
            self.assertEqual(new_blog.status_code, 200)
            new_blog_soup = BeautifulSoup(new_blog.data, "html.parser")
            new_blog_notice = new_blog_soup.find(id="date-notice")
            self.assertIsNone(new_blog_notice)
