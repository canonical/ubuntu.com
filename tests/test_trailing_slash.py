import os
import re
import tempfile
import unittest

import flask
import yaml
from canonicalwebteam.flask_base.context import clear_trailing_slash
from canonicalwebteam.yaml_responses.flask_helpers import prepare_redirects

from webapp.app import app
from webapp.trailing_slash import init_trailing_slash_redirects


class TestTrailingSlashRedirects(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def assert_redirect(self, path, status, location):
        response = self.client.get(path)

        self.assertEqual(response.status_code, status)
        self.assertEqual(response.headers["Location"], location)

    def test_trailing_slash_is_a_permanent_redirect(self):
        self.assert_redirect("/blog/", 301, "http://localhost/blog")
        self.assert_redirect("/certified/", 301, "http://localhost/certified")

    def test_query_string_is_kept(self):
        self.assert_redirect(
            "/blog/?topic=design", 301, "http://localhost/blog?topic=design"
        )

    def test_usn_ids_with_any_number_of_digits(self):
        for usn_id in ["1-1", "436-2", "3717-1"]:
            for path in [
                f"/security/notices/{usn_id}",
                f"/usn/USN-{usn_id}",
                f"/security/notices/usn/USN-{usn_id}",
            ]:
                self.assert_redirect(
                    path, 301, f"/security/notices/USN-{usn_id}"
                )

    def test_legacy_usn_link_ends_on_the_notice(self):
        # usn.ubuntu.com/127-1/ is rewritten to this URL by nginx
        self.assert_redirect(
            "/security/notices/127-1/",
            301,
            "http://localhost/security/notices/127-1",
        )

    def test_developer_root_is_a_permanent_redirect(self):
        self.assert_redirect("/developer", 301, "/desktop/developers")

    def test_legacy_host_roots_are_permanent_redirects(self):
        # developer, cloud, tour, certification and usn.ubuntu.com are
        # rewritten to these paths by nginx
        for path, target in {
            "/public-cloud": "/cloud/public-cloud",
            "/desktop/features": "/desktop",
            "/certification": "/certified",
            "/usn": "/security/notices",
        }.items():
            self.assert_redirect(path, 301, target)


class TestRedirectTargets(unittest.TestCase):
    def test_internal_targets_have_no_trailing_slash(self):
        """
        A target ending in a slash costs a hop, as the app then redirects it
        to the slash-less URL. Targets on other hosts are not ours to change.
        """
        root = os.path.join(os.path.dirname(__file__), "..")
        offenders = []

        for filename in ["redirects.yaml", "permanent-redirects.yaml"]:
            with open(os.path.join(root, filename)) as file:
                rules = yaml.safe_load(file) or {}

            for source, target in rules.items():
                path = re.split(r"[?#]", str(target))[0]

                if (
                    not re.match(r"(https?:)?//", path)
                    and path != "/"
                    and path.endswith("/")
                ):
                    offenders.append(f"{source}: {target}")

        self.assertEqual(offenders, [])


class TestIntentionalAddSlashRedirects(unittest.TestCase):
    def setUp(self):
        root = tempfile.TemporaryDirectory()
        self.addCleanup(root.cleanup)

        with open(os.path.join(root.name, "redirects.yaml"), "w") as file:
            file.write("server/docs: /server/docs/\n")

        os.mkdir(os.path.join(root.name, "webapp"))
        test_app = flask.Flask(
            __name__, root_path=os.path.join(root.name, "webapp")
        )
        test_app.before_request(clear_trailing_slash)
        test_app.before_request(
            prepare_redirects(os.path.join(root.name, "redirects.yaml"))
        )
        test_app.add_url_rule("/server/docs/", "docs", lambda: "docs")
        test_app.add_url_rule("/other", "other", lambda: "other")
        init_trailing_slash_redirects(test_app)

        self.client = test_app.test_client()

    def test_redirect_that_adds_a_slash_is_not_undone(self):
        response = self.client.get("/server/docs")
        self.assertEqual(response.headers["Location"], "/server/docs/")

        response = self.client.get("/server/docs/")
        self.assertEqual(response.status_code, 200)

    def test_other_trailing_slashes_are_still_removed(self):
        response = self.client.get("/other/")

        self.assertEqual(response.status_code, 301)
        self.assertEqual(
            response.headers["Location"], "http://localhost/other"
        )
