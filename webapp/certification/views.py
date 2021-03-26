import flask
import talisker.requests
import talisker.sentry
from requests import Session
from webapp.certification.api import CertificationAPI

session = Session()
talisker.requests.configure(session)
api = CertificationAPI(
    base_url="https://certification.canonical.com/api/v1", session=session
)


def certification_home():

    certified_releases = api.certified_releases(limit="0")["objects"]
    certified_makes = api.certified_makes(limit="0")["objects"]

    # Desktop section
    desktop_releases = []
    desktop_vendors = []

    # SoC section
    soc_releases = []
    soc_vendors = []

    # IoT section
    iot_releases = []
    iot_vendors = []

    for release in certified_releases:
        version = release["release"]

        if int(release["desktops"]) > 0 or int(release["laptops"]) > 0:
            release["path"] = f"/certification?form=Desktop&release={version}"
            desktop_releases.append(release)

        if int(release["smart_core"] > 1):
            release[
                "path"
            ] = f"/certification?form=Ubuntu%20Core&release={version}"
            iot_releases.append(release)

        if int(release["soc"] > 1):
            release["path"] = f"/certification?form=SoC&release={version}"
            soc_releases.append(release)

    for vendor in certified_makes:
        make = vendor["make"]

        if int(vendor["desktops"]) > 0 or int(vendor["laptops"]) > 0:
            vendor["path"] = f"/certification?form=Desktop&vendor={make}"
            desktop_vendors.append(vendor)

        if int(vendor["smart_core"] > 1):
            vendor["path"] = f"/certification?form=Ubuntu%20Core&vendor={make}"
            iot_vendors.append(vendor)

        if int(vendor["soc"] > 1):
            vendor["path"] = f"/certification?form=SoC&vendor={make}"
            soc_vendors.append(vendor)

    # Server section
    server_releases = {}
    server_vendors = api.vendor_summaries_server()["vendors"]

    for vendor in server_vendors:
        for release in vendor["releases"]:
            if release in server_releases:
                server_releases[release] += vendor[release]
            else:
                server_releases[release] = vendor[release]

    return flask.render_template(
        "certification/index.html",
        desktop_releases=desktop_releases,
        desktop_vendors=desktop_vendors,
        server_releases=server_releases,
        iot_releases=iot_releases,
        iot_vendors=iot_vendors,
        soc_releases=soc_releases,
        soc_vendors=soc_vendors,
    )
