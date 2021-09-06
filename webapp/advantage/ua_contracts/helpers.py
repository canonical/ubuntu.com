from datetime import datetime
from typing import List, Optional, Dict

import pytz
from dateutil.parser import parse

from webapp.advantage.models import Listing
from webapp.advantage.ua_contracts.primitives import (
    Subscription,
    ContractItem,
    Renewal,
)


def group_items_by_listing(
    items: List[ContractItem],
) -> Dict[str, List[ContractItem]]:
    item_groups = {}
    for item in items:
        listing_id = item.product_listing_id

        # skip legacy contract items
        if not listing_id:
            continue

        item_groups[listing_id] = item_groups.get(listing_id, [])
        item_groups[listing_id].append(item)

    return item_groups


def get_items_aggregated_values(
    items: List[ContractItem],
) -> Dict:
    start_date = None
    end_date = None
    number_of_machines = 0
    for item in items:
        number_of_machines = number_of_machines + item.value

        if not start_date:
            start_date = item.start_date

        if not end_date:
            end_date = item.end_date

        if start_date and start_date > item.start_date:
            start_date = item.start_date

        if end_date and end_date < item.end_date:
            end_date = item.end_date

    parsed_end_date = parse(end_date)
    # free user subscription end date is None
    if parsed_end_date.year == 9999:
        end_date = None

    return {
        "start_date": start_date,
        "end_date": end_date,
        "number_of_machines": number_of_machines,
    }


def get_price_info(
    number_of_machines: int = None,
    items: List[ContractItem] = None,
    listing: Listing = None,
) -> Dict:
    price_info = {
        "price": None,
        "currency": "USD",
    }

    if listing and number_of_machines:
        price_info["price"] = number_of_machines * listing.price
        price_info["currency"] = listing.currency

        return price_info

    if items and len(items) == 1 and items[0].renewal:
        legacy_item = items[0]
        price_info["price"] = legacy_item.renewal.price
        price_info["currency"] = legacy_item.renewal.currency

        return price_info

    return price_info


def get_machine_type(product_id: str) -> Optional[str]:
    if "virtual" in product_id:
        return "virtual"
    if "physical" in product_id:
        return "physical"
    if "desktop" in product_id:
        return "desktop"

    # some product ids don't mention the machine type
    # those products are all "physical", so I set it as default
    return "physical"


def is_trialling_user_subscription(items: List[ContractItem]) -> bool:
    return len(items) == 1 and items[0].reason == "trial_started"


def get_user_subscription_statuses(
    type: str,
    end_date: str = None,
    renewal: Renewal = None,
    subscriptions: List[Subscription] = None,
    listing: Listing = None,
) -> dict:
    statuses = {
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
    }

    if type == "free":
        return statuses

    date_statuses = get_date_statuses(end_date)
    statuses["is_expiring"] = date_statuses["is_expiring"]
    statuses["is_in_grace_period"] = date_statuses["is_in_grace_period"]
    statuses["is_expired"] = date_statuses["is_expired"]

    if statuses["is_expired"]:
        return statuses

    subscriptions = subscriptions or []
    if has_pending_purchases(subscriptions):
        statuses["has_pending_purchases"] = True
        return statuses

    if type == "trial":
        statuses["is_trialled"] = True

    if type == "yearly":
        statuses["is_upsizeable"] = True

    if type == "monthly":
        is_cancelled = is_user_subscription_cancelled(listing, subscriptions)
        statuses["is_cancelled"] = is_cancelled

        if not is_cancelled:
            statuses["is_upsizeable"] = True
            statuses["is_downsizeable"] = True
            statuses["is_cancellable"] = True

    if type == "legacy":
        statuses["is_renewal_actionable"] = renewal.actionable

        if renewal.actionable and renewal.status == "pending":
            start = parse(renewal.start_date)
            end = parse(renewal.end_date)
            time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
            if start <= time_now <= end:
                statuses["is_renewable"] = True

    return statuses


def get_date_statuses(end_date: str) -> dict:
    parsed_end_date = parse(end_date)
    time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
    delta_till_expiry = parsed_end_date - time_now
    days_till_expiry = delta_till_expiry.days

    is_expiring_start = 30
    is_expiring_end = 0
    grace_period_end = -14

    is_expiring = is_expiring_start > days_till_expiry >= is_expiring_end
    is_in_grace_period = is_expiring_end > days_till_expiry >= grace_period_end
    is_expired = grace_period_end > days_till_expiry

    return {
        "is_expiring": is_expiring,
        "is_in_grace_period": is_in_grace_period,
        "is_expired": is_expired,
    }


def get_pending_purchases(subscriptions: List[Subscription]) -> List:
    pending_purchases = []
    for subscription in subscriptions:
        purchases_ids = subscription.pending_purchases
        if purchases_ids and len(purchases_ids) > 0:
            pending_purchases.extend(purchases_ids)

    return pending_purchases


def has_pending_purchases(subscriptions: List[Subscription]) -> bool:
    return len(get_pending_purchases(subscriptions=subscriptions)) > 0


def is_user_subscription_cancelled(
    listing: Listing, subscriptions: List[Subscription]
) -> bool:
    listing_found = False
    for subscription in subscriptions:
        for item in subscription.items:
            if item.product_listing_id == listing.id:
                listing_found = True

            break

    is_cancelled = True if not listing_found else False

    return is_cancelled


def extract_last_purchase_ids(subscriptions: List[Subscription]) -> Dict:
    last_purchase_ids = {
        "monthly": "",
        "yearly": "",
    }

    for subscription in subscriptions:
        period = subscription.period
        last_purchase_ids[period] = subscription.last_purchase_id

    return last_purchase_ids


def get_subscription_by_period(
    subscriptions: List[Subscription], listing: Listing
) -> Optional[Subscription]:
    filtered_subscriptions = [
        subscription
        for subscription in subscriptions
        if subscription.period == listing.period
    ]

    return filtered_subscriptions[0] if filtered_subscriptions else None


def to_dict(structure, class_key=None):
    """Converts structure to dictionary

    Parameters
    ----------
    structure: Any
        Can be a String, Object, List/Dict of Strings or Objects
    class_key: str
        Stores the name of the object, used as a key in the dict.

    Returns
    -------
    dict
        If structure is an object
    Any
        The same type as structure
    """
    if isinstance(structure, list):
        data = []
        for value in structure:
            data.append(to_dict(value))
        return data
    elif isinstance(structure, dict):
        data = {}
        for (key, value) in structure.items():
            data[key] = to_dict(value, class_key)
        return data
    elif hasattr(structure, "__dict__"):
        data = dict(
            [
                (key, to_dict(value, class_key))
                for key, value in structure.__dict__.items()
                if not callable(value) and not key.startswith("_")
            ]
        )
        if class_key is not None and hasattr(structure, "__class__"):
            data[class_key] = structure.__class__.__name__
        return data
    else:
        return structure
