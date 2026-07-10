"""
Shared SQLAlchemy engine for canonicalwebteam.discourse's DBResponseCache.

One Engine (and its connection pool) is created here and shared across
every DBResponseCache instance in the app, mirroring how a single
requests.Session is created once and shared across DiscourseAPI
instances.
"""

from canonicalwebteam.discourse import DBResponseCache
from canonicalwebteam.flask_base.env import get_flask_env
from sqlalchemy import create_engine

try:
    # gunicorn's gevent worker monkey-patches Python sockets, but not
    # psycopg2's libpq sockets -- without this, a DB round-trip blocks
    # every other concurrent greenlet on the worker, not just the
    # request doing the query.
    import psycogreen.gevent

    psycogreen.gevent.patch_psycopg()
except ImportError:
    pass

_database_url = get_flask_env("DATABASE_URL")

engine = (
    create_engine(
        _database_url,
        pool_size=2,
        max_overflow=2,
        pool_recycle=3600,
        pool_pre_ping=True,
    )
    if _database_url
    else None
)


def build_cache(namespace):
    """
    A DBResponseCache for ``namespace``, or None if DATABASE_URL isn't
    configured for this pod. DiscourseAPI treats cache=None as "no
    caching", so a route without DATABASE_URL set just degrades to
    direct fetches instead of crashing the app.
    """
    if engine is None:
        return None
    return DBResponseCache(engine, namespace=namespace)
