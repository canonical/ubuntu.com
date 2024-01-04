import talisker.requests
import talisker.sentry
import requests
import math
import bleach

from flask import (
    request,
    render_template,
    abort,
    current_app,
    redirect,
    jsonify,
    url_for,
)
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
    app.add_url_rule(
        "/certified/filters.json", view_func=get_vendors_releases_filters
    )


def _parse_query_params(all_releases, all_vendors):
    new_query_params = {}
    if request.args.get("q") or request.args.get("q") == "":
        new_query_params["q"] = [request.args.get("q")]

    if request.args.getlist("category"):
        category_params = []
        # These include UX replacements
        # Filters, navigation and pathnames
        for category in [
            "Laptop",
            "Desktop",
            "Server",
            "IoT",
            "SoC",
            "laptops",
            "desktops",
            "servers",
            "iot",
            "socs",
        ]:
            for item in request.args.getlist("category"):
                if request.args["category"] == "Ubuntu Core":
                    item = "IoT"
                if request.args["category"] == "Server SoC":
                    item = "SoC"
                if item == category:
                    new_query_params["category"] = category_params.append(
                        category
                    )
        new_query_params["category"] = category_params

    if request.args.getlist("vendor"):
        vendor_params = []
        for vendor in all_vendors:
            for item in request.args.getlist("vendor"):
                if item == vendor:
                    vendor_params.append(vendor)
        new_query_params["vendor"] = vendor_params

    if request.args.getlist("release"):
        release_params = []
        for release in all_releases:
            for item in request.args.getlist("release"):
                if item == release:
                    release_params.append(release)
        new_query_params["release"] = release_params

    if request.args.get("limit"):
        new_query_params["limit"] = [request.args.get("limit")]

    if request.args.get("offset"):
        new_query_params["offset"] = [request.args.get("offset")]

    if request.args.get("vendors_limit"):
        new_query_params["vendors_limit"] = [request.args.get("vendors_limit")]

    if request.args.get("releases_limit"):
        new_query_params["releases_limit"] = [
            request.args.get("releases_limit")
        ]

    if new_query_params == request.args.to_dict(flat=False):
        # No parsing was done
        return None
    else:
        return new_query_params


def get_vendors_releases_filters():
    categories = request.args.getlist("category")
    selected_vendors = request.args.getlist("vendor")
    selected_releases = request.args.getlist("release")
    releases_limit = request.args.get("releases_limit", default=4, type=int)
    vendors_limit = request.args.get("vendors_limit", default=4, type=int)

    certified_releases = api.certified_releases(limit="0")["objects"]
    certified_makes = api.certified_makes(limit="0")["objects"]

    (
        laptop_releases,
        laptop_vendors,
        desktop_releases,
        desktop_vendors,
        soc_releases,
        soc_vendors,
        iot_releases,
        iot_vendors,
        server_releases,
        server_vendors,
        all_releases,
        all_vendors,
        vendors,
        releases,
    ) = get_filters(request.args)

    new_certified_params = _parse_query_params(vendors, releases)
    if not new_certified_params:
        vendor_filters = []
        release_filters = []

        if len(categories) == 0:
            categories = [
                "smart_core",
                "soc",
                "laptops",
                "desktops",
                "servers",
            ]

        for cat in categories:
            cat = cat.lower()
            # pathname replacements
            if cat == "iot":
                cat = "smart_core"
            elif cat == "ubuntu core":
                cat = "smart_core"
            elif cat == "socs":
                cat = "soc"
            elif cat == "laptop":
                cat = "laptops"
            elif cat == "desktop":
                cat = "desktops"
            elif cat == "server":
                cat = "servers"
            elif cat == "server soc":
                cat = "soc"

            for vendor in certified_makes:
                make = vendor["make"]

                if (
                    int(vendor[cat]) > 0
                    and make not in vendor_filters
                    and make not in selected_vendors
                ):
                    vendor_filters.append(make)

            for release in certified_releases:
                version = release["release"]

                if (
                    int(release[cat]) > 0
                    and version not in release_filters
                    and version != "18.04"
                    and version not in selected_releases
                ):
                    release_filters.append(version)

        # Reorder and put selected filters on top
        vendor_filters.sort()
        selected_vendors.extend(vendor_filters)
        vendor_filters = selected_vendors
        release_filters.sort(reverse=True)
        selected_releases.extend(release_filters)
        release_filters = selected_releases

        total_vendors = len(vendor_filters)
        total_releases = len(release_filters)

        if vendors_limit != -1:
            vendor_filters = vendor_filters[:vendors_limit]

        if releases_limit != -1:
            release_filters = release_filters[:releases_limit]

        filters = {
            "vendor_filters": {"data": vendor_filters, "total": total_vendors},
            "release_filters": {
                "data": release_filters,
                "total": total_releases,
            },
        }

        return jsonify(filters)
    else:
        return redirect(url_for(request.endpoint, **new_certified_params))


def get_filters(request_args=None, json: bool = False):
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
            else:
                if version not in release_filters and version != "18.04":
                    release_filters.append(version)

        if (
            int(release["laptops"]) > 0
            and release["release"] not in laptop_releases
        ):
            laptop_releases.append(release["release"])

        if (
            int(release["desktops"]) > 0
            and release["release"] not in desktop_releases
        ):
            desktop_releases.append(release["release"])

        if (
            int(release["smart_core"]) > 0
            and release["release"] not in iot_releases
        ):
            iot_releases.append(release["release"])

        if int(release["soc"]) > 0 and release["release"] not in soc_releases:
            soc_releases.append(release["release"])

        if (
            int(release["servers"]) > 0
            and release["release"] not in server_releases
        ):
            server_releases.append(release["release"])

    for vendor in certified_makes:
        make = vendor["make"]

        if make not in all_vendors:
            # UX improvement: selected filter on top
            if request_args and make not in request_args.getlist("vendor"):
                all_vendors.append(make)
            else:
                vendor_filters.append(make)

        if int(vendor["laptops"]) > 0:
            laptop_vendors.append(vendor)
            laptop_vendors.sort(key=lambda vendor: vendor["make"])

        if int(vendor["desktops"]) > 0:
            desktop_vendors.append(vendor)
            desktop_vendors.sort(key=lambda vendor: vendor["make"])

        if int(vendor["smart_core"]) > 0:
            iot_vendors.append(vendor)
            iot_vendors.sort(key=lambda vendor: vendor["make"])

        if int(vendor["soc"]) > 0:
            soc_vendors.append(vendor)
            soc_vendors.sort(key=lambda vendor: vendor["make"])

        if int(vendor["servers"]) > 0:
            server_vendors.append(vendor)
            server_vendors.sort(key=lambda vendor: vendor["make"])

    vendor_filters.extend(all_vendors)
    release_filters.extend(all_releases)

    if json:
        filters = {
            "laptop_releases": laptop_releases,
            "laptop_vendors": laptop_vendors,
            "desktop_releases": desktop_releases,
            "desktop_vendors": desktop_vendors,
            "soc_releases": soc_releases,
            "soc_vendors": soc_vendors,
            "iot_releases": iot_releases,
            "iot_vendors": iot_vendors,
            "server_releases": server_releases,
            "server_vendors": server_vendors,
            "all_releases": all_releases,
            "all_vendors": all_vendors,
            "vendor_filters": sorted(vendor_filters),
            "release_filters": sorted(release_filters, reverse=True),
        }
        return jsonify(filters)

    else:
        return (
            laptop_releases,
            laptop_vendors,
            desktop_releases,
            desktop_vendors,
            soc_releases,
            soc_vendors,
            iot_releases,
            iot_vendors,
            server_releases,
            server_vendors,
            all_releases,
            all_vendors,
            vendor_filters,
            release_filters,
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
    (
        laptop_releases,
        laptop_vendors,
        desktop_releases,
        desktop_vendors,
        soc_releases,
        soc_vendors,
        iot_releases,
        iot_vendors,
        server_releases,
        server_vendors,
        all_releases,
        all_vendors,
        vendor_filters,
        release_filters,
    ) = get_filters(request.args)

    # Parse url
    new_certified_params = _parse_query_params(release_filters, vendor_filters)
    if new_certified_params:
        return redirect(url_for(request.endpoint, **new_certified_params))

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

        # Pathname replacements (UX requirement for consistency)
        if request.args["category"] == "Ubuntu Core":
            pathname = "iot"
        elif request.args["category"] == "Server SoC":
            pathname = "socs"
        else:
            pathname = request.args["category"].lower() + "s"

        return redirect(f"/certified/{pathname}?{new_params}")

    selected_categories = request.args.getlist("category")
    if "q" in request.args or len(selected_categories) > 0:
        query = request.args.get("q", default=None, type=str)
        limit = request.args.get("limit", default=20, type=int)
        offset = request.args.get("offset", default=0, type=int)

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
            category=categories,
            releases=releases,
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
    if len(request.args.getlist("category")) > 1:
        url = f"/certified?{request.query_string.decode()}&category={category}"
        clean_url = bleach.clean(url, tags=[], strip=True)
        # UX requirement
        return redirect(clean_url)

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
    limit = request.args.get("limit", default=20, type=int)
    offset = request.args.get("offset", default=0, type=int)

    # Parse url
    new_cert_params = _parse_query_params(release_filters, vendor_filters)
    if new_cert_params:
        return redirect(url_for(request.endpoint, **new_cert_params))

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
        return redirect("/certified?q=" + vendor)

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
