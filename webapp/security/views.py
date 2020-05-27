# Standard library
import re
from collections import defaultdict, OrderedDict
from datetime import datetime
from math import ceil

# Packages
import flask
from feedgen.entry import FeedEntry
from feedgen.feed import FeedGenerator
from marshmallow import EXCLUDE
from marshmallow.exceptions import ValidationError
from mistune import Markdown
from sqlalchemy import asc, desc, or_
from sqlalchemy.exc import IntegrityError, DataError

# Local
from webapp.security.database import db_session
from webapp.security.models import CVE, Notice, Package, Status, Release
from webapp.security.schemas import CVESchema, NoticeSchema
from webapp.security.auth import authorization_required

markdown_parser = Markdown(
    hard_wrap=True, parse_block_html=True, parse_inline_html=True
)


def notice(notice_id):
    notice = db_session.query(Notice).get(notice_id)

    if not notice:
        flask.abort(404)

    packages = set()
    release_packages = {}

    for codename, pkgs in notice.release_packages.items():
        release_version = (
            db_session.query(Release)
            .filter(Release.codename == codename)
            .one()
            .version
        )
        release_packages[release_version] = pkgs
        packages.update([pkg["name"] for pkg in pkgs])

    notice = {
        "id": notice.id,
        "title": notice.title,
        "published": notice.published,
        "summary": notice.summary,
        "details": markdown_parser(notice.details),
        "instructions": markdown_parser(notice.instructions),
        "packages": sorted(list(packages)),
        "release_packages": OrderedDict(
            sorted(release_packages.items(), reverse=True)
        ),
        "releases": notice.releases,
        "cves": notice.cves,
        "references": notice.references,
    }

    return flask.render_template("security/notice.html", notice=notice)


def notices():
    page = flask.request.args.get("page", default=1, type=int)
    details = flask.request.args.get("details", type=str)
    release = flask.request.args.get("release", type=str)
    order_by = flask.request.args.get("order", type=str)

    releases = (
        db_session.query(Release)
        .order_by(desc(Release.release_date))
        .filter(Release.version.isnot(None))
        .all()
    )
    notices_query = db_session.query(Notice)

    if release:
        notices_query = notices_query.join(Release, Notice.releases).filter(
            Release.codename == release
        )

    if details:
        notices_query = notices_query.filter(
            Notice.details.ilike(f"%{details}%")
        )

    # Snapshot total results for search
    page_size = 10
    total_results = notices_query.count()
    total_pages = ceil(total_results / page_size)
    offset = page * page_size - page_size

    if page < 1 or 1 < page > total_pages:
        flask.abort(404)

    sort = asc if order_by == "oldest" else desc
    notices = (
        notices_query.order_by(sort(Notice.published))
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return flask.render_template(
        "security/notices.html",
        notices=notices,
        releases=releases,
        pagination=dict(
            current_page=page,
            total_pages=total_pages,
            total_results=total_results,
            page_first_result=offset + 1,
            page_last_result=offset + len(notices),
        ),
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
        _id = f"USN-{notice.id}"
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
    notice.releases = [
        db_session.query(Release).get(codename)
        for codename in data["release_packages"].keys()
    ]

    notice.cves.clear()
    for cve_id in data["cves"]:
        notice.cves.append(db_session.query(CVE).get(cve_id) or CVE(id=cve_id))

    return notice


@authorization_required
def create_notice():
    """
    POST method to create a new notice
    """

    if not flask.request.json:
        return (flask.jsonify({"message": "No payload received"}), 400)

    notice_schema = NoticeSchema()
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

    try:
        notice_data = NoticeSchema().load(flask.request.json, unknown=EXCLUDE)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    notice = db_session.query(Notice).get(notice_id)

    if not notice:
        return (
            flask.jsonify(
                {"message": f"Notice {notice_data['notice_id']} doesn't exist"}
            ),
            404,
        )

    notice = _update_notice_object(notice, notice_data)

    db_session.add(notice)
    db_session.commit()

    return flask.jsonify({"message": "Notice updated"}), 200


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
    order_by = flask.request.args.get("order-by", default="oldest")
    query = flask.request.args.get("q", "").strip()
    priority = flask.request.args.get("priority")
    package = flask.request.args.get("package")
    limit = flask.request.args.get("limit", default=20, type=int)
    offset = flask.request.args.get("offset", default=0, type=int)

    is_cve_id = re.match(r"^CVE-\d{4}-\d{4,7}$", query.upper())

    if is_cve_id and db_session.query(CVE).get(query.upper()):
        return flask.redirect(f"/security/{query.lower()}")

    cves_query = db_session.query(CVE)

    # Apply search filters
    if package:
        cves_query = cves_query.join(Package, CVE.packages).filter(
            Package.name.ilike(f"%{package}%")
        )

    if priority:
        cves_query = cves_query.filter(CVE.priority == priority)

    if query:
        cves_query = cves_query.filter(CVE.description.ilike(f"%{query}%"))

    sort = asc if order_by == "oldest" else desc

    cves = (
        cves_query.order_by(sort(CVE.published))
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Pagination
    total_results = cves_query.count()
    releases = (
        db_session.query(Release)
        .order_by(desc(Release.release_date))
        .filter(
            or_(
                Release.support_expires > datetime.now(),
                Release.esm_expires > datetime.now(),
            )
        )
        .all()
    )

    return flask.render_template(
        "security/cve/index.html",
        releases=releases,
        cves=cves,
        total_results=total_results,
        total_pages=ceil(total_results / limit),
        offset=offset,
        limit=limit,
        priority=priority,
        query=query,
        package=package,
    )


def cve(cve_id):
    """
    Retrieve and display an individual CVE details page
    """

    cve = db_session.query(CVE).get(cve_id.upper())

    if not cve:
        flask.abort(404)

    releases = (
        db_session.query(Release)
        .order_by(desc(Release.release_date))
        .filter(
            or_(
                Release.codename == "upstream",
                Release.support_expires > datetime.now(),
                Release.esm_expires > datetime.now(),
            )
        )
        .all()
    )

    return flask.render_template(
        "security/cve/cve.html", cve=cve, releases=releases
    )


# CVE API
# ===
def update_statuses(cve, data, packages, releases):
    updated_statuses = []

    for package_data in data.get("packages", []):
        name = package_data["name"]
        package = packages.get(name) or Package(name=name)
        package.source = package_data["source"]
        package.ubuntu = package_data["ubuntu"]
        package.debian = package_data["debian"]
        packages[name] = package

        statuses = defaultdict(dict)

        for status in cve.statuses:
            statuses[status.package_name][status.release_codename] = status

        for status_data in package_data["statuses"]:
            codename = status_data["release_codename"]
            release = releases.get(codename)

            if not release:
                raise Exception(f"No release found with codename '{codename}'")

            status = statuses[name].get(codename) or Status(
                cve=cve, package=package, release=release
            )

            status.status = status_data["status"]
            status.description = status_data["description"]

            statuses[name][codename] = status

            updated_statuses.append(status)

    return updated_statuses


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

    cve_schema = CVESchema(many=True)
    try:
        cves_data = cve_schema.load(flask.request.json)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    if len(cves_data) > 300:
        return (
            flask.jsonify(
                {
                    "message": (
                        "Please only submit up to 300 CVEs at a time. "
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
        cve = db_session.query(CVE).get(data["id"]) or CVE(id=data["id"])

        cve.status = data.get("status")
        cve.published = data.get("published")
        cve.priority = data.get("priority")
        cve.cvss3 = data.get("cvss3")
        cve.description = data.get("description")
        cve.ubuntu_description = data.get("ubuntu_description")
        cve.notes = data.get("notes")
        cve.references = data.get("references")
        cve.bugs = data.get("bugs")

        statuses = update_statuses(
            cve, data, packages, releases=db_session.query(Release)
        )

        db_session.add(cve)
        db_session.add_all(statuses)

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
            {"message": "Successfully finished bulk upserting session"}
        ),
        200,
    )
