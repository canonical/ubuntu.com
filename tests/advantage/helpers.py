import json
import pathlib
from typing import List

from requests.exceptions import HTTPError

from webapp.advantage.models import Listing, Entitlement, Product
from webapp.advantage.ua_contracts.api import UAContractsAPI
from webapp.advantage.ua_contracts.primitives import (
    Subscription,
    SubscriptionItem,
    ContractItem,
    Contract,
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
    pending_purchases: List[str] = None,
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
        items=items or [],
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
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    reason: str = None,
    value: int = None,
    product_listing_id: str = None,
    purchase_id: str = None,
    trial_id: str = None,
) -> ContractItem:
    return ContractItem(
        contract_id=contract_id or "cAaBbCcDdEeFfGg",
        created_at=created_at or "2020-01-01T00:00:00Z",
        start_date=start_date or "2020-01-01T00:00:00Z",
        end_date=end_date or "2020-03-01T00:00:00Z",
        reason=reason or "purchase_made",
        value=value or 5,
        product_listing_id=product_listing_id or "lAaBbCcDdEeFfGg",
        purchase_id=purchase_id or "pAaBbCcDdEeFfGg",
        trial_id=trial_id or None,
    )


def make_purchase_contract_item(
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    value: int = None,
    product_listing_id: str = None,
    purchase_id: str = None,
) -> ContractItem:
    return ContractItem(
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
    contract_id: str = None,
    created_at: str = None,
    start_date: str = None,
    end_date: str = None,
    product_listing_id: str = None,
    purchase_id: str = None,
    trial_id: str = None,
) -> ContractItem:
    return ContractItem(
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
        items=items or default_items,
    )


def make_shop_contract(
    id: str = None,
    account_id: str = None,
    name: str = None,
    product_id: str = None,
    entitlements: List[Entitlement] = None,
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
        items=items or default_items,
    )
