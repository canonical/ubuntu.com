import flask
import json

from urllib.parse import quote_plus
from webapp.advantage.context import get_stripe_publishable_key
from webapp.advantage.decorators import cube_decorator
from webapp.advantage.ua_contracts.api import UAContractsUserHasNoAccount
from webapp.login import user_info


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
def cube_microcerts(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    """
    View for Microcerts homepage
    """

    return flask.render_template(
        "cube/microcerts.html",
    )


@cube_decorator(response="json")
def get_microcerts(badgr_issuer, badge_certified, ua_api, badgr_api, edx_api):
    """
    View for Microcerts homepage

    returns: json
    """
    sso_user = user_info(flask.session)
    study_labs = "course-v1:CUBE+study_labs+2020"
    account = None

    if sso_user:
        try:
            account = ua_api.get_purchase_account("canonical-cube")
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = ua_api.get_product_listings("canonical-cube")[
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
                badgr_issuer, quote_plus(edx_user["email"])
            )["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if badge_certified in assertions:
        assertion = assertions.pop(badge_certified)
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
                course["badge-url"] = assertion["image"]
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

    redirect_url = flask.request.base_url
    if redirect_url.endswith(".json"):
        redirect_url = redirect_url[:-5]

    edx_register_url = f"{edx_url}{redirect_url}"
    if flask.request.args.get("test_backend") == "true":
        edx_register_url = edx_register_url + "?test_backend=true"

    return flask.jsonify(
        {
            "account_id": account["id"] if account else None,
            "stripe_publishable_key": get_stripe_publishable_key(),
            "edx_user": edx_user,
            "edx_register_url": edx_register_url,
            "certified_badge": certified_badge or None,
            "modules": sorted(
                courses, key=lambda c: MODULES_ORDER.index(c["id"])
            ),
            "has_enrollments": len(enrollments) > 0,
            "study_labs_listing": study_labs_listing,
        }
    )


@cube_decorator(response="json")
def post_microcerts_purchase(
    badgr_issuer, badge_certified, ua_api, badgr_api, edx_api
):
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
        purchase = ua_api.preview_purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )
    else:
        purchase = ua_api.purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )

    return flask.jsonify(purchase)


def cube_home():
    return flask.render_template("cube/index.html")
