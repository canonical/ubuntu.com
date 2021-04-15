import talisker.requests
import talisker.sentry

import math
from flask import request, render_template, abort
from requests import Session
from webapp.certification.api import CertificationAPI
from collections import defaultdict
from webapp.certification.helpers import get_download_url

session = Session()
talisker.requests.configure(session)
api = CertificationAPI(
    base_url="https://certification.canonical.com/api/v1", session=session
)


def certification_model_details(canonical_id):
    models = api.certified_models(canonical_id=canonical_id)["objects"]

    if not models:
        abort(404)

    model_releases = api.certified_model_details(
        canonical_id=canonical_id, limit="0"
    )["objects"]
    component_summaries = api.component_summaries(canonical_id=canonical_id)[
        "objects"
    ]

    release_details = {"components": {}, "releases": []}
    has_enabled_releases = False

    for model_release in model_releases:
        ubuntu_version = model_release["certified_release"]
        arch = model_release["architecture"]

        if arch == "amd64":
            arch = "64 Bit"

        release_info = {
            "name": f"Ubuntu {ubuntu_version} {arch}",
            "kernel": model_release["kernel_version"],
            "bios": model_release["bios"],
            "level": model_release["level"],
            "notes": model_release["notes"],
            "version": ubuntu_version,
            "download_url": get_download_url(models[0], model_release),
        }

        if release_info["level"] == "Enabled":
            has_enabled_releases = True

        release_details["releases"].append(release_info)

        for device_category, devices in model_release.items():
            if (
                device_category
                in ["video", "processor", "network", "wireless"]
                and devices
            ):
                device_category = device_category.capitalize()

                release_details["components"][device_category] = []

                if device_category in release_details["components"]:
                    for device in devices:
                        release_details["components"][device_category].append(
                            {
                                "name": (
                                    f"{device['make']} {device['name']}"
                                    f" {device['subproduct_name']}"
                                ),
                                "bus": device["bus"],
                                "identifier": device["identifier"],
                            }
                        )

    # Build model name
    model_names = [model["model"] for model in models]

    category = models[0]["category"]
    # default to category, which contains the least specific form_factor
    form_factor = model_release and model_release.get("form_factor", category)

    return render_template(
        "certification/model-details.html",
        canonical_id=canonical_id,
        name=", ".join(model_names),
        category=category,
        form_factor=form_factor,
        vendor=models[0]["make"],
        major_release=models[0]["major_release"],
        release_details=release_details,
        has_enabled_releases=has_enabled_releases,
        components=component_summaries,
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

        if release not in all_releases:
            all_releases.append(version)
            all_releases = sorted(all_releases, reverse=True)

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
            all_vendors = sorted(all_vendors)

        if int(vendor["desktops"]) > 0 or int(vendor["laptops"]) > 0:
            vendor["path"] = f"/certification?form=Desktop&vendor={make}"
            desktop_vendors.append(vendor)

        if int(vendor["smart_core"] > 1):
            vendor["path"] = f"/certification?form=Ubuntu%20Core&vendor={make}"
            iot_vendors.append(vendor)

        if int(vendor["soc"] > 1):
            vendor["path"] = f"/certification?form=Server%20SoC&vendor={make}"
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
        filters = request.args.get("filters", default=False, type=bool)

        forms = (
            ",".join(request.args.getlist("form"))
            if request.args.getlist("form")
            else None
        )
        if "Models" in forms:
            forms = ",".join(
                ["Desktops", "Laptops", "Ubuntu Core", "Server", "Server SoC"]
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

        # Filters and result numbers
        form_filters = {
            "Laptop": 0,
            "Desktop": 0,
            "Ubuntu Core": 0,
            "Server": 0,
            "Server SoC": 0,
        }
        release_filters = defaultdict(lambda: 0)
        for release in all_releases:
            release_filters[release] = 0

        vendor_filters = defaultdict(lambda: 0)
        for vendor in all_vendors:
            vendor_filters[vendor] = 0

        results = models_response["objects"]

        # Populate filter numbers
        for model in results:
            form_filters[model["category"]] += 1
            release_filters[model["release"]] += 1
            vendor_filters[model["make"]] += 1

        # Pagination
        total_results = models_response["meta"]["total_count"]

        return render_template(
            "certification/search-results.html",
            results=results,
            query=query,
            form=forms,
            releases=releases,
            form_filters=form_filters,
            release_filters=release_filters,
            vendor_filters=vendor_filters,
            vendors=vendors,
            total_results=total_results,
            total_pages=math.ceil(total_results / limit),
            offset=offset,
            limit=limit,
            filters=filters,
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
