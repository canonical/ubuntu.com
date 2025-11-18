# helpers.py
from flask import request, current_app, redirect, session
from datetime import datetime, timezone, timedelta

from .exceptions import UserNotFoundException


def get_client():
    return current_app.extensions["cookie_consent_client"]


def set_cookie_accepted_with_ts(response, key, value):
    days = get_client().app.config.get("PREFERENCES_COOKIE_EXPIRY_DAYS")

    response.set_cookie(
        key,
        value,
        max_age=60 * 60 * 24 * days,
        samesite="Lax",
        secure=False,
    )

    response.set_cookie(
        f"{key}_ts",
        datetime.now(timezone.utc).isoformat(),
        max_age=60 * 60 * 24 * days,
        samesite="Lax",
        secure=False,
    )


def set_short_lived_cookie(response, key, value, minutes=5):
    response.set_cookie(
        key,
        value,
        max_age=60 * minutes,
        samesite="Lax",
        secure=False,
    )


def check_cookie_stale(cookie_stale) -> bool:
    """Check if cookie is older than 1 day."""
    timestamp_cookie = request.cookies.get("_cookies_accepted_ts")
    if timestamp_cookie:
        try:
            timestamp = datetime.fromisoformat(timestamp_cookie)
            if datetime.now(timezone.utc) - timestamp > timedelta(days=1):
                cookie_stale = True
        except Exception:
            cookie_stale = True
    else:
        cookie_stale = True

    return cookie_stale


def get_cookie_mode_cookie(request):
    return getattr(request, "_cookie_mode", "local")


def skip_non_html_requests(response=None) -> bool:
    """
    Helper function to filter requests for middleware.
    """
    # Skip non-HTML page requests
    if response:
        # @after_request hook
        if response.mimetype != "text/html":
            return True
    else:
        # @before_request hook
        if request.path.lower().endswith(
            (".json", ".xml", ".js", ".css", ".csv")
        ):
            return True
        if request.accept_mimetypes.best == "application/json":
            return True
        if "text/html" not in request.accept_mimetypes:
            return True

    # Skip static files
    if request.endpoint == "static":
        return True

    # Ignore requests to the cookies endpoint itself
    if request.path.startswith("/cookies"):
        return True

    return False


def check_session_and_redirect():
    """
    Middleware function for checking session and redirecting if needed.
    The host app must call this with a @before_request hook.
    """
    if skip_non_html_requests():
        return

    # Check health and set flag, used for setting '_cookie_mode' cookie later
    if not get_client().is_service_up():
        request._cookie_mode = "local"
        return
    else:
        request._cookie_mode = "shared"

    # We don't need to redirect if session exists
    if "user_uuid" in session:
        return

    # Redirect to cookie service to create session
    service_url = current_app.config["CENTRAL_COOKIE_SERVICE_URL"]
    return_uri = request.url
    redirect_url = (
        f"{service_url}/api/v1/cookies/session?return_uri={return_uri}"
    )

    return redirect(redirect_url)


def sync_preferences_cookie(response):
    """
    This is the middleware helper for syncing preferences to a local cookie.
    The host app must call this from its own @after_request hook.
    """
    if skip_non_html_requests(response):
        return response

    # If service is down or user doesn't want shared cookies, skip
    if get_cookie_mode_cookie(request) == "local":
        set_short_lived_cookie(response, "_cookie_mode", "local", minutes=5)
        return response

    cookie_stale = False
    cookie_stale = check_cookie_stale(cookie_stale)

    user_uuid = session.get("user_uuid")
    local_preferences = request.cookies.get("_cookies_accepted")

    # Refresh preferences if missing or stale
    if user_uuid and (not local_preferences or cookie_stale):
        try:
            preferences_data = get_client().fetch_preferences(user_uuid)
            if preferences_data:
                consent_value = preferences_data.get("preferences", {}).get(
                    "consent", "unset"
                )
                set_cookie_accepted_with_ts(
                    response, "_cookies_accepted", consent_value
                )
        except UserNotFoundException:
            session.pop("user_uuid", None)
        except Exception:
            pass

    return response
