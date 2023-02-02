from distutils.util import strtobool
import os
from datetime import datetime
from typing import Dict, List, Optional

import pytz
from dateutil.parser import parse

from webapp.shop.api.ua_contracts.models import Entitlement, Listing
from webapp.shop.api.ua_contracts.primitives import (
    Account,
    Contract,
    ContractItem,
    Renewal,
    Subscription,
)


def group_shop_items(
    items: List[ContractItem],
) -> Dict[str, List[ContractItem]]:
    item_groups = {}
    for item in items:
        listing_id = item.product_listing_id
        subscription_id = item.subscription_id

        # skip legacy contract items
        if not listing_id or not subscription_id:
            continue

        if item.reason == "trial_started":
            continue

        key = f"{listing_id}||{subscription_id}"
        item_groups[key] = item_groups.get(key, [])
        item_groups[key].append(item)

    return item_groups


def get_items_aggregated_values(items: List[ContractItem], type: str) -> Dict:
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

    # free user subscription end date is None
    if type == "free":
        end_date = None

    return {
        "start_date": start_date,
        "end_date": end_date,
        "number_of_machines": number_of_machines,
    }


def get_current_number_of_machines(
    subscriptions: List[Subscription] = None,
    subscription_id: str = None,
    listing: Listing = None,
) -> int:
    if not subscriptions or not subscription_id or not listing:
        return 0

    subscription = [
        subscription
        for subscription in subscriptions
        if subscription.id == subscription_id
    ]

    if not subscription:
        return 0

    current_item = [
        item
        for item in subscription[0].items
        if item.product_listing_id == listing.id
    ]

    if not current_item:
        return 0

    return current_item[0].value


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
    account: Account,
    type: str,
    current_number_of_machines: int,
    end_date: str = None,
    renewal: Renewal = None,
    subscription_id: str = None,
    subscriptions: List[Subscription] = None,
) -> dict:
    # The explanations below use two concepts:
    # - user subscription: these maps 1:1 with ua-contracts' contract items,
    #   and these are the cards we present in /pro.
    # - billing subscription: a bundle of products as billed periodically in
    #   Stripe. These may lead to the creation of one or more user
    #   subscriptions over time.
    statuses = {
        # is_upsizeable describes whether this user subscription is part of a
        # billing subscription that allows upselling (that's yearly or
        # monthly).
        "is_upsizeable": False,
        # is_upsizeable describes whether this user subscription is part of a
        # billing subscription that allows downselling (that's only monthly).
        "is_downsizeable": False,
        # is_cancellable describes whether this user subscription is part of a
        # billing subscription that can be cancelled at the moment or that can
        # have its items downsold to zero.
        "is_cancellable": False,
        # is_cancelled describes whether this user subscription was part of a
        # billing subscription that was cancelled in the past, or if it was
        # removed from its billing subscription.
        "is_cancelled": False,
        # is_expiring describes whether this user subscription is considered to
        # be expiring because it's close to its end date and it is part of a
        # billing subscription that is not set to auto-renew.
        "is_expiring": False,
        # is_in_grace_period describes whether this user subscription is in
        # its grace period, meaning it's past its end, but it still gives
        # access to the product.
        "is_in_grace_period": False,
        # is_expired describes whether this user subscription is completely
        # expired, past its end date and its grace period.
        "is_expired": False,
        # is_trialled describes whether this user subscription was part of a
        # trial that already ended.
        "is_trialled": False,
        # is_renewable describes whether this user subscription can be renewed
        # via an old-style renewal. Please note that this has nothing to do
        # with renewals via billing subscriptions.
        "is_renewable": False,
        # is_renewal_actionable describes whether a user subscription that
        # is_renewable belongs to a renewal that can be acted on by the user
        # via /pro. If this is False, it means the customer should
        # contact support to renew (because it's a special old-style renewal).
        "is_renewal_actionable": False,
        # has_pending_purchases describes whether this user subscription
        # belongs to a billing subscription that has pending purchases, and
        # thus it cannot be modified because of that.
        "has_pending_purchases": False,
        # is_subscription_active describes whether this user subscription
        # belongs to a billing subscription that is currently locked (with a
        # pending purchase) or active.
        "is_subscription_active": False,
        # is_subscription_auto_renewing describes whether this user
        # subscription belongs to a billing subscription that is configured to
        # auto-renew. Please note that this has nothing to do with
        # is_renewable above, which applies to old-style, manual renewals.
        "is_subscription_auto_renewing": False,
        # should_present_auto_renewal describes whether this user subscription
        # belongs to a billing subscription that should have its auto-renewal
        # option displayed to the user at the current time.
        "should_present_auto_renewal": False,
        # has_access_to_support describes whether this user subscription
        # displays the Support portal button. At the moment `billing` users
        # do not have access
        "has_access_to_support": False,
        # has_access_to_token describes whether this user subscription displays
        # the token or not. At the moment `billing` users do not have access
        "has_access_to_token": False,
        # is_renewed describes whether this user subscription has been renewed
        # already or not
        "is_renewed": False,
    }

    if account.role != "billing":
        statuses["has_access_to_support"] = True
        statuses["has_access_to_token"] = True

    if type == "free" or strtobool(os.getenv("STORE_MAINTENANCE", "false")):
        return statuses

    if renewal is None or (renewal and renewal.status != "closed"):
        date_statuses = get_date_statuses(type, end_date)
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
        active_trial = [
            subscription
            for subscription in subscriptions
            if subscription.started_with_trial
            and subscription.in_trial
            and subscription.status == "active"
        ]

        statuses["is_trialled"] = True if active_trial else False

    if type in ["yearly", "monthly"]:
        statuses["is_subscription_active"] = is_billing_subscription_active(
            subscriptions, subscription_id
        )
        statuses[
            "is_subscription_auto_renewing"
        ] = is_billing_subscription_auto_renewing(
            subscriptions, subscription_id
        )

        statuses["is_renewed"] = is_subscription_auto_renewing(
            subscriptions, subscription_id
        )

        is_cancelled = True if not current_number_of_machines else False
        statuses["is_cancelled"] = is_cancelled
        statuses["should_present_auto_renewal"] = (
            statuses["is_subscription_active"] and not is_cancelled
        )

        # If the subscription is set to auto-renew, we shouldn't alarm the
        # user.
        if statuses["is_subscription_auto_renewing"]:
            statuses["is_expiring"] = False

        if not is_cancelled:
            statuses["is_upsizeable"] = True
            statuses["is_downsizeable"] = True
            statuses["is_cancellable"] = True

    if type == "legacy" and renewal is None:
        return statuses

    if type == "legacy":
        statuses["is_renewal_actionable"] = renewal.actionable or False

        if renewal.actionable and renewal.status == "pending":
            start = parse(renewal.start_date)
            end = parse(renewal.end_date)
            time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
            if start <= time_now <= end:
                statuses["is_renewable"] = True

        if renewal.status in ["done", "closed"]:
            statuses["is_renewed"] = True

    return statuses


def get_date_statuses(type: str, end_date: str) -> dict:
    parsed_end_date = parse(end_date)
    time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
    delta_till_expiry = parsed_end_date - time_now
    days_till_expiry = delta_till_expiry.days

    if type != "legacy":
        is_expiring_start = 60 if type == "yearly" else 7
        is_expiring_end = 0
        grace_period_end = -14
    else:
        # legacy purchases can be renewed 90 before and after expiry
        is_expiring_start = 90
        is_expiring_end = 0
        grace_period_end = -90

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
    listing: Listing, subscriptions: List[Subscription], subscription_id: str
) -> bool:
    listing_found = False
    for subscription in subscriptions:
        allowed_status = subscription.status in ["active", "locked"]
        if subscription.id != subscription_id or not allowed_status:
            continue

        for item in subscription.items:
            if item.product_listing_id == listing.id:
                listing_found = True

                break

    is_cancelled = True if not listing_found else False

    return is_cancelled


def is_billing_subscription_active(
    subscriptions: List[Subscription], subscription_id: str
) -> bool:
    for subscription in subscriptions:
        if subscription.id == subscription_id and subscription.status in [
            "active",
            "locked",
        ]:
            return True

    return False


def is_subscription_auto_renewing(
    subscriptions: List[Subscription], subscription_id: str
) -> bool:
    subscription = [
        subscription
        for subscription in subscriptions
        if subscription.id == subscription_id
    ]

    if not subscription:
        return False

    return subscription[0].is_auto_renewing


def is_billing_subscription_auto_renewing(
    subscriptions: List[Subscription], subscription_id: str
) -> bool:
    for subscription in subscriptions:
        if (
            subscription.id == subscription_id
            and subscription.status in ["active", "locked"]
            and subscription.is_auto_renewing
        ):
            return True

    return False


def extract_last_purchase_ids(subscriptions: List[Subscription]) -> Dict:
    last_purchase_ids = {
        "monthly": "",
        "yearly": "",
    }

    for subscription in subscriptions:
        if subscription.status not in ["active", "locked"]:
            continue

        last_purchase_ids[subscription.period] = subscription.last_purchase_id

    return last_purchase_ids


def set_listings_trial_status(
    listings: Dict[str, Listing], subscriptions: List[Subscription]
) -> Dict[str, Listing]:
    user_can_trial = True
    for subscription in subscriptions:
        stated_with_trial = subscription.started_with_trial
        status = subscription.status
        if stated_with_trial or status in ["active", "locked"]:
            user_can_trial = False

            break

    for listing_id, listing in listings.items():
        listing_can_be_trialled = listing.trial_days and listing.trial_days > 0
        listing.set_can_be_trialled(listing_can_be_trialled and user_can_trial)

    return listings


def make_user_subscription_id(
    account: Account,
    type: str,
    contract: Contract,
    renewal: Renewal = None,
    subscription_id: str = None,
    item_id: id = None,
) -> str:
    id_elements = [type, account.id, contract.id]
    if renewal:
        id_elements.append(renewal.id)

    if subscription_id:
        id_elements.append(subscription_id)

    if item_id:
        id_elements.append(str(item_id))

    return "||".join(id_elements)


def apply_entitlement_rules(
    entitlements: List[Entitlement],
) -> List[Entitlement]:
    allowed_entitlements = [
        "cis",
        "esm-infra",
        "esm-apps",
        "fips",
        "fips-updates",
        "livepatch",
        "support",
    ]

    allowed_support_level = ["standard", "advanced"]

    final_entitlements = []
    has_no_esm_apps = True
    has_livepatch_on = False
    has_fips_on = False
    has_fips_updates_on = False
    support_entitlement = None
    for entitlement in entitlements:
        if entitlement.type in allowed_entitlements:
            if entitlement.type == "esm-apps":
                has_no_esm_apps = False
            if entitlement.type == "livepatch":
                has_livepatch_on = entitlement.enabled_by_default
            if entitlement.type == "fips-updates":
                has_fips_updates_on = entitlement.enabled_by_default
            if entitlement.type == "fips":
                has_fips_on = entitlement.enabled_by_default

            if entitlement.type != "support":
                final_entitlements.append(entitlement)
                continue

            if entitlement.support_level in allowed_support_level:
                entitlement.enabled_by_default = True
                support_entitlement = entitlement
                final_entitlements.append(entitlement)

    if has_no_esm_apps:
        final_entitlements.append(
            Entitlement(
                type="esm-apps",
                enabled_by_default=False,
                is_available=False,
                is_editable=False,
                is_in_beta=False,
            )
        )

    if support_entitlement:
        final_entitlements.append(
            Entitlement(
                type="support",
                support_level="advanced",
                enabled_by_default=False,
                is_available=False,
                is_editable=False,
            )
        )

        if support_entitlement.support_level == "essential":
            final_entitlements.append(
                Entitlement(
                    type="support",
                    support_level="standard",
                    enabled_by_default=False,
                    is_available=False,
                    is_editable=False,
                )
            )

    for entitlement in final_entitlements:
        if entitlement.type == "support":
            entitlement.is_editable = False

        if has_fips_on:
            if entitlement.type == "livepatch":
                entitlement.is_editable = False
                entitlement.enabled_by_default = False
            if entitlement.type == "fips-updates":
                entitlement.is_editable = False
                entitlement.enabled_by_default = False
        elif has_livepatch_on or has_fips_updates_on:
            if entitlement.type == "fips":
                entitlement.is_editable = False
                entitlement.enabled_by_default = False

        if entitlement.is_in_beta:
            entitlement.is_editable = not entitlement.is_in_beta

    return final_entitlements


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
        for key, value in structure.items():
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
