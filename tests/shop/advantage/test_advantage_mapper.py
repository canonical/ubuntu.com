import unittest
from typing import List, Dict

from tests.shop.advantage.helpers import (
    Session,
    Response,
    make_client,
    get_fixture,
)
from webapp.shop.api.ua_contracts.models import Listing, Offer
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
