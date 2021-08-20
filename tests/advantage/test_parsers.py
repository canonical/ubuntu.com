import unittest
from typing import List, Dict

from tests.advantage.helpers import get_fixture
<<<<<<< HEAD
from webapp.advantage.ua_contracts.helpers import to_dict
from webapp.advantage.models import Listing, Entitlement
from webapp.advantage.ua_contracts.parsers import (
=======
from webapp.advantage.helpers import to_dict
from webapp.advantage.models import Listing
from webapp.advantage.parsers import (
>>>>>>> 67a3114a6 (Add parsers and api tests)
    parse_account,
    parse_accounts,
    parse_subscription_items,
    parse_subscription,
    parse_subscriptions,
    parse_product,
    parse_product_listings,
    parse_product_listing,
    parse_entitlements,
    parse_contract_items,
    parse_contract,
    parse_contracts,
)
<<<<<<< HEAD
from webapp.advantage.ua_contracts.primitives import (
=======
from webapp.advantage.primitives import (
>>>>>>> 67a3114a6 (Add parsers and api tests)
    Account,
    Subscription,
    SubscriptionItem,
    Product,
<<<<<<< HEAD
=======
    Entitlement,
>>>>>>> 67a3114a6 (Add parsers and api tests)
    ContractItem,
    Contract,
)


class TestParsers(unittest.TestCase):
    def test_parse_account(self):
        raw_account = get_fixture("account")
        parsed_account = parse_account(raw_account=raw_account)

        expectation = Account(
            id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            name="Account Name",
        )

        self.assertIsInstance(parsed_account, Account)
        self.assertEqual(to_dict(expectation), to_dict(parsed_account))

    def test_parse_accounts(self):
        raw_accounts = get_fixture("accounts")
        parsed_accounts = parse_accounts(raw_accounts=raw_accounts)

        expectation = [
            Account(
                id="a123AbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                name="Free",
            ),
            Account(
                id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                name="Account Name",
            ),
        ]

        self.assertIsInstance(parsed_accounts, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_accounts))

    def test_parse_subscription_items(self):
        raw_subscription_items = get_fixture("subscription-items")
        parsed_subscription_items = parse_subscription_items(
            subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            raw_items=raw_subscription_items,
        )

        expectation = [
            SubscriptionItem(
                subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                value=4,
            ),
            SubscriptionItem(
                subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                value=2,
            ),
        ]

        self.assertIsInstance(parsed_subscription_items, List)
        self.assertEqual(
            to_dict(expectation), to_dict(parsed_subscription_items)
        )

    def test_parse_subscription(self):
        raw_subscription = get_fixture("subscription")

        parsed_subscription = parse_subscription(
            raw_subscription=raw_subscription
        )

        expectation = Subscription(
            id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            account_id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            marketplace="canonical-ua",
            period="yearly",
            status="active",
            last_purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            items=[
                SubscriptionItem(
                    subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    value=3,
                ),
            ],
        )

        self.assertIsInstance(parsed_subscription, Subscription)
        self.assertEqual(to_dict(expectation), to_dict(parsed_subscription))

    def test_parse_subscriptions(self):
        raw_subscriptions = get_fixture("subscriptions")

        parsed_subscriptions = parse_subscriptions(
            raw_subscriptions=raw_subscriptions
        )

        expectation = [
            Subscription(
                id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                account_id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                marketplace="canonical-ua",
                period="monthly",
                status="active",
                last_purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                items=[
                    SubscriptionItem(
                        subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        value=3,
                    ),
                ],
            )
        ]

        self.assertIsInstance(parsed_subscriptions, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_subscriptions))

    def test_parse_product(self):
        raw_product = get_fixture("product")
        parsed_product = parse_product(raw_product=raw_product)

        expectation = Product(
            id="product-id",
            name="Product Name",
        )

        self.assertIsInstance(parsed_product, Product)
        self.assertEqual(to_dict(expectation), to_dict(parsed_product))

    def test_parse_listing(self):
        raw_products = get_fixture("products")
        raw_product_listing = get_fixture("product-listing")

        parsed_listing = parse_product_listing(
            raw_product_listing=raw_product_listing,
            raw_products=raw_products,
        )

        expectation = Listing(
            id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
            name="product-id",
            marketplace="canonical-ua",
<<<<<<< HEAD
            product_name="Product Name",
=======
            product=Product(
                id="product-id",
                name="Product Name",
            ),
>>>>>>> 67a3114a6 (Add parsers and api tests)
            price=1000,
            currency="USD",
            status="active",
            trial_days=20,
            period=None,
        )

        self.assertIsInstance(expectation, Listing)
        self.assertEqual(to_dict(expectation), to_dict(parsed_listing))

    def test_parse_listings(self):
        raw_products = get_fixture("products")
        raw_product_listings = get_fixture("product-listings")

        parsed_listings = parse_product_listings(
            raw_product_listings=raw_product_listings,
            raw_products=raw_products,
        )

        expectation = {
            "lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2": Listing(
                id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                name="product-id-2",
                marketplace="canonical-ua",
<<<<<<< HEAD
                product_name="Product Name 2",
=======
                product=Product(
                    id="product-id-2",
                    name="Product Name 2",
                ),
>>>>>>> 67a3114a6 (Add parsers and api tests)
                price=1000,
                currency="USD",
                status="active",
                trial_days=None,
                period=None,
            )
        }

        self.assertIsInstance(expectation, Dict)
        self.assertEqual(to_dict(expectation), to_dict(parsed_listings))

    def test_parse_entitlements(self):
        raw_entitlements = get_fixture("entitlements")
        parsed_entitlements = parse_entitlements(
            raw_entitlements=raw_entitlements
        )

        expectation = [
            Entitlement(
                type="entitlement-type",
                support_level=None,
                enabled_by_default=True,
            ),
            Entitlement(
                type="entitlement-type-2",
                support_level=None,
                enabled_by_default=False,
            ),
            Entitlement(
                type="support",
                support_level="advanced",
                enabled_by_default=False,
            ),
        ]

        self.assertIsInstance(parsed_entitlements, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_entitlements))

    def test_parse_contract_items(self):
        raw_contract_items = get_fixture("contract-items")

        parsed_contract_items = parse_contract_items(
            raw_items=raw_contract_items
        )

        expectation = [
            ContractItem(
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-01-01T10:00:00Z",
                start_date="2014-01-01T10:00:00Z",
                end_date="2015-01-01T00:00:00Z",
                reason="contract_created",
                value=5,
                product_listing_id=None,
                purchase_id=None,
                trial_id=None,
            ),
            ContractItem(
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-02-01T10:00:00Z",
                start_date="2014-02-01T10:00:00Z",
                end_date="2015-02-01T00:00:00Z",
                reason="extend_contract_by_renewal",
                value=0,
                product_listing_id=None,
                purchase_id=None,
                trial_id=None,
            ),
            ContractItem(
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-02-01T10:00:00Z",
                start_date="2014-03-01T10:00:00Z",
                end_date="2015-03-01T00:00:00Z",
                reason="purchase_made",
                value=1,
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                trial_id=None,
            ),
            ContractItem(
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-03-01T10:00:00Z",
                start_date="2014-04-01T10:00:00Z",
                end_date="2015-04-01T00:00:00Z",
                reason="purchase_made",
                value=-2,
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                trial_id=None,
            ),
            ContractItem(
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-06-01T10:00:00Z",
                start_date="2014-06-01T10:00:00Z",
                end_date="2015-07-01T00:00:00Z",
                reason="trial_started",
                value=1,
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP23",
                purchase_id=None,
                trial_id="tAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
            ),
        ]

        self.assertIsInstance(expectation, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contract_items))

    def test_parse_contract(self):
        raw_contract = get_fixture("contract")
        parsed_contract = parse_contract(raw_contract=raw_contract)

        expectation = Contract(
            id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            account_id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
            name="Product Name",
            product_id="product-id",
            entitlements=[
                Entitlement(
                    type="entitlement-type-2",
                    support_level=None,
                    enabled_by_default=False,
                ),
                Entitlement(
                    type="support",
                    support_level="advanced",
                    enabled_by_default=False,
                ),
            ],
            items=[
                ContractItem(
                    contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    created_at="2017-01-02T10:00:00Z",
                    start_date="2017-01-02T10:00:00Z",
                    end_date="2018-01-02T10:00:00Z",
                    reason="trial_started",
                    value=1,
                    product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    purchase_id=None,
                    trial_id="tAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                ),
                ContractItem(
                    contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    created_at="2017-02-02T10:00:00Z",
                    start_date="2017-02-02T10:00:00Z",
                    end_date="2018-02-02T10:00:00Z",
                    reason="purchase_made",
                    value=1,
                    product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    trial_id=None,
                ),
            ],
        )

        self.assertIsInstance(parsed_contract, Contract)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contract))

    def test_parse_contracts(self):
        raw_contracts = get_fixture("contracts")
        parsed_contracts = parse_contracts(raw_contracts=raw_contracts)

        expectation = [
            Contract(
                id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                account_id="aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                name="Product Name 2",
                product_id="product-id-2",
                entitlements=[
                    Entitlement(
                        type="entitlement-type",
                        support_level=None,
                        enabled_by_default=True,
                    ),
                ],
                items=[
                    ContractItem(
                        contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        created_at="2017-01-02T10:00:00Z",
                        start_date="2017-01-02T10:00:00Z",
                        end_date="2018-01-02T10:00:00Z",
                        reason="trial_started",
                        value=1,
                        product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        purchase_id=None,
                        trial_id="tAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    ),
                ],
            )
        ]

        self.assertIsInstance(parsed_contracts, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contracts))
