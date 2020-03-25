<<<<<<< HEAD
from datetime import datetime

=======
import enum
>>>>>>> Add enums
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Table,
    Enum,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship


Base = declarative_base()

# Enums


class CveStatus(enum.Enum):
    rejected = "rejected"
    active = "active"
    not_for_us = "not-for-us"  # txt file


class PackageStatus(enum.Enum):
    needs_triage = "needs-triage"
    needed = "needed"
    deferred = "deferred"
    pending = "pending"
    released = "released"
    released_esm = "released-esm"
    ignored = "ignored"
    not_affected = "not-affected"
    dne = "DNE"


class PackageType(enum.Enum):
    package = "package"
    product = "product"
    snap = "snap"


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
    Column("cve_id", Integer, ForeignKey("cve.id")),
    Column("bug_id", Integer, ForeignKey("bug.id")),
)

cve_references = Table(
    "cve_references",
    Base.metadata,
    Column("cve_id", Integer, ForeignKey("cve.id")),
    Column("cve_reference_id", Integer, ForeignKey("cve_reference.id")),
)

cve_packages = Table(
    "cve_packages",
    Base.metadata,
    Column("cve_id", Integer, ForeignKey("cve.id")),
    Column("package_id", Integer, ForeignKey("package.id")),
    Column("name", Integer, ForeignKey("release.id")),
    Column("type", Enum(PackageType)),
)

package_release_status = Table(
    "package_release_status",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("package.id")),
    Column("release_id", Integer, ForeignKey("release.id")),
    Column("status", Enum(PackageStatus)),
    extend_existing=True,
)


class CVE(Base):
    __tablename__ = "cve"

    id = Column(Integer, primary_key=True)
    candidate = Column(String, unique=True)
    public_date = Column(DateTime)
    public_date_usn = Column(DateTime)
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
    packages = relationship("Package", secondary=cve_packages)
    status = Column(Enum(CveStatus))


class Notice(Base):
    __tablename__ = "notice"

    id = Column(Integer, primary_key=True)
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
