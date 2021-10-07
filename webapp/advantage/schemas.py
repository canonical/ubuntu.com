from marshmallow import Schema, validate

from webargs.fields import (
    String,
    List,
    Nested,
    Int,
    Boolean,
)


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


post_advantage_subscriptions = {
    "account_id": String(required=True),
    "period": String(enum=["monthly", "yearly"], required=True),
    "previous_purchase_id": String(required=True),
    "products": List(Nested(ProductSchema), required=True),
    "resizing": Boolean(),
    "trialling": Boolean(),
}

cancel_advantage_subscriptions = {
    "account_id": String(required=True),
    "previous_purchase_id": String(required=True),
    "product_listing_id": String(required=True),
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
    "payment_method_id": String(),
    "country": String(),
    "marketplace": String(),
}

invoice_view = {
    "marketplace": String(
        validate=validate.OneOf(["", "canonical-ua", "canonical-cube"])
    ),
    "email": String(),
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
