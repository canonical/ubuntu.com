from typing import List
from dataclasses import dataclass

from webapp.shop.api.ua_contracts.models import Entitlement


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
        currency: str,
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
        id: int,
        contract_id: str,
        created_at: str,
        start_date: str,
        end_date: str,
        reason: str,
        value: int,
        product_listing_id: str = None,
        subscription_id: str = None,
        purchase_id: str = None,
        trial_id: str = None,
        renewal: Renewal = None,
    ):
        self.id = id
        self.contract_id = contract_id
        self.created_at = created_at
        self.start_date = start_date
        self.end_date = end_date
        self.reason = reason
        self.value = value
        self.product_listing_id = product_listing_id
        self.purchase_id = purchase_id
        self.subscription_id = subscription_id
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
        number_of_active_machines: int,
        items: List[ContractItem] = None,
    ):
        self.id = id
        self.account_id = account_id
        self.name = name
        self.product_id = product_id
        self.entitlements = entitlements
        self.number_of_active_machines = number_of_active_machines
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
        started_with_trial: bool = None,
        in_trial: bool = None,
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
        self.started_with_trial = started_with_trial
        self.in_trial = in_trial


class Account:
    def __init__(
        self,
        id: str,
        name: str = None,
        type: str = None,
        role: str = None,
        token: str = None,
    ):
        self.id = id
        self.name = name
        self.type = type
        self.role = role
        self.token = token


class User:
    def __init__(
        self,
        id: str,
        name: str,
        display_name: str,
        email: str,
        last_login_at: str,
        first_login_at: str,
        verified: bool,
    ):
        self.first_login_at = first_login_at
        self.last_login_at = last_login_at
        self.email = email
        self.id = id
        self.name = name
        self.display_name = display_name
        self.verified = verified
        self.user_role_on_account = None

    def set_user_role_on_account(self, user_role_on_account):
        self.user_role_on_account = user_role_on_account


@dataclass
class AnnotatedContractItem:
    id: int
    account_id: str
    role: str
    support_level: str
    product_id: str
    product_name: str
    type: str
    start_date: str
    number_of_machines: int
    number_of_active_machines: int
    current_number_of_machines: int
    marketplace: str
    price: int
    currency: str
    entitlements: List[Entitlement]
    machine_type: str
    contract_id: str = None
    subscription_id: str = None
    offer_id: str = None
    end_date: str = None
    period: str = None
    renewal_id: str = None
    listing_id: str = None
    token: str = None
    is_expiring: bool = False
    is_expired: bool = False
    should_present_auto_renewal: bool = False
    in_grace_period: bool = False
    is_upsizeable: bool = False
    is_downsizeable: bool = False
    is_subscription_active: bool = False
    is_subscription_auto_renewing: bool = False
    is_renewable: bool = False
    is_renewal_actionable: bool = False
