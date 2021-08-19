from typing import List

from webapp.advantage.primitives import Product, Entitlement


class Listing:
    def __init__(
        self,
        id: str,
        name: str,
        marketplace: str,
        product: Product,
        price: int,
        currency: str,
        status: str,
        trial_days: int,
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


class UserSubscription:
    def __init__(
        self,
        account_id: str,
        product_name: str,
        type: str,
        start_date: str,
        end_date: str,
        number_of_machines: int,
        machine_type: str,
        marketplace: str,
        price_per_unit: int,
        entitlements: List[Entitlement],
        statuses: dict,
    ):
        self.account_id = account_id
        self.product_name = product_name
        self.type = type
        self.start_date = start_date
        self.end_date = end_date
        self.number_of_machines = number_of_machines
        self.machine_type = machine_type
        self.marketplace = marketplace
        self.price_per_unit = price_per_unit
        self.entitlements = entitlements
        self.statuses = statuses
