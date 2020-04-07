# Fix module not found when run as script
import sys

sys.path.insert(0, "")

# Start of script
from webapp.security.database import db_session  # noqa
from webapp.security.models import CVE, CVEReference, Bug  # noqa


def load_sample_cve():

    db_session.query(CVE).delete()
    packages = [
        {
            "name": "gitlab",
            "type": "package",
            "source": "https://launchpad.net/distros/ubuntu/+source/gitlab",
            "ubuntu": "https://launchpad.net/ubuntu/+source/gitlab",
            "debian": "https://tracker.debian.org/pkg/gitlab",
            "releases": [
                {"name": "Upstream", "status": "DNE"},
                {
                    "name": "Ubuntu 16.04 LTS (Xenial Xerus)",
                    "status": "needs-triage",
                },
                {
                    "name": "Ubuntu 12.04 ESM (Precise Pangolin)",
                    "status": "needs-triage",
                },
                {
                    "name": "Ubuntu 18.04 LTS (Bionic Beaver)",
                    "status": "needs-triage",
                },
                {
                    "name": "Ubuntu 20.04 (Focal Fossa)",
                    "status": "not-affected",
                    "status_description": "(1.0.49-4)",
                },
            ],
        },
        {
            "name": "gitlab2",
            "type": "package",
            "source": "https://launchpad.net/distros/ubuntu/+source/gitlab",
            "ubuntu": "https://launchpad.net/ubuntu/+source/gitlab",
            "debian": "https://tracker.debian.org/pkg/gitlab",
            "releases": [
                {"name": "Upstream", "status": "DNE"},
                {
                    "name": "Ubuntu 16.04 LTS (Xenial Xerus)",
                    "status": "needs-triage",
                },
                {
                    "name": "Ubuntu 12.04 ESM (Precise Pangolin)",
                    "status": "needs-triage",
                },
            ],
        },
        {
            "name": "gitlab3",
            "type": "package",
            "source": "https://launchpad.net/distros/ubuntu/+source/gitlab",
            "ubuntu": "https://launchpad.net/ubuntu/+source/gitlab",
            "debian": "https://tracker.debian.org/pkg/gitlab",
            "releases": [{"name": "Upstream", "status": "DNE"}],
        },
        {
            "name": "gitlab4",
            "type": "package",
            "source": "https://launchpad.net/distros/ubuntu/+source/gitlab",
            "ubuntu": "https://launchpad.net/ubuntu/+source/gitlab",
            "debian": "https://tracker.debian.org/pkg/gitlab",
            "releases": [
                {"name": "Upstream", "status": "DNE"},
                {
                    "name": "Ubuntu 16.04 LTS (Xenial Xerus)",
                    "status": "needs-triage",
                },
                {
                    "name": "Ubuntu 12.04 ESM (Precise Pangolin)",
                    "status": "needs-triage",
                },
            ],
        },
    ]
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
            packages=packages,
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
            packages=packages,
        ),
        CVE(
            id="CVE-2020-9064",
            status="not-for-us",
            notes="Ubuntu-security Does not apply to software "
            + "found in Ubuntu. Huawei",
            packages=packages,
        ),
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
        Bug(uri="http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=952471"),
    ]

    db_session.bulk_save_objects(objects)

    # Link packages
    cve = db_session.query(CVE).first()
    reference_query = db_session.query(CVEReference).all()
    bugs_query = db_session.query(Bug).all()

    for ref in reference_query:
        cve.references.append(ref)

    for bug in bugs_query:
        cve.bugs.append(bug)

    db_session.add(cve)
    db_session.commit()
    db_session.flush()

    return


if __name__ == "__main__":
    load_sample_cve()
