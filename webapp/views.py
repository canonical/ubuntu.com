# Standard library
import json
import os
import re

# Packages
import feedparser
import flask
from requests.exceptions import HTTPError
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint

# Local
from webapp import auth
from webapp.api import advantage as advantage_api


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

    mirror_list = [
        {"link": mirror["link"], "bandwidth": mirror["mirror_bandwidth"]}
        for mirror in mirrors
        if mirror["mirror_countrycode"]
        == flask.request.args.get("country", "NO_COUNTRY_CODE")
    ]
    context["mirror_list"] = json.dumps(mirror_list)

    return flask.render_template(
        f"download/{category}/thank-you.html", **context
    )


def advantage():
    accounts = None
    personal_account = None
    enterprise_contracts = []
    entitlements = {}
    openid = flask.session.get("openid")
    headers = {"Cache-Control": "no-cache"}

    if auth.is_authenticated(flask.session):
        try:
            accounts = advantage_api.get_accounts(flask.session)
            for account in accounts:
                account["contracts"] = advantage_api.get_account_contracts(
                    account, flask.session
                )
                for contract in account["contracts"]:
                    contract["token"] = advantage_api.get_contract_token(
                        contract, flask.session
                    )

                    machines = advantage_api.get_contract_machines(
                        contract, flask.session
                    )
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
                        enterprise_contracts.append(contract)
        except HTTPError as http_error:
            # We got an unauthorized request, so we likely
            # need to re-login to refresh the macaroon
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": http_error.request.url,
                    "request_headers": http_error.request.headers,
                    "response_headers": http_error.response.headers,
                    "response_body": http_error.response.json(),
                }
            )

            auth.empty_session(flask.session)
            return flask.render_template("advantage/index.html"), headers

    return (
        flask.render_template(
            "advantage/index.html",
            openid=openid,
            accounts=accounts,
            enterprise_contracts=enterprise_contracts,
            personal_account=personal_account,
        ),
        headers,
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
