import os
from distutils.util import strtobool

import flask


def get_stripe_publishable_key() -> str:
    is_test_backend = strtobool(
        flask.request.args.get("test_backend", "false")
    )

    if is_test_backend:
        return os.getenv(
            "STRIPE_TEST_PUBLISHABLE_KEY",
            "pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46",
        )

    return os.getenv(
        "STRIPE_LIVE_PUBLISHABLE_KEY",
        "pk_live_68aXqowUeX574aGsVck8eiIE",
    )
