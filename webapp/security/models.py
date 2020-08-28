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
    patches = Column(JSON)
    tags = Column(JSON)
    bugs = Column(JSON)
    status = Column(
        Enum("not-in-ubuntu", "active", "rejected", name="cve_statuses")
    )
    statuses = relationship("Status", cascade="all, delete-orphan")
    notices = relationship(
        "Notice", secondary=notice_cves, back_populates="cves"
    )

    @hybrid_property
    def packages(self):
        packages = defaultdict(dict)
        for status in self.statuses:
            packages[status.package_name][status.release_codename] = status

        return packages

    @hybrid_property
    def active_status_tree(self):
        active_package_statuses = {}

        for package_name, release_statuses in self.packages.items():
            for status in release_statuses.values():
                if (
                    status.status in Status.active_statuses
                    and status.release.version
                    and status.release.support_tag
                ):
                    active_package_statuses[package_name] = release_statuses

        return active_package_statuses

    @hybrid_property
    def formatted_patches(self):
        return {
            package_name: [self._format_patch(p) for p in patches]
            for (package_name, patches) in self.patches.items()
        }

    def _format_patch(self, patch):
        if ":" not in patch:
            return {"type": "text", "content": patch}

        prefix, suffix = patch.split(":", 1)
        suffix = suffix.strip()
        if prefix == "break-fix" and " " in suffix:
            introduced, fixed = suffix.split(" ", 1)
            if introduced == "-":
                # First commit to Linux git tree
                introduced = "1da177e4c3f41524e886b7f1b8a0c1fc7321cac2"

            return {
                "type": "break-fix",
                "content": {"introduced": introduced, "fixed": fixed},
            }
        if "ftp://" in suffix or "http://" in suffix or "https://" in suffix:
            return {
                "type": "link",
                "content": {"prefix": prefix.capitalize(), "suffix": suffix},
            }

        return {"type": "text", "content": patch}


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
        order_by="desc(Release.release_date)",
        back_populates="notices",
    )

    @hybrid_property
    def package_list(self):
        if not self.release_packages:
            return []

        package_list = []
        for codename, packages in self.release_packages.items():
            for package in packages:
                package_list.append(package["name"])

        return set(sorted(package_list))

    def as_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "published": self.published,
            "summary": self.summary,
            "details": self.details,
            "instructions": self.instructions,
            "references": self.references,
            "release_packages": self.release_packages,
            "cves": [c.id for c in self.cves],
        }


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

    active_statuses = [
        "released",
        "needed",
        "deferred",
        "needs-triage",
        "pending",
    ]

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
    component = Column(
        Enum("main", "universe", name="components"),
    )
    pocket = Column(
        Enum("security", "updates", "esm-infra", "esm-apps", name="pockets"),
    )

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
