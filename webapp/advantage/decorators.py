import os
from distutils.util import strtobool
from functools import wraps

import flask
from flask import g
import talisker.requests

from webapp.advantage.ua_contracts.api import UAContractsAPI
from webapp.cube.api import BadgrAPI, EdxAPI
from webapp.login import user_info
from requests import Session


PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
    "user_or_guest": "Endpoint needs user or guest token.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
}

MARKETING_FLAGS = {
    "utm_campaign": "salesforce-campaign-id",
    "gclid": "google-click-id",
    "gbraid": "google-gbraid-id",
    "wbraid": "google-wbraid-id",
    "fbclid": "facebook-click-id",
}


def get_api_url(is_test_backend) -> str:
    if is_test_backend:
        return flask.current_app.config["CONTRACTS_TEST_API_URL"]

    return flask.current_app.config["CONTRACTS_LIVE_API_URL"]


def advantage_decorator(permission=None, response="json"):
    session = talisker.requests.get_session()

    if permission not in PERMISSION_LIST:
        permission = None
    if response not in RESPONSE_LIST:
        response = "json"

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            # Set marketing flag
            for query_parameter, metadata_key in MARKETING_FLAGS.items():
                if query_parameter in flask.request.args:
                    flask.session.pop(metadata_key, None)
                    value = flask.request.args.get(query_parameter)
                    flask.session[metadata_key] = value

            # UA under maintenance
            if strtobool(os.getenv("STORE_MAINTENANCE", "false")):
                return flask.render_template("advantage/maintenance.html")

            # if logged in, get rid of guest token
            if user_info(flask.session):
                if flask.session.get("guest_authentication_token"):
                    flask.session.pop("guest_authentication_token")

            test_backend = flask.request.args.get("test_backend", "false")
            is_test_backend = strtobool(test_backend)
            user_token = flask.session.get("authentication_token")
            guest_token = flask.session.get("guest_authentication_token")

            if permission == "user" and response == "html":
                if not user_info(flask.session):
                    if flask.request.path != "/advantage":
                        return flask.redirect(
                            "/advantage?test_backend=true"
                            if is_test_backend
                            else "/advantage"
                        )

                    return flask.render_template(
                        "advantage/index-no-login.html",
                        is_test_backend=is_test_backend,
                    )

            if permission == "user" and response == "json":
                if not user_info(flask.session):
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user_or_guest" and response == "json":
                if not user_info(flask.session) and not guest_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            # init API instance
            g.api = UAContractsAPI(
                session=session,
                authentication_token=(user_token or guest_token),
                token_type=("Macaroon" if user_token else "Bearer"),
                api_url=get_api_url(is_test_backend),
            )

            if response == "html":
                g.api.set_is_for_view(True)

            return func(*args, **kwargs)

        return decorated_function

    return decorator


def cube_decorator(response="json"):
    QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
    QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"
    BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
    CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"

    session = talisker.requests.get_session()

    badgr_session = Session()
    talisker.requests.configure(badgr_session)

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

    if response not in RESPONSE_LIST:
        response = "json"

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            # UA under maintenance
            if strtobool(os.getenv("STORE_MAINTENANCE", "false")):
                return flask.render_template("advantage/maintenance.html")

            test_backend = flask.request.args.get("test_backend", "false")
            is_test_backend = strtobool(test_backend)
            user_token = flask.session.get("authentication_token")

            if response == "html":
                if not user_info(flask.session):
                    if is_test_backend:
                        return flask.redirect(
                            "/login?test_backend=true&"
                            "next=/cube/microcerts?test_backend=true"
                        )

                    return flask.redirect("/login?next=/cube/microcerts")

            elif response == "json":
                if not user_info(flask.session):
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            badgr_issuer = (
                BADGR_ISSUER if not test_backend else QA_BADGR_ISSUER
            )
            certified_badge = (
                CERTIFIED_BADGE if not test_backend else QA_CERTIFIED_BADGE,
            )

            # init API instance
            ua_api = UAContractsAPI(
                session=session,
                authentication_token=(user_token),
                token_type=("Macaroon" if user_token else "Bearer"),
                api_url=get_api_url(is_test_backend),
            )

            badgr_api = BadgrAPI(
                "https://api.eu.badgr.io"
                if not test_backend
                else "https://api.test.badgr.com",
                os.getenv("BAGDR_USER"),
                os.getenv("BADGR_PASSWORD")
                if not test_backend
                else os.getenv("BADGR_QA_PASSWORD"),
                badgr_session,
            )

            edx_api = EdxAPI(
                "https://cube.ubuntu.com"
                if not test_backend
                else "https://qa.cube.ubuntu.com",
                os.getenv("CUBE_EDX_CLIENT_ID")
                if not test_backend
                else os.getenv("CUBE_EDX_QA_CLIENT_ID"),
                os.getenv("CUBE_EDX_CLIENT_SECRET")
                if not test_backend
                else os.getenv("CUBE_EDX_CLIENT_QA_SECRET"),
                edx_session,
            )

            if response == "html":
                ua_api.set_is_for_view(True)

            return func(
                badgr_issuer,
                certified_badge,
                ua_api,
                badgr_api,
                edx_api,
                *args,
                **kwargs
            )

        return decorated_function

    return decorator
