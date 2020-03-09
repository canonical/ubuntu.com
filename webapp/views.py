# Standard library
import datetime
import json
import math
import os
import re

# Packages
import feedparser
import flask
import talisker.requests
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint
from canonicalwebteam.store_api.stores.snapcraft import SnapcraftStoreApi
from canonicalwebteam.launchpad import Launchpad
from geolite2 import geolite2
from requests.exceptions import HTTPError

# Local
from webapp.login import empty_session, is_authenticated
from webapp.advantage import AdvantageContracts


ip_reader = geolite2.reader()
session = talisker.requests.get_session()
store_api = SnapcraftStoreApi(session=talisker.requests.get_session())


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


def post_build():
    """
    Once they submit the build form on /build,
    kick off the build with Launchpad
    """

    if not is_authenticated(flask.session):
        flask.abort(401)

    launchpad = Launchpad(
        username="image.build",
        token=os.environ["LAUNCHPAD_TOKEN"],
        secret=os.environ["LAUNCHPAD_SECRET"],
        session=session,
    )

    context = {}

    try:
        response = launchpad.build_image(
            board=flask.request.values.get("board"),
            system=flask.request.values.get("system"),
            snaps=flask.request.values.get("snaps", "").split(","),
        )
        context["build_info"] = launchpad.session.get(
            response.headers["Location"]
        ).json()
    except HTTPError as http_error:
        if http_error.response.status_code == 400:
            context["build_error"] = http_error.response.content.decode()
        else:
            raise http_error

    # Submit user to marketo
    opt_in = flask.request.values.get("canonicalUpdatesOptIn")
    if opt_in:
        session.post(
            "https://pages.ubuntu.com/index.php/leadCapture/save",
            data={
                "canonicalUpdatesOptIn": opt_in,
                "formid": "1257",
                "lpId": "2154",
                "subId": "30",
                "munchkinId": "066-EOV-335",
            },
        )

    return flask.render_template("build/index.html", **context)


def search_snaps():
    """
    A JSON endpoint to search the snap store API
    """

    query = flask.request.args.get("q", "")
    arch = flask.request.args.get("arch", "amd64")
    size = flask.request.args.get("size", "100")
    page = flask.request.args.get("page", "1")

    if not query:
        return flask.jsonify({"error": "Query parameter 'q' empty"}), 400

    return flask.jsonify(
        store_api.search(query, size=size, page=page, arch=arch)
    )


def advantage_view():
    accounts = None
    personal_account = None
    enterprise_contracts = []
    entitlements = {}

    if is_authenticated(flask.session):
        advantage = AdvantageContracts(
            session, flask.session["authentication_token"]
        )

        try:
            accounts = advantage.get_accounts()
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

                empty_session(flask.session)

                return flask.render_template("advantage/index.html")

            raise http_error

        for account in accounts:
            account["contracts"] = advantage.get_account_contracts(account)

            for contract in account["contracts"]:
                contract["token"] = advantage.get_contract_token(contract)

                machines = advantage.get_contract_machines(contract).get(
                    "machines"
                )
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

    return flask.render_template(
        "advantage/index.html",
        accounts=accounts,
        enterprise_contracts=enterprise_contracts,
        personal_account=personal_account,
    )


def build_tutorials_index(tutorials_docs):
    def tutorials_index():
        page = flask.request.args.get("page", default=1, type=int)
        topic = flask.request.args.get("topic", default=None, type=str)
        sort = flask.request.args.get("sort", default=None, type=str)
        posts_per_page = 15
        tutorials_docs.parser.parse()
        if not topic:
            metadata = tutorials_docs.parser.metadata
        else:
            metadata = [
                doc
                for doc in tutorials_docs.parser.metadata
                if topic in doc["categories"]
            ]

        if sort == "difficulty-desc":
            metadata = sorted(
                metadata, key=lambda k: k["difficulty"], reverse=True
            )

        if sort == "difficulty-asc" or not sort:
            metadata = sorted(
                metadata, key=lambda k: k["difficulty"], reverse=False
            )

        total_pages = math.ceil(len(metadata) / posts_per_page)

        return flask.render_template(
            "tutorials/index.html",
            navigation=tutorials_docs.parser.navigation,
            forum_url=tutorials_docs.parser.api.base_url,
            metadata=metadata,
            page=page,
            topic=topic,
            sort=sort,
            posts_per_page=posts_per_page,
            total_pages=total_pages,
        )

    return tutorials_index


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
