# helpers.py
from flask import request, current_app, redirect, session, g
from datetime import datetime, timezone, timedelta

from .exceptions import UserNotFoundException


def get_client():
    return current_app.extensions["cookie_consent_client"]


def is_secure_context():
    """
    Determine if we are in development (not secure)
    or production (secure).
    """
    return not bool(current_app.debug)


def set_cookies_accepted_with_ts(response, value):
    """
    Sets the '_cookies_accepted' and '_cookies_accepted_ts' cookies.
    """
    days = get_client().app.config.get("PREFERENCES_COOKIE_EXPIRY_DAYS")

    response.set_cookie(
        "_cookies_accepted",
        value,
        max_age=60 * 60 * 24 * days,
        samesite="Lax",
        secure=is_secure_context(),
    )

    response.set_cookie(
        "_cookies_accepted_ts",
        datetime.now(timezone.utc).isoformat(),
        max_age=60 * 60 * 24 * days,
        samesite="Lax",
        secure=is_secure_context(),
    )


def set_cookie_for_session_life(response, key, value):
    """Sets a cookie that expires with the session."""
    response.set_cookie(
        key,
        value,
        samesite="Lax",
        secure=is_secure_context(),
    )


def check_cookie_stale() -> bool:
    """Check if cookie is older than 1 day."""
    timestamp_cookie = request.cookies.get("_cookies_accepted_ts")
    if not timestamp_cookie:
        return True

    try:
        timestamp = datetime.fromisoformat(timestamp_cookie)
        return datetime.now(timezone.utc) - timestamp > timedelta(days=1)
    except Exception:
        return True


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
    # We don't need to redirect if session already exists
    if "user_uuid" in session:
        return False

    # Only run on legitamate page requests
    if skip_non_html_requests():
        return False

    # Redirect to cookie service to create session
    service_url = current_app.config["CENTRAL_COOKIE_SERVICE_URL"]
    redirect_url = (
        f"{service_url}/api/v1/cookies/session?return_uri={request.url}"
    )

    return redirect(redirect_url)


def sync_preferences_cookie(response):
    """
    This is the middleware helper for syncing preferences to a local cookie.
    The host app must call this from its own @after_request hook.
    """
    # If service is down or user doesn't want shared cookies, skip
    if getattr(g, "cookies_service_up", False) is not True:
        return response
    else:
        # Otherwise we set a cookie for interaction with cookie-policy.js
        set_cookie_for_session_life(response, "_cookies_service_up", "1")

    # Check if we've already run sync in this request
    if getattr(g, "cookies_synced", False):
        return response

    # Only run on legitamate page requests
    if skip_non_html_requests(response):
        return response

    cookie_stale = check_cookie_stale()
    user_uuid = session.get("user_uuid")
    local_preferences = request.cookies.get("_cookies_accepted")

    # Refresh preferences if cookie missing or stale
    if user_uuid and (not local_preferences or cookie_stale):
        try:
            preferences_data = get_client().fetch_preferences(user_uuid)
            if preferences_data:
                consent_value = preferences_data.get("preferences", {}).get(
                    "consent", "unset"
                )
                set_cookies_accepted_with_ts(response, consent_value)
        except UserNotFoundException:
            session.pop("user_uuid", None)
        except Exception:
            pass

    g.cookies_synced = True
    return response
