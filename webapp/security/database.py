# Standard library
import os

# Packages
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


db_engine = create_engine("postgres://postgres:pw@localhost:5432/postgres")
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
)
