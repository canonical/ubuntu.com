from requests import HTTPError, Session
from urllib.parse import urlencode


class MarketoAPI:
    def __init__(
        self,
        base_url: str,
        client_id: str,
        client_secret: str,
        session: Session,
    ):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.session = session
        self.token = None

    def _authenticate(self):
        auth_url = (
            f"{self.base_url}/identity/oauth/token"
            "?grant_type=client_credentials&"
            f"client_id={self.client_id}&client_secret={self.client_secret}"
        )
        request = self.session.get(auth_url)
        if request.status_code >= 400:
            raise HTTPError(
                f"Marketo identity request failed with status "
                f"{request.status_code}"
            )
        self.token = request.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})

    def request(self, method, url, url_args={}, json=None):
        if not self.token:
            self._authenticate()

        params = urlencode(url_args)
        response = self.session.request(
            method=method,
            url=f"{self.base_url}{url}?{params}",
            json=json,
        )
        if response.status_code in [401, 403]:
            self._authenticate()
            response = self.session.request(
                method=method,
                url=f"{self.base_url}{url}?{params}",
                json=json,
            )
        response.raise_for_status()

        errors = response.json().get("errors")
        if errors and errors[0]["code"] in ["601", "602"]:
            self._authenticate()
            response = self.session.request(
                method=method,
                url=f"{self.base_url}{url}?{params}",
                json=json,
            )
            response.raise_for_status()

        return response

    def submit_form(self, data):
        return self.request(
            "POST", "/rest/v1/leads/submitForm.json", json=data
        )

    def update_leads(self, leads=None):
        data = {
            "action": "createOrUpdate",
            "lookupField": "email",
            "input": leads,
        }
        return self.request("POST", "/rest/v1/leads.json", json=data)

    def get_form_fields(self, id):
        return self.request("GET", f"/rest/asset/v1/form/{id}/fields.json")
