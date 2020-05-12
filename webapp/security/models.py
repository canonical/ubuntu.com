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
    Column("reference_id", Integer, ForeignKey("reference.id")),
)

cve_packages = Table(
    "cve_packages",
    Base.metadata,
    Column("cve_id", String, ForeignKey("cve.id")),
    Column("cve_packages", Integer, ForeignKey("package.id")),
)


class CVE(Base):
    __tablename__ = "cve"

    id = Column(String, primary_key=True)
    public_date = Column(DateTime)
    last_updated_date = Column(DateTime)
    public_date_usn = Column(DateTime)
    crd = Column(String)
    description = Column(String)
    ubuntu_description = Column(String)
    notes = Column(JSON)
    mitigation = Column(String)
    priority = Column(String)
    discovered_by = Column(String)
    assigned_to = Column(String)
    approved_by = Column(String)
    cvss = Column(String)  # CVSS vector to convert into Base score
    references = relationship("Reference", secondary=cve_references)
    bugs = relationship("Bug", secondary=cve_bugs)
    packages = relationship("Package", secondary=cve_packages)
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
    package_statuses = relationship("PackageStatus")

    @hybrid_property
    def support_tag(self):
        now = datetime.now()

        if self.lts and self.support_expires > now:
            return "LTS"
        elif self.lts and self.esm_expires > now:
            return "ESM"

        return ""


class Bug(Base):
    __tablename__ = "bug"

    id = Column(Integer, primary_key=True)
    uri = Column(String)


class PackageStatus(Base):
    __tablename__ = "package_status"

    id = Column(Integer, primary_key=True)
    status = Column(String)
    status_description = Column(String)

    package_id = Column(Integer, ForeignKey("package.id"))
    package = relationship("Package", back_populates="package_statuses")

    release_id = Column(Integer, ForeignKey("release.id"))
    release = relationship("Release", back_populates="package_statuses")


class Package(Base):
    __tablename__ = "package"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    source = Column(String)
    launchpad = Column(String)
    ubuntu = Column(String)
    debian = Column(String)
    package_statuses = relationship("PackageStatus")

    def get_status_by_codename(self, codename):
        for package_status in self.package_statuses:
            if package_status.release.codename == codename:
                return package_status.status
