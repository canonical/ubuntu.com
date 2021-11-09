from urllib.parse import quote
from requests import Session


class BadgrAPI:
    def __init__(
        self, base_url: str, username: str, password: str, session: Session
    ):
        self.base_url = base_url
        self.username = username
        self.password = password
        self.session = session
        self.token = None

    def make_request(
        self,
        method: str,
        path: str,
        headers: dict = {},
        data: dict = {},
        retry: bool = True,
    ):
        uri = f"{self.base_url}{path}"
        headers["Authorization"] = f"Bearer {self.token}"

        response = self.session.request(
            method, uri, data=data, headers=headers
        )

        if retry and response.status_code == 401:
            self._authenticate()
            response = self.make_request(
                method, path, data=data, headers=headers, retry=False
            )

        return response

    def _authenticate(self):
        uri = f"{self.base_url}/o/token"

        data = {"username": self.username, "password": self.password}

        response = self.session.post(uri, data=data).json()
        print("Over here")
        print(response)
        self.token = response["access_token"]

    def get_assertions(self, issuer: str, email: str):
        uri = f"/v2/issuers/{issuer}/assertions?recipient={email}"
        return self.make_request("GET", uri).json()


class EdxAPI:
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

    def make_request(
        self,
        method: str,
        path: str,
        headers: dict = {},
        data: dict = {},
        retry: bool = True,
    ):
        uri = f"{self.base_url}{path}"
        headers["Authorization"] = f"JWT {self.token}"

        response = self.session.request(
            method, uri, data=data, headers=headers
        )

        if retry and response.status_code == 401:
            self._authenticate()
            response = self.make_request(
                method, path, data=data, headers=headers, retry=False
            )

        return response

    def _authenticate(self):
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials",
            "token_type": "jwt",
        }

        response = self.make_request(
            method="POST", path="/oauth2/access_token", data=data, retry=False
        ).json()

        print("Over here")
        print(response)
        self.token = response["access_token"]

    def get_course_attempts(self, course_id: str, username: str):
        uri = (
            "/api/edx_proctoring/v1/proctored_exam/attempt/course_id/"
            f"{course_id}/search/{username}"
            "?page_size=100"
        )
        return self.make_request(
            "GET",
            uri,
        ).json()

    def get_enrollments(self, username: str):
        uri = (
            "/api/enrollment/v1/enrollment"
            f"?user={username}"
            "&page_size=100"
        )
        return self.make_request(
            "GET",
            uri,
        ).json()

    def get_user(self, email: str):
        safe_email = quote(email)
        response = self.make_request(
            "GET", f"/api/user/v1/accounts?email={safe_email}"
        )

        if not response.ok:
            return None

        data = response.json()
        return data[0]
