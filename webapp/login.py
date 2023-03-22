import os

# Packages
import flask
import flask_openid
import talisker.requests
from pymacaroons import Macaroon
from launchpadlib.launchpad import Launchpad

# Local
from webapp.macaroons import (
    binary_serialize_macaroons,
    MacaroonRequest,
    MacaroonResponse,
)


login_url = os.getenv("CANONICAL_LOGIN_URL", "https://login.ubuntu.com")

open_id = flask_openid.OpenID(
    store_factory=lambda: None,
    safe_roots=[],
    extension_responses=[MacaroonResponse],
)
session = talisker.requests.get_session()

COMMUNITY_TEAM = "ubuntumembers"


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
                user_session["openid"]["is_community_member"]
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
    api_url = os.getenv("CONTRACTS_API_URL", "https://contracts.canonical.com")

    if user_info(flask.session):
        return flask.redirect(open_id.get_next_url())

    response = session.request(
        method="get", url=f"{api_url}/v1/canonical-sso-macaroon"
    )
    flask.session["macaroon_root"] = response.json()["macaroon"]

    for caveat in Macaroon.deserialize(
        flask.session["macaroon_root"]
    ).third_party_caveats():
        if caveat.location == "login.ubuntu.com":
            openid_macaroon = MacaroonRequest(caveat_id=caveat.caveat_id)
            break

    return open_id.try_login(
        login_url,
        ask_for=["email", "nickname", "image"],
        ask_for_optional=["fullname"],
        extensions=[openid_macaroon],
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

    launchpad = Launchpad.login_anonymously(
        "ubuntu.com/pro", "production", version="devel"
    )

    lp_user = launchpad.people.getByEmail(email=resp.email)
    is_community_member = lp_user in launchpad.people(COMMUNITY_TEAM).members

    flask.session["openid"] = {
        "identity_url": resp.identity_url,
        "nickname": resp.nickname,
        "fullname": resp.fullname,
        "image": resp.image,
        "email": resp.email,
        "is_community_member": is_community_member,
    }

    return flask.redirect(open_id.get_next_url())


def logout():
    return_to = flask.request.args.get("return_to") or flask.request.path

    # Protect against redirect loop if return_to is logout
    if return_to == "/logout":
        return_to = "/"

    empty_session(flask.session)

    return flask.redirect(return_to)
