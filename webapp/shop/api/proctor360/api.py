from requests import Session
import os
import datetime
from urllib.parse import urlencode
import flask


class Proctor360API:
    def __init__(
        self,
        session: Session,
    ):
        self.base_url = os.getenv(
            "FLASK_PROCTOR360_BASE_URL", "https://prod1ext.proctor360.com"
        )
        self.app_id = os.getenv("FLASK_PROCTOR360_APP_ID", "")
        self.app_secret = os.getenv("FLASK_PROCTOR360_APP_SECRET", "")
        self.session = session
        self.organisation_id = 132
        self.time_zone_ids = []

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
        proctor_data = flask.session.get("proctor360", {})
        token = proctor_data.get("token", None)
        expires_at = proctor_data.get("expires_at", None)

        if expires_at:
            expires_at = datetime.datetime.fromtimestamp(expires_at)

        if expires_at is not None and expires_at < datetime.datetime.now():
            token = None
            expires_at = None

        if (token is None or expires_at is None) and not is_authenticating:
            flask.session["proctor360"] = {}
            try:
                auth_response = self.authenticate()
            except Exception:
                flask.current_app.extensions["sentry"].captureException()

            if auth_response.get("access_token", None) is None:
                raise Exception("Failed to authenticate with Proctor360")
            proctor_data = {
                "token": auth_response["access_token"],
                "expires_at": auth_response["expires_in"],
            }
            flask.session["proctor360"] = proctor_data

        uri = f"{self.base_url}{path}"
        headers["Authorization"] = f"Bearer {token}"

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

    def authenticate(self):
        uri = f"/api/v2/organisations/{self.organisation_id}/oauth/token"
        body = {
            "app_id": self.app_id,
            "app_secret": self.app_secret,
        }
        response = self.make_request(
            "POST", uri, json=body, retry=False, is_authenticating=True
        )
        return response.json()

    def get_system_status(self):
        if not self.app_id or not self.app_secret:
            return {
                "error": True,
                "message": "App ID or App Secret not set",
            }
        uri = "/api/v2/exams"
        response = self.make_request("GET", uri).json()
        status = response.get("status", 200)
        if status == 200:
            return {
                "error": False,
                "message": f"Proctor 360 responded with {status}",
            }
        return {
            "error": True,
            "message": f"Proctor 360 responded with {status}",
        }

    def _create_student(self, student: dict):
        uri = "/api/v2/student"
        required_keys = [
            "first_name",
            "last_name",
            "email",
            "time_zone_id",
            "timezone",
        ]
        optional_keys = ["ext_tenant_id", "ext_student_id"]
        self.__check_keys_exist(required_keys, student)
        data = self._filter_dict_by_keys(
            required_keys + optional_keys, student
        )
        return self.make_request("POST", uri, json=data).json()

    def _update_student(self, student_id: int, student: dict):
        uri = f"/api/v2/student/{student_id}"
        optional_keys = [
            "first_name",
            "last_name",
            "email",
            "ext_tenant_id",
            "ext_student_id",
            "time_zone_id",
            "timezone",
        ]
        data = self._filter_dict_by_keys(optional_keys, student)
        return self.make_request("PATCH", uri, json=data).json()

    def _upsert_student(self, student: dict):
        time_zone_id = self._get_time_zone_id(student["timezone"])
        student["time_zone_id"] = time_zone_id
        data = self.get_student(student["email"])
        if data.get("data", None) is not None:
            student_id = data["data"]["student"]["id"]
            return self._update_student(student_id, student)
        else:
            return self._create_student(student)

    def get_student(self, email: str):
        uri = f"/api/v2/student?email={email}"
        return self.make_request("GET", uri, retry=False).json()

    def get_student_sessions(self, qps: dict):
        uri = "/api/v2/student-sessions"
        accepted_params = [
            "exam_id",
            "student_id",
            "ext_tenant_id",
            "ext_student_id",
            "ext_exam_id",
        ]
        qps = self._filter_dict_by_keys(accepted_params, qps)
        uri = f"{uri}?{urlencode(qps)}"
        return self.make_request("GET", uri).json()

    def create_student_session(self, student_session: dict):
        student = {
            "first_name": student_session["first_name"],
            "last_name": student_session["last_name"],
            "email": student_session["student_email"],
            "timezone": student_session["timezone"],
        }
        self._upsert_student(student)
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
        data = self._filter_dict_by_keys(
            required_keys + optional_keys, student_session
        )
        return self.make_request("POST", uri, json=data).json()

    def update_student_session(self, session_id: str, student_session: dict):
        student = {
            "first_name": student_session["first_name"],
            "last_name": student_session["last_name"],
            "email": student_session["student_email"],
            "timezone": student_session["timezone"],
        }
        self._upsert_student(student)
        uri = f"/api/v2/student-session/{session_id}"
        optional_keys = [
            "exam_id",
            "exam_link",
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
        data = self._filter_dict_by_keys(optional_keys, student_session)
        return self.make_request("PATCH", uri, json=data).json()

    def _get_time_zone_id(self, timezone: str):
        """
        Get the time zone ID for a given time zone string.

        :param timezone: The time zone string.
        :return: The time zone ID if found, otherwise None.
        """
        for tz in self.time_zone_ids:
            if tz["zone_name"] == timezone:
                return tz["zone_id"]
        return None

    def set_time_zone_ids(self):
        """
        Set the time zone IDs for the organisation.
        This method should be called after the class is initialized.
        """
        uri = "/api/v2/timezone"
        response = self.make_request("GET", uri).json()
        self.time_zone_ids = response.get("data", [])

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

    def _filter_dict_by_keys(self, keys, dictionary):
        """
        Return a new dictionary containing only the keys found in
        both the keys list and the dictionary.

        :param keys: List of keys to filter.
        :param dictionary: Dictionary to filter.
        :return: A new dictionary with keys that are present in both the keys
        list and the dictionary.
        """
        return {key: dictionary[key] for key in keys if key in dictionary}
