import yaml

from webapp.security.database import db_session
from webapp.security.models import Release


with open("webapp/security/fixtures/releases.yaml") as file:
    document = yaml.full_load(file)
    for codename, r in document["releases"].items():
        release = Release(
            name=r["name"],
            version=r["version"],
            codename=codename,
            lts=r["lts"],
        )

        db_session.add(release)
        db_session.commit()
