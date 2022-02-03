# Packages
from dateutil.parser import parse
import flask
from requests.exceptions import HTTPError

# Local
from webapp.shop.decorators import shop_decorator
from webapp.shop.flaskparser import use_kwargs
from webapp.shop.api.ua_contracts.api import (
    UnauthorizedError,
    UAContractsUserHasNoAccount,
    AccessForbiddenError,
)
from webapp.shop.api.ua_contracts.helpers import extract_last_purchase_ids
from webapp.shop.schemas import (
    post_anonymised_customer_info,
    post_customer_info,
    ensure_purchase_account,
    invoice_view,
    post_payment_methods,
)

SERVICES = {
    "canonical-ua": {
        "short": "ua",
        "name": "Canonical UA",
    },
    "blender": {
        "short": "blender",
        "name": "Blender Support",
    },
    "canonical-cube": {
        "short": "cube",
        "name": "Canonical CUBE",
    },
}


@shop_decorator(area="account", permission="user", response="html")
def account_view(*args):
    email = flask.session["openid"]["email"]

    return flask.render_template(
        "account/index.html",
        email=email,
    )


@shop_decorator(area="account", permission="user", response="html")
@use_kwargs(invoice_view, location="query")
def invoices_view(ua_contracts_api, **kwargs):
    marketplace = kwargs.get("marketplace")

    try:
        account = ua_contracts_api.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        account = None
    except AccessForbiddenError:
        return flask.render_template("account/forbidden.html")

    total_payments = []
    filters = {"marketplace": marketplace} if marketplace else None

    if account:
        raw_payments = ua_contracts_api.get_account_purchases(
            account_id=account["id"],
            filters=filters,
        )

        product_listings = (
            raw_payments["productListings"] if raw_payments else []
        )
        all_raw_payments = raw_payments["purchases"] if raw_payments else []
        for raw_payment in all_raw_payments:
            payment_id = raw_payment["id"]
            payment_marketplace = raw_payment["marketplace"]
            created_at = raw_payment["createdAt"]

            total = None
            invoice = raw_payment.get("invoice")
            status = invoice.get("status") if invoice else "Pending"
            if invoice and invoice.get("total"):
                cost = invoice.get("total") / 100
                currency = invoice.get("currency")
                total = f"{cost} {currency}"

            period = None
            listing_id = raw_payment["purchaseItems"][0]["productListingID"]
            if payment_marketplace != "canonical-cube":
                for product_listing in product_listings:
                    if product_listing["id"] == listing_id:
                        period = product_listing["period"]

                        break
                period = "Monthly" if period == "monthly" else "Annual"

            download_link = ""
            if raw_payment.get("invoice"):
                download_link = f"invoices/download/{payment_id}"

            total_payments.append(
                {
                    "created_at": created_at,
                    "service": SERVICES[payment_marketplace]["name"],
                    "period": period,
                    "date": parse(created_at).strftime("%d %B, %Y"),
                    "total": total,
                    "download_file_name": "Download",
                    "download_link": download_link,
                    "status": status,
                }
            )

    total_payments.sort(key=lambda item: item["created_at"], reverse=True)

    return flask.render_template(
        "account/invoices/index.html",
        invoices=total_payments,
        marketplace=marketplace,
    )


@shop_decorator(area="account", permission="user", response="html")
def download_invoice(ua_contracts_api, **kwargs):
    purchase_id = kwargs.get("purchase_id")
    purchase = ua_contracts_api.get_purchase(purchase_id)
    download_link = purchase["invoice"]["url"]

    return flask.redirect(download_link)


@shop_decorator(area="account", permission="user", response="html")
def payment_methods_view(ua_contracts_api, **kwargs):
    account = None
    default_payment_method = None
    account_id = ""
    pending_purchase_id = ""

    try:
        account = ua_contracts_api.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        pass
    except AccessForbiddenError:
        return flask.render_template("account/forbidden.html")

    if account:
        account_id = account["id"]
        subscriptions = []

        for marketplace in SERVICES:
            market_subscriptions = ua_contracts_api.get_account_subscriptions(
                account_id=account_id,
                marketplace=marketplace,
                filters={"status": "locked"},
            )
            subscriptions.extend(market_subscriptions)

        for subscription in subscriptions:
            if subscription.get("pendingPurchases"):
                pending_purchase_id = subscription.get("pendingPurchases")[0]
                break

        try:
            account_info = ua_contracts_api.get_customer_info(account_id)
            customer_info = account_info["customerInfo"]
            default_payment_method = customer_info.get("defaultPaymentMethod")
        except UAContractsUserHasNoAccount:
            # User has no stripe account

            pass

    return flask.render_template(
        "account/payment-methods/index.html",
        default_payment_method=default_payment_method,
        pending_purchase_id=pending_purchase_id,
        account_id=account_id,
    )


@shop_decorator(area="account", permission="user", response="json")
@use_kwargs(post_payment_methods, location="json")
def post_payment_methods(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    payment_method_id = kwargs.get("payment_method_id")

    try:
        response = ua_contracts_api.put_payment_method(
            account_id, payment_method_id
        )
    except UAContractsUserHasNoAccount:
        name = flask.session["openid"]["fullname"]

        response = ua_contracts_api.put_customer_info(
            account_id, payment_method_id, None, name, None
        )

    return response


@shop_decorator(area="account", )
@use_kwargs(ensure_purchase_account, location="json")
def ensure_purchase_account(ua_contracts_api, **kwargs):
    """
    Returns an object with the ID of an account a user can make
    purchases on. If the user is not logged in, the object also
    contains an auth token required for subsequent calls to the
    contract API.
    """

    marketplace = kwargs.get("marketplace")
    email = kwargs.get("email")
    account_name = kwargs.get("account_name")
    captcha_value = kwargs.get("captcha_value")

    try:
        account = ua_contracts_api.ensure_purchase_account(
            marketplace=marketplace,
            email=email,
            account_name=account_name,
            captcha_value=captcha_value,
        )
    except UnauthorizedError as error:
        response = {
            "code": error.response.json()["code"],
            "message": error.response.json()["message"],
        }

        return flask.jsonify(response), 200

    # The guest authentication token is included in the response only when the
    # user is not logged in.
    token = account.get("token")

    if token:
        flask.session["guest_authentication_token"] = token

    return flask.jsonify(account), 200


@shop_decorator(area="account", permission="user", response="json")
def get_customer_info(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    response = {"success": False, "data": {}}

    try:
        response["data"] = ua_contracts_api.get_customer_info(account_id)
        response["success"] = True
    except HTTPError as error:
        if error.response.status_code == 404:
            response["data"] = error.response.json()
            response["success"] = False
        else:
            flask.current_app.extensions["sentry"].captureException()
            raise error

    return response


@shop_decorator(area="account", permission="user_or_guest", response="json")
@use_kwargs(post_customer_info, location="json")
def post_customer_info(ua_contracts_api, **kwargs):
    payment_method_id = kwargs.get("payment_method_id")
    account_id = kwargs.get("account_id")
    address = kwargs.get("address")
    name = kwargs.get("name")
    tax_id = kwargs.get("tax_id")

    if tax_id:
        tax_id["value"] = tax_id["value"].replace(" ", "")

        if tax_id["value"] == "":
            tax_id["delete"] = True

    return ua_contracts_api.put_customer_info(
        account_id, payment_method_id, address, name, tax_id
    )


@shop_decorator(area="account", permission="user_or_guest", response="json")
@use_kwargs(post_anonymised_customer_info, location="json")
def post_anonymised_customer_info(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    name = kwargs.get("name")
    address = kwargs.get("address")
    tax_id = kwargs.get("tax_id")

    if tax_id:
        tax_id["value"] = tax_id["value"].replace(" ", "")

        if tax_id["value"] == "":
            tax_id["delete"] = True

    return ua_contracts_api.put_anonymous_customer_info(
        account_id, name, address, tax_id
    )


@shop_decorator(area="account", permission="user_or_guest", response="json")
def post_stripe_invoice_id(ua_contracts_api, **kwargs):
    tx_type = kwargs.get("tx_type")
    tx_id = kwargs.get("tx_id")
    invoice_id = kwargs.get("invoice_id")

    return ua_contracts_api.post_stripe_invoice_id(tx_type, tx_id, invoice_id)


@shop_decorator(area="account", permission="user_or_guest", response="json")
def get_purchase(ua_contracts_api, **kwargs):
    purchase_id = kwargs.get("purchase_id")

    return ua_contracts_api.get_purchase(purchase_id)


@shop_decorator(area="account", permission="user", response="json")
def get_last_purchase_ids(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    ua_contracts_api.set_convert_response(True)

    last_purchase_ids = {}
    for marketplace in SERVICES:
        if marketplace == "canonical-cube":
            continue

        subscriptions = ua_contracts_api.get_account_subscriptions(
            account_id=account_id, marketplace=marketplace
        )

        last_purchase_ids[marketplace] = extract_last_purchase_ids(
            subscriptions
        )

    return flask.jsonify(last_purchase_ids)


@shop_decorator(area="account", response="html")
def support(*args):
    return flask.render_template(
        "support/index.html",
    )
