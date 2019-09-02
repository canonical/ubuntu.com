import os
from webapp import api
from webapp.api.exceptions import ApiResponseError, ApiResponseDecodeError

api_session = api.requests.Session(timeout=(0.5, 6))

DASHBOARD_API = os.getenv(
    "DASHBOARD_API",
    "https://contracts.canonical.com/v1/canonical-sso-macaroon",
)

LOGIN_URL = os.getenv("LOGIN_URL", "https://login.ubuntu.com")


HEADERS = {
    "Accept": "application/json, application/hal+json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
}


def process_response(response):
    if not response.ok:
        raise ApiResponseError("Unknown error from api", response.status_code)

    try:
        body = response.json()
    except ValueError as decode_error:
        api_error_exception = ApiResponseDecodeError(
            "JSON decoding failed: {}".format(decode_error)
        )
        raise api_error_exception

    return body


def post_macaroon(json):
    url = "".join([DASHBOARD_API, "acl/"])
    response = api_session.post(url=url, headers=HEADERS, json=json)

    return process_response(response)


def get_refreshed_discharge(json):
    url = "".join([LOGIN_URL, "/api/v2/tokens/refresh"])
    response = api_session.post(url=url, headers=HEADERS, json=json)

    return process_response(response)
