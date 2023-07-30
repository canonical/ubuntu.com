import talisker.requests
import talisker.sentry
import requests
import math
import flask

from flask import request, render_template, abort, current_app, redirect
from requests import Session
from webapp.certified.api import CertificationAPI, PartnersAPI
from urllib.parse import urlencode

from webapp.certified.helpers import get_download_url

session = Session()
talisker.requests.configure(session)
api = CertificationAPI(
    base_url="https://certification.canonical.com/api/v1", session=session
)
partners_api = PartnersAPI(session=session)


def certified_routes(app):
    """
    Load all /certified routes

    The purpose of this function is to liberate
    space on app.py. These endpoints are pretty stable
    and independent, so they don't need to reside on app.py
    """

    app.add_url_rule("/certified", view_func=certified_home)
    app.add_url_rule(
        "/certified/<canonical_id>",
        view_func=certified_model_details,
    )
    app.add_url_rule(
        "/certified/<canonical_id>/<release>",
        view_func=certified_hardware_details,
    )
    app.add_url_rule(
        "/certified/component/<component_id>",
        view_func=certified_component_details,
    )
    app.add_url_rule(
        "/certified/vendors/<vendor>",
        view_func=certified_vendors,
    )
    app.add_url_rule(
        "/certified/desktops",
        view_func=certified_desktops,
    )
    app.add_url_rule(
        "/certified/laptops",
        view_func=certified_laptops,
    )
    app.add_url_rule(
        "/certified/servers",
        view_func=certified_servers,
    )
    app.add_url_rule(
        "/certified/iot",
        view_func=certified_devices,
    )
    app.add_url_rule(
        "/certified/socs",
        view_func=certified_socs,
    )
    app.add_url_rule(
        "/certified/why-certify",
        view_func=certified_why,
    )
    app.add_url_rule("/certified/filters.json", view_func=lambda : get_filters(json=True))


def _render_category_filters(selected_categories: list):
    """
    Args:

    - selected_categories: a list of requests.args.getlist(category)
    passed by query string
    e.g. &category=Desktop&category=Laptops

    This function is also the source of truth for the list of
    certification categories (all_categories).
    If at some point we need a new category,
    it should be added here.
    """

    all_categories = ["Laptop", "Desktop", "Server", "Device", "SoC"]
    category_filters = []
    if len(selected_categories) > 0:
        for item in all_categories:
            if item in selected_categories:
                category_filters.insert(0, item)
            else:
                category_filters.append(item)
    else:
        category_filters = all_categories
    
    return category_filters

def get_filters(request_args=None, json: bool=False):
    certified_releases = api.certified_releases(limit="0")["objects"]
    certified_makes = api.certified_makes(limit="0")["objects"]

    # Laptop filters
    laptop_releases = []
    laptop_vendors = []

    # Desktop filters
    desktop_releases = []
    desktop_vendors = []

    # SoC filters
    soc_releases = []
    soc_vendors = []

    # IoT filters
    iot_releases = []
    iot_vendors = []

    # Server filters
    server_releases = []
    server_vendors = []

    # Search results filters
    all_releases = []
    release_filters = []
    all_vendors = []
    vendor_filters = []

    for release in certified_releases:
        version = release["release"]

        if release not in all_releases:
            # UX improvement: selected filter on top
            if request_args and version not in request_args.getlist("release"):
                all_releases.append(version)
                all_releases = sorted(all_releases, reverse=True)
            else:
                release_filters.append(version)

        if int(release["laptops"]) > 0:
            laptop_releases.append(release)

        if int(release["desktops"]) > 0:
            desktop_releases.append(release)

        if int(release["smart_core"] > 1):
            iot_releases.append(release)

        if int(release["soc"] > 1):
            soc_releases.append(release)

        if int(release["servers"] > 1):
            server_releases.append(release)

    for vendor in certified_makes:
        make = vendor["make"]

        if make not in all_vendors:
            # UX improvement: selected filter on top
            if request_args and make not in request_args.getlist("vendor"):
                all_vendors.append(make)
                all_vendors = sorted(all_vendors)
            else:
                vendor_filters.append(make)

        if int(vendor["laptops"]) > 0:
            laptop_vendors.append(vendor)

        if int(vendor["desktops"]) > 0:
            desktop_vendors.append(vendor)

        if int(vendor["smart_core"] > 1):
            iot_vendors.append(vendor)

        if int(vendor["soc"] > 1):
            soc_vendors.append(vendor)

        if int(vendor["servers"] > 1):
            server_vendors.append(vendor)
    
    if json:
        filters = {
            "laptop_releases": laptop_releases,
            "laptop_vendors": laptop_vendors,
            "desktop_releases": desktop_releases,
            "desktop_vendors": desktop_vendors,
            "soc_releases": soc_vendors,
            "iot_releases": iot_releases,
            "iot_vendors": iot_vendors,
            "server_releases": server_releases,
            "server_vendors": server_vendors,
            "all_releases": all_releases,
            "all_vendors": all_vendors,
            "vendor_filters": vendor_filters,
            "release_filters": release_filters
        }
        return flask.jsonify(filters)

    else:

        return (
            laptop_releases, laptop_vendors, desktop_releases,
            desktop_vendors, soc_releases, soc_vendors, iot_releases,
            iot_vendors, server_releases, server_vendors, all_releases, all_vendors, vendor_filters, release_filters
        )

def certified_component_details(component_id):
    try:
        component = api.component_summary(component_id)
    except requests.exceptions.HTTPError as error:
        if error.response.status_code == 404:
            abort(404)
        else:
            current_app.extensions["sentry"].captureException()
            abort(500)

    models_response = api.certified_models(
        canonical_id__in=component["machine_canonical_ids"],
        limit=0,
    )

    all_machines = models_response["objects"]

    machines_by_id = {}
    for machine in all_machines:
        machines_by_id[machine["canonical_id"]] = machine

    machines = machines_by_id.values()

    return render_template(
        "certified/component-details.html",
        component=component,
        machines=sorted(
            machines, key=lambda machine: machine["canonical_id"], reverse=True
        ),
    )


def certified_hardware_details(canonical_id, release):
    models = api.certified_models(canonical_id=canonical_id)["objects"]

    if not models or len(models) == 0:
        abort(404)

    models = models[0]

    model_releases = api.certified_model_details(
        canonical_id=canonical_id, limit="0"
    )["objects"]

    # Release section
    release_details = next(
        (
            detail
            for detail in model_releases
            if detail["certified_release"] == release
        ),
        None,
    )
    if not release_details:
        abort(404)

    model_devices = api.certified_model_devices(
        canonical_id=canonical_id, limit="0"
    )["objects"]

    hardware_details = {}
    for device in model_devices:
        device_info = {
            "name": (
                f"{device['make']} {device['name']}"
                f" {device['subproduct_name']}"
            ),
            "bus": device["bus"],
            "identifier": device["identifier"],
            "subsystem": device["subsystem"],
        }

        category = device["category"]
        if category not in ["BIOS", "USB"]:
            category = category.capitalize()

        if category not in hardware_details:
            hardware_details[category] = []

        hardware_details[category].append(device_info)

    return render_template(
        "certified/hardware-details.html",
        canonical_id=canonical_id,
        model_name=models["model"],
        form=models["category"],
        vendor=models["make"],
        major_release=models["major_release"],
        hardware_details=hardware_details,
        release_details=release_details,
    )


def certified_model_details(canonical_id):
    model_releases = api.certified_model_details(canonical_id=canonical_id)[
        "objects"
    ]

    if not model_releases:
        abort(404)

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
            "download_url": get_download_url(model_release),
            "components": {},
        }

        if release_info["level"] == "Enabled":
            has_enabled_releases = True

        for device_category, devices in model_release.items():
            if (
                device_category
                in ["video", "processor", "network", "wireless"]
                and devices
            ):
                device_category = device_category.capitalize()

                release_info["components"][device_category] = []

                if device_category in release_info["components"]:
                    for device in devices:
                        release_info["components"][device_category].append(
                            {
                                "name": (
                                    f"{device['make']} {device['name']}"
                                    f" {device['subproduct_name']}"
                                ),
                                "bus": device["bus"],
                                "identifier": device["identifier"],
                                "subsystem": device["subsystem"],
                            }
                        )
        release_details["releases"].append(release_info)

    # default to category, which contains the least specific form_factor
    form_factor = model_release and model_release.get(
        "form_factor", model_release["category"]
    )

    return render_template(
        "certified/model-details.html",
        canonical_id=canonical_id,
        name=model_release["model"],
        category=model_release["category"],
        form_factor=form_factor,
        vendor=model_release["make"],
        major_release=model_release["certified_release"],
        release_details=release_details,
        has_enabled_releases=has_enabled_releases,
        components=component_summaries,
        hardware_website=model_release["hardware_website"],
    )


def certified_home():

    laptop_releases, laptop_vendors, desktop_releases, desktop_vendors, soc_releases, soc_vendors, iot_releases, iot_vendors, server_releases, server_vendors, all_releases, all_vendors, vendor_filters, release_filters = get_filters(request.args)

    if (
        "category" in request.args
        and len(request.args.getlist("category")) == 1
    ):
        parameters = request.args.to_dict(flat=False)
        parameters.pop("category")
        new_params = ""
        for key in parameters:
            for value in parameters[key]:
                new_params += f"{key}={value}&"

        return redirect(
            f'/certified/{request.args["category"].lower()}s?{new_params}'
        )

    if "q" in request.args:
        query = request.args["q"]

        limit = request.args.get("limit", default=20, type=int)
        offset = request.args.get("offset", default=0, type=int)

        selected_categories = request.args.getlist("category")
        if "SoC" in selected_categories:
            selected_categories.remove("SoC")
            selected_categories.append("Server SoC")

        if "Device" in selected_categories:
            # Ubuntu Core is replaced by Device for UX purposes
            # Ubuntu Core is an operating system not a category
            selected_categories.remove("Device")
            # Put back Ubuntu Core, as required by API endpoint
            selected_categories.append("Ubuntu Core")

        categories = (
            ",".join(selected_categories) if selected_categories else None
        )
        if categories and "All" in categories:
            categories = None
        releases = (
            ",".join(request.args.getlist("release"))
            if request.args.getlist("release")
            else None
        )
        vendors = (
            request.args.getlist("vendor")
            if request.args.getlist("vendor")
            else None
        )

        models_response = api.certified_models(
            category__in=categories,
            major_release__in=releases,
            vendor=vendors,
            query=query,
            offset=offset,
            limit=limit,
        )

        results = models_response["objects"]

        # UX improvement: selected filter on top
        vendor_filters.extend(all_vendors)
        release_filters.extend(all_releases)


        category_filters = _render_category_filters(request.args.getlist("category"))

        for index, model in enumerate(results):
            # Replace "Ubuntu Core" with "Device"
            if model["category"] == "Ubuntu Core":
                results[index]["category"] = "Device"

        # Pagination
        total_results = models_response["meta"]["total_count"]

        return render_template(
            "certified/search-results.html",
            results=results,
            query=query,
            category=",".join(request.args.getlist("category")),
            releases=releases,
            category_filters=category_filters,
            release_filters=release_filters,
            vendor_filters=vendor_filters,
            vendors=vendors,
            total_results=total_results,
            total_pages=math.ceil(total_results / limit),
            offset=offset,
            limit=limit,
        )

    else:
        return render_template(
            "certified/index.html",
            laptop_releases=laptop_releases,
            laptop_vendors=laptop_vendors,
            desktop_releases=desktop_releases,
            desktop_vendors=desktop_vendors,
            server_releases=server_releases,
            server_vendors=server_vendors,
            iot_releases=iot_releases,
            iot_vendors=iot_vendors,
            soc_releases=soc_releases,
            soc_vendors=soc_vendors,
        )


def create_category_views(category, template_path):
    """
    Helper function to create multiple /certified/<page> category views

    Keyword arguments:
    category -- must be categories accepted by API (Desktop, Laptop, \
    Server, Ubuntu Core, Server SoC)
    template_path -- full template path (e.g. certified/search-results.html)
    """
    if category == "Desktop":
        certified_releases = api.certified_releases(
            limit="0", desktops__gte=1
        )["objects"]
        certified_makes = api.certified_makes(limit="0", desktops__gte=1)[
            "objects"
        ]
    elif category == "Laptop":
        certified_releases = api.certified_releases(limit="0", laptops__gte=1)[
            "objects"
        ]
        certified_makes = api.certified_makes(limit="0", laptops__gte=1)[
            "objects"
        ]
    elif category == "Server SoC":
        certified_releases = api.certified_releases(limit="0", soc__gte=1)[
            "objects"
        ]
        certified_makes = api.certified_makes(limit="0", soc__gte=1)["objects"]
    elif category == "Ubuntu Core":
        certified_releases = api.certified_releases(
            limit="0", smart_core__gte=1
        )["objects"]
        certified_makes = api.certified_makes(limit="0", smart_core__gte=1)[
            "objects"
        ]
    elif category == "Server":
        certified_releases = api.certified_releases(limit="0", servers__gte=1)[
            "objects"
        ]
        certified_makes = api.certified_makes(limit="0", servers__gte=1)[
            "objects"
        ]
    else:
        certified_releases = api.certified_releases(limit="0")["objects"]
        certified_makes = api.certified_makes(limit="0")["objects"]

    # Search results filters
    all_releases = []
    release_filters = []
    all_vendors = []
    vendor_filters = []

    for release in certified_releases:
        version = release["release"]

        if release not in all_releases:
            # UX improvement: selected filter on top
            if version not in request.args.getlist("release"):
                all_releases.append(version)
                all_releases = sorted(all_releases, reverse=True)
            else:
                release_filters.append(version)

    for vendor in certified_makes:
        make = vendor["make"]

        if make not in all_vendors:
            # UX improvement: selected filter on top
            if make not in request.args.getlist("vendor"):
                all_vendors.append(make)
                all_vendors = sorted(all_vendors)
            else:
                vendor_filters.append(make)

    query = request.args.get("q", default=None, type=str)

    category_filters = _render_category_filters(request.args.getlist("category"))

    limit = request.args.get("limit", default=20, type=int)
    offset = request.args.get("offset", default=0, type=int)

    releases = (
        ",".join(request.args.getlist("release"))
        if request.args.getlist("release")
        else None
    )
    vendors = (
        request.args.getlist("vendor")
        if request.args.getlist("vendor")
        else None
    )

    models_response = api.certified_models(
        category__in=category,
        major_release__in=releases,
        vendor=vendors,
        query=query,
        offset=offset,
        limit=limit,
    )

    results = models_response["objects"]

    # UX improvement: selected filter on top
    vendor_filters.extend(all_vendors)
    release_filters.extend(all_releases)

    for index, model in enumerate(results):
        # Replace "Ubuntu Core" with "Device"
        if model["category"] == "Ubuntu Core":
            results[index]["category"] = "Device"

    # Pagination
    total_results = models_response["meta"]["total_count"]

    return render_template(
        template_path,
        results=results,
        query=query,
        releases=releases,
        category_filters=category_filters,
        release_filters=release_filters,
        vendor_filters=vendor_filters,
        vendors=vendors,
        total_results=total_results,
        total_pages=math.ceil(total_results / limit),
        offset=offset,
        limit=limit,
    )


# View functions must be unique
# so must create one for each
def certified_desktops():
    view = create_category_views("Desktop", "certified/desktops.html")
    return view


def certified_laptops():
    view = create_category_views("Laptop", "certified/laptops.html")
    return view


def certified_servers():
    view = create_category_views("Server", "certified/servers.html")
    return view


def certified_socs():
    view = create_category_views("Server SoC", "certified/socs.html")
    return view


def certified_why():
    view = create_category_views("Why", "certified/why-certify.html")
    return view


def certified_devices():
    view = create_category_views("Ubuntu Core", "certified/devices.html")
    return view


def certified_vendors(vendor):
    partners_data = partners_api.get_partner_by_name(vendor)
    try:
        vendor_data = partners_data[0]
    except Exception:
        # Most likely all exceptions are related to not having data
        return flask.redirect("/certified?q=" + vendor)

    # Pagination
    limit = request.args.get("limit", default=20, type=int)
    offset = request.args.get("offset", default=0, type=int)

    release_filters = []
    certified_releases = api.certified_releases(limit="0")["objects"]

    for release in certified_releases:
        version = release["release"]
        release_filters.append(version)
    releases = (
        ",".join(request.args.getlist("release"))
        if request.args.getlist("release")
        else None
    )

    category_filters = ["Laptop", "Desktop", "Server", "Device", "SoC"]
    selected_categories = request.args.getlist("category")
    if "SoC" in selected_categories:
        selected_categories.remove("SoC")
        selected_categories.append("Server SoC")

    if "Device" in selected_categories:
        selected_categories.remove("Device")
        selected_categories.append("Ubuntu Core")

    categories = ",".join(selected_categories) if selected_categories else None

    query = request.args.get("q", default=None, type=str)

    if set(request.args) & set(["query"]):
        parameters = request.args.to_dict()
        if "query" in parameters:
            parameters["q"] = parameters["query"]
            del parameters["query"]

        return redirect(f"/certified?{urlencode(parameters)}", 301)

    models = api.certified_models(
        vendor=vendor,
        category__in=categories,
        limit=limit,
        query=query,
        offset=offset,
        major_release__in=releases,
    )

    results = models["objects"]
    for index, model in enumerate(results):
        # Replace "Ubuntu Core" with "Device"
        if model["category"] == "Ubuntu Core":
            results[index]["category"] = "Device"

    total_results = models["meta"]["total_count"]

    return render_template(
        "certified/vendors/vendor.html",
        vendor_data=vendor_data,
        vendor=vendor,
        results=results,
        releases=releases,
        release_filters=release_filters,
        category_filters=category_filters,
        category=",".join(request.args.getlist("category")),
        query=query,
        limit=limit,
        offset=offset,
        total_results=total_results,
        total_pages=math.ceil(total_results / limit),
    )
