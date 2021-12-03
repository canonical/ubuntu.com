import flask
import json

from collections import defaultdict
from datetime import datetime
from urllib.parse import parse_qs, quote_plus, urlparse
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

    assertions = {}
    enrollments = []
    passed_courses = 0
    study_labs_listing = None

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
    if badge_certification in assertions:
        assertion = assertions.pop(badge_certification)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    print("!!! product_listings: ", product_listings)

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

    edx_register_url = f"{edx_url}{flask.request.base_url}"
    if flask.request.args.get("test_backend") == "true":
        edx_register_url = edx_register_url + "?test_backend=true"

    print("!!! courses: ", courses)

    return flask.render_template(
        "cube/microcerts.html",
        **{
            "account_id": account["id"] if account else None,
            "edx_user": edx_user,
            "edx_register_url": edx_register_url,
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": sorted(
                courses, key=lambda c: MODULES_ORDER.index(c["id"])
            ),
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": study_labs in enrollments,
            "study_labs_listing": study_labs_listing,
        },
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

    return flask.jsonify(
        {
            "account_id": account["id"] if account else None,
            "stripe_publishable_key": get_stripe_publishable_key(),
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


@cube_decorator(response="json")
def cube_study_labs_button(
    badgr_issuer, badge_certified, ua_api, badgr_api, edx_api
):
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


@cube_decorator(response="html")
def cube_dashboard(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    return flask.render_template("cube/dashboard.html")


@cube_decorator(response="json")
def get_courses(badgr_issuer, badge_certification, ua_api, badgr_api, edx_api):
    product_listings = ua_api.get_product_listings("canonical-cube")[
        "productListings"
    ]

    courses = []
    for product_list in product_listings:
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

        course = {"id": course_id}
        courses.append(course)

    return flask.jsonify(courses)


@cube_decorator(response="json")
def get_daily_enrollments(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    course_ids = flask.request.args.get("course_id", "").split(',')

    daily_enrollments = defaultdict(lambda: defaultdict(int))
    for course_id in course_ids:
        cursor = ""
        has_next = True
        while has_next:
            enrollments = edx_api.get_course_enrollments(course_id, cursor)
            parsed_next = urlparse(enrollments["next"])
            cursor = parse_qs(parsed_next.query).get("cursor", [""])[0]
            has_next = True if cursor else False
            print("!!! enrollments has_next", has_next)

            for enrollment in enrollments["results"]:
                created = datetime.strptime(
                    enrollment["created"], "%Y-%m-%dT%X.%fZ"
                ).strftime("%Y-%m-%d")
                _course_id = enrollment["course_id"]
                daily_enrollments[created][_course_id] += 1

    # Restructure to a list of objects
    dates = sorted(daily_enrollments.keys())
    daily_enrollments = [
        dict(date=date, **daily_enrollments[date]) for date in dates
    ]

    return flask.jsonify(daily_enrollments)


@cube_decorator(response="json")
def get_enrollments(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    course_ids = flask.request.args.get("course_id", "").split(",")

    enrollments = []
    for course_id in course_ids:
        cursor = ""
        has_next = True
        while has_next:
            enrollments_info = edx_api.get_course_enrollments(
                course_id, cursor
            )
            parsed_next = urlparse(enrollments_info["next"])
            cursor = parse_qs(parsed_next.query).get("cursor", [""])[0]
            has_next = True if cursor else False
            print("!!! enrollments has_next", has_next)

            for enrollment in enrollments_info["results"]:
                enrollments.append(
                    {
                        "created": enrollment["created"],
                        "course_id": enrollment["course_id"],
                        "is_active": enrollment["is_active"],
                    }
                )

    return flask.jsonify(enrollments)


@cube_decorator(response="json")
def get_exam_attempts(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    course_ids = flask.request.args.get("course_id", "").split(",")

    exam_attempts = []
    for course_id in course_ids:
        page = 1
        has_next = True
        while has_next:
            attempts_info = edx_api.get_course_exam_attempts(course_id, page)
            has_next = attempts_info["pagination_info"]["has_next"]
            print("!!! attempts has_next", has_next)

            attempts = []
            for attempt_info in attempts_info["proctored_exam_attempts"]:
                for attempt in attempt_info["all_attempts"]:
                    attempts.append(
                        {
                            "id": attempt["id"],
                            "started_at": attempt["started_at"],
                            "completed_at": attempt["completed_at"],
                            "status": attempt["status"],
                            "course_id": attempt["proctored_exam"][
                                "course_id"
                            ],
                            "exam_name": attempt["proctored_exam"][
                                "exam_name"
                            ],
                            "time_limit_mins": attempt["proctored_exam"][
                                "time_limit_mins"
                            ],
                        }
                    )

            print("!!! attempts: ", attempts)

            exam_attempts.extend(attempts)
            page += 1

    return flask.jsonify(exam_attempts)


@cube_decorator(response="json")
def get_course_grades(
    badgr_issuer, badge_certification, ua_api, badgr_api, edx_api
):
    course_ids = flask.request.args.get("course_id", "").split(",")

    grades = []
    for course_id in course_ids:
        cursor = ""
        has_next = True
        while has_next:
            grades_info = edx_api.get_course_grades(
                course_id, cursor
            )
            parsed_next = urlparse(grades_info["next"])
            cursor = parse_qs(parsed_next.query).get("cursor", [""])[0]
            has_next = True if cursor else False
            print("!!! grades has_next", has_next)

            for grade in grades_info["results"]:
                grades.append(
                    {
                        "course_id": grade["course_id"],
                        "passed": grade["passed"],
                        "percent": grade["percent"],
                        "letter_grade": grade["letter_grade"],
                        "username": grade["username"],
                        "email": grade["email"],
                    }
                )

    return flask.jsonify(grades)
