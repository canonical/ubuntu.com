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
    support_level = String(missing="")
    is_available = Boolean(data_key="entitled", missing=True)
    is_editable = Boolean(data_key="editable", missing=True)
    is_in_beta = Boolean(data_key="inBeta", missing=False)

    @post_load
    def preprocess(self, data, **kwargs) -> Entitlement:
        return Entitlement(**data)


class AnnotatedContractItemsSchema(BaseSchema):
    ALLOWED_ENTITLEMENTS = [
        "cis",
        "esm-infra",
        "esm-apps",
        "fips",
        "fips-updates",
        "livepatch",
        "support",
    ]

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
    type = Function(
        deserialize=(lambda v: v.get("presentationHint")),
        data_key="ubuntuProContext",
        missing="",
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
        required=True,
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
        data_key="ubuntuProContext",
        missing="",
    )
    subscription_id = Function(
        deserialize=(lambda v: v["purchase"].get("subscriptionID")),
        data_key="purchaseContext",
        missing=None,
    )
    offer_id = Function(
        deserialize=(lambda v: v["purchase"].get("offerID")),
        data_key="purchaseContext",
        missing=None,
    )
    renewal_id = Function(
        deserialize=(lambda v: v.get("id", "")),
        data_key="renewalContext",
        missing=None,
    )
    listing_id = Function(
        deserialize=(lambda v: v["listing"]["id"]),
        data_key="purchaseContext",
        missing=None,
    )
    contract_id = String(required=True, data_key="contractID")
    support_level = Function(
        deserialize=(lambda v: v.get("supportLevel", "")),
        data_key="ubuntuProContext",
        missing="",
    )
    entitlements = Function(
        deserialize=(lambda v: v.get("entitlements", [])),
        data_key="ubuntuProContext",
        missing=[],
    )
    is_expiring = Function(
        deserialize=(lambda v: v.get("isExpiring")),
        data_key="subscriptionContext",
        missing=False,
    )
    is_expired = Function(data_key="expired")
    in_grace_period = Function(data_key="inGracePeriod")
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
        data = self.adjust_personal_subscription(data)
        data = self.adjust_entitlements(data)
        data = self.set_machine_type(data)

        return AnnotatedContractItem(**data)

    def adjust_entitlements(self, data) -> dict:
        if not data.get("entitlements"):
            return data

        # set support level
        for entitlement in data.get("entitlements"):
            if entitlement["resource"] == "support":
                entitlement["support_level"] = data["support_level"]
                entitlement["editable"] = False

        entitlements = []

        has_livepatch_on = False
        has_fips_on = False
        has_fips_updates_on = False
        for entitlement in data.get("entitlements"):
            if entitlement["resource"] not in self.ALLOWED_ENTITLEMENTS:
                continue

            entitlements.append(entitlement)

            if entitlement["resource"] == "livepatch":
                has_livepatch_on = entitlement["enabledByDefault"]
            if entitlement["resource"] == "fips-updates":
                has_fips_updates_on = entitlement["enabledByDefault"]
            if entitlement["resource"] == "fips":
                has_fips_on = entitlement["enabledByDefault"]

        for entitlement in entitlements:
            if has_fips_on:
                if entitlement["resource"] == "livepatch":
                    entitlement["editable"] = False
                    entitlement["enabledByDefault"] = False
                if entitlement["resource"] == "fips-updates":
                    entitlement["editable"] = False
                    entitlement["enabledByDefault"] = False
            elif has_livepatch_on or has_fips_updates_on:
                if entitlement["resource"] == "fips":
                    entitlement["editable"] = False
                    entitlement["enabledByDefault"] = False

            if entitlement.get("inBeta"):
                entitlement["editable"] = not entitlement["inBeta"]

        data["entitlements"] = EntitlementSchema(many=True).load(entitlements)

        return data

    def set_machine_type(self, data) -> dict:
        product_id = data["product_id"]

        # some product ids don't mention the machine type
        # those products are all "physical", so I set it as default
        machine_type = "physical"

        if "virtual" in product_id:
            machine_type = "virtual"
        if "physical" in product_id:
            machine_type = "physical"
        if "desktop" in product_id:
            machine_type = "desktop"

        data["machine_type"] = machine_type
        return data

    def adjust_personal_subscription(self, data) -> dict:
        if data["type"] == "free":
            data["marketplace"] = "free"
            data["end_date"] = None
            data["entitlements"] = []

        return data
