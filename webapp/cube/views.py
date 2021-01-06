import os
import flask
import talisker.requests
import yaml

from pathlib import Path
from requests import Session

from webapp.cube.api import BadgrAPI, CubeEdxAPI
from webapp.login import user_info


COURSE_DATA = yaml.load(
    Path("webapp/cube/mappings/courses.yaml").read_text(), Loader=yaml.Loader
)


BADGR_URL = COURSE_DATA["badgr"]["url"]
BADGR_ISSUER = COURSE_DATA["badgr"]["issuer"]
BADGR_CERTIFIED_BADGE_CLASS = COURSE_DATA["badgr"]["certified_badge"]["class"]


CUBE_URL = COURSE_DATA["cube"]["url"]
CUBE_ORG = COURSE_DATA["cube"]["organization"]


badgr_session = Session()
talisker.requests.configure(badgr_session),
badgr_api = BadgrAPI(
    BADGR_URL,
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
cube_session = Session()
cube_session.proxies.update(proxies)
talisker.requests.configure(cube_session)
cube_api = CubeEdxAPI(
    CUBE_URL,
    os.getenv("CUBE_EDX_CLIENT_ID"),
    os.getenv("CUBE_EDX_CLIENT_SECRET"),
    cube_session,
)


def get_course_badge_url(module, assertion):
    if assertion and not assertion["revoked"]:
        return assertion["image"]
    return module["badge"]["url"]


def get_course_status(module, enrollments, assertion):
    if assertion and not assertion["revoked"]:
        return "passed"
    elif module["id"] in enrollments:
        return "enrolled"
    return "not-enrolled"


def cube_microcerts():
    assertions = {}
    enrollments = []

    user = user_info(flask.session)
    if user:
        email = user["email"]
        edx_user = cube_api.get_user(email)

        if edx_user:
            assertions = {
                assertion["badgeclass"]: assertion
                for assertion in badgr_api.get_assertions(BADGR_ISSUER, email)[
                    "result"
                ]
            }

            enrollments = [
                enrollment["course_id"]
                for enrollment in cube_api.get_enrollments(
                    edx_user["username"]
                )["results"]
                if enrollment["is_active"]
            ]

    courses = COURSE_DATA["courses"].copy()
    for course in courses:
        assertion = assertions.get(course["badge"]["class"])
        course["test_url"] = f"{CUBE_URL}/courses/{course['id']}/course"
        course["training_url"] = f"{CUBE_URL}/courses/{course['id']}/course"
        course["badge"]["url"] = get_course_badge_url(course, assertion)
        course["status"] = get_course_status(course, enrollments, assertion)

    certified_badge = {}
    if BADGR_CERTIFIED_BADGE_CLASS in assertions:
        assertion = assertions.pop(BADGR_CERTIFIED_BADGE_CLASS)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    data = {
        "user": {"name": user["fullname"]} if user else None,
        "modules": courses,
        "passed_courses": len(assertions),
        "has_enrollment": len(enrollments) > 0,
        "certified_badge": certified_badge,
    }

    response = flask.make_response(
        flask.render_template("cube/microcerts.html", **data)
    )
    response.cache_control.private = True

    return response


def cube_home():
    return flask.render_template("cube/index.html")
