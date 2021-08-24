import unittest

from freezegun import freeze_time

from tests.advantage.helpers import (
    make_subscription,
    make_listing,
    make_contract_item,
    make_free_trial_contract,
    make_shop_contract,
    make_subscription_item,
)
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
        self.assertEqual(machine_type, None)

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
            "date_is_31_days_before_expiry": {
                "date": "2020-10-02T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_30_days_and_one_second_before_expiry_start": {
                "date": "2020-10-01T00:00:00Z",
                "expectations": {
                    "is_expiring": False,
                    "is_in_grace_period": False,
                    "is_expired": False,
                },
            },
            "date_is_30_days_before_expiry": {
                "date": "2020-09-30T23:59:59Z",
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
                },
            },
            "test_trial_user_subscription": {
                "parameters": {
                    "type": "trial",
                    "end_date": "2020-08-18T00:00:00Z",
                    "subscriptions": None,
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
                },
            },
            "test_pending_purchases_user_subscription": {
                "parameters": {
                    "type": "trial",
                    "end_date": "2020-09-30T23:59:59Z",
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
                },
            },
        }

        with freeze_time(freeze_datetime):
            for case, scenario in scenarios.items():
                with self.subTest(msg=f"{case}", scenario=scenario):
                    parameters = scenario["parameters"]
                    statuses = get_user_subscription_statuses(
                        type=parameters["type"],
                        end_date=parameters["end_date"],
                        subscriptions=parameters["subscriptions"],
                        listing=parameters["listing"],
                    )

                    self.assertEqual(statuses, scenario["expectations"])
