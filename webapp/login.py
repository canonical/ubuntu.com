# Standard library
from urllib.parse import quote, unquote

# Packages
import flask
import flask_openid
from pymacaroons import Macaroon

# Local
from webapp import auth
from webapp.api import advantage as advantage_api
from webapp.macaroons import MacaroonRequest, MacaroonResponse


open_id = flask_openid.OpenID(
    stateless=True, safe_roots=[], extension_responses=[MacaroonResponse]
)


@open_id.loginhandler
def login_handler():
    if auth.is_authenticated(flask.session):
        return flask.redirect(open_id.get_next_url())

    root = advantage_api.get_macaroon()

    for caveat in Macaroon.deserialize(root).third_party_caveats():
        if caveat.location == "login.ubuntu.com":
            openid_macaroon = MacaroonRequest(caveat_id=caveat.caveat_id)
            break

    flask.session["macaroon_root"] = root

    return open_id.try_login(
        "https://login.ubuntu.com",
        ask_for=["email", "nickname", "image"],
        ask_for_optional=["fullname"],
        extensions=[openid_macaroon],
    )


@open_id.after_login
def after_login(resp):
    flask.session["macaroon_discharge"] = resp.extensions["macaroon"].discharge

    if not resp.nickname:
        return flask.redirect("https://login.ubuntu.com")

    flask.session["openid"] = {
        "identity_url": resp.identity_url,
        "nickname": resp.nickname,
        "fullname": resp.fullname,
        "image": resp.image,
        "email": resp.email,
    }

    return flask.redirect(open_id.get_next_url())


def logout():
    return_to = flask.request.args.get("return_to") or flask.request.url_root

    # Make sure return_to is URL encoded
    if return_to == unquote(return_to):
        # Not encoded
        return_to = quote(return_to, safe="")

    if auth.is_authenticated(flask.session):
        auth.empty_session(flask.session)

    return flask.redirect(
        "https://login.ubuntu.com/+logout"
        f"?return_to={return_to}&return_now=True"
    )
