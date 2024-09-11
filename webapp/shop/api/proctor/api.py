from typing import List
from urllib.parse import urlencode
from requests import Session
import os
import datetime


class ProctorAPI:
    def __init__(
        self,
        session: Session,
    ):
        self.base_url = os.getenv(
            "PROCTOR360_BASE_URL", "https://api.proctor360.com"
        )
        self.app_id = os.getenv("PROCTOR360_APP_ID", "")
        self.app_secret = os.getenv("PROCTOR360_APP_SECRET", "")
        self.session = session
        self.expires_at = None
        self.token = None

    def make_request(
        self,
        method: str,
        path: str,
        headers: dict = {},
        data: dict = {},
        json: dict = {},
        retry: bool = True,
        allow_redirects: bool = True,
        is_authenticating: bool = False,
    ):
        if (
            (not self.token) or (datetime.datetime.now() > self.expires_at)
        ) and not is_authenticating:
            auth_response = self.authenticate()
            self.token = auth_response["access_token"]
            self.expires_at = datetime.datetime.now() + datetime.timedelta(
                seconds=auth_response["expires_in"]
            )

        uri = f"{self.base_url}{path}"
        headers["Authorization"] = f"Bearer {self.token}"

        response = self.session.request(
            method,
            uri,
            headers=headers,
            data=data,
            json=json,
            allow_redirects=allow_redirects,
        )
        if retry and response.status_code == 401:
            response = self.make_request(
                method,
                path,
                headers=headers,
                data=data,
                json=json,
                retry=False,
            )

        return response

    def authenticate(self):
        uri = "/api/v2/organisations/132/oauth/token"
        body = {
            "app_id": self.app_id,
            "app_secret": self.app_secret,
        }
        response = self.make_request(
            "POST", uri, json=body, retry=False, is_authenticating=True
        )
        return response.json()

    def list_exams(self):
        uri = "/api/v2/exams"
        return self.make_request("GET", uri).json()

    def paginate(self, action, result_list_name=str, **kwargs):
        result = {result_list_name: []}

        page = 1
        while True:
            response = action(page=page, **kwargs)
            result_list = response.get(result_list_name, [])
            result[result_list_name] = result[result_list_name] + result_list

            page = response.get("meta", {}).get("next_page")
            if not page:
                break

        return result

    def get_ability_screens(self):
        uri = "/api/v1/ability_screens"
        return self.make_request("GET", uri).json()

    def update_ability_screen(self):
        pass

    def get_assessment_reservation(self, uuid: str = ""):
        uri = f"/api/v1/assessment_reservations/{uuid}"
        return self.make_request("GET", uri).json()

    def get_assessment_reservations(
        self,
        ability_screen_id: int = None,
        page: int = 1,
        per_page: int = 50,
        sort: str = None,
        group: str = None,
        state: List[str] = None,
        assessment_state: str = None,
    ):
        params = {
            "ability_screen_id": ability_screen_id,
            "page": page,
            "per_page": per_page,
            "sort": sort,
            "group": group,
            "state[]": state,
            "assessment_state[]": assessment_state,
        }
        filtered_params = {k: v for k, v in params.items() if v is not None}
        uri = "/api/v1/assessment_reservations?" + urlencode(
            filtered_params, True
        )
        return self.make_request("GET", uri).json()

    def post_assessment_reservation(
        self,
        ability_screen_id: int,
        starts_at: str,
        email: str,
        first_name: str,
        last_name: str,
        timezone: str,
        country_code: str,
    ):
        uri = "/api/v1/assessment_reservations"
        body = {
            "assessment_reservation": {
                "ability_screen_id": ability_screen_id,
                "starts_at": starts_at,
                "address_attributes": {
                    "country_code": country_code,
                },
            },
            "user": {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "time_zone": timezone,
            },
        }
        return self.make_request("POST", uri, json=body).json()

    def patch_assessment_reservation(
        self, starts_at: str, timezone: str, country_code: str, uuid: str
    ):
        uri = f"/api/v1/assessment_reservations/{uuid}"
        body = {
            "assessment_reservation": {
                "starts_at": starts_at,
                "address_attributes": {
                    "country_code": country_code,
                },
            },
            "user": {"time_zone": timezone},
        }
        return self.make_request("PATCH", uri, json=body).json()

    def delete_assessment_reservation(self, uuid: str):
        uri = f"/api/v1/assessment_reservations/{uuid}"
        return self.make_request("DELETE", uri).json()

    def get_assessments(
        self,
        ability_screen_id: int = None,
        uuid: str = None,
        page: int = 1,
        per_page: int = 500,
    ):
        params = {
            "ability_screen_id": ability_screen_id,
            "uuid": uuid,
            "page": page,
            "per_page": per_page,
        }
        filtered_params = {k: v for k, v in params.items() if v is not None}
        uri = "/api/v1/assessments?" + urlencode(filtered_params)
        return self.make_request("GET", uri).json()

    def get_assessment(self, id: str):
        uri = f"/api/v1/assessments/{id}"
        return self.make_request("GET", uri).json()

    def get_assessment_redirect(self, id: str):
        uri = "/api/v1/assessments/redirect_to_environment" + (
            f"?id={id}" if id else ""
        )
        response = self.make_request("GET", uri, allow_redirects=False)

        if response.status_code == 302 and "Location" in response.headers:
            return response.headers["Location"]

        return None

    def get_results(
        self,
        page: int = 1,
        per_page: int = 50,
        state: str = None,
        ability_screen_id: list = None,
    ):
        params = {
            "state": state,
            "page": page,
            "per_page": per_page,
            "ability_screen_id[]": ability_screen_id,
        }
        filtered_params = {k: v for k, v in params.items() if v is not None}
        uri = "/api/v1/results?" + urlencode(filtered_params)
        return self.make_request("GET", uri).json()

    def get_candidate_access_token_status(self, id: int):
        uri = f"/api/v1/candidate_access_tokens/{id}"
        return self.make_request("GET", uri).json()

    def get_candidate_invitations(
        self, ability_screen_id: int = None, code: str = None
    ):
        uri = (
            "/api/v1/candidate_invitations"
            + (f"/{code}" if code else "")
            + (
                f"?ability_screen_id={ability_screen_id}"
                if ability_screen_id
                else ""
            )
        )
        return self.make_request("GET", uri).json()

    def post_candidate_invitation(
        self,
        ability_screen_id: int,
        email: str,
        first_name: str,
        last_name: str,
        expires_at: str,
    ):
        uri = "/api/v1/candidate_invitations"
        # headers = {"Content-Type": "application/json"}
        body = {
            "candidate_invitation": {
                "ability_screen_id": ability_screen_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "expires_at": expires_at,
            }
        }
        return self.make_request("POST", uri, json=body).json()

    def get_companies(self, hashid: str = None):
        uri = "/api/v1/companies" + (f"/{hashid}" if hashid else "")
        return self.make_request("GET", uri).json()

    def get_webhooks(self, ability_screen_id: int):
        uri = "/api/v1/webhooks" f"?ability_screen_id={ability_screen_id}"
        return self.make_request("GET", uri).json()

    def get_system_status(self):
        uri = "/api/v1/system_status"
        return self.make_request("GET", uri).json()

    def get_webhook_response(self, webhook_id: int):
        uri = f"/api/v1/webhook_responses/{webhook_id}"
        return self.make_request("GET", uri).json()

    def get_filtered_webhook_responses(
        self, ability_screen_id: str = None, page: int = 1
    ):
        uri = (
            f"{self.base_url}"
            "/api/v1/webhook_responses"
            f"?ability_screen_id={ability_screen_id}"
            f"&page={page}"
        )
        headers = {"X-API-KEY": self.api_key}
        response = self.session.request(
            method="GET", url=uri, headers=headers
        ).json()
        return response
