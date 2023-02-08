from distutils.util import strtobool
import os
from functools import wraps

import flask
import talisker.requests

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper
from webapp.shop.api.badgr.api import BadgrAPI
from webapp.shop.api.trueability.api import TrueAbilityAPI
from webapp.login import user_info
from requests import Session


AREA_LIST = {
    "account": "Account pages",
    "advantage": "UA pages",
    "cred": "Credentials",
}

PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
    "guest": "Endpoint won't allow logged in user.",
    "user_or_guest": "Endpoint needs user or guest token.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
}

MARKETING_FLAGS = {
    "utm_campaign": "salesforce-campaign-id",
    "utm_source": "ad_source",
    "gclid": "google-click-id",
    "gbraid": "google-gbraid-id",
    "wbraid": "google-wbraid-id",
    "fbclid": "facebook-click-id",
}

SERVICES = {
    "canonical-ua": {
        "short": "ua",
        "name": "Canonical UA",
    },
    "blender": {
        "short": "blender",
        "name": "Blender Support",
    },
    "canonical-cube": {
        "short": "cube",
        "name": "Canonical CUBE",
    },
}


def shop_decorator(area=None, permission=None, response="json", redirect=None):
    permission = permission if permission in PERMISSION_LIST else None
    response = response if response in RESPONSE_LIST else "json"
    area = area if area in AREA_LIST else "account"

    session = talisker.requests.get_session()
    badgr_session = init_badgr_session(area)
    trueability_session = init_trueability_session(area)

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            # Set marketing flag
            for query_parameter, metadata_key in MARKETING_FLAGS.items():
                if query_parameter in flask.request.args:
                    flask.session.pop(metadata_key, None)
                    value = flask.request.args.get(query_parameter)
                    flask.session[metadata_key] = value

            # shop under maintenance
            if flask.request.path == "/pro/subscribe" and strtobool(
                os.getenv("STORE_MAINTENANCE", "false")
            ):
                return flask.render_template("advantage/maintenance.html")

            # if logged in, get rid of guest token
            user_token = flask.session.get("authentication_token")
            guest_token = flask.session.get("guest_authentication_token")

            if user_token and guest_token:
                flask.session.pop("guest_authentication_token")
                guest_token = None

            if permission == "user" and response == "json":
                if not user_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user_or_guest" and response == "json":
                if not user_token and not guest_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user" and response == "html":
                if not user_token:
                    redirect_path = redirect or flask.request.full_path

                    return flask.redirect(f"/login?next={redirect_path}")

            if permission == "guest" and response == "html":
                if user_token:
                    return flask.redirect(get_redirect_default(area))

            ua_contracts_api = get_ua_contracts_api_instance(
                user_token, guest_token, response, session
            )
            advantage_mapper = AdvantageMapper(ua_contracts_api)

            return func(
                badgr_issuer=os.getenv(
                    "BADGR_ISSUER", "eTedPNzMTuqy1SMWJ05UbA"
                ),
                badge_certification=os.getenv(
                    "CERTIFIED_BADGE", "hs8gVorCRgyO2mNUfeXaLw"
                ),
                ua_contracts_api=ua_contracts_api,
                advantage_mapper=advantage_mapper,
                badgr_api=get_badgr_api_instance(area, badgr_session),
                trueability_api=get_trueability_api_instance(
                    area, trueability_session
                ),
                *args,
                **kwargs,
            )

        return decorated_function

    return decorator


def canonical_staff():
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            sso_user = user_info(flask.session)
            if sso_user and sso_user.get("email", "").endswith(
                "@canonical.com"
            ):
                return func(*args, **kwargs)

            message = {"error": "unauthorized"}
            return flask.jsonify(message), 403

        return decorated_function

    return decorator


def init_badgr_session(area) -> Session:
    if area != "cred":
        return None

    badgr_session = Session()
    talisker.requests.configure(badgr_session)

    return badgr_session


def init_trueability_session(area) -> Session:
    if area != "cred":
        return None

    trueability_session = Session()
    talisker.requests.configure(trueability_session)

    return trueability_session


def get_redirect_default(area) -> str:
    redirect_path = "/account"
    if area == "advantage":
        redirect_path = "/pro/dashboard"
    elif area == "cred":
        redirect_path = "/credentials"

    return redirect_path


def get_badgr_api_instance(area, badgr_session) -> BadgrAPI:
    if area != "cred":
        return None

    return BadgrAPI(
        os.getenv("BADGR_URL", "https://api.eu.badgr.io"),
        os.getenv("BAGDR_USER"),
        os.getenv("BADGR_PASSWORD"),
        badgr_session,
    )


def get_trueability_api_instance(area, trueability_session) -> TrueAbilityAPI:
    if area != "cred":
        return None

    return TrueAbilityAPI(
        os.getenv("TRUEABILITY_URL", "https://app.trueability.com"),
        os.getenv("TRUEABILITY_API_KEY", ""),
        trueability_session,
    )


def get_ua_contracts_api_instance(
    user_token, guest_token, response, session
) -> UAContractsAPI:
    ua_contracts_api = UAContractsAPI(
        session=session,
        authentication_token=(user_token or guest_token),
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=os.getenv(
            "CONTRACTS_API_URL", "https://contracts.canonical.com"
        ),
    )

    if response == "html":
        ua_contracts_api.set_is_for_view(True)

    return ua_contracts_api
