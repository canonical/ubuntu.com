import os
from functools import wraps
from distutils.dist import strtobool

import flask

from webapp.login import user_info

PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
    "user_or_guest": "Endpoint needs user or guest token.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
}


def advantage_decorator(permission=None, response="json"):
    if permission not in PERMISSION_LIST:
        permission = None
    if response not in RESPONSE_LIST:
        response = "json"

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            guest_token = flask.session.get("guest_authentication_token")
            is_test_backend = (
                flask.request.args.get("test_backend", "").lower() == "true"
            )

            # UA under maintenance
            if strtobool(os.getenv("STORE_MAINTENANCE", "false")):
                return flask.render_template("advantage/maintenance.html")

            # if logged in, get rid of guest token
            if user_info(flask.session):
                if flask.session.get("guest_authentication_token"):
                    flask.session.pop("guest_authentication_token")

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

            return func(*args, **kwargs)

        return decorated_function

    return decorator
