# Core packages
import functools
import json
from datetime import datetime, timedelta
from typing import Callable

# Third party packages
import flask

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


def rate_limit_with_backoff(func: Callable):
    """
    Decorator to rate limit function calls based on the users' session.
    The rate limit restricts users to:
    - 1 request every 2 seconds
    - 2 request every 4 seconds
    - 3 request every 8 seconds
    """
    rate_limit_attempt_map = {
        1: timedelta(seconds=2),
        2: timedelta(seconds=4),
        3: timedelta(seconds=8),
    }
    ATTEMPT_LIMIT = 3

    @functools.wraps(func)
    def rate_limited(*args, **kwargs):
        # Get the initial request timestamp, or update the session with the
        # timestamp from the most recent successful request
        if initial_request := json.loads(flask.session.get(func.__name__)):
            # Get the current limit
            current_limit = rate_limit_attempt_map.get(initial_request["attempts"])

            time_since_last_request = datetime.now() - datetime.fromtimestamp(
                initial_request["timestamp"]
            )
            # Abort if the time is too early for this number of attempts
            if time_since_last_request.total_seconds() < current_limit.total_seconds():
                # Increment the number of attempts. 3 is a hard upper limit.
                if initial_request["attempts"] < ATTEMPT_LIMIT:
                    initial_request["attempts"] += 1
                    flask.session[func.__name__] = json.dumps(
                        initial_request["attempts"]
                    )

                return flask.abort(429)

        # Set values for a successful request
        flask.session[func.__name__] = json.dumps(
            {"timestamp": datetime.now().timestamp(), "attempts": 1}
        )
        return func(*args, **kwargs)

    return rate_limited
