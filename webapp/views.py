# Standard library
import json
import math
import os
import re
from datetime import datetime

# Packages
import dateutil.parser
import feedparser
import flask
import pytz
import talisker.requests
from ubuntu_release_info.data import Data
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
            and mirror["link"].startswith("https")
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

    version = flask.request.args.get("ver", "")[:5]

    for codename, release in Data().releases.items():
        short_version = ".".join(release.version.split(".")[:2])
        if version == short_version:
            release_slug = release.full_codename.replace(" ", "")

            return flask.redirect(
                f"https://wiki.ubuntu.com/{release_slug}/ReleaseNotes"
            )

    return flask.redirect(f"https://wiki.ubuntu.com/Releases")


def post_build():
    """
    Once they submit the build form on /core/build,
    kick off the build with launchpad
    """

    if not is_authenticated(flask.session):
        flask.abort(401)

    launchpad = Launchpad(
        username="image.build",
        token=os.environ["LAUNCHPAD_TOKEN"],
        secret=os.environ["LAUNCHPAD_SECRET"],
        session=session,
    )

    response = launchpad.build_image(
        board=flask.request.values.get("board"),
        system=flask.request.values.get("system"),
        snaps=flask.request.values.get("snaps", "").split(","),
    )

    build_response = launchpad.session.get(response.headers["Location"])

    return flask.render_template(
        "core/build.html", build_info=build_response.json()
    )


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
    enterprise_contracts = {}
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
                            entitlements["esm-infra"] = True
                        elif entitlement["type"] == "esm-apps":
                            entitlements["esm-apps"] = True
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
                            entitlements["esm-infra"] = True
                        elif entitlement["type"] == "esm-apps":
                            entitlements["esm-apps"] = True
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
                    created_at = dateutil.parser.parse(
                        contract["contractInfo"]["createdAt"]
                    )
                    contract["contractInfo"][
                        "createdAtFormatted"
                    ] = created_at.strftime("%d %B %Y")
                    contract["contractInfo"]["status"] = "active"

                    if "effectiveTo" in contract["contractInfo"]:
                        effective_to = dateutil.parser.parse(
                            contract["contractInfo"]["effectiveTo"]
                        )
                        contract["contractInfo"][
                            "effectiveToFormatted"
                        ] = effective_to.strftime("%d %B %Y")

                        time_now = datetime.utcnow().replace(tzinfo=pytz.utc)

                        if effective_to < time_now:
                            contract["contractInfo"]["status"] = "expired"
                        else:
                            date_difference = effective_to - time_now
                            contract["expiring"] = date_difference.days <= 30
                            contract["contractInfo"][
                                "daysTillExpiry"
                            ] = date_difference.days

                    if "renewals" in contract["contractInfo"]:
                        contract["renewal"] = contract["contractInfo"][
                            "renewals"
                        ][0]

                    enterprise_contracts.setdefault(
                        contract["accountInfo"]["name"], []
                    ).append(contract)

    return flask.render_template(
        "advantage/index.html",
        accounts=accounts,
        enterprise_contracts=enterprise_contracts,
        personal_account=personal_account,
    )


def post_stripe_method_id():
    if is_authenticated(flask.session):
        advantage = AdvantageContracts(flask.session["authentication_token"])

        if not flask.request.is_json:
            return flask.jsonify({"error": "JSON required"}), 400

        payment_method_id = flask.request.json.get("payment_method_id")
        if not payment_method_id:
            return flask.jsonify({"error": "payment_method_id required"}), 400

        account_id = flask.request.json.get("account_id")
        if not account_id:
            return flask.jsonify({"error": "account_id required"}), 400

        return advantage.put_method_id(
            flask.session, account_id, payment_method_id
        )
    else:
        return flask.jsonify({"error": "authentication required"}), 401


def post_stripe_invoice_id(renewal_id, invoice_id):
    if is_authenticated(flask.session):
        advantage = AdvantageContracts(flask.session["authentication_token"])

        return advantage.post_stripe_invoice_id(
            flask.session, invoice_id, renewal_id
        )
    else:
        return flask.jsonify({"error": "authentication required"}), 401


def get_renewal(renewal_id):
    if is_authenticated(flask.session):
        advantage = AdvantageContracts(flask.session["authentication_token"])

        return advantage.get_renewal(flask.session, renewal_id)
    else:
        return flask.jsonify({"error": "authentication required"}), 401


def accept_renewal(renewal_id):
    if is_authenticated(flask.session):
        advantage = AdvantageContracts(flask.session["authentication_token"])

        return advantage.accept_renewal(flask.session, renewal_id)
    else:
        return flask.jsonify({"error": "authentication required"}), 401


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
