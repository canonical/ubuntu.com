from urllib.parse import urlencode

import sentry_sdk
from requests import HTTPError, RequestException, Session


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
        # Don't retain HTTP breadcrumbs or exceptions containing the secret.
        with sentry_sdk.isolation_scope():
            try:
                response = self.session.get(
                    f"{self.base_url}/identity/oauth/token",
                    params={
                        "grant_type": "client_credentials",
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                )
            except RequestException as error:
                raise RequestException(
                    f"Marketo identity request failed: {type(error).__name__}"
                ) from None

        if response.status_code >= 400:
            raise HTTPError(
                f"Marketo identity request failed with status "
                f"{response.status_code}",
                response=response,
            )
        self.token = response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})

    def request(self, method, url, url_args={}, json=None):
        if not self.token:
            self._authenticate()

        params = urlencode(url_args)

        def do_request():
            return self.session.request(
                method=method,
                url=f"{self.base_url}{url}?{params}",
                json=json,
            )

        response = do_request()
        if response.status_code not in (401, 403):
            response.raise_for_status()
            errors = response.json().get("errors")
            if not errors or errors[0]["code"] not in ("601", "602"):
                return response

        self._authenticate()
        response = do_request()
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
