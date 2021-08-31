import unittest
from typing import List, Dict

from tests.advantage.helpers import Session, Response, make_client, get_fixture
from webapp.advantage.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
)
from webapp.advantage.models import Listing
from webapp.advantage.ua_contracts.primitives import (
    Account,
    Contract,
    Subscription,
)


class TestGetAccounts(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_accounts()

            self.assertEqual(error.exception.response.json(), response_content)

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
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_account_contracts(account_id="aABbCcdD")

            self.assertEqual(error.exception.response.json(), response_content)

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
            "url": (
                "https://1.2.3.4/v1/accounts/aAbBcCdD/contracts"
                "?productTags=ua&productTags=classic&productTags=pro"
            ),
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
            "url": (
                "https://1.2.3.4/v1/accounts/aAbBcCdD/contracts"
                "?productTags=ua&productTags=classic&productTags=pro"
            ),
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Contract)

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetProductListings(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_product_listings(marketplace="canonical-ua")

            self.assertEqual(error.exception.response.json(), response_content)

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


class TestGetAccountSubscriptions(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_account_subscriptions(
                    account_id="aABbCcdD", marketplace="canonical-ua"
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_subscriptions = get_fixture("subscriptions")
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": json_subscriptions},
            )
        )
        client = make_client(session)

        response = client.get_account_subscriptions(
            account_id="aABbCcdD", marketplace="canonical-ua"
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/accounts/aABbCcdD"
                "/marketplace/canonical-ua/subscriptions"
            ),
        }

        self.assertEqual(response, json_subscriptions)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_subscriptions_filters(self):
        json_subscriptions = get_fixture("subscriptions")
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": json_subscriptions},
            )
        )
        client = make_client(session)

        response = client.get_account_subscriptions(
            account_id="aABbCcdD",
            marketplace="canonical-ua",
            filters={"status": "active", "period": "monthly"},
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/accounts/aABbCcdD"
                "/marketplace/canonical-ua/subscriptions"
                "?status=active&period=monthly"
            ),
        }

        self.assertEqual(response, json_subscriptions)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_subscriptions(self):
        json_subscriptions = get_fixture("subscriptions")
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": json_subscriptions},
            )
        )
        client = make_client(session, convert_response=True)

        response = client.get_account_subscriptions(
            account_id="aABbCcdD",
            marketplace="canonical-ua",
            filters={"status": "active", "period": "monthly"},
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/accounts/aABbCcdD"
                "/marketplace/canonical-ua/subscriptions"
                "?status=active&period=monthly"
            ),
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Subscription)

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetContractToken(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (404, False, UAContractsAPIError),
            (404, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_contract_token(contract_id="cABbCcdD")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"contractToken": "token"},
            )
        )
        client = make_client(session)

        response = client.get_contract_token(contract_id="cABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/contracts/cABbCcdD/token",
        }

        self.assertEqual(response, "token")
        self.assertEqual(session.request_kwargs, expected_args)

    def test_success_returns_none(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"no-token": ""},
            )
        )
        client = make_client(session)

        response = client.get_contract_token(contract_id="cABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/contracts/cABbCcdD/token",
        }

        self.assertEqual(response, None)
        self.assertEqual(session.request_kwargs, expected_args)
