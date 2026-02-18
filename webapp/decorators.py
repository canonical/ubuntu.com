# Core packages
import functools

# Third party packages
import flask
import requests
import sentry_sdk
from flask import current_app, abort
from webapp.login import user_info


def login_required(func):
    """
    Decorator that checks if a user is logged in, and redirects
    to login page if not.
    """

    @functools.wraps(func)
    def is_user_logged_in(*args, **kwargs):
        if not user_info(flask.session):
            return flask.redirect("/login?next=" + flask.request.path)

        return func(*args, **kwargs)

    return is_user_logged_in


def handle_api_error(func):
    """
    Decorator for centralized error handling of API calls in certified views.

    :param func: The function that makes the API request
    :return: Decorated function with error handling
    :raises: Aborts with appropriate HTTP status codes on error
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.HTTPError as error:
            if error.response.status_code == 404:
                abort(404)
            else:
                sentry_sdk.capture_exception()
                abort(500)
        except Exception:
            sentry_sdk.capture_exception()
            abort(500)

    return wrapper
