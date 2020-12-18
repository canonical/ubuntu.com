import urllib
from requests import Session


class CubeEdxAPI:
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

        self.token = response["access_token"]

    def get_courses(self, organization: str):
        uri = (
            "/api/courses/v1/courses"
            "?username=webteam%40canonical.com"
            f"&org={organization}"
            "&page_size=100"
        )
        return self.make_request("GET", uri).json()

    def get_course_grades(self, course_id: str, username: str):
        course_id = urllib.parse.quote_plus(course_id)
        uri = (
            f"/api/grades/v1/courses/{course_id}"
            f"?username={username}"
            "&page_size=100"
        )
        return self.make_request("GET", uri).json()

    def get_course_gradebook(self, course_id: str, username: str):
        course_id = urllib.parse.quote_plus(course_id)
        uri = (
            f"/api/grades/v1/gradebook/{course_id}"
            f"?username={username}"
            "&page_size=100"
        )
        return self.make_request("GET", uri).json()

    def get_enrollments(self, username: str):
        uri = (
            "/api/enrollment/v1/enrollments"
            f"?username={username}"
            "&page_size=100"
        )
        return self.make_request(
            "GET",
            uri,
        ).json()

    def get_user(self, email: str):
        return self.make_request(
            "GET", f"/api/user/v1/accounts?email={email}"
        ).json()
