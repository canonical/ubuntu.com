import os
import maxminddb

from threading import Lock
from datetime import datetime


class DatabaseInfo(object):
    """Provides information about the GeoIP database."""

    def __init__(self, filename=None, date=None,
                 internal_name=None):
        #: If available the filename which backs the database.
        self.filename = filename
        #: Optionally the build date of the database as datetime object.
        self.date = date
        #: Optionally the internal name of the database.
        self.internal_name = internal_name

    def __repr__(self):
        return '<%s filename=%r date=%r internal_name=%r>' % (
            self.__class__.__name__,
            self.filename,
            self.date,
            self.internal_name,
        )


class DbIp:
    """Provides access to the packaged GeoLite2 database."""

    def __init__(self, database_name='dbip-country-lite.mmdb'):
        self.filename = os.path.join(os.path.dirname(__file__), database_name)
        self.data = None

    def get_info(self):
        return DatabaseInfo(
            filename=self.filename,
            date=datetime.utcfromtimestamp(self.reader().metadata().build_epoch),
            internal_name=self.reader().metadata().database_type,
        )

    def open_packaged_database(self):
        return maxminddb.open_database(self.filename)
    
    def reader(self):
        if not self.data:
            self.data = self.open_packaged_database()
        
        return self.data
