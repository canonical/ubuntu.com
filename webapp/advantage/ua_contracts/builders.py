from typing import List, Dict, Optional

from webapp.advantage.ua_contracts.helpers import (
    group_items_by_listing,
    get_items_aggregated_values,
    get_machine_type,
    is_trialling_user_subscription,
    get_user_subscription_statuses,
    get_price_info,
    get_subscription_by_period,
)
from webapp.advantage.ua_contracts.primitives import (
    Contract,
    Account,
    Subscription,
    ContractItem,
)
from webapp.advantage.models import Listing, UserSubscription


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
            if contract.product_id == "free":
                free_item_groups.append(
                    {
                        "account": user_details.get("account"),
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

            raw_shop_groups = group_items_by_listing(items=contract.items)
            for listing_id in raw_shop_groups:
                listing: Listing = listings[listing_id]
                items: List[ContractItem] = raw_shop_groups[listing_id]

                shop_item_groups.append(
                    {
                        "account": user_details.get("account"),
                        "contract": contract,
                        "items": items,
                        "listing": listing,
                        "marketplace": (
                            listing.marketplace if listing else None
                        ),
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
                if item.renewal is not None:
                    legacy_item_groups.append(
                        {
                            "account": user_details.get("account"),
                            "contract": contract,
                            "items": [item],
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
        aggregated_values = get_items_aggregated_values(items)
        subscription = get_subscription_by_period(subscriptions, listing)
        type = group.get("type")
        number_of_machines = aggregated_values.get("number_of_machines")
        price_info = get_price_info(number_of_machines, items, listing)
        renewal = items[0].renewal if type == "legacy" else None
        product_name = (
            contract.name if type != "free" else "Free Personal Token"
        )
        statuses = get_user_subscription_statuses(
            type=type,
            end_date=aggregated_values.get("end_date"),
            renewal=renewal,
            subscriptions=subscriptions or [],
            listing=listing or None,
        )

        user_subscription = UserSubscription(
            type=type,
            account_id=account.id,
            entitlements=contract.entitlements,
            start_date=aggregated_values.get("start_date"),
            end_date=aggregated_values.get("end_date"),
            number_of_machines=number_of_machines,
            product_name=product_name,
            marketplace=group.get("marketplace"),
            price=price_info.get("price"),
            currency=price_info.get("currency"),
            machine_type=get_machine_type(contract.product_id),
            contract_id=contract.id,
            subscription_id=subscription.id if subscription else None,
            listing_id=listing.id if listing else None,
            period=listing.period if listing else None,
            renewal_id=renewal.id if renewal else None,
            statuses=statuses,
        )

        user_subscriptions.append(user_subscription)

    return user_subscriptions


def build_get_user_info(user_summary: dict = None) -> dict:
    subscription: Optional[Subscription] = user_summary["subscription"]

    if subscription is None:
        return {"has_monthly_subscription": False}

    renewal_info = user_summary["renewal_info"]

    return {
        "has_monthly_subscription": True,
        "is_auto_renewing": subscription.is_auto_renewing,
        "last_payment_date": renewal_info["subscriptionStartOfCycle"],
        "next_payment_date": renewal_info["subscriptionEndOfCycle"],
        "total": renewal_info["total"],
        "currency": renewal_info["currency"].upper(),
    }
