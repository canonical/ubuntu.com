# Core packages
import os
import functools
from distutils.util import strtobool

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


def store_maintenance(func):
    """
    Decorator that checks if the maintence mode is enabled
    """

    @functools.wraps(func)
    def is_store_in_maintenance(*args, **kwargs):
        if strtobool(os.getenv("STORE_MAINTENANCE")):
            return flask.render_template("advantage/maintenance.html")

        return func(*args, **kwargs)

    return is_store_in_maintenance
