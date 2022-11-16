from marshmallow import Schema, validate
from webargs.fields import Boolean, Int, List, Nested, String


class EntitlementSchema(Schema):
    type = String(required=True)
    is_enabled = Boolean(required=True)


class ProductSchema(Schema):
    name = String()
    period = String(enum=["monthly", "yearly"])
    price = Int()
    product_listing_id = String(required=True)
    quantity = Int(required=True)


class AddressSchema(Schema):
    city = String()
    country = String()
    line1 = String()
    postal_code = String()
    state = String()


class TaxIdSchema(Schema):
    type = String()
    value = String()


class SubscriptionRenewalSchema(Schema):
    subscription_id = String()
    should_auto_renew = Boolean()


class ProductListing(Schema):
    product_listing_id = String(required=True)
    quantity = Int(required=True)


class CustomerInfo(Schema):
    email = String()
    name = String()
    payment_method_id = String()
    address = Nested(AddressSchema())
    tax_id = Nested(TaxIdSchema())


class PurchaseTotalSchema(Schema):
    currency = String(required=True)
    subtotal = Int(required=True)
    tax = Int()
    total = Int(required=True)


class MagicAttachTokenSchema(Schema):
    contractID = String(required=True)
    userCode = String(required=True)


account_purhcase = {
    "account_id": String(),
    "customer_info": Nested(CustomerInfo),
    "products": List(Nested(ProductListing)),
    "offer_id": String(),
    "renewal_id": String(),
    "previous_purchase_id": String(),
    "captcha_value": String(),
    "marketplace": String(
        validate=validate.OneOf(["canonical-ua", "canonical-cube", "blender"]),
        required=True,
    ),
    "action": String(
        validate=validate.OneOf(
            ["purchase", "resize", "trial", "offer", "renewal"]
        )
    ),
}


post_advantage_subscriptions = {
    "account_id": String(required=True),
    "period": String(enum=["monthly", "yearly"], required=True),
    "previous_purchase_id": String(required=True),
    "products": List(Nested(ProductSchema), required=True),
    "resizing": Boolean(),
    "marketplace": String(),
    "trialling": Boolean(),
}

cancel_advantage_subscriptions = {
    "account_id": String(required=True),
    "previous_purchase_id": String(required=True),
    "product_listing_id": String(required=True),
    "marketplace": String(
        validate=validate.OneOf(["canonical-ua", "canonical-cube", "blender"]),
        required=True,
    ),
}

post_offer_schema = {
    "account_id": String(),
    "offer_id": String(),
    "marketplace": String(
        validate=validate.OneOf(["canonical-ua", "canonical-cube", "blender"])
    ),
}

post_anonymised_customer_info = {
    "account_id": String(required=True),
    "name": String(required=True),
    "address": Nested(AddressSchema, required=True),
    "tax_id": Nested(TaxIdSchema, allow_none=True),
}

post_payment_methods = {
    "account_id": String(required=True),
    "payment_method_id": String(required=True),
}

post_customer_info = {
    "payment_method_id": String(required=True),
    "account_id": String(required=True),
    "name": String(),
    "tax_id": Nested(TaxIdSchema, allow_none=True),
    "address": Nested(AddressSchema),
}

ensure_purchase_account = {
    "email": String(),
    "account_name": String(),
    "captcha_value": String(),
    "marketplace": String(),
}

invoice_view = {
    "marketplace": String(
        validate=validate.OneOf(
            ["", "canonical-ua", "canonical-cube", "blender"]
        )
    ),
    "page": Int(),
}

post_account_user_role = {
    "email": String(required=True),
    "name": String(required=True),
    "role": String(
        validate=validate.OneOf(["admin", "technical", "billing"]),
        required=True,
    ),
}

put_account_user_role = {
    "email": String(required=True),
    "role": String(
        validate=validate.OneOf(["admin", "technical", "billing"]),
        required=True,
    ),
}

delete_account_user_role = {
    "email": String(required=True),
}


put_contract_entitlements = {
    "entitlements": List(Nested(EntitlementSchema), required=True),
}

post_auto_renewal_settings = {
    "subscriptions": List(Nested(SubscriptionRenewalSchema), required=True)
}

post_purchase_calculate = {
    "country": String(required=True),
    "products": List(Nested(ProductSchema), required=True),
    "has_tax": Boolean(),
}
