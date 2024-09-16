from requests import Session
import os
import datetime
from urllib.parse import urlencode
import flask


class ProctorAPI:
    def __init__(
        self,
        session: Session,
    ):
        self.base_url = os.getenv(
            "PROCTOR360_BASE_URL", "https://api.proctor360.com"
        )
        self.app_id = os.getenv("PROCTOR360_APP_ID", "")
        self.app_secret = os.getenv("PROCTOR360_APP_SECRET", "")
        self.session = session
        self.token = None
        self.expires_at = None

    def make_request(
        self,
        method: str,
        path: str,
        headers: dict = {},
        data: dict = {},
        json: dict = {},
        retry: bool = True,
        allow_redirects: bool = True,
        is_authenticating: bool = False,
    ):
        if (
            (not self.token) or (datetime.datetime.now() > self.expires_at)
        ) and not is_authenticating:
            auth_response = self.authenticate()
            self.token = auth_response["access_token"]
            self.expires_at = datetime.datetime.now() + datetime.timedelta(
                seconds=auth_response["expires_in"]
            )

        uri = f"{self.base_url}{path}"
        headers["Authorization"] = f"Bearer {self.token}"

        response = self.session.request(
            method,
            uri,
            headers=headers,
            data=data,
            json=json,
            allow_redirects=allow_redirects,
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

    def __check_keys_exist(self, keys, dictionary):
        """
        Check if all keys in the list are present in the dictionary.

        :param keys: List of keys to check.
        :param dictionary: Dictionary to check against.
        :raises KeyError: If any key is not present in the dictionary.
        """
        missing_keys = set(keys) - dictionary.keys()
        if missing_keys:
            raise KeyError(
                f"The following keys are missing: {', '.join(missing_keys)}"
            )

    def filter_dict_by_keys(self, keys, dictionary):
        """
        Return a new dictionary containing only the keys found in
        both the keys list and the dictionary.

        :param keys: List of keys to filter.
        :param dictionary: Dictionary to filter.
        :return: A new dictionary with keys that are present in both the keys
        list and the dictionary.
        """
        return {key: dictionary[key] for key in keys if key in dictionary}

    def authenticate(self):
        try:
            uri = "/api/v2/organisations/132/oauth/token"
            body = {
                "app_id": self.app_id,
                "app_secret": self.app_secret,
            }
            response = self.make_request(
                "POST", uri, json=body, retry=False, is_authenticating=True
            )
            return response.json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None

    def list_exams(self):
        uri = "/api/v2/exams"
        return self.make_request("GET", uri).json()

    def create_student(self, student: dict):
        try:
            uri = "/api/v2/student"
            required_keys = ["first_name", "last_name", "email"]
            optional_keys = ["ext_tenant_id", "ext_student_id"]
            self.__check_keys_exist(required_keys, student)
            data = self.filter_dict_by_keys(
                required_keys + optional_keys, student
            )
            return self.make_request("POST", uri, json=data).json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None

    def get_student(self, email: str):
        try:
            uri = f"/api/v2/student?email={email}"
            return self.make_request("GET", uri, retry=False).json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None

    def get_or_create_student(self, student: dict):
        response = self.get_student(student["email"])
        if response is None:
            return None
        if response.get("status") == 422:
            return self.create_student(student)
        elif response.get("data", None):
            return response["data"]

    def get_student_sessions(self, qps: dict):
        try:
            uri = "/api/v2/student-sessions"
            accepted_params = [
                "exam_id",
                "student_id",
                "ext_tenant_id",
                "ext_student_id",
                "ext_exam_id",
            ]
            qps = self.filter_dict_by_keys(accepted_params, qps)
            uri = f"{uri}?{urlencode(qps)}"
            return self.make_request("GET", uri).json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None

    def create_student_session(self, student_session: dict):
        try:
            uri = "/api/v2/student-sessions"
            required_keys = [
                "first_name",
                "student_email",
                "exam_date_time",
                "client_exam_id",
                "ext_exam_id",
                "exam_link",
            ]
            optional_keys = ["last_name", "timezone", "ai_enabled"]
            self.__check_keys_exist(required_keys, student_session)
            data = self.filter_dict_by_keys(
                required_keys + optional_keys, student_session
            )
            return self.make_request("POST", uri, json=data).json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None

    def update_student_session(self, session_id: str, student_session: dict):
        try:
            uri = f"/api/v2/student-session/{session_id}"
            optional_keys = [
                "exam_id",
                "exam_date_time",
                "live_proctoring",
                "mobile_camera",
                "fullview_camera",
                "second_id_card",
                "camspin",
                "face_verification",
                "secure_browsing",
                "secure_browsing_id",
                "can_upload_attachment",
            ]
            data = self.filter_dict_by_keys(optional_keys, student_session)
            return self.make_request("PATCH", uri, json=data).json()
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "request_url": flask.request.url,
                    "request_headers": flask.request.headers,
                }
            )
            return None
