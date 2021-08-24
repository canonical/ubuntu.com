from typing import List, Dict

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
    grouped_items = build_initial_user_subscriptions(
        user_summary=user_summary,
        listings=listings,
    )

    return build_final_user_subscriptions(grouped_items)


def build_initial_user_subscriptions(
    user_summary: List, listings: Dict[str, Listing]
) -> List:
    free_groups = []
    shop_groups = []
    legacy_groups = []
    for user_details in user_summary:
        contracts: List[Contract] = user_details.get("contracts")
        account: Account = user_details.get("account")
        subscriptions: List[Subscription] = user_details.get("subscriptions")

        for contract in contracts:
            # Free user subscriptions
            if contract.product_id == "free":
                free_groups.append(
                    {
                        "account": account,
                        "contract": contract,
                        "listing": None,
                        "subscriptions": subscriptions,
                        "items": contract.items,
                        "type": "free",
                    }
                )

                continue

            # Shop user subscriptions
            raw_shop_groups = group_items_by_listing(items=contract.items)
            for listing_id in raw_shop_groups:
                listing: Listing = listings[listing_id]
                items: List[ContractItem] = raw_shop_groups[listing_id]
                is_trialled = is_trialling_user_subscription(items=items)

                shop_groups.append(
                    {
                        "account": account,
                        "contract": contract,
                        "listing": listing,
                        "subscriptions": subscriptions,
                        "items": items,
                        "type": listing.period if not is_trialled else "trial",
                    }
                )

    return free_groups + shop_groups + legacy_groups


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
            marketplace=listing.marketplace if listing else None,
            price_per_unit=listing.price if listing else None,
            machine_type=get_machine_type(contract.product_id),
            statuses=get_user_subscription_statuses(
                type=group.get("type"),
                end_date=aggregated_values.get("end_date"),
                subscriptions=subscriptions or [],
                listing=listing or None,
            ),
        )

        user_subscriptions.append(user_subscription)

    return user_subscriptions
