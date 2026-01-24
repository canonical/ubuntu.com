from distutils.util import strtobool
from functools import wraps
from datetime import datetime
from dateutil.parser import parse

import flask
import pytz
import talisker.requests

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper
from webapp.shop.api.badgr.api import BadgrAPI
from webapp.shop.api.credly.api import CredlyAPI
from webapp.shop.api.trueability.api import TrueAbilityAPI
from webapp.shop.api.proctor360.api import Proctor360API
from webapp.login import user_info
from requests import Session
from canonicalwebteam.flask_base.env import get_flask_env

AREA_LIST = {
    "account": "Account pages",
    "advantage": "UA pages",
    "cred": "Credentials",
}

PERMISSION_LIST = {
    "user": "Endpoint needs logged in user.",
}

RESPONSE_LIST = {
    "html": "Returns user friendly HTML response.",
    "json": "Returns json response.",
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

MAINTENANCE_URLS = [
    "/pro/subscribe",
    "/pro/maintenance-check",
]

CRED_MAINTENANCE_URLS = [
    "/credentials/shop",
]


def shop_decorator(area=None, permission=None, response="json", redirect=None):
    permission = permission if permission in PERMISSION_LIST else None
    response = response if response in RESPONSE_LIST else "json"
    area = area if area in AREA_LIST else "account"

    session = talisker.requests.get_session()
    badgr_session = init_cred_session(area)
    trueability_session = init_cred_session(area)
    proctor_session = init_cred_session(area)
    credly_session = init_cred_session(area)

    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            # shop under maintenance
            maintenance = strtobool(
                get_flask_env("STORE_MAINTENANCE", "false")
            )
            cred_maintenance = strtobool(
                get_flask_env("CRED_MAINTENANCE", "False")
            )
            is_store_maintenance_in_timeframe = False
            is_cred_maintenance_in_timeframe = False
            store_maintenance_start = get_flask_env("STORE_MAINTENANCE_START")
            store_maintenance_end = get_flask_env("STORE_MAINTENANCE_END")
            cred_maintenance_start = get_flask_env("CRED_MAINTENANCE_START")
            cred_maintenance_end = get_flask_env("CRED_MAINTENANCE_END")

            if store_maintenance_start and store_maintenance_end:
                maintenance_start = parse(
                    get_flask_env("STORE_MAINTENANCE_START")
                )
                maintenance_end = parse(get_flask_env("STORE_MAINTENANCE_END"))
                time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
                is_store_maintenance_in_timeframe = (
                    maintenance_start <= time_now < maintenance_end
                )

            if cred_maintenance_start and cred_maintenance_end:
                _maintenance_start = parse(
                    get_flask_env("CRED_MAINTENANCE_START")
                )
                _maintenance_end = parse(get_flask_env("CRED_MAINTENANCE_END"))
                _time_now = datetime.now(pytz.utc)
                is_cred_maintenance_in_timeframe = (
                    _maintenance_start <= _time_now <= _maintenance_end
                )
                # if maintenance window is in past, then hide the banner
                if _maintenance_end < _time_now:
                    cred_maintenance = False

            is_in_maintenance = (
                maintenance and is_store_maintenance_in_timeframe
            )
            cred_is_in_maintenance = (
                cred_maintenance and is_cred_maintenance_in_timeframe
            )

            if flask.request.path in MAINTENANCE_URLS and is_in_maintenance:
                return flask.render_template("advantage/maintenance.html")

            if (
                flask.request.path in CRED_MAINTENANCE_URLS
                and cred_is_in_maintenance
            ):
                return flask.render_template(
                    "advantage/maintenance.html",
                    description="We're updating the Credentials store",
                    title="Credentials Maintenance",
                )

            user_token = flask.session.get("authentication_token")

            if permission == "user" and response == "json":
                if not user_token:
                    message = {"error": "authentication required"}

                    return flask.jsonify(message), 401

            if permission == "user" and response == "html":
                if not user_token:
                    redirect_path = redirect or flask.request.full_path

                    return flask.redirect(f"/login?next={redirect_path}")

            ua_contracts_api = get_ua_contracts_api_instance(
                user_token,
                response,
                session,
                (
                    flask.request.headers.getlist("X-Forwarded-For")[0]
                    if flask.request.headers.getlist("X-Forwarded-For")
                    else flask.request.remote_addr
                ),
            )
            advantage_mapper = AdvantageMapper(ua_contracts_api)
            is_community_member = False
            is_cred_admin = False
            if user_info(flask.session):
                is_community_member = user_info(flask.session).get(
                    "is_community_member", False
                )
                is_cred_admin = user_info(flask.session).get(
                    "is_credentials_admin", False
                )

            return func(
                badgr_issuer=get_flask_env(
                    "BADGR_ISSUER", "eTedPNzMTuqy1SMWJ05UbA"
                ),
                badge_certification=get_flask_env(
                    "CERTIFIED_BADGE", "hs8gVorCRgyO2mNUfeXaLw"
                ),
                ua_contracts_api=ua_contracts_api,
                advantage_mapper=advantage_mapper,
                badgr_api=get_badgr_api_instance(area, badgr_session),
                trueability_api=get_trueability_api_instance(
                    area, trueability_session
                ),
                proctor_api=get_proctor_api_instance(area, proctor_session),
                credly_api=get_credly_api_instance(area, credly_session),
                is_in_maintenance=is_in_maintenance,
                is_community_member=is_community_member,
                show_cred_maintenance_alert=bool(cred_maintenance),
                cred_is_in_maintenance=cred_is_in_maintenance,
                is_cred_admin=is_cred_admin,
                cred_maintenance_start=cred_maintenance_start,
                cred_maintenance_end=cred_maintenance_end,
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


def credentials_group():
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            sso_user = user_info(flask.session)
            if sso_user and (
                sso_user.get("is_credentials_admin", False)
                or sso_user.get("is_credentials_support", False)
            ):
                return func(*args, **kwargs)

            return flask.render_template(
                "account/forbidden.html", reason="is_not_admin"
            )

        return decorated_function

    return decorator


def credentials_admin():
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            sso_user = user_info(flask.session)
            if sso_user and sso_user.get("is_credentials_admin", False):
                return func(*args, **kwargs)

            return flask.render_template(
                "account/forbidden.html", reason="is_not_admin"
            )

        return decorated_function

    return decorator


def init_cred_session(area) -> Session:
    if area != "cred":
        return None

    session = Session()
    talisker.requests.configure(session)

    return session


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
        get_flask_env("BADGR_URL", "https://api.eu.badgr.io"),
        get_flask_env("BAGDR_USER"),
        get_flask_env("BADGR_PASSWORD"),
        badgr_session,
    )


def get_credly_api_instance(area, credly_session) -> CredlyAPI:
    if area != "cred":
        return None

    return CredlyAPI(
        base_url=get_flask_env(
            "CREDLY_URL", "https://sandbox-api.credly.com/v1"
        ),
        auth_token=get_flask_env("CREDLY_TOKEN", ""),
        org_id=get_flask_env(
            "CREDLY_ORGANIZATION_ID", "30dfd771-5079-4000-9865-8c3aeb4545b6"
        ),
        session=credly_session,
    )


def get_trueability_api_instance(area, trueability_session) -> TrueAbilityAPI:
    if area != "cred":
        return None

    return TrueAbilityAPI(
        get_flask_env("TRUEABILITY_URL", "https://app3.trueability.com"),
        get_flask_env("TRUEABILITY_API_KEY", ""),
        trueability_session,
    )


def get_proctor_api_instance(area, proctor_session) -> Proctor360API:
    if area != "cred":
        return None
    instance = Proctor360API(
        proctor_session,
    )
    try:
        instance.set_time_zone_ids()
    except Exception:
        pass
    return instance


def get_ua_contracts_api_instance(
    user_token, response, session, remote_addr
) -> UAContractsAPI:
    ua_contracts_api = UAContractsAPI(
        session=session,
        authentication_token=user_token,
        token_type="Macaroon",
        api_url=get_flask_env(
            "CONTRACTS_API_URL", "https://contracts.canonical.com"
        ),
        remote_addr=remote_addr,
    )

    if response == "html":
        ua_contracts_api.set_is_for_view(True)

    return ua_contracts_api
