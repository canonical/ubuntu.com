import inspect
from unittest import TestCase
from unittest.mock import Mock, patch

from flask import Flask

from webapp.shop.api.ua_contracts.api import (
    AccessForbiddenError,
    UAContractsUserHasNoAccount,
)
from webapp.shop.views import get_invoices, invoices_view


class TestInvoices(TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.secret_key = "test"
        self.app.add_url_rule("/account/invoices.json", view_func=get_invoices)
        self.mapper = Mock()
        self.mapper.get_purchase_account.return_value = Mock(id="account-1")

    def test_page_renders_without_fetching_invoices(self):
        with self.app.test_request_context(), patch(
            "webapp.shop.views.flask.render_template"
        ) as render_template:
            inspect.unwrap(invoices_view)(advantage_mapper=self.mapper)

        render_template.assert_called_once_with("account/invoices/index.html")
        self.mapper.get_purchase_account.assert_not_called()
        self.mapper.get_account_purchases.assert_not_called()

    def test_invoices_require_authentication(self):
        response = self.app.test_client().get("/account/invoices.json")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.get_json(), {"error": "authentication required"}
        )

    def test_invoices_are_filtered_and_paginated(self):
        purchases = [
            Mock(
                id=str(index),
                invoice=Mock(status="paid", receipt_url="https://receipt"),
                marketplace="blender",
                items=[],
                status="done",
            )
            for index in range(20)
        ]
        for purchase in purchases:
            purchase.get_formatted_date.return_value = "12 October 2026"
            purchase.get_total.return_value = "100 USD"
        self.mapper.get_account_purchases.return_value = purchases
        self.mapper.get_purchase.side_effect = lambda purchase_id: purchases[
            int(purchase_id)
        ]

        with self.app.test_request_context():
            response = inspect.unwrap(get_invoices)(
                advantage_mapper=self.mapper, marketplace="blender", page=2
            )

        data = response.get_json()
        self.assertEqual(data["accountId"], "account-1")
        self.assertEqual(data["marketplace"], "blender")
        self.assertEqual(data["currentPage"], 2)
        self.assertEqual(data["totalPages"], 2)
        self.assertEqual(len(data["invoices"]), 10)
        self.assertEqual(
            data["invoices"][0],
            {
                "service": "Blender Support",
                "period": None,
                "date": "12 October 2026",
                "invoiceStatus": "paid",
                "purchaseStatus": "done",
                "total": "100 USD",
                "receiptUrl": "https://receipt",
            },
        )
        self.mapper.get_account_purchases.assert_called_once_with(
            account_id="account-1", filters={"marketplace": "blender"}
        )

    def test_no_account_returns_empty_invoices(self):
        self.mapper.get_purchase_account.side_effect = (
            UAContractsUserHasNoAccount(Mock())
        )

        with self.app.test_request_context():
            response = inspect.unwrap(get_invoices)(
                advantage_mapper=self.mapper
            )

        self.assertEqual(
            response.get_json(),
            {
                "accountId": "",
                "invoices": [],
                "marketplace": "",
                "currentPage": 1,
                "totalPages": 1,
            },
        )

    def test_forbidden_account_returns_json(self):
        self.mapper.get_purchase_account.side_effect = AccessForbiddenError(
            Mock()
        )

        with self.app.test_request_context():
            response, status = inspect.unwrap(get_invoices)(
                advantage_mapper=self.mapper
            )

        self.assertEqual(status, 403)
        self.assertEqual(response.get_json(), {"error": "access forbidden"})
