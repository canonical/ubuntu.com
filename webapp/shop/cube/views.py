from datetime import datetime, timedelta
import pytz
import flask
import json
import os
import html

from urllib.parse import quote_plus
from webapp.shop.decorators import shop_decorator, canonical_staff
from webapp.login import user_info

from google.oauth2 import service_account
from googleapiclient.discovery import build
from werkzeug.exceptions import BadRequest


TIMEZONE_COUNTRIES = {
    timezone: country
    for country, timezones in pytz.country_timezones.items()
    for timezone in timezones
}


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


@shop_decorator(area="cube", permission="user_or_guest", response="html")
def cred_sign_up(**_):
    sign_up_open = False
    return flask.render_template(
        "credentials/sign-up.html", sign_up_open=sign_up_open
    )


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
        country_code = TIMEZONE_COUNTRIES[timezone]
        response = None

        if "uuid" in data:
            response = trueability_api.patch_assessment_reservation(
                starts_at.isoformat(), timezone, country_code, data["uuid"]
            )
        else:
            response = trueability_api.post_assessment_reservation(
                ability_screen_id,
                starts_at.isoformat(),
                email,
                first_name,
                last_name,
                timezone,
                country_code,
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
    sso_user_email = user_info(flask.session)["email"]
    ability_screen_id = 4190
    response = trueability_api.paginate(
        trueability_api.get_assessment_reservations,
        "assessment_reservations",
        ability_screen_id=ability_screen_id,
    )

    exams = []
    for r in response["assessment_reservations"]:
        user_email = r.get("user", {}).get("email")

        if user_email != sso_user_email:
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
    sso_user_email = user_info(flask.session)["email"]
    response = trueability_api.paginate(
        trueability_api.get_assessments, "assessments", ability_screen_id=None
    )

    exams = []
    for r in response["assessments"]:
        user_email = r.get("user", {}).get("email")

        if user_email != sso_user_email:
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
                "time": started_at.strftime("%I:%M %p %Z")
                if started_at
                else "N/A",
                "timezone": timezone,
                "state": r["state"],
                "id": r["id"],
                "uuid": r["uuid"],
                "user_email": user_email,
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


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_provision(trueability_api, **_):
    sso_user = user_info(flask.session)
    sso_user_email = sso_user["email"]
    ability_screen_id = 4194

    reservation_uuid = flask.session.get("_assessment_reservation_uuid")
    assessment = None
    reservation = None
    error = None

    if not reservation_uuid:
        response = trueability_api.paginate(
            trueability_api.get_assessment_reservations,
            "assessment_reservations",
            ability_screen_id=ability_screen_id,
        )

        for reservation in response["assessment_reservations"]:
            if reservation.get("user", {}).get("email") != sso_user_email:
                continue

            if reservation.get("state") in [
                "created",
                "scheduled",
                "processed",
            ]:
                reservation_uuid = reservation["uuid"]
                flask.session[
                    "_assessment_reservation_uuid"
                ] = reservation_uuid
                break

    if reservation_uuid:
        response = trueability_api.get_assessment_reservation(reservation_uuid)

        if "error" in response:
            error = response.get(
                "message", "An error occurred while fetching your exam."
            )
        else:
            reservation = response["assessment_reservation"]
            assessment = reservation["assessment"]

    elif flask.request.method == "POST":
        starts_at = datetime.utcnow() + timedelta(seconds=70)
        first_name, last_name = sso_user["fullname"].rsplit(" ", maxsplit=1)
        response = trueability_api.post_assessment_reservation(
            ability_screen_id,
            starts_at.isoformat(),
            sso_user_email,
            first_name,
            last_name,
            "UTC",
            "DE",
        )

        if "error" in response:
            error = response.get(
                "message", "An error occurred while creating your exam."
            )
        else:
            reservation = response["assessment_reservation"]
            assessment = reservation["assessment"]
            flask.session["_assessment_reservation_uuid"] = reservation["uuid"]

    return flask.render_template(
        "/credentials/provision.html",
        assessment=assessment,
        reservation=reservation,
        error=error,
    )


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


@shop_decorator(area="cube", permission="user", response="html")
def cred_submit_form(**kwargs):
    if flask.request.method == "GET":
        return flask.render_template("credentials/exit-survey.html")

    sso_user = user_info(flask.session)
    email = sso_user["email"]
    first_name, last_name = sso_user["fullname"].rsplit(" ", maxsplit=1)

    form_fields = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "ExitSurveyRelevanceofShortFormQuestions": "",
        "ExitSurveyShortFormQuestionExpectation": "",
        "ExitSurveyNumberOfShortFormQuestions": "",
        "ExitSurveyShortFormDifficulty": "",
        "ExitSurveyShortFormQuestionTimeAllocated": "",
        "ExitSurveyRelevanceofLabQuestions": "",
        "ExitSurveyLabCoverage": "",
        "ExitSurveyNumberOfLabQuestions": "",
        "ExitSurveyLabQuestionsDifficulty": "",
        "ExitSurveyLabQuestionsTimeAllocated": "",
        "ExitSurveyExamManagementExperience": "",
        "ExitSurveyExamManagementNegatives": "",
        "ExitSurveyExamEnvironmentExperience": "",
        "ExitSurveyExamEnvironmentNegatives": "",
        "ExitSurveyPlatformBestReasons": "",
        "ExitSurveyPlatformWorstReasons": "",
        "ExitSurveyValueKnowledge": "",
        "ExitSurveyValueKnowledgeReason": "",
        "ExitSurveyReasonablePrice": "",
        "ExitSurveyMoreExams": "",
        "ExitSurveyWhyPrice": "",
        "ExitSurveyCompanyInterest": "",
        "ExitSurveyBenchmarkPlatform": "",
        "ExitSurveyBenchmarkContent": "",
        "ExitSurveyOverallExperienceRating": "",
        "ExitSurveyBestThingAboutExam": "",
        "ExitSurveyWorstThingAboutExam": "",
        "ExitSurveyDifferenceInExperience": "",
        "ExitSurveyPromoterPeer": "",
        "ExitSurveyPromoterManager": "",
        "formid": "",
        "returnURL": "",
        "Consent_to_Processing__c": "",
        "grecaptcharesponse": "",
    }
    for key in flask.request.form:
        values = flask.request.form.getlist(key)
        value = ", ".join(values)
        if value:
            form_fields[key] = value
    # Check honeypot values are not set
    honeypots = {}
    honeypots["name"] = flask.request.form.get("name")
    honeypots["website"] = flask.request.form.get("website")

    # There is logically difference between None and empty string here.
    # 1. The first if check, we are working with a form that contains honeypots
    # or the legacy ones using recaptcha.
    # 2. The second that checks for empty string is actually testing if the
    # honeypots have been triggered

    if honeypots["name"] is not None and honeypots["website"] is not None:
        if honeypots["name"] != "" and honeypots["website"] != "":
            raise BadRequest("Unexpected honeypot fields (name, website)")
        else:
            form_fields["grecaptcharesponse"] = "no-recaptcha"
            form_fields.pop("website", None)
            form_fields.pop("name", None)

    form_fields.pop("thankyoumessage", None)
    form_fields.pop("g-recaptcha-response", None)

    encode_lead_comments = (
        form_fields.pop("Encode_Comments_from_lead__c", "yes") == "yes"
    )
    if encode_lead_comments and "Comments_from_lead__c" in form_fields:
        encoded_comment = html.escape(form_fields["Comments_from_lead__c"])
        form_fields["Comments_from_lead__c"] = encoded_comment

    service_account_info = {
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_email": os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        "private_key": os.getenv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(
            "\\n", "\n"
        ),
        "scopes": ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    }

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
    )

    service = build("sheets", "v4", credentials=credentials)
    row = list(form_fields.values())
    sheet = service.spreadsheets()
    sheet.values().append(
        spreadsheetId="1L-e0pKXmBo8y_Gv9_jy9P59xO-w4FnZdcTqbGJPMNg0",
        range="Sheet2",
        valueInputOption="RAW",
        body={"values": [row]},
    ).execute()
    return flask.redirect("/thank-you")
