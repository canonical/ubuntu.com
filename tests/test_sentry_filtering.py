import unittest
from unittest.mock import patch
import os
import importlib
from werkzeug.exceptions import (
    NotFound,
    Forbidden,
    InternalServerError,
    Unauthorized,
    BadRequest,
    TooManyRequests,
)
from requests.exceptions import HTTPError, RetryError, ConnectionError
import webapp.app
from webapp.app import sentry_before_send
from webapp.security.api import SecurityAPIError


class TestSentryFiltering(unittest.TestCase):
    """
    Test Sentry error filtering logic.
    """

    def test_filter_404(self):
        """
        Test that 404 (Not Found) errors are filtered out.
        """
        hint = {"exc_info": (None, NotFound(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertIsNone(result, "404 errors should be filtered")

    def test_filter_403(self):
        """
        Test that 403 (Forbidden) errors are filtered out.
        """
        hint = {"exc_info": (None, Forbidden(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertIsNone(result, "403 errors should be filtered")

    def test_allow_500(self):
        """
        Test that 500 (Internal Server Error) errors are NOT filtered.
        """
        hint = {"exc_info": (None, InternalServerError(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertEqual(result, event, "500 errors should not be filtered")

    def test_filter_401(self):
        """
        Test that 401 (Unauthorized) errors are filtered out.
        """
        hint = {"exc_info": (None, Unauthorized(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertIsNone(result, "401 errors should be filtered")

    def test_filter_400(self):
        """
        Test that 400 (Bad Request) errors are filtered out.
        """
        hint = {"exc_info": (None, BadRequest(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertIsNone(result, "400 errors should be filtered")

    def test_filter_429(self):
        """
        Test that 429 (Too Many Requests) errors are filtered out.
        """
        hint = {"exc_info": (None, TooManyRequests(), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertIsNone(result, "429 errors should be filtered")

    def test_allow_other_exceptions(self):
        """
        Test that generic exceptions are NOT filtered.
        """
        hint = {"exc_info": (None, Exception("Generic error"), None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertEqual(
            result, event, "Generic exceptions should not be filtered"
        )

    def test_no_exc_info(self):
        """
        Test that events without exception info are passed through.
        """
        hint = {}
        event = {"message": "Some message"}
        result = sentry_before_send(event, hint)
        self.assertEqual(
            result, event, "Events without exc_info should not be filtered"
        )

    def test_retry_error_mostly_filtered(self):
        """
        Test that RetryError events are sampled at ~1%
        (most are filtered).
        """
        hint = {"exc_info": (None, RetryError(), None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.5
            result = sentry_before_send(event, hint)
        self.assertIsNone(result, "RetryError should be filtered at >=0.01")

    def test_retry_error_sometimes_sent(self):
        """
        Test that RetryError events pass through when random < 0.01.
        """
        hint = {"exc_info": (None, RetryError(), None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.001
            result = sentry_before_send(event, hint)
        self.assertEqual(
            result, event, "RetryError should be sent when random < 0.01"
        )

    def test_connection_error_mostly_filtered(self):
        """
        Test that ConnectionError events are sampled at ~1%
        (most are filtered).
        """
        hint = {"exc_info": (None, ConnectionError(), None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.5
            result = sentry_before_send(event, hint)
        self.assertIsNone(
            result, "ConnectionError should be filtered at >=0.01"
        )

    def test_connection_error_sometimes_sent(self):
        """
        Test that ConnectionError events pass through when random < 0.01.
        """
        hint = {"exc_info": (None, ConnectionError(), None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.005
            result = sentry_before_send(event, hint)
        self.assertEqual(
            result,
            event,
            "ConnectionError should be sent when random < 0.01",
        )

    def test_security_api_error_503_mostly_filtered(self):
        """
        Test that SecurityAPIError with status_code=503 is sampled at ~1%
        (most are filtered).
        """
        exc = SecurityAPIError(Exception("upstream timeout"), status_code=503)
        hint = {"exc_info": (None, exc, None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.5
            result = sentry_before_send(event, hint)
        self.assertIsNone(
            result,
            "SecurityAPIError(503) should be filtered at >=0.01",
        )

    def test_security_api_error_503_sometimes_sent(self):
        """
        Test that SecurityAPIError with status_code=503 passes through
        when random < 0.01.
        """
        exc = SecurityAPIError(Exception("upstream timeout"), status_code=503)
        hint = {"exc_info": (None, exc, None)}
        event = {"level": "error"}
        with patch("webapp.app.random") as mock_random:
            mock_random.random.return_value = 0.005
            result = sentry_before_send(event, hint)
        self.assertEqual(
            result,
            event,
            "SecurityAPIError(503) should be sent when random < 0.01",
        )

    def test_security_api_error_500_not_filtered(self):
        """
        Test that SecurityAPIError with default status_code=500
        is NOT sampled.
        """
        exc = SecurityAPIError(Exception("internal error"))
        hint = {"exc_info": (None, exc, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)
        self.assertEqual(
            result,
            event,
            "SecurityAPIError(500) should not be filtered",
        )

    def test_security_api_error_derives_status_from_http_error(self):
        """
        Test that SecurityAPIError derives status_code from
        HTTPError.response.status_code when no explicit status is given.
        """
        from unittest.mock import Mock

        response = Mock()
        response.status_code = 502
        error = HTTPError(response=response)
        exc = SecurityAPIError(error)
        self.assertEqual(exc.status_code, 502)
        self.assertIs(exc.response, response)

    def test_security_api_error_defaults_500_without_response(self):
        """
        Test that SecurityAPIError defaults to 500 when the wrapped
        exception has no response (e.g. RetryError).
        """
        error = RetryError()
        exc = SecurityAPIError(error)
        self.assertEqual(exc.status_code, 500)
        self.assertIsNone(exc.response)

    def test_security_api_error_explicit_status_overrides(self):
        """
        Test that an explicit status_code takes precedence over
        the one on error.response.
        """
        from unittest.mock import Mock

        response = Mock()
        response.status_code = 502
        error = HTTPError(response=response)
        exc = SecurityAPIError(error, status_code=503)
        self.assertEqual(exc.status_code, 503)

    def test_sentry_init_configuration(self):
        """
        Test that sentry_sdk.init is called
        with the correct before_send function.
        """
        with patch("webapp.app.sentry_sdk.init") as mock_init:
            # Set env vars to ensure init is called.
            with patch.dict(
                os.environ,
                {
                    "SENTRY_DSN": "https://key@sentry.io/123",
                    "SECRET_KEY": "test",
                },
            ):
                # Reload webapp.app to trigger the init call
                importlib.reload(webapp.app)

                mock_init.assert_called()
                # Check if before_send was passed in any of the calls
                # (if called multiple times, though it should be once)
                # But module reload might behave weirdly.

                # Check the last call arguments
                call_args = mock_init.call_args[1]
                self.assertIn("before_send", call_args)
                self.assertEqual(
                    call_args["before_send"], webapp.app.sentry_before_send
                )


if __name__ == "__main__":
    unittest.main()
