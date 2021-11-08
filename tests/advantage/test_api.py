import unittest
from typing import List, Dict

from tests.advantage.helpers import Session, Response, make_client, get_fixture
from webapp.advantage.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UAContractsUserHasNoAccount,
    CannotCancelLastContractError,
    UnauthorizedError,
    AccessForbiddenError,
)
from webapp.advantage.models import Listing
from webapp.advantage.ua_contracts.primitives import (
    Account,
    Contract,
    Subscription,
    User,
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
                "?productTags=ua,classic,pro,blender"
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
                "?productTags=ua,classic,pro,blender"
            ),
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Contract)

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetContract(unittest.TestCase):
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
                client.get_contract(contract_id="cABbCcdD")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_contract = get_fixture("contract")
        session = Session(
            response=Response(
                status_code=200,
                content=json_contract,
            )
        )

        client = make_client(session)

        response = client.get_contract("cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/contracts/cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP"
            ),
        }

        self.assertEqual(response, json_contract)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_contracts(self):
        json_contract = get_fixture("contract")
        session = Session(
            response=Response(
                status_code=200,
                content=json_contract,
            )
        )
        client = make_client(session, convert_response=True)

        response = client.get_contract("cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/contracts/cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP"
            ),
        }

        self.assertIsInstance(response, Contract)
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


class TestGetCustomerInfo(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (404, False, UAContractsUserHasNoAccount),
            (404, True, UAContractsUserHasNoAccount),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_customer_info(account_id="aABbCcdD")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_customer_info = get_fixture("customer-info")
        session = Session(
            response=Response(
                status_code=200,
                content=json_customer_info,
            )
        )
        client = make_client(session)

        response = client.get_customer_info(account_id="aAaBbCcDdEeFfGg")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(response, json_customer_info)
        self.assertEqual(session.request_kwargs, expected_args)


class TestPutCustomerInfo(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            address = {
                "city": "Lone Done",
                "country": "GB",
                "line1": "Road Street",
                "postal_code": "111000",
                "state": "",
            }

            tax_id = {"type": "eu_vat", "value": "GB 123 1234 14"}

            with self.assertRaises(expected_error) as error:
                client.put_customer_info(
                    account_id="aAaBbCcDdEeFfGg",
                    payment_method_id="pm_abcdef",
                    address=address,
                    name="Joe Doe",
                    tax_id=tax_id,
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_account = get_fixture("account")
        session = Session(
            response=Response(
                status_code=200,
                content=json_account,
            )
        )
        client = make_client(session)

        address = {
            "city": "Lone Done",
            "country": "GB",
            "line1": "Road Street",
            "postal_code": "111000",
            "state": "",
        }

        tax_id = {"type": "eu_vat", "value": "GB 123 1234 14"}

        response = client.put_customer_info(
            account_id="aAaBbCcDdEeFfGg",
            payment_method_id="pm_abcdef",
            address=address,
            name="Joe Doe",
            tax_id=tax_id,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "defaultPaymentMethod": {"Id": "pm_abcdef"},
                "paymentMethodID": "pm_abcdef",
                "address": address,
                "name": "Joe Doe",
                "taxID": tax_id,
            },
            "method": "put",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(response, json_account)
        self.assertEqual(session.request_kwargs, expected_args)


class TestAnonymousCustomerInfo(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            address = {
                "city": "Lone Done",
                "country": "GB",
                "line1": "Road Street",
                "postal_code": "111000",
                "state": "",
            }

            tax_id = {"type": "eu_vat", "value": "GB 123 1234 14"}

            with self.assertRaises(expected_error) as error:
                client.put_anonymous_customer_info(
                    account_id="aAaBbCcDdEeFfGg",
                    address=address,
                    name="Joe Doe",
                    tax_id=tax_id,
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_account = get_fixture("account")
        session = Session(
            response=Response(
                status_code=200,
                content=json_account,
            )
        )
        client = make_client(session)

        address = {
            "city": "Lone Done",
            "country": "GB",
            "line1": "Road Street",
            "postal_code": "111000",
            "state": "",
        }

        tax_id = {"type": "eu_vat", "value": "GB 123 1234 14"}

        response = client.put_anonymous_customer_info(
            account_id="aAaBbCcDdEeFfGg",
            address=address,
            name="Joe Doe",
            tax_id=tax_id,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "address": address,
                "name": "Joe Doe",
                "taxID": tax_id,
            },
            "method": "put",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(response, json_account)
        self.assertEqual(session.request_kwargs, expected_args)


class TestPutPaymentMethod(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.put_payment_method(
                    account_id="aAaBbCcDdEeFfGg",
                    payment_method_id="pm_abcdef",
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_account = get_fixture("account")
        session = Session(
            response=Response(
                status_code=200,
                content=json_account,
            )
        )
        client = make_client(session)

        response = client.put_payment_method(
            account_id="aAaBbCcDdEeFfGg",
            payment_method_id="pm_abcdef",
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "defaultPaymentMethod": {"Id": "pm_abcdef"},
            },
            "method": "put",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(response, json_account)
        self.assertEqual(session.request_kwargs, expected_args)


class TestPostStripeInvoiceId(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "expected error"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.post_stripe_invoice_id(
                    tx_type="purchase",
                    tx_id="pAaBbCcDdEeFfGg",
                    invoice_id="in_aAbBbCcDdEe",
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        client = make_client(session)

        response = client.post_stripe_invoice_id(
            tx_type="purchase",
            tx_id="pAaBbCcDdEeFfGg",
            invoice_id="in_aAbBbCcDdEe",
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "post",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/purchase/pAaBbCcDdEeFfGg/payment/stripe/in_aAbBbCcDdEe"
            ),
        }

        self.assertEqual(response, {})
        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountPurchases(unittest.TestCase):
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
                client.get_account_purchases(account_id="aABbCcdD")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_purchases = get_fixture("purchases")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchases,
            )
        )
        client = make_client(session)

        response = client.get_account_purchases(account_id="aABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aABbCcdD/purchases",
        }

        self.assertEqual(response, json_purchases.get("purchases"))
        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_purchases_filters(self):
        json_purchases = get_fixture("purchases")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchases,
            )
        )
        client = make_client(session)

        response = client.get_account_purchases(
            account_id="aABbCcdD",
            filters={"marketplace": "canonical-ua"},
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/accounts/aABbCcdD"
                "/purchases?marketplace=canonical-ua"
            ),
        }

        self.assertEqual(response, json_purchases.get("purchases"))
        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_purchases_filters_none_values(self):
        json_purchases = get_fixture("purchases")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchases,
            )
        )
        client = make_client(session)

        response = client.get_account_purchases(
            account_id="aABbCcdD",
            filters=None,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aABbCcdD/purchases",
        }

        self.assertEqual(response, json_purchases.get("purchases"))
        self.assertEqual(session.request_kwargs, expected_args)


class TestGetPurchase(unittest.TestCase):
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
                client.get_purchase(purchase_id="pAaAbBbCcDdEe")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_purchase = get_fixture("purchase")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchase,
            )
        )
        client = make_client(session)

        response = client.get_purchase(purchase_id="pAaAbBbCcDdEe")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/purchase/pAaAbBbCcDdEe",
        }

        self.assertEqual(response, json_purchase)
        self.assertEqual(session.request_kwargs, expected_args)


class TestGetPurchaseAccount(unittest.TestCase):
    def test_errors(self):
        cases = [
            (
                401,
                False,
                AccessForbiddenError,
                "user not allowed to purchase on account",
            ),
            (
                401,
                False,
                AccessForbiddenError,
                "user not allowed to purchase on account",
            ),
            (401, False, UAContractsAPIError, "Error message"),
            (401, True, UAContractsAPIErrorView, "Error message"),
            (404, False, UAContractsUserHasNoAccount, "Error message"),
            (404, True, UAContractsUserHasNoAccount, "Error message"),
            (500, False, UAContractsAPIError, "Error message"),
            (500, True, UAContractsAPIErrorView, "Error message"),
        ]

        for code, is_for_view, expected_error, message in cases:
            response_content = {"code": "expected error", "message": message}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_purchase_account("canonical-ua")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_account = get_fixture("account")
        session = Session(
            response=Response(
                status_code=200,
                content=json_account,
            )
        )
        client = make_client(session)

        response = client.get_purchase_account("canonical-ua")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/account",
        }

        self.assertEqual(response, json_account)
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response(self):
        json_account = get_fixture("account")
        session = Session(
            Response(
                status_code=200,
                content=json_account,
            )
        )
        client = make_client(session, convert_response=True)

        response = client.get_purchase_account("canonical-ua")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/account",
        }

        self.assertIsInstance(response, Account)
        self.assertEqual(session.request_kwargs, expected_args)


class TestPurchaseFromMarketplace(unittest.TestCase):
    def test_errors(self):
        default_response_content = {"code": "expected error"}
        cancel_subscription = {
            "code": "bad request",
            "message": (
                "cannot remove all subscription items; "
                "please cancel subscription instead"
            ),
        }
        cases = [
            (400, False, CannotCancelLastContractError, cancel_subscription),
            (400, True, CannotCancelLastContractError, cancel_subscription),
            (401, False, UAContractsAPIError, default_response_content),
            (401, True, UAContractsAPIErrorView, default_response_content),
            (500, False, UAContractsAPIError, default_response_content),
            (500, True, UAContractsAPIErrorView, default_response_content),
        ]

        for code, is_for_view, expected_error, response_content in cases:
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            purchase_request = {
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            }

            with self.assertRaises(expected_error) as error:
                client.purchase_from_marketplace(
                    marketplace="canonical-ua",
                    purchase_request=purchase_request,
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_purchase = get_fixture("purchase")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchase,
            )
        )
        client = make_client(session)

        purchase_request = {
            "accountID": "aAaBbCcDdEeFfGg",
            "purchaseItems": [
                {
                    "productListingID": "lAaBbCcDdEeFfGg",
                    "metric": "active-machines",
                    "value": 5,
                }
            ],
            "previousPurchaseID": "pAaBbCcDdEeFfGg",
        }

        response = client.purchase_from_marketplace(
            marketplace="canonical-ua",
            purchase_request=purchase_request,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": purchase_request,
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/purchase",
        }

        self.assertEqual(response, json_purchase)
        self.assertEqual(session.request_kwargs, expected_args)


class TestPreviewPurchaseFromMarketplace(unittest.TestCase):
    def test_errors(self):
        default_response_content = {"code": "expected error"}
        cancel_subscription = {
            "code": "bad request",
            "message": (
                "cannot remove all subscription items; "
                "please cancel subscription instead"
            ),
        }
        cases = [
            (400, False, CannotCancelLastContractError, cancel_subscription),
            (400, True, CannotCancelLastContractError, cancel_subscription),
            (401, False, UAContractsAPIError, default_response_content),
            (401, True, UAContractsAPIErrorView, default_response_content),
            (500, False, UAContractsAPIError, default_response_content),
            (500, True, UAContractsAPIErrorView, default_response_content),
        ]

        for code, is_for_view, expected_error, response_content in cases:
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            purchase_request = {
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            }

            with self.assertRaises(expected_error) as error:
                client.preview_purchase_from_marketplace(
                    marketplace="canonical-ua",
                    purchase_request=purchase_request,
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_purchase = get_fixture("purchase")
        session = Session(
            response=Response(
                status_code=200,
                content=json_purchase,
            )
        )
        client = make_client(session)

        purchase_request = {
            "accountID": "aAaBbCcDdEeFfGg",
            "purchaseItems": [
                {
                    "productListingID": "lAaBbCcDdEeFfGg",
                    "metric": "active-machines",
                    "value": 5,
                }
            ],
            "previousPurchaseID": "pAaBbCcDdEeFfGg",
        }

        response = client.preview_purchase_from_marketplace(
            marketplace="canonical-ua",
            purchase_request=purchase_request,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": purchase_request,
            "method": "post",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/marketplace/canonical-ua/purchase/preview"
            ),
        }

        self.assertEqual(response, json_purchase)
        self.assertEqual(session.request_kwargs, expected_args)


class TestCancelSubscription(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.cancel_subscription(subscription_id="sAaBbCcDdEeFfGg")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        client = make_client(session)

        response = client.cancel_subscription(
            subscription_id="sAaBbCcDdEeFfGg"
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "delete",
            "params": None,
            "url": "https://1.2.3.4/v1/subscriptions/sAaBbCcDdEeFfGg",
        }

        self.assertEqual(response, {})
        self.assertEqual(session.request_kwargs, expected_args)


class TestPostSubscriptionAutoRenewal(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.post_subscription_auto_renewal(
                    subscription_id="sAaBbCcDdEeFfGg",
                    should_auto_renew=True,
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        client = make_client(session)

        response = client.post_subscription_auto_renewal(
            subscription_id="sAaBbCcDdEeFfGg",
            should_auto_renew=True,
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {"shouldAutoRenew": True},
            "method": "post",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/subscription/sAaBbCcDdEeFfGg/auto-renewal"
            ),
        }

        self.assertEqual(response, {})
        self.assertEqual(session.request_kwargs, expected_args)


class TestEnsurePurchaseAccount(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UnauthorizedError),
            (401, True, UnauthorizedError),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.ensure_purchase_account(
                    email="email@url",
                    account_name="Joe Doe",
                    marketplace="canonical-ua",
                    captcha_value="abcd1234",
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        json_ensure_account = get_fixture("ensured-account")
        session = Session(
            response=Response(
                status_code=200,
                content=json_ensure_account,
            )
        )
        client = make_client(session)

        response = client.ensure_purchase_account(
            email="email@url",
            account_name="Joe Doe",
            marketplace="canonical-ua",
            captcha_value="abcd1234",
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "email": "email@url",
                "accountName": "Joe Doe",
                "recaptchaToken": "abcd1234",
            },
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/account",
        }

        self.assertEqual(response, json_ensure_account)
        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountUsers(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.get_account_users(account_id="aAbBcCdD")

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={
                    "accountInfo": get_fixture("account"),
                    "users": [
                        {
                            "accountInfo": get_fixture("account"),
                            "userInfo": get_fixture("user"),
                        }
                    ],
                },
            )
        )
        client = make_client(session)

        response = client.get_account_users(account_id="aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/users",
        }

        self.assertEqual(response, [get_fixture("user")])
        self.assertEqual(session.request_kwargs, expected_args)

    def test_convert_response_returns_list_of_users(self):
        session = Session(
            Response(
                status_code=200,
                content={
                    "accountInfo": get_fixture("account"),
                    "users": [
                        {
                            "accountInfo": get_fixture("account"),
                            "userInfo": get_fixture("user"),
                        }
                    ],
                },
            )
        )

        client = make_client(session, convert_response=True)

        response = client.get_account_users(account_id="aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/users",
        }

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, User)

        self.assertEqual(session.request_kwargs, expected_args)


class TestPutAccountUserRole(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.put_account_user_role(
                    account_id="aAbBcCdD",
                    user_role_request={},
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        client = make_client(session)

        response = client.put_account_user_role(
            account_id="aAbBcCdD",
            user_role_request={
                "email": "joe.doe@canonical.com",
                "role": "admin",
                "nameHint": "Joe",
            },
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "email": "joe.doe@canonical.com",
                "role": "admin",
                "nameHint": "Joe",
            },
            "method": "put",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/user-role",
        }

        self.assertEqual(response, {})
        self.assertEqual(session.request_kwargs, expected_args)


class TestPutContractEntitlements(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            response_content = {"code": "bad request"}
            response = Response(status_code=code, content=response_content)
            session = Session(response=response)
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error) as error:
                client.put_contract_entitlements(
                    contract_id="cAbBcCdD",
                    entitlements_request={
                        "entitlements": [{"type": "fips", "is_enabled": True}]
                    },
                )

            self.assertEqual(error.exception.response.json(), response_content)

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        client = make_client(session)

        response = client.put_contract_entitlements(
            contract_id="cAbBcCdD",
            entitlements_request={
                "entitlements": [{"type": "fips", "is_enabled": True}]
            },
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {"entitlements": [{"type": "fips", "is_enabled": True}]},
            "method": "put",
            "params": None,
            "url": "https://1.2.3.4/v1/contracts/cAbBcCdD/defaultEnablement",
        }

        self.assertEqual(response, {})
        self.assertEqual(session.request_kwargs, expected_args)
