# __init__.py
import os
from flask import request, g
from .routes import consent_bp
from .client import CookieServiceClient
from .helpers import (
    sync_preferences_cookie,
    check_session_and_redirect,
    set_cookie_for_session_life,
)


class CookieConsent:
    def init_app(
        self,
        app,
        get_cache_func,
        set_cache_func,
        start_health_check=True,
        auto_register_hooks=True,
    ):
        """
        Initializes the cookie consent module.

        :param app: The Flask app object.
        :param get_cache_func: A function that retrieves a value
            from the cache given a key. If the key is not found,
            the function should return None.
        :param set_cache_func: A function that sets a value in the cache
            with a key, value and timeout.
            Signiture: `set_cache_func(key, value, timeout)`
        :param start_health_check: Whether to automatically start the
            health check thread (default: True).
        :param auto_register_hooks: Whether to automatically register
            Flask request hooks (default: True).
        """

        self.get_cache = get_cache_func
        self.set_cache = set_cache_func
        self.start_health_check = start_health_check
        self.auto_register_hooks = auto_register_hooks

        # Set default configuration values for the package
        app.config["COOKIE_SERVICE_API_KEY"] = os.getenv(
            "COOKIE_SERVICE_API_KEY", ""
        )
        app.config.setdefault(
            "CENTRAL_COOKIE_SERVICE_URL", "https://cookies.canonical.com"
        )
        app.config.setdefault("PREFERENCES_COOKIE_EXPIRY_DAYS", 365)

        self.client = CookieServiceClient(
            app, self.get_cache, self.set_cache, self.start_health_check
        )
        app.extensions["cookie_consent_client"] = self.client

        app.register_blueprint(consent_bp, url_prefix="/cookies")

        # Register Flask request hooks automatically if enabled
        if self.auto_register_hooks:
            app.before_request(self._before_request_handler)
            app.after_request(self._after_request_handler)

        # Periodically ping the cookie service to check its health
        if start_health_check:
            self.client.start_health_check_thread()

        return self

    def _before_request_handler(self):
        """
        Before request hook that checks for user session
        and redirects to cookie service if needed.
        """
        # Check health, set flag, and stop processing if service is down
        # Uses flask.g so it resets on every request
        if self.client.is_service_up():
            g.cookies_service_up = True
        else:
            return False

        # Check if we have already redirected to create session
        if request.cookies.get("_cookies_redirect_completed") is not None:
            return

        # Perform session check and and create redirect if needed
        response = check_session_and_redirect()
        print("here")
        # If we got a response (redirect), set flag cookie for this session
        if response:
            set_cookie_for_session_life(
                response, "_cookies_redirect_completed", "true"
            )
            return response

    def _after_request_handler(self, response):
        """
        After request hook that syncs preferences cookie from the service.
        """
        response = sync_preferences_cookie(response)
        return response
