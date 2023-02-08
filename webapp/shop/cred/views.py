from datetime import datetime, timedelta
import pytz
import flask
import json
import os
import html
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPIErrorView,
    UAContractsUserHasNoAccount,
)

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

    contract_item_id = flask.request.args.get("contractItemID")
    if contract_item_id is None:
        return flask.redirect("/credentials/your-exams")
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

    if exam_contracts:
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
                                "href": "/credentials/exam?"
                                f"id={ assessment_id }",
                                "button_class": "p-button--positive",
                            }
                        ]
                    )

                if r["state"] == "scheduled":
                    actions.extend(
                        [
                            {
                                "text": "Reschedule",
                                "href": "/credentials/schedule?"
                                f"contractItemID={contract_item_id}"
                                f"&uuid={r['uuid']}",
                                "button_class": "p-button",
                            },
                            {
                                "text": "Cancel",
                                "href": "/credentials/cancel-exam?"
                                f"contractItemID={contract_item_id}",
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
                        "href": "/credentials/schedule?"
                        f"contractItemID={contract_item_id}",
                        "button_class": "p-button",
                    },
                    {
                        "text": "Take now",
                        "href": "/credentials/provision?"
                        f"contractItemID={contract_item_id}",
                        "button_class": "p-button",
                    },
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
def cred_provision(ua_contracts_api, trueability_api, **_):
    contract_item_id = flask.request.args.get("contractItemID")

    if contract_item_id is None:
        return flask.redirect("/credentials/your-exams")

    sso_user = user_info(flask.session)
    sso_user_email = sso_user["email"]
    ability_screen_id = 4194

    reservation_uuid = None
    assessment = None
    reservation = None
    error = None

    exam_contracts = ua_contracts_api.get_exam_contracts()
    #  print(json.dumps(exam_contracts, indent=4))
    print("contract_item_id: ", contract_item_id)
    #  breakpoint()

    #  contract_item = next(filter(lambda item: item["id"] == contract_item_id, exam_contracts))
    #  print("contract_item: ", contract_item)
    exam_contract = None
    for item in exam_contracts:
        if int(contract_item_id) == item["id"]:
            exam_contract = item
            break

    print("exam_contract: ", json.dumps(exam_contract, indent=4))

    if exam_contract:
        if "reservation" in exam_contract["cueContext"]:
            #  response = trueability_api.get_assessment_reservation(
            #      exam_contract["cueContext"]["reservation"]["IDs"][-1]
            #  )
            #  r = response["assessment_reservation"]
            reservation_uuid = exam_contract["cueContext"]["reservation"][
                "IDs"
            ][-1]
    else:
        error = "Exam not found"

    if flask.request.method == "POST" and not reservation_uuid:
        data = flask.request.form
        print("data: ", data)
        contract_item_id = data["contractItemID"]
        print("POST contract_item_id: ", contract_item_id)

        tz_info = pytz.timezone("UTC")
        starts_at = tz_info.localize(datetime.utcnow() + timedelta(seconds=70))
        first_name, last_name = sso_user["fullname"].rsplit(" ", maxsplit=1)

        try:
            response = ua_contracts_api.post_assessment_reservation(
                contract_item_id,
                first_name,
                last_name,
                tz_info.zone,
                starts_at.isoformat(),
                "DE",
            )

            #  print(json.dumps(response, indent=4))
            print("response: ", response)

            if "error" in response:
                print("error!")
                error = response.get(
                    "message", "An error occurred while creating your exam."
                )
            else:
                reservation_uuid = response.get("reservation", {}).get(
                    "IDs", []
                )[-1]
                print("reservation_uuid: ", reservation_uuid)
        except Exception as e:
            import traceback

            traceback.print_exc()
            print("exception: ", e)

    print("if reservation_uuid: ", reservation_uuid)
    if reservation_uuid:
        response = trueability_api.get_assessment_reservation(reservation_uuid)

        if "error" in response:
            error = response.get(
                "message", "An error occurred while fetching your exam."
            )
        else:
            reservation = response["assessment_reservation"]
            assessment = reservation["assessment"]
            print("assessment_reservation: ", json.dumps(response, indent=4))

    return flask.render_template(
        "/credentials/provision.html",
        contract_item_id=contract_item_id,
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


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_shop(**kwargs):
    return flask.render_template("credentials/shop/index.html")


@shop_decorator(area="cube", permission="user", response="html")
def cred_redeem_code(ua_contracts_api, advantage_mapper, **kwargs):
    if flask.request.method == "POST":
        sso_user = user_info(flask.session)
        account = advantage_mapper.ensure_purchase_account(
            marketplace="canonical-cube",
            email=sso_user["email"],
            account_name=sso_user["fullname"],
            captcha_value=flask.request.form["g-recaptcha-response"],
        )
        return flask.redirect("/credentials/redeem/" + kwargs.get("code"))

    activation_key = kwargs.get("code")
    try:
        account = advantage_mapper.get_purchase_account("canonical-cube")
        account_id = account.id
        product_id = kwargs.get("product_id", "cue-test")

        activation_response = ua_contracts_api.activate_activation_key(
            {
                "activationKey": activation_key,
                "accountID": account_id,
                "productID": product_id,
            }
        )
        exam_contracts = ua_contracts_api.get_exam_contracts()
        contract_id = exam_contracts[-1]["id"]
        if flask.request.args.get("action") == "schedule":
            return flask.redirect(
                f"/credentials/schedule?contractItemID={contract_id}"
            )
        if flask.request.args.get("action") == "take":
            return flask.redirect(
                f"/credentials/provision?contractItemID={contract_id}"
            )
        return flask.redirect("/credentials/your-exams")
    except UAContractsAPIErrorView as error:
        activation_response = json.loads(error.response.text)
        return flask.render_template(
            "/credentials/redeem.html",
            activation_response=activation_response,
        )
    except UAContractsUserHasNoAccount:
        return flask.render_template(
            "/credentials/redeem_with_captcha.html", key=activation_key
        )


@shop_decorator(area="cube", permission="user", response="json")
@canonical_staff()
def get_activation_keys(ua_contracts_api, advantage_mapper, **kwargs):
    account = advantage_mapper.get_purchase_account()
    contracts = advantage_mapper.get_activation_key_contracts(account.id)

    contract_id = None
    for contract in contracts:
        if contract.name == "CUE TEST key":
            contract_id = contract.id

    keys = ua_contracts_api.list_activation_keys(contract_id)
    return flask.jsonify(keys)


@shop_decorator(area="cube", permission="user", response="json")
@canonical_staff()
def rotate_activation_key(ua_contracts_api, **kwargs):
    activation_key = kwargs.get("activation_key")
    new_activation_key = ua_contracts_api.rotate_activation_key(
        {"activationKey": activation_key}
    )
    return flask.jsonify(new_activation_key)


@shop_decorator(area="cube", permission="user", response=json)
def activate_activation_key(ua_contracts_api, **kwargs):
    data = flask.request.json
    activation_key = data["activationKey"]
    account = ua_contracts_api.get_purchase_account("canonical-cube")
    account_id = account["id"]
    product_id = data["productID"]
    return ua_contracts_api.activate_activation_key(
        {
            "activationKey": activation_key,
            "accountID": account_id,
            "productID": product_id,
        }
    )
