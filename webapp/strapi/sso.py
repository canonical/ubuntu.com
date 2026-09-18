"""
Ubuntu SSO for the CMS.

Strapi's own admin SSO is an Enterprise feature and is off on the
Community edition, so the CMS borrows this site's login instead: it
already speaks Ubuntu SSO (OpenID 2.0 against login.ubuntu.com) and
already knows how to read Launchpad team membership.

The handshake:

  CMS  ->  GET /_cms/sso/start        this site, unauthenticated
           -> /login                  the site's existing Ubuntu SSO
           <- back to /_cms/sso/start once signed in
       <-  redirect to the CMS with a short-lived signed assertion
  CMS  ->  verifies the signature and signs the person in

The assertion is only a carrier between two services that already share
a secret. It says who signed in, is valid for a couple of minutes, and
is bound to the CMS callback it was issued for.

It authenticates; it does not authorise. The CMS signs in only people
who already have an account there, and what they may then edit is
decided on that side, from the access list on each bubble. So this
assertion says who somebody is and nothing about what they can do.
"""

# Standard library
import base64
import hashlib
import hmac
import json
import time
from urllib.parse import urlencode, urlparse

# Packages
import flask
from canonicalwebteam.flask_base.env import get_flask_env

# Long enough to survive a redirect, short enough that a leaked URL in a
# log or history is worthless.
ASSERTION_TTL = 120


def _secret():
    return get_flask_env("CMS_SSO_SECRET")


def _sign(payload):
    return hmac.new(
        _secret().encode(), payload.encode(), hashlib.sha256
    ).hexdigest()


def _encode(claims):
    payload = base64.urlsafe_b64encode(
        json.dumps(claims, separators=(",", ":"), sort_keys=True).encode()
    ).decode()

    return payload, _sign(payload)


def _origin(url):
    """The scheme and host of a URL, or None if it is not an http(s) one."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return None

    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None

    return f"{parsed.scheme}://{parsed.netloc}"


def allowed_callbacks():
    """
    The CMS origins this site will hand an assertion to. Anything else is
    refused, so the endpoint cannot be used to forward someone's identity
    to a site of an attacker's choosing.

    Reduced to origins, so a setting that carries a path or a trailing
    slash still matches the callback the CMS asks with.
    """
    origins = []

    for name in ("STRAPI_ADMIN_URL", "STRAPI_API_URL"):
        origin = _origin(get_flask_env(name) or "")

        if origin:
            origins.append(origin)

    return origins


def _callback_is_allowed(callback):
    origin = _origin(callback or "")

    return bool(origin) and origin in allowed_callbacks()


def build_sso_start_view(user_info):
    """
    GET /_cms/sso/start?callback=<cms callback>

    Sends anyone who is not signed in through this site's ordinary Ubuntu
    SSO login, then hands the CMS a signed assertion about them.
    """

    def sso_start():
        if not _secret():
            return (
                flask.jsonify({"error": "CMS single sign-on is not enabled"}),
                404,
            )

        callback = flask.request.args.get("callback", "")

        if not _callback_is_allowed(callback):
            return (
                flask.jsonify({"error": "Unknown callback"}),
                400,
            )

        user = user_info(flask.session)

        if not user:
            # Back here once the site's own login has finished.
            here = "/_cms/sso/start?" + urlencode({"callback": callback})

            return flask.redirect("/login?" + urlencode({"next": here}))

        claims = {
            "email": user["email"],
            "fullname": user.get("fullname") or "",
            "callback": callback,
            "exp": int(time.time()) + ASSERTION_TTL,
        }

        payload, signature = _encode(claims)

        return flask.redirect(
            f"{callback}?"
            + urlencode({"assertion": payload, "signature": signature})
        )

    return sso_start
