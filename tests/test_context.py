from unittest import TestCase
from unittest.mock import MagicMock, patch
from webapp.context import get_careers_role_counts, schedule_banner


class TestContextFunctions(TestCase):
    def test_schedule_banner(self):
        """
        Test schedule banner should return True
        if provided dates are within the timeframe
        """

        # Case 1: dates passed, banner should be down
        self.assertFalse(schedule_banner("2021-02-28", "2022-02-28"))

        # Case 2: dates did not pass, banner should be up
        self.assertTrue(schedule_banner("2023-02-28", "2100-02-28"))


class TestGetCareersRoleCounts(TestCase):
    MOCK_RESPONSE = [
        {
            "slug": "engineering",
            "count": 163,
            "name": "Engineering",
            "icon": "eng.svg",
        },
        {
            "slug": "marketing",
            "count": 15,
            "name": "Marketing",
            "icon": "mkt.svg",
        },
        {"slug": "legal", "count": 1, "name": "Legal", "icon": "legal.svg"},
    ]

    @patch("webapp.context.api_session")
    def test_returns_slug_to_count_mapping(self, mock_session):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = [
            {
                "slug": "engineering",
                "count": 163,
                "name": "Engineering",
                "icon": "eng.svg",
            },
            {
                "slug": "marketing",
                "count": 15,
                "name": "Marketing",
                "icon": "mkt.svg",
            },
        ]
        mock_session.get.return_value = mock_response

        result = get_careers_role_counts()

        self.assertEqual(result, {"engineering": 163, "marketing": 15})
        mock_session.get.assert_called_once_with(
            "https://canonical.com/careers/roles.json", timeout=10
        )

    @patch("webapp.context.api_session")
    def test_returns_empty_dict_on_network_error(self, mock_session):
        import requests as req

        mock_session.get.side_effect = req.exceptions.RequestException(
            "connection error"
        )

        result = get_careers_role_counts()

        self.assertEqual(result, {})

    @patch("webapp.context.api_session")
    def test_returns_empty_dict_on_http_error(self, mock_session):
        import requests as req

        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = req.exceptions.HTTPError(
            "503 Server Error"
        )
        mock_session.get.return_value = mock_response

        result = get_careers_role_counts()

        self.assertEqual(result, {})

    @patch("webapp.context.api_session")
    def test_returns_empty_dict_on_invalid_json(self, mock_session):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.side_effect = ValueError("no JSON")
        mock_session.get.return_value = mock_response

        result = get_careers_role_counts()

        self.assertEqual(result, {})

    @patch("webapp.context.api_session")
    def test_returns_empty_dict_on_missing_key(self, mock_session):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = [{"name": "Engineering"}]
        mock_session.get.return_value = mock_response

        result = get_careers_role_counts()

        self.assertEqual(result, {})

    @patch("webapp.context.api_session")
    def test_returns_empty_dict_on_empty_response(self, mock_session):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = []
        mock_session.get.return_value = mock_response

        result = get_careers_role_counts()

        self.assertEqual(result, {})
