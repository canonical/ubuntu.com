import talisker.requests
import talisker.sentry

import math
from flask import request, render_template
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

    # Search results filters
    all_releases = []
    all_vendors = []

    for release in certified_releases:
        version = release["release"]

        if version not in all_vendors:
            all_releases.append(version)

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

        if make not in all_vendors:
            all_vendors.append(make)

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

    if request.args:
        query = request.args.get("text", default=None, type=str)
        limit = request.args.get("limit", default=20, type=int)
        offset = request.args.get("offset", default=0, type=int)

        forms = (
            ",".join(request.args.getlist("form"))
            if request.args.getlist("form")
            else None
        )
        releases = (
            ",".join(request.args.getlist("release"))
            if request.args.getlist("release")
            else None
        )
        vendors = (
            ",".join(request.args.getlist("vendor"))
            if request.args.getlist("vendor")
            else None
        )

        models_response = api.certified_models(
            category__in=forms,
            major_release__in=releases,
            vendor=vendors,
            query=query,
            offset=offset,
        )
        results = models_response["objects"]
        total = models_response["meta"]["total_count"]

        if forms and ("Components" in forms):
            components_response = api.component_summaries(
                category__iexact=forms,
                make=vendors,
                query=query,
                offset=offset,
            )
            results.append(components_response["objects"])
            total += components_response["meta"]["total_count"]

        # Pagination
        total_results = total

        params = request.args.copy()
        params.pop("page", None)
        query_items = []

        for key, value_list in params.lists():
            for value in value_list:
                query_items.append(f"{key}={value}")

        return render_template(
            "certification/search-results.html",
            results=results,
            query=query,
            form=forms,
            releases=releases,
            all_releases=sorted(all_releases, reverse=True),
            vendors=vendors,
            all_vendors=sorted(all_vendors),
            total=total,
            query_string="&".join(query_items),
            total_results=total_results,
            total_pages=math.ceil(total_results / limit),
            offset=offset,
            limit=limit,
        )

    else:

        return render_template(
            "certification/index.html",
            desktop_releases=desktop_releases,
            desktop_vendors=desktop_vendors,
            server_releases=server_releases,
            iot_releases=iot_releases,
            iot_vendors=iot_vendors,
            soc_releases=soc_releases,
            soc_vendors=soc_vendors,
        )
