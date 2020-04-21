#! /usr/bin/env python3

import os
import sys

sys.path.append(os.getcwd())

from sqlalchemy import MetaData  # noqa
from webapp.security.database import db_engine  # noqa


metadata = MetaData(db_engine)
metadata.reflect()
metadata.drop_all()
