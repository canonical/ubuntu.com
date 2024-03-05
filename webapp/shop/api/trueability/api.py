from urllib.parse import urlencode
from requests import Session


class TrueAbilityAPI:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        session: Session,
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.session = session

    def make_request(
        self,
        method: str,
        path: str,
        headers: dict = {},
        data: dict = {},
        json: dict = {},
        retry: bool = True,
        allow_redirects: bool = True,
    ):
        uri = f"{self.base_url}{path}"
        headers["X-API-KEY"] = f"{self.api_key}"

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
        uri = f"/api/v1//assessment_reservations/{uuid}"
        return self.make_request("GET", uri).json()

    def get_assessment_reservations(
        self, ability_screen_id: int = None, page: int = 1, per_page: int = 500
    ):
        params = {
            "ability_screen_id": ability_screen_id,
            "page": page,
            "per_page": per_page,
        }
        filtered_params = {k: v for k, v in params.items() if v is not None}
        uri = "/api/v1/assessment_reservations?" + urlencode(filtered_params)
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

    def get_results(self, id: int = None):
        uri = "/api/v1/results" + (f"/{id}" if id else "")
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
