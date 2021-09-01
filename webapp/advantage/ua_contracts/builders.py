from typing import List, Dict, Optional

from dateutil.parser import parse

from webapp.advantage.ua_contracts.helpers import (
    group_items_by_listing,
    get_items_aggregated_values,
    get_machine_type,
    is_trialling_user_subscription,
    get_user_subscription_statuses,
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
    shop_groups = build_shop_item_groups(user_summary, listings)
    legacy_groups = []

    return free_groups + shop_groups + legacy_groups


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
                is_trialled = is_trialling_user_subscription(items=items)

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
                        "type": listing.period if not is_trialled else "trial",
                    }
                )

    return shop_item_groups


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

        user_subscription = UserSubscription(
            type=group.get("type"),
            account_id=account.id,
            entitlements=contract.entitlements,
            start_date=aggregated_values.get("start_date"),
            end_date=aggregated_values.get("end_date"),
            number_of_machines=aggregated_values.get("number_of_machines"),
            product_name=listing.product_name if listing else None,
            marketplace=group.get("marketplace"),
            price_per_unit=listing.price if listing else None,
            machine_type=get_machine_type(contract.product_id),
            listing_id=listing.id if listing else None,
            period=listing.period if listing else None,
            statuses=get_user_subscription_statuses(
                type=group.get("type"),
                end_date=aggregated_values.get("end_date"),
                subscriptions=subscriptions or [],
                listing=listing or None,
            ),
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
        "is_renewing": subscription.is_renewing,
        "last_payment_date": renewal_info["subscriptionStartOfCycle"],
        "next_payment_date": renewal_info["subscriptionEndOfCycle"],
        "total": renewal_info["total"],
        "currency": renewal_info["currency"],
    }
