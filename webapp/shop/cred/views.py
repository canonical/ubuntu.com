from datetime import datetime, timedelta
import pytz
import flask
import json
import os
import html

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
TIMEZONE_COUNTRIES["Asia/Calcutta"] = "IN"


@shop_decorator(area="cred", permission="user_or_guest", response="html")
def cred_home(**_):
    return flask.render_template("credentials/index.html")


@shop_decorator(area="cred", permission="user_or_guest", response="html")
def cred_self_study(**_):
    return flask.render_template("credentials/self-study.html")


@shop_decorator(area="cred", permission="user_or_guest", response="html")
def cred_sign_up(**_):
    sign_up_open = False
    return flask.render_template(
        "credentials/sign-up.html", sign_up_open=sign_up_open
    )


@shop_decorator(area="cred", permission="user", response="html")
@canonical_staff()
def cred_schedule(ua_contracts_api, trueability_api, **_):
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
        contract_item_id = data["contractItemID"]
        first_name, last_name = sso_user["fullname"].rsplit(" ", maxsplit=1)
        country_code = TIMEZONE_COUNTRIES[timezone]

        response = ua_contracts_api.post_assessment_reservation(
            contract_item_id,
            first_name,
            last_name,
            timezone,
            starts_at.isoformat(),
            country_code,
        )

        if response and "error" in response:
            error = response["message"]
            return flask.render_template(
                "/credentials/schedule.html", error=error
            )
        else:
            uuid = response.get("reservation", {}).get("IDs", [])[-1]
            exam = {
                "name": "CUE: Linux",
                "date": starts_at.strftime("%d %b %Y"),
                "time": starts_at.strftime("%I:%M %p %Z"),
                "uuid": uuid,
                "contract_item_id": contract_item_id,
            }
            return flask.render_template(
                "/credentials/schedule-confirm.html", exam=exam
            )

    assessment_reservation_uuid = flask.request.args.get("uuid")
    contract_item_id = flask.request.args.get("contractItemID")
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
        contract_item_id=contract_item_id,
        timezone=timezone,
        date=date,
        time=time,
        min_date=min_date,
        max_date=max_date,
        error=error,
    )


@shop_decorator(area="cred", permission="user", response="html")
def cred_your_exams(ua_contracts_api, trueability_api, **_):
    exam_contracts = ua_contracts_api.get_exam_contracts()
    exams = []
    for exam_contract in exam_contracts:
        name = exam_contract["cueContext"]["courseID"]
        contract_item_id = exam_contract["id"]
        if "reservation" in exam_contract["cueContext"]:
            response = trueability_api.get_assessment_reservation(
                exam_contract["cueContext"]["reservation"]["IDs"][-1]
            )
            r = response["assessment_reservation"]

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
                            "href": f"/credentials/schedule?contractItemID={contract_item_id}&uuid={r['uuid']}",
                            "button_class": "p-button",
                        },
                        {
                            "text": "Cancel",
                            "href": f"/credentials/cancel-exam?contractItemID={contract_item_id}",
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
        else:
            actions = [
                {
                    "text": "Schedule",
                    "href": f"/credentials/schedule?contractItemID={contract_item_id}",
                    "button_class": "p-button",
                }
            ]
            exams.append({"name": name, "actions": actions})

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


@shop_decorator(area="cred", permission="user", response="html")
@canonical_staff()
def cred_cancel_exam(ua_contracts_api, **_):
    contract_item_id = flask.request.args.get("contractItemID")
    ua_contracts_api.delete_assessment_reservation(contract_item_id)
    return flask.redirect("/credentials/your-exams")


@shop_decorator(area="cred", permission="user", response="html")
@canonical_staff()
def cred_assessments(trueability_api, **_):
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


@shop_decorator(area="cred", permission="user", response="html")
@canonical_staff()
def cred_exam(trueability_api, **_):
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


@shop_decorator(area="cred", permission="user", response="html")
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

        for response_reservation in response["assessment_reservations"]:
            if (
                response_reservation.get("user", {}).get("email")
                != sso_user_email
            ):
                continue

            if response_reservation.get("state") in [
                "created",
                "scheduled",
                "processed",
            ]:
                reservation_uuid = response_reservation["uuid"]
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


@shop_decorator(area="cred", permission="user_or_guest", response="html")
def cred_syllabus_data(**_):
    exam_name = flask.request.args.get("exam")
    syllabus_file = open("webapp/shop/cred/syllabus.json", "r")
    syllabus_data = json.load(syllabus_file)
    return flask.render_template(
        "credentials/syllabus.html",
        syllabus_data=syllabus_data,
        exam_name=exam_name,
    )


@shop_decorator(area="cred", permission="user", response="html")
def cred_submit_form(**_):
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
