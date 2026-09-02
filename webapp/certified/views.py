import requests
import math
import sentry_sdk

from flask import (
    request,
    render_template,
    abort,
    redirect,
    jsonify,
    url_for,
)
from requests import Session
from webapp.certified.api import CertificationAPI, PartnersAPI
from urllib.parse import urlencode

from webapp.certified.helpers import (
    _get_category_pathname,
    _get_category_url_value,
    _normalize_categories,
    get_download_url,
)

session = Session()
api = CertificationAPI(
    base_url="https://certification.canonical.com/api/v2", session=session
)
partners_api = PartnersAPI(session=session)

AUTOCOMPLETE_MIN_CHARS = 3
AUTOCOMPLETE_MAX_SUGGESTIONS = 5
# Fetched larger than AUTOCOMPLETE_MAX_SUGGESTIONS since multiple
# certificates (different releases) commonly share the same model name
AUTOCOMPLETE_FETCH_LIMIT = 25


def certified_routes(app):
    """
    Load all /certified routes

    The purpose of this function is to liberate
    space on app.py. These endpoints are pretty stable
    and independent, so they don't need to reside on app.py
    """

    app.add_url_rule("/certified", view_func=certified_home)
    app.add_url_rule(
        "/certified/platforms/<platform_id>",
        view_func=certified_platform_details,
    )
    app.add_url_rule(
        "/certified/platforms/<platform_id>/<release>",
        view_func=certified_platform_details_by_release,
    )
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
        "/certified/search",
        view_func=certified_search,
    )
    app.add_url_rule(
        "/certified/why-certify",
        view_func=certified_why,
    )
    app.add_url_rule(
        "/certified/filters.json", view_func=get_vendors_releases_filters
    )
    app.add_url_rule(
        "/certified/autocomplete.json", view_func=certified_autocomplete
    )
    app.add_url_rule(
        "/certified/202309-32027/contact-us", view_func=nxp_contact
    )


def _parse_query_params(all_releases, all_vendors):
    new_query_params = {}
    if request.args.get("q") or request.args.get("q") == "":
        new_query_params["q"] = [request.args.get("q")]

    if request.args.getlist("category"):
        category_params = []
        # Route through the same central alias conversion certified_search()
        # uses, so any recognized legacy/API value redirects to its
        # canonical /certified/search URL value instead of being dropped
        for value in _normalize_categories(request.args.getlist("category")):
            url_value = _get_category_url_value(value)
            if url_value not in category_params:
                category_params.append(url_value)
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


def certified_platform_details(platform_id):
    platform = api.certified_platform_details(platform_id)

    # Get the set of all releases available for this platform
    certificates = platform.get("certificates", {})
    if not isinstance(certificates, dict):
        certificates = {}

    releases = set(
        release
        for _, certificate in certificates.items()
        for release in certificate.get("releases", [])
    )
    return render_template(
        "certified/platforms/platform-details.html",
        category_pathname=_get_category_pathname(platform.get("category", "")),
        category_url=_get_category_url_value(platform.get("category", "")),
        platform=platform,
        releases=releases,
        selected_release=None,
    )


def certified_platform_details_by_release(platform_id, release):
    platform = api.certified_platform_details(platform_id)

    certificates = platform.get("certificates", {})
    if not isinstance(certificates, dict):
        certificates = {}

    # Get the set of all releases available for this platform
    releases = set(
        release
        for _, certificate in certificates.items()
        for release in certificate.get("releases", [])
    )

    # If the release specified in the URL is not available for this
    # platform, render the page for all releases
    if release not in releases:
        return render_template(
            "certified/platforms/platform-details.html",
            category_pathname=_get_category_pathname(
                platform.get("category", "")
            ),
            category_url=_get_category_url_value(platform.get("category", "")),
            platform=platform,
            releases=releases,
            selected_release=None,
        )

    # Filter only certificates for the release specified in the URL
    if certificates:
        platform["certificates"] = {
            canonical_id: certificate
            for canonical_id, certificate in certificates.items()
            if release in certificate.get("releases", [])
        }
    else:
        platform["certificates"] = {}

    return render_template(
        "certified/platforms/platform-details.html",
        category_pathname=_get_category_pathname(platform.get("category", "")),
        category_url=_get_category_url_value(platform.get("category", "")),
        platform=platform,
        releases=releases,
        selected_release=release,
    )


def get_vendors_releases_filters():
    categories = request.args.getlist("category")
    selected_vendors = request.args.getlist("vendor")
    selected_releases = request.args.getlist("release")
    releases_limit = request.args.get("releases_limit", default=4, type=int)
    vendors_limit = request.args.get("vendors_limit", default=4, type=int)

    certified_releases = api.certified_releases(limit="0")["results"]
    certified_makes = api.certified_vendors(limit="0")["results"]

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
    new_certified_params = _parse_query_params(releases, vendors)
    if not new_certified_params:
        filters = build_filter_options(
            certified_makes,
            certified_releases,
            categories,
            selected_vendors,
            selected_releases,
            vendors_limit=vendors_limit,
            releases_limit=releases_limit,
        )

        return jsonify(filters)
    else:
        return redirect(url_for(request.endpoint, **new_certified_params))


def build_filter_options(
    certified_makes,
    certified_releases,
    categories,
    selected_vendors,
    selected_releases,
    vendors_limit=5,
    releases_limit=5,
):
    """Build vendor/release filter options for the given categories.

    Returns the same shape as ``/certified/filters.json`` so the options can be
    rendered server-side or fetched by the client. A limit of ``-1`` returns
    every option.
    """
    # Copy so the caller's request.args lists are not mutated
    selected_vendors = list(selected_vendors)
    selected_releases = list(selected_releases)
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
            if vendor["make"] == "nVidia":
                vendor["make"] = "NVIDIA"
            make = vendor["make"]

            if (
                int(vendor.get(cat, 0) or 0) > 0
                and make not in vendor_filters
                and make not in selected_vendors
            ):
                vendor_filters.append(make)

        for release in certified_releases:
            version = release["release"]

            if (
                int(release.get(cat, 0) or 0) > 0
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

    return {
        "vendor_filters": {"data": vendor_filters, "total": total_vendors},
        "release_filters": {
            "data": release_filters,
            "total": total_releases,
        },
    }


def get_filters(
    request_args=None,
    json: bool = False,
    certified_releases=None,
    certified_makes=None,
):
    if certified_releases is None:
        certified_releases = api.certified_releases(limit="0")["results"]
    if certified_makes is None:
        certified_makes = api.certified_vendors(limit="0")["results"]

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
            sentry_sdk.capture_exception()
            abort(500)

    models_response = api.certified_configurations(
        canonical_id__in=component["machine_canonical_ids"],
        limit=0,
    )

    all_machines = models_response["results"]

    machines_by_id = {}
    for machine in all_machines:
        machines_by_id[machine["canonical_id"]] = machine

    machines = machines_by_id.values()

    return render_template(
        "certified/components/component-details.html",
        component=component,
        machines=sorted(
            machines, key=lambda machine: machine["canonical_id"], reverse=True
        ),
    )


def certified_hardware_details(canonical_id, release):
    models = api.certified_configurations(canonical_id=canonical_id)["results"]

    if not models or len(models) == 0:
        abort(404)

    models = models[0]

    model_releases = api.certified_configuration_details(
        canonical_id=canonical_id, limit="0"
    )["results"]

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

    model_devices = api.certified_configuration_devices(
        canonical_id=canonical_id, limit="0"
    )["results"]

    hardware_details = {}
    for device in model_devices:
        device_info = {
            "name": (
                f"{device['make']} {device['name']}"
                f" {device['subproduct_name'] or ''}"
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
        "certified/hardware-details/hardware-details.html",
        category_pathname=_get_category_pathname(models["category"]),
        category_url=_get_category_url_value(models["category"]),
        canonical_id=canonical_id,
        model_name=models["model"],
        form=models["category"],
        vendor=models["make"],
        major_release=models["major_release"],
        hardware_details=hardware_details,
        release_details=release_details,
    )


def certified_model_details(canonical_id):
    model_releases = api.certified_configuration_details(
        canonical_id=canonical_id
    )["results"]

    if not model_releases:
        abort(404)

    component_summaries = api.component_summaries(canonical_id=canonical_id)[
        "results"
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
            "release_notes_url": model_release.get("release_notes_url"),
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
        category_pathname=_get_category_pathname(model_release["category"]),
        category_url=_get_category_url_value(model_release["category"]),
        form_factor=form_factor,
        vendor=model_release["make"],
        platform_name=model_release["platform_name"],
        platform_id=model_release["platform_id"],
        platform_certified_configuration_count=model_release[
            "platform_certified_configuration_count"
        ],
        major_release=model_release["certified_release"],
        release_details=release_details,
        has_enabled_releases=has_enabled_releases,
        components=component_summaries,
        hardware_website=model_release["hardware_website"],
    )


def certified_home():
    certified_releases = api.certified_releases(limit="0")["results"]
    certified_makes = api.certified_vendors(limit="0")["results"]
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
    ) = get_filters(
        request.args,
        certified_releases=certified_releases,
        certified_makes=certified_makes,
    )

    # Parse url
    new_certified_params = _parse_query_params(release_filters, vendor_filters)
    if new_certified_params:
        return redirect(url_for(request.endpoint, **new_certified_params))

    # Search results now live on their own shareable page, so old links
    # that searched from here (e.g. /certified?q=...&category=...) redirect
    if "q" in request.args or "category" in request.args:
        query_string = request.query_string.decode()
        target = "/certified/search"
        if query_string:
            target += f"?{query_string}"
        return redirect(target)

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


def certified_why():
    return render_template("certified/why-certify.html")


def nxp_contact():
    return render_template("certified/202309-32027/contact-us.html")


def certified_autocomplete():
    """
    Search-box suggestions for /certified/search, scoped to the same
    category/vendor/release filters currently applied on that page.
    """
    query = request.args.get("q", default="", type=str).strip()
    if len(query) < AUTOCOMPLETE_MIN_CHARS:
        return jsonify({"suggestions": []})

    selected_categories = _normalize_categories(
        request.args.getlist("category")
    )
    selected_vendors = request.args.getlist("vendor")
    selected_releases = request.args.getlist("release")

    try:
        response = api.certified_configurations(
            model__icontains=query,
            category__in=(
                ",".join(selected_categories) if selected_categories else None
            ),
            major_release__in=(
                ",".join(selected_releases) if selected_releases else None
            ),
            vendor=selected_vendors or None,
            ordering="model",
            limit=AUTOCOMPLETE_FETCH_LIMIT,
            offset=0,
        )
    except Exception:
        # Suggestions are a non-essential enhancement - never break the
        # search box over a flaky upstream API call
        sentry_sdk.capture_exception()
        return jsonify({"suggestions": []})

    seen = set()
    suggestions = []
    for result in response.get("results", []):
        name = (result.get("model") or "").strip()
        key = name.lower()
        if not name or key in seen:
            continue
        seen.add(key)
        suggestions.append(name)
        if len(suggestions) == AUTOCOMPLETE_MAX_SUGGESTIONS:
            break

    return jsonify({"suggestions": suggestions})


def certified_search():
    """
    Unified /certified/search page.

    Replaces the old separate category pages (desktops/laptops/servers/
    socs/iot), vendor pages, and /certified's implicit search mode with a
    single page driven entirely by query params (category, vendor, release,
    q, offset, limit) so any given combination of filters is one shareable
    URL.
    """
    # Legacy alias, previously only handled on vendor pages. Must run
    # before get_filters()/_parse_query_params() below, otherwise the
    # untranslated "query" param is silently dropped by canonicalization
    if "query" in request.args:
        parameters = request.args.to_dict(flat=False)
        parameters["q"] = parameters.pop("query")
        return redirect(
            f"/certified/search?{urlencode(parameters, doseq=True)}"
        )

    certified_releases = api.certified_releases(limit="0")["results"]
    certified_makes = api.certified_vendors(limit="0")["results"]

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
    ) = get_filters(
        request.args,
        certified_releases=certified_releases,
        certified_makes=certified_makes,
    )

    new_certified_params = _parse_query_params(release_filters, vendor_filters)
    if new_certified_params:
        return redirect(url_for(request.endpoint, **new_certified_params))

    query = request.args.get("q", default=None, type=str)
    limit = request.args.get("limit", default=20, type=int)
    offset = request.args.get("offset", default=0, type=int)

    selected_categories = _normalize_categories(
        request.args.getlist("category")
    )
    selected_vendors = request.args.getlist("vendor")
    selected_releases = request.args.getlist("release")

    # Category pages used to have their own hero banner (image, title,
    # description) - preserve that when exactly one category is picked
    hero_category = (
        selected_categories[0] if len(selected_categories) == 1 else None
    )

    # Single-vendor pages used to have their own hero (logo, description,
    # CTA) - preserve that whenever exactly one vendor is picked
    vendor_data = None
    vendor_name = None
    if len(selected_vendors) == 1:
        vendor_name = selected_vendors[0]
        partners_data = partners_api.get_partner_by_name(vendor_name)
        if partners_data:
            vendor_data = partners_data[0]
        # else: no partner profile for this vendor - just skip the hero,
        # the vendor filter itself still applies to the search below

    categories = ",".join(selected_categories) if selected_categories else None
    releases = ",".join(selected_releases) if selected_releases else None
    vendors = selected_vendors if selected_vendors else None

    models_response = api.certified_configurations(
        category__in=categories,
        major_release__in=releases,
        vendor=vendors,
        query=query,
        offset=offset,
        limit=limit,
    )

    results = models_response["results"]

    for index, model in enumerate(results):
        # Replace "Ubuntu Core" with "Device"
        if model["category"] == "Ubuntu Core":
            results[index]["category"] = "Device"

        # Replace "nVidia" with "NVIDIA"
        if model["make"] == "nVidia":
            model["make"] = "NVIDIA"

    total_results = models_response["count"]

    # Vendor/release checkboxes are server-rendered up front, matching the
    # same {data, total} shape /certified/filters.json returns
    filter_options = build_filter_options(
        certified_makes,
        certified_releases,
        selected_categories,
        selected_vendors,
        selected_releases,
    )

    return render_template(
        "certified/search.html",
        vendor_data=vendor_data,
        vendor=vendor_name,
        hero_category=hero_category,
        results=results,
        query=query,
        category=categories,
        releases=releases,
        vendors=vendors,
        vendor_filters=filter_options["vendor_filters"],
        release_filters=filter_options["release_filters"],
        total_results=total_results,
        # Guard against diving by zero
        total_pages=math.ceil(total_results / limit) if limit else 1,
        offset=offset,
        limit=limit,
    )
