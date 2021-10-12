import unittest

from freezegun import freeze_time

from tests.advantage.helpers import (
    make_subscription,
    make_listing,
    make_contract_item,
    make_free_trial_contract,
    make_shop_contract,
    make_subscription_item,
    make_legacy_contract_item,
    make_renewal,
)
from webapp.advantage.models import Entitlement
from webapp.advantage.ua_contracts.helpers import (
    group_items_by_listing,
    get_items_aggregated_values,
    get_machine_type,
    is_trialling_user_subscription,
    get_pending_purchases,
    has_pending_purchases,
    is_user_subscription_cancelled,
    get_date_statuses,
    get_user_subscription_statuses,
    extract_last_purchase_ids,
    get_price_info,
    get_subscription_by_period,
    set_listings_trial_status,
    apply_entitlement_rules,
    to_dict,
)


class TestHelpers(unittest.TestCase):
    def test_group_items_by_listing(self):
        items = [
            make_contract_item(product_listing_id="listing-id-1"),
            make_contract_item(product_listing_id="listing-id-2"),
            make_contract_item(product_listing_id="listing-id-1"),
            make_contract_item(product_listing_id="listing-id-2"),
            make_contract_item(product_listing_id="listing-id-2"),
            make_contract_item(product_listing_id="listing-id-3"),
        ]

        grouped_items = group_items_by_listing(items=items)

        expected_number_of_groups = 3
        expected_number_of_items_in_first_group = 2
        expected_number_of_items_in_second_group = 3
        expected_number_of_items_in_third_group = 1

        self.assertEqual(expected_number_of_groups, len(grouped_items))
        self.assertEqual(
            expected_number_of_items_in_first_group,
            len(grouped_items["listing-id-1"]),
        )
        self.assertEqual(
            expected_number_of_items_in_second_group,
            len(grouped_items["listing-id-2"]),
        )
        self.assertEqual(
            expected_number_of_items_in_third_group,
            len(grouped_items["listing-id-3"]),
        )

    def test_get_items_aggregated_values(self):
        items = [
            make_contract_item(
                start_date="2020-02-01T00:00:00Z",
                end_date="2020-04-01T00:00:00Z",
                value=1,
            ),
            make_contract_item(
                start_date="2020-01-01T00:00:00Z",
                end_date="2020-02-01T00:00:00Z",
                value=5,
            ),
            make_contract_item(
                start_date="2020-03-01T00:00:00Z",
                end_date="2020-04-01T00:00:00Z",
                value=-3,
            ),
            make_contract_item(
                start_date="2020-01-01T00:00:01Z",
                end_date="2020-04-02T00:00:00Z",
                value=3,
            ),
            make_contract_item(
                start_date="2020-02-01T00:00:00Z",
                end_date="2020-03-30T00:00:00Z",
                value=2,
            ),
        ]

        user_subscription_values = get_items_aggregated_values(items=items)

        expected_start_date = "2020-01-01T00:00:00Z"
        expected_end_date = "2020-04-02T00:00:00Z"
        expected_number_of_machines = 8

        self.assertEqual(
            expected_start_date,
            user_subscription_values["start_date"],
        )
        self.assertEqual(
            expected_end_date,
            user_subscription_values["end_date"],
        )
        self.assertEqual(
            expected_number_of_machines,
            user_subscription_values["number_of_machines"],
        )

    def test_get_items_aggregated_for_free_user_subscription_values(self):
        items = [
            make_contract_item(
                start_date="2020-02-01T00:00:00Z",
                end_date="9999-12-31T00:00:00Z",
                value=1,
            ),
        ]

        user_subscription_values = get_items_aggregated_values(items=items)

        expected_end_date = None

        self.assertEqual(
            user_subscription_values["end_date"],
            expected_end_date,
        )

    def test_get_price_info_for_shop(self):
        listing = make_listing(price=100, currency="USD")

        price_info = get_price_info(number_of_machines=5, listing=listing)

        expectation = {"price": 500, "currency": "USD"}

        self.assertEqual(price_info, expectation)

    def test_get_price_info_for_legacy(self):
        renewal = make_renewal(price=10000, currency="Silver Coins")
        items = [make_legacy_contract_item(renewal=renewal)]

        price_info = get_price_info(items=items)

        expectation = {
            "price": 10000,
            "currency": "Silver Coins",
        }

        self.assertEqual(price_info, expectation)

    def test_get_machine_type(self):
        virtual_product_id = "uai-advanced-virtual"
        physical_product_id = "uai-essential-physical"
        desktop_product_id = "uai-essential-desktop"
        random_product_id = "random-id"

        machine_type = get_machine_type(virtual_product_id)
        self.assertEqual(machine_type, "virtual")

        machine_type = get_machine_type(physical_product_id)
        self.assertEqual(machine_type, "physical")

        machine_type = get_machine_type(desktop_product_id)
        self.assertEqual(machine_type, "desktop")

        machine_type = get_machine_type(random_product_id)
        self.assertEqual(machine_type, "physical")

    def test_is_trialling_user_subscription(self):
        free_trial_contract = make_free_trial_contract()

        is_trialling = is_trialling_user_subscription(
            items=free_trial_contract.items
        )

        self.assertEqual(is_trialling, True)

    def test_is_not_trialling_user_subscription(self):
        shop_contract = make_shop_contract()

        is_trialling = is_trialling_user_subscription(
            items=shop_contract.items
        )

        self.assertEqual(is_trialling, False)

    def test_get_pending_purchases(self):
        subscriptions = [
            make_subscription(
                pending_purchases=[
                    "pAaBbCcDdEeFfGg",
                    "pAaBbCcDdEeFfGg2",
                ]
            ),
            make_subscription(
                pending_purchases=[
                    "pAaBbCcDdEeFfGg3",
                ]
            ),
        ]

        pending_purchase = get_pending_purchases(subscriptions=subscriptions)

        expected_pending_purchases = [
            "pAaBbCcDdEeFfGg",
            "pAaBbCcDdEeFfGg2",
            "pAaBbCcDdEeFfGg3",
        ]

        self.assertEqual(pending_purchase, expected_pending_purchases)

    def test_get_no_pending_purchases(self):
        subscriptions = [make_subscription(), make_subscription()]

        pending_purchase = get_pending_purchases(subscriptions=subscriptions)

        self.assertEqual(pending_purchase, [])

    def test_has_pending_purchases(self):
        subscriptions = [
            make_subscription(pending_purchases=["pAaBbCcDdEeFfGg"]),
        ]

        self.assertEqual(has_pending_purchases(subscriptions), True)

    def test_has_no_pending_purchases(self):
        subscriptions = [make_subscription()]

        self.assertEqual(has_pending_purchases(subscriptions), False)

    def test_is_user_subscription_not_cancelled(self):
        listing = make_listing(id="lAaBbCcDd")
        subscriptions = [
            make_subscription(
                period="monthly",
                items=[make_subscription_item(product_listing_id="lAaBbCcDd")],
            )
        ]

        is_cancelled = is_user_subscription_cancelled(listing, subscriptions)

        self.assertEqual(is_cancelled, False)

    def test_is_user_subscription_cancelled(self):
        listing = make_listing(id="lAaBbCcDd")
        subscriptions = [
            make_subscription(
                period="monthly",
                items=[make_subscription_item(product_listing_id="randomID")],
            )
        ]

        is_cancelled = is_user_subscription_cancelled(listing, subscriptions)

        self.assertEqual(is_cancelled, True)

    def test_get_date_statuses(self):
        freeze_datetime = "2020-09-01T00:00:00Z"
        scenarios = {
            "date_is_8_days_before_expiry": {
                "date": "2020-09-09T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_7_days_and_one_second_before_expiry_start": {
                "date": "2020-09-08T00:00:01Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_7_days_before_expiry": {
                "date": "2020-09-07T23:59:59Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_one_second_before_expiry": {
                "date": "2020-09-01T00:00:01Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_the_same_as_current_date": {
                "date": "2020-09-01T00:00:00Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_one_second_in_grace_period": {
                "date": "2020-08-31T23:59:59Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                },
            },
            "date_is_one_second_before_grace_period_end": {
                "date": "2020-08-18T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                },
            },
            "date_is_one_second_after_grace_period_end": {
                "date": "2020-08-17T23:59:59Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": True,
                },
            },
        }

        with freeze_time(freeze_datetime):
            for case, scenario in scenarios.items():
                with self.subTest(msg=f"{case}", scenario=scenario):
                    date_statuses = get_date_statuses(
                        end_date=scenario["date"]
                    )

                    self.assertEqual(date_statuses, scenario["expectations"])

    def test_get_user_subscription_statuses(self):
        freeze_datetime = "2020-09-01T00:00:00Z"

        scenarios = {
            "test_free_user_subscription": {
                "parameters": {
                    "type": "free",
                    "end_date": "2020-08-31T23:59:59Z",
                    "subscriptions": None,
                    "listing": None,
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_yearly_user_subscription": {
                "parameters": {
                    "type": "yearly",
                    "end_date": "2020-08-31T23:59:59Z",
                    "subscriptions": None,
                    "listing": None,
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_monthly_user_subscription": {
                "parameters": {
                    "type": "monthly",
                    "end_date": "2020-09-01T00:00:00Z",
                    "subscriptions": [
                        make_subscription(
                            items=[
                                make_subscription_item(
                                    product_listing_id="listing-id"
                                )
                            ]
                        )
                    ],
                    "listing": make_listing(id="listing-id"),
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_cancelled_user_subscription": {
                "parameters": {
                    "type": "monthly",
                    "end_date": "2020-09-05T00:00:00Z",
                    "subscriptions": [
                        make_subscription(
                            items=[
                                make_subscription_item(
                                    product_listing_id="random-id"
                                )
                            ]
                        )
                    ],
                    "listing": make_listing(id="listing-id"),
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": True,
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_expired_user_subscription": {
                "parameters": {
                    "type": "monthly",
                    "end_date": "2020-08-01T00:00:00Z",
                    "subscriptions": None,
                    "listing": None,
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": True,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_trial_user_subscription": {
                "parameters": {
                    "type": "trial",
                    "end_date": "2020-08-18T00:00:00Z",
                    "subscriptions": [
                        make_subscription(
                            started_with_trial=True,
                            in_trial=True,
                            status="active",
                        )
                    ],
                    "listing": None,
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                    "is_trialled": True,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                },
            },
            "test_pending_purchases_user_subscription": {
                "parameters": {
                    "type": "trial",
                    "end_date": "2020-09-07T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            pending_purchases=["pAaBbCcDdEeFfgG"]
                        )
                    ],
                    "listing": None,
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": True,
                },
            },
            "test_legacy_user_subscription": {
                "parameters": {
                    "type": "legacy",
                    "end_date": "2020-10-01T10:00:00Z",
                    "renewal": make_renewal(
                        actionable=True,
                        status="pending",
                        start_date="2020-08-01T10:00:00Z",
                        end_date="2020-10-01T10:00:00Z",
                    ),
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": True,
                    "is_renewal_actionable": True,
                    "has_pending_purchases": False,
                },
            },
            "test_non_actionable_legacy_user_subscription": {
                "parameters": {
                    "type": "legacy",
                    "end_date": "2020-10-01T10:00:00Z",
                    "renewal": make_renewal(actionable=False),
                },
                "expectations": {
                    "is_upsizeable": False,
                    "is_downsizeable": False,
                    "is_cancellable": False,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": True,
                    "is_renewal_actionable": True,
                    "has_pending_purchases": False,
                },
            },
        }

        with freeze_time(freeze_datetime):
            for case, scenario in scenarios.items():
                with self.subTest(msg=f"{case}", scenario=scenario):
                    parameters = scenario["parameters"]
                    statuses = get_user_subscription_statuses(
                        type=parameters.get("type"),
                        end_date=parameters.get("end_date"),
                        renewal=parameters.get("renewal"),
                        subscriptions=parameters.get("subscriptions"),
                        listing=parameters.get("listing"),
                    )

                    self.assertEqual(statuses, scenario["expectations"])

    def test_extract_last_purchase_ids(self):
        subscriptions = [
            make_subscription(period="monthly", last_purchase_id="pABC1"),
            make_subscription(period="yearly", last_purchase_id="pABC2"),
        ]

        last_purchase_ids = extract_last_purchase_ids(subscriptions)

        expectation = {
            "monthly": "pABC1",
            "yearly": "pABC2",
        }

        self.assertEqual(last_purchase_ids, expectation)

        subscriptions = [
            make_subscription(period="monthly", last_purchase_id="pABC1"),
        ]

        last_purchase_ids = extract_last_purchase_ids(subscriptions)

        expectation = {
            "monthly": "pABC1",
            "yearly": "",
        }

        self.assertEqual(last_purchase_ids, expectation)

        last_purchase_ids = extract_last_purchase_ids([])

        expectation = {
            "monthly": "",
            "yearly": "",
        }

        self.assertEqual(last_purchase_ids, expectation)

    def test_get_subscription_by_period(self):
        subscriptions = [
            make_subscription(id="yearly_sub", period="yearly"),
            make_subscription(id="monthly_sub", period="monthly"),
        ]
        listing = make_listing(period="monthly")

        subscription = get_subscription_by_period(subscriptions, listing)

        self.assertEqual(subscription.id, "monthly_sub")

    def test_get_subscription_by_period_has_no_subscription(self):
        subscriptions = [
            make_subscription(id="yearly_sub", period="yearly"),
        ]

        listing = make_listing(period="monthly")

        subscription = get_subscription_by_period(subscriptions, listing)

        self.assertEqual(subscription, None)

    def test_get_subscription_by_period_with_listing_without_period(self):
        subscriptions = [
            make_subscription(id="yearly_sub", period="yearly"),
            make_subscription(id="monthly_sub", period="monthly"),
        ]

        listing = make_listing()
        listing.period = None

        subscription = get_subscription_by_period(subscriptions, listing)

        self.assertEqual(subscription, None)

    def test_get_subscription_by_period_with_no_listing(self):
        subscriptions = None
        listing = None

        subscription = get_subscription_by_period(subscriptions, listing)

        self.assertEqual(subscription, None)

    def test_set_listings_trial_status_to_true(self):
        subscriptions = [
            make_subscription(started_with_trial=False, status="deactivated"),
        ]

        listings = {
            "lAbcABC": make_listing(trial_days=30),
            "lBcdBCD": make_listing(trial_days=1),
        }

        set_listings_trial_status(listings, subscriptions)

        for listing in listings.values():
            self.assertEqual(listing.can_be_trialled, True)

    def test_set_listings_trial_status_to_false_because_of_subscriptions(self):
        subscriptions = [make_subscription(started_with_trial=True)]

        listings = {
            "lAbcABC": make_listing(trial_days=30),
            "lBcdBCD": make_listing(trial_days=1),
        }

        set_listings_trial_status(listings, subscriptions)

        for listing in listings.values():
            self.assertEqual(listing.can_be_trialled, False)

        subscriptions = [make_subscription()]

        listings = {
            "lAbcABC": make_listing(trial_days=30),
            "lBcdBCD": make_listing(trial_days=1),
        }

        set_listings_trial_status(listings, subscriptions)

        for listing in listings.values():
            self.assertEqual(listing.can_be_trialled, False)

    def test_set_listings_trial_status_to_false_due_to_listings(self):
        subscriptions = [
            make_subscription(started_with_trial=False, status="deactivated")
        ]

        listings = {
            "lAbcABC": make_listing(trial_days=0),
            "lBcdBCD": make_listing(trial_days=0),
        }

        set_listings_trial_status(listings, subscriptions)

        for listing in listings.values():
            self.assertEqual(listing.can_be_trialled, False)

    def test_apply_entitlement_rules_is_available(self):
        entitlements = [
            Entitlement(
                type="landscape",
                enabled_by_default=False,
            ),
            Entitlement(
                type="support",
                enabled_by_default=False,
                support_level="standard",
            ),
            Entitlement(
                type="esm-infra",
                enabled_by_default=True,
            ),
        ]

        final_entitlements = apply_entitlement_rules(entitlements)

        expected_entitlements = [
            Entitlement(
                type="support",
                support_level="standard",
                enabled_by_default=True,
                is_available=True,
                is_editable=False,
            ),
            Entitlement(
                type="esm-infra",
                enabled_by_default=True,
            ),
            Entitlement(
                type="esm-apps",
                enabled_by_default=False,
                is_available=False,
                is_editable=False,
            ),
            Entitlement(
                type="support",
                support_level="advanced",
                enabled_by_default=False,
                is_available=False,
                is_editable=False,
            ),
        ]

        self.assertEqual(
            to_dict(final_entitlements), to_dict(expected_entitlements)
        )

    def test_apply_entitlement_rules_is_enabled(self):
        entitlements = [
            Entitlement(
                type="livepatch",
                enabled_by_default=True,
            ),
            Entitlement(
                type="fips-updates",
                enabled_by_default=True,
            ),
            Entitlement(
                type="fips",
                enabled_by_default=True,
            ),
            Entitlement(
                type="esm-apps",
                enabled_by_default=True,
            ),
        ]

        final_entitlements = apply_entitlement_rules(entitlements)

        expected_entitlements = [
            Entitlement(
                type="livepatch",
                enabled_by_default=False,
                is_editable=False,
            ),
            Entitlement(
                type="fips-updates",
                enabled_by_default=False,
                is_editable=False,
            ),
            Entitlement(
                type="fips",
                enabled_by_default=True,
            ),
            Entitlement(
                type="esm-apps",
                enabled_by_default=True,
            ),
        ]

        self.assertEqual(
            to_dict(final_entitlements), to_dict(expected_entitlements)
        )
