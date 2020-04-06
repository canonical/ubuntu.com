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

cve_bugs = Table(
    "cve_bugs",
    Base.metadata,
    Column("cve_id", String, ForeignKey("cve.id")),
    Column("bug_id", Integer, ForeignKey("bug.id")),
)

cve_references = Table(
    "cve_references",
    Base.metadata,
    Column("cve_id", String, ForeignKey("cve.id")),
    Column("cve_reference_id", Integer, ForeignKey("cve_reference.id")),
)


class CVE(Base):
    __tablename__ = "cve"

    id = Column(String, primary_key=True)
    public_date = Column(String)
    public_date_usn = Column(String)
    last_updated_date = Column(String)
    crd = Column(String)
    description = Column(String)
    ubuntu_description = Column(String)
    notes = Column(String)
    mitigation = Column(String)
    priority = Column(String)
    discovered_by = Column(String)
    assigned_to = Column(String)
    approved_by = Column(String)
    cvss = Column(String)  # CVSS 3 and Base Score
    references = relationship("CVEReference", secondary=cve_references)
    bugs = relationship("Bug", secondary=cve_bugs)
    packages = Column(JSON)
    status = Column(String)


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
        "Release", secondary=notice_releases, order_by="-Release.version"
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


class CVEReference(Base):
    __tablename__ = "cve_reference"

    id = Column(Integer, primary_key=True)
    uri = Column(String)


class Bug(Base):
    __tablename__ = "bug"

    id = Column(Integer, primary_key=True)
    uri = Column(String)
