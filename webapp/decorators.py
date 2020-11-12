# Core packages
import os
import functools
from distutils.util import strtobool

# Third party packages
import flask


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
