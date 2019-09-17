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
    enterprise_contracts = None
    entitlements = {}
    openid = flask.session.get("openid")

    if "openid" in flask.session:
        root = Macaroon.deserialize(flask.session["macaroon_root"])
        discharge = Macaroon.deserialize(flask.session["macaroon_discharge"])
        bound = root.prepare_for_request(discharge)
        token = binary_serialize_macaroons([root, bound]).decode("utf-8")

        accounts = requests.get(
            "https://contracts.canonical.com/v1/accounts",
            headers={"Authorization": f"Macaroon {token}"},
            timeout=10,
        ).json()["accounts"]

        for account in accounts:
            account["contracts"] = requests.get(
                "https://contracts.canonical.com/"
                f"v1/accounts/{account['id']}/contracts",
                headers={"Authorization": f"Macaroon {token}"},
                timeout=10,
            ).json()["contracts"]

            for contract in account["contracts"]:
                contract_id = contract["contractInfo"]["id"]
                contract["token"] = requests.post(
                    "https://contracts.canonical.com/"
                    f"v1/contracts/{contract_id}/token",
                    headers={"Authorization": f"Macaroon {token}"},
                    json={},
                    timeout=10,
                ).json()["contractToken"]

                if contract["contractInfo"]["origin"] == "free":
                    if account["name"] == openid["email"]:
                        personal_account = account
                        personal_account["free_token"] = contract["token"]
                        for entitlement in contract["contractInfo"][
                            "resourceEntitlements"
                        ]:
                            if entitlement["type"] == "esm":
                                entitlements["esm"] = True
                            elif entitlement["type"] == "livepatch":
                                entitlements["livepatch"] = True
                            elif entitlement["type"] == "fips":
                                entitlements["fips"] = True
                            elif entitlement["type"] == "cc-eal":
                                entitlements["cc-eal"] = True
                        personal_account["entitlements"] = entitlements
                else:
                    enterprise_contracts.append(contract)

        # For test purposes only. REMOVE BEFORE MERGING!
        # entitlements = {}
        # enterprise_contracts = [{'accountInfo': {'createdAt': '2019-05-09T08:44:28Z', 'id': 'aAOU-sacxhQlyMy_unw2B-gnxJFuEGowQwnTiLKuksca', 'name': 'test1'}, 'contractInfo': {'createdAt': '2019-05-09T08:44:28.340322Z', 'createdBy': '', 'effectiveFrom': '2019-05-09T08:44:28.340322Z', 'id': 'cAPE_snQFVf6Ozq60Mg1l-xdMKpoaHq1R9hy793S9GZa', 'name': 'test-contract1', 'origin': 'enterprise', 'resourceEntitlements': [{'affordances': {'architectures': None, 'series': ['bionic', 'precise', 'trusty', 'xenial']}, 'directives': {'additionalPackages': None, 'aptKey': '56F7650A24C9E9ECF87C4D8D4067E40313CB4B13', 'aptURL': 'https://esm.ubuntu.com', 'suites': ['precise', 'trusty-security', 'trusty-updates', 'xenial-security', 'xenial-updates', 'bionic-security', 'bionic-updates']}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {'directives': {'aptKey': '2926E7D347A1955504000A983121D2531EF59819', 'suites': ['bionic-security', 'bionic-updates']}}, 'precise': {'directives': {'aptKey': '74AE092F7629ACDF4FB17310B4C2AF7A67C7A026', 'suites': ['precise']}}, 'trusty': {'directives': {'suites': ['trusty-security', 'trusty-updates']}}, 'xenial': {'directives': {'aptKey': '3CB3DF682220A643B43065E9B30EDAA63D8F61D0', 'suites': ['xenial-security', 'xenial-updates']}}}, 'type': 'esm'}, {'affordances': {'architectures': ['x86_64'], 'kernelFlavors': ['generic', 'lowlatency', 'oem'], 'minKernelVersion': '4.4', 'series': ['bionic', 'trusty', 'xenial'], 'tier': 'stable'}, 'directives': {'caCerts': '', 'remoteServer': 'https://livepatch.canonical.com'}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {}, 'trusty': {'obligations': {'enableByDefault': False}}, 'xenial': {}}, 'type': 'livepatch'}, {'affordances': {'supportLevel': 'n/a'}, 'entitled': True, 'obligations': {'enableByDefault': False}, 'type': 'support'}]}},  {'accountInfo': {'createdAt': '2019-06-09T08:44:28Z', 'id': 'aAOU-sacxhQlyMy_unw2B-gnxJFuEGowQwnTiLKukscb', 'name': 'test2'}, 'contractInfo': {'createdAt': '2019-06-09T08:44:28.340322Z', 'createdBy': '', 'effectiveFrom': '2019-05-09T08:44:28.340322Z', 'id': 'cAPE_snQFVf6Ozq60Mg1l-xdMKpoaHq1R9hy793S9GZb', 'name': 'test-contract2', 'origin': 'enterprise', 'resourceEntitlements': [{'affordances': {'architectures': None, 'series': ['bionic', 'precise', 'trusty', 'xenial']}, 'directives': {'additionalPackages': None, 'aptKey': '56F7650A24C9E9ECF87C4D8D4067E40313CB4B13', 'aptURL': 'https://esm.ubuntu.com', 'suites': ['precise', 'trusty-security', 'trusty-updates', 'xenial-security', 'xenial-updates', 'bionic-security', 'bionic-updates']}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {'directives': {'aptKey': '2926E7D347A1955504000A983121D2531EF59819', 'suites': ['bionic-security', 'bionic-updates']}}, 'precise': {'directives': {'aptKey': '74AE092F7629ACDF4FB17310B4C2AF7A67C7A026', 'suites': ['precise']}}, 'trusty': {'directives': {'suites': ['trusty-security', 'trusty-updates']}}, 'xenial': {'directives': {'aptKey': '3CB3DF682220A643B43065E9B30EDAA63D8F61D0', 'suites': ['xenial-security', 'xenial-updates']}}}, 'type': 'esm'}, {'affordances': {'architectures': ['x86_64'], 'kernelFlavors': ['generic', 'lowlatency', 'oem'], 'minKernelVersion': '4.4', 'series': ['bionic', 'trusty', 'xenial'], 'tier': 'stable'}, 'directives': {'caCerts': '', 'remoteServer': 'https://livepatch.canonical.com'}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {}, 'trusty': {'obligations': {'enableByDefault': False}}, 'xenial': {}}, 'type': 'livepatch'}, {'affordances': {'supportLevel': 'n/a'}, 'entitled': True, 'obligations': {'enableByDefault': False}, 'type': 'support'}]}},  {'accountInfo': {'createdAt': '2019-07-09T08:44:28Z', 'id': 'aAOU-sacxhQlyMy_unw2B-gnxJFuEGowQwnTiLKukscc', 'name': 'test3'}, 'contractInfo': {'createdAt': '2019-07-09T08:44:28.340322Z', 'createdBy': '', 'effectiveFrom': '2019-05-09T08:44:28.340322Z', 'id': 'cAPE_snQFVf6Ozq60Mg1l-xdMKpoaHq1R9hy793S9GZc', 'name': 'test-contract3', 'origin': 'enterprise', 'resourceEntitlements': [{'affordances': {'architectures': None, 'series': ['bionic', 'precise', 'trusty', 'xenial']}, 'directives': {'additionalPackages': None, 'aptKey': '56F7650A24C9E9ECF87C4D8D4067E40313CB4B13', 'aptURL': 'https://esm.ubuntu.com', 'suites': ['precise', 'trusty-security', 'trusty-updates', 'xenial-security', 'xenial-updates', 'bionic-security', 'bionic-updates']}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {'directives': {'aptKey': '2926E7D347A1955504000A983121D2531EF59819', 'suites': ['bionic-security', 'bionic-updates']}}, 'precise': {'directives': {'aptKey': '74AE092F7629ACDF4FB17310B4C2AF7A67C7A026', 'suites': ['precise']}}, 'trusty': {'directives': {'suites': ['trusty-security', 'trusty-updates']}}, 'xenial': {'directives': {'aptKey': '3CB3DF682220A643B43065E9B30EDAA63D8F61D0', 'suites': ['xenial-security', 'xenial-updates']}}}, 'type': 'esm'}, {'affordances': {'architectures': ['x86_64'], 'kernelFlavors': ['generic', 'lowlatency', 'oem'], 'minKernelVersion': '4.4', 'series': ['bionic', 'trusty', 'xenial'], 'tier': 'stable'}, 'directives': {'caCerts': '', 'remoteServer': 'https://livepatch.canonical.com'}, 'entitled': True, 'obligations': {'enableByDefault': True}, 'series': {'bionic': {}, 'trusty': {'obligations': {'enableByDefault': False}}, 'xenial': {}}, 'type': 'livepatch'}, {'affordances': {'supportLevel': 'n/a'}, 'entitled': True, 'obligations': {'enableByDefault': False}, 'type': 'support'}]}}]
        for contract in enterprise_contracts:
            for entitlement in contract["contractInfo"][
                "resourceEntitlements"
            ]:
                if entitlement["type"] == "esm":
                    entitlements["esm"] = True
                elif entitlement["type"] == "livepatch":
                    entitlements["livepatch"] = True
                elif entitlement["type"] == "fips":
                    entitlements["fips"] = True
                elif entitlement["type"] == "cc-eal":
                    entitlements["cc-eal"] = True
            contract["entitlements"] = entitlements



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
