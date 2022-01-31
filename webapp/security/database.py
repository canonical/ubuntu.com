import os

# Patch psycopg2 for gevent before importing any sqlalchemy stuff
from psycogreen.gevent import patch_psycopg

patch_psycopg()

from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import scoped_session, sessionmaker  # noqa: E402

from webapp.security.models import BaseFilterQuery  # noqa: E402


db_engine = create_engine(os.environ["DATABASE_URL"])
db_session = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=db_engine,
        query_cls=BaseFilterQuery,
    )
)
