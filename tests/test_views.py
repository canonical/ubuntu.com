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
)


class BaseViewTestCase(TestCase):
    """Base test case providing the Flask app."""

    def setUp(self):
        self.app = app
        self.app.testing = True


class TestShortenAcquisitionURL(BaseViewTestCase):
    """Tests for shorten_acquisition_url."""

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
        second_url_check = "https://ubuntu.com/engage/secure-kubernetes-at-the-edge"

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
    """Tests for process_local_communities."""

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
        africa_marker = next(m for m in map_markers if m["name"] == "Ubuntu Africa")
        self.assertEqual(africa_marker["lat"], 4.71111)
        self.assertEqual(africa_marker["lon"], -74.07222)


class TestBuildMirrorList(BaseViewTestCase):
    """Tests for _build_mirror_list."""

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open")
    def test_all(self, mock_open, mock_parse):
        mock_open.return_value.__enter__.return_value.read.return_value = "<xml/>"
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
        mock_parse.return_value = type("F", (), {"entries": mirrors})()
        result = _build_mirror_list()
        expected = [
            {"link": mirrors[0]["link"], "bandwidth": mirrors[0]["mirror_bandwidth"]},
            {"link": mirrors[1]["link"], "bandwidth": mirrors[1]["mirror_bandwidth"]},
        ]
        self.assertEqual(result, expected)

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open")
    def test_local_filters(self, mock_open, mock_parse):
        mock_open.return_value.__enter__.return_value.read.return_value = "<xml/>"
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
        mock_parse.return_value = type("F", (), {"entries": mirrors})()
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
        mock_open.return_value.__enter__.return_value.read.return_value = "<xml/>"
        mock_parse.return_value = type(
            "F",
            (),
            {
                "entries": [
                    {
                        "link": "https://any.example.com/ubuntu/",
                        "mirror_bandwidth": "1234",
                        "mirror_countrycode": "FR",
                    }
                ]
            },
        )()
        result = _build_mirror_list(local=True, country_code=None)
        self.assertEqual(result, [])

    @patch("webapp.views.feedparser.parse")
    @patch("builtins.open", side_effect=IOError)
    def test_file_not_found(self, mock_open, mock_parse):
        mock_parse.return_value = type("F", (), {"entries": []})()
        self.assertEqual(_build_mirror_list(), [])


class TestDownloadThankYou(BaseViewTestCase):
    """Tests for download_thank_you."""

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
        with self.app.test_request_context("/?version=22.04&architecture=amd 64"):
            download_thank_you("server")
        self.assertEqual(mock_render.call_args.kwargs["architecture"], "amd+64")

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


class TestAccountQuery(BaseViewTestCase):
    """Tests for account_query without mocking user_info."""

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
