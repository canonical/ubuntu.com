# Standard library
import re
from collections import defaultdict
from datetime import datetime
from math import ceil, floor

# Packages
import flask
import dateutil
import talisker.requests
from feedgen.entry import FeedEntry
from feedgen.feed import FeedGenerator
from marshmallow import EXCLUDE
from marshmallow.exceptions import ValidationError
from mistune import Markdown
from sortedcontainers import SortedDict
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError, DataError

# Local
from webapp.security.database import db_session
from webapp.security.models import CVE, Notice, Package, Status, Release
from webapp.security.schemas import CVESchema, NoticeSchema, ReleaseSchema
from webapp.security.auth import authorization_required
from webapp.security.api import SecurityAPI

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
    order_by = flask.request.args.get("order", type=str)
    limit = flask.request.args.get("limit", default=10, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)

    # call endpopint to get all releases and notices
    all_releases = security_api.get_releases()

    notices_response = security_api.get_notices(
        limit=limit, offset=offset, details=details, release=release
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

    # order notice query by publish date
    if order_by == "oldest":
        notices = sorted(notices, key=lambda d: d["published"])
    else:
        notices = sorted(notices, key=lambda d: d["published"], reverse=True)

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
    if feed_type not in ["atom", "rss"]:
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
        _id = notice.id
        title = f"{_id}: {notice.title}"
        description = notice.details
        published = notice.published
        notice_path = flask.url_for(".notice", notice_id=notice.id).lstrip("/")
        link = f"{url_root}{notice_path}"

        entry = FeedEntry()
        entry.id(link)
        entry.title(title)
        entry.description(description)
        entry.link(href=link)
        entry.published(f"{published} UTC")
        entry.author({"name": "Ubuntu Security Team"})

        return entry

    notices = (
        db_session.query(Notice)
        .order_by(desc(Notice.published))
        .limit(10)
        .all()
    )

    for notice in notices:
        feed.add_entry(feed_entry(notice, url_root), order="append")

    payload = feed.atom_str() if feed_type == "atom" else feed.rss_str()
    return flask.Response(payload, mimetype="text/xml")


# USN API
# ===
def _update_notice_object(notice, data):
    """
    Set fields on a Notice model object
    """

    notice.title = data["title"]
    notice.summary = data["summary"]
    notice.details = data["description"]
    notice.release_packages = data["release_packages"]
    notice.published = data["published"]
    notice.references = data["references"]
    notice.instructions = data["instructions"]
    notice.is_hidden = data.get("is_hidden", False)

    notice.releases = [
        db_session.query(Release).get(codename)
        for codename in data["release_packages"].keys()
    ]

    notice.cves.clear()
    for cve_id in set(data["cves"]):
        notice.cves.append(db_session.query(CVE).get(cve_id) or CVE(id=cve_id))

    return notice


def single_notices_sitemap(offset):
    notices = (
        db_session.query(Notice)
        .order_by(Notice.published)
        .offset(offset)
        .limit(10000)
        .all()
    )

    xml_sitemap = flask.render_template(
        "sitemap.xml",
        links=[
            {
                "url": f"https://ubuntu.com/security/notices/{notice.id}",
                "last_updated": notice.published.strftime("%Y-%m-%d"),
            }
            for notice in notices
        ],
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


def notices_sitemap():
    notices_count = db_session.query(Notice).order_by(Notice.published).count()

    base_url = "https://ubuntu.com/security/notices"

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=[
            {
                "url": f"{base_url}/sitemap-{link * 10000}.xml",
            }
            for link in range(ceil(notices_count / 10000))
        ],
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


@authorization_required
def create_notice():
    """
    POST method to create a new notice
    """

    notice_schema = NoticeSchema()
    notice_schema.context["release_codenames"] = [
        rel.codename for rel in db_session.query(Release).all()
    ]

    try:
        notice_data = notice_schema.load(flask.request.json)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    db_session.add(
        _update_notice_object(Notice(id=notice_data["id"]), notice_data)
    )

    try:
        db_session.commit()
    except IntegrityError:
        return (
            flask.jsonify(
                {"message": f"Notice {notice_data['id']} already exists"}
            ),
            400,
        )

    return flask.jsonify({"message": "Notice created"}), 201


@authorization_required
def update_notice(notice_id):
    """
    PUT method to update a single notice
    """
    notice = db_session.query(Notice).without_default_filters().get(notice_id)

    if not notice:
        return (
            flask.jsonify({"message": f"Notice {notice_id} doesn't exist"}),
            404,
        )

    notice_schema = NoticeSchema()
    notice_schema.context["release_codenames"] = [
        rel.codename for rel in db_session.query(Release).all()
    ]

    try:
        notice_data = notice_schema.load(flask.request.json, unknown=EXCLUDE)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    notice = _update_notice_object(notice, notice_data)

    db_session.add(notice)
    db_session.commit()

    return flask.jsonify({"message": "Notice updated"}), 200


@authorization_required
def delete_notice(notice_id):
    """
    DELETE method to delete a single notice
    """
    notice = db_session.query(Notice).without_default_filters().get(notice_id)

    if not notice:
        return (
            flask.jsonify({"message": f"Notice {notice_id} doesn't exist"}),
            404,
        )

    db_session.delete(notice)
    db_session.commit()

    return flask.jsonify({"message": f"Notice {notice_id} deleted"}), 200


@authorization_required
def create_release():
    """
    POST method to create a new release
    """

    release_schema = ReleaseSchema()

    try:
        release_data = release_schema.load(flask.request.json)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    release = Release(
        codename=release_data["codename"],
        version=release_data["version"],
        name=release_data["name"],
        development=release_data["development"],
        lts=release_data["lts"],
        release_date=release_data["release_date"],
        esm_expires=release_data["esm_expires"],
        support_expires=release_data["support_expires"],
    )

    db_session.add(release)

    try:
        db_session.commit()
    except IntegrityError:
        return (
            flask.jsonify(
                {
                    "message": (
                        f"Release with [codename:'{release_data['codename']}']"
                        f" or [version:'{release_data['version']}'] or "
                        f"[name:'{release_data['name']}'] already exists"
                    )
                }
            ),
            400,
        )

    return flask.jsonify({"message": "Release created"}), 200


@authorization_required
def delete_release(codename):
    """
    DELETE method to delete a single release
    """
    release = db_session.query(Release).get(codename)

    if not release:
        return (
            flask.jsonify({"message": f"Release {codename} doesn't exist"}),
            404,
        )

    if len(release.statuses) > 0:
        return (
            flask.jsonify(
                {
                    "message": (
                        f"Cannot delete '{codename}' release. "
                        f"Release already in use"
                    )
                }
            ),
            400,
        )

    db_session.delete(release)
    db_session.commit()

    return flask.jsonify({"message": f"Release {codename} deleted"}), 200


# CVE views
# ===
def cve_index():
    """
    Display the list of CVEs, with pagination.
    Also accepts the following filtering query parameters:
    - order-by - "oldest" or "newest"
    - query - search query for the description field
    - priority
    - limit - default 20
    - offset - default 0
    """
    # Query parameters
    query = flask.request.args.get("q", "").strip()
    priority = flask.request.args.get("priority", default="", type=str)
    package = flask.request.args.get("package", default="", type=str)
    limit = flask.request.args.get("limit", default=20, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)
    component = flask.request.args.get("component")
    version = flask.request.args.get("version", default="", type=str)
    status = flask.request.args.get("status", default="", type=str)
    versions = flask.request.args.getlist("version")
    statuses = flask.request.args.getlist("status")

    # get cves and total results
    cves_response = security_api.get_cves(
        query=query,
        priority=priority,
        package=package,
        limit=limit,
        offset=offset,
        component=component,
        version=version,
        status=status,
    )

    cves = cves_response.get("cves")
    # Pagination
    total_results = cves_response.get("total_results")

    # check if cve id is valid
    is_cve_id = re.match(r"^CVE-\d{4}-\d{4,7}$", query.upper())

    # get cve with specific id
    if is_cve_id and cves.get(query.upper()):
        return flask.redirect(f"/security/{query.lower()}")

    # releases in desc order
    releases_json = security_api.get_releases()

    # releases without "upstream"
    all_releases = []
    for release in releases_json:
        if release["codename"] != "upstream":
            all_releases.append(release)

    releases = []

    for release in all_releases:
        # format dates
        support_date = datetime.strptime(
            release["support_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        esm_date = datetime.strptime(
            release["esm_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        # filter releases
        if support_date > datetime.now() or esm_date > datetime.now():
            releases.append(release)

    releases = sorted(releases, key=lambda d: d["version"])

    friendly_names = {
        "DNE": "Does not exist",
        "needs-triage": "Needs triage",
        "not-affected": "Not vulnerable",
        "needed": "Needed",
        "deferred": "Deferred",
        "ignored": "Ignored",
        "pending": "Pending",
        "released": "Released",
    }

    for cve in cves:
        for cve_package in cve["packages"]:
            cve_package["release_statuses"] = {}
            for status in cve_package["statuses"]:
                cve_package["release_statuses"][status["release_codename"]] = {
                    "slug": status["status"],
                    "name": friendly_names[status["status"]],
                    "pocket": status["pocket"],
                }

    return flask.render_template(
        "security/cve/index.html",
        releases=releases,
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
                        "content": {"introduced": introduced, "fixed": fixed},
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

    for package_name, tags in cve["tags"].items():
        for tag in tags:
            formatted_tags.append({"name": package_name, "text": tag})

    return flask.render_template(
        "security/cve/cve.html",
        cve=cve,
        patches=formatted_patches,
        tags=formatted_tags,
    )


# CVE API
# ===
def update_statuses(cve, data, packages):
    statuses = cve.packages

    statuses_query = db_session.query(Status).filter(Status.cve_id == cve.id)
    statuses_to_delete = {
        f"{v.package_name}||{v.release_codename}": v
        for v in statuses_query.all()
    }

    for package_data in data.get("packages", []):
        name = package_data["name"]

        if packages.get(name) is None:
            package = Package(name=name)
            package.source = package_data["source"]
            package.ubuntu = package_data["ubuntu"]
            package.debian = package_data["debian"]
            packages[name] = package

            db_session.add(package)

        for status_data in package_data["statuses"]:
            update_status = False
            codename = status_data["release_codename"]

            status = statuses[name].get(codename)
            if status is None:
                update_status = True
                status = Status(
                    cve_id=cve.id, package_name=name, release_codename=codename
                )
            elif f"{name}||{codename}" in statuses_to_delete:
                del statuses_to_delete[f"{name}||{codename}"]

            if status.status != status_data["status"]:
                update_status = True
                status.status = status_data["status"]

            if status.description != status_data["description"]:
                update_status = True
                status.description = status_data["description"]

            if status.component != status_data.get("component"):
                update_status = True
                status.component = status_data.get("component")

            if status.pocket != status_data.get("pocket"):
                update_status = True
                status.pocket = status_data.get("pocket")

            if update_status:
                statuses[name][codename] = status
                db_session.add(status)

    for key in statuses_to_delete:
        db_session.delete(statuses_to_delete[key])


@authorization_required
def delete_cve(cve_id):
    """
    Delete a CVE from db
    @params string: query string with the CVE id
    """
    cve_query = db_session.query(CVE)
    cve = cve_query.filter(CVE.id == cve_id).first()

    try:
        db_session.delete(cve)
        db_session.commit()

    except IntegrityError as error:
        return flask.jsonify({"message": error.orig.args[0]}), 400

    return flask.jsonify({"message": "CVE deleted successfully"}), 200


@authorization_required
def bulk_upsert_cve():
    """
    Receives a PUT request from load_cve.py
    Parses the object and bulk inserts or updates
    @returns 3 lists of CVEs, created CVEs, updated CVEs and failed CVEs
    """

    cves_schema = CVESchema(many=True)
    cves_schema.context["release_codenames"] = [
        rel.codename for rel in db_session.query(Release).all()
    ]

    try:
        cves_data = cves_schema.load(flask.request.json)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    if len(cves_data) > 50:
        return (
            flask.jsonify(
                {
                    "message": (
                        "Please only submit up to 50 CVEs at a time. "
                        f"({len(cves_data)} submitted)"
                    )
                }
            ),
            413,
        )

    packages = {}
    for package in db_session.query(Package).all():
        packages[package.name] = package

    for data in cves_data:
        update_cve = False
        cve = db_session.query(CVE).get(data["id"])

        if cve is None:
            update_cve = True
            cve = CVE(id=data["id"])

        if cve.status != data.get("status"):
            update_cve = True
            cve.status = data.get("status")

        published_date = (
            cve.published.strftime("%Y-%B-%d") if cve.published else None
        )
        data_published_date = (
            data.get("published").strftime("%Y-%B-%d")
            if data.get("published")
            else None
        )
        if published_date != data_published_date:
            update_cve = True
            cve.published = data.get("published")

        if cve.priority != data.get("priority"):
            update_cve = True
            cve.priority = data.get("priority")

        if cve.cvss3 != data.get("cvss3"):
            update_cve = True
            cve.cvss3 = data.get("cvss3")

        if cve.description != data.get("description"):
            update_cve = True
            cve.description = data.get("description")

        if cve.ubuntu_description != data.get("ubuntu_description"):
            update_cve = True
            cve.ubuntu_description = data.get("ubuntu_description")

        if cve.notes != data.get("notes"):
            update_cve = True
            cve.notes = data.get("notes")

        if cve.references != data.get("references"):
            update_cve = True
            cve.references = data.get("references")

        if cve.bugs != data.get("bugs"):
            update_cve = True
            cve.bugs = data.get("bugs")

        if cve.patches != data.get("patches"):
            update_cve = True
            cve.patches = data.get("patches")

        if cve.tags != data.get("tags"):
            update_cve = True
            cve.tags = data.get("tags")

        if cve.mitigation != data.get("mitigation"):
            update_cve = True
            cve.mitigation = data.get("mitigation")

        if update_cve:
            db_session.add(cve)

        update_statuses(cve, data, packages)

    created = defaultdict(lambda: 0)
    updated = defaultdict(lambda: 0)
    deleted = defaultdict(lambda: 0)

    for item in db_session.new:
        created[type(item).__name__] += 1

    for item in db_session.dirty:
        updated[type(item).__name__] += 1

    for item in db_session.deleted:
        deleted[type(item).__name__] += 1

    try:
        db_session.commit()
    except DataError as error:
        return (
            flask.jsonify(
                {
                    "message": "Failed bulk upserting session",
                    "error": error.orig.args[0],
                }
            ),
            400,
        )

    return (
        flask.jsonify(
            {"created": created, "updated": updated, "deleted": deleted}
        ),
        200,
    )


def single_cves_sitemap(offset):
    cves = (
        db_session.query(CVE)
        .order_by(CVE.published)
        .offset(offset)
        .limit(10000)
        .all()
    )

    xml_sitemap = flask.render_template(
        "sitemap.xml",
        links=[
            {
                "url": f"https://ubuntu.com/security/{cve.id}",
                "last_updated": (
                    cve.published.strftime("%Y-%m-%d") if cve.published else ""
                ),
            }
            for cve in cves
        ],
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response


def cves_sitemap():
    cves_count = db_session.query(CVE).order_by(CVE.published).count()

    base_url = "https://ubuntu.com/security/cve"

    xml_sitemap = flask.render_template(
        "sitemap_index_template.xml",
        base_url=base_url,
        links=[
            {
                "url": f"{base_url}/sitemap-{link * 10000}.xml",
            }
            for link in range(ceil(cves_count / 10000))
        ],
    )

    response = flask.make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"
    response.headers["Cache-Control"] = "public, max-age=43200"

    return response
