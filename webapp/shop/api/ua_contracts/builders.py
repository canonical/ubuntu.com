from datetime import datetime
from typing import List, Dict, Optional

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
    contract_items: List, listings: Dict[str, Listing]
) -> List[UserSubscription]:
    free_subscriptions = []
    trials = []
    legacy_subscriptions = []
    marketplace_subscriptions = {}

    grouped_items = {}
    for contract_item in contract_items:
        subscription_key = f'{contract_item["contractContext"]["products"][0]}-{contract_item["presentationHint"]}'
        if subscription_key in grouped_items:
            grouped_items[subscription_key].append(contract_item)
        else:
            grouped_items[subscription_key] = [contract_item]

    for subscription_key, items in grouped_items.values():
        if items[0]["presentationHint"] == "free":
            subscription = build_user_subscription(
                {
                    "account": items[0].get("accountContext"),
                    "contract": contract,
                    "items": items,
                    "listing": None,
                    "marketplace": "free",
                    "subscriptions": summary.get("subscriptions"),
                    "type": "free",
                }
            )

            if subscription.active:
                free_subscriptions.append(subscription)

        elif items[0]["presentationHint"] == "legacy":
            subscription = build_user_subscription(
                {
                    "account": summary.get("account"),
                    "contract": contract,
                    "items": [item],
                    "renewal": item.renewal,
                    "item_id": item.id,
                    "listing": None,
                    "marketplace": "canonical-ua",
                    "subscriptions": summary.get("subscriptions"),
                    "type": "legacy",
                }
            )

        elif items[0]["presentationHint"] == "trial":
            listing = listings[item.product_listing_id]
            subscription = build_user_subscription(
                {
                    "account": summary.get("account"),
                    "contract": contract,
                    "items": [item],
                    "listing": listing,
                    "marketplace": listing.marketplace,
                    "subscriptions": summary.get("subscriptions"),
                    "type": "trial",
                }
            )
        
        else:
            listing_id = item.product_listing_id
            subscription_id = item.subscription_id
            listing: Listing = listings[listing_id]
            subscription = build_user_subscription(
                {
                    "account": summary.get("account"),
                    "contract": contract,
                    "items": [item],
                    "listing": listing,
                    "subscription_id": subscription_id,
                    "marketplace": listing.marketplace,
                    "subscriptions": summary.get("subscriptions"),
                    "type": listing.period,
                }
            )

    return free_subscriptions + trials + marketplace_subscriptions + legacy_subscriptions


def build_user_subscription(
    group: List,
) -> List[UserSubscription]:
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
    current_number_of_machines = get_current_number_of_machines(
        subscriptions, subscription_id, listing
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
        if marketplace == "canonical-ua"
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

    return user_subscription
