# Core packages
import functools
from collections import defaultdict, deque
import time

# Third party packages
import flask
from webapp.login import user_info
from flask import session

RATE_LIMIT = 5  # Max requests
TIME_WINDOW = 60  # Time window in seconds (e.g., 60 seconds)


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


def rate_limiter(func):
    def wrapper(*args, **kwargs):
        user = user_info(flask.session)
        if not user:
            return flask.redirect("/login?next=" + flask.request.path)

        if "rate_limits" not in flask.session:
            flask.session["rate_limits"] = []

        current_time = time.time()
        rate_limits = [
            timestamp
            for timestamp in rate_limits
            if current_time - timestamp < TIME_WINDOW
        ]

        if len(rate_limits[user["email"]]) >= RATE_LIMIT:
            return (
                flask.jsonify(
                    {"error": "Rate limit exceeded, try again later."}
                ),
                429,
            )
        rate_limits.append(current_time)
        flask.session["rate_limits"] = rate_limits
        return func(*args, **kwargs)

    return wrapper
