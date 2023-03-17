# Packages
from distutils.util import strtobool
import os
import flask
from datetime import datetime
from dateutil.parser import parse
import pytz
from requests.exceptions import HTTPError
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper

# Local
from webapp.shop.decorators import shop_decorator, SERVICES
from webapp.shop.flaskparser import use_kwargs
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPI,
    UAContractsAPIError,
    UAContractsUserHasNoAccount,
    AccessForbiddenError,
)
from webapp.shop.api.ua_contracts.helpers import (
    extract_last_purchase_ids,
    to_dict,
)
from webapp.shop.schemas import (
    PurchaseTotalSchema,
    post_anonymised_customer_info,
    post_customer_info,
    ensure_purchase_account,
    invoice_view,
    get_purchase_account_status,
    post_payment_methods,
    post_purchase_calculate,
)


@shop_decorator(area="account", permission="user", response="html")
def account_view(**kwargs):
    email = flask.session["openid"]["email"]

    return flask.render_template(
        "account/index.html",
        email=email,
    )


@shop_decorator(area="account", permission="user", response="json")
@use_kwargs(get_purchase_account_status, location="query")
def get_purchase_account_status(advantage_mapper: AdvantageMapper, **kwargs):
    marketplace = kwargs.get("marketplace")
    try:
        account = advantage_mapper.get_purchase_account(marketplace)
    except UAContractsUserHasNoAccount:
        return flask.jsonify({}), 404
    except AccessForbiddenError:
        return flask.jsonify({"error": "access forbidden"}), 403

    last_purchase_ids = {}
    subscription_counter = 0
    for marketplace in SERVICES:
        if marketplace == "canonical-cube":
            continue

        subscriptions = advantage_mapper.get_account_subscriptions(
            account_id=account.id,
            marketplace=marketplace,
        )

        subscription_counter += len(subscriptions)

        last_purchase_ids[marketplace] = extract_last_purchase_ids(
            subscriptions
        )

    response = {
        "account": to_dict(account),
        "last_purchase_ids": last_purchase_ids,
        "can_trial": subscription_counter == 0,
    }

    return flask.jsonify(response), 200


@shop_decorator(area="account", permission="user", response="html")
@use_kwargs(invoice_view, location="query")
def invoices_view(advantage_mapper: AdvantageMapper, **kwargs):
    marketplace = kwargs.get("marketplace")
    page = kwargs.get("page", 1)
    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        account = None
    except AccessForbiddenError:
        return flask.render_template("account/forbidden.html")

    payments = []
    if account:
        payments = advantage_mapper.get_account_purchases(
            account_id=account.id,
            filters={"marketplace": marketplace} if marketplace else None,
        )

    per_page = 10

    start_page = (page - 1) * per_page
    end_page = page * per_page

    return flask.render_template(
        "account/invoices/index.html",
        invoices=payments[start_page:end_page],
        marketplace=marketplace,
        total_pages=(len(payments) // per_page) + 1,
        current_page=page,
    )


@shop_decorator(area="account", permission="user", response="html")
def download_invoice(advantage_mapper: AdvantageMapper, **kwargs):
    purchase = advantage_mapper.get_purchase(kwargs.get("purchase_id"))

    return flask.redirect(purchase.invoice.url)


@shop_decorator(area="account", permission="user", response="html")
def payment_methods_view(advantage_mapper, ua_contracts_api, **kwargs):
    account = None
    default_payment_method = None
    account_id = ""
    pending_purchase_id = ""

    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        pass
    except AccessForbiddenError:
        return flask.render_template("account/forbidden.html")

    if account:
        account_id = account.id
        subscriptions = []

        for marketplace in SERVICES:
            market_subscriptions = advantage_mapper.get_account_subscriptions(
                account_id=account_id,
                marketplace=marketplace,
                filters={"status": "locked"},
            )
            subscriptions.extend(market_subscriptions)

        for subscription in subscriptions:
            if subscription.pending_purchases:
                pending_purchase_id = subscription.pending_purchases[0]
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


@shop_decorator(area="account")
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
    except UAContractsAPIError as error:
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


@shop_decorator(area="account", permission="user_or_guest", response="json")
def get_purchase_v2(advantage_mapper, **kwargs):
    purchase_id = kwargs.get("purchase_id")

    purchase = advantage_mapper.get_purchase(purchase_id)

    return flask.jsonify(to_dict(purchase)), 200


@shop_decorator(area="account", permission="user", response="json")
def get_last_purchase_ids(advantage_mapper, **kwargs):
    account_id = kwargs.get("account_id")

    last_purchase_ids = {}
    for marketplace in SERVICES:
        if marketplace == "canonical-cube":
            continue

        subscriptions = advantage_mapper.get_account_subscriptions(
            account_id=account_id, marketplace=marketplace
        )

        last_purchase_ids[marketplace] = extract_last_purchase_ids(
            subscriptions
        )

    return flask.jsonify(last_purchase_ids)


@shop_decorator(area="account", response="json")
@use_kwargs(post_purchase_calculate, location="json")
def post_purchase_calculate(ua_contracts_api: UAContractsAPI, **kwargs):
    response = ua_contracts_api.post_purchase_calculate(
        marketplace=kwargs.get("marketplace"),
        request_body={
            "country": kwargs.get("country"),
            "purchaseItems": [
                {
                    "value": product.get("quantity"),
                    "productListingID": product.get("product_listing_id"),
                }
                for product in kwargs.get("products")
            ],
            "hasTaxID": kwargs.get("has_tax"),
        },
    )

    return PurchaseTotalSchema().load(response)


@shop_decorator(area="account", response="html")
def support(**kwargs):
    return flask.render_template(
        "support/index.html",
    )


@shop_decorator(area="account", response="html")
def checkout(**kwargs):
    return flask.render_template(
        "account/checkout.html",
    )


@shop_decorator(area="account", response="html")
def get_shop_status_page(is_in_maintenance, **kwargs):
    maintenance = strtobool(os.getenv("STORE_MAINTENANCE", "false"))
    start_date = parse(os.getenv("STORE_MAINTENANCE_START"))
    end_date = parse(os.getenv("STORE_MAINTENANCE_END"))
    time_now = datetime.utcnow().replace(tzinfo=pytz.utc)

    return flask.render_template(
        "account/status.html",
        is_in_maintenance=is_in_maintenance,
        maintenance_scheduled=(maintenance and (start_date > time_now)),
        start_date=start_date.strftime("%-d %B %Y at %H:%M"),
        end_date=end_date.strftime("%-d %B %Y at %H:%M"),
        time_now=time_now.strftime("%-d %B %Y %H:%M"),
    )


@shop_decorator(area="account", response="html")
def maintenance_check(**kwargs):
    return flask.render_template(
        "account/maintenance-check.html",
    )
