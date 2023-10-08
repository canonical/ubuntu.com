from requests.auth import HTTPBasicAuth
from requests import Session
from datetime import datetime, timezone
from urllib.parse import quote_plus


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
            4190: "d452b185-8eaa-4639-88ad-3afd41029251",
            4194: "d452b185-8eaa-4639-88ad-3afd41029251",
            4223: "d452b185-8eaa-4639-88ad-3afd41029251",
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
        auth = HTTPBasicAuth(self.auth_token, "")
        print(self.auth_token)

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

    def get_issued_badges(self, filter: dict = {}):
        print(filter)
        filter_params = ""
        for k, v in filter.items():
            filter_params += f"{k}::{quote_plus(v)}"
        if filter:
            uri = f"/organizations/{self.org_id}/badges?filter={filter_params}"
        else:
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
            "issued_at": datetime.now(timezone.utc).strftime(
                "%Y-%m-%d %H:%M:%S %z"
            ),
            "badge_template_id": self.badge_template_dict[ability_screen_id],
            "issued_to_first_name": first_name,
            "issued_to_last_name": last_name,
        }
        return self.make_request("POST", uri, json=body).json()
