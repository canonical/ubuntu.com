import os
import flask
import talisker.requests
import yaml

from webapp.cube.api import CubeEdxAPI
from webapp.login import user_info


with open("webapp/cube/mappings/courses.yaml", "r") as stream:
    COURSE_DATA = yaml.load(stream.read(), Loader=yaml.Loader)

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
            course_id = course["id"]
            if course_id not in COURSE_DATA:
                continue

            course_uri = (
                f"https://qa.cube.ubuntu.com/courses/{course_id}/course"
            )

            badge = COURSE_DATA[course_id].get("logo")
            topics = COURSE_DATA[course_id].get("topics")

            modules.append(
                {
                    "number": len(modules) + 1,
                    "badge": badge,
                    "name": course["name"],
                    "topics": topics,
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
            "passed_courses": 2,
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
