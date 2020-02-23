# Standard library
import json
import os
import re
import datetime
from collections import OrderedDict
from math import ceil

# Packages
import feedparser
import flask
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint
from geolite2 import geolite2
from marshmallow import Schema, fields, EXCLUDE
from marshmallow.exceptions import ValidationError
from mistune import Markdown
from requests.exceptions import HTTPError
from sqlalchemy import asc, desc
from sqlalchemy.orm.exc import NoResultFound

# Local
from webapp import auth
from webapp.api import advantage
from webapp.database import db_session
from webapp.models import CVE, Notice, Reference, Release


ip_reader = geolite2.reader()
markdown_parser = Markdown(
    hard_wrap=True, parse_block_html=True, parse_inline_html=True
)


def download_thank_you(category):
    context = {"http_host": flask.request.host}

    version = flask.request.args.get("version", "")
    architecture = flask.request.args.get("architecture", "")

    # Sanitise for paths
    # (https://bugs.launchpad.net/ubuntu-website-content/+bug/1586361)
    version_pattern = re.compile(r"(\d+(?:\.\d+)+).*")
    architecture = architecture.replace("..", "")
    architecture = architecture.replace("/", "+").replace(" ", "+")

    if architecture and version_pattern.match(version):
        context["start_download"] = version and architecture
        context["version"] = version
        context["architecture"] = architecture

    # Add mirrors
    mirrors_path = os.path.join(os.getcwd(), "etc/ubuntu-mirrors-rss.xml")

    try:
        with open(mirrors_path) as rss:
            mirrors = feedparser.parse(rss.read()).entries
    except IOError:
        mirrors = []

    # Check country code
    country_code = "NO_COUNTRY_CODE"
    ip_location = ip_reader.get(flask.request.remote_addr)
    mirror_list = []

    if ip_location:
        country_code = ip_location["country"]["iso_code"]

        mirror_list = [
            {"link": mirror["link"], "bandwidth": mirror["mirror_bandwidth"]}
            for mirror in mirrors
            if mirror["mirror_countrycode"] == country_code
        ]
    context["mirror_list"] = json.dumps(mirror_list)

    return (
        flask.render_template(
            f"download/{category}/thank-you.html", **context
        ),
        {"Cache-Control": "no-cache"},
    )


def releasenotes_redirect():
    """
    View to redirect to https://wiki.ubuntu.com/ URLs for release notes.

    This used to be done in the Apache frontend, but that is going away
    to be replace by the content-cache.

    Old apache redirects: https://pastebin.canonical.com/p/3TXyyNkWkg/
    """

    ver = flask.request.args.get("ver")

    if ver:
        return flask.redirect(f"https://wiki.ubuntu.com/{ver}/ReleaseNotes")
    else:
        return flask.redirect(f"https://wiki.ubuntu.com/Releases")


def advantage_view():
    accounts = None
    personal_account = None
    enterprise_contracts = []
    entitlements = {}
    openid = flask.session.get("openid")

    if auth.is_authenticated(flask.session):
        try:
            accounts = advantage.get_accounts(flask.session)
        except HTTPError as http_error:
            if http_error.response.status_code == 401:
                # We got an unauthorized request, so we likely
                # need to re-login to refresh the macaroon
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "session_keys": flask.session.keys(),
                        "request_url": http_error.request.url,
                        "request_headers": http_error.request.headers,
                        "response_headers": http_error.response.headers,
                        "response_body": http_error.response.json(),
                        "response_code": http_error.response.json()["code"],
                        "response_message": http_error.response.json()[
                            "message"
                        ],
                    }
                )

                auth.empty_session(flask.session)

                return (
                    flask.render_template("advantage/index.html"),
                    {"Cache-Control": "private"},
                )

            raise http_error

        for account in accounts:
            account["contracts"] = advantage.get_account_contracts(
                account, flask.session
            )

            for contract in account["contracts"]:
                contract["token"] = advantage.get_contract_token(
                    contract, flask.session
                )

                machines = advantage.get_contract_machines(
                    contract, flask.session
                ).get("machines")
                contract["machineCount"] = 0

                if machines:
                    contract["machineCount"] = len(machines)

                if contract["contractInfo"].get("origin", "") == "free":
                    personal_account = account
                    personal_account["free_token"] = contract["token"]
                    for entitlement in contract["contractInfo"][
                        "resourceEntitlements"
                    ]:
                        if entitlement["type"] == "esm-infra":
                            entitlements["esm"] = True
                        elif entitlement["type"] == "livepatch":
                            entitlements["livepatch"] = True
                        elif entitlement["type"] == "fips":
                            entitlements["fips"] = True
                        elif entitlement["type"] == "cc-eal":
                            entitlements["cc-eal"] = True
                    personal_account["entitlements"] = entitlements
                else:
                    entitlements = {}
                    for entitlement in contract["contractInfo"][
                        "resourceEntitlements"
                    ]:
                        contract["supportLevel"] = "-"
                        if entitlement["type"] == "esm-infra":
                            entitlements["esm"] = True
                        elif entitlement["type"] == "livepatch":
                            entitlements["livepatch"] = True
                        elif entitlement["type"] == "fips":
                            entitlements["fips"] = True
                        elif entitlement["type"] == "cc-eal":
                            entitlements["cc-eal"] = True
                        elif entitlement["type"] == "support":
                            contract["supportLevel"] = entitlement[
                                "affordances"
                            ]["supportLevel"]
                    contract["entitlements"] = entitlements
                    contract["contractInfo"][
                        "createdAtFormatted"
                    ] = datetime.datetime.strptime(
                        contract["contractInfo"]["createdAt"],
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime(
                        "%d %B %Y"
                    )
                    contract["contractInfo"][
                        "effectiveFromFormatted"
                    ] = datetime.datetime.strptime(
                        contract["contractInfo"]["effectiveFrom"],
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime(
                        "%d %B %Y"
                    )
                    enterprise_contracts.append(contract)

    return (
        flask.render_template(
            "advantage/index.html",
            openid=openid,
            accounts=accounts,
            enterprise_contracts=enterprise_contracts,
            personal_account=personal_account,
        ),
        {"Cache-Control": "private"},
    )


# Blog
# ===

blog_views = BlogViews(excluded_tags=[3184, 3265, 3408], per_page=11)
blog_blueprint = build_blueprint(blog_views)


def blog_custom_topic(slug):
    page_param = flask.request.args.get("page", default=1, type=int)
    context = blog_views.get_topic(slug, page_param)

    return flask.render_template(f"blog/topics/{slug}.html", **context)


def blog_custom_group(slug):
    page_param = flask.request.args.get("page", default=1, type=int)
    category_param = flask.request.args.get("category", default="", type=str)
    context = blog_views.get_group(slug, page_param, category_param)

    return flask.render_template(f"blog/{slug}.html", **context)


def blog_press_centre():
    page_param = flask.request.args.get("page", default=1, type=int)
    category_param = flask.request.args.get("category", default="", type=str)
    context = blog_views.get_group(
        "canonical-announcements", page_param, category_param
    )

    return flask.render_template("blog/press-centre.html", **context)


# USN
# ===


def notice(notice_id):
    notice = db_session.query(Notice).get(notice_id)

    if not notice:
        flask.abort(404)

    notice_packages = set()
    releases_packages = {}

    for release, packages in notice.packages.items():
        release_name = db_session.query(Release).filter(Release.codename == release).one().version
        releases_packages[release_name] = []
        for name, package in packages.get("sources", {}).items():
            # Build pacakges per release dict
            package["name"] = name
            releases_packages[release_name].append(package)
            # Build full package list
            description = package.get("description")
            package_name = f"{name} - {description}" if description else name
            notice_packages.add(package_name)

    # Guarantee release order
    releases_packages = OrderedDict(sorted(releases_packages.items(), reverse=True))

    notice = {
        "id": notice.id,
        "title": notice.title,
        "published": notice.published,
        "summary": notice.summary,
        "isummary": notice.isummary,
        "details": markdown_parser(notice.details),
        "instructions": markdown_parser(notice.instructions),
        "packages": notice_packages,
        "releases_packages": releases_packages,
        "releases": notice.releases,
        "cves": notice.cves
    }

    return flask.render_template("security/notice.html", notice=notice)


def notices():
    page = flask.request.args.get("page", default=1, type=int)
    details = flask.request.args.get("details", type=str)
    release = flask.request.args.get("release", type=str)
    order_by = flask.request.args.get("order", type=str)

    releases = db_session.query(Release).all()
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
        ),
    )


# USN API
# ===
class NoticeSchema(Schema):
    notice_id = fields.Str(data_key="id", required=True)
    title = fields.Str(required=True)
    summary = fields.Str(required=True)
    isummary = fields.Str()
    description = fields.Str(required=True)
    action = fields.Str()
    releases = fields.Dict(required=True)
    references = fields.List(fields.Str(), data_key="cves")
    timestamp = fields.Float(required=True)


def api_create_notice():
    # Because we get a dict with ID as a key and the payload as a value
    notice_id, payload = flask.request.json.popitem()

    notice = db_session.query(Notice).filter(Notice.id == notice_id).first()
    if notice:
        return (
            flask.jsonify({"message": f"Notice '{notice.id}' already exists"}),
            400,
        )

    notice_schema = NoticeSchema()

    try:
        data = notice_schema.load(payload, unknown=EXCLUDE)
    except ValidationError as error:
        return (
            flask.jsonify(
                {"message": "Invalid payload", "errors": error.messages}
            ),
            400,
        )

    notice = Notice(
        id=data["notice_id"],
        title=data["title"],
        summary=data["summary"],
        details=data["description"],
        packages=data["releases"],
        published=datetime.datetime.fromtimestamp(data["timestamp"]),
    )

    if "action" in data:
        notice.instructions = data["action"]

    if "isummary" in data:
        notice.isummary = data["isummary"]

    # Link releases
    for release_codename in data["releases"].keys():
        try:
            notice.releases.append(
                db_session.query(Release)
                .filter(Release.codename == release_codename)
                .one()
            )
        except NoResultFound:
            return (
                flask.jsonify(
                    {
                        "message": f"No release with codename: {release_codename}."
                    }
                ),
                400,
            )

    # Link CVEs, creating them if they don't exist
    refs = set(data.get("references", []))
    for ref in refs:
        if ref.startswith("CVE-"):
            cve_id = ref[4:]
            cve = db_session.query(CVE).filter(CVE.id == cve_id).first()
            if not cve:
                cve = CVE(id=cve_id)
            notice.cves.append(cve)
        else:
            reference = db_session.query(Reference).filter(Reference.uri == ref).first()
            if not reference:
                reference = Reference(uri=ref)
                notice.references.append(reference)

    db_session.add(notice)
    db_session.commit()

    return flask.jsonify({"message": "Notice created"}), 201
