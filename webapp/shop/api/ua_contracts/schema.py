import typing
from marshmallow import Schema, post_load, validate, EXCLUDE
from marshmallow.fields import (
    Function,
    String,
    Integer,
    Nested,
    List,
    Boolean,
)

from webapp.shop.api.ua_contracts.models import (
    Entitlement,
    Purchase,
    PurchaseItem,
    Invoice,
)
from webapp.shop.api.ua_contracts.primitives import (
    Account,
    AnnotatedContractItem,
)


class BaseSchema(Schema):
    class Meta:
        unknown = EXCLUDE


class InvoiceItemSchema(BaseSchema):
    currency = String()
    description = String()
    proRatedAmount = Integer(attribute="pro_rated_amount")
    quantity = Integer()


class PaymentStatusSchema(BaseSchema):
    status = String()
    lastPaymentError = String(attribute="error")
    piClientSecret = String(attribute="pi_client_secret")


class InvoiceSchema(BaseSchema):
    id = Function(deserialize=(lambda id: id.get("IDs")[0]), required=True)
    reason = String(required=True)
    status = String(required=True)
    url = String()
    currency = String(required=True)
    total = Integer()
    taxAmount = Integer(attribute="tax_amount")
    paymentStatus = Nested(PaymentStatusSchema, attribute="payment_status")
    lineItems = List(Nested(InvoiceItemSchema), attribute="items")

    @post_load
    def make_invoice(self, data, **kwargs) -> Invoice:
        return Invoice(**data)


class PurchaseItemSchema(BaseSchema):
    productListingID = String(required=True, attribute="listing_id")
    value = Integer(required=True)

    @post_load
    def make_purchase_item(self, data, **kwargs) -> PurchaseItem:
        return PurchaseItem(**data)


class PurchaseSchema(BaseSchema):
    accountID = String(required=True, attribute="account_id")
    id = String(required=True)
    createdAt = String(required=True, attribute="created_at")
    status = String(required=True)
    subscriptionID = String(attribute="subscription_id")
    invoice = Nested(InvoiceSchema)
    purchaseItems = List(
        Nested(PurchaseItemSchema), required=True, attribute="items"
    )
    marketplace = String(
        validate=validate.OneOf(["canonical-ua", "canonical-cube", "blender"]),
        required=True,
    )

    @post_load
    def make_purchase(self, data, **kwargs) -> Purchase:
        return Purchase(**data)


class AccountSchema(BaseSchema):
    id = String(required=True, attribute="id")
    name = String(required=True)
    type = String(required=True)
    userRoleOnAccount = String(required=True, attribute="role")

    @post_load
    def make_purchase(self, data, **kwargs) -> Account:
        return Account(**data)


class EnsurePurchaseAccountSchema(BaseSchema):
    accountID = String(required=True, attribute="id")
    token = String()

    @post_load
    def make_purchase(self, data, **kwargs) -> Account:
        return Account(**data)


class EntitlementSchema(BaseSchema):
    type = String(data_key="resource", required=True)
    enabled_by_default = Boolean(data_key="enabledByDefault", required=True)

    @post_load
    def preprocess(self, data, **kwargs) -> Entitlement:
        return Entitlement(**data)


class AnnotatedContractItemsSchema(BaseSchema):
    id = Function(required=True)
    account_id = Function(
        deserialize=(lambda v: v.get("accountID")),
        data_key="accountContext",
        required=True,
    )
    role = Function(
        deserialize=(lambda v: v.get("role")),
        data_key="accountContext",
        required=True,
    )
    product_name = Function(
        deserialize=(lambda v: v.get("name")),
        data_key="contractContext",
        required=True,
    )
    type = String(
        required=True,
        data_key="presentationHint",
    )
    start_date = String(
        required=True,
        data_key="effectiveFrom",
    )
    end_date = String(
        required=True,
        data_key="effectiveTo",
    )
    number_of_machines = Integer(
        required=True,
        data_key="value",
    )
    marketplace = Function(
        deserialize=(lambda v: v["listing"]["marketplace"]),
        data_key="purchaseContext",
        missing="canonical-ua",
    )
    current_number_of_machines = Function(
        deserialize=(lambda v: v.get("nextCycleQuantity", 0)),
        data_key="subscriptionItemContext",
        missing=0,
    )
    number_of_active_machines = Function(
        deserialize=(lambda v: v.get("activeMachines", 0)),
        data_key="contractContext",
        missing=0,
    )
    product_id = Function(
        deserialize=(lambda v: v["products"][0]),
        data_key="contractContext",
    )
    period = Function(
        deserialize=(lambda v: v["listing"]["period"]),
        data_key="purchaseContext",
    )
    price = Function(
        deserialize=(lambda v: v["recurringCost"]),
        data_key="subscriptionItemContext",
        missing=0,
    )
    currency = Function(
        deserialize=(lambda v: v["recurringCostCurrency"]),
        data_key="subscriptionItemContext",
        missing="USD",
    )
    token = Function(
        deserialize=(lambda v: v["token"]),
        data_key="contractContext",
        required=True,
    )
    subscription_id = Function(
        deserialize=(lambda v: v["purchase"].get("subscriptionID")),
        data_key="purchaseContext",
        missing="",
    )
    offer_id = Function(
        deserialize=(lambda v: v["purchase"].get("offerID")),
        data_key="purchaseContext",
        missing="",
    )
    renewal_id = Function(
        deserialize=(lambda v: v.get("id", "")),
        data_key="renewalContext",
        missing="",
    )
    listing_id = Function(
        deserialize=(lambda v: v["listing"]["id"]),
        data_key="purchaseContext",
        missing="",
    )
    contract_id = String(required=True, data_key="contractID")
    support_level = Function(
        deserialize=(lambda v: v.get("supportLevel", "")),
        data_key="contractContext",
        required=True,
    )
    entitlements = Function(
        deserialize=(lambda v: v.get("entitlements")),
        data_key="contractContext",
        required=True,
    )
    is_expiring = Function(
        deserialize=(lambda v: v.get("isExpiring")),
        data_key="subscriptionContext",
        missing=False,
    )
    is_expired = Function(data_key="expired", required=True)
    in_grace_period = Function(data_key="inGracePeriod", required=True)
    should_present_auto_renewal = Function(
        deserialize=(lambda v: v.get("shouldAllowAutoRenewalToggle")),
        data_key="subscriptionContext",
        missing=False,
    )
    is_subscription_active = Function(
        deserialize=(lambda v: v.get("isActive")),
        data_key="subscriptionContext",
        missing=False,
    )
    is_upsizeable = Function(
        deserialize=(lambda v: v.get("canDownsell")),
        data_key="subscriptionItemContext",
        missing=False,
    )
    is_downsizeable = Function(
        deserialize=(lambda v: v.get("canUpsell")),
        data_key="subscriptionItemContext",
        missing=False,
    )
    is_subscription_auto_renewing = Function(
        deserialize=(lambda v: v.get("willAttemptAutoRenewal")),
        data_key="subscriptionContext",
        missing=False,
    )
    is_renewal_actionable = Function(
        deserialize=(lambda v: (v.get("action") == "purchase_manual_renewal")),
        data_key="renewalContext",
        missing=False,
    )
    is_renewable = Function(
        deserialize=(lambda v: v.get("status") == "action_needed"),
        data_key="renewalContext",
        missing=False,
    )

    @post_load
    def preprocess(self, data, **kwargs) -> typing.List[AnnotatedContractItem]:
        if data["entitlements"]:
            entitlements = EntitlementSchema(many=True).load(
                data["entitlements"]
            )
            data["entitlements"] = entitlements

        return AnnotatedContractItem(**data)
