import time
from requests import Session
from requests.adapters import HTTPAdapter
from urllib.parse import urlencode
from urllib3.util.retry import Retry

# (connect, read) timeout for every call. A submission makes two calls, so
# both have to fit inside the gunicorn worker timeout, retries included.
REQUEST_TIMEOUT = (3, 10)

# Token expired or revoked
AUTH_ERROR_CODES = ("601", "602")

# Rate limit, API unavailable, concurrency limit. See
# https://experienceleague.adobe.com/en/docs/marketo-developer/marketo/rest/error-codes
THROTTLE_ERROR_CODES = ("606", "608", "615")

# Seconds to wait before each replay of a throttled request
THROTTLE_BACKOFF = (1, 3)


class MarketoAPIError(Exception):
    """Marketo answered with something we cannot use."""


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

        # Pooled connections go stale, so retry dropped ones on any method.
        # Only replay 5xx for GET: a POST may already have created a lead.
        retries = Retry(
            total=2,
            connect=2,
            read=False,
            status=2,
            status_forcelist=(502, 503, 504),
            allowed_methods=frozenset(["GET"]),
            backoff_factor=0.5,
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_maxsize=20)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def _parse_json(self, response, context):
        """Report an HTML error page or empty body as a MarketoAPIError."""
        try:
            return response.json()
        except ValueError:
            raise MarketoAPIError(
                f"Non-JSON response from {context} "
                f"(status {response.status_code}): {response.text[:200]}"
            )

    @staticmethod
    def _error_code(data):
        """First Marketo error code, or None when there are no errors."""
        errors = data.get("errors") if isinstance(data, dict) else None

        if not isinstance(errors, list) or not errors:
            return None

        if not isinstance(errors[0], dict):
            return None

        return str(errors[0].get("code", ""))

    def _authenticate(self):
        auth_url = (
            f"{self.base_url}/identity/oauth/token"
            "?grant_type=client_credentials&"
            f"client_id={self.client_id}&client_secret={self.client_secret}"
        )
        response = self.session.get(auth_url, timeout=REQUEST_TIMEOUT)
        data = self._parse_json(response, "the token endpoint")
        token = data.get("access_token")

        if not token:
            # Credentials rejected or throttled
            raise MarketoAPIError(
                "No access token returned by Marketo (status "
                f"{response.status_code}): {data.get('error')} - "
                f"{data.get('error_description')}"
            )

        self.token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def request(self, method, url, url_args={}, json=None):
        if not self.token:
            self._authenticate()

        params = urlencode(url_args)
        reauthenticated = False
        throttle_retries = 0

        while True:
            response = self.session.request(
                method=method,
                url=f"{self.base_url}{url}?{params}",
                json=json,
                timeout=REQUEST_TIMEOUT,
            )
            code = self._error_code(self._parse_json(response, url))

            if code in AUTH_ERROR_CODES and not reauthenticated:
                reauthenticated = True
                self._authenticate()
                continue

            throttled = code in THROTTLE_ERROR_CODES
            if throttled and throttle_retries < len(THROTTLE_BACKOFF):
                time.sleep(THROTTLE_BACKOFF[throttle_retries])
                throttle_retries += 1
                continue

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
