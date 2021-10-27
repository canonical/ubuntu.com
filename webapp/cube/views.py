import flask
import json

from urllib.parse import quote_plus
from flask import g
from webapp.cube.decorators import cube_decorator
from webapp.advantage.ua_contracts.api import UAContractsUserHasNoAccount
from webapp.login import user_info

STUDY_LAB_ID = "course-v1:CUBE+study_labs+2020"
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
    account = None

    if sso_user:
        try:
            account = g.api.get_purchase_account()
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    edx_user = g.edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = g.api.get_product_listings("canonical-cube")[
        "productListings"
    ]

    assertions = {}
    enrollments = []
    passed_courses = 0
    study_labs_module = None

    if edx_user:
        edx_email = edx_user["email"]
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in g.badgr_api.get_assertions(edx_email)["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in g.edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if g.badgr_api.certified_badge in assertions:
        assertion = assertions.pop(g.badgr_api.certified_badge)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    courses = []
    for product_list in product_listings:
        product_ids = [
            edx_id["IDs"]
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ]

        course_id = product_ids[0][0]
        take_url = g.edx_api.full_url + quote_plus(
            f"/courses/{course_id}/course"
        )

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
            "status": "not-enrolled",
            "take_url": take_url,
        }

        # Study labs are dealt with separately
        if course_id == STUDY_LAB_ID:
            study_labs_module = course
            study_labs_module["name"] = "Study Labs"
            study_labs_module["status"] = str(
                "enrolled" if course_id in enrollments else "not-enrolled",
            )

            continue

        # set study lab url for all modules
        slug = course_id.split("+")[1]
        course["study_lab_url"] = g.edx_api.full_url + quote_plus(
            f"/courses/{STUDY_LAB_ID}/courseware/{slug}/"
        )

        # Get user's module attempts
        attempts = []
        if edx_user:
            # Get Edx content
            attempts = g.edx_api.get_course_attempts(
                course["id"], edx_user["username"]
            )["proctored_exam_attempts"]

        if "metadata" not in product_list:
            continue

        # Get UA Contracts content
        for course_meta in product_list["metadata"]:
            if course_meta["key"] == "topics":
                course_meta["value"] = json.loads(course_meta["value"])

            course[course_meta["key"]] = course_meta["value"]

        if "badge-class" not in course:
            continue

        # This codition skips study labs
        # Which don't have badgr data
        assertion = assertions.get(course["badge-class"])
        course["status"] = "not-enrolled"
        if assertion and not assertion["revoked"]:
            course["badge_url"] = assertion["image"]
            course["status"] = "passed"
            passed_courses += 1
        elif attempts:
            course["status"] = (
                "in-progress" if not attempts[0]["completed_at"] else "failed"
            )
        elif course["id"] in enrollments:
            course["status"] = "enrolled"

        courses.append(course)

    has_study_labs = (
        study_labs_module["status"] == "enrolled"
        if study_labs_module
        else False
    )

    return flask.render_template(
        "cube/microcerts.html",
        **{
            "account_id": account["id"] if account else None,
            "edx_user": edx_user,
            "edx_register_url": f"{g.edx_api.full_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": has_study_labs,
            "study_labs_module": study_labs_module,
        },
    )


@cube_decorator(response="json")
def get_microcerts():
    """
    View for Microcerts table

    returns: json
    """
    email = user_info(flask.session).get("email")
    edx_user = g.edx_api.get_user(email) if email else None
    study_labs = None
    modules = []

    all_product_listings = g.api.get_product_listings("canonical-cube")
    product_listings = all_product_listings.get("productListings")

    assertions = {}
    enrollments = []
    if edx_user:
        edx_email = edx_user["email"]
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in g.badgr_api.get_assertions(edx_email)["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in g.edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    # Build modules
    for product_list in product_listings:
        product_ids = [
            edx_id["IDs"]
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ]

        module_id = product_ids[0][0]
        take_url = g.edx_api.full_url + quote_plus(
            f"/courses/{module_id}/course"
        )

        module = {
            "id": module_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
            "status": "not-enrolled",
            "take_url": take_url,
        }

        # Study labs are dealt with separately
        if module_id == STUDY_LAB_ID:
            study_labs = module
            study_labs["name"] = "Study Labs"
            study_labs["status"] = str(
                "enrolled" if module_id in enrollments else "not-enrolled",
            )

            continue

        # set study lab url for all modules
        slug = module_id.split("+")[1]
        module["study_lab_url"] = g.edx_api.full_url + quote_plus(
            f"/courses/{STUDY_LAB_ID}/courseware/{slug}/"
        )

        # Get user's module attempts
        attempts = []
        if edx_user:
            # Get Edx content
            attempts = g.edx_api.get_course_attempts(
                module_id, edx_user["username"]
            )["proctored_exam_attempts"]

        if "metadata" not in product_list:
            continue

        # Get UA Contracts content
        for metadata in product_list["metadata"]:
            if metadata["key"] == "topics":
                metadata["value"] = json.loads(metadata["value"])

            module[metadata["key"]] = metadata["value"]

        if "badge-class" not in module:
            continue

        assertion = assertions.get(module["badge-class"])
        if assertion and not assertion["revoked"]:
            module["badge_url"] = assertion["image"]
            module["status"] = "passed"
        elif attempts:
            module["status"] = (
                "in-progress" if not attempts[0]["completed_at"] else "failed"
            )
        elif module["id"] in enrollments:
            module["status"] = "enrolled"

        modules.append(module)

    return flask.jsonify(
        {
            "modules": sorted(
                modules, key=lambda mod: MODULES_ORDER.index(mod["id"])
            ),
            "study_labs": study_labs,
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
