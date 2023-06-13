from requests.auth import HTTPBasicAuth
from requests import Session
import datetime


class CredlyAPI:
    def __init__(
        self,
        base_url: str,
        org_id: str,
        auth_token: str,
        session: Session,
    ):
        self.base_url = base_url
        self.org_id = org_id
        self.session = session
        self.auth_token = auth_token
        self.badge_template_dict = {
            4190: "3d3a19a1-324c-48fa-aa55-60f66c0dcca6",
            4194: "3d3a19a1-324c-48fa-aa55-60f66c0dcca6",
            4223: "3d3a19a1-324c-48fa-aa55-60f66c0dcca6",
        }

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
        headers["Content-type"] = "application/json"
        auth = HTTPBasicAuth("user", "pass")

        response = self.session.request(
            method,
            uri,
            headers=headers,
            data=data,
            json=json,
            allow_redirects=allow_redirects,
            auth=auth,
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

    def get_issued_badges(self):
        uri = f"/organizations/{self.org_id}/badges"
        return self.make_request("GET", uri).json()

    def issue_new_badge(
        self,
        email: str,
        first_name: str,
        last_name: str,
        ability_screen_id: int,
    ):
        uri = f"/organizations/{self.org_id}/badges"
        body = {
            "recipient_email": email,
            "issued_at": datetime.datetime.now().strftime(
                "%Y-%m-% d %H:%M:%S %z"
            ),
            "badge_template_id": self.badge_template_dict[ability_screen_id],
            "issued_to_first_name": first_name,
            "issued_to_last_name": last_name,
        }
        return self.make_request("POST", uri, json=body).json()
