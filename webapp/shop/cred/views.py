from distutils.util import strtobool
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
from concurrent.futures import ThreadPoolExecutor
from dateutil.parser import parse

from webapp.shop.api.datastore import (
    handle_confidentiality_agreement_submission,
    has_filed_confidentiality_agreement,
)
from webapp.shop.decorators import (
    credentials_group,
    credentials_admin,
    shop_decorator,
    canonical_staff,
    get_trueability_api_instance,
    init_trueability_session,
)
from webapp.shop.utils import get_exam_contract_id, get_user_first_last_name
from webapp.login import user_info

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
    "cue-test": "CUE Linux Beta",
    "cue-linux-essentials": "CUE.01 Linux",
    "cue-01-linux": "CUE.01 Linux",
    "cue-02-desktop": "CUE.02 Desktop",
}

RESERVATION_STATES = {
    "created": "Created",
    "notified": "Notified",
    "scheduled": "Scheduled",
    "processed": "Processed",
    "canceled": "Cancelled",
    "finalized": "Finalised",
    "provisioning": "Provisioning",
    "provisioned": "Provisioned",
    "in_progress": "In Progress",
    "completed": "Completed",
    "grading": "Grading",
    "graded": "Graded",
    "archiving": "Archiving",
    "archived": "Archived",
    "canceling": "Canceling",
}


def confidentiality_agreement_webhook():
    username = os.getenv("CONFIDENTIALITY_AGREEMENT_WEBHOOK_USERNAME")
    password = os.getenv("CONFIDENTIALITY_AGREEMENT_WEBHOOK_PASSWORD")
    authorization = flask.request.authorization
    if (
        not authorization
        or authorization.username != username
        or authorization.password != password
    ):
        return flask.jsonify({"message": "Invalid credentials."}), 403

    email = flask.request.values.get("email").lower()
    handle_confidentiality_agreement_submission(email)

    return flask.jsonify({"message": "Webhook handled."}), 200


@shop_decorator(area="cred", response="html")
def cred_home(
    show_cred_maintenance_alert,
    cred_is_in_maintenance,
    cred_maintenance_start,
    cred_maintenance_end,
    **_,
):
    return flask.render_template(
        "credentials/index.html",
        show_cred_maintenance_alert=show_cred_maintenance_alert,
        cred_is_in_maintenance=cred_is_in_maintenance,
        cred_maintenance_start=cred_maintenance_start,
        cred_maintenance_end=cred_maintenance_end,
    )


@shop_decorator(area="cred", response="html")
def cred_self_study(**_):
    return flask.render_template("credentials/self-study.html")


@shop_decorator(area="cred", permission="user", response="html")
def cred_sign_up(**_):
    search_type = flask.request.args.get("type")
    if flask.request.method == "GET":
        sign_up_open = True
        return flask.render_template(
            "credentials/sign-up.html",
            sign_up_open=sign_up_open,
            search_type=search_type,
        )
    form_fields = {}
    for key in flask.request.form:
        values = flask.request.form.getlist(key)
        value = ", ".join(values)
        if value:
            form_fields[key] = value
            if "utm_content" in form_fields:
                form_fields["utmcontent"] = form_fields.pop("utm_content")

    # remove country field for marketo
    if "country" in form_fields:
        form_fields.pop("country")
    # Check honeypot values are not set
    honeypots = {}
    honeypots["name"] = flask.request.form.get("name")
    honeypots["website"] = flask.request.form.get("website")
    if honeypots["name"] is not None and honeypots["website"] is not None:
        if honeypots["name"] != "" and honeypots["website"] != "":
            raise BadRequest("Unexpected honeypot fields (name, website)")
        else:
            form_fields["grecaptcharesponse"] = "no-recaptcha"
            form_fields.pop("website", None)
            form_fields.pop("name", None)

    form_fields.pop("thankyoumessage", None)
    form_fields.pop("g-recaptcha-response", None)
    return_url = form_fields.pop("returnURL", None)

    encode_lead_comments = (
        form_fields.pop("Encode_Comments_from_lead__c", "yes") == "yes"
    )
    if encode_lead_comments and "Comments_from_lead__c" in form_fields:
        encoded_comment = html.escape(form_fields["Comments_from_lead__c"])
        form_fields["Comments_from_lead__c"] = encoded_comment

    visitor_data = {
        "userAgentString": flask.request.headers.get("User-Agent"),
    }
    referrer = flask.request.referrer
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )

    if client_ip and ":" not in client_ip:
        visitor_data["leadClientIpAddress"] = client_ip

    is_staging = "staging" in os.getenv(
        "CONTRACTS_API_URL", "https://contracts.staging.canonical.com/"
    )
    form_fields["enviornment"] = "staging" if is_staging else "production"
    payload = {
        "formId": form_fields.pop("formid"),
        "input": [
            {
                "leadFormFields": form_fields,
                "visitorData": visitor_data,
                "cookie": flask.request.args.get("mkt"),
            }
        ],
    }

    try:
        response = marketo_api.submit_form(payload).json()
        if response and response.get("result"):
            result = response["result"][0]
            if (
                result.get("status") == "skipped"
                or response.get("success") is False
            ):
                return (
                    flask.render_template(
                        "credentials/sign-up.html",
                        error="Something went wrong",
                        search_type=search_type,
                    ),
                    400,
                )
    except Exception:
        flask.current_app.extensions["sentry"].captureException(
            extra={"payload": payload}
        )

        return (
            flask.render_template(
                "credentials/sign-up.html",
                error="Something went wrong",
                search_type=search_type,
            ),
            400,
        )

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

    def extract_json_comment(obj):
        fields = [
            "NativeLanguage",
            "Country",
            "areaOfExpertise",
            "HasFormalTechnicalDegree",
            "HighestLevelOfFormalEducation",
            "UbuntuLastProfessionalExperience",
            "CUEMotivation",
            "whyNotOtherCertifications",
            "UbuntuLastAcademicExperience",
            "whyOtherCertifications",
            "trainingExperiences",
            "otherCertifications",
            "UbuntuOverallExperience",
            "YearsTechnicalRole",
        ]
        row = []
        for key in fields:
            cell = obj.get(key, None)
            if cell is not None:
                if isinstance(cell, dict):
                    json_dict = json.dumps(cell)
                    row.append(json_dict)
                else:
                    row.append(cell)
            else:
                row.append("")

        return row

    SHEET_ID = "1i9dT558_YYxxdPpDTG5VYewezb5gRUziMG77BtdUZGU"
    range = (
        "Production"
        if "staging"
        not in os.getenv(
            "CONTRACTS_API_URL", "https://contracts.staging.canonical.com/"
        )
        else "Staging"
    )

    sheet = service.spreadsheets()
    # add the header to the sheet if the sheet is empty initially
    result = (
        sheet.values()
        .get(spreadsheetId=SHEET_ID, range=f"{range}!1:1")
        .execute()
    )
    first_row = result.get("values", [])
    if len(first_row) == 0:
        header = [
            "First Name",
            "Last Name",
            "Email",
            "Job Role",
            "Timestamp",
            "Title",
            "Comments",
            "Canonical Updates Opt In",
            "Exam Contributor Type",
            "NativeLanguage",
            "Country",
            "Area Of Expertise",
            "Has Formal Technical Degree",
            "Highest Level Of Formal Education",
            "Ubuntu Last Professional Experience",
            "CUE Motivation",
            "Why Not Other Certifications",
            "Ubuntu Last Academic Experience",
            "Why Other Certifications",
            "Training Experiences",
            "Other Certifications",
            "Ubuntu Overall Experience",
            "Years Technical Role",
        ]
        body = {"values": [header]}
        sheet.values().append(
            spreadsheetId=SHEET_ID,
            range=f"{range}!A:A",
            valueInputOption="RAW",
            body=body,
        ).execute()

    body = {
        "values": [
            [
                form_fields.get("firstName"),
                form_fields.get("lastName"),
                form_fields.get("email"),
                form_fields.get("Job_Role__c"),
                datetime.now(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S"),
                form_fields.get("title"),
                form_fields.get("Comments_from_lead__c"),
                form_fields.get("canonicalUpdatesOptIn"),
                form_fields.get("exam_contributor_type"),
                *extract_json_comment(
                    json.loads(form_fields["Comments_from_lead__c"])
                ),
            ]
        ]
    }
    sheet.values().append(
        spreadsheetId=SHEET_ID,
        range=f"{range}!A:A",
        valueInputOption="RAW",
        body=body,
    ).execute()

    if return_url:
        # Personalize thank-you page
        flask.session["form_details"] = {
            "name": flask.request.form.get("firstName"),
            "email": flask.request.form.get("email"),
        }
        return flask.redirect(return_url)

    if referrer:
        return flask.redirect(
            f"/thank-you?referrer={referrer}?type={search_type}"
        )
    else:
        return flask.redirect(f"/thank-you?type={search_type}")


@shop_decorator(area="cred", response="html")
def cred_thank_you(**_):
    signup_type = flask.request.args.get("type")
    return flask.render_template(
        "credentials/thank-you.html", signup_type=signup_type
    )


@shop_decorator(area="cred", permission="user", response="html")
def cred_schedule(
    ua_contracts_api,
    show_cred_maintenance_alert,
    cred_is_in_maintenance,
    cred_maintenance_start,
    cred_maintenance_end,
    is_cred_admin,
    trueability_api,
    **_,
):
    error = None

    contract_long_id = flask.request.args.get("contractLongID")
    contract_detail = ua_contracts_api.get_contract(contract_long_id)

    now = datetime.utcnow()
    min_date = (now + timedelta(minutes=30)).strftime("%Y-%m-%d")
    max_date = datetime.strptime(
        f"{contract_detail['contractInfo']['effectiveTo']}",
        "%Y-%m-%dT%H:%M:%SZ",
    ).strftime("%Y-%m-%d")

    is_staging = "staging" in os.getenv(
        "CONTRACTS_API_URL", "https://contracts.staging.canonical.com/"
    )
    time_delta = 0.5 if is_staging else 3
    time_delay = "30 minutes" if is_staging else "3 hours"

    if flask.request.method == "POST":
        data = flask.request.form

        timezone = data["timezone"]
        tz_info = pytz.timezone(timezone)
        scheduled_time = datetime.strptime(
            f"{data['date']}T{data['time']}", "%Y-%m-%dT%H:%M"
        )
        starts_at = tz_info.localize(scheduled_time)
        contract_item_id = flask.request.args.get("contractItemID", "")
        first_name, last_name = get_user_first_last_name()
        country_code = TIMEZONE_COUNTRIES[timezone]
        assessment_reservation_uuid = None
        template_data = {
            key: data[key] for key in ["date", "time", "timezone"]
        }
        template_data["min_date"] = min_date
        template_data["max_date"] = max_date
        template_data["time_delay"] = time_delay
        template_data["contract_item_id"] = contract_item_id

        if flask.request.args.get("uuid", default=None, type=str):
            assessment_reservation_uuid = flask.request.args.get("uuid")

        if starts_at <= datetime.now(pytz.UTC).astimezone(tz_info) + timedelta(
            hours=time_delta
        ):
            error = (
                f"Start time should be at least {time_delay}"
                + " from now or later."
            )
            return flask.render_template(
                "/credentials/schedule.html",
                **template_data,
                error=error,
            )

        cred_maintenance_start = (
            parse(cred_maintenance_start) if cred_maintenance_start else None
        )
        cred_maintenance_end = (
            parse(cred_maintenance_end) if cred_maintenance_end else None
        )
        if (
            not is_cred_admin
            and show_cred_maintenance_alert
            and cred_maintenance_start
            and cred_maintenance_end
            and (cred_maintenance_start <= starts_at <= cred_maintenance_end)
        ):
            maintenance_start_tz = cred_maintenance_start.astimezone(tz_info)
            maintenance_end_tz = cred_maintenance_end.astimezone(tz_info)
            return flask.render_template(
                "/credentials/schedule.html",
                **template_data,
                maintenance_error=True,
                maintenance_start=maintenance_start_tz,
                maintenance_end=maintenance_end_tz,
            )

        if assessment_reservation_uuid:
            """check if the rescheduled datetime falls
            between the contract effectiveness window"""
            if not contract_long_id:
                return flask.redirect("/credentials/your-exams")
            effective_from = now.astimezone(tz_info) + timedelta(
                hours=time_delta
            )
            effective_to = (
                datetime.strptime(
                    f"{contract_detail['contractInfo']['effectiveTo']}",
                    "%Y-%m-%dT%H:%M:%SZ",
                )
                .replace(tzinfo=pytz.UTC)
                .astimezone(tz_info)
            )

            if starts_at < effective_from or starts_at > effective_to:
                error = [
                    "Scheduled time should be between",
                    f"{effective_from.strftime('%m-%d-%Y %H:%M')}",
                    "to",
                    f"{effective_to.strftime('%m-%d-%Y %H:%M')}",
                ]
                return flask.render_template(
                    "/credentials/schedule.html",
                    error=" ".join(error),
                    **template_data,
                )
            try:
                response = ua_contracts_api.post_assessment_reservation(
                    contract_item_id,
                    first_name,
                    last_name,
                    timezone,
                    starts_at.isoformat(),
                    country_code,
                )
                exam = {
                    "name": "CUE.01 Linux",
                    "date": starts_at.strftime("%d %b %Y"),
                    "time": starts_at.strftime("%I:%M %p ") + timezone,
                    "uuid": assessment_reservation_uuid,
                    "contract_item_id": contract_item_id,
                }
                return flask.render_template(
                    "/credentials/schedule-confirm.html",
                    exam=exam,
                    contract_long_id=contract_long_id,
                )
            except Exception as error:
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "user_info": user_info(flask.session),
                        "request_url": error.request.url,
                        "request_headers": error.request.headers,
                        "response_headers": error.response.headers,
                        "response_body": error.response.json(),
                    }
                )
                error = error.response.json()["message"]
                return flask.render_template(
                    "/credentials/schedule.html",
                    error=error,
                    time_delay=time_delay,
                )
        else:
            try:
                response = ua_contracts_api.post_assessment_reservation(
                    contract_item_id,
                    first_name,
                    last_name,
                    timezone,
                    starts_at.isoformat(),
                    country_code,
                )
            except Exception as error:
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "user_info": user_info(flask.session),
                        "request_url": error.request.url,
                        "request_headers": error.request.headers,
                        "response_headers": error.response.headers,
                        "response_body": error.response.json(),
                    }
                )
                error = error.response.json()["message"]
                return flask.render_template(
                    "/credentials/schedule.html",
                    error=error,
                    time_delay=time_delay,
                )

            if response and "reservation" not in response:
                error = response["message"]
                return flask.render_template(
                    "/credentials/schedule.html",
                    error=error,
                    time_delay=time_delay,
                )
            else:
                uuid = response.get("reservation", {}).get("IDs", [])[-1]
                exam = {
                    "name": "CUE.01 Linux",
                    "date": starts_at.strftime("%d %b %Y"),
                    "time": starts_at.strftime("%I:%M %p ") + timezone,
                    "uuid": uuid,
                    "contract_item_id": contract_item_id,
                }
                return flask.render_template(
                    "/credentials/schedule-confirm.html",
                    exam=exam,
                    contract_long_id=contract_long_id,
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
        time_delay=time_delay,
        show_cred_maintenance_alert=show_cred_maintenance_alert,
        cred_is_in_maintenance=cred_is_in_maintenance,
        cred_maintenance_start=cred_maintenance_start,
        cred_maintenance_end=cred_maintenance_end,
    )


@shop_decorator(area="cred", permission="user", response="html")
def cred_your_exams(
    ua_contracts_api,
    trueability_api,
    show_cred_maintenance_alert,
    cred_is_in_maintenance,
    cred_maintenance_start,
    cred_maintenance_end,
    **kwargs,
):
    email = flask.request.args.get("email", None)
    user = user_info(flask.session)
    if not email:
        email = user["email"]

    agreement_notification = False
    confidentiality_agreement_enabled = strtobool(
        os.getenv("CREDENTIALS_CONFIDENTIALITY_ENABLED", "false")
    )
    if (
        confidentiality_agreement_enabled
        and not has_filed_confidentiality_agreement(
            flask.session["openid"]["email"].lower()
        )
    ):
        agreement_notification = True

    try:
        exam_contracts = ua_contracts_api.get_annotated_contract_items(
            email=email, product_tags=["cue"]
        )
    except Exception as error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "user_info": user_info(flask.session),
                "request_url": flask.request.url,
                "request_headers": flask.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
            }
        )
        if error.response.status_code == 401:
            return flask.redirect("/logout?return_to=/credentials/your-exams")
        else:
            exam_contracts = []

    exams_in_progress = []
    exams_scheduled = []
    exams_not_taken = []
    exams_complete = []
    exams_cancelled = []
    exams_expired = []

    if exam_contracts:
        # Fetch all reservations in one API call
        try:
            reservations_response = (
                trueability_api.get_assessment_reservations(
                    per_page=500,
                    email=email,
                )
            )
            reservations = {
                r["uuid"]: r
                for r in reservations_response.get(
                    "assessment_reservations", []
                )
            }

        except Exception:
            reservations = {}

        for exam_contract in exam_contracts:
            name = exam_contract["cueContext"]["courseID"]
            name = EXAM_NAMES.get(name, name)
            contract_item_id = (
                exam_contract.get("id") or exam_contract["contractItem"]["id"]
            )
            contract_long_id = exam_contract["contractItem"]["contractID"]

            # if exam is scheduled
            if "reservation" in exam_contract["cueContext"]:
                reservation_id = exam_contract["cueContext"]["reservation"][
                    "IDs"
                ][-1]
                reservation = reservations.get(reservation_id)

                if not reservation:
                    exams_expired.append(
                        {
                            "name": name,
                            "state": "Cannot fetch information",
                            "actions": [],
                        }
                    )
                    continue

                r = reservation
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
                if assessment_id:
                    state = RESERVATION_STATES.get(
                        r["assessment"]["state"], r["state"]
                    )
                else:
                    state = RESERVATION_STATES.get(r["state"], r["state"])

                state = (
                    RESERVATION_STATES["finalized"]
                    if state
                    in [
                        RESERVATION_STATES["archived"],
                        RESERVATION_STATES["archiving"],
                    ]
                    else state
                )

                # if assessment is provisioned
                if assessment_id:
                    is_in_window = (now > starts_at and now < end) or (
                        now < starts_at
                        and now > starts_at - timedelta(minutes=30)
                    )
                    provisioned_but_not_taken = is_in_window and state in [
                        RESERVATION_STATES["notified"],
                        RESERVATION_STATES["provisioned"],
                    ]

                    if (
                        state == RESERVATION_STATES["in_progress"]
                        or provisioned_but_not_taken
                    ):
                        actions.extend(
                            [
                                {
                                    "text": (
                                        "Continue exam"
                                        if state
                                        == RESERVATION_STATES["in_progress"]
                                        else "Take exam"
                                    ),
                                    "href": "/credentials/exam?"
                                    f"id={assessment_id}",
                                    "button_class": "p-button--positive",
                                }
                            ]
                        )

                    exam_data = {
                        "name": name,
                        "date": starts_at.strftime("%d %b %Y"),
                        "time": starts_at.strftime("%I:%M %p %Z"),
                        "timezone": timezone,
                        "state": (
                            "Ready to be taken"
                            if provisioned_but_not_taken
                            else state
                        ),
                        "uuid": r["uuid"],
                        "actions": actions,
                    }

                    if state in [
                        RESERVATION_STATES["completed"],
                        RESERVATION_STATES["finalized"],
                        RESERVATION_STATES["graded"],
                    ]:
                        exams_complete.append(exam_data)
                    else:
                        exams_in_progress.append(exam_data)

                # if at least 30 minutes away allow reschedule
                elif state == "Scheduled":
                    if now + timedelta(minutes=30) < starts_at:
                        actions.extend(
                            [
                                {
                                    "text": "Reschedule",
                                    "href": "/credentials/schedule?"
                                    f"contractItemID={contract_item_id}"
                                    f"&uuid={r['uuid']}"
                                    f"&contractLongID={contract_long_id}",
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
            # if exam expires
            elif (
                "effectivenessContext" in exam_contract
                and "status" in exam_contract["effectivenessContext"]
                and exam_contract["effectivenessContext"]["status"]
                == "expired"
            ):
                exams_expired.append(
                    {"name": name, "state": "Expired", "actions": []}
                )

            # if exam is not used and is not expired
            else:
                actions = [
                    {
                        "text": "Schedule",
                        "href": "/credentials/schedule?"
                        f"contractItemID={contract_item_id}"
                        f"&contractLongID={contract_long_id}",
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
        + exams_expired
    )

    response = flask.make_response(
        flask.render_template(
            "credentials/your-exams.html",
            agreement_notification=agreement_notification,
            exams=exams,
            show_cred_maintenance_alert=show_cred_maintenance_alert,
            cred_is_in_maintenance=cred_is_in_maintenance,
            cred_maintenance_start=cred_maintenance_start,
            cred_maintenance_end=cred_maintenance_end,
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
                "date": (
                    started_at.strftime("%d %b %Y") if started_at else "N/A"
                ),
                "time": (
                    started_at.strftime("%I:%M %p %Z") if started_at else "N/A"
                ),
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
    email = flask.session["openid"]["email"].lower()

    confidentiality_agreement_enabled = strtobool(
        os.getenv("CREDENTIALS_CONFIDENTIALITY_ENABLED", "false")
    )

    if (
        confidentiality_agreement_enabled
        and not has_filed_confidentiality_agreement(email)
    ):
        return flask.render_template("credentials/exam-no-agreement.html"), 403

    assessment_id = flask.request.args.get("id")
    assessment = trueability_api.get_assessment(assessment_id)

    if assessment.get("error"):
        return flask.abort(404)

    assessment_user = assessment["assessment"]["user"]["email"]
    sso_user = user_info(flask.session)["email"]

    if assessment_user != sso_user:
        return flask.abort(403)

    url = trueability_api.get_assessment_redirect(assessment_id).replace(
        "http://", "https://"
    )
    return flask.render_template("credentials/exam.html", url=url)


@shop_decorator(area="cred", response="html")
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
def cred_shop(ua_contracts_api, advantage_mapper, **kwargs):
    exam_index = 0
    try:
        exam_index = int(flask.request.args.get("exam_index", 0))
    except Exception:
        pass

    exam_index = int(exam_index)
    ua_contracts_api.ensure_purchase_account("canonical-cube")
    account = advantage_mapper.get_purchase_account("canonical-cube")
    if (account.hasChannelStoreAccess) is True:
        return flask.render_template(
            "account/forbidden.html", reason="channel_account"
        )

    exams_file = open("webapp/shop/cred/exams.json", "r")
    exams = json.load(exams_file)
    cue_products = get_cue_products(type="exam").json
    for product in cue_products:
        for exam in exams:
            if product["id"] == exam["id"]:
                exam["longId"] = product["longId"]
                if product["period"] == "none":
                    exam["period"] = "monthly"
                else:
                    exam["period"] = product["period"]
                exam["marketplace"] = product["marketplace"]
                exam["name"] = product["name"]
                exam["periodQuantity"] = product["effectiveDays"]

    # purchase account required for purchasing from marketplace

    return flask.render_template(
        "credentials/shop/index.html",
        exams=exams,
        exam_index=exam_index,
    )


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_manage_shop(**kwargs):
    return flask.render_template(
        "credentials/shop/manage.html",
    )


@shop_decorator(area="cube", permission="user", response="html")
def cred_shop_thank_you(**kwargs):
    quantity = flask.request.args.get("quantity", "")
    product = flask.request.args.get("productName", "")
    return flask.render_template(
        "credentials/shop/thank-you.html", quantity=quantity, product=product
    )


@shop_decorator(area="cube", permission="user", response="html")
@canonical_staff()
def cred_shop_webhook_responses(trueability_api, **kwargs):
    ability_screen_id = "4190"
    if "page" in kwargs:
        page = int(kwargs["page"])
    else:
        page = flask.request.args.get("page", 1)
        page = int(page)

    per_page = flask.request.args.get("per_page", 10)
    per_page = int(per_page)
    ta_results_per_page = 100
    ta_page = math.ceil(page * per_page // ta_results_per_page)

    trueability_session = init_trueability_session("cred")
    trueability_api = get_trueability_api_instance("cred", trueability_session)
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
    page_metadata["total_pages"] = math.ceil(
        webhook_responses["meta"]["total_count"] // per_page
    )
    page_metadata["total_count"] = total_count
    page_metadata["next_page"] = (
        page + 1 if page < page_metadata["total_pages"] else None
    )
    page_metadata["prev_page"] = page - 1 if page > 1 else None

    webhook = {
        "webhook_responses": ta_webhook_responses,
        "meta": page_metadata,
    }

    return flask.render_template(
        "credentials/shop/webhook_responses.html", webhook_responses=webhook
    )


@shop_decorator(area="cube", permission="user", response="html")
def cred_shop_keys(**kwargs):
    products = get_cue_products(type="keys").json
    for item in products:
        if item["id"] == "cue-activation-key":
            cue_key_product = item
            break
    if not cue_key_product:
        return flask.abort(404)

    return flask.render_template(
        "credentials/shop/keys.html", cue_key_product=cue_key_product
    )


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
        message = """Your exam has been activated.
        To schedule your exam, click the Your Exams button."""

        return flask.render_template(
            "/credentials/redeem.html",
            notification_class="positive",
            notification_title="Success",
            notification_message=message,
        )
    except UAContractsAPIErrorView as error:
        activation_response = json.loads(error.response.text).get("message")
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "user_info": user_info(flask.session),
                "request_url": error.request.url,
                "request_headers": error.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
                "activation_response": activation_response,
            }
        )
        return flask.render_template(
            "/credentials/redeem.html",
            notification_class="negative",
            notification_title="Something went wrong",
            notification_message=activation_response,
        )
    except UAContractsUserHasNoAccount as error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "request_url": error.request.url,
                "request_headers": error.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
            }
        )
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
        try:
            contract_keys = ua_contracts_api.list_activation_keys(contract_id)
            if contract_keys:
                keys.extend(contract_keys)
        except Exception as error:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": error.request.url,
                    "request_headers": error.request.headers,
                    "response_headers": error.response.headers,
                    "response_body": error.response.json(),
                }
            )
            continue

    return flask.jsonify(keys)


@shop_decorator(area="cube", permission="user", response="json")
def rotate_activation_key(ua_contracts_api, **kwargs):
    activation_key = kwargs.get("activation_key")
    new_activation_key = ua_contracts_api.rotate_activation_key(
        {"activationKey": activation_key}
    )
    return flask.jsonify(new_activation_key)


@shop_decorator(area="cube", permission="user", response="json")
def activate_activation_key(ua_contracts_api, **kwargs):
    data = flask.request.json
    activation_key = data["activationKey"]
    return ua_contracts_api.activate_activation_key(
        {
            "activationKey": activation_key,
        }
    )


@shop_decorator(area="cube", permission="user", response="json")
def get_activation_key_info(ua_contracts_api, **kwargs):
    activation_key = kwargs.get("key_id")
    return ua_contracts_api.get_activation_key_info(activation_key)


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
@canonical_staff()
def get_webhook_response(trueability_api, **kwargs):
    webhook_id = flask.request.args.get("webhook_id", None)
    webhook_responses = trueability_api.get_webhook_response(
        webhook_id=webhook_id,
    )
    return flask.jsonify(webhook_responses)


@shop_decorator(area="cred", permission="user", response="json")
@credentials_group()
def get_issued_badges(credly_api, **kwargs):
    filter = flask.request.args.get("filter", None)
    sort = flask.request.args.get("sort", None)
    page = flask.request.args.get("page", None)
    badges = credly_api.get_issued_badges(filter, sort, page)
    return flask.jsonify(badges)


@shop_decorator(area="cred", permission="user", response="json")
@credentials_group()
def get_issued_badges_bulk(credly_api, **kwargs):
    filter = flask.request.args.get("filter", None)
    badges = credly_api.get_issued_badges_bulk(filter)
    return flask.jsonify(badges)


@shop_decorator(area="cred", permission="user", response="json")
@credentials_group()
def get_test_taker_stats(trueability_api, **kwargs):
    def get_addresses(assessments: list):
        addresses = []
        for assessment in assessments:
            addresses.append(assessment.get("address", None))
        return addresses

    def fetch_assessments(page: int):
        result = trueability_api.get_assessments(page=page)
        return get_addresses(result["assessments"])

    addresses = []
    assessments = trueability_api.get_assessments()
    meta = assessments["meta"]
    total_pages = meta.get("total_pages", 0)
    pages = range(2, total_pages + 1)
    addresses.extend(get_addresses(assessments["assessments"]))
    with ThreadPoolExecutor(max_workers=5) as thread_pool:
        for data in thread_pool.map(
            fetch_assessments,
            [page for page in pages],
        ):
            addresses.extend(data)

    return flask.jsonify(addresses)


@shop_decorator(area="cred", permission="user", response="json")
@credentials_admin()
def issue_credly_badge(credly_api, **kwargs):
    badge_data = flask.request.json
    try:
        response = credly_api.issue_new_badge(badge_data)
        return flask.jsonify(response)
    except Exception as error:
        return flask.jsonify({"error": error}), 400


@shop_decorator(area="cred", permission="user", response="json")
def get_cred_user_permissions(credly_api, **kwargs):
    sso_user = user_info(flask.session)
    is_credentials_admin = sso_user.get("is_credentials_admin", False)
    is_credentials_support = sso_user.get("is_credentials_support", False)
    return flask.jsonify(
        {
            "is_credentials_admin": is_credentials_admin,
            "is_credentials_support": is_credentials_support,
        }
    )


@shop_decorator(area="cred", permission="user", response="json")
@credentials_admin()
def cancel_scheduled_exam(trueability_api, **kwargs):
    reservation_id = kwargs.get("reservation_id")
    try:
        response = trueability_api.delete_assessment_reservation(
            reservation_id
        )
        if response.get("error", False):
            return (
                flask.jsonify(
                    {"status": "error", "error": response.get("message")}
                ),
                400,
            )
        return flask.jsonify({"status": "success"})
    except Exception as error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "request_url": error.request.url,
                "request_headers": error.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
            }
        )
        return flask.jsonify({"status": "error"}), 500


@shop_decorator(area="cred", permission="user", response="json")
@credentials_admin()
def cred_user_ban(ua_contracts_api, **kwargs):
    method = flask.request.method

    if method == "PUT":
        data = flask.request.json
        sanitized_data = {
            "email": data.get("email", ""),
            "reason": data.get("reason", ""),
            "blocked": data.get("blocked", True),
            "expiresAt": data.get("expiresAt", None),
        }
        resp = ua_contracts_api.put_cue_user_ban(sanitized_data)
        if resp.get("errors", False):
            return flask.jsonify(resp), 400
        return flask.jsonify(resp)
    elif method == "GET":
        resp = ua_contracts_api.get_cue_user_bans()
        return flask.jsonify(resp)


@shop_decorator(area="cred", permission="user", response="html")
def get_my_issued_badges(credly_api, **kwargs):
    sso_user_email = user_info(flask.session)["email"]
    response = credly_api.get_issued_badges(
        filter={"recipient_email": sso_user_email}
    )
    return flask.render_template(
        "credentials/your-badges.html", badges=response["data"]
    )


@shop_decorator(area="cred", response="json")
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


@shop_decorator(area="cred", permission="user", response="json")
def get_cue_products(ua_contracts_api, type, **kwargs):
    listings = ua_contracts_api.get_product_listings("canonical-cube").get(
        "productListings"
    )
    filtered_products = [
        {
            "id": listing.get("productID", ""),
            "longId": listing.get("id", ""),
            "period": listing.get("period", "yearly"),
            "marketplace": listing.get("marketplace", ""),
            "name": listing.get("name", ""),
            "effectiveDays": listing.get("effectiveDays", 365),
            "price": listing.get("price", {"currency": "USD", "value": "0"}),
        }
        for listing in listings
        if (listing["productID"].endswith("key") and type == "keys")
        or (type == "exam")
    ]
    return flask.jsonify(filtered_products)


@shop_decorator(area="cred", permission="user", response="html")
@credentials_group()
def cred_dashboard(trueability_api, **_):
    first_reservations = trueability_api.get_assessment_reservations(
        per_page=10
    )
    last_page = first_reservations["meta"]["total_pages"]
    latest_reservations = trueability_api.get_assessment_reservations(
        page=last_page, per_page=10
    )
    return flask.render_template(
        "credentials/dashboard.html",
        latest_reservations=latest_reservations["assessment_reservations"],
    )


@shop_decorator(area="cred", permission="user", response="json")
@credentials_group()
def cred_dashboard_upcoming_exams(trueability_api, **_):
    per_page = 50
    page = int(flask.request.args.get("page", 1))
    state = flask.request.args.getlist("state[]", None)
    ability_screen_id = flask.request.args.get("ability_screen_id", None)
    sort = flask.request.args.get("sort", None)
    group = flask.request.args.get("group", None)
    upcoming_exams = trueability_api.get_assessment_reservations(
        page=page,
        per_page=per_page,
        state=state,
        ability_screen_id=ability_screen_id,
        sort=sort,
        group=group,
    )
    return flask.jsonify(upcoming_exams)


@shop_decorator(area="cred", permission="user", response="json")
@credentials_admin()
def cred_dashboard_exam_results(trueability_api, **_):
    try:
        per_page = 50
        page = int(flask.request.args.get("page", 1)) - 1
        exam_state = flask.request.args.get("state", None)
        ability_screen_id = flask.request.args.get("ability_screen_id[]", None)
        first_results = trueability_api.get_results(
            per_page=per_page,
            state=exam_state,
            ability_screen_id=ability_screen_id,
        )
        last_page = first_results["meta"]["total_pages"]
        latest_results = trueability_api.get_results(
            page=last_page - page,
            per_page=per_page,
            state=exam_state,
            ability_screen_id=ability_screen_id,
        )
        return flask.jsonify(latest_results)
    except Exception:
        flask.current_app.extensions["sentry"].captureException()
        return flask.jsonify({"error": "Error fetching exam results"}), 500


@shop_decorator(area="cred", permission="user", response="json")
@credentials_group()
def cred_dashboard_system_statuses(trueability_api, ua_contracts_api, **_):
    ta_status = trueability_api.get_system_status()
    contracts_status = {}
    try:
        ua_contracts_api.get_product_listings("canonical-cube")
        contracts_status = {"error": False}
    except Exception:
        contracts_status = {"error": True}
    statuses = {"ta_status": ta_status, "contracts_status": contracts_status}
    return flask.jsonify(statuses)
