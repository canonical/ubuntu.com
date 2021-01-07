import os
import flask
import talisker.requests
import yaml
from requests import Session

from webapp.cube.api import CubeEdxAPI
from webapp.login import user_info


with open("webapp/cube/mappings/courses.yaml", "r") as stream:
    COURSE_DATA = yaml.load(stream.read(), Loader=yaml.Loader)


# This API lives under a sub-domain of ubuntu.com but requests to it
# still need proxying, so we configure the session manually to avoid
# it loading the configurations from environment variables, since those
# deafult to not proxy requests for ubuntu.com sub-domains and that is
# the intended behaviour for most of our apps
proxies = {"http": os.getenv("HTTP_PROXY"), "https": os.getenv("HTTPS_PROXY")}
cube_session = Session()
cube_session.proxies.update(proxies)
talisker.requests.configure(cube_session)

cube_api = CubeEdxAPI(
    "https://qa.cube.ubuntu.com",
    os.getenv("CUBE_EDX_CLIENT_ID"),
    os.getenv("CUBE_EDX_CLIENT_SECRET"),
    cube_session,
)


def cube_microcerts():
    user = user_info(flask.session)

    if user:
        courses = cube_api.get_courses(organization="ubuntu")["results"]
        username = cube_api.get_user(user["email"])[0]["username"]

        modules = []
        for course in courses:
            course_id = course["id"]
            if course_id not in COURSE_DATA:
                continue

            course_uri = (
                f"https://qa.cube.ubuntu.com/courses/{course_id}/course"
            )

            badge = COURSE_DATA[course_id].get("logo")
            topics = COURSE_DATA[course_id].get("topics")

            grade = None
            try:
                grade = cube_api.get_course_grades(course_id, username)[0]
            except KeyError:
                pass

            status = "not-enrolled"
            if grade:
                status = "passed" if grade["passed"] else "enrolled"

            modules.append(
                {
                    "number": len(modules) + 1,
                    "badge": badge,
                    "name": course["name"],
                    "topics": topics,
                    "test_url": course_uri,
                    "training_url": course_uri,
                    "status": status,
                    "action": "Test",
                    "date_attempted": "20-12-07",
                }
            )

        data = {
            "user": {"name": user["fullname"]},
            "modules": modules,
        }

        response = flask.make_response(
            flask.render_template("cube/microcerts.html", **data)
        )
        response.cache_control.private = True

        return response

    return flask.render_template("cube/microcerts.html")


def cube_home():
    data = {}
    return flask.render_template("cube/index.html", **data)
