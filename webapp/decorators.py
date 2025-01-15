# Core packages
import functools
import json
from datetime import datetime, timedelta
from typing import Callable, Optional

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


def rate_limit_with_backoff(
    func: Callable, limits: Optional[tuple[int, int]] = None
) -> Callable:
    """
    Decorator to rate limit function calls based on the users'
    session. The default rate limit restricts users to:
    - 1 request every 4 seconds
    - 4 requests every 60 seconds

    This can be overwritten with the limits argument e.g.
        @rate_limit_with_backoff(limits=(1, 10))
    for 1 request every 10 seconds.

    @param func: Function to decorate
    @param limits: Tuple of (requests, seconds) request limit mappings
    """

    rate_limit_attempt_map = {
        1: timedelta(seconds=4),
        4: timedelta(seconds=16),
        16: timedelta(seconds=64),
    }

    if limits:
        additional_limits = {limits[0]: timedelta(seconds=limits[1])}
        rate_limit_attempt_map = additional_limits

    @functools.wraps(func)
    def rate_limited(*args, **kwargs):
        try:
            # Get the initial request
            initial_request = json.loads(flask.session[func.__name__])
            for limit in sorted(rate_limit_attempt_map.keys()):
                # Get the seconds limit for these attempts
                if limit > initial_request["attempts"]:
                    seconds_limit = rate_limit_attempt_map.get(limit)
                    time_since_last_request = (
                        datetime.now()
                        - datetime.fromtimestamp(initial_request["timestamp"])
                    )
                    # Abort if the request is too soon
                    if (
                        time_since_last_request.total_seconds()
                        < seconds_limit.total_seconds()
                    ):
                        return flask.abort(429)
                    break

            # Reset the timestamp if the request succeeds
            initial_request["timestamp"] = datetime.now()

            # Otherwise update the session
            initial_request["attempts"] += 1
            flask.session[func.__name__] = json.dumps(initial_request)
        except (KeyError, TypeError):
            # Set values for initial request
            flask.session[func.__name__] = json.dumps(
                {"timestamp": datetime.now().timestamp(), "attempts": 1}
            )
        return func(*args, **kwargs)

    return rate_limited
