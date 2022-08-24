import json
import logging
import os
from datetime import datetime, timedelta

from requests import Session


import http.client as http_client

## Uncomment the following to enable request logging
#  http_client.HTTPConnection.debuglevel = 1
#  logging.basicConfig()
#  logging.getLogger().setLevel(logging.DEBUG)
#  requests_log = logging.getLogger("requests.packages.urllib3")
#  requests_log.setLevel(logging.DEBUG)
#  requests_log.propagate = True


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
    ):
        uri = f"{self.base_url}{path}"
        headers["X-API_KEY"] = f"{self.api_key}"

        response = self.session.request(
            method, uri, headers=headers, data=data, json=json
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

    def get_ability_screens(self):
        uri = "/api/v1/ability_screens"
        return self.make_request("GET", uri).json()

    def update_ability_screen(self):
        pass

    def get_assessment_reservations(self, ability_screen_id: int = None):
        uri = "/api/v1/assessment_reservations" + (f"?{ability_screen_id}" if ability_screen_id else "")
        return self.make_request("GET", uri).json()

    def post_assessment_reservation(
        self,
        ability_screen_id: int,
        starts_at: str,
        email: str,
        first_name: str,
        last_name: str,
        timezone: str,
    ):
        uri = "/api/v1/assessment_reservations"
        # headers = {"Content-Type": "application/json"}
        body = {
            "assessment_reservation": {
                "ability_screen_id": ability_screen_id,
                "starts_at": starts_at,
                "additional_time_minutes": 20,
                "address_attributes": {
                    "city": "San Antonio",
                    "country_code": "US",
                    "street_address": "1234 Pecan",
                    "street_address2": "Suite 300",
                    "state": "Texas",
                    "time_zone": "America/Chicago",
                    "zipcode": "78201"
                },
            },
            "user": {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "time_zone": timezone
            }
        }
        return self.make_request("POST", uri, json=body).json()

    def get_assessments(self, uuid: str = None):
        uri = "/api/v1/assessments" + (f"/{uuid}?uuid=true" if uuid else "")
        return self.make_request("GET", uri).json()

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


if __name__ == "__main__":
    session = Session()
    api = TrueAbilityAPI(
        os.getenv("TRUEABILITY_URL", "https://app.trueability.com"),
        os.getenv("TRUEABILITY_API_KEY", ""),
        session,
    )

    ## Uncomment API calls below as needed for testing

    #  print("# Ability screens")
    #  print(json.dumps(api.get_ability_screens(), indent=4))
    #  print()

    #  print("# Assessment reservations")
    #  #  uuid = None
    #  uuid = "228c490b-2742-41f4-b227-47de6e447018"
    #  print(json.dumps(api.get_assessment_reservations(uuid), indent=4))
    #  print()

    #  print("# Assessments")
    #  #  uuid = None
    #  uuid = "ee0e7712-13ea-11ed-8035-0af7ea428473"
    #  print(json.dumps(api.get_assessments(uuid), indent=4))
    #  print()

    #  print("# Results")
    #  #  id = None
    #  id = 112968
    #  print(json.dumps(api.get_results(id), indent=4))
    #  print()

    #  print("# Candidate access token")
    #  print(json.dumps(api.get_candidate_access_token_status(4190), indent=4))
    #  print()

    #  print("# Candidate invitations")
    #  #  print(json.dumps(api.get_candidate_invitations(4190), indent=4))
    #  print(json.dumps(api.get_candidate_invitations(code="ZDk0YmMxOTA"), indent=4))
    #  print()

    #  print("# Invite candidate")
    #  email = "morgan.robertson@canonical.com"
    #  first_name, last_name = "Morgan", "Robertson"
    #  expires_at = (datetime.utcnow() + timedelta(days=1)).isoformat()
    #  print(
    #      json.dumps(
    #          api.post_candidate_invitation(
    #              4190, email, first_name, last_name, expires_at
    #          ),
    #          indent=4,
    #      )
    #  )
    #  print()

    #  print("# Companies")
    #  print(json.dumps(api.get_companies(), indent=4))
    #  print()

    #  print("# Webhooks")
    #  print(json.dumps(api.get_webhooks(4190), indent=4))
    #  print()

    #  print("# System status")
    #  print(json.dumps(api.get_system_status(), indent=4))
    #  print()
