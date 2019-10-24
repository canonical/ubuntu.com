# Standard library
import json
import os
import re

# Packages
import feedparser
import flask
import requests
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint
from pymacaroons import Macaroon

# Local
from webapp.macaroons import binary_serialize_macaroons


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
    api_url = flask.current_app.config["ADVANTAGE_API"]

    if "openid" in flask.session:
        root = Macaroon.deserialize(flask.session["macaroon_root"])
        discharge = Macaroon.deserialize(flask.session["macaroon_discharge"])
        bound = root.prepare_for_request(discharge)
        token = binary_serialize_macaroons([root, bound]).decode("utf-8")
        accounts = requests.get(
            os.path.join(api_url, "v1/accounts"),
            headers={"Authorization": f"Macaroon {token}"},
            timeout=3,
        ).json()["accounts"]

        for account in accounts:
            account["contracts"] = requests.get(
                os.path.join(
                    api_url, f"v1/accounts/{account['id']}/contracts"
                ),
                headers={"Authorization": f"Macaroon {token}"},
                timeout=3,
            ).json()["contracts"]

            for contract in account["contracts"]:
                contract_id = contract["contractInfo"]["id"]
                contract["token"] = requests.post(
                    os.path.join(api_url, f"v1/contracts/{contract_id}/token"),
                    headers={"Authorization": f"Macaroon {token}"},
                    json={},
                    timeout=3,
                ).json()["contractToken"]
                machines = requests.get(
                    os.path.join(
                        api_url, f"v1/contracts/{contract_id}/context/machines"
                    ),
                    headers={"Authorization": f"Macaroon {token}"},
                    json={},
                    timeout=3,
                ).json()
                contract["machineCount"] = len(machines)
                if contract["contractInfo"].get("origin", "") == "free":
                    # Ant, is there any reason why we do this check?
                    # if account["name"] == openid["email"]:
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

    return flask.render_template(
        "advantage/index.html",
        openid=openid,
        accounts=accounts,
        enterprise_contracts=enterprise_contracts,
        personal_account=personal_account,
    )


# Blog
# ===

blog_views = BlogViews(excluded_tags=[3184, 3265, 3408])
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
