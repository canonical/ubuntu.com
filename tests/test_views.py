"""
Unit tests for webapp.views helper functions.
"""

# Standard library
from unittest import TestCase
from unittest.mock import Mock, patch

# Local application imports
from webapp.app import app
from webapp.views import (
    shorten_acquisition_url,
    process_local_communities,
    _build_mirror_list,
    download_thank_you,
    account_query,
    build_tutorials_query,
    match_tags,
    build_engage_page
)


class BaseViewTestCase(TestCase):
    """Base test case providing the Flask app."""

    def setUp(self):
        self.app = app
        self.app.testing = True


class TestShortenAcquisitionURL(BaseViewTestCase):
    """
    Unit tests for `webapp.views.shorten_acquisition_url`.

    Verifies that:
      • UTM parameters `utm_source`, `utm_medium`, `utm_campaign`
        are preserved, while long tracking params like fbclid/gclid
        are stripped.
      • Overly long query strings are shortened to under 255 chars.
      • URLs without extraneous parameters are returned untouched.

    """

    def test_shorten_acquisition_url(self):
        first_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpc"
            "&utm_campaign=7018e000000Lrr2AAC"
            "&fbclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF"
            "9SYy_aDXgpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73p"
            "lm8KSqnZJXAsol_n1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
            "&gclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9"
            "SYy_aDXgpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73p"
            "lm8KSqnZJXAsol_n1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
        )
        first_url_check = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpc"
            "&utm_campaign=7018e000000Lrr2AAC"
        )

        second_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpcrHds-f323rdf34v4t24fd"
            "fsfrdfSAsewetv_trfsdgdfg4234rchb534z2243h_rtgrcawretthfghff"
            "&utm_campaign=7018ihtrHdsf323rrdfSASYHe000000Lr8450oh2oEEDV"
            "EfdfodifnjvFSF0w94ngoinsdgfw4c12r2AAC"
            "&fbclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9SYy_aDX"
            "gpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73plm8KSqnZJXAsol_n"
            "1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
            "&gclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9SYy_aDXg"
            "psIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73plm8KSqnZJXAsol_n1"
            "J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
        )
        second_url_check = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge"
        )

        third_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=button"
            "&utm_campaign=7018jyr44t534e000000Lrr2AAC"
        )

        self.assertEqual(shorten_acquisition_url(first_url), first_url_check)
        self.assertLess(len(shorten_acquisition_url(first_url)), 255)

        self.assertEqual(shorten_acquisition_url(second_url), second_url_check)
        self.assertLess(len(shorten_acquisition_url(second_url)), 255)

        self.assertEqual(shorten_acquisition_url(third_url), third_url)
        self.assertLess(len(shorten_acquisition_url(third_url)), 255)


class TestProcessLocalCommunities(BaseViewTestCase):
    """
    Unit tests for `webapp.views.process_local_communities`.

    This view builds map markers from local community metadata.
    These tests:
    • Patch `flask.render_template` to capture template arguments.
    • Feed in sample metadata with name, continent and coordinates.
    • Ensure coordinates (including negative longitude) are parsed
        to floats correctly and passed to the template.
    """

    @patch("flask.render_template")
    def test_coordinate_parsing(self, mock_render):
        mock_local_communities = Mock()
        mock_local_communities.get_category_index_metadata.return_value = [
            {
                "name": "Ubuntu Africa",
                "continent": "africa",
                "coordinates": "4.71111, −74.07222",
            },
            {
                "name": "Ubuntu Europe",
                "continent": "europe",
                "coordinates": "52.5200, 13.4050",
            },
        ]

        display_func = process_local_communities(mock_local_communities)
        display_func()

        mock_render.assert_called_once()
        map_markers = mock_render.call_args.kwargs["map_markers"]
        self.assertEqual(len(map_markers), 2)
        africa_marker = next(
            m for m in map_markers if m["name"] == "Ubuntu Africa"
        )
        self.assertEqual(africa_marker["lat"], 4.71111)
        self.assertEqual(africa_marker["lon"], -74.07222)


class TestBuildMirrorList(BaseViewTestCase):
    """
    Unit tests for the internal helper `_build_mirror_list`.

    `_build_mirror_list` reads an XML feed of Ubuntu mirrors,
    parses it with `feedparser` and returns a list of dictionaries.

    Covered behaviours:
      • Normal case – all mirrors returned with `link` and `bandwidth`.
      • Local filtering – only secure HTTPS mirrors for a given
        `country_code` are returned when `local=True`.
      • No country code – returns an empty list.
      • File not found / IO error – returns an empty list gracefully.
    """

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open")
    def test_all(self, mock_open, mock_parse):
        mock_open.return_value.__enter__.return_value.read.return_value = (
            "<xml/>"
        )
        mirrors = [
            {
                "link": "http://mirror1.example.com/ubuntu/",
                "mirror_bandwidth": "1000",
                "mirror_countrycode": "GB",
            },
            {
                "link": "https://mirror2.example.com/ubuntu/",
                "mirror_bandwidth": "2000",
                "mirror_countrycode": "US",
            },
        ]
        mock_parse.return_value = Mock(entries=mirrors)
        result = _build_mirror_list()
        expected = [
            {
                "link": mirrors[0]["link"],
                "bandwidth": mirrors[0]["mirror_bandwidth"],
            },
            {
                "link": mirrors[1]["link"],
                "bandwidth": mirrors[1]["mirror_bandwidth"],
            },
        ]
        self.assertEqual(result, expected)

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open")
    def test_local_filters(self, mock_open, mock_parse):
        mock_open.return_value.__enter__.return_value.read.return_value = (
            "<xml/>"
        )
        mirrors = [
            {
                "link": "https://us-secure.example.com/ubuntu/",
                "mirror_bandwidth": "5000",
                "mirror_countrycode": "US",
            },
            {
                "link": "http://us-insecure.example.com/ubuntu/",
                "mirror_bandwidth": "4000",
                "mirror_countrycode": "US",
            },
            {
                "link": "https://de.example.com/ubuntu/",
                "mirror_bandwidth": "3000",
                "mirror_countrycode": "DE",
            },
        ]
        mock_parse.return_value = Mock(entries=mirrors)
        result = _build_mirror_list(local=True, country_code="US")
        self.assertEqual(
            result,
            [
                {
                    "link": mirrors[0]["link"],
                    "bandwidth": mirrors[0]["mirror_bandwidth"],
                }
            ],
        )

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open")
    def test_local_no_country(self, mock_open, mock_parse):
        mock_open.return_value.__enter__.return_value.read.return_value = (
            "<xml/>"
        )
        mock_parse.return_value = Mock(
            entries=[
                {
                    "link": "https://any.example.com/ubuntu/",
                    "mirror_bandwidth": "1234",
                    "mirror_countrycode": "FR",
                }
            ]
        )
        result = _build_mirror_list(local=True, country_code=None)
        self.assertEqual(result, [])

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open", side_effect=IOError)
    def test_file_not_found(self, mock_open, mock_parse):
        mock_parse.return_value = Mock(entries=[])
        self.assertEqual(_build_mirror_list(), [])


class TestDownloadThankYou(BaseViewTestCase):
    """
    Unit tests for the download thank-you page view `download_thank_you`.

    This view renders a template based on the product (desktop/server)
    and query parameters in the request URL.

    Validated behaviours:
      • All parameters present – correct template and parameters passed.
      • Space in `architecture` is normalised to `+`.
      • Missing required parameters aborts with HTTP 400.
      • No parameters – template still renders with empty values.
      • Version missing but architecture present – still renders.
      • Always returns 'no-cache' header in the response.

    """

    @patch("flask.render_template")
    def test_basic(self, mock_render):
        mock_render.return_value = "ok"
        with self.app.test_request_context(
            "/?version=22.04&architecture=amd64&lts=true"
        ):
            body, headers = download_thank_you("desktop")
        mock_render.assert_called_once_with(
            "download/desktop/thank-you.html",
            version="22.04",
            architecture="amd64",
            lts="true",
        )
        self.assertEqual(body, "ok")
        self.assertEqual(headers.get("Cache-Control"), "no-cache")

    @patch("flask.render_template")
    def test_space_in_architecture(self, mock_render):
        mock_render.return_value = "ok"
        with self.app.test_request_context(
            "/?version=22.04&architecture=amd 64"
        ):
            download_thank_you("server")
        self.assertEqual(
            mock_render.call_args.kwargs["architecture"], "amd+64"
        )

    def test_missing_architecture_aborts(self):
        from werkzeug.exceptions import HTTPException

        with self.app.test_request_context("/?version=22.04"):
            with self.assertRaises(HTTPException) as cm:
                download_thank_you("desktop")
        self.assertEqual(cm.exception.code, 400)

    @patch("flask.render_template")
    def test_no_params(self, mock_render):
        mock_render.return_value = "ok"
        with self.app.test_request_context("/"):
            body, headers = download_thank_you("server")
        mock_render.assert_called_once_with(
            "download/server/thank-you.html",
            version="",
            architecture="",
            lts="",
        )
        self.assertEqual(body, "ok")
        self.assertEqual(headers.get("Cache-Control"), "no-cache")

    @patch("flask.render_template")
    def test_no_version(self, mock_render):
        mock_render.return_value = "ok"
        with self.app.test_request_context("/?architecture=amd64"):
            body, headers = download_thank_you("desktop")
        mock_render.assert_called_once_with(
            "download/desktop/thank-you.html",
            version="",
            architecture="amd64",
            lts="",
        )
        self.assertEqual(body, "ok")
        self.assertEqual(headers.get("Cache-Control"), "no-cache")


class TestAccountQuery(BaseViewTestCase):
    """
    Unit tests for the JSON API view `account_query`.

    This view returns information about the currently logged-in user
    from `flask.session`.

    Tests ensure:
      • When `openid` and `authentication_token` exist in session,
        the response JSON contains all expected fields with defaults
        for flags.
      • When no user session is present, JSON contains
        `{"account": None}` with status 200.
    """

    def test_account_query_with_user(self):
        import flask

        with self.app.test_request_context("/any-url"):
            flask.session["openid"] = {
                "fullname": "Alice Example",
                "email": "alice@example.com",
                # omit flags so defaults (False) are exercised
            }
            flask.session["authentication_token"] = "tok123"
            resp = account_query()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            resp.get_json(),
            {
                "account": {
                    "fullname": "Alice Example",
                    "email": "alice@example.com",
                    "authentication_token": "tok123",
                    "is_community_member": False,
                    "is_credentials_admin": False,
                    "is_credentials_support": False,
                }
            },
        )

    def test_account_query_no_user(self):
        with self.app.test_request_context("/any-url"):
            resp = account_query()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json(), {"account": None})


class TestBuildingTutorialsQuery(BaseViewTestCase):
    """
    Unit tests for `build_tutorials_query`.

    `build_tutorials_query` returns a Flask view function that filters
    a tutorials index (coming from a discourse parser) by query params.

    Tests ensure:
      • With `topic` parameter in the request, only tutorials whose
        categories include that topic are returned, preserving order.
      • The `created_at` field is returned unchanged and
        difficulty levels match the input.
      • When no topic parameter is supplied, an empty list is returned.
      • When tutorials are missing expected keys like `categories`
    """

    def _make_tutorials_docs(self, tutorials):
        class PlaceholderAPI:
            base_url = "https://discourse.example.com"

        class PlaceholderParser:
            def __init__(self, tutorials):
                self.tutorials = tutorials
                self.index_topic = 999
                self.api = PlaceholderAPI()

            def parse(self):
                pass

            def parse_topic(self, topic):
                pass

        class PlaceholderDocs:
            def __init__(self, tutorials):
                self.parser = PlaceholderParser(tutorials)

        return PlaceholderDocs(tutorials)

    def test_building_tutorials_query(self):
        tutorials = [
            {
                "title": "Tutorial 1",
                "slug": "tutorial-1",
                "categories": ["c1", "c2"],
                "author": "Author 1",
                "difficulty": 3,
                "created_at": "2023-01-01T00:00:00Z",
            },
            {
                "title": "Tutorial 2",
                "slug": "tutorial-2",
                "categories": ["c2"],
                "author": "Author 2",
                "difficulty": 2,
                "created_at": "2023-02-01T00:00:00Z",
            },
            {
                "title": "Tutorial 3",
                "slug": "tutorial-3",
                "categories": ["c1"],
                "author": "Author 3",
                "difficulty": 1,
                "created_at": "2023-03-01T00:00:00Z",
            },
        ]
        docs = self._make_tutorials_docs(tutorials)

        with self.app.test_request_context("/tutorials?topic=c2"):
            view = build_tutorials_query(tutorials_docs=docs)
            resp = view()  # Flask Response
            data = resp.get_json()  # directly parse JSON
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["title"], "Tutorial 1")
        self.assertEqual(data[1]["title"], "Tutorial 2")

        # Check that the created_at field is parsed correctly
        self.assertEqual(data[0]["created_at"], "2023-01-01T00:00:00Z")
        self.assertEqual(data[1]["created_at"], "2023-02-01T00:00:00Z")
        self.assertEqual([d["difficulty"] for d in data], [3, 2])

    def test_building_tutorials_query_no_topic(self):
        tutorials = [
            {
                "title": "Tutorial 1",
                "slug": "tutorial-1",
                "categories": ["c1", "c2"],
                "author": "Author 1",
                "difficulty": 3,
                "created_at": "2023-01-01T00:00:00Z",
            },
            {
                "title": "Tutorial 2",
                "slug": "tutorial-2",
                "categories": ["c2"],
                "author": "Author 2",
                "difficulty": 2,
                "created_at": "2023-02-01T00:00:00Z",
            },
            {
                "title": "Tutorial 3",
                "slug": "tutorial-3",
                "categories": ["c1"],
                "author": "Author 3",
                "difficulty": 1,
                "created_at": "2023-03-01T00:00:00Z",
            },
        ]
        docs = self._make_tutorials_docs(tutorials)

        with self.app.test_request_context("/tutorials"):
            view = build_tutorials_query(tutorials_docs=docs)
            resp = view()  # Flask Response
            data = resp.get_json()  # directly parse JSON
        self.assertEqual(len(data), 0)

    def test_building_tutorials_query_missing_keys(self):
        tutorials = [
            {
                "title": "Tutorial 1",
                "slug": "tutorial-1",
                "author": "Author 1",  # missing categories
                "difficulty": 3,
                "created_at": "2023-01-01T00:00:00Z",
            },
            {
                "title": "Tutorial 2",
                "slug": "tutorial-2",
                "categories": ["c2"],
                "author": "Author 2",  # missing difficulty
                "created_at": "2023-02-01T00:00:00Z",
            },
            {
                "title": "Tutorial 3",
                "slug": "tutorial-3",
                "author": "Author 3",  # missing categories and difficulty
                "created_at": "2023-03-01T00:00:00Z",
            },
            {
                "title": "Tutorial 4",
                "slug": "tutorial-4",
                "categories": ["c2"],
                "author": "Author 4",
                "difficulty": 2,
                "created_at": "2024-02-01T00:00:00Z",
            },
        ]
        docs = self._make_tutorials_docs(tutorials)

        with self.app.test_request_context("/tutorials?topic=c2"):
            view = build_tutorials_query(tutorials_docs=docs)
            resp = view()  # Flask Response
            data = resp.get_json()  # directly parse JSON
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["title"], "Tutorial 4")
        self.assertEqual(data[1]["title"], "Tutorial 2")

        # Check that the created_at field is parsed correctly
        self.assertEqual(data[0]["created_at"], "2024-02-01T00:00:00Z")
        self.assertEqual(data[1]["created_at"], "2023-02-01T00:00:00Z")


class TestMatchTags(TestCase):
    """
    Unit tests for the helper `match_tags`.

    `match_tags` checks if two lists of tags overlap,
    ignoring case and surrounding whitespace.

    Covered behaviours:
      • True when overlap exists, even with different case/whitespace.
      • False when there is no overlap at all.
      • False when either list is empty.
      • True for exact matches.
    """

    def test_match_true_case_insensitive_whitespace(self):
        self.assertTrue(
            match_tags([" Cloud ", "DevOps"], ["devops", "security"])
        )

    def test_match_false_no_overlap(self):
        self.assertFalse(
            match_tags(["cloud", "data"], ["ai", "ml", "security"])
        )

    def test_empty_lists(self):
        self.assertFalse(match_tags([], []))

    def test_partial_empty(self):
        self.assertFalse(match_tags(["cloud"], []))
        self.assertFalse(match_tags([], ["cloud"]))

    def test_exact_match(self):
        self.assertTrue(match_tags(["cloud"], ["cloud"]))


class TestEngageTranslations(TestCase):
    def _make_mock_engage_pages(self, metadata):
        mock_engage_pages = Mock()
        mock_engage_pages.api = Mock()
        mock_engage_pages.api.base_url = "https://ubuntu.discourse.com/"
        # Always return provided metadata regardless of path
        mock_engage_pages.get_engage_page.return_value = metadata
        return mock_engage_pages

    @patch("flask.render_template")
    def test_additional_resources_spanish(self, mock_render):
        metadata = {"language": "es", "type": "whitepaper"}
        view = build_engage_page(self._make_mock_engage_pages(metadata))

        # language parameter isn't used for translation, but include for path build
        view(language="es", page="test-slug")

        mock_render.assert_called_once()
        _, kwargs = mock_render.call_args
        self.assertEqual(
            kwargs["additional_resources_text"], "Recursos adicionales")
        self.assertEqual(kwargs["language"], "es")

    @patch("flask.render_template")
    def test_additional_resources_pt_br_normalization(self, mock_render):
        metadata = {"language": "pt-BR", "type": "blog"}
        view = build_engage_page(self._make_mock_engage_pages(metadata))

        view(language="pt", page="test-slug")

        mock_render.assert_called_once()
        _, kwargs = mock_render.call_args
        self.assertEqual(
            kwargs["additional_resources_text"], "Recursos adicionais")
        self.assertEqual(kwargs["language"], "pt-BR")

    @patch("flask.render_template")
    def test_additional_resources_fallback_to_english(self, mock_render):
        metadata = {"language": "xx", "type": "event"}
        view = build_engage_page(self._make_mock_engage_pages(metadata))

        view(language="xx", page="test-slug")

        mock_render.assert_called_once()
        _, kwargs = mock_render.call_args
        self.assertEqual(
            kwargs["additional_resources_text"], "Additional Resources")
        self.assertEqual(kwargs["language"], "xx")
