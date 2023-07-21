from datetime import datetime, timedelta
import math
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
from webapp.shop.utils import get_exam_contract_id, get_user_first_last_name
from webapp.login import user_info
from webapp.views import get_user_country_by_ip

from google.oauth2 import service_account
from googleapiclient.discovery import build
from werkzeug.exceptions import BadRequest

from ...views import marketo_api


TIMEZONE_COUNTRIES = {
    timezone: country
    for country, timezones in pytz.country_timezones.items()
    for timezone in timezones
}
TIMEZONE_COUNTRIES["Asia/Calcutta"] = "IN"

EXAM_NAMES = {
    "cue-test": "CUE: Linux Beta",
    "cue-linux-essentials": "CUE.01: Linux",
}

RESERVATION_STATES = {
    "created": "Scheduled",
    "scheduled": "Scheduled",
    "processed": "Complete",
    "canceled": "Cancelled",
}


@shop_decorator(area="cred", permission="user_or_guest", response="html")
def cred_home(ua_contracts_api, **_):
    available_products = ua_contracts_api.get_product_listings(
        "canonical-cube"
    ).get("productListings")
    print(available_products)
    for product in available_products:
        if product.get("name") == "CUE Linux Essentials":
            return flask.render_template(
                "credentials/index.html", can_purchase=True
            )
    return flask.render_template("credentials/index.html", can_purchase=False)


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
def cred_schedule(ua_contracts_api, trueability_api, **_):
    error = None
    now = datetime.utcnow()
    min_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    max_date = (now + timedelta(days=42)).strftime("%Y-%m-%d")

    if flask.request.method == "POST":
        data = flask.request.form

        timezone = data["timezone"]
        tz_info = pytz.timezone(timezone)
        scheduled_time = f"{data['date']}T{data['time']}"
        starts_at = tz_info.localize(
            datetime.strptime(scheduled_time, "%Y-%m-%dT%H:%M")
        )
        contract_item_id = data["contractItemID"]
        first_name, last_name = get_user_first_last_name()
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
def cred_your_exams(ua_contracts_api, trueability_api, **kwargs):
    email = flask.request.args.get("email", None)
    try:
        exam_contracts = ua_contracts_api.get_annotated_contract_items(
            product_tags=["cue"], email=email
        )
    except UAContractsAPIErrorView:
        exam_contracts = []
    exams_in_progress = []
    exams_scheduled = []
    exams_not_taken = []
    exams_complete = []
    exams_cancelled = []

    if exam_contracts:
        for exam_contract in exam_contracts:
            name = exam_contract["cueContext"]["courseID"]
            name = EXAM_NAMES.get(name, name)
            contract_item_id = (
                exam_contract.get("id") or exam_contract["contractItem"]["id"]
            )
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
                end = starts_at + timedelta(minutes=75)
                state = RESERVATION_STATES.get(r["state"], r["state"])

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

                    exams_in_progress.append(
                        {
                            "name": name,
                            "date": starts_at.strftime("%d %b %Y"),
                            "time": starts_at.strftime("%I:%M %p %Z"),
                            "timezone": timezone,
                            "state": "In progress",
                            "uuid": r["uuid"],
                            "actions": actions,
                        }
                    )

                elif state == "Scheduled":
                    actions.extend(
                        [
                            {
                                "text": "Reschedule",
                                "href": "/credentials/schedule?"
                                f"contractItemID={contract_item_id}"
                                f"&uuid={r['uuid']}",
                                "button_class": "p-button",
                            },
                        ]
                    )

                    exams_scheduled.append(
                        {
                            "name": name,
                            "date": starts_at.strftime("%d %b %Y"),
                            "time": starts_at.strftime("%I:%M %p %Z"),
                            "timezone": timezone,
                            "state": state,
                            "uuid": r["uuid"],
                            "actions": actions,
                        }
                    )
                elif state == "Complete":
                    exams_complete.append(
                        {
                            "name": name,
                            "date": starts_at.strftime("%d %b %Y"),
                            "time": starts_at.strftime("%I:%M %p %Z"),
                            "timezone": timezone,
                            "state": state,
                            "uuid": r["uuid"],
                            "actions": actions,
                        }
                    )
                elif state == "Cancelled":
                    exams_cancelled.append(
                        {
                            "name": name,
                            "date": starts_at.strftime("%d %b %Y"),
                            "time": starts_at.strftime("%I:%M %p %Z"),
                            "timezone": timezone,
                            "state": state,
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
                exams_not_taken.append(
                    {"name": name, "state": "Not taken", "actions": actions}
                )

    exams = (
        exams_in_progress
        + exams_scheduled
        + exams_not_taken
        + exams_complete
        + exams_cancelled
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
def cred_provision(ua_contracts_api, trueability_api, **_):
    contract_item_id = flask.request.args.get("contractItemID", type=int)

    if contract_item_id is None:
        return flask.redirect("/credentials/your-exams")

    country_code = get_user_country_by_ip().json["country_code"] or "GB"
    reservation_uuid = None
    assessment = None
    reservation = None
    error = None

    exam_contracts = ua_contracts_api.get_annotated_contract_items(
        product_tags=["cue"],
    )

    exam_contract = None
    for item in exam_contracts:
        if contract_item_id == (item.get("id") or item["contractItem"]["id"]):
            exam_contract = item
            break

    if exam_contract:
        if "reservation" in exam_contract["cueContext"]:
            reservation_uuid = exam_contract["cueContext"]["reservation"][
                "IDs"
            ][-1]
    else:
        error = "Exam not found"

    if not reservation_uuid:
        tz_info = pytz.timezone("UTC")
        starts_at = tz_info.localize(datetime.utcnow() + timedelta(seconds=20))
        first_name, last_name = get_user_first_last_name()

        try:
            response = ua_contracts_api.post_assessment_reservation(
                contract_item_id,
                first_name,
                last_name,
                tz_info.zone,
                starts_at.isoformat(),
                country_code,
            )

            reservation_uuid = response.get("reservation", {}).get("IDs", [])[
                -1
            ]

        except UAContractsAPIErrorView:
            error = (
                "An error occurred while reserving your exam. "
                + "Please try refreshing the page."
            )

    if reservation_uuid:
        response = trueability_api.get_assessment_reservation(reservation_uuid)

        if "error" in response:
            error = response.get("message", "No exam booking could be found.")
        else:
            reservation = response["assessment_reservation"]
            assessment = reservation["assessment"]

    if assessment and assessment.get("state") in [
        "notified",
        "released",
        "in_progress",
    ]:
        return flask.redirect(f"/credentials/exam?id={ assessment['id'] }")

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
    first_name, last_name = get_user_first_last_name()

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
        "ExitSurveyPromoterPeer": "5",
        "ExitSurveyPromoterManager": "5",
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
    form_fields["ExitSurveyPromoterManager"] = int(
        form_fields["ExitSurveyPromoterManager"]
    )
    form_fields["ExitSurveyPromoterPeer"] = int(
        form_fields["ExitSurveyPromoterPeer"]
    )
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
        spreadsheetId="1MRqabZmRUH6DBSJofs5xWmdRAaS027nW8oO4stwyMNQ",
        range="SignUps",
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
    exam = None
    action = flask.request.args.get("action")

    if flask.request.method == "POST":
        activation_key = flask.request.form.get("activation-key")
        exam = flask.request.form.get("exam")
    else:
        activation_key = kwargs.get("code")

    if not activation_key or action == "confirm":
        return flask.render_template(
            "/credentials/redeem_with_form.html", activation_key=activation_key
        )

    try:
        activation_response = ua_contracts_api.activate_activation_key(
            {
                "activationKey": activation_key,
                "productID": exam,
            }
        )
        exam_contracts = ua_contracts_api.get_annotated_contract_items(
            product_tags=["cue"],
        )
        contract_id = get_exam_contract_id(exam_contracts[-1])
        if action == "schedule":
            return flask.redirect(
                f"/credentials/schedule?contractItemID={contract_id}"
            )
        if action == "take":
            return flask.redirect(
                f"/credentials/provision?contractItemID={contract_id}"
            )
        return flask.render_template(
            "/credentials/redeem.html",
            notification_class="positive",
            notification_title="Success",
            notification_message="Your exam has been activated.",
        )
    except UAContractsAPIErrorView as error:
        activation_response = json.loads(error.response.text).get("message")
        return flask.render_template(
            "/credentials/redeem.html",
            notification_class="negative",
            notification_title="Something went wrong",
            notification_message=activation_response,
        )
    except UAContractsUserHasNoAccount:
        return flask.render_template(
            "/credentials/redeem_with_captcha.html", key=activation_key
        )


@shop_decorator(area="cube", permission="user", response="json")
def get_activation_keys(ua_contracts_api, advantage_mapper, **kwargs):
    account = advantage_mapper.get_purchase_account("canonical-ua")
    contracts = advantage_mapper.get_activation_key_contracts(account.id)

    keys = []
    for contract in contracts:
        contract_id = contract.id
        keys.extend(ua_contracts_api.list_activation_keys(contract_id))

    return flask.jsonify(keys)


@shop_decorator(area="cube", permission="user", response="json")
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
    return ua_contracts_api.activate_activation_key(
        {
            "activationKey": activation_key,
        }
    )


@shop_decorator(area="cred", permission="user", response="html")
@canonical_staff()
def cred_beta_activation(**_):
    if flask.request.method == "POST":
        data = flask.request.form

        emails = data["emails"].split("\n")
        keys = data["keys"].split("\n")

        leads = []
        for email, key in zip(emails, keys):
            leads.append({"email": email, "cred_activation_key": key})

        marketo_api.update_leads(leads)

    return flask.render_template("credentials/beta-activation.html")


@shop_decorator(area="cred", permission="user", response="json")
def get_filtered_webhook_responses(trueability_api, **kwargs):
    ability_screen_id = flask.request.args.get("ability_screen_id", None)
    page = flask.request.args.get("page", 1)
    page = int(page)
    per_page = flask.request.args.get("per_page", 10)
    per_page = int(per_page)
    ta_results_per_page = 100
    ta_page = math.ceil(page * per_page // ta_results_per_page)
    webhook_responses = trueability_api.get_filtered_webhook_responses(
        ability_screen_id=ability_screen_id,
        page=ta_page,
    )
    total_count = webhook_responses["meta"]["total_count"]
    ta_webhook_responses = webhook_responses["webhook_responses"]
    ta_webhook_responses = [
        ta_webhook_responses[i]
        for i in range(
            page * per_page % ta_results_per_page - per_page,
            min(page * per_page % ta_results_per_page, total_count),
        )
    ]
    page_metadata = {}
    page_metadata["current_page"] = page
    page_metadata["total_pages"] = (
        webhook_responses["meta"]["total_count"] // per_page
    ) + 1
    page_metadata["total_count"] = total_count
    page_metadata["next_page"] = (
        page + 1 if page < page_metadata["total_pages"] else None
    )
    page_metadata["prev_page"] = page - 1 if page > 1 else None

    return flask.jsonify(
        {"webhook_responses": ta_webhook_responses, "meta": page_metadata}
    )


@shop_decorator(area="cred", permission="user", response="json")
def get_webhook_response(trueability_api, **kwargs):
    webhook_id = flask.request.args.get("webhook_id", None)
    webhook_responses = trueability_api.get_webhook_response(
        webhook_id=webhook_id,
    )
    return flask.jsonify(webhook_responses)


@shop_decorator(area="cred", permission="user", response=json)
@canonical_staff()
def get_issued_badges(credly_api, **kwargs):
    badges = credly_api.get_issued_badges()
    return flask.jsonify(badges["data"])


@shop_decorator(area="cred", permission="user", response="html")
def get_my_issued_badges(credly_api, **kwargs):
    sso_user_email = user_info(flask.session)["email"]
    response = credly_api.get_issued_badges(
        filter={"recipient_email": sso_user_email}
    )
    return flask.render_template(
        "credentials/your-badges.html", badges=response["data"]
    )


@shop_decorator(area="cred", permission="guest", response="json")
def issue_badges(trueability_api, credly_api, **kwargs):
    webhook_response = flask.request.json
    api_key = flask.request.headers.get("X-API-KEY")
    if not api_key or api_key != os.getenv("TA_WEBHOOK_API_KEY"):
        return flask.jsonify({"status": "Invalid API Key"}), 401
    assessment_score = webhook_response["assessment"]["score"]
    cutoff_score = webhook_response["assessment"]["ability_screen"][
        "cutoff_score"
    ]
    if assessment_score >= cutoff_score:
        assessment_user = webhook_response["assessment"]["user"]["email"]
        first_name, last_name = webhook_response["assessment"]["user"][
            "full_name"
        ].rsplit(" ", 1)
        ability_screen_id = webhook_response["assessment"][
            "ability_screen_variant"
        ]["ability_screen_id"]
        new_badge = credly_api.issue_new_badge(
            email=assessment_user,
            first_name=first_name,
            last_name=last_name,
            ability_screen_id=ability_screen_id,
        )
        if "data" in new_badge and "accept_badge_url" in new_badge["data"]:
            # 201 Created.
            # Request was valid and the server created a new badge.
            return (
                flask.jsonify(
                    {
                        "status": "badge_issued",
                        "accept_badge_url": new_badge["data"][
                            "accept_badge_url"
                        ],
                    }
                ),
                201,
            )
        else:
            # 500 Error. Request was valid but the server encountered an error
            return (flask.jsonify(new_badge), 500)
    # 403 Forbidden. Request was valid but the server is refusing action
    return flask.jsonify({"status": "badge_not_issued"}), 403
