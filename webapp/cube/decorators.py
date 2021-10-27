import os
from distutils.util import strtobool
from functools import wraps
import talisker.requests
import talisker.sentry

import flask
from flask import g
from requests import Session
import talisker.requests

from webapp.advantage.ua_contracts.api import UAContractsAPI
from webapp.login import user_info
from webapp.cube.api import BadgrAPI, EdxAPI

QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"

BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"

PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
    "user_or_guest": "Endpoint needs user or guest token.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
}


def get_api_url(is_test_backend) -> str:
    if is_test_backend:
        return flask.current_app.config["CONTRACTS_TEST_API_URL"]

    return flask.current_app.config["CONTRACTS_LIVE_API_URL"]


def cube_decorator(response="json"):
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
            test_backend = flask.request.args.get("test_backend", "false")
            is_test_backend = strtobool(test_backend)
            user_token = flask.session.get("authentication_token")

            if response == "html":
                if not user_info(flask.session):
                    return flask.redirect(
                        "/login?test_backend=true"
                        if is_test_backend
                        else "/login"
                    )

            elif response == "json":
                if not user_info(flask.session):
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            # init API instance
            g.api = UAContractsAPI(
                session=session,
                authentication_token=user_token,
                token_type=("Macaroon" if user_token else "Bearer"),
                api_url=get_api_url(is_test_backend),
            )

            if response == "html":
                g.api.set_is_for_view(True)

            g.badgr_api = BadgrAPI(
                os.getenv("BADGR_URL"),
                os.getenv("BAGDR_USER"),
                os.getenv("BADGR_PASSWORD"),
                badgr_session,
                BADGR_ISSUER if not test_backend else QA_BADGR_ISSUER,
                CERTIFIED_BADGE if not test_backend else QA_CERTIFIED_BADGE,
            )

            g.edx_api = EdxAPI(
                os.getenv("CUBE_EDX_URL"),
                os.getenv("CUBE_EDX_CLIENT_ID"),
                os.getenv("CUBE_EDX_CLIENT_SECRET"),
                edx_session,
            )

            return func(*args, **kwargs)

        return decorated_function

    return decorator
