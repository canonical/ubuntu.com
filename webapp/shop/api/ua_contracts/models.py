from typing import List

from dateutil.parser import parse


class Entitlement:
    def __init__(
        self,
        type: str,
        enabled_by_default: bool,
        support_level: str = None,
        is_available: bool = True,
        is_editable: bool = True,
        is_in_beta: bool = False,
    ):
        self.type = type
        self.support_level = support_level
        self.enabled_by_default = enabled_by_default
        self.is_available = is_available
        self.is_editable = is_editable
        self.is_in_beta = is_in_beta


class Product:
    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.id = id
        self.name = name


class Listing:
    def __init__(
        self,
        id: str,
        name: str,
        marketplace: str,
        price: int,
        currency: str,
        status: str,
        product: Product = None,
        trial_days: int = None,
        period: str = None,
    ):
        self.id = id
        self.name = name
        self.marketplace = marketplace
        self.product = product
        self.price = price
        self.currency = currency
        self.status = status
        self.trial_days = trial_days
        self.period = period
        self.can_be_trialled = None

    def set_can_be_trialled(self, can_be_trialled):
        self.can_be_trialled = can_be_trialled


class UserSubscription:
    def __init__(
        self,
        id: str,
        account_id: str,
        product_name: str,
        type: str,
        start_date: str,
        number_of_machines: int,
        number_of_active_machines: int,
        current_number_of_machines: int,
        machine_type: str,
        marketplace: str,
        price: int,
        currency: str,
        entitlements: List[Entitlement],
        statuses: dict,
        contract_id: str,
        subscription_id: str = None,
        end_date: str = None,
        period: str = None,
        listing_id: str = None,
        renewal_id: str = None,
    ):
        self.id = id
        self.account_id = account_id
        self.product_name = product_name
        self.type = type
        self.start_date = start_date
        self.end_date = end_date
        self.number_of_machines = number_of_machines
        self.number_of_active_machines = number_of_active_machines
        self.current_number_of_machines = current_number_of_machines
        self.machine_type = machine_type
        self.marketplace = marketplace
        self.price = price
        self.currency = currency
        self.entitlements = entitlements
        self.statuses = statuses
        self.period = period
        self.subscription_id = subscription_id
        self.contract_id = contract_id
        self.listing_id = listing_id
        self.renewal_id = renewal_id


class OfferItem:
    def __init__(self, id: str, name: str, price: int, allowance: int):
        self.id = id
        self.name = name
        self.price = price
        self.allowance = allowance


class Offer:
    def __init__(
        self,
        id: str,
        account_id: str,
        marketplace: str,
        created_at: str,
        actionable: bool,
        total: int,
        items: List[OfferItem],
        discount: int = None,
    ):
        self.id = id
        self.account_id = account_id
        self.total = total
        self.items = items
        self.marketplace = marketplace
        self.created_at = created_at
        self.actionable = actionable
        self.discount = discount


class Invoice:
    def __init__(
        self,
        reason: str,
        currency: str,
        status: str,
        id: str = "",
        total: int = 0,
        end_of_cycle: str = "",
        start_of_cycle: str = "",
        items: dict = None,
        tax_amount: int = None,
        payment_status: dict = None,
        url: str = None,
    ):
        self.id = id
        self.currency = currency
        self.tax_amount = tax_amount
        self.total = total
        self.status = status
        self.reason = reason
        self.url = url
        self.payment_status = payment_status
        self.end_of_cycle = end_of_cycle
        self.start_of_cycle = start_of_cycle
        self.items = items


class PurchaseItem:
    def __init__(
        self,
        value: int,
        listing_id: str,
        listing: Listing = None,
    ):
        self.value = value
        self.listing = listing
        self.listing_id = listing_id


class Purchase:
    def __init__(
        self,
        account_id: str,
        created_at: str,
        id: str,
        marketplace: str,
        status: str,
        items: List[PurchaseItem],
        subscription_id: str = None,
        invoice: Invoice = None,
    ):
        self.account_id = account_id
        self.created_at = created_at
        self.id = id
        self.invoice = invoice
        self.items = items
        self.marketplace = marketplace
        self.status = status
        self.subscription_id = subscription_id

    def get_period(self):
        listing = self.items[0].listing
        period = listing.period if listing else None

        return "Monthly" if period == "monthly" else "Annual"

    def get_formatted_date(self):
        return parse(self.created_at).strftime("%d %B, %Y")

    def get_total(self):
        if self.invoice is None:
            return None

        if self.invoice.total is not None:
            cost = self.invoice.total / 100
            currency = self.invoice.currency

            return f"{cost} {currency}"

        return None
