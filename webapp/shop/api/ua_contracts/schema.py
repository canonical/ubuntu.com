from marshmallow import Schema, post_load, validate, EXCLUDE
from marshmallow.fields import Function, String, Integer, Nested, List

from webapp.shop.api.ua_contracts.models import Purchase, PurchaseItem, Invoice
from webapp.shop.api.ua_contracts.primitives import Account


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
    account_id = String()
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
