# client.py
import requests
import logging
import threading
import time


logger = logging.getLogger(__name__)


CACHE_KEY_COOKIE_SERVICE_UP = "cookie-service-up"
COOKIE_SERVICE_HEALTHCHECK_PATH = "/api/v1/health"


class CookieServiceClient:
    def __init__(
        self, app, get_cache_func, set_cache_func, start_health_check
    ):
        """
        Initializes the client.

        :param app: The Flask app object.
        :param get_cache_func: The function to call for cache GETs.
        :param set_cache_func: The function to call for cache SETs.
        """
        self.app = app
        self.get_cache = get_cache_func
        self.set_cache = set_cache_func
        self.start_health_check = start_health_check

        self.base_url = app.config.get("CENTRAL_COOKIE_SERVICE_URL")
        self.api_key = app.config.get("COOKIE_SERVICE_API_KEY")
        self.health_url = (
            f"{self.base_url.rstrip('/')}{COOKIE_SERVICE_HEALTHCHECK_PATH}"
        )

        if not self.api_key:
            raise ValueError("Cookie Service API Key is not configured.")

    def _get_auth_headers(self):
        """Builds auth headers."""
        return {"Authorization": f"Bearer {self.api_key}"}

    # Health check functions

    def _ping_service(self):
        """
        Pings the health check endpoint and updates the cache.
        If response time > 1s, consider it down for better UX.
        """
        try:
            response = requests.get(self.health_url, timeout=1)
            is_up = response.status_code == 200
        except Exception:
            is_up = False

        self.set_cache(CACHE_KEY_COOKIE_SERVICE_UP, is_up, 60)

    def start_health_check_thread(self):
        """Starts a background thread to periodically ping the service."""

        def health_check_loop():
            while True:
                self._ping_service()
                time.sleep(15)

        thread = threading.Thread(target=health_check_loop, daemon=True)
        thread.start()

    def is_service_up(self):
        """
        Checks the cache for status of the cookie service.
        Returns False if None found.
        If health checks are disabled, always returns True.
        """
        if self.start_health_check is False:
            return True
        return bool(self.get_cache(CACHE_KEY_COOKIE_SERVICE_UP))

    #  API Call Methods

    def exchange_code_for_uuid(self, code):
        """Exchanges the one-time code for a user_uuid."""
        try:
            url = f"{self.base_url}/api/v1/token"
            response = requests.post(
                url,
                headers=self._get_auth_headers(),
                json={"code": code},
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to exchange code for UUID: {e}")
            return None

    def fetch_preferences(self, user_uuid):
        """Gets preferences from the central service."""
        try:
            url = f"{self.base_url}/api/v1/users/{user_uuid}/preferences"
            response = requests.get(
                url, headers=self._get_auth_headers(), timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch preferences: {e}")
            return None

    def post_preferences(self, user_uuid, preferences):
        """Sets preferences at the central service."""
        try:
            url = f"{self.base_url}/api/v1/users/{user_uuid}/preferences"
            response = requests.post(
                url,
                headers=self._get_auth_headers(),
                json=preferences,
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to post preferences: {e}")
            return None
