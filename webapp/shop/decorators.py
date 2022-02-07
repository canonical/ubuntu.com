import os
from distutils.util import strtobool
from functools import wraps

import flask
import talisker.requests

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.badgr.api import BadgrAPI
from webapp.shop.api.edx.api import EdxAPI
from requests import Session


QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"
BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"

AREA_LIST = {
    "account": "Account pages",
    "advantage": "UA pages",
    "cube": "Cube",
}

PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
    "guest": "Endpoint won't allow logged in user.",
    "user_or_guest": "Endpoint needs user or guest token.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
}

MARKETING_FLAGS = {
    "utm_campaign": "salesforce-campaign-id",
    "utm_source": "ad_source",
    "gclid": "google-click-id",
    "gbraid": "google-gbraid-id",
    "wbraid": "google-wbraid-id",
    "fbclid": "facebook-click-id",
}


def shop_decorator(area=None, permission=None, response="json", redirect=None):
    permission = permission if permission in PERMISSION_LIST else None
    response = response if response in RESPONSE_LIST else "json"
    area = area if area in AREA_LIST else "account"
    redirect_path = redirect or get_redirect_default(area)

    session = talisker.requests.get_session()
    badgr_session = init_badgr_session(area)
    edx_session = init_edx_session(area)

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            # Set marketing flag
            for query_parameter, metadata_key in MARKETING_FLAGS.items():
                if query_parameter in flask.request.args:
                    flask.session.pop(metadata_key, None)
                    value = flask.request.args.get(query_parameter)
                    flask.session[metadata_key] = value

            # shop under maintenance
            if strtobool(os.getenv("STORE_MAINTENANCE", "false")):
                return flask.render_template("advantage/maintenance.html")

            # if logged in, get rid of guest token
            user_token = flask.session.get("authentication_token")
            guest_token = flask.session.get("guest_authentication_token")

            if user_token and guest_token:
                flask.session.pop("guest_authentication_token")
                guest_token = None

            test_backend = flask.request.args.get("test_backend", "false")
            is_test_backend = strtobool(test_backend)

            if permission == "user" and response == "json":
                if not user_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user_or_guest" and response == "json":
                if not user_token and not guest_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user" and response == "html":
                if not user_token:
                    if flask.request.path == "/advantage":
                        return flask.render_template(
                            "advantage/index-no-login.html",
                            is_test_backend=is_test_backend,
                        )

                    return flask.redirect(
                        get_redirect_url(flask.request.path, is_test_backend)
                    )

            if permission == "guest" and response == "html":
                if user_token:
                    return flask.redirect(
                        f"{redirect_path}?test_backend=true"
                        if is_test_backend
                        else redirect_path
                    )

            return func(
                is_test_backend=is_test_backend,
                badgr_issuer=get_badgr_issuer(is_test_backend),
                badge_certification=get_certified_badge(is_test_backend),
                ua_contracts_api=get_ua_contracts_api_instance(
                    user_token, guest_token, response, is_test_backend, session
                ),
                badgr_api=get_badgr_api_instance(
                    area, is_test_backend, badgr_session
                ),
                edx_api=get_edx_api_instance(
                    area, is_test_backend, edx_session
                ),
                *args,
                **kwargs,
            )

        return decorated_function

    return decorator


def init_badgr_session(area) -> Session:
    if area != "cube":
        return None

    badgr_session = Session()
    talisker.requests.configure(badgr_session)

    return badgr_session


def init_edx_session(area) -> Session:
    if area != "cube":
        return None

    # This API lives under a sub-domain of ubuntu.com but requests to
    # it still need proxying, so we configure the session manually to
    # avoid it loading the configurations from environment variables,
    # since those default to not proxy requests for ubuntu.com sub-domains
    # and that is the intended behaviour for most of our apps
    proxies = {
        "http": os.getenv("HTTP_PROXY"),
        "https": os.getenv("HTTPS_PROXY"),
    }
    edx_session = Session()
    edx_session.proxies.update(proxies)
    talisker.requests.configure(edx_session)

    return edx_session


def get_redirect_default(area) -> str:
    redirect_path = "/account"
    if area == "advantage":
        redirect_path = "/advantage"
    elif area == "cube":
        redirect_path = "/cube/microcerts"

    return redirect_path


def get_api_url(is_test_backend) -> str:
    if is_test_backend:
        return flask.current_app.config["CONTRACTS_TEST_API_URL"]

    return flask.current_app.config["CONTRACTS_LIVE_API_URL"]


def get_badgr_url(is_test_backend) -> str:
    return (
        "https://api.test.badgr.io"
        if is_test_backend
        else "https://api.eu.badgr.com"
    )


def get_badgr_password(is_test_backend) -> str:
    return (
        os.getenv("BADGR_QA_PASSWORD")
        if is_test_backend
        else os.getenv("BADGR_PASSWORD")
    )


def get_edx_url(is_test_backend) -> str:
    return (
        "https://qa.cube.ubuntu.com"
        if is_test_backend
        else "https://cube.ubuntu.com"
    )


def get_edx_client_id(is_test_backend) -> str:
    return (
        os.getenv("CUBE_EDX_QA_CLIENT_ID")
        if is_test_backend
        else os.getenv("CUBE_EDX_CLIENT_ID")
    )


def get_edx_secret(is_test_backend) -> str:
    return (
        os.getenv("CUBE_EDX_CLIENT_QA_SECRET")
        if is_test_backend
        else os.getenv("CUBE_EDX_CLIENT_SECRET")
    )


def get_badgr_api_instance(area, is_test_backend, badgr_session) -> BadgrAPI:
    if area != "cube":
        return None

    return BadgrAPI(
        get_badgr_url(is_test_backend),
        os.getenv("BAGDR_USER"),
        get_badgr_password(is_test_backend),
        badgr_session,
    )


def get_edx_api_instance(area, is_test_backend, edx_session) -> EdxAPI:
    if area != "cube":
        return None

    return EdxAPI(
        get_edx_url(is_test_backend),
        get_edx_client_id(is_test_backend),
        get_edx_secret(is_test_backend),
        edx_session,
    )


def get_badgr_issuer(is_test_backend) -> str:
    return QA_BADGR_ISSUER if is_test_backend else BADGR_ISSUER


def get_certified_badge(is_test_backend) -> str:
    return QA_CERTIFIED_BADGE if is_test_backend else CERTIFIED_BADGE


def get_ua_contracts_api_instance(
    user_token, guest_token, response, is_test_backend, session
) -> UAContractsAPI:
    ua_contracts_api = UAContractsAPI(
        session=session,
        authentication_token=(user_token or guest_token),
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=get_api_url(is_test_backend),
    )

    if response == "html":
        ua_contracts_api.set_is_for_view(True)

    return ua_contracts_api


def get_redirect_url(redirect_path, is_test_backend) -> str:
    if is_test_backend:
        return (
            "/login?test_backend=true&"
            f"next={redirect_path}?test_backend=true"
        )

    return f"/login?next={redirect_path}"
