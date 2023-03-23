import json
import pathlib
from typing import List

from requests.exceptions import HTTPError

from webapp.shop.api.ua_contracts.models import Listing, Entitlement, Product
from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.primitives import (
    Subscription,
    SubscriptionItem,
    ContractItem,
    Contract,
    Renewal,
    Account,
)


class Response:
    def __init__(
        self,
        status_code: int,
        content: dict,
    ):
        self.status_code = status_code
        self._content = content

    def raise_for_status(self):
        if self.status_code != 200:
            raise (HTTPError(response=self))

    def json(self):
        return self._content


class Session:
    def __init__(self, response: Response):
        self._response = response
        self.request_kwargs = None

    def request(self, **kwargs):
        self.request_kwargs = kwargs

        return self._response


def make_client(session: Session, **kwargs):
    return UAContractsAPI(
        session,
        "secret-token",
        api_url="https://1.2.3.4",
        **kwargs,
    )


def get_fixture(file: str):
    current_path = pathlib.Path(__file__).parent.absolute()
    with open(f"{current_path}/./fixtures/{file}.json") as json_data:
        file_data = json_data.read()
        json_data.close()

    return json.loads(file_data)


def make_subscription(
    id: str = None,
    account_id: str = None,
    marketplace: str = None,
    period: str = None,
    status: str = None,
    last_purchase_id: str = None,
    started_with_trial: bool = None,
    in_trial: bool = None,
    pending_purchases: List[str] = None,
    is_auto_renewing: bool = None,
    items: List[SubscriptionItem] = None,
) -> Subscription:
    return Subscription(
        id=id or "sAaBbCcDdEeFfGg",
        account_id=account_id or "aAaBbCcDdEeFfGg",
        marketplace=marketplace or "canonical-ua",
        period=period or "monthly",
        status=status or "active",
        last_purchase_id=last_purchase_id or "pAaBbCcDdEeFfGg",
        pending_purchases=pending_purchases or [],
        is_auto_renewing=is_auto_renewing or False,
        items=items or [],
        started_with_trial=started_with_trial,
        in_trial=in_trial,
    )


def make_subscription_item(
    subscription_id: str = None,
    product_listing_id: str = None,
    value: int = None,
) -> SubscriptionItem:
    return SubscriptionItem(
        subscription_id=subscription_id or "sAaBbCcDdEeFfGg",
        product_listing_id=product_listing_id or "lAaBbCcDdEeFfGg",
        value=value or 1,
    )


def make_listing(
    id: str = None,
    name: str = None,
    marketplace: str = None,
    product: Product = None,
    price: int = None,
    currency: str = None,
    status: str = None,
    trial_days: int = None,
    period: str = None,
) -> Listing:
    default_product = Product(
        id="product-id",
        name="product-name",
    )

    return Listing(
        id=id or "lAaBbCcDdEeFfGg",
        name=name or "Listing Name",
        marketplace=marketplace or "canonical-ua",
        product=product or default_product,
        price=price or 1000,
        currency=currency or "USD",
        status=status or "active",
        trial_days=trial_days or 0,
        period=period or "yearly",
    )


def make_contract_item(
    id: int = None,
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    reason: str = None,
    value: int = None,
    product_listing_id: str = None,
    purchase_id: str = None,
    subscription_id: str = None,
    trial_id: str = None,
    renewal: Renewal = None,
) -> ContractItem:
    return ContractItem(
        id=id or 123,
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        created_at=created_at or "2020-01-01T00:00:00Z",
        start_date=start_date or "2020-01-01T00:00:00Z",
        end_date=end_date or "2020-03-01T00:00:00Z",
        reason=reason or "purchase_made",
        value=value or 5,
        product_listing_id=product_listing_id or "lAaBbCcDdEeFfGg",
        purchase_id=purchase_id or "pAaBbCcDdEeFfGg",
        subscription_id=subscription_id or "sAaBbCcDdEeFfGg",
        trial_id=trial_id or None,
        renewal=renewal or None,
    )


def make_renewal(
    id: str = None,
    contract_id: str = None,
    actionable: bool = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    new_contract_start: str = None,
    price: int = None,
    currency: str = None,
    number_of_machines: int = None,
) -> Renewal:
    return Renewal(
        id=id or "rAaBbCcDdEeFfGg",
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        actionable=actionable or True,
        status=status or "pending",
        start_date=start_date or "2020-01-01T10:00:00Z",
        end_date=end_date or "2021-01-01T10:00:00Z",
        new_contract_start=new_contract_start or "2020-01-01T10:00:00Z",
        price=price or 10000,
        currency=currency or "USD",
        number_of_machines=number_of_machines or 1,
    )


def make_legacy_contract_item(
    id: int = None,
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    reason: str = None,
    value: int = None,
    renewal: Renewal = None,
    number_of_machines: int = None,
) -> ContractItem:
    default_renewal = Renewal(
        id="rAaBbCcDdEeFfGg",
        contract_id="cAaBbCcDdEeFfGg",
        actionable=True,
        status="pending",
        start_date="2020-01-01T10:00:00Z",
        end_date="2021-01-01T10:00:00Z",
        new_contract_start="2020-01-01T10:00:00Z",
        price=10000,
        currency="USD",
        number_of_machines=number_of_machines or 1,
    )

    return ContractItem(
        id=id or 123,
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        created_at=created_at or "2020-01-01T00:00:00Z",
        start_date=start_date or "2020-01-01T00:00:00Z",
        end_date=end_date or "2020-03-01T00:00:00Z",
        reason=reason or "contract_created",
        value=value or 5,
        renewal=renewal or default_renewal,
    )


def make_purchase_contract_item(
    id: int = None,
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    value: int = None,
    product_listing_id: str = None,
    purchase_id: str = None,
) -> ContractItem:
    return ContractItem(
        id=id or 123,
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        created_at=created_at or "2020-01-01T00:00:00Z",
        start_date=start_date or "2020-01-01T00:00:00Z",
        end_date=end_date or "2020-03-01T00:00:00Z",
        reason="purchase_made",
        value=value or 5,
        product_listing_id=product_listing_id or "lAaBbCcDdEeFfGg",
        purchase_id=purchase_id or "pAaBbCcDdEeFfGg",
        trial_id=None,
    )


def make_free_trial_contract_item(
    id: int = None,
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    product_listing_id: str = None,
    purchase_id: str = None,
    trial_id: str = None,
) -> ContractItem:
    return ContractItem(
        id=id or 123,
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        created_at=created_at or "2020-01-01T00:00:00Z",
        start_date=start_date or "2020-01-01T00:00:00Z",
        end_date=end_date or "2020-03-01T00:00:00Z",
        reason="trial_started",
        value=1,
        product_listing_id=product_listing_id or "lAaBbCcDdEeFfGg",
        purchase_id=purchase_id or "pAaBbCcDdEeFfGg",
        trial_id=trial_id or "tAaBbcCdDeEFfGg",
    )


def make_entitlement(
    type: str = None,
    enabled_by_default: bool = None,
    support_level: str = None,
) -> Entitlement:
    return Entitlement(
        type=type or "entitlement-type",
        enabled_by_default=enabled_by_default or True,
        support_level=support_level or None,
    )


def make_support_entitlement(
    enabled_by_default: bool = None,
    support_level: str = None,
) -> Entitlement:
    return Entitlement(
        type="support",
        enabled_by_default=enabled_by_default or True,
        support_level=support_level or "essential",
    )


def make_free_trial_contract(
    id: str = None,
    account_id: str = None,
    name: str = None,
    product_id: str = None,
    entitlements: List[Entitlement] = None,
    number_of_active_machines: int = 0,
    items: List[ContractItem] = None,
) -> Contract:
    default_entitlements = [make_entitlement(), make_support_entitlement()]
    default_items = [make_free_trial_contract_item()]

    return Contract(
        id=id or "cAaBbCcDdEeFfGg",
        account_id=account_id or "aAaBbCcDdEeFfGg",
        name=name or "Free trial",
        product_id=product_id or "product-name",
        entitlements=entitlements or default_entitlements,
        number_of_active_machines=number_of_active_machines,
        items=items or default_items,
    )


def make_shop_contract(
    id: str = None,
    account_id: str = None,
    name: str = None,
    product_id: str = None,
    entitlements: List[Entitlement] = None,
    number_of_active_machines: int = 0,
    items: List[ContractItem] = None,
) -> Contract:
    default_entitlements = [make_entitlement(), make_support_entitlement()]
    default_items = [
        make_contract_item(
            start_date="2020-01-01T00:00:00Z",
            end_date="2020-02-01T00:00:00Z",
            value=5,
        ),
        make_contract_item(
            start_date="2020-01-15T00:00:00Z",
            end_date="2021-02-15T00:00:00Z",
            value=5,
        ),
        make_contract_item(
            start_date="2020-02-01T00:00:00Z",
            end_date="2021-02-15T00:00:00Z",
            value=-2,
        ),
    ]

    return Contract(
        id=id or "cAaBbCcDdEeFfGg",
        account_id=account_id or "aAaBbCcDdEeFfGg",
        name=name or "Free trial",
        product_id=product_id or "product-name",
        entitlements=entitlements or default_entitlements,
        number_of_active_machines=number_of_active_machines,
        items=items or default_items,
    )


def make_account(
    id: str = None,
    name: str = None,
    role: str = None,
):
    return Account(
        id=id or "aAbBcCdDeE",
        name=name or "Account name",
        role=role or "admin",
    )
