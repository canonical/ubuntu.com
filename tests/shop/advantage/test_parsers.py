import json
import unittest
from typing import List, Dict

from tests.shop.advantage.helpers import get_fixture
from webapp.shop.api.ua_contracts.helpers import to_dict
from webapp.shop.api.ua_contracts.models import (
    Listing,
    Entitlement,
    Product,
    OfferItem,
    Offer,
)
from webapp.shop.api.ua_contracts.parsers import (
    parse_offer_items,
    parse_offer,
    parse_offers,
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
    parse_renewal,
    parse_user,
    parse_users,
)
from webapp.shop.api.ua_contracts.primitives import (
    Subscription,
    SubscriptionItem,
    ContractItem,
    Contract,
    Renewal,
    User,
)


class TestParsers(unittest.TestCase):
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

    def test_parse_no_subscription_items(self):
        subscription_id = "random-id"
        parsed_subscription_items = parse_subscription_items(
            subscription_id, None
        )
        self.assertIsInstance(parsed_subscription_items, List)
        self.assertEqual([], to_dict(parsed_subscription_items))

        parsed_subscription_items = parse_subscription_items(
            subscription_id, []
        )
        self.assertIsInstance(parsed_subscription_items, List)
        self.assertEqual([], to_dict(parsed_subscription_items))

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
            pending_purchases=["pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP222"],
            items=[
                SubscriptionItem(
                    subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                    value=3,
                ),
            ],
            started_with_trial=True,
            in_trial=True,
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
                is_auto_renewing=True,
                items=[
                    SubscriptionItem(
                        subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP",
                        value=3,
                    ),
                ],
                started_with_trial=None,
            ),
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
            product=Product(
                name="Product Name",
                id="product-id",
            ),
            price=1000,
            currency="USD",
            status="active",
            trial_days=20,
            period=None,
        )

        self.assertIsInstance(parsed_listing, Listing)
        self.assertEqual(to_dict(expectation), to_dict(parsed_listing))

    def test_parse_listing_with_no_product(self):
        raw_products = []
        raw_product_listing = get_fixture("product-listing")

        parsed_listing = parse_product_listing(
            raw_product_listing=raw_product_listing,
            raw_products=raw_products,
        )

        expectation = Listing(
            id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
            name="product-id",
            marketplace="canonical-ua",
            product=None,
            price=1000,
            currency="USD",
            status="active",
            trial_days=20,
            period=None,
        )

        self.assertIsInstance(parsed_listing, Listing)
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
                status="active",
                product=Product(
                    name="Product Name 2",
                    id="product-id-2",
                ),
                price=1000,
                currency="USD",
                trial_days=None,
                period=None,
            )
        }

        self.assertIsInstance(parsed_listings, Dict)
        self.assertEqual(to_dict(expectation), to_dict(parsed_listings))

    def test_parse_listings_with_no_listings(self):
        raw_products = None
        raw_product_listings = None

        parsed_listings = parse_product_listings(
            raw_product_listings=raw_product_listings,
            raw_products=raw_products,
        )

        self.assertIsInstance(parsed_listings, Dict)
        self.assertEqual({}, to_dict(parsed_listings))

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
                is_available=True,
                is_in_beta=False,
            ),
            Entitlement(
                type="entitlement-type-2",
                support_level=None,
                enabled_by_default=False,
                is_available=True,
                is_in_beta=False,
            ),
            Entitlement(
                type="entitlement-type-3",
                support_level=None,
                enabled_by_default=False,
                is_available=True,
                is_in_beta=True,
            ),
            Entitlement(
                type="support",
                support_level="advanced",
                enabled_by_default=False,
                is_available=True,
            ),
        ]

        self.assertIsInstance(parsed_entitlements, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_entitlements))

    def test_parse_no_entitlements(self):
        parsed_entitlements = parse_entitlements(None)
        self.assertIsInstance(parsed_entitlements, List)
        self.assertEqual([], to_dict(parsed_entitlements))

        parsed_entitlements = parse_entitlements([])
        self.assertIsInstance(parsed_entitlements, List)
        self.assertEqual([], to_dict(parsed_entitlements))

    def test_parses_entitlement_without_obligations(self):
        raw_entitlements = (
            '[{"type": "support", "entitled": true, '
            '"affordances": {"supportLevel": "essential"}}]'
        )

        parsed_entitlements = parse_entitlements(
            raw_entitlements=json.loads(raw_entitlements)
        )

        expected_entitlements = [
            Entitlement(
                type="support",
                support_level="essential",
                enabled_by_default=False,
                is_available=True,
            ),
        ]

        self.assertEqual(
            to_dict(parsed_entitlements), to_dict(expected_entitlements)
        )

    def test_parse_renewal(self):
        raw_renewal = get_fixture("renewal")
        parsed_renewal = parse_renewal(raw_renewal=raw_renewal)

        expectation = Renewal(
            id="rAaBbCcDdEeFf",
            contract_id="cAaBbCcDdEeFf",
            actionable=False,
            start_date="2020-11-01T00:00:00Z",
            end_date="2021-01-01T00:00:00Z",
            status="done",
            new_contract_start="2021-01-01T00:00:00Z",
            price=11000,
            currency="USD",
        )

        self.assertEqual(to_dict(expectation), to_dict(parsed_renewal))

    def test_parse_trial_contract_items(self):
        raw_contract_items = [get_fixture("contract-item-trial")]

        parsed_contract_items = parse_contract_items(
            raw_items=raw_contract_items
        )

        expectation = [
            ContractItem(
                id=5,
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-06-01T10:00:00Z",
                start_date="2014-06-01T10:00:00Z",
                end_date="2015-07-01T00:00:00Z",
                reason="trial_started",
                value=1,
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP23",
                purchase_id=None,
                trial_id="tAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
            )
        ]

        self.assertIsInstance(parsed_contract_items, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contract_items))

    def test_parse_purchase_contract_items(self):
        raw_contract_items = [get_fixture("contract-item-shop")]

        parsed_contract_items = parse_contract_items(
            raw_items=raw_contract_items
        )

        expectation = [
            ContractItem(
                id=3,
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-02-01T10:00:00Z",
                start_date="2014-03-01T10:00:00Z",
                end_date="2015-03-01T00:00:00Z",
                reason="purchase_made",
                value=1,
                product_listing_id="lAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                subscription_id="sAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                purchase_id="pAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                trial_id=None,
            ),
        ]

        self.assertIsInstance(parsed_contract_items, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contract_items))

    def test_parse_legacy_contract_items(self):
        raw_contract_items = [get_fixture("contract-item-legacy")]

        parsed_contract_items = parse_contract_items(
            raw_items=raw_contract_items
        )

        expectation = [
            ContractItem(
                id=6,
                contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                created_at="2014-01-01T10:00:00Z",
                start_date="2014-01-01T10:00:00Z",
                end_date="2015-01-01T00:00:00Z",
                reason="contract_created",
                value=5,
                product_listing_id=None,
                purchase_id=None,
                trial_id=None,
                renewal=Renewal(
                    id="rAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                    contract_id="cAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP2",
                    actionable=True,
                    start_date="2014-11-01T00:00:00Z",
                    end_date="2015-01-01T00:00:00Z",
                    status="pending",
                    new_contract_start="2015-01-01T00:00:00Z",
                    price=5000,
                    currency="USD",
                ),
            ),
        ]

        self.assertIsInstance(parsed_contract_items, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_contract_items))

    def test_parse_no_contract_items(self):
        parsed_contract_items = parse_contract_items(None)
        self.assertIsInstance(parsed_contract_items, List)
        self.assertEqual([], to_dict(parsed_contract_items))

        parsed_contract_items = parse_contract_items([])
        self.assertIsInstance(parsed_contract_items, List)
        self.assertEqual([], to_dict(parsed_contract_items))

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
            number_of_active_machines=0,
            items=[
                ContractItem(
                    id=10,
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
                    id=11,
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
                number_of_active_machines=0,
                items=[
                    ContractItem(
                        id=10,
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

    def test_parse_user(self):
        raw_user = get_fixture("user")

        parsed_user = parse_user(raw_user)

        expectation = User(
            display_name="Joe Doe",
            name="joedoe2021",
            email="joe.doe@canonical.com",
            id="aAbBcCdD",
            last_login_at="2021-09-10T12:00:00Z",
            first_login_at="2021-09-10T12:00:00Z",
            verified=True,
        )

        self.assertEqual(to_dict(parsed_user), to_dict(expectation))

    def test_parse_users(self):
        raw_users = get_fixture("users")

        parsed_users = parse_users(raw_users)

        joe = User(
            display_name="Joe Doe",
            name="joedoe2021",
            email="joe.doe@canonical.com",
            id="aAbBcCdD",
            last_login_at="2021-09-10T12:00:00Z",
            first_login_at="2021-09-10T12:00:00Z",
            verified=True,
        )
        joe.set_user_role_on_account("admin")

        expectation = [
            joe,
            User(
                display_name="Jane Doe",
                name="janedoe2021",
                email="jane.doe@canonical.com",
                id="aAbBcCdD2",
                last_login_at="2021-09-10T12:00:00Z",
                first_login_at="2021-09-10T12:00:00Z",
                verified=False,
            ),
        ]

        self.assertEqual(to_dict(parsed_users), to_dict(expectation))

    def test_parse_offer_items(self):
        raw_offer = get_fixture("offer")

        parsed_offer_items = parse_offer_items(
            raw_offer["items"], raw_offer["productListings"]
        )

        expectation = [
            OfferItem(
                id="lAaBbCcDdEeFfGg",
                name="uai-advanced-desktop-oneoff",
                price=60000,
                allowance=2,
            ),
            OfferItem(
                id="lAaBbCcDdEeFfGg-2",
                name="uai-advanced-physical-oneoff",
                price=750000,
                allowance=5,
            ),
        ]

        self.assertIsInstance(parsed_offer_items, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_offer_items))

    def test_parse_offer(self):
        raw_offer = get_fixture("offer")

        parsed_offer = parse_offer(raw_offer)

        expectation = Offer(
            id="oOaAbBcCdDeEfFgG",
            account_id="aAbBcCdDeEfFgG",
            total=810000,
            actionable=True,
            created_at="2022-01-04T10:00:00Z",
            marketplace="canonical-ua",
            items=[
                OfferItem(
                    id="lAaBbCcDdEeFfGg",
                    name="uai-advanced-desktop-oneoff",
                    price=60000,
                    allowance=2,
                ),
                OfferItem(
                    id="lAaBbCcDdEeFfGg-2",
                    name="uai-advanced-physical-oneoff",
                    price=750000,
                    allowance=5,
                ),
            ],
        )

        self.assertIsInstance(parsed_offer, Offer)
        self.assertEqual(to_dict(expectation), to_dict(parsed_offer))

    def test_parse_offers(self):
        raw_offers = get_fixture("offers")

        parsed_offers = parse_offers(raw_offers)

        expectation = [
            Offer(
                id="oOaAbBcCdDeEfFgG",
                account_id="aAbBcCdDeEfFgG",
                total=810000,
                actionable=True,
                created_at="2022-01-04T10:00:00Z",
                marketplace="canonical-ua",
                items=[
                    OfferItem(
                        id="lAaBbCcDdEeFfGg",
                        name="uai-advanced-desktop-oneoff",
                        price=60000,
                        allowance=2,
                    ),
                    OfferItem(
                        id="lAaBbCcDdEeFfGg-2",
                        name="uai-advanced-physical-oneoff",
                        price=750000,
                        allowance=5,
                    ),
                ],
            )
        ]

        self.assertIsInstance(parsed_offers, List)
        self.assertEqual(to_dict(expectation), to_dict(parsed_offers))
