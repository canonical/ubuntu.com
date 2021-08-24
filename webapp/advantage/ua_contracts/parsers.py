from typing import List, Dict

from webapp.advantage.ua_contracts.primitives import (
    Entitlement,
    Contract,
    ContractItem,
    Subscription,
    SubscriptionItem,
    Product,
    Account,
)
from webapp.advantage.models import Listing


def parse_product(raw_product: dict) -> Product:
    return Product(
        id=raw_product.get("id"),
        name=raw_product.get("name"),
    )


def parse_product_listing(
    raw_product_listing: dict, raw_products: dict
) -> Listing:
    product = None
    for raw_product in raw_products:
        if raw_product.get("id") == raw_product_listing.get("productID"):
            product = parse_product(raw_product)
            break

    return Listing(
        id=raw_product_listing.get("id"),
        name=raw_product_listing.get("name"),
        marketplace=raw_product_listing.get("marketplace"),
        product_name=product.name,
        price=raw_product_listing.get("price").get("value"),
        currency=raw_product_listing.get("price").get("currency"),
        status=raw_product_listing.get("status"),
        trial_days=raw_product_listing.get("trialDays"),
        period=raw_product_listing.get("period"),
    )


def parse_product_listings(
    raw_product_listings: dict,
    raw_products: dict,
) -> Dict[str, Listing]:
    return {
        product_listing.get("id"): parse_product_listing(
            product_listing, raw_products
        )
        for product_listing in raw_product_listings
    }


def parse_account(raw_account: dict) -> Account:
    return Account(
        id=raw_account.get("id"),
        name=raw_account.get("name"),
    )


def parse_accounts(raw_accounts: dict) -> List[Account]:
    return [parse_account(raw_account) for raw_account in raw_accounts]


def parse_entitlements(raw_entitlements: dict) -> List[Entitlement]:
    entitlements = []
    for raw_entitlement in raw_entitlements:
        affordances = raw_entitlement.get("affordances")
        obligations = raw_entitlement.get("obligations")

        support_level = None
        if affordances:
            support_level = affordances.get("supportLevel")

        entitlement = Entitlement(
            type=raw_entitlement.get("type"),
            support_level=support_level,
            enabled_by_default=obligations.get("enableByDefault"),
        )

        entitlements.append(entitlement)

    return entitlements


def parse_contract_items(raw_items: dict) -> List[ContractItem]:
    items = []
    raw_items = raw_items or []
    for raw_item in raw_items:
        item = ContractItem(
            contract_id=raw_item.get("contractID"),
            created_at=raw_item.get("created"),
            start_date=raw_item.get("effectiveFrom"),
            end_date=raw_item.get("effectiveTo"),
            reason=raw_item.get("reason"),
            value=raw_item.get("value"),
            product_listing_id=raw_item.get("productListingID"),
            purchase_id=raw_item.get("purchaseID"),
            trial_id=raw_item.get("trialID"),
        )

        items.append(item)

    return items


def parse_contract(raw_contract: dict) -> Contract:
    account_info = raw_contract.get("accountInfo")
    contract_info = raw_contract.get("contractInfo")
    raw_entitlements = contract_info.get("resourceEntitlements")
    entitlements = parse_entitlements(raw_entitlements)
    raw_items = contract_info.get("items")
    items = parse_contract_items(raw_items)

    return Contract(
        id=contract_info.get("id"),
        account_id=account_info.get("id"),
        name=contract_info.get("name"),
        product_id=contract_info.get("products")[0],
        entitlements=entitlements,
        items=items,
    )


def parse_contracts(raw_contracts: dict) -> List[Contract]:
    return [parse_contract(raw_contract) for raw_contract in raw_contracts]


def parse_subscription_items(
    subscription_id: str,
    raw_items: dict,
) -> List[SubscriptionItem]:
    subscription_items = []
    for raw_item in raw_items:
        subscription_item = SubscriptionItem(
            subscription_id=subscription_id,
            product_listing_id=raw_item.get("productListing").get("id"),
            value=raw_item.get("value"),
        )

        subscription_items.append(subscription_item)

    return subscription_items


def parse_subscription(raw_subscription: dict) -> Subscription:
    subscription_id = raw_subscription.get("subscription").get("id")
    raw_items = raw_subscription.get("purchasedProductListings")

    return Subscription(
        id=subscription_id,
        account_id=raw_subscription.get("subscription").get("accountID"),
        marketplace=raw_subscription.get("subscription").get("marketplace"),
        period=raw_subscription.get("subscription").get("period"),
        status=raw_subscription.get("subscription").get("status"),
        last_purchase_id=raw_subscription.get("lastPurchaseID"),
        pending_purchases=raw_subscription.get("pendingPurchases"),
        items=parse_subscription_items(subscription_id, raw_items),
    )


def parse_subscriptions(raw_subscriptions: dict) -> List[Subscription]:
    return [
        parse_subscription(raw_subscription)
        for raw_subscription in raw_subscriptions
    ]
