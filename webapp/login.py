# Packages
import flask
import flask_openid
import talisker.requests
import requests
from pymacaroons import Macaroon
from django_openid_auth.teams import TeamsRequest, TeamsResponse

from webapp.macaroons import (
    binary_serialize_macaroons,
    MacaroonRequest,
    MacaroonResponse,
)
from canonicalwebteam.flask_base.env import get_flask_env

COMMUNITY_TEAM = "ubuntumembers"
CREDENTIALS_TEAM = "canonical-credentials"
CREDENTIALS_SUPPORT = "canonical-credentials-support"

login_url = get_flask_env("CANONICAL_LOGIN_URL", "https://login.ubuntu.com")

open_id = flask_openid.OpenID(
    store_factory=lambda: None,
    safe_roots=[],
    extension_responses=[MacaroonResponse, TeamsResponse],
)
session = talisker.requests.get_session()


def user_info(user_session):
    """
    Checks if the user is authenticated from the session
    Returns True if the user is authenticated
    """

    if "openid" in user_session and "authentication_token" in user_session:
        return {
            "fullname": user_session["openid"]["fullname"],
            "email": user_session["openid"]["email"],
            "authentication_token": user_session["authentication_token"],
            "is_community_member": (
                user_session["openid"].get("is_community_member", False)
            ),
            "is_credentials_admin": (
                user_session["openid"].get("is_credentials_admin", False)
            ),
            "is_credentials_support": (
                user_session["openid"].get("is_credentials_support", False)
            ),
        }
    else:
        return None


def empty_session(user_session):
    """
    Remove items from session   
    """

    user_session.pop("macaroon_root", None)
    user_session.pop("authentication_token", None)
    user_session.pop("openid", None)
    user_session.pop("salesforce-campaign-id", None)
    user_session.pop("ad_source", None)
    user_session.pop("google-click-id", None)
    user_session.pop("google-gbraid-id", None)
    user_session.pop("google-wbraid-id", None)
    user_session.pop("facebook-click-id", None)


@open_id.loginhandler
def login_handler():
    api_url = get_flask_env(
        "CONTRACTS_API_URL", "https://contracts.canonical.com"
    )
    api_url = "https://contracts.canonical.com"

    if flask.request.args.get("set_large_cookie"):
        try:
            size = int(
                flask.request.args.get(
                    "size",
                    get_flask_env("TEST_LARGE_COOKIE_BYTES", "16384"),
                )
            )
        except ValueError:
            size = 16384
        resp = flask.redirect(
            flask.request.path
            + (
                "?next=" + flask.request.args.get("next")
                if flask.request.args.get("next")
                else ""
            )
        )
        resp.set_cookie("test_large_cookie", "X" * size, max_age=600)
        return resp

    cookie_header = flask.request.headers.get("Cookie", "")
    try:
        max_bytes = int(get_flask_env("MAX_COOKIE_HEADER_BYTES", "8192"))
    except ValueError:
        max_bytes = 8192
    if len(cookie_header) > max_bytes:
        empty_session(flask.session)
        try:
            flask.current_app.extensions["sentry"].captureMessage(
                "Trimmed session due to oversized Cookie header",
                extra={"cookie_size": len(cookie_header)},
            )
        except Exception:
            pass

    if user_info(flask.session):
        return flask.redirect(open_id.get_next_url())

    try:
        response = session.request(
            method="get", url=f"{api_url}/v1/canonical-sso-macaroon"
        )
        flask.session["macaroon_root"] = response.json()["macaroon"]
    except Exception as e:
        try:
            flask.current_app.extensions["sentry"].captureException()
        except Exception:
            pass
        return (
            flask.render_template("templates/_error_login.html"),
            502,
        )

    openid_macaroon = None
    for caveat in Macaroon.deserialize(
        flask.session["macaroon_root"]
    ).third_party_caveats():
        if caveat.location == "login.ubuntu.com":
            openid_macaroon = MacaroonRequest(caveat_id=caveat.caveat_id)
            break
    if openid_macaroon is None:
        try:
            flask.current_app.extensions["sentry"].captureMessage(
                "Missing login.ubuntu.com caveat in macaroon_root"
            )
        except Exception:
            pass
        return (
            flask.render_template("templates/_error_login.html"),
            500,
        )

    return open_id.try_login(
        login_url,
        ask_for=["email", "nickname", "image"],
        ask_for_optional=["fullname"],
        extensions=[
            openid_macaroon,
            TeamsRequest(
                query_membership=[
                    COMMUNITY_TEAM,
                    CREDENTIALS_TEAM,
                    CREDENTIALS_SUPPORT,
                ],
                lp_ns_uri="http://ns.launchpad.net/2007/openid-teams",
            ),
        ],
    )


@open_id.after_login
def after_login(resp):
    try:
        root = Macaroon.deserialize(flask.session.pop("macaroon_root"))
    except KeyError:
        return (
            flask.render_template(
                "templates/_error_login.html",
            ),
            400,
        )

    bound = root.prepare_for_request(
        Macaroon.deserialize(resp.extensions["macaroon"].discharge)
    )
    flask.session["authentication_token"] = binary_serialize_macaroons(
        [root, bound]
    ).decode("utf-8")

    if not resp.nickname:
        return flask.redirect(login_url)

    is_community_member = COMMUNITY_TEAM in resp.extensions["lp"].is_member
    is_credentials_admin = CREDENTIALS_TEAM in resp.extensions["lp"].is_member
    is_credentials_support = (
        CREDENTIALS_SUPPORT in resp.extensions["lp"].is_member
    )

    print("resp", resp.identity_url)
    print("resp", resp.email)
    print("resp", resp.image)
    print("resp", resp.nickname)
    print("resp", resp.fullname)

    flask.session["openid"] = {
        "identity_url": resp.identity_url,
        "nickname": resp.nickname,
        "fullname": resp.fullname,
        "image": resp.image,
        "email": resp.email,
        "is_community_member": is_community_member,
        "is_credentials_admin": is_credentials_admin,
        "is_credentials_support": is_credentials_support,
    }

    return flask.redirect(open_id.get_next_url())


def logout():
    return_to = flask.request.args.get("return_to") or flask.request.path

    # Protect against redirect loop if return_to is logout
    if return_to == "/logout":
        return_to = "/"

    empty_session(flask.session)

    return flask.redirect(return_to)
