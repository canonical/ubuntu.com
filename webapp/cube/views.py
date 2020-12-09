import os
import flask
import talisker.requests

from webapp.cube.api import CubeEdxAPI
from webapp.login import user_info


# Cube
# ===
cube_api = CubeEdxAPI(
    "https://qa.cube.ubuntu.com",
    os.getenv("CUBE_EDX_CLIENT_ID"),
    os.getenv("CUBE_EDX_CLIENT_SECRET"),
    talisker.requests.get_session(),
)


def cube_microcerts():
    user = user_info(flask.session)

    if user:
        courses = cube_api.get_courses(organization="ubuntu")["results"]

        modules = []
        for course in courses:
            course_uri = (
                f"https://qa.cube.ubuntu.com/courses/{course['id']}/course"
            )
            modules.append(
                {
                    "number": 1,
                    "badge": "Badge",
                    "name": course["name"],
                    "topics": [],
                    "test_url": course_uri,
                    "training_url": course_uri,
                    "status": "Hardcoded",
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