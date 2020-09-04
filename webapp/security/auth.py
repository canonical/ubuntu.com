# Standard library
from datetime import datetime, timedelta

# Packages
import flask
from launchpadlib.launchpad import Launchpad
from macaroonbakery import bakery, checkers, httpbakery
from functools import wraps

AUTHORIZED_TEAMS = [
    "canonical-security-web",
    "canonical-security",
    "canonical-webmonkeys",
]

IDENTITY_CAVEATS = [
    checkers.need_declared_caveat(
        checkers.Caveat(
            location="https://api.jujucharms.com/identity",
            condition="is-authenticated-user",
        ),
        ["username"],
    )
]


class Identity(bakery.Identity):
    """Identity information for a Candid third party caveat."""

    def __init__(self, identity):
        parts = identity.split("@", 1)
        self._username = parts[0]
        self._domain = parts[1] if len(parts) == 2 else ""

    def username(self):
        return self._username

    def domain(self):
        return self._domain


class IdentityClient(bakery.IdentityClient):
    """Basic identity client based on the username returned by Candid."""

    def identity_from_context(self, ctx):
        return None, IDENTITY_CAVEATS

    def declared_identity(self, ctx, declared):
        """Return the identity from the given declared attributes."""
        username = declared.get("username")
        if username is None:
            raise bakery.IdentityError("no username found")
        return Identity(username)


def authorization_required(func):
    """
    Decorator that checks if a user is logged in, and redirects
    to login page if not.
    """

    @wraps(func)
    def is_authorized(*args, **kwargs):
        macaroon_bakery = bakery.Bakery(
            location="ubuntu.com/security",
            locator=httpbakery.ThirdPartyLocator(),
            identity_client=IdentityClient(),
            key=bakery.generate_key(),
            root_key_store=bakery.MemoryKeyStore(
                flask.current_app.config["SECRET_KEY"]
            ),
        )
        macaroons = httpbakery.extract_macaroons(flask.request.headers)
        auth_checker = macaroon_bakery.checker.auth(macaroons)
        launchpad = Launchpad.login_anonymously(
            "ubuntu.com/security", "production", version="devel"
        )

        try:
            auth_info = auth_checker.allow(
                checkers.AuthContext(), [bakery.LOGIN_OP]
            )
        except bakery._error.DischargeRequiredError:
            macaroon = macaroon_bakery.oven.macaroon(
                version=bakery.VERSION_2,
                expiry=datetime.utcnow() + timedelta(weeks=4),
                caveats=IDENTITY_CAVEATS,
                ops=[bakery.LOGIN_OP],
            )

            content, headers = httpbakery.discharge_required_response(
                macaroon, "/", "cookie-suffix"
            )
            return content, 401, headers

        username = auth_info.identity.username()
        lp_user = launchpad.people(username)
        authorized = False

        for team in AUTHORIZED_TEAMS:
            if lp_user in launchpad.people(team).members:
                authorized = True
                break

        if not authorized:
            return (
                f"{username} is not in any of the authorized teams: "
                f"{str(AUTHORIZED_TEAMS)}",
                401,
            )

        # Validate authentication token
        return func(*args, **kwargs)

    return is_authorized
