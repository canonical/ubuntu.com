from typing import List

from webapp.advantage.models import Entitlement


class Renewal:
    def __init__(
        self,
        id: str,
        contract_id: str,
        actionable: bool,
        status: str,
        start_date: str,
        end_date: str,
        new_contract_start: str,
        price: int,
        currency: str
    ):
        self.id = id
        self.contract_id = contract_id
        self.actionable = actionable
        self.status = status
        self.start_date = start_date
        self.end_date = end_date
        self.price = price
        self.currency = currency
        self.new_contract_start = new_contract_start


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
        renewal: Renewal = None,
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
        self.renewal = renewal


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
        is_auto_renewing: bool = None,
        pending_purchases: List[str] = None,
    ):
        self.id = id
        self.account_id = account_id
        self.marketplace = marketplace
        self.period = period
        self.status = status
        self.last_purchase_id = last_purchase_id
        self.pending_purchases = pending_purchases
        self.is_auto_renewing = is_auto_renewing
        self.items = items


class Account:
    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.id = id
        self.name = name
