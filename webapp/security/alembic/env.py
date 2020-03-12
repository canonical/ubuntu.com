# Standard library
import os
import sys

# Packages
from alembic import context

# Local
sys.path.append(os.getcwd())
from webapp.security.database import db_engine  # noqa: E402
from webapp.security.models import Base  # noqa: E402


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# add your model's MetaData object here
target_metadata = Base.metadata


def run_migrations():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    with db_engine.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


run_migrations()
