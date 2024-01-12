# Standard library
import re
from datetime import datetime
from math import ceil, floor

# Packages
import flask
import dateutil
import talisker.requests
import bs4 as bs
from feedgen.entry import FeedEntry
from feedgen.feed import FeedGenerator
from mistune import Markdown
from sortedcontainers import SortedDict

# Local
from webapp.context import api_session
from webapp.security.api import SecurityAPI
from webapp.security.helpers import get_summarized_status


markdown_parser = Markdown(
    hard_wrap=True, parse_block_html=True, parse_inline_html=True
)
session = talisker.requests.get_session()

security_api = SecurityAPI(
    session=session,
    base_url="https://ubuntu.com/security/",
)


def get_processed_details(notice):
    pattern = re.compile(r"(cve|CVE-)\d{4}-\d{4,7}", re.MULTILINE)

    return re.sub(
        pattern, r'<a href="/security/\g<0>">\g<0></a>', notice["description"]
    )


def notice(notice_id):
    notice = security_api.get_notice(notice_id)

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

    notice = {
        "id": notice["id"],
        "title": notice["title"],
        "published": notice["published"],
        "summary": notice["summary"],
        "details": markdown_parser(get_processed_details(notice)),
        "instructions": markdown_parser(notice["instructions"]),
        "package_descriptions": package_descriptions,
        "release_packages": release_packages,
        "releases": notice["releases"],
        "cves": notice["cves"],
        "references": notice["references"],
        "related_notices": notice["related_notices"],
    }

    return flask.render_template(template, notice=notice)


def notices():
    details = flask.request.args.get("details", type=str)
    release = flask.request.args.get("release", type=str)
    order = flask.request.args.get("order", type=str)
    limit = flask.request.args.get("limit", default=10, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)

    # call endpopint to get all releases and notices
    all_releases = security_api.get_releases()

    notices_response = security_api.get_notices(
        limit=limit,
        offset=offset,
        details=details,
        release=release,
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
        "security/notices.html",
        notices=notices,
        releases=releases,
        current_page=page_number,
        limit=limit,
        total_pages=total_pages,
        total_results=total_results,
        page_first_result=offset + 1,
        page_last_result=offset + len(notices),
        offset=offset,
    )


# USN Feeds
# ===
def notices_feed(feed_type):
    if feed_type != "rss":
        flask.abort(404)

    url_root = flask.request.url_root
    base_url = flask.request.base_url

    feed = FeedGenerator()
    feed.generator("Feedgen")

    feed.id(url_root)
    feed.copyright(
        f"{datetime.now().year} Canonical Ltd. "
        "Ubuntu and Canonical are registered trademarks of Canonical Ltd."
    )
    feed.title("Ubuntu security notices")
    feed.description("Recent content on Ubuntu security notices")
    feed.link(href=base_url, rel="self")

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

    notices = security_api.get_notices(
        limit=10, offset="", details="", release="", order=""
    ).get("notices")

    for notice in notices:
        feed.add_entry(feed_entry(notice, url_root), order="append")

    payload = feed.rss_str()
    return flask.Response(payload, mimetype="text/xml")


# USN API
# ===
def single_notices_sitemap(offset):
    # max limit is 100
    notices = security_api.get_notices(
        limit="100",
        offset=offset,
        details="",
        release="",
        order="",
    ).get("notices")

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
                "last_updated": notice["published"]
                if notice["published"]
                else "",
            }
        )

    xml_sitemap = flask.render_template("sitemap.xml", links=links)

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


def notices_sitemap():
    notices_response = security_api.get_notices(
        limit="", offset="", details="", release="", order=""
    )

    notices_count = notices_response.get("total_results")

    base_url = "https://ubuntu.com/security/notices"

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=[
            {
                "url": f"{base_url}/sitemap-{link * 100}.xml",
            }
            for link in range(ceil(notices_count / 100))
        ],
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
    priority = flask.request.args.get("priority", default="", type=str)
    package = flask.request.args.get("package", default="", type=str)
    limit = flask.request.args.get("limit", default=10, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)
    component = flask.request.args.get("component")
    versions = flask.request.args.getlist("version")
    statuses = flask.request.args.getlist("status")
    order = flask.request.args.get("order", default="", type=str)

    # All CVEs
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

    # Most recent, highest priority CVEs
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

    ignored_low_indicators = [
        "end of standard support",
        "superseded",
        "replaced",
    ]
    vulnerable_indicators = ["needed", "pending", "deferred"]

    for cve in high_priority_cves:
        cve["summarized_status"] = {}
        get_summarized_status(
            cve, ignored_low_indicators, vulnerable_indicators
        )

    # Check if cve id is valid
    is_cve_id = re.match(r"^CVE-\d{4}-\d{4,7}$", query.upper())

    # Get cve with specific id
    if is_cve_id and cves_response.get(query.upper()):
        return flask.redirect(f"/security/{query.lower()}")

    # Releases in desc order
    releases_json = security_api.get_releases()

    # Releases without "upstream"
    all_releases = []
    for release in releases_json:
        if release["codename"] != "upstream":
            all_releases.append(release)

    selected_releases = []
    lts_releases = []
    maintained_releases = []

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
        if versions and versions != [""]:
            for version in versions:
                if version == release["codename"]:
                    selected_releases.append(release)
        elif (
            support_date > datetime.now() or esm_date > datetime.now()
        ) and release_date < datetime.now():
            selected_releases.append(release)
            maintained_releases.append(release)
        elif release["lts"] and release_date < datetime.now():
            lts_releases.append(release)

    selected_releases = sorted(selected_releases, key=lambda d: d["version"])

    """
    TODO: Lines 407-417 and 422-430 are commented out because they will 
    be needed for the detailed view of the cve card
    BUT currently cause errors as that has not been implemented is this branch yet.
    """

    # Format summarized statuses
    # friendly_names = {
    #     "DNE": "Not in release",
    #     "needs-triage": "Needs evaluation",
    #     "not-affected": "Not vulnerable",
    #     "needed": "Vulnerable",
    #     "deferred": "Vulnerable",
    #     "ignored": "Ignored",
    #     "pending": "Vulnerable",
    #     "released": "Fixed",
    # }

    for cve in cves:
        cve["summarized_status"] = {}
        get_summarized_status(
            cve, ignored_low_indicators, vulnerable_indicators
        )
        # for cve_package in cve["packages"]:
        #     cve_package["release_statuses"] = {}
        #     for status in cve_package["statuses"]:
        #         cve_package["release_statuses"][status["release_codename"]] =
        # {
        #             "slug": status["status"],
        #             "name": friendly_names[status["status"]],
        #             "pocket": status["pocket"],
        #         }

    return flask.render_template(
        "security/cve/index.html",
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
        high_priority_cves=high_priority_cves,
        order=order,
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

    # format patches
    formatted_patches = []

    if cve["patches"]:
        for package_name, patches in cve["patches"].items():
            for patch in patches:
                prefix, suffix = patch.split(":", 1)
                suffix = suffix.strip()

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
                    formatted_patches.append(
                        {
                            "type": "link",
                            "content": {"prefix": prefix, "suffix": suffix},
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

    base_lp = "https://git.launchpad.net/ubuntu-cve-tracker/tree"

    kenetic_packages = list_package_names(
        f"{base_lp}/ros-esm-xenial-kinetic-supported.txt"
    )
    melodic_packages = list_package_names(
        f"{base_lp}/ros-esm-bionic-melodic-supported.txt"
    )

    return flask.render_template(
        "security/cve/cve.html",
        cve=cve,
        patches=formatted_patches,
        tags=formatted_tags,
        kenetic_packages=kenetic_packages,
        melodic_packages=melodic_packages,
    )


# This is a temporary fix. To be removed pending redesign
# Parses given URL to create a list of package names
def list_package_names(url):
    source = api_session.get(url).text
    soup = bs.BeautifulSoup(source, "lxml")
    raw_string = soup.code(string=True)[0].split()
    package_list = list(raw_string)

    return package_list


# CVE API
# ===
def single_cves_sitemap(offset):
    cves = security_api.get_cves(
        query="",
        priority="",
        package="",
        limit=100,
        offset=offset,
        component="",
        versions="",
        statuses="",
    ).get("cves")

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
        priority="",
        package="",
        limit="",
        offset="",
        component="",
        versions="",
        statuses="",
    )

    cves_count = cves_response.get("total_results")

    base_url = "https://ubuntu.com/security/cves"

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=[
            {
                "url": f"{base_url}/sitemap-{link * 100}.xml",
            }
            for link in range(ceil(cves_count / 100))
        ],
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response
