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
import webapp.app
from webapp.app import sentry_before_send
from urllib3.exceptions import MaxRetryError
from requests.exceptions import (
    RetryError,
    ConnectionError as RequestsConnectionError,
)


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

    @patch("webapp.app.random.random")
    def test_sample_security_api_retry_error_drops_95_percent(
        self, mock_random
    ):
        """
        Test that RetryError from security API is sampled at 5% (95% dropped).
        """
        # Mock random to return > 0.05, so error should be dropped
        mock_random.return_value = 0.96

        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /security/cves/CVE-2025-1234.json "
            "(Caused by ResponseError('too many 504 error responses'))",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertIsNone(
            result, "95% of security API RetryErrors should be dropped"
        )

    @patch("webapp.app.random.random")
    def test_sample_security_api_retry_error_keeps_5_percent(
        self, mock_random
    ):
        """
        Test that RetryError from security API keeps 5% of errors.
        """
        # Mock random to return <= 0.05, so error should be kept
        mock_random.return_value = 0.04

        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /security/notices/USN-1234-1.json"
            "(Caused by ResponseError('too many 503 error responses'))",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertEqual(
            result, event, "5% of security API RetryErrors should be kept"
        )

    @patch("webapp.app.random.random")
    def test_security_api_retry_error_with_502(self, mock_random):
        """
        Test that 502 errors from security API are sampled.
        """
        mock_random.return_value = 0.96

        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /security/releases.json "
            "(Caused by ResponseError('too many 502 error responses'))",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertIsNone(
            result, "502 errors from security API should be sampled"
        )

    def test_retry_error_non_security_api_not_filtered(self):
        """
        Test that RetryError from non-security API endpoints are NOT filtered.
        """
        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /advantage/api/something.json "
            "(Caused by ResponseError('too many 504 error responses'))",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertEqual(
            result, event, "Non-security API errors should not be filtered"
        )

    def test_retry_error_security_api_non_targeted_status_not_filtered(self):
        """
        Test that RetryError from security API with
        non-500/502/503/504 errors are NOT filtered.
        """
        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /security/cves.json "
            "(Caused by ResponseError('too many 501 error responses'))",
        )  # 501 not in our target list

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertEqual(
            result,
            event,
            "Security API errors with 501 should not be filtered",
        )

    def test_retry_error_security_api_connection_timeout_not_filtered(self):
        """
        Test that RetryError from security API
        without status code in message are NOT filtered.
        """
        mock_error = RetryError()
        mock_error.args = (
            "Max retries exceeded with url: /security/cves.json "
            "(Caused by ConnectionError('connection timeout'))",
        )  # No status code in message

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertEqual(
            result,
            event,
            "Security API errors without target status "
            "codes should not be filtered",
        )

    @patch("webapp.app.random.random")
    def test_max_retry_error_also_sampled(self, mock_random):
        """
        Test that urllib3.exceptions.MaxRetryError
        is also sampled (unwrapped exception).
        """
        mock_random.return_value = 0.96

        # Create a MaxRetryError
        mock_error = MaxRetryError(
            pool=None,
            url="/security/page/notices.json",
            reason="too many 504 error responses",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertIsNone(
            result, "urllib3.exceptions.MaxRetryError should also be sampled"
        )

    @patch("webapp.app.random.random")
    def test_requests_connection_error_also_sampled(self, mock_random):
        """
        Test that requests.exceptions.ConnectionError
        is also sampled if from security API.
        """
        mock_random.return_value = 0.96

        mock_error = RequestsConnectionError()
        mock_error.args = (
            "HTTPSConnectionPool(host='ubuntu.com', port=443): ",
            "Max retries exceeded with url: /security/cves/CVE-123.json ",
            "(Caused by ResponseError('too many 503 error responses'))",
        )

        hint = {"exc_info": (None, mock_error, None)}
        event = {"level": "error"}
        result = sentry_before_send(event, hint)

        self.assertIsNone(
            result,
            "requests.exceptions.ConnectionError should also be sampled",
        )


if __name__ == "__main__":
    unittest.main()
