import unittest

from tests.shop.advantage.helpers import (
    Session,
    Response,
    make_client,
    get_fixture,
)
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UAContractsUserHasNoAccount,
    UnauthorizedError,
    UnauthorizedErrorView,
    AccessForbiddenError,
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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_accounts()

    def test_success(self):
        json_accounts = get_fixture("accounts")
        session = Session(
            response=Response(
                status_code=200,
                content={"accounts": json_accounts},
            )
        )
        make_client(session).get_accounts()

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts",
        }

        self.assertEqual(session.request_kwargs, expected_args)

    def test_view_as_adds_email(self):
        session = Session(
            Response(
                status_code=200,
                content={"accounts": get_fixture("accounts")},
            )
        )
        make_client(session).get_accounts(email="email@address.abc")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": {"email": "email@address.abc"},
            "url": "https://1.2.3.4/v1/accounts",
        }

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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_account_contracts(account_id="aABbCcdD")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"contracts": get_fixture("contracts")},
            )
        )

        make_client(session).get_account_contracts("aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/accounts/aAbBcCdD/contracts"
                "?productTags=ua,classic,pro,blender"
                "&include-active-machines=false"
            ),
        }

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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_contract(contract_id="cABbCcdD")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("contract"),
            )
        )

        make_client(session).get_contract("cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": (
                "https://1.2.3.4/v1/contracts/cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP"
            ),
        }

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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_product_listings(marketplace="canonical-ua")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={
                    "productListings": get_fixture("product-listings"),
                    "products": get_fixture("products"),
                },
            )
        )

        make_client(session).get_product_listings(marketplace="canonical-ua")

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

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountSubscriptions(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UnauthorizedError),
            (401, True, UnauthorizedErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_account_subscriptions(
                    account_id="aABbCcdD", marketplace="canonical-ua"
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": get_fixture("subscriptions")},
            )
        )
        make_client(session).get_account_subscriptions(
            account_id="aABbCcdD", marketplace="canonical-ua", filters=""
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

        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_subscriptions_filters(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": get_fixture("subscriptions")},
            )
        )
        make_client(session).get_account_subscriptions(
            account_id="aABbCcdD",
            marketplace="canonical-ua",
            filters="?status=active&period=monthly",
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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_contract_token(contract_id="cABbCcdD")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"contractToken": "token"},
            )
        )
        make_client(session).get_contract_token(contract_id="cABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/contracts/cABbCcdD/token",
        }

        self.assertEqual(session.request_kwargs, expected_args)

    def test_success_returns_none(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"no-token": ""},
            )
        )
        make_client(session).get_contract_token(contract_id="cABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/contracts/cABbCcdD/token",
        }

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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_customer_info(account_id="aABbCcdD")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("customer-info"),
            )
        )
        make_client(session).get_customer_info(account_id="aAaBbCcDdEeFfGg")

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

        self.assertEqual(session.request_kwargs, expected_args)


class TestPutCustomerInfo(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.put_customer_info(
                    account_id="aAaBbCcDdEeFfGg",
                    payment_method_id="pm_abcdef",
                    address={
                        "city": "Lone Done",
                        "country": "GB",
                        "line1": "Road Street",
                        "postal_code": "111000",
                        "state": "",
                    },
                    name="Joe Doe",
                    tax_id={"type": "eu_vat", "value": "GB 123 1234 14"},
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("account"),
            )
        )
        make_client(session).put_customer_info(
            account_id="aAaBbCcDdEeFfGg",
            payment_method_id="pm_abcdef",
            address={
                "city": "Lone Done",
                "country": "GB",
                "line1": "Road Street",
                "postal_code": "111000",
                "state": "",
            },
            name="Joe Doe",
            tax_id={"type": "eu_vat", "value": "GB 123 1234 14"},
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "defaultPaymentMethod": {"Id": "pm_abcdef"},
                "paymentMethodID": "pm_abcdef",
                "address": {
                    "city": "Lone Done",
                    "country": "GB",
                    "line1": "Road Street",
                    "postal_code": "111000",
                    "state": "",
                },
                "name": "Joe Doe",
                "taxID": {"type": "eu_vat", "value": "GB 123 1234 14"},
            },
            "method": "put",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestAnonymousCustomerInfo(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.put_anonymous_customer_info(
                    account_id="aAaBbCcDdEeFfGg",
                    address={
                        "city": "Lone Done",
                        "country": "GB",
                        "line1": "Road Street",
                        "postal_code": "111000",
                        "state": "",
                    },
                    name="Joe Doe",
                    tax_id={"type": "eu_vat", "value": "GB 123 1234 14"},
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("account"),
            )
        )
        make_client(session).put_anonymous_customer_info(
            account_id="aAaBbCcDdEeFfGg",
            address={
                "city": "Lone Done",
                "country": "GB",
                "line1": "Road Street",
                "postal_code": "111000",
                "state": "",
            },
            name="Joe Doe",
            tax_id={"type": "eu_vat", "value": "GB 123 1234 14"},
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "address": {
                    "city": "Lone Done",
                    "country": "GB",
                    "line1": "Road Street",
                    "postal_code": "111000",
                    "state": "",
                },
                "name": "Joe Doe",
                "taxID": {"type": "eu_vat", "value": "GB 123 1234 14"},
            },
            "method": "put",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/accounts/aAaBbCcDdEeFfGg/customer-info/stripe"
            ),
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestPutPaymentMethod(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.put_payment_method(
                    account_id="aAaBbCcDdEeFfGg",
                    payment_method_id="pm_abcdef",
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("account"),
            )
        )
        make_client(session).put_payment_method(
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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_account_purchases(account_id="aABbCcdD")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchases"),
            )
        )
        make_client(session).get_account_purchases(account_id="aABbCcdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aABbCcdD/purchases",
        }

        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_purchases_filters(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchases"),
            )
        )
        make_client(session).get_account_purchases(
            account_id="aABbCcdD",
            filters="?marketplace=canonical-ua",
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

        self.assertEqual(session.request_kwargs, expected_args)

    def test_account_purchases_filters_none_values(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchases"),
            )
        )
        make_client(session).get_account_purchases(
            account_id="aABbCcdD",
            filters="",
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aABbCcdD/purchases",
        }

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
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_purchase(purchase_id="pAaAbBbCcDdEe")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchase"),
            )
        )
        make_client(session).get_purchase(purchase_id="pAaAbBbCcDdEe")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/purchase/pAaAbBbCcDdEe",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetPurchaseAccount(unittest.TestCase):
    def test_errors(self):
        cases = [
            (403, False, AccessForbiddenError),
            (403, False, AccessForbiddenError),
            (401, False, UnauthorizedError),
            (401, True, UnauthorizedErrorView),
            (404, False, UAContractsUserHasNoAccount),
            (404, True, UAContractsUserHasNoAccount),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_purchase_account("canonical-ua")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("account"),
            )
        )
        make_client(session).get_purchase_account("canonical-ua")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/account",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountOffers(unittest.TestCase):
    def test_errors(self):
        cases = [
            (403, False, AccessForbiddenError),
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (404, False, UAContractsUserHasNoAccount),
            (404, True, UAContractsUserHasNoAccount),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_account_offers("account_id")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("offers"),
            )
        )
        make_client(session).get_account_offers("account_id")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/account_id/offers",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestPurchaseFromMarketplace(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.purchase_from_marketplace(
                    marketplace="canonical-ua",
                    purchase_request={
                        "accountID": "aAaBbCcDdEeFfGg",
                        "purchaseItems": [
                            {
                                "productListingID": "lAaBbCcDdEeFfGg",
                                "metric": "active-machines",
                                "value": 5,
                            }
                        ],
                        "previousPurchaseID": "pAaBbCcDdEeFfGg",
                    },
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchase"),
            )
        )
        make_client(session).purchase_from_marketplace(
            marketplace="canonical-ua",
            purchase_request={
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            },
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            },
            "method": "post",
            "params": None,
            "url": "https://1.2.3.4/v1/marketplace/canonical-ua/purchase",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestPreviewPurchaseFromMarketplace(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.preview_purchase_from_marketplace(
                    marketplace="canonical-ua",
                    purchase_request={
                        "accountID": "aAaBbCcDdEeFfGg",
                        "purchaseItems": [
                            {
                                "productListingID": "lAaBbCcDdEeFfGg",
                                "metric": "active-machines",
                                "value": 5,
                            }
                        ],
                        "previousPurchaseID": "pAaBbCcDdEeFfGg",
                    },
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchase"),
            )
        )
        make_client(session).preview_purchase_from_marketplace(
            marketplace="canonical-ua",
            purchase_request={
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            },
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "accountID": "aAaBbCcDdEeFfGg",
                "purchaseItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfGg",
                        "metric": "active-machines",
                        "value": 5,
                    }
                ],
                "previousPurchaseID": "pAaBbCcDdEeFfGg",
            },
            "method": "post",
            "params": None,
            "url": (
                "https://1.2.3.4/v1"
                "/marketplace/canonical-ua/purchase/preview"
            ),
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestCancelSubscription(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.cancel_subscription(subscription_id="sAaBbCcDdEeFfGg")

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        make_client(session).cancel_subscription(
            subscription_id="sAaBbCcDdEeFfGg"
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": None,
            "method": "delete",
            "params": None,
            "url": "https://1.2.3.4/v1/subscriptions/sAaBbCcDdEeFfGg",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestPostSubscriptionAutoRenewal(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.post_subscription_auto_renewal(
                    subscription_id="sAaBbCcDdEeFfGg",
                    should_auto_renew=True,
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        make_client(session).post_subscription_auto_renewal(
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

        self.assertEqual(session.request_kwargs, expected_args)


class TestEnsurePurchaseAccount(unittest.TestCase):
    def test_errors(self):
        cases = [
            (401, False, UAContractsAPIError),
            (401, True, UAContractsAPIErrorView),
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.ensure_purchase_account(
                    email="email@url",
                    account_name="Joe Doe",
                    marketplace="canonical-ua",
                    captcha_value="abcd1234",
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("ensured-account"),
            )
        )
        make_client(session).ensure_purchase_account(
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

        self.assertEqual(session.request_kwargs, expected_args)


class TestGetAccountUsers(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.get_account_users(account_id="aAbBcCdD")

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
        make_client(session).get_account_users(account_id="aAbBcCdD")

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {},
            "method": "get",
            "params": None,
            "url": "https://1.2.3.4/v1/accounts/aAbBcCdD/users",
        }

        self.assertEqual(session.request_kwargs, expected_args)


class TestPutAccountUserRole(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.put_account_user_role(
                    account_id="aAbBcCdD",
                    user_role_request={},
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        make_client(session).put_account_user_role(
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

        self.assertEqual(session.request_kwargs, expected_args)


class TestPutContractEntitlements(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.put_contract_entitlements(
                    contract_id="cAbBcCdD",
                    entitlements_request={
                        "entitlements": [{"type": "fips", "is_enabled": True}]
                    },
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        make_client(session).put_contract_entitlements(
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

        self.assertEqual(session.request_kwargs, expected_args)


class TestPostPurchaseCalculate(unittest.TestCase):
    def test_errors(self):
        cases = [
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
        ]

        for code, is_for_view, expected_error in cases:
            session = Session(response=Response(status_code=code, content={}))
            client = make_client(session, is_for_view=is_for_view)

            with self.assertRaises(expected_error):
                client.post_purchase_calculate(
                    marketplace="canonical-ua",
                    request_body={
                        "country": "GB",
                        "productItems": [
                            {
                                "productListingID": "lAaBbCcDdEeFfHh",
                                "value": 1,
                            },
                        ],
                        "hasTaxID": True,
                    },
                )

    def test_success(self):
        session = Session(
            response=Response(
                status_code=200,
                content={},
            )
        )
        make_client(session).post_purchase_calculate(
            marketplace="canonical-ua",
            request_body={
                "country": "GB",
                "productItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfHh",
                        "value": 1,
                    },
                ],
                "hasTaxID": True,
            },
        )

        expected_args = {
            "headers": {"Authorization": "Macaroon secret-token"},
            "json": {
                "country": "GB",
                "productItems": [
                    {
                        "productListingID": "lAaBbCcDdEeFfHh",
                        "value": 1,
                    },
                ],
                "hasTaxID": True,
            },
            "method": "post",
            "params": None,
            "url": (
                "https://1.2.3.4"
                "/v1/marketplace/canonical-ua/purchase/calculate"
            ),
        }

        self.assertEqual(session.request_kwargs, expected_args)
