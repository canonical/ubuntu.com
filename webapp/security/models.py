from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Table,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship


Base = declarative_base()


notice_cves = Table(
    "notice_cves",
    Base.metadata,
    Column("notice_id", String, ForeignKey("notice.id")),
    Column("cve_id", String, ForeignKey("cve.id")),
)


notice_references = Table(
    "notice_references",
    Base.metadata,
    Column("notice_id", String, ForeignKey("notice.id")),
    Column("reference_id", Integer, ForeignKey("reference.id")),
)

notice_releases = Table(
    "notice_releases",
    Base.metadata,
    Column("notice_id", String, ForeignKey("notice.id")),
    Column("release_id", Integer, ForeignKey("release.id")),
)


class CVE(Base):
    __tablename__ = "cve"

    id = Column(String, primary_key=True)


class Notice(Base):
    __tablename__ = "notice"

    id = Column(String, primary_key=True)
    title = Column(String)
    published = Column(DateTime)
    summary = Column(String)
    isummary = Column(String)
    details = Column(String)
    instructions = Column(String)
    packages = Column(JSON)
    cves = relationship("CVE", secondary=notice_cves)
    references = relationship("Reference", secondary=notice_references)
    releases = relationship(
        "Release", secondary=notice_releases, order_by="-Release.release_date"
    )


class Reference(Base):
    __tablename__ = "reference"

    id = Column(Integer, primary_key=True)
    uri = Column(String)


class Release(Base):
    __tablename__ = "release"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    version = Column(String, unique=True)
    codename = Column(String, unique=True)
    lts = Column(Boolean)
    development = Column(Boolean)
    release_date = Column(DateTime)
    esm_expires = Column(DateTime)
    support_expires = Column(DateTime)

    @hybrid_property
    def support_tag(self):
        now = datetime.now()

        if self.lts and self.support_expires > now:
            return "LTS"
        elif self.lts and self.esm_expires > now:
            return "ESM"

        return ""
