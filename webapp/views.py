# Standard library
import json
import os
import re

# Packages
import dateutil.parser
import feedparser
import flask
import pytz
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint
from geolite2 import geolite2
from requests.exceptions import HTTPError
from datetime import datetime


# Local
from webapp import auth
from webapp.api import advantage


ip_reader = geolite2.reader()


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
    enterprise_contracts = {}
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

                        if effective_to < datetime.utcnow().replace(
                            tzinfo=pytz.utc
                        ):
                            contract["contractInfo"]["status"] = "expired"

                    if "renewals" in contract["contractInfo"]:
                        contract["renewal"] = contract["contractInfo"][
                            "renewals"
                        ][0]

                    enterprise_contracts.setdefault(
                        contract["accountInfo"]["name"], []
                    ).append(contract)

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


def post_stripe_method_id():
    if auth.is_authenticated(flask.session):
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


def get_renewal(renewal_id=""):
    if auth.is_authenticated(flask.session):
        if not renewal_id:
            return flask.jsonify({"error": "renewal_id required"}), 400

        return advantage.get_renewal(flask.session, renewal_id)
    else:
        return flask.jsonify({"error": "authentication required"}), 401


def accept_renewal(renewal_id=""):
    if auth.is_authenticated(flask.session):
        if not renewal_id:
            return flask.jsonify({"error": "renewal_id required"}), 400

        return advantage.accept_renewal(flask.session, renewal_id)
    else:
        return flask.jsonify({"error": "authentication required"}), 401


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
