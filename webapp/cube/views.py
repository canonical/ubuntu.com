import copy
import os
import flask
import talisker.requests
import talisker.sentry
import yaml
import json

from pathlib import Path
from urllib.parse import quote_plus
from flask import current_app
from requests import Session

from webapp.cube.api import BadgrAPI, EdxAPI
from webapp.decorators import login_required
from webapp.login import user_info
from webapp.advantage.ua_contracts.api import UAContractsAPI

CUBE_CONTENT = yaml.load(
    Path("webapp/cube/content/cube.yaml").read_text(), Loader=yaml.Loader
)

QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"
QA_STUDY_LABS = "course-v1:ubuntu+cubereview+coursecommandsdev"

BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"
STUDY_LABS = "course-v1:CUBE+study_labs+2020"

badgr_session = Session()
talisker.requests.configure(badgr_session),
badgr_api = BadgrAPI(
    os.getenv("BADGR_URL"),
    os.getenv("BAGDR_USER"),
    os.getenv("BADGR_PASSWORD"),
    badgr_session,
)

# This API lives under a sub-domain of ubuntu.com but requests to it
# still need proxying, so we configure the session manually to avoid
# it loading the configurations from environment variables, since those
# default to not proxy requests for ubuntu.com sub-domains and that is
# the intended behaviour for most of our apps
proxies = {"http": os.getenv("HTTP_PROXY"), "https": os.getenv("HTTPS_PROXY")}
edx_session = Session()
edx_session.proxies.update(proxies)
talisker.requests.configure(edx_session)

edx_api = EdxAPI(
    os.getenv("CUBE_EDX_URL"),
    os.getenv("CUBE_EDX_CLIENT_ID"),
    os.getenv("CUBE_EDX_CLIENT_SECRET"),
    edx_session,
)

ua_contracts_session = Session()
talisker.requests.configure(ua_contracts_session)


@login_required
def cube_microcerts():
    assertions = {}
    enrollments = []
    passed_courses = 0

    sso_user = user_info(flask.session)

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    if edx_user:
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in badgr_api.get_assertions(
                CUBE_CONTENT["badgr-issuer"], edx_user["email"]
            )["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if CUBE_CONTENT["certified-badge"] in assertions:
        assertion = assertions.pop(CUBE_CONTENT["certified-badge"])
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    study_labs = CUBE_CONTENT["study-labs"]
    courses = copy.deepcopy(CUBE_CONTENT["courses"])
    for course in courses:
        attempts = []

        if edx_user:
            attempts = edx_api.get_course_attempts(
                course["id"], edx_user["username"]
            )["proctored_exam_attempts"]

        assertion = assertions.get(course["badge"]["class"])
        course["status"] = "not-enrolled"
        if assertion and not assertion["revoked"]:
            course["badge"]["url"] = assertion["image"]
            course["status"] = "passed"
            passed_courses += 1
        elif attempts:
            course["status"] = (
                "in-progress" if not attempts[0]["completed_at"] else "failed"
            )
        elif course["id"] in enrollments:
            course["status"] = "enrolled"

        course_id = course["id"]
        courseware_name = course_id.split("+")[1]

        course["take_url"] = edx_url + quote_plus(
            f"/courses/{course_id}/courseware/2020/start/?child=first"
        )

        course["study_lab"] = edx_url + quote_plus(
            f"/courses/{study_labs}/courseware/{courseware_name}/?child=first"
        )

    study_labs_url = edx_url + quote_plus(f"/courses/{study_labs}/course/")

    return flask.render_template(
        "cube/microcerts.html",
        **{
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": study_labs in enrollments,
            "study_labs_url": study_labs_url,
        },
    )


@login_required
def get_microcerts():

    # backend_true requires query string,
    # therefore we need context
    # also this avoids loading contracts api where not required
    is_test_backend = (
        current_app.config["CONTRACTS_TEST_API_URL"]
        if flask.request.args.get("test_backend", "false")
        else current_app.config["CONTRACTS_LIVE_API_URL"]
    )
    sso_user = user_info(flask.session)

    ua_contracts_api = UAContractsAPI(
        session=ua_contracts_session,
        authentication_token=(flask.session.get("authentication_token")),
        api_url=is_test_backend,
    )

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = ua_contracts_api.get_product_listings("canonical-cube")[
        "productListings"
    ]

    assertions = {}
    enrollments = []
    passed_courses = 0
    if edx_user:
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in badgr_api.get_assertions(
                BADGR_ISSUER, edx_user["email"]
            )["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if CERTIFIED_BADGE in assertions:
        assertion = assertions.pop(CERTIFIED_BADGE)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    courses = []
    for product_list in product_listings:
        attempts = []

        course_id = [
            edx_id
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ][0]["IDs"][0]

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
        }

        # Get UA Contracts content
        for course_meta in product_list["metadata"]:
            if course_meta["key"] == "topics":
                course_meta["value"] = json.loads(course_meta["value"])

            course[course_meta["key"]] = course_meta["value"]

        if edx_user:
            # Get Edx content
            attempts = edx_api.get_course_attempts(
                course["id"], edx_user["username"]
            )["proctored_exam_attempts"]

            assertion = assertions.get(course["badge-class"])
            course["status"] = "not-enrolled"
            if assertion and not assertion["revoked"]:
                course["badge_url"] = assertion["image"]
                course["status"] = "passed"
                passed_courses += 1
            elif attempts:
                course["status"] = (
                    "in-progress"
                    if not attempts[0]["completed_at"]
                    else "failed"
                )
            elif course["id"] in enrollments:
                course["status"] = "enrolled"

            course_id = course["id"]
            courseware_name = course_id.split("+")[1]

            course["take_url"] = edx_url + quote_plus(
                f"/courses/{course_id}/courseware/2020/start/?child=first"
            )

            course["study_lab"] = edx_url + quote_plus(
                f"/courses/{STUDY_LABS} \
                /courseware/{courseware_name}/?child=first"
            )

            study_labs_url = edx_url + quote_plus(
                f"/courses/{STUDY_LABS}/course/"
            )

            courses.append(course)

    return flask.jsonify(
        {
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": STUDY_LABS in enrollments,
            "study_labs_url": study_labs_url,
        }
    )


@login_required
def post_microcerts_purchase():
    """
    Purchase preview for CUBE microcertifications
    """
    account_id = flask.request.json["account_id"]

    # Only purchase of one item allowed at a time
    product_listing_id = flask.request.json["product_listing_id"]
    preview = flask.request.json["preview"]
    test_backend = flask.request.args.get("test_backend", "true")
    contracts_api_url = current_app.config["CONTRACTS_LIVE_API_URL"]

    if test_backend:
        contracts_api_url = current_app.config["CONTRACTS_TEST_API_URL"]

    ua_contracts_api = UAContractsAPI(
        session=ua_contracts_session,
        authentication_token=flask.session.get("authentication_token"),
        api_url=contracts_api_url,
    )

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": [
            {
                "productListingID": product_listing_id,
                "value": 1,
            }
        ],
    }

    if preview:
        purchase = ua_contracts_api.preview_purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )
    else:
        purchase = ua_contracts_api.purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )

    return flask.jsonify(purchase)


def cube_home():
    return flask.render_template("cube/index.html")


@login_required
def cube_study_labs_button():
    sso_user = user_info(flask.session)

    edx_user = edx_api.get_user(sso_user["email"])
    enrollments = [
        enrollment["course_details"]["course_id"]
        for enrollment in edx_api.get_enrollments(edx_user["username"])
        if enrollment["is_active"]
    ]

    text = "Purchase study labs access"
    redirect_url = "/cube/microcerts"

    if CUBE_CONTENT["study-labs"] in enrollments:
        text = "Access study labs"
        prepare_materials_path = quote_plus(
            f"/courses/{CUBE_CONTENT['study-labs']}/course/"
        )
        redirect_url = (
            f"{edx_api.base_url}/auth/login/tpa-saml/"
            f"?auth_entry=login&idp=ubuntuone&next={prepare_materials_path}"
        )

    return flask.jsonify({"text": text, "redirect_url": redirect_url})
