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
        self.token = response["access_token"]

    def get_assertions(self, issuer: str, email: str):
        uri = f"/v2/issuers/{issuer}/assertions?recipient={email}"
        return self.make_request("GET", uri).json()
