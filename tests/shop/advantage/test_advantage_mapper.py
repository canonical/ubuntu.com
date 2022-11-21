import unittest
from typing import List, Dict

from tests.shop.advantage.helpers import (
    Session,
    Response,
    make_client,
    get_fixture,
)
from webapp.shop.api.ua_contracts.helpers import to_dict
from webapp.shop.api.ua_contracts.models import (
    Listing,
    Offer,
    Purchase,
    PurchaseItem,
    Invoice,
)
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper
from webapp.shop.api.ua_contracts.primitives import (
    Account,
    Contract,
    Subscription,
    User,
)


class TestGetAccounts(unittest.TestCase):
    def test_returns_list_of_accounts(self):
        session = Session(
            Response(
                status_code=200,
                content={"accounts": get_fixture("accounts")},
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_accounts()

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Account)

        expectation = [
            Account(
                id="a123AbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                name="Free",
                type="personal",
                role="admin",
            ),
            Account(
                id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                name="Account Name",
                type="paid",
                role="admin",
            ),
        ]

        self.assertEqual(to_dict(expectation), to_dict(response))


class TestGetAccountContracts(unittest.TestCase):
    def test_returns_list_of_contracts(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"contracts": get_fixture("contracts")},
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_account_contracts("aAbBcCdD")

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Contract)


class TestGetContract(unittest.TestCase):
    def test_returns_list_of_contracts(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("contract"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_contract(
            "cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP"
        )

        self.assertIsInstance(response, Contract)


class TestGetProductListings(unittest.TestCase):
    def test_returns_list_of_contracts(self):
        session = Session(
            response=Response(
                status_code=200,
                content={
                    "productListings": get_fixture("product-listings"),
                    "products": get_fixture("products"),
                },
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_product_listings(
            marketplace="canonical-ua"
        )

        self.assertIsInstance(response, Dict)
        for listing in response.values():
            self.assertIsInstance(listing, Listing)


class TestGetAccountSubscriptions(unittest.TestCase):
    def test_returns_account_subscriptions(self):
        session = Session(
            response=Response(
                status_code=200,
                content={"subscriptions": get_fixture("subscriptions")},
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_account_subscriptions(
            account_id="aABbCcdD",
            marketplace="canonical-ua",
            filters={"status": "active", "period": "monthly"},
        )

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Subscription)


class TestGetAccountPurchases(unittest.TestCase):
    def test_returns_account_purchases(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("purchases"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_account_purchases(
            account_id="aABbCcdD",
        )

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Purchase)


class TestGetPurchase(unittest.TestCase):
    def test_returns_purchase(self):
        session = Session(
            Response(
                status_code=200,
                content=get_fixture("purchase"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_purchase("pAaBbCcDd")

        self.assertIsInstance(response, Purchase)

        expected_invoice = Invoice(
            reason="subscription_update",
            currency="usd",
            status="open",
            total=1200,
            id="in_abcdef",
            items=[
                {
                    "currency": "usd",
                    "description": "Description",
                    "pro_rated_amount": 1000,
                    "quantity": 1,
                }
            ],
            tax_amount=200,
            payment_status={
                "error": "generic_decline",
                "status": "need_another_payment_method",
            },
            url="invoice.url",
        )
        self.assertEqual(to_dict(expected_invoice), to_dict(response.invoice))

        expected_purchase = Purchase(
            id="pAaBbCcDd",
            account_id="aAaBbCcDdEeFfGg",
            subscription_id="sAaBbCcDdEeFfGg",
            marketplace="canonical-ua",
            created_at="2020-01-01T10:00:00Z",
            status="processing",
            invoice=expected_invoice,
            items=[
                PurchaseItem(
                    listing_id="lAaBbCcDdEeFfGg",
                    value=1,
                )
            ],
        )
        self.assertEqual(to_dict(expected_purchase), to_dict(response))

    def test_returns_3ds_purchase(self):
        session = Session(
            Response(
                status_code=200,
                content=get_fixture("purchase-3ds"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_purchase("pAaBbCcDd")

        self.assertIsInstance(response, Purchase)

        expected_invoice = Invoice(
            reason="subscription_create",
            currency="usd",
            status="open",
            total=27000,
            id="in_aAaBbCcDd",
            items=[
                {
                    "currency": "usd",
                    "description": (
                        "1 machine x UA Infrastructure"
                        " - Essential (Physical) (at $225.00 / year)"
                    ),
                    "pro_rated_amount": 22500,
                    "quantity": 1,
                }
            ],
            tax_amount=4500,
            payment_status={
                "pi_client_secret": "pi_aAbBcCdD",
                "status": "need_3ds_authorization",
            },
            url="download.link",
        )
        self.assertEqual(to_dict(expected_invoice), to_dict(response.invoice))

        expected_purchase = Purchase(
            id="pAaBbCcDd",
            account_id="aAaBbCcDd",
            subscription_id="sAaBbCcDd",
            marketplace="canonical-ua",
            created_at="2022-02-23T13:46:05.871Z",
            status="processing",
            invoice=expected_invoice,
            items=[
                PurchaseItem(
                    listing_id="lAaBbCcDd",
                    value=1,
                )
            ],
        )
        self.assertEqual(to_dict(expected_purchase), to_dict(response))

    def test_returns_failed_purchase(self):
        session = Session(
            Response(
                status_code=200,
                content=get_fixture("purchase-failed"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_purchase("pAaBbCcDd")

        self.assertIsInstance(response, Purchase)

        expected_invoice = Invoice(
            reason="subscription_create",
            currency="usd",
            status="open",
            total=22500,
            id="in_AaBbCcDd",
            items=[
                {
                    "currency": "usd",
                    "description": (
                        "1 machine x UA Infrastructure"
                        " - Essential (Physical) (at $225.00 / year)"
                    ),
                    "pro_rated_amount": 22500,
                    "quantity": 1,
                }
            ],
            payment_status={
                "error": "generic_decline",
                "status": "need_another_payment_method",
            },
            url="download.link",
        )
        self.assertEqual(to_dict(expected_invoice), to_dict(response.invoice))

        expected_purchase = Purchase(
            id="pAaBbCcDd",
            account_id="aAbBcCdD",
            subscription_id="sAaBbCcDd",
            marketplace="canonical-ua",
            created_at="2022-02-23T13:52:06.877Z",
            status="processing",
            invoice=expected_invoice,
            items=[
                PurchaseItem(
                    listing_id="laAbBcCdD",
                    value=1,
                )
            ],
        )
        self.assertEqual(to_dict(expected_purchase), to_dict(response))


class TestGetPurchaseAccount(unittest.TestCase):
    def test_returns_purchase_account(self):
        session = Session(
            Response(
                status_code=200,
                content=get_fixture("account"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_purchase_account("canonical-ua")

        self.assertIsInstance(response, Account)

        expectation = Account(
            id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            name="Account Name",
            type="paid",
            role="admin",
        )

        self.assertEqual(to_dict(expectation), to_dict(response))


class TestGetAccountOffers(unittest.TestCase):
    def test_returns_account_offers(self):
        session = Session(
            response=Response(
                status_code=200,
                content=get_fixture("offers"),
            )
        )
        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_account_offers("account_id")

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, Offer)


class TestGetAccountUsers(unittest.TestCase):
    def test_returns_list_of_users(self):
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

        ua_contracts_api = make_client(session)
        advantage_mapper = AdvantageMapper(ua_contracts_api)
        response = advantage_mapper.get_account_users(account_id="aAbBcCdD")

        self.assertIsInstance(response, List)
        for item in response:
            self.assertIsInstance(item, User)
