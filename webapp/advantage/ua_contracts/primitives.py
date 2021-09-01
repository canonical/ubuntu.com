from typing import List


class Entitlement:
    def __init__(
        self,
        type: str,
        enabled_by_default: bool,
        support_level: str = None,
    ):
        self.type = type
        self.support_level = support_level
        self.enabled_by_default = enabled_by_default


class Product:
    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.id = id
        self.name = name


class ContractItem:
    def __init__(
        self,
        contract_id: str,
        created_at: str,
        start_date: str,
        end_date: str,
        reason: str,
        value: int,
        product_listing_id: str = None,
        purchase_id: str = None,
        trial_id: str = None,
    ):
        self.contract_id = contract_id
        self.created_at = created_at
        self.start_date = start_date
        self.end_date = end_date
        self.reason = reason
        self.value = value
        self.product_listing_id = product_listing_id
        self.purchase_id = purchase_id
        self.trial_id = trial_id


class Contract:
    def __init__(
        self,
        id: str,
        account_id: str,
        name: str,
        product_id: str,
        entitlements: List[Entitlement],
        items: List[ContractItem] = None,
    ):
        self.id = id
        self.account_id = account_id
        self.name = name
        self.product_id = product_id
        self.entitlements = entitlements
        self.items = items


class SubscriptionItem:
    def __init__(
        self,
        subscription_id: str,
        product_listing_id: str,
        value: int,
    ):
        self.subscription_id = subscription_id
        self.product_listing_id = product_listing_id
        self.value = value


class Subscription:
    def __init__(
        self,
        id: str,
        account_id: str,
        marketplace: str,
        status: str,
        period: str = None,
        items: List[SubscriptionItem] = None,
        last_purchase_id: str = None,
        is_renewing: bool = None,
        pending_purchases: List[str] = None,
    ):
        self.id = id
        self.account_id = account_id
        self.marketplace = marketplace
        self.period = period
        self.status = status
        self.last_purchase_id = last_purchase_id
        self.pending_purchases = pending_purchases
        self.is_renewing = is_renewing
        self.items = items


class Account:
    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.id = id
        self.name = name
