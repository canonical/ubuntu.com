from datetime import datetime
from typing import List, Dict

import pytz
from dateutil.parser import parse

from webapp.shop.api.ua_contracts.helpers import (
    get_items_aggregated_values,
    get_machine_type,
    get_user_subscription_statuses,
    get_price_info,
    make_user_subscription_id,
    apply_entitlement_rules,
    group_shop_items,
    get_current_number_of_machines,
)
from webapp.shop.api.ua_contracts.primitives import (
    Contract,
    Account,
    Subscription,
    ContractItem,
)
from webapp.shop.api.ua_contracts.models import Listing, UserSubscription


def build_user_subscriptions(
    user_summary: List, listings: Dict[str, Listing]
) -> List[UserSubscription]:
    grouped_items = build_initial_user_subscriptions(user_summary, listings)
    user_subscriptions = build_final_user_subscriptions(grouped_items)

    return user_subscriptions


def build_initial_user_subscriptions(
    user_summary: List, listings: Dict[str, Listing]
) -> List:
    free_groups = build_free_item_groups(user_summary)
    trial_groups = build_trial_item_groups(user_summary, listings)
    shop_groups = build_shop_item_groups(user_summary, listings)
    legacy_groups = build_legacy_item_groups(user_summary)

    return free_groups + trial_groups + shop_groups + legacy_groups


def build_free_item_groups(user_summary: List) -> List:
    free_item_groups = []
    for user_details in user_summary:
        contracts: List[Contract] = user_details.get("contracts")

        for contract in contracts:
            # skip contracts without items
            if contract.items is None:
                continue

            account: Account = user_details.get("account")
            if account.type == "personal" and contract.product_id == "free":
                free_item_groups.append(
                    {
                        "account": account,
                        "contract": contract,
                        "items": contract.items,
                        "listing": None,
                        "marketplace": "free",
                        "subscriptions": user_details.get("subscriptions"),
                        "type": "free",
                    }
                )

    return free_item_groups


def build_trial_item_groups(
    user_summary: List, listings: Dict[str, Listing]
) -> List:
    trial_item_groups = []
    for user_details in user_summary:
        contracts: List[Contract] = user_details.get("contracts")

        for contract in contracts:
            # skip free contracts
            if contract.product_id == "free":
                continue

            # skip contracts without items
            if contract.items is None:
                continue

            for item in contract.items:
                if item.reason == "trial_started":
                    listing = listings[item.product_listing_id]
                    trial_item_groups.append(
                        {
                            "account": user_details.get("account"),
                            "contract": contract,
                            "items": [item],
                            "listing": listing,
                            "marketplace": listing.marketplace,
                            "subscriptions": user_details.get("subscriptions"),
                            "subscription_id": item.subscription_id,
                            "type": "trial",
                        }
                    )

    return trial_item_groups


def build_shop_item_groups(
    user_summary: List, listings: Dict[str, Listing]
) -> List:
    shop_item_groups = []
    for user_details in user_summary:
        contracts: List[Contract] = user_details.get("contracts")

        for contract in contracts:
            # skip free contracts
            if contract.product_id == "free":
                continue

            # skip contracts without items
            if contract.items is None:
                continue

            raw_shop_groups = group_shop_items(items=contract.items)
            for key in raw_shop_groups:
                key_parts = key.split("||")
                listing_id = key_parts[0]
                subscription_id = key_parts[1]

                listing: Listing = listings[listing_id]
                items: List[ContractItem] = raw_shop_groups[key]

                shop_item_groups.append(
                    {
                        "account": user_details.get("account"),
                        "contract": contract,
                        "items": items,
                        "listing": listing,
                        "subscription_id": subscription_id,
                        "marketplace": listing.marketplace,
                        "subscriptions": user_details.get("subscriptions"),
                        "type": listing.period,
                    }
                )

    return shop_item_groups


def build_legacy_item_groups(user_summary: List) -> List:
    legacy_item_groups = []
    for user_details in user_summary:
        contracts: List[Contract] = user_details.get("contracts")

        for contract in contracts:
            # skip free contracts
            if contract.product_id == "free":
                continue

            # skip contracts without items
            if contract.items is None:
                continue

            for item in contract.items:
                if (
                    item.product_listing_id is None
                    or item.subscription_id is None
                ):
                    legacy_item_groups.append(
                        {
                            "account": user_details.get("account"),
                            "contract": contract,
                            "items": [item],
                            "renewal": item.renewal,
                            "item_id": item.id,
                            "listing": None,
                            "marketplace": "canonical-ua",
                            "subscriptions": user_details.get("subscriptions"),
                            "type": "legacy",
                        }
                    )

    return legacy_item_groups


def build_final_user_subscriptions(
    grouped_items: List,
) -> List[UserSubscription]:
    user_subscriptions = []
    for group in grouped_items:
        account: Account = group.get("account")
        listing: Listing = group.get("listing")
        contract: Contract = group.get("contract")
        subscriptions: List[Subscription] = group.get("subscriptions")
        items: List[ContractItem] = group.get("items")
        marketplace = group.get("marketplace")
        type = group.get("type")
        renewal = group.get("renewal")
        item_id = group.get("item_id")
        subscription_id = group.get("subscription_id")
        aggregated_values = get_items_aggregated_values(items, type)
        number_of_machines = aggregated_values.get("number_of_machines")
        end_date = aggregated_values.get("end_date")
        current_number_of_machines = (
            get_current_number_of_machines(
                subscriptions, subscription_id, listing
            )
            if type != "legacy"
            else (
                renewal.number_of_machines if renewal else number_of_machines
            )
        )
        price_info = get_price_info(number_of_machines, items, listing)
        product_name = (
            contract.name if type != "free" else "Free Personal Token"
        )
        statuses = get_user_subscription_statuses(
            account=account,
            type=type,
            current_number_of_machines=current_number_of_machines,
            end_date=end_date,
            renewal=renewal,
            subscription_id=subscription_id,
            subscriptions=subscriptions or [],
        )

        id = make_user_subscription_id(
            account, type, contract, renewal, subscription_id, item_id
        )

        entitlements = (
            apply_entitlement_rules(contract.entitlements)
            if marketplace in ["canonical-ua", "free"]
            else []
        )

        user_subscription = UserSubscription(
            id=id,
            type=type,
            account_id=account.id,
            entitlements=entitlements,
            start_date=aggregated_values.get("start_date"),
            end_date=end_date,
            number_of_machines=number_of_machines,
            number_of_active_machines=contract.number_of_active_machines,
            current_number_of_machines=current_number_of_machines,
            product_name=product_name,
            marketplace=marketplace,
            price=price_info.get("price"),
            currency=price_info.get("currency"),
            machine_type=get_machine_type(contract.product_id),
            contract_id=contract.id,
            subscription_id=subscription_id,
            listing_id=listing.id if listing else None,
            period=listing.period if listing else None,
            renewal_id=renewal.id if renewal else None,
            statuses=statuses,
        )

        # Do not return expired user subscriptions after 90 days
        show_user_subscription = True
        days_to_show = -90
        if type != "free":
            parsed_end_date = parse(user_subscription.end_date)
            time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
            delta_till_expiry = parsed_end_date - time_now
            days_till_expiry = delta_till_expiry.days
            show_user_subscription = days_till_expiry >= days_to_show

        if show_user_subscription:
            user_subscriptions.append(user_subscription)

    return user_subscriptions
