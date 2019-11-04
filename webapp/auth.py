def is_authenticated(session):
    """
    Checks if the user is authenticated from the session
    Returns True if the user is authenticated
    """
    return (
        "openid" in session
        and "macaroon_discharge" in session
        and "macaroon_root" in session
    )


def empty_session(session):
    """
    Empty the session, used to logout.
    """
    session.pop("macaroon_root", None)
    session.pop("macaroon_discharge", None)
    session.pop("openid", None)
