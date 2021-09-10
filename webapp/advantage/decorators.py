import os
from distutils.util import strtobool
from functools import wraps

import flask
from flask import g
import talisker.requests

from webapp.advantage.ua_contracts.api import UAContractsAPI
from webapp.login import user_info

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


def advantage_decorator(permission=None, response="json"):
    session = talisker.requests.get_session()

    if permission not in PERMISSION_LIST:
        permission = None
    if response not in RESPONSE_LIST:
        response = "json"

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
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
