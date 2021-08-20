import unittest
from typing import List, Dict

from tests.advantage.helpers import Session, Response, make_client, get_fixture
from webapp.advantage.api import (
    UAContractsAPIAuthError,
    UAContractsAPIAuthErrorView,
    UAContractsAPIError,
    UAContractsAPIErrorView,
)
from webapp.advantage.models import Listing
from webapp.advantage.primitives import Account, Contract


class TestAPIErrorResponses(unittest.TestCase):
    def test_errors(self):
        api_error_tests = [
            {
                "endpoint": "get_accounts",
                "cases": [
                    (401, False, UAContractsAPIAuthError),
                    (401, True, UAContractsAPIAuthErrorView),
                    (500, False, UAContractsAPIError),
                    (500, True, UAContractsAPIErrorView),
                ],
            },
            {
                "endpoint": "get_account_contracts",
                "cases": [
                    (401, False, UAContractsAPIAuthError),
                    (401, True, UAContractsAPIAuthErrorView),
                    (500, False, UAContractsAPIError),
                    (500, True, UAContractsAPIErrorView),
                ],
            },
            {
                "endpoint": "get_product_listings",
                "cases": [
                    (401, False, UAContractsAPIError),
                    (401, True, UAContractsAPIErrorView),
                    (500, False, UAContractsAPIError),
                    (500, True, UAContractsAPIErrorView),
                ],
            },
        ]

        for api_test in api_error_tests:
            self.try_endpoint(
                api_endpoint=api_test["endpoint"],
                test_cases=api_test["cases"],
            )

    def try_endpoint(self, api_endpoint: str, test_cases: List):
        for code, is_for_view, expected_error in test_cases:
            with self.subTest(code=code, is_for_view=is_for_view):
                response_content = {"code": "expected error"}
                response = Response(status_code=code, content=response_content)
                session = Session(response=response)
                client = make_client(session, is_for_view=is_for_view)

                with self.assertRaises(expected_error) as error:
                    if api_endpoint == "get_accounts":
                        client.get_accounts()
                    if api_endpoint == "get_account_contracts":
                        client.get_account_contracts(account_id="aABbCcdD")
                    if api_endpoint == "get_product_listings":
                        client.get_product_listings(marketplace="canonical-ua")

                self.assertEqual(
                    error.exception.response.json(), response_content
                )


class TestGetAccounts(unittest.TestCase):
    def test_success(self):
        json_accounts = get_fixture("accounts")
        session = Session(
            response=Response(
                status_code=200,
                content={"accounts": json_accounts},
            )
        )
        client = make_client(session)

        response = client.get_accounts()

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts",
        }

        self.assertEqual(response, json_accounts)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_view_as_adds_email(self):
        json_accounts = get_fixture("accounts")
        session = Session(
            Response(
                status_code=200,
                content={"accounts": json_accounts},
            )
        )
        client = make_client(session)

        response = client.get_accounts(email="email@address.abc")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": {"email": "email@address.abc"},
            "url": "https://1.2.3.4/v1/accounts",
        }

        self.assertEqual(response, json_accounts)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_accounts(self):
        json_accounts = get_fixture("accounts")
        session = Session(
            Response(
                status_code=200,
                content={"accounts": json_accounts},
            )
        )
        client = make_client(session, convert_response=True)

        response = client.get_accounts()

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts",
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Account)

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountContracts(unittest.TestCase):
    def test_success(self):
        json_contracts = get_fixture("contracts")
        session = Session(
            response=Response(
                status_code=200,
                content={"contracts": json_contracts},
            )
        )
        client = make_client(session)

        response = client.get_account_contracts("aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/contracts",
        }

        self.assertEqual(response, json_contracts)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_contracts(self):
        json_contracts = get_fixture("contracts")
        session = Session(
            response=Response(
                status_code=200,
                content={"contracts": json_contracts},
            )
        )
        client = make_client(session, convert_response=True)

        response = client.get_account_contracts("aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/contracts",
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Contract)

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetProductListings(unittest.TestCase):
    def test_success(self):
        json_listings = {
            "productListings": get_fixture("product-listings"),
            "products": get_fixture("products"),
        }

        session = Session(
            response=Response(status_code=200, content=json_listings)
        )

        client = make_client(session)

        response = client.get_product_listings(marketplace="canonical-ua")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4"
                "/v1/marketplace/canonical-ua/product-listings"
            ),
        }

        self.assertEqual(response, json_listings)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_contracts(self):
        json_listings = {
            "productListings": get_fixture("product-listings"),
            "products": get_fixture("products"),
        }

        session = Session(
            response=Response(
                status_code=200,
                content=json_listings,
            )
        )

        client = make_client(session, convert_response=True)

        response = client.get_product_listings(marketplace="canonical-ua")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4"
                "/v1/marketplace/canonical-ua/product-listings"
            ),
        }

        self.assertIsInstance(response, Dict)
        for listing in response.values():
            self.assertIsInstance(listing, Listing)

        self.assertEqual(session.request_kwargs, expected_args)
