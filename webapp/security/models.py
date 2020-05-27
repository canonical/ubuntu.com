from collections import defaultdict
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
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

notice_releases = Table(
    "notice_releases",
    Base.metadata,
    Column("notice_id", String, ForeignKey("notice.id")),
    Column("release_codename", String, ForeignKey("release.codename")),
)


class CVE(Base):
    __tablename__ = "cve"

    id = Column(String, primary_key=True)
    published = Column(DateTime)
    description = Column(String)
    ubuntu_description = Column(String)
    notes = Column(JSON)
    priority = Column(
        Enum(
            "unknown",
            "negligible",
            "low",
            "medium",
            "high",
            "critical",
            name="priorities",
        )
    )
    cvss3 = Column(Float)
    references = Column(JSON)
    bugs = Column(JSON)
    status = Column(String)
    statuses = relationship("Status", cascade="all, delete-orphan")
    notices = relationship(
        "Notice", secondary=notice_cves, back_populates="cves"
    )

    @hybrid_property
    def status_tree(self):
        status_tree = defaultdict(dict)
        for status in self.statuses:
            status_tree[status.package_name][status.release_codename] = status

        return status_tree


class Notice(Base):
    __tablename__ = "notice"

    id = Column(String, primary_key=True)
    title = Column(String)
    published = Column(DateTime)
    summary = Column(String)
    details = Column(String)
    instructions = Column(String)
    release_packages = Column(JSON)
    cves = relationship("CVE", secondary=notice_cves, back_populates="notices")
    references = Column(JSON)
    releases = relationship(
        "Release",
        secondary=notice_releases,
        back_populates="notices",
        order_by="desc(Release.release_date)",
    )


class Release(Base):
    __tablename__ = "release"

    codename = Column(String, primary_key=True)
    name = Column(String, unique=True)
    version = Column(String, unique=True)
    lts = Column(Boolean)
    development = Column(Boolean)
    release_date = Column(DateTime)
    esm_expires = Column(DateTime)
    support_expires = Column(DateTime)
    statuses = relationship("Status", cascade="all, delete-orphan")
    notices = relationship(
        "Notice", secondary=notice_releases, back_populates="releases"
    )

    @hybrid_property
    def support_tag(self):
        now = datetime.now()

        if self.lts and self.support_expires > now:
            return "LTS"
        elif self.lts and self.esm_expires > now:
            return "ESM"

        return ""


class Status(Base):
    __tablename__ = "status"

    cve_id = Column(String, ForeignKey("cve.id"), primary_key=True)
    package_name = Column(String, ForeignKey("package.name"), primary_key=True)
    release_codename = Column(
        String, ForeignKey("release.codename"), primary_key=True
    )
    status = Column(
        Enum(
            "released",
            "DNE",
            "needed",
            "not-affected",
            "deferred",
            "needs-triage",
            "ignored",
            "pending",
            name="statuses",
        )
    )
    description = Column(String)

    cve = relationship("CVE", back_populates="statuses")
    package = relationship("Package", back_populates="statuses")
    release = relationship("Release", back_populates="statuses")


class Package(Base):
    __tablename__ = "package"

    name = Column(String, primary_key=True)
    source = Column(String)
    launchpad = Column(String)
    ubuntu = Column(String)
    debian = Column(String)
    statuses = relationship("Status", cascade="all, delete-orphan")
