# Core packages
import functools
from collections import defaultdict, deque
import time

# Third party packages
import flask
from webapp.login import user_info

rate_limits = defaultdict(deque)
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
        if not user_info(flask.session):
            return flask.redirect("/login?next=" + flask.request.path)

        current_time = time.time()
        user = user_info(flask.session)
        rate_limits[user["email"]] = [
            timestamp
            for timestamp in rate_limits[user["email"]]
            if current_time - timestamp < TIME_WINDOW
        ]

        if len(rate_limits[user["email"]]) >= RATE_LIMIT:
            return (
                flask.jsonify({"error": "Rate limit exceeded, try again later."}),
                429,
            )
        rate_limits[user["email"]].append(current_time)
        return func(*args, **kwargs)

    return wrapper
