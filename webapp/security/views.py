# Standard library
import re
from datetime import datetime
from math import ceil, floor

# Packages
import flask
import dateutil
import talisker.requests
from feedgen.entry import FeedEntry
from feedgen.feed import FeedGenerator
from mistune import Markdown
from sortedcontainers import SortedDict

# Local
from webapp.security.api import SecurityAPI
from webapp.security.helpers import (
    get_summarized_status,
    is_only_upstream,
    get_formatted_releases,
    get_formatted_release_statuses,
    does_not_include_base_url,
    get_friendly_pockets,
    get_processed_details,
    get_attention_banner,
)


markdown_parser = Markdown(
    hard_wrap=True, parse_block_html=True, parse_inline_html=True
)
session = talisker.requests.get_session()

security_api = SecurityAPI(session=session)


def notice(notice_id):
    # Check if notice_id is a valid USN or LSN
    if re.fullmatch(r"(USN|LSN|SSN)-\d{1,5}-\d{1,2}", notice_id):
        notice = security_api.get_notice(notice_id)
    else:
        flask.abort(404)

    if not notice:
        flask.abort(404)

    package_descriptions = {}
    package_versions = {}
    release_packages = SortedDict()

    releases = {
        release["codename"]: release["version"]
        for release in notice["releases"]
    }

    if notice["release_packages"]:
        for codename, pkgs in notice["release_packages"].items():
            release_version = releases[codename]
            release_packages[release_version] = {}
            for package in pkgs:
                if not package.get("is_visible", True):
                    continue

                name = package["name"]
                if not package["is_source"]:
                    release_packages[release_version][name] = package

                    pocket_label = package.get("pocket", None)
                    pocket_info = get_friendly_pockets(pocket_label)
                    release_packages[release_version][name][
                        "pocket_info"
                    ] = pocket_info
                    continue

                if notice["type"] == "LSN":
                    if name not in package_descriptions:
                        package_versions[name] = []

                    package_versions[name].append(package["version"])
                    versions = ", >= ".join(package_versions[name])
                    description = (
                        f"{package['description']} - " f"(>= {versions})"
                    )
                    package_descriptions[name] = description

                    continue

                if name not in package_descriptions:
                    package_descriptions[name] = package["description"]

        package_descriptions = {
            key: package_descriptions[key]
            for key in sorted(package_descriptions.keys())
        }

    if notice["type"] == "LSN":
        template = "security/notices/lsn.html"
    else:
        template = "security/notices/usn.html"

    if notice.get("published"):
        notice["published"] = dateutil.parser.parse(
            notice["published"]
        ).strftime("%-d %B %Y")

    processed_instructions = notice["instructions"]
    (attention_banner, instructions) = get_attention_banner(
        processed_instructions
    )
    if attention_banner:
        processed_instructions = instructions

    cve_query = flask.request.args.get("cve", default=None, type=str)
    cves_and_references = notice["cves"] + notice["references"]
    total_cves = len(cves_and_references)
    if cves_and_references:
        if cve_query:
            cves_and_references = [
                cve
                for cve in cves_and_references
                if cve_query.upper() in cve["id"]
            ]
        cves_and_references = sorted(
            cves_and_references,
            key=lambda x: x["id"] if isinstance(x, dict) and "id" in x else x,
            reverse=True,
        )

    usn_query = flask.request.args.get("usn", default=None, type=str)
    total_notices = 0
    if notice.get("related_notices"):
        total_notices = len(notice["related_notices"])
        if usn_query:
            notice["related_notices"] = [
                usn for usn in notice["related_notices"] if usn_query in usn
            ]
        notice["related_notices"] = sorted(
            notice["related_notices"],
            key=lambda x: int(x.split("-")[1]),
            reverse=True,
        )

    processed_details = get_processed_details(markdown_parser, notice)

    notice = {
        "id": notice["id"],
        "title": notice["title"],
        "published": notice["published"],
        "summary": notice["summary"],
        "details": processed_details,
        "instructions": processed_instructions,
        "attention_banner": attention_banner,
        "package_descriptions": package_descriptions,
        "release_packages": release_packages,
        "releases": notice["releases"],
        "related_notices": notice["related_notices"],
        "cves_and_references": cves_and_references,
        "total_cves": total_cves,
        "total_notices": total_notices,
    }

    return flask.render_template(template, notice=notice)


def notices():
    details = flask.request.args.get("details", type=str)
    releases = flask.request.args.getlist("release", type=str)
    limit = flask.request.args.get("limit", default=10, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)
    order = flask.request.args.get("order", type=str)

    # call endpoint to get all releases and notices
    all_releases = security_api.get_releases()

    formatted_releases = get_formatted_releases(security_api, releases)

    all_releases = formatted_releases["all_releases"]
    lts_releases = formatted_releases["lts_releases"]
    esm_releases = formatted_releases["esm_releases"]
    maintained_releases = formatted_releases["maintained_releases"]
    unmaintained_releases = formatted_releases["unmaintained_releases"]

    notices_response = security_api.get_page_notices(
        limit=limit,
        offset=offset,
        details=details,
        releases=releases,
        order=order,
    )

    # get notices and total results from response object
    notices = notices_response.get("notices")
    total_results = notices_response.get("total_results")

    # filter releases for dropdown
    releases = []
    for single_release in all_releases:
        if single_release["codename"] != "upstream":
            if single_release["version"] is not None:
                releases.append(single_release)

    total_pages = ceil(total_results / limit)
    page_number = floor(offset / limit) + 1

    # format date
    for notice in notices:
        if notice.get("published"):
            notice["published"] = dateutil.parser.parse(
                notice["published"]
            ).strftime("%-d %B %Y")

    return flask.render_template(
        "security/notices/index.html",
        notices=notices,
        releases=releases,
        current_page=page_number,
        limit=limit,
        total_pages=total_pages,
        total_results=total_results,
        page_first_result=offset + 1,
        page_last_result=offset + len(notices),
        offset=offset,
        order=order,
        maintained_releases=maintained_releases,
        lts_releases=lts_releases,
        unmaintained_releases=unmaintained_releases,
        esm_releases=esm_releases,
    )


# USN Feeds
# ===
def notices_feed(feed_type):
    if feed_type != "rss":
        flask.abort(404)

    url_root = flask.request.url_root
    base_url = flask.request.base_url
    description_suffix = query_params = ""

    releases = flask.request.args.getlist("release", type=str)
    if releases:
        # Check if the provided releases exist,
        # and fail if they don't match
        formatted_releases = get_formatted_releases(security_api, releases)

        selected_releases = []
        for release in formatted_releases["selected_releases"]:
            selected_releases.append(release.get("codename"))

        if sorted(releases) != sorted(selected_releases):
            flask.abort(404)

        description_suffix = f" for releases {', '.join(releases)}"
        query_params = f"?release={'&release='.join(releases)}"

    feed = FeedGenerator()
    feed.generator("Feedgen")

    feed.id(url_root)
    feed.copyright(
        f"{datetime.now().year} Canonical Ltd. "
        "Ubuntu and Canonical are registered trademarks of Canonical Ltd."
    )
    feed.title("Ubuntu security notices")
    feed.description(
        f"Recent content on Ubuntu security notices{description_suffix}"
    )
    feed.link(href=base_url + query_params, rel="self")

    def feed_entry(notice, url_root):
        _id = notice["id"]
        notice_title = notice["title"]
        title = f"{_id}: {notice_title}"
        description = notice["description"]
        published = notice["published"]
        notice_path = flask.url_for(".notice", notice_id=notice["id"]).lstrip(
            "/"
        )
        link = f"{url_root}{notice_path}"

        entry = FeedEntry()
        entry.id(link)
        entry.title(title)
        entry.description(description)
        entry.link(href=link)
        entry.published(f"{published} UTC")
        entry.author({"name": "Ubuntu Security Team"})

        return entry

    notices = security_api.get_page_notices(
        limit=10, offset=0, details="", releases=releases, order=""
    ).get("notices")

    for notice in notices:
        feed.add_entry(feed_entry(notice, url_root), order="append")

    payload = feed.rss_str()
    return flask.Response(payload, mimetype="text/xml")


# USN API
# ===
def single_notices_sitemap(offset):
    notices = []
    max_items = 100
    api_limit = 10
    offset = int(offset)  # Convert offset to int

    # max limit is 10, so we need to make multiple requests up to 100
    for batch_offset in range(offset, offset + max_items, api_limit):
        batch_response = security_api.get_page_notices(
            limit=api_limit,
            offset=batch_offset,
            details="",
            releases=[],
            order="",
        )
        batch_notices = batch_response.get("notices", [])

        if not batch_notices:
            break

        notices.extend(batch_notices)

        if len(batch_notices) < api_limit:
            break

    links = []
    for notice in notices:
        notice_id = notice["id"]

        if notice.get("published"):
            notice["published"] = dateutil.parser.parse(
                notice["published"]
            ).strftime("%-d %B %Y")

        links.append(
            {
                "url": f"https://ubuntu.com/security/notices/{notice_id}",
                "last_updated": (
                    notice["published"] if notice["published"] else ""
                ),
            }
        )

    xml_sitemap = flask.render_template("sitemap.xml", links=links)

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


def notices_sitemap():
    notices_response = security_api.get_page_notices(
        limit=0, offset=0, details="", releases=[], order=""
    )
    notices_count = notices_response.get("total_results", 0)
    base_url = "https://ubuntu.com/security/notices"

    if notices_count == 0:
        links = []
    else:
        links = [
            {
                "url": f"{base_url}/sitemap-{link * 100}.xml",
            }
            for link in range(ceil(notices_count / 100))
        ]

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=links,
    )
    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


# CVE views
# ===
def cve_index():
    """
    Display the list of CVEs, with pagination.
    Also accepts the following filtering query parameters:
    - order-by - "descending" (default) or "ascending"
    - query - search query for the description field
    - priority
    - limit - default 20
    - offset - default 0
    """

    query = flask.request.args.get("q", "").strip()
    priority = flask.request.args.getlist("priority")
    package = flask.request.args.get("package", default="", type=str)
    limit = flask.request.args.get("limit", default=10, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)
    component = flask.request.args.get("component")
    versions = flask.request.args.getlist("version")
    statuses = flask.request.args.getlist("status")
    order = flask.request.args.get("order", default="", type=str)
    detailed = flask.request.args.get("detailed", default="", type=str)

    ignored_low_indicators = [
        "end of standard support",
        "superseded",
        "replaced",
    ]
    vulnerable_indicators = ["needed", "pending", "deferred"]

    # Get and define formatted releases
    formatted_releases = get_formatted_releases(security_api, versions)

    all_releases = formatted_releases["all_releases"]
    selected_releases = formatted_releases["selected_releases"]
    lts_releases = formatted_releases["lts_releases"]
    esm_releases = formatted_releases["esm_releases"]
    interim_releases = formatted_releases["interim_releases"]
    maintained_releases = formatted_releases["maintained_releases"]
    unmaintained_releases = formatted_releases["unmaintained_releases"]
    lts_and_esm_releases = formatted_releases["lts_and_esm_releases"]

    # Define friendly names and icons for statuses
    friendly_names = {
        "DNE": {"name": "Not in release", "icon": None},
        "needs-triage": {"name": "Needs evaluation", "icon": "help"},
        "not-affected": {"name": "Not affected", "icon": "success"},
        "needed": {"name": "Vulnerable", "icon": "error"},
        "deferred": {"name": "Vulnerable", "icon": "error"},
        "pending": {"name": "Vulnerable", "icon": "error"},
        "ignored": {"name": "Ignored", "icon": "error-grey"},
        "released": {"name": "Fixed", "icon": "success"},
        "vulnerable": {"name": "Vulnerable", "icon": "error"},
    }

    cves = []
    high_priority_cves = []
    total_results = 0

    # Request all cves if query parameters are present
    if flask.request.args:
        cves_response = security_api.get_cves(
            query=query,
            priority=priority,
            package=package,
            limit=limit,
            offset=offset,
            component=component,
            versions=versions,
            statuses=statuses,
            order=order,
        )

        cves = cves_response.get("cves")
        total_results = cves_response.get("total_results")

        for cve in cves:
            cve["summarized_status"] = get_summarized_status(
                cve,
                ignored_low_indicators,
                vulnerable_indicators,
                friendly_names,
                versions,
            )

            for cve_package in cve["packages"]:
                cve_package["release_statuses"] = (
                    get_formatted_release_statuses(cve_package, friendly_names)
                )

    else:
        # If not, request latest 5 high priority cves

        high_priority_response = security_api.get_cves(
            query=query,
            priority="high",
            package=package,
            limit=5,
            offset=offset,
            component=component,
            versions=versions,
            statuses=statuses,
            order=order,
        )

        high_priority_cves = high_priority_response.get("cves")

        for cve in high_priority_cves:
            cve["summarized_status"] = get_summarized_status(
                cve,
                ignored_low_indicators,
                vulnerable_indicators,
                friendly_names,
                versions,
            )

            for cve_package in cve["packages"]:
                cve_package["release_statuses"] = (
                    get_formatted_release_statuses(cve_package, friendly_names)
                )

    # Check if cve id is valid
    is_cve_id = re.match(r"^CVE-\d{4}-\d{4,7}$", query.upper())

    # Get cve with specific id
    if is_cve_id and cves_response.get(query.upper()):
        return flask.redirect(f"/security/{query.lower()}")

    return flask.render_template(
        "security/cves/index.html",
        all_releases=all_releases,
        cves=cves,
        total_results=total_results,
        total_pages=ceil(total_results / limit),
        offset=offset,
        limit=limit,
        priority=priority,
        query=query,
        package=package,
        component=component,
        versions=versions,
        statuses=statuses,
        selected_releases=selected_releases,
        lts_releases=lts_releases,
        maintained_releases=maintained_releases,
        unmaintained_releases=unmaintained_releases,
        high_priority_cves=high_priority_cves,
        esm_releases=esm_releases,
        interim_releases=interim_releases,
        order=order,
        detailed=detailed,
        lts_and_esm_releases=lts_and_esm_releases,
    )


def cve(cve_id):
    """
    Retrieve and display an individual CVE details page
    """

    cve = security_api.get_cve(cve_id)

    if not cve:
        flask.abort(404, f"Cannot find a CVE with ID '{cve_id}'")

    if cve.get("published"):
        cve["published"] = dateutil.parser.parse(cve["published"]).strftime(
            "%-d %B %Y"
        )

    if cve.get("updated_at"):
        cve["updated_at"] = dateutil.parser.parse(cve["updated_at"]).strftime(
            "%-d %B %Y"
        )

    if cve.get("notices"):
        for notice in cve["notices"]:
            notice["published"] = dateutil.parser.parse(
                notice["published"]
            ).strftime("%-d %B %Y")

    # Extract the priority reason from the notes
    # and set a flag if there is only one note
    # which is the priority reason
    only_priority_note = False
    if cve.get("notes"):
        for note in cve["notes"]:
            if "Priority reason" in note["note"]:
                text = note["note"]
                pattern = r"Priority reason:\n(.*)"
                match = re.search(pattern, text)
                if match:
                    cve["priority_reason"] = match.group(1)
                    if len(cve["notes"]) == 1:
                        only_priority_note = True

    if cve.get("packages"):
        for package in cve["packages"]:
            for status in package["statuses"]:
                if (
                    status["pocket"] == "esm-infra"
                    or status["pocket"] == "esm-infra-legacy"
                    or status["pocket"] == "esm-apps"
                ):
                    cve["expanded_coverage"] = True
                    break

    # Format remaining references
    other_references = []
    if cve.get("references"):
        for reference in cve["references"]:
            if does_not_include_base_url(reference):
                other_references.append(reference)

    # format patches
    formatted_patches = []

    if cve["patches"]:
        for package_name, patches in cve["patches"].items():
            for patch in patches:
                prefix, suffix = patch.split(":", 1)
                suffix = suffix.strip()
                suffix_text = ""

                if prefix == "break-fix" and " " in suffix:
                    introduced, fixed = suffix.split(" ", 1)

                    if introduced == "-":
                        # First commit to Linux git tree
                        introduced = "1da177e4c3f41524e886b7f1b8a0c1fc7321cac2"

                    formatted_patches.append(
                        {
                            "type": "break-fix",
                            "content": {
                                "introduced": introduced,
                                "fixed": fixed,
                            },
                            "name": package_name,
                        }
                    )

                if (
                    "ftp://" in suffix
                    or "http://" in suffix
                    or "https://" in suffix
                ):
                    pattern = r"/commit/(.*)"
                    match = re.search(pattern, suffix)
                    if match:
                        suffix_text = match.group(1)[:7]
                    else:
                        suffix_text = suffix

                    formatted_patches.append(
                        {
                            "type": "link",
                            "content": {
                                "prefix": prefix,
                                "suffix": suffix,
                                "suffix_text": suffix_text,
                            },
                            "name": package_name,
                        }
                    )

                if ":" not in patch:
                    formatted_patches.append(
                        {"type": "text", "content": patch, "name": patch}
                    )

    # format tags
    formatted_tags = []
    if cve["tags"]:
        for package_name, tags in cve["tags"].items():
            for tag in tags:
                formatted_tags.append({"name": package_name, "text": tag})

    # Releases in desc order
    releases_json = security_api.get_releases()

    # Releases without "upstream"
    all_releases = []
    for release in releases_json:
        if release["codename"] != "upstream":
            all_releases.append(release)

    maintained_releases = []
    unmaintained_releases = []

    for release in all_releases:
        # format dates
        support_date = datetime.strptime(
            release["support_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        esm_date = datetime.strptime(
            release["esm_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        release_date = datetime.strptime(
            release["release_date"], "%Y-%m-%dT%H:%M:%S"
        )

        # filter releases
        if support_date < datetime.now():
            if esm_date > datetime.now():
                if release["lts"] and release_date < datetime.now():
                    maintained_releases.append(release)
            else:
                unmaintained_releases.append(release)
        elif release_date < datetime.now():
            maintained_releases.append(release)

    # format releases
    friendly_names = {
        "DNE": {"name": "Not in release", "icon": None},
        "needs-triage": {"name": "Needs evaluation", "icon": "help"},
        "not-affected": {"name": "Not affected", "icon": "success"},
        "needed": {"name": "Vulnerable", "icon": "error"},
        "deferred": {"name": "Vulnerable, fix deferred", "icon": "error"},
        "pending": {"name": "Vulnerable, work in progress", "icon": "error "},
        "ignored": {"name": "Ignored", "icon": None},
        "released": {"name": "Fixed", "icon": "success"},
    }

    maintained_count = 0
    only_upstream = False
    # Account for cves which only include upstream status
    if is_only_upstream(cve):
        only_upstream = True
    else:
        for package in cve["packages"]:
            for status in package["statuses"]:
                # format statuses
                friendly_status = friendly_names[status["status"]]
                status["name"] = friendly_status["name"]
                status["icon"] = friendly_status["icon"]

                for release in all_releases:
                    if status["release_codename"] == release["codename"]:
                        status["version"] = release["version"]
                        status["release_date"] = release["release_date"]

                        if release["lts"]:
                            status["support_tag"] = "LTS"

                if status["release_codename"] in [
                    release["codename"] for release in maintained_releases
                ]:
                    status["maintained"] = True
                    maintained_count += 1
                else:
                    status["maintained"] = False

                # Set pocket descriptions
                pocket_desc = get_friendly_pockets(status["pocket"])
                if pocket_desc:
                    status["pocket_desc"] = pocket_desc

            # Sort package statuses by release version
            package["statuses"] = sorted(
                [
                    d
                    for d in package["statuses"]
                    if d["release_codename"] != "upstream"
                ],
                key=lambda d: d["release_date"],
                reverse=True,
            )

    return flask.render_template(
        "security/cves/cve.html",
        cve=cve,
        patches=formatted_patches,
        tags=formatted_tags,
        maintained_count=maintained_count,
        other_references=other_references,
        only_upstream=only_upstream,
        only_priority_note=only_priority_note,
    )


# CVE API
# ===
def single_cves_sitemap(offset):
    cves = []
    max_items = 100
    api_limit = 10
    offset = int(offset)  # Convert offset to int

    # max limit is 10, so we need to make multiple requests up to 100
    for batch_offset in range(offset, offset + max_items, api_limit):
        batch_response = security_api.get_cves(
            query="",
            priority=[],
            package="",
            limit=api_limit,
            offset=batch_offset,
            component="",
            versions=[],
            statuses=[],
            order="",
        )
        batch_cves = batch_response.get("cves", [])
        if not batch_cves:
            break

        cves.extend(batch_cves)

        if len(batch_cves) < api_limit:
            break

    links = []
    for cve in cves:
        cve_id = cve["id"]

        if cve.get("published"):
            cve["published"] = dateutil.parser.parse(
                cve["published"]
            ).strftime("%-d %B %Y")

        links.append(
            {
                "url": f"https://ubuntu.com/security/{cve_id}",
                "last_updated": (cve["published"] if cve["published"] else ""),
            }
        )

    xml_sitemap = flask.render_template("sitemap.xml", links=links)

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


def cves_sitemap():
    cves_response = security_api.get_cves(
        query="",
        priority=[],
        package="",
        limit=0,
        offset=0,
        component="",
        versions=[],
        statuses=[],
        order="",
    )

    cves_count = cves_response.get("total_results", 0)

    base_url = "https://ubuntu.com/security/cves"

    if cves_count == 0:
        links = []
    else:
        links = [
            {
                "url": f"{base_url}/sitemap-{link * 100}.xml",
            }
            for link in range(ceil(cves_count / 100))
        ]

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=links,
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response
