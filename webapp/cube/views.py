import os
import flask
import talisker.requests
import talisker.sentry
import json

from urllib.parse import quote_plus
from flask import g
from requests import Session
from webapp.advantage.decorators import cube_decorator
from webapp.advantage.ua_contracts.api import UAContractsUserHasNoAccount
from webapp.cube.api import BadgrAPI, EdxAPI
from webapp.login import user_info

QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"

BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"

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

MODULES_ORDER = [
    "course-v1:CUBE+sysarch+2020",
    "course-v1:CUBE+package+2020",
    "course-v1:CUBE+commands+2020",
    "course-v1:CUBE+devices+2020",
    "course-v1:CUBE+shellscript+2020",
    "course-v1:CUBE+admintasks+2020",
    "course-v1:CUBE+systemd+2020",
    "course-v1:CUBE+networking+2020",
    "course-v1:CUBE+security+2020",
    "course-v1:CUBE+kernel+2020",
    "course-v1:CUBE+storage+2020",
    "course-v1:CUBE+virtualisation+2020",
    "course-v1:CUBE+microk8s+2020",
    "course-v1:CUBE+maas+2020",
    "course-v1:CUBE+juju+2020",
]


@cube_decorator(response="html")
def cube_microcerts():
    """
    View for Microcerts homepage
    """
    sso_user = user_info(flask.session)
    study_labs = "course-v1:CUBE+study_labs+2020"
    account = None

    if sso_user:
        try:
            account = g.api.get_purchase_account()
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = g.api.get_product_listings("canonical-cube")[
        "productListings"
    ]

    assertions = {}
    enrollments = []
    passed_courses = 0
    study_labs_listing = None

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
        product_ids = [
            edx_id["IDs"]
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ]

        try:
            course_id = product_ids[0][0]
        except KeyError:
            # course_id is not found in the API endpoint
            # Skip to next course
            continue

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
            "take_url": (
                edx_url
                + quote_plus(
                    f"/courses/{course_id}/courseware/2020/start/?child=first"
                )
            ),
        }

        # Get UA Contracts content
        if "metadata" in product_list:
            for course_meta in product_list["metadata"]:
                if course_meta["key"] == "topics":
                    course_meta["value"] = json.loads(course_meta["value"])

                course[course_meta["key"]] = course_meta["value"]

            if edx_user:
                # Get Edx content
                attempts = edx_api.get_course_attempts(
                    course["id"], edx_user["username"]
                )["proctored_exam_attempts"]

        if product_list["productID"] == "cube-study-labs":
            study_labs_listing = course
            study_labs_listing["name"] = "Study Labs"
            study_labs_listing["take_url"] = str(
                edx_url + quote_plus(f"/courses/{course_id}/course"),
            )
            study_labs_listing["status"] = str(
                "enrolled" if course_id in enrollments else "not-enrolled",
            )

        # This codition skips study labs
        # Which don't have badgr data
        if "badge-class" in course:
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

            slug = course_id.split("+")[1]
            course["study_lab_url"] = edx_url + quote_plus(
                f"/courses/{study_labs}/courseware/{slug}/"
            )

            courses.append(course)

    return flask.render_template(
        "cube/microcerts.html",
        **{
            "account_id": account["id"] if account else None,
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": study_labs in enrollments,
            "study_labs_listing": study_labs_listing,
        },
    )


@cube_decorator(response="json")
def get_microcerts():
    """
    View for Microcerts homepage

    returns: json
    """
    sso_user = user_info(flask.session)
    study_labs = "course-v1:CUBE+study_labs+2020"
    account = None

    if sso_user:
        try:
            account = g.api.get_purchase_account()
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = g.api.get_product_listings("canonical-cube")[
        "productListings"
    ]

    study_labs_listing = None
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
        product_ids = [
            edx_id["IDs"]
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ]

        try:
            course_id = product_ids[0][0]
        except KeyError:
            # course_id is not found in the API endpoint
            # Skip to next course
            continue

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
            "take_url": (
                edx_url
                + quote_plus(
                    f"/courses/{course_id}/courseware/2020/start/?child=first"
                )
            ),
        }

        # Get UA Contracts content
        if "metadata" in product_list:
            for course_meta in product_list["metadata"]:
                if course_meta["key"] == "topics":
                    course_meta["value"] = json.loads(course_meta["value"])

                course[course_meta["key"]] = course_meta["value"]

            if edx_user:
                # Get Edx content
                attempts = edx_api.get_course_attempts(
                    course["id"], edx_user["username"]
                )["proctored_exam_attempts"]

        if product_list["productID"] == "cube-study-labs":
            study_labs_listing = course
            study_labs_listing["name"] = "Study Labs"
            study_labs_listing["take_url"] = str(
                edx_url + quote_plus(f"/courses/{course_id}/course"),
            )
            study_labs_listing["status"] = str(
                "enrolled" if course_id in enrollments else "not-enrolled",
            )

        # This codition skips study labs
        # Which don't have badgr data
        if "badge-class" in course:
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

            slug = course_id.split("+")[1]
            course["study_lab_url"] = edx_url + quote_plus(
                f"/courses/{study_labs}/courseware/{slug}/"
            )

            courses.append(course)

    return flask.jsonify(
        {
            "account_id": account["id"] if account else None,
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": sorted(
                courses, key=lambda c: MODULES_ORDER.index(c["id"])
            ),
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "study_labs_listing": study_labs_listing,
        }
    )


@cube_decorator(response="json")
def post_microcerts_purchase():
    """
    Purchase preview and complete purchase
    for CUBE microcertifications
    """
    account_id = flask.request.json.get("account_id")
    # Only purchase of one item allowed at a time
    product_listing_id = flask.request.json.get("product_listing_id")
    preview = flask.request.json.get("preview")

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": [
            {"productListingID": product_listing_id, "value": 1}
        ],
    }

    if preview == "true":
        purchase = g.api.preview_purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )
    else:
        purchase = g.api.purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )

    return flask.jsonify(purchase)


def cube_home():
    return flask.render_template("cube/index.html")


@cube_decorator(response="json")
def cube_study_labs_button():
    sso_user = user_info(flask.session)
    study_labs = "course-v1:CUBE+study_labs+2020"
    edx_user = edx_api.get_user(sso_user["email"])
    enrollments = [
        enrollment["course_details"]["course_id"]
        for enrollment in edx_api.get_enrollments(edx_user["username"])
        if enrollment["is_active"]
    ]

    text = "Purchase study labs access"
    redirect_url = "/cube/microcerts"

    if study_labs in enrollments:
        text = "Access study labs"
        prepare_materials_path = quote_plus(f"/courses/{study_labs}/course/")
        redirect_url = (
            f"{edx_api.base_url}/auth/login/tpa-saml/"
            f"?auth_entry=login&idp=ubuntuone&next={prepare_materials_path}"
        )

    return flask.jsonify({"text": text, "redirect_url": redirect_url})
