from datetime import datetime, timedelta
import pytz
import flask
import json

from urllib.parse import quote_plus
from webapp.shop.decorators import shop_decorator, canonical_staff
from webapp.login import user_info


@shop_decorator(area="cube", permission="user_or_guest", response="html")
def cred_home(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    badge_certification,
    **kwargs,
):
    return flask.render_template("credentials/index.html")


@shop_decorator(area="cube", permission="user_or_guest", response="html")
def cred_self_study(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    badge_certification,
    **kwargs,
):
    return flask.render_template("credentials/self-study.html")


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_schedule(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    trueability_api,
    badge_certification,
    **kwargs,
):
    error = None
    now = datetime.utcnow()
    min_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    max_date = (now + timedelta(days=7)).strftime("%Y-%m-%d")

    if flask.request.method == "POST":
        data = flask.request.form
        sso_user = user_info(flask.session)
        timezone = data["timezone"]
        tz_info = pytz.timezone(timezone)
        scheduled_time = f"{data['date']}T{data['time']}"
        starts_at = tz_info.localize(
            datetime.strptime(scheduled_time, "%Y-%m-%dT%H:%M")
        )
        ability_screen_id = 4190
        email = sso_user["email"]
        first_name, last_name = sso_user["fullname"].rsplit(" ", maxsplit=1)
        response = None

        if "uuid" in data:
            response = trueability_api.patch_assessment_reservation(
                starts_at.isoformat(), timezone, data["uuid"]
            )
        else:
            response = trueability_api.post_assessment_reservation(
                ability_screen_id,
                starts_at.isoformat(),
                email,
                first_name,
                last_name,
                timezone,
            )

        if response and "error" in response:
            error = response["message"]
            return flask.render_template(
                "/credentials/schedule.html", error=error
            )
        else:
            uuid = response.get("assessment_reservation", {}).get("uuid", "")
            exam = {
                "name": "Linux Essentials",
                "date": starts_at.strftime("%d %b %Y"),
                "time": starts_at.strftime("%I:%M %p %Z"),
                "uuid": uuid,
            }
            return flask.render_template(
                "/credentials/schedule-confirm.html", exam=exam
            )

    assessment_reservation_uuid = flask.request.args.get("uuid")
    timezone = ""
    date = min_date
    time = "13:00"

    if assessment_reservation_uuid:
        assessment_reservation = trueability_api.get_assessment_reservation(
            assessment_reservation_uuid
        )["assessment_reservation"]
        timezone = assessment_reservation["user"]["time_zone"]
        tz_info = pytz.timezone(timezone)
        starts_at = (
            datetime.fromisoformat(assessment_reservation["starts_at"][:-1])
            .replace(tzinfo=pytz.timezone("UTC"))
            .astimezone(tz_info)
        )
        date = starts_at.strftime("%Y-%m-%d")
        time = starts_at.strftime("%H:%M")

    return flask.render_template(
        "credentials/schedule.html",
        uuid=assessment_reservation_uuid,
        timezone=timezone,
        date=date,
        time=time,
        min_date=min_date,
        max_date=max_date,
        error=error,
    )


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_your_exams(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    trueability_api,
    badge_certification,
    **kwargs,
):
    exams = []
    ability_screen_id = 4190
    response = trueability_api.get_assessment_reservations(ability_screen_id)
    user_email = user_info(flask.session)["email"]
    for r in response["assessment_reservations"]:
        if r["user"]["email"] != user_email:
            continue

        name = r["ability_screen"]["display_name"]
        timezone = r["user"]["time_zone"]
        tz_info = pytz.timezone(timezone)
        starts_at = (
            datetime.strptime(r["starts_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
            .replace(tzinfo=pytz.timezone("UTC"))
            .astimezone(tz_info)
        )
        assessment_id = r.get("assessment") and r["assessment"]["id"]

        actions = []
        utc = pytz.timezone("UTC")
        now = utc.localize(datetime.utcnow())
        end = starts_at + timedelta(hours=6)

        if assessment_id and now > starts_at and now < end:
            actions.extend(
                [
                    {
                        "text": "Take exam",
                        "href": f"/credentials/exam?id={ assessment_id }",
                        "button_class": "p-button--positive",
                    }
                ]
            )

        if r["state"] == "scheduled":
            actions.extend(
                [
                    {
                        "text": "Reschedule",
                        "href": "/credentials/schedule"
                        + f"?uuid={ r['uuid'] }",
                        "button_class": "p-button",
                    },
                    {
                        "text": "Cancel",
                        "href": "/credentials/cancel-exam"
                        + f"?uuid={ r['uuid'] }",
                        "button_class": "p-button--negative",
                    },
                ]
            )
        exams.append(
            {
                "name": name,
                "date": starts_at.strftime("%d %b %Y"),
                "time": starts_at.strftime("%I:%M %p %Z"),
                "timezone": timezone,
                "state": r["state"],
                "uuid": r["uuid"],
                "actions": actions,
            }
        )

    response = flask.make_response(
        flask.render_template(
            "credentials/your-exams.html",
            exams=exams,
        )
    )

    # Do not cache this view
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"

    return response


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_cancel_exam(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    trueability_api,
    badge_certification,
    **kwargs,
):
    uuid = flask.request.args.get("uuid")
    reservation = trueability_api.get_assessment_reservation(uuid)

    if reservation.get("error"):
        return flask.abort(404)

    reservation_email = reservation["assessment_reservation"]["user"]["email"]
    sso_user = user_info(flask.session)["email"]

    if reservation_email != sso_user:
        return flask.abort(403)

    trueability_api.delete_assessment_reservation(uuid)
    return flask.redirect("/credentials/your-exams")


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_assessments(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    trueability_api,
    badge_certification,
    **kwargs,
):
    user_email = user_info(flask.session)["email"]
    ability_screen_id = 4190
    response = trueability_api.get_assessments(ability_screen_id)

    exams = []
    for r in response["assessments"]:
        if r["user"]["email"] != user_email:
            continue

        name = r["ability_screen"]["name"]
        started_at = (
            datetime.strptime(r["started_at"], "%Y-%m-%dT%H:%M:%S%fZ")
            if r["started_at"]
            else None
        )
        timezone = r["user"]["time_zone"]
        exams.append(
            {
                "name": name,
                "date": started_at.strftime("%d %b %Y")
                if started_at
                else "N/A",
                "time": started_at.strftime("%H:%M") if started_at else "N/A",
                "timezone": timezone,
                "state": r["state"],
                "id": r["id"],
                "uuid": r["uuid"],
            }
        )

    return flask.render_template("credentials/assessments.html", exams=exams)


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_exam(
    ua_contracts_api,
    badgr_issuer,
    badgr_api,
    edx_api,
    trueability_api,
    badge_certification,
    **kwargs,
):
    assessment_id = flask.request.args.get("id")
    assessment = trueability_api.get_assessment(assessment_id)

    if assessment.get("error"):
        return flask.abort(404)

    assessment_user = assessment["assessment"]["user"]["email"]
    sso_user = user_info(flask.session)["email"]

    if assessment_user != sso_user:
        return flask.abort(403)

    url = trueability_api.get_assessment_redirect(assessment_id)
    return flask.render_template("credentials/exam.html", url=url)


@shop_decorator(area="cube", permission="user", response="json")
def cube_study_labs_button(edx_api, **kwargs):
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


@shop_decorator(area="cube", permission="user_or_guest", response="html")
def cred_syllabus_data(**kawrgs):
    exam_name = flask.request.args.get("exam")
    syllabus_file = open("webapp/shop/cube/syllabus.json", "r")
    syllabus_data = json.load(syllabus_file)
    return flask.render_template(
        "credentials/syllabus.html",
        syllabus_data=syllabus_data,
        exam_name=exam_name,
    )
