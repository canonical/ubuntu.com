import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

# Assuming the function is in webapp.shop.advantage.views
# Adjust the import path if necessary
from webapp.shop.advantage.views import _prepare_account_highlights
from webapp.shop.api.ua_contracts.primitives import AnnotatedContractItem, Contract, ContractItem

class TestPrepareAccountHighlights(unittest.TestCase):

    def _create_mock_annotated_item(self, product_name, end_date_str, is_expiring):
        item = MagicMock(spec=AnnotatedContractItem)
        item.product_name = product_name
        item.end_date = end_date_str  # Expects ISO format string e.g., "2023-12-31T00:00:00"
        item.is_expiring = is_expiring
        return item

    def _create_mock_contract_item(self, reason, created_at_str):
        item = MagicMock(spec=ContractItem)
        item.reason = reason
        # Expects ISO format string e.g., "2023-12-01T10:00:00"
        item.created_at = created_at_str
        return item

    def _create_mock_contract(self, items_data):
        contract = MagicMock(spec=Contract)
        contract.items = [self._create_mock_contract_item(reason, created_at) for reason, created_at in items_data]
        return contract

    @patch('webapp.shop.advantage.views.datetime')
    def test_empty_input(self, mock_datetime):
        mock_datetime.now.return_value = datetime(2023, 10, 1)
        highlights = _prepare_account_highlights([], [])
        self.assertEqual(highlights, [])

    @patch('webapp.shop.advantage.views.datetime')
    def test_renewal_reminders(self, mock_datetime):
        mock_now = datetime(2023, 10, 15)
        mock_datetime.now.return_value = mock_now

        subs = [
            # Expiring soon (within 60 days)
            self._create_mock_annotated_item("Product A", (mock_now + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%S"), False),
            # Already is_expiring (e.g. grace period)
            self._create_mock_annotated_item("Product B", (mock_now - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S"), True),
            # Expiring much later (more than 60 days)
            self._create_mock_annotated_item("Product C", (mock_now + timedelta(days=90)).strftime("%Y-%m-%dT%H:%M:%S"), False),
            # No end_date
            self._create_mock_annotated_item("Product D", None, False),
             # Expired more than 60 days ago, but is_expiring is True
            self._create_mock_annotated_item("Product E", (mock_now - timedelta(days=70)).strftime("%Y-%m-%dT%H:%M:%S"), True),
        ]
        highlights = _prepare_account_highlights(subs, [])
        self.assertEqual(len(highlights), 3)
        self.assertEqual(highlights[0]["type"], "renewal")
        self.assertEqual(highlights[0]["message"], "Your subscription 'Product A' is expiring on 2023-11-14.")
        self.assertEqual(highlights[0]["date"], "2023-11-14")
        self.assertEqual(highlights[1]["type"], "renewal")
        self.assertEqual(highlights[1]["message"], "Your subscription 'Product E' is expiring on 2023-08-06.")
        self.assertEqual(highlights[1]["date"], "2023-08-06")
        self.assertEqual(highlights[2]["type"], "renewal")
        self.assertEqual(highlights[2]["message"], "Your subscription 'Product B' is expiring on 2023-10-10.")
        self.assertEqual(highlights[2]["date"], "2023-10-10")


    @patch('webapp.shop.advantage.views.datetime')
    def test_recent_plan_changes(self, mock_datetime):
        mock_now = datetime(2023, 10, 15)
        mock_datetime.now.return_value = mock_now

        contracts = [
            self._create_mock_contract([
                # Recent change (within 14 days)
                ("New service added", (mock_now - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")),
                # Older change (more than 14 days)
                ("Plan upgraded", (mock_now - timedelta(days=20)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")),
                # No created_at
                ("Service removed", None)
            ])
        ]
        highlights = _prepare_account_highlights([], contracts)
        self.assertEqual(len(highlights), 1)
        self.assertEqual(highlights[0]["type"], "plan_change")
        self.assertEqual(highlights[0]["message"], "There was an update to your services (New service added) on 2023-10-10.")
        self.assertEqual(highlights[0]["date"], "2023-10-10")

    @patch('webapp.shop.advantage.views.datetime')
    def test_combined_and_sorting(self, mock_datetime):
        mock_now = datetime(2023, 10, 15)
        mock_datetime.now.return_value = mock_now

        subs = [
            self._create_mock_annotated_item("Old Product", (mock_now + timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%S"), False), # Expires 2023-10-25
        ]
        contracts = [
            self._create_mock_contract([
                ("Recent Change 1", (mock_now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")), # Changed 2023-10-14
                ("Recent Change 2", (mock_now - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")) # Changed 2023-09-15 - too old
            ]),
             self._create_mock_contract([
                ("Very Recent Change", (mock_now - timedelta(days=0)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")), # Changed 2023-10-15
            ])
        ]

        highlights = _prepare_account_highlights(subs, contracts)
        self.assertEqual(len(highlights), 3)

        # Expected order:
        # 1. Old Product (renewal) - 2023-10-25
        # 2. Very Recent Change (plan_change) - 2023-10-15
        # 3. Recent Change 1 (plan_change) - 2023-10-14

        self.assertEqual(highlights[0]["type"], "renewal")
        self.assertEqual(highlights[0]["message"], "Your subscription 'Old Product' is expiring on 2023-10-25.")
        self.assertEqual(highlights[0]["date"], "2023-10-25")

        self.assertEqual(highlights[1]["type"], "plan_change")
        self.assertEqual(highlights[1]["message"], "There was an update to your services (Very Recent Change) on 2023-10-15.")
        self.assertEqual(highlights[1]["date"], "2023-10-15")

        self.assertEqual(highlights[2]["type"], "plan_change")
        self.assertEqual(highlights[2]["message"], "There was an update to your services (Recent Change 1) on 2023-10-14.")
        self.assertEqual(highlights[2]["date"], "2023-10-14")

    @patch('webapp.shop.advantage.views.datetime')
    def test_date_parsing_robustness(self, mock_datetime):
        mock_now = datetime(2023, 10, 15)
        mock_datetime.now.return_value = mock_now

        # Test with date strings that might not have 'T' separator if logic changes
        # Current logic splits by 'T' then by '-', so it's somewhat robust
        subs = [
            self._create_mock_annotated_item("Product Date Test", "2023-11-01", True), # No T part
        ]
        # Test with created_at that might not have milliseconds
        contracts = [
             self._create_mock_contract([
                ("Plan Change Date Test", "2023-10-05T10:00:00Z"), # No milliseconds
            ])
        ]

        highlights = _prepare_account_highlights(subs, contracts)
        self.assertEqual(len(highlights), 2)
        self.assertEqual(highlights[0]["date"], "2023-11-01")
        self.assertEqual(highlights[1]["date"], "2023-10-05")


if __name__ == '__main__':
    unittest.main()
