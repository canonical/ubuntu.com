import unittest

from freezegun import freeze_time

from tests.shop.advantage.helpers import (
    make_account,
    make_contract_item,
    make_free_trial_contract,
    make_legacy_contract_item,
    make_listing,
    make_renewal,
    make_shop_contract,
    make_subscription,
    make_subscription_item,
)
from webapp.shop.api.ua_contracts.helpers import (
    apply_entitlement_rules,
    extract_last_purchase_ids,
    get_current_number_of_machines,
    get_date_statuses,
    get_items_aggregated_values,
    get_machine_type,
    get_pending_purchases,
    get_price_info,
    get_user_subscription_statuses,
    group_shop_items,
    has_pending_purchases,
    is_billing_subscription_active,
    is_billing_subscription_auto_renewing,
    is_trialling_user_subscription,
    is_user_subscription_cancelled,
    set_listings_trial_status,
    to_dict,
)
from webapp.shop.api.ua_contracts.models import Entitlement


class TestHelpers(unittest.TestCase):
    def test_group_shop_items(self):
        items = [
            make_contract_item(
                product_listing_id="listing-id-1", subscription_id="sub-id-1"
            ),
            make_contract_item(
                product_listing_id="listing-id-2", subscription_id="sub-id-1"
            ),
            make_contract_item(
                product_listing_id="listing-id-1", subscription_id="sub-id-1"
            ),
            make_contract_item(
                product_listing_id="listing-id-2", subscription_id="sub-id-1"
            ),
            make_contract_item(
                product_listing_id="listing-id-2", subscription_id="sub-id-2"
            ),
            make_contract_item(
                product_listing_id="listing-id-3", subscription_id="sub-id-1"
            ),
        ]

        grouped_items = group_shop_items(items=items)

        expected_number_of_groups = 4
        expected_number_of_items_in_first_group = 2
        expected_number_of_items_in_second_group = 2
        expected_number_of_items_in_third_group = 1
        expected_number_of_items_in_forth_group = 1

        self.assertEqual(expected_number_of_groups, len(grouped_items))
        self.assertEqual(
            expected_number_of_items_in_first_group,
            len(grouped_items["listing-id-1||sub-id-1"]),
        )
        self.assertEqual(
            expected_number_of_items_in_second_group,
            len(grouped_items["listing-id-2||sub-id-1"]),
        )
        self.assertEqual(
            expected_number_of_items_in_third_group,
            len(grouped_items["listing-id-2||sub-id-2"]),
        )
        self.assertEqual(
            expected_number_of_items_in_forth_group,
            len(grouped_items["listing-id-3||sub-id-1"]),
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

        user_subscription_values = get_items_aggregated_values(
            items=items, type="monthly"
        )

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

        user_subscription_values = get_items_aggregated_values(
            items=items, type="free"
        )

        expected_end_date = None

        self.assertEqual(
            user_subscription_values["end_date"],
            expected_end_date,
        )

    def test_get_current_number_of_machines(self):
        scenarios = {
            "no-subscription-no-subscription-id-no-listing": {
                "subscriptions": [],
                "subscription_id": "",
                "listing": None,
                "expectation": 0,
            },
            "subscription-id-not-in-subscriptions": {
                "subscriptions": [make_subscription(id="not-my-subscription")],
                "subscription_id": "my-subscription",
                "listing": make_listing(),
                "expectation": 0,
            },
            "listing-id-not-in-subscription-items": {
                "subscriptions": [
                    make_subscription(
                        id="my-subscription",
                        items=[
                            make_subscription_item(
                                product_listing_id="not-my-listing"
                            )
                        ],
                    ),
                ],
                "subscription_id": "my-subscription",
                "listing": make_listing(id="my-listing"),
                "expectation": 0,
            },
            "get-right-current-machine-number": {
                "subscriptions": [
                    make_subscription(
                        id="my-subscription",
                        items=[
                            make_subscription_item(
                                product_listing_id="my-listing",
                                value=5,
                            )
                        ],
                    ),
                ],
                "subscription_id": "my-subscription",
                "listing": make_listing(id="my-listing"),
                "expectation": 5,
            },
        }

        for case, scenario in scenarios.items():
            with self.subTest(msg=f"{case}", scenario=scenario):
                current_number_of_machines = get_current_number_of_machines(
                    subscriptions=scenario["subscriptions"],
                    subscription_id=scenario["subscription_id"],
                    listing=scenario["listing"],
                )

                self.assertEqual(
                    current_number_of_machines, scenario["expectation"]
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
        subscription_id = "sub-id-1"
        subscriptions = [
            make_subscription(
                id=subscription_id,
                period="yearly",
                items=[make_subscription_item(product_listing_id="lAaBbCcDe")],
            ),
            make_subscription(
                id=subscription_id,
                period="monthly",
                items=[
                    make_subscription_item(product_listing_id="lAaBbCcDe"),
                    make_subscription_item(product_listing_id="lAaBbCcDd"),
                ],
            ),
        ]

        is_cancelled = is_user_subscription_cancelled(
            listing, subscriptions, subscription_id
        )

        self.assertEqual(is_cancelled, False)

    def test_is_user_subscription_cancelled(self):
        listing = make_listing(id="lAaBbCcDd")
        subscription_id = "sub-id-1"
        subscriptions = [
            make_subscription(
                id=subscription_id,
                period="monthly",
                items=[make_subscription_item(product_listing_id="randomID")],
            )
        ]

        is_cancelled = is_user_subscription_cancelled(
            listing, subscriptions, subscription_id
        )

        self.assertEqual(is_cancelled, True)

    def test_is_billing_subscription_active(self):
        subscription_id_1 = "sub-id-1"
        subscription_id_2 = "sub-id-2"
        subscriptions = [
            make_subscription(
                id=subscription_id_1,
                period="monthly",
                status="active",
            ),
            make_subscription(
                id=subscription_id_2,
                period="yearly",
                status="locked",
            ),
        ]

        self.assertEqual(
            is_billing_subscription_active(subscriptions, subscription_id_1),
            True,
        )
        self.assertEqual(
            is_billing_subscription_active(subscriptions, subscription_id_2),
            True,
        )

    def test_is_billing_subscription_not_active(self):
        subscription_id_1 = "sub-id-1"
        subscriptions = [
            make_subscription(
                id=subscription_id_1,
                period="monthly",
                status="deactivated",
            ),
        ]

        self.assertEqual(
            is_billing_subscription_active(subscriptions, subscription_id_1),
            False,
        )

    def test_is_billing_subscription_auto_renewing(self):
        subscription_id_1 = "sub-id-1"
        subscription_id_2 = "sub-id-2"
        subscriptions = [
            make_subscription(
                id=subscription_id_1,
                is_auto_renewing=True,
            ),
            make_subscription(
                id=subscription_id_2,
                is_auto_renewing=False,
            ),
        ]

        self.assertEqual(
            is_billing_subscription_auto_renewing(
                subscriptions, subscription_id_1
            ),
            True,
        )
        self.assertEqual(
            is_billing_subscription_auto_renewing(
                subscriptions, subscription_id_2
            ),
            False,
        )

    def test_get_date_statuses(self):
        freeze_datetime = "2020-09-01T00:00:00Z"
        scenarios = {
            "yearly_date_is_61_days_before_expiry": {
                "type": "yearly",
                "date": "2020-11-01T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "yearly_date_is_59_days_before_expiry": {
                "type": "yearly",
                "date": "2020-10-30T00:00:00Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_8_days_before_expiry": {
                "type": "monthly",
                "date": "2020-09-09T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_7_days_and_one_second_before_expiry_start": {
                "type": "monthly",
                "date": "2020-09-08T00:00:01Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_7_days_before_expiry": {
                "type": "monthly",
                "date": "2020-09-07T23:59:59Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_one_second_before_expiry": {
                "type": "monthly",
                "date": "2020-09-01T00:00:01Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_the_same_as_current_date": {
                "type": "monthly",
                "date": "2020-09-01T00:00:00Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_one_second_in_grace_period": {
                "type": "monthly",
                "date": "2020-08-31T23:59:59Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                },
            },
            "date_is_one_second_before_grace_period_end": {
                "type": "monthly",
                "date": "2020-08-18T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                },
            },
            "date_is_one_second_after_grace_period_end": {
                "type": "monthly",
                "date": "2020-08-17T23:59:59Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": True,
                },
            },
            "legacy_date_is_91_days_before_expiry": {
                "type": "legacy",
                "date": "2020-12-01T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "legacy_date_is_90_days_before_expiry": {
                "type": "legacy",
                "date": "2020-11-29T00:00:00Z",
                "expectations": {
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "legacy_date_is_90_days_after_expiry": {
                "type": "legacy",
                "date": "2020-06-04T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                },
            },
            "legacy_date_is_91_days_after_expiry": {
                "type": "legacy",
                "date": "2020-06-02T00:00:00Z",
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
                        type=scenario["type"], end_date=scenario["date"]
                    )

                    self.assertEqual(date_statuses, scenario["expectations"])

    def test_get_user_subscription_statuses(self):
        freeze_datetime = "2020-09-01T00:00:00Z"

        scenarios = {
            "test_free_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "free",
                    "end_date": "2020-08-31T23:59:59Z",
                    "subscriptions": None,
                    "machines": 1,
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
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_yearly_user_subscription_just_started": {
                "parameters": {
                    "account": make_account(),
                    "type": "yearly",
                    "end_date": "2021-08-31T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            id="abc", status="active", period="yearly"
                        )
                    ],
                    "machines": 1,
                    "subscription_id": "abc",
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_yearly_user_subscription_expiring": {
                "parameters": {
                    "account": make_account(),
                    "type": "yearly",
                    "end_date": "2020-09-30T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            id="abc", status="active", period="yearly"
                        ),
                    ],
                    "machines": 1,
                    "subscription_id": "abc",
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
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_yearly_user_subscription_expiring_but_auto_renewing": {
                "parameters": {
                    "account": make_account(),
                    "type": "yearly",
                    "end_date": "2020-09-30T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            id="abc",
                            status="active",
                            period="yearly",
                            is_auto_renewing=True,
                        ),
                    ],
                    "machines": 1,
                    "subscription_id": "abc",
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": True,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": True,
                },
            },
            "test_yearly_user_subscription_grace_period": {
                "parameters": {
                    "account": make_account(),
                    "type": "yearly",
                    "end_date": "2020-08-31T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            id="abc",
                            status="active",
                            period="yearly",
                        ),
                    ],
                    "subscription_id": "abc",
                    "machines": 1,
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": True,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_monthly_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "monthly",
                    "end_date": "2020-09-01T00:00:00Z",
                    "subscription_id": "sub-id-1",
                    "subscriptions": [
                        make_subscription(
                            id="sub-id-1",
                            items=[make_subscription_item()],
                            is_auto_renewing=True,
                        )
                    ],
                    "machines": 1,
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    # Not expiring, because it should auto-renew.
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": True,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": True,
                },
            },
            "test_cancelled_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "monthly",
                    "end_date": "2020-09-05T00:00:00Z",
                    "subscription_id": "sub-id-1",
                    "subscriptions": [
                        make_subscription(
                            id="sub-id-1",
                            items=[make_subscription_item()],
                            status="deactivated",
                        )
                    ],
                    "machines": 0,
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
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_expired_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "monthly",
                    "end_date": "2020-08-01T00:00:00Z",
                    "subscriptions": None,
                    "machines": 1,
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
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_trial_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "trial",
                    "end_date": "2020-08-18T00:00:00Z",
                    "subscriptions": [
                        make_subscription(
                            started_with_trial=True,
                            in_trial=True,
                            status="active",
                            id="abc",
                        )
                    ],
                    "machine": 1,
                    "subscription_id": "abc",
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
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_pending_purchases_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "trial",
                    "end_date": "2020-09-07T23:59:59Z",
                    "subscriptions": [
                        make_subscription(
                            pending_purchases=["pAaBbCcDdEeFfgG"]
                        )
                    ],
                    "machines": 1,
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
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_legacy_user_subscription": {
                "parameters": {
                    "account": make_account(),
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
                    "is_expiring": True,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": True,
                    "is_renewal_actionable": True,
                    "has_pending_purchases": False,
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_non_actionable_legacy_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "legacy",
                    "end_date": "2020-10-01T10:00:00Z",
                    "renewal": make_renewal(actionable=False),
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
                    "is_renewable": True,
                    "is_renewal_actionable": True,
                    "has_pending_purchases": False,
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": False,
                },
            },
            "test_closed_legacy_user_subscription": {
                "parameters": {
                    "account": make_account(),
                    "type": "legacy",
                    "end_date": "2020-10-01T10:00:00Z",
                    "renewal": make_renewal(
                        actionable=True,
                        status="closed",
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
                    "is_renewable": False,
                    "is_renewal_actionable": True,
                    "has_pending_purchases": False,
                    "is_subscription_active": False,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": False,
                    "has_access_to_support": True,
                    "has_access_to_token": True,
                    "is_renewed": True,
                },
            },
            "test_billing_user_subscription": {
                "parameters": {
                    "account": make_account(role="billing"),
                    "type": "monthly",
                    "end_date": "2021-01-01T00:00:00Z",
                    "subscription_id": "sub-id-1",
                    "subscriptions": [
                        make_subscription(
                            id="sub-id-1",
                            items=[make_subscription_item()],
                        )
                    ],
                    "machines": 1,
                },
                "expectations": {
                    "is_upsizeable": True,
                    "is_downsizeable": True,
                    "is_cancellable": True,
                    "is_cancelled": False,
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                    "is_trialled": False,
                    "is_renewable": False,
                    "is_renewal_actionable": False,
                    "has_pending_purchases": False,
                    "is_subscription_active": True,
                    "is_subscription_auto_renewing": False,
                    "should_present_auto_renewal": True,
                    "has_access_to_support": False,
                    "has_access_to_token": False,
                    "is_renewed": False,
                },
            },
        }

        with freeze_time(freeze_datetime):
            for case, scenario in scenarios.items():
                with self.subTest(msg=f"{case}", scenario=scenario):
                    parameters = scenario["parameters"]
                    statuses = get_user_subscription_statuses(
                        account=parameters.get("account"),
                        type=parameters.get("type"),
                        current_number_of_machines=parameters.get("machines"),
                        end_date=parameters.get("end_date"),
                        renewal=parameters.get("renewal"),
                        subscription_id=parameters.get("subscription_id"),
                        subscriptions=parameters.get("subscriptions"),
                    )

                    self.assertEqual(statuses, scenario["expectations"])

    def test_extract_last_purchase_ids(self):
        subscriptions = [
            make_subscription(period="monthly", last_purchase_id="pABC1"),
            make_subscription(
                period="monthly",
                last_purchase_id="pABC1",
                status="deactivated",
            ),
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
