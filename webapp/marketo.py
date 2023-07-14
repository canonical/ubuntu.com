from requests import Session
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
        self.token = request.json()["access_token"]

    def request(self, method, url, url_args={}, json=None):
        if not self.token:
            self._authenticate()

        params = urlencode(url_args)
        response = self.session.request(
            method=method,
            url=f"{self.base_url}{url}?access_token={self.token}&{params}",
            json=json,
        )

        errors = response.json().get("errors")
        if errors and errors[0]["code"] in ["601", "602"]:
            self._authenticate()
            response = self.session.request(
                method=method,
                url=f"{self.base_url}{url}?access_token={self.token}&{params}",
                json=json,
            )

        return response

    def submit_form(self, data):
        return self.request(
            "POST", "/rest/v1/leads/submitForm.json", json=data
        )

    def describe_leads(self):
        return self.request("GET", "/rest/v1/leads/describe.json")

    def get_lead(self, id_):
        return self.request("GET", f"/rest/v1/leads/{id_}.json")

    def update_leads(self, leads=None):
        data = {
            "action": "createOrUpdate",
            "lookupField": "email",
            "input": leads,
        }
        return self.request("POST", "/rest/v1/leads.json", json=data)
