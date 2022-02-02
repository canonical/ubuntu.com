#! /usr/bin/env python3

import os
import sys

sys.path.append(os.getcwd())

from datetime import datetime

from webapp.security.models import Notice, Release, Status, CVE, Package
from webapp.security.database import db_session


release = Release(
    codename="some release",
    name="00.00",
    version="0.0.0",
    lts=True,
    development=False,
    release_date=datetime.now(),
    esm_expires=datetime.now(),
    support_expires=datetime.now()
)
db_session.add(release)

package = Package(
    name="some package",
    source="",
    launchpad="",
    ubuntu="",
    debian=""
)
db_session.add(package)


for usn_num in range(9999):
    cves = []

    for cve_num in range(5):
        cve = CVE(
            id=f"CVE-{usn_num}-{cve_num}",
            published=datetime.now(),
            description="",
            ubuntu_description="",
            notes={},
            priority="unknown",
            cvss3=2.3,
            mitigation="",
            references={},
            patches={},
            tags={},
            bugs={},
            status="active"
        )
        db_session.add(cve)
        cves.append(cve)

        status = Status(
            status="pending",
            cve=cve,
            package=package,
            release=release
        )
        db_session.add(status)

    notice = Notice(
        id=f"USN-{usn_num:04d}",
        is_hidden=False,
        published=datetime.now(),
        summary="",
        details="",
        instructions="",
        releases=[release],
        cves=cves
    )
    db_session.add(notice)

db_session.commit()

