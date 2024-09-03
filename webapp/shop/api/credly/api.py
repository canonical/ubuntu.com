from requests.auth import HTTPBasicAuth
from requests import Session
from datetime import datetime, timezone


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

    def get_issued_badges(self, filter: dict = None, sort=None, page=None):
        uri = f"/organizations/{self.org_id}/badges"
        if filter or sort or page:
            uri += "?"
            if filter:
                uri += f"filter={filter}"
            if sort:
                uri += f"sort={sort}"
            if page:
                uri += f"page={page}"

        return self.make_request("GET", uri).json()

    def get_issued_badges_bulk(self, filter: dict = None):
        uri = f"/organizations/{self.org_id}/high_volume_issued_badge_search"
        if filter:
            uri += "?"
            if filter:
                uri += f"filter={filter}"

        return self.make_request("GET", uri).json()

    def issue_new_badge(
        self,
        badge_data: dict,
    ):
        uri = f"/organizations/{self.org_id}/badges"
        required_fields = [
            "recipient_email",
            "issued_to_first_name",
            "issued_to_last_name",
            "badge_template_id",
        ]
        for field in required_fields:
            if field not in badge_data:
                raise ValueError(f"Missing required field: {field}")
        clean_badge_data = {
            "recipient_email": badge_data["recipient_email"],
            "issued_to_first_name": badge_data["issued_to_first_name"],
            "issued_to_last_name": badge_data["issued_to_last_name"],
            "badge_template_id": badge_data["badge_template_id"],
        }
        body = {
            **clean_badge_data,
            "issued_at": datetime.now(timezone.utc).strftime(
                "%Y-%m-%d %H:%M:%S %z"
            ),
        }
        return self.make_request("POST", uri, json=body).json()
