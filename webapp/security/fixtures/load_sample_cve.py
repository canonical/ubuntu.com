# Fix module not found when run as script
import sys
from datetime import datetime

sys.path.insert(0, "")

# Start of script
from webapp.security.database import db_session  # noqa
from webapp.security.models import (
    CVE,
    CVEReference,
    Bug,
    Package,
    PackageReleaseStatus,
    Release,
)  # noqa


def load_sample_cve():

    db_session.query(CVE).delete()
    objects = [
        CVE(
            id="CVE-2020-10535",
            status="active",
            last_updated_date="2020-03-17 23:15:00 UTC",
            public_date_usn="2020-03-12 23:15:00 UTC",
            public_date="2020-03-12 23:15:00 UTC",
            priority="low",
            cvss="9.6",
            assigned_to="msalvatore",
            discovered_by="msalvatore",
            approved_by="mmorlino",
            description="GitLab 12.8.x before 12.8.6, when sign-up is enabled,"
            + " allows remote attackers "
            + "to bypass email domain",
            ubuntu_description="Lorem ipsum dolor sit amet,"
            + " consectetur adipiscing elit, sed do eiusmod tempor"
            + " incididunt ut labore et dolore magna aliqua.",
            notes="msalvatore> Affects GitLab 12.8.0 to 12.8.5",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        Release(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
            references=[
                CVEReference(
                    uri="https://cve.mitre.org/cgi-bin/cvename.cgi?"
                    + "name=CVE-2020-9365"
                ),
                CVEReference(
                    uri="https://github.com/jedisct1/pure-ftpd/commit/"
                    + "36c6d268cb190282a2c17106acfd31863121b"
                ),
                CVEReference(
                    uri="https://github.com/jedisct1/pure-ftpd/commit/"
                    + "36c6d268cb190282a2c17106acfd31863121b58e"
                ),
            ],
            bugs=[
                Bug(
                    uri="http://bugs.debian.org/cgi-bin/"
                    + "bugreport.cgi?bug=952471"
                ),
            ],
        ),
        CVE(
            id="CVE-2019-1010262",
            status="rejected",
            public_date="2020-03-12 23:15:00 UTC",
            last_updated_date="2020-03-15 23:15:00 UTC",
            priority="medium",
            cvss="8.2",
            description="** REJECT ** DO NOT USE THIS CANDIDATE NUMBER."
            + " ConsultIDs: CVE-2019-1010142. Reason: This candidate"
            + " is a reservation duplicate of CVE-2019-1010142.",
            references=[
                CVEReference(
                    uri="https://cve.mitre.org/cgi-bin/cvename.cgi?"
                    + "name=CVE-2020-9365"
                ),
                CVEReference(
                    uri="https://github.com/jedisct1/pure-ftpd/commit/"
                    + "36c6d268cb190282a2c17106acfd31863121b"
                ),
                CVEReference(
                    uri="https://github.com/jedisct1/pure-ftpd/commit/"
                    + "36c6d268cb190282a2c17106acfd31863121b58e"
                ),
            ],
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-9064",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. Huawei",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-7629",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. install-package node module",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-7630",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. install-package node module",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-8637",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. git-add-remote node module",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-8638",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. TestLinkOpenSourceTRMS",
            packages=[
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-8638",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. TestLinkOpenSourceTRMS",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVE(
            id="CVE-2020-8639",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. TestLinkOpenSourceTRMS",
            packages=[
                Package(
                    name="gitlab",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab2",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab3",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE"),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
                Package(
                    name="gitlab4",
                    type="package",
                    source="https://launchpad.net/distros/"
                    + "ubuntu/+source/gitlab",
                    ubuntu="https://launchpad.net/ubuntu/+source/gitlab",
                    debian="https://tracker.debian.org/pkg/gitlab",
                    releases=[
                        PackageReleaseStatus(name="Upstream", status="DNE",),
                        PackageReleaseStatus(
                            name="Ubuntu 12.04 ESM (Precise Pangolin)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 14.04 ESM (Precise Pangolin)",
                            status="DNE",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 16.04 LTS (Xenial Xerus)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 18.04 LTS (Bionic Beaver)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 19.10 (Eoan Ermine)",
                            status="needs-triage",
                        ),
                        PackageReleaseStatus(
                            name="Ubuntu 20.04 (Focal Fossa)",
                            status="not-affected",
                            status_description="(1.0.49-4)",
                        ),
                    ],
                ),
            ],
        ),
        CVEReference(
            uri="https://cve.mitre.org/cgi-bin/cvename.cgi?"
            + "name=CVE-2020-9365"
        ),
        Release(
            codename="warty",
            version="4.10",
            name="Warty Warthog",
            development=False,
            lts=False,
            release_date=datetime.strptime("2004-10-20", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2004-10-20", "%Y-%m-%d"),
            support_expires=datetime.strptime("2004-10-20", "%Y-%m-%d"),
        ),
        Release(
            codename="hoary",
            version="5.04",
            name="Hoary Hedgehog",
            development=False,
            lts=False,
            release_date=datetime.strptime("2005-04-08", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2005-04-08", "%Y-%m-%d"),
            support_expires=datetime.strptime("2005-04-08", "%Y-%m-%d"),
        ),
        Release(
            codename="breezy",
            version="5.10",
            name="Breezy Badger",
            development=False,
            lts=False,
            release_date=datetime.strptime("2005-10-13", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2005-10-13", "%Y-%m-%d"),
            support_expires=datetime.strptime("2005-10-13", "%Y-%m-%d"),
        ),
        Release(
            codename="dapper",
            version="6.06",
            name="Dapper Drake",
            development=False,
            lts=True,
            release_date=datetime.strptime("2006-06-01", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2006-06-01", "%Y-%m-%d"),
            support_expires=datetime.strptime("2006-06-01", "%Y-%m-%d"),
        ),
        Release(
            codename="edgy",
            version="6.10",
            name="Edgy Eft",
            development=False,
            lts=False,
            release_date=datetime.strptime("2006-10-26", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2006-10-26", "%Y-%m-%d"),
            support_expires=datetime.strptime("2006-10-26", "%Y-%m-%d"),
        ),
        Release(
            codename="feisty",
            version="7.04",
            name="Feisty Fawn",
            development=False,
            lts=False,
            release_date=datetime.strptime("2007-04-19", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2007-04-19", "%Y-%m-%d"),
            support_expires=datetime.strptime("2007-04-19", "%Y-%m-%d"),
        ),
        Release(
            codename="gutsy",
            version="7.10",
            name="Gutsy Gibbon",
            development=False,
            lts=False,
            release_date=datetime.strptime("2007-10-18", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2007-10-18", "%Y-%m-%d"),
            support_expires=datetime.strptime("2007-10-18", "%Y-%m-%d"),
        ),
        Release(
            codename="hardy",
            version="8.04",
            name="Hardy Heron",
            development=False,
            lts=True,
            release_date=datetime.strptime("2008-04-24", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2008-04-24", "%Y-%m-%d"),
            support_expires=datetime.strptime("2008-04-24", "%Y-%m-%d"),
        ),
        Release(
            codename="intrepid",
            version="8.10",
            name="Intrepid Ibex",
            development=False,
            lts=False,
            release_date=datetime.strptime("2008-10-30", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2008-10-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2008-10-30", "%Y-%m-%d"),
        ),
        Release(
            codename="jaunty",
            version="9.04",
            name="Jaunty Jackalope",
            development=False,
            lts=False,
            release_date=datetime.strptime("2009-04-23", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2008-10-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2008-10-30", "%Y-%m-%d"),
        ),
        Release(
            codename="karmic",
            version="9.10",
            name="Karmic Koala",
            development=False,
            lts=False,
            release_date=datetime.strptime("2009-10-29", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2009-10-29", "%Y-%m-%d"),
            support_expires=datetime.strptime("2009-10-29", "%Y-%m-%d"),
        ),
        Release(
            codename="lucid",
            version="10.04",
            name="Lucid Lynx",
            development=False,
            lts=True,
            release_date=datetime.strptime("2010-04-29", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2010-04-29", "%Y-%m-%d"),
            support_expires=datetime.strptime("2010-04-29", "%Y-%m-%d"),
        ),
        Release(
            codename="maverick",
            version="10.10",
            name="Maverick Meerkat",
            development=False,
            lts=False,
            release_date=datetime.strptime("2010-10-10", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2010-10-10", "%Y-%m-%d"),
            support_expires=datetime.strptime("2010-10-10", "%Y-%m-%d"),
        ),
        Release(
            codename="natty",
            version="11.04",
            name="Natty Narwhal",
            development=False,
            lts=False,
            release_date=datetime.strptime("2011-04-28", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2011-04-28", "%Y-%m-%d"),
            support_expires=datetime.strptime("2011-04-28", "%Y-%m-%d"),
        ),
        Release(
            codename="oneiric",
            version="11.10",
            name="Oneiric Ocelot",
            development=False,
            lts=False,
            release_date=datetime.strptime("2011-10-13", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2011-10-13", "%Y-%m-%d"),
            support_expires=datetime.strptime("2011-10-13", "%Y-%m-%d"),
        ),
        Release(
            codename="precise",
            version="12.04",
            name="Precise Pangolin",
            development=False,
            lts=True,
            release_date=datetime.strptime("2012-04-26", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2012-04-26", "%Y-%m-%d"),
            support_expires=datetime.strptime("2012-04-26", "%Y-%m-%d"),
        ),
        Release(
            codename="quantal",
            version="12.10",
            name="Quantal Quetzal",
            development=False,
            lts=False,
            release_date=datetime.strptime("2012-10-18", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2012-10-18", "%Y-%m-%d"),
            support_expires=datetime.strptime("2012-10-18", "%Y-%m-%d"),
        ),
        Release(
            codename="raring",
            version="13.04",
            name="Raring Ringtail",
            development=False,
            lts=False,
            release_date=datetime.strptime("2013-04-25", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2013-04-25", "%Y-%m-%d"),
            support_expires=datetime.strptime("2013-04-25", "%Y-%m-%d"),
        ),
        Release(
            codename="saucy",
            version="13.10",
            name="Saucy Salamander",
            development=False,
            lts=False,
            release_date=datetime.strptime("2013-10-17", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2013-10-17", "%Y-%m-%d"),
            support_expires=datetime.strptime("2013-10-17", "%Y-%m-%d"),
        ),
        Release(
            codename="trusty",
            version="14.04",
            name="Trusty Tahr",
            development=False,
            lts=True,
            release_date=datetime.strptime("2014-04-17", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2022-04-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2019-04-30", "%Y-%m-%d"),
        ),
        Release(
            codename="utopic",
            version="14.10",
            name="Utopic Unicorn",
            development=False,
            lts=False,
            release_date=datetime.strptime("2014-10-23", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2014-10-23", "%Y-%m-%d"),
            support_expires=datetime.strptime("2014-10-23", "%Y-%m-%d"),
        ),
        Release(
            codename="vivid",
            version="15.04",
            name="Vivid Vervet",
            development=False,
            lts=False,
            release_date=datetime.strptime("2015-04-23", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2015-04-23", "%Y-%m-%d"),
            support_expires=datetime.strptime("2015-04-23", "%Y-%m-%d"),
        ),
        Release(
            codename="wily",
            version="15.10",
            name="Wily Werewolf",
            development=False,
            lts=False,
            release_date=datetime.strptime("2015-10-22", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2015-10-22", "%Y-%m-%d"),
            support_expires=datetime.strptime("2015-10-22", "%Y-%m-%d"),
        ),
        Release(
            codename="xenial",
            version="16.04",
            name="Xenial Xerus",
            development=False,
            lts=True,
            release_date=datetime.strptime("2016-04-21", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2024-04-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2021-04-30", "%Y-%m-%d"),
        ),
        Release(
            codename="yakkety",
            version="16.10",
            name="Yakkety Yak",
            development=False,
            lts=False,
            release_date=datetime.strptime("2016-10-13", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2016-10-13", "%Y-%m-%d"),
            support_expires=datetime.strptime("2016-10-13", "%Y-%m-%d"),
        ),
        Release(
            codename="zesty",
            version="17.04",
            name="Zesty Zapus",
            development=False,
            lts=False,
            release_date=datetime.strptime("2017-04-13", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2017-04-13", "%Y-%m-%d"),
            support_expires=datetime.strptime("2017-04-13", "%Y-%m-%d"),
        ),
        Release(
            codename="artful",
            version="17.10",
            name="Artful Aardvark",
            development=False,
            lts=False,
            release_date=datetime.strptime("2017-10-19", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2017-10-19", "%Y-%m-%d"),
            support_expires=datetime.strptime("2017-10-19", "%Y-%m-%d"),
        ),
        Release(
            codename="bionic",
            version="18.04",
            name="Bionic Beaver",
            development=False,
            lts=True,
            release_date=datetime.strptime("2018-04-26", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2028-04-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2023-04-30", "%Y-%m-%d"),
        ),
        Release(
            codename="cosmic",
            version="18.10",
            name="Cosmic Cuttlefish",
            development=False,
            lts=False,
            release_date=datetime.strptime("2018-10-18", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2018-10-18", "%Y-%m-%d"),
            support_expires=datetime.strptime("2018-10-18", "%Y-%m-%d"),
        ),
        Release(
            codename="disco",
            version="19.04",
            name="Disco Dingo",
            development=False,
            lts=False,
            release_date=datetime.strptime("2019-04-18", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2019-04-18", "%Y-%m-%d"),
            support_expires=datetime.strptime("2019-04-18", "%Y-%m-%d"),
        ),
        Release(
            codename="eoan",
            version="19.10",
            name="Eoan Ermine",
            development=False,
            lts=False,
            release_date=datetime.strptime("2019-10-17", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2019-10-17", "%Y-%m-%d"),
            support_expires=datetime.strptime("2019-10-17", "%Y-%m-%d"),
        ),
        Release(
            codename="focal",
            version="20.04",
            name="Focal Fossa",
            development=False,
            lts=True,
            release_date=datetime.strptime("2020-04-23", "%Y-%m-%d"),
            esm_expires=datetime.strptime("2030-04-30", "%Y-%m-%d"),
            support_expires=datetime.strptime("2025-04-30", "%Y-%m-%d"),
        ),
    ]

    db_session.add_all(objects)
    db_session.commit()
    db_session.flush()
    return


if __name__ == "__main__":
    load_sample_cve()
