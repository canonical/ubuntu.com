# Standard library
from datetime import datetime, timedelta, timezone

# Packages
from typing import Optional, List

from dateutil.parser import parse
import flask
import pytz
from flask import g
from requests.exceptions import HTTPError
from webargs.fields import String, Boolean

# Local
from webapp.advantage.ua_contracts.primitives import Subscription
from webapp.advantage.decorators import advantage_decorator
from webapp.login import user_info
from webapp.advantage.flaskparser import use_kwargs
from webapp.advantage.ua_contracts.builders import (
    build_user_subscriptions,
    build_get_user_info,
)
from webapp.advantage.ua_contracts.helpers import (
    to_dict,
    extract_last_purchase_ids,
    set_listings_trial_status,
)
from webapp.advantage.ua_contracts.api import (
    CannotCancelLastContractError,
    UnauthorizedError,
    UAContractsUserHasNoAccount,
    UAContractsAPIError,
)

from webapp.advantage.schemas import (
    post_advantage_subscriptions,
    post_anonymised_customer_info,
    cancel_advantage_subscriptions,
    post_customer_info,
    ensure_purchase_account,
    invoice_view,
    post_payment_methods,
    post_account_user_role,
    put_account_user_role,
    delete_account_user_role,
    put_contract_entitlements,
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


@advantage_decorator(permission="user", response="html")
@use_kwargs({"subscription": String(), "email": String()}, location="query")
def advantage_view(**kwargs):
    open_subscription = kwargs.get("subscription", None)

    personal_account = None
    new_subscription_id = None
    new_subscription_start_date = None
    pending_purchase_id = None

    enterprise_contracts = {}
    previous_purchase_ids = {"monthly": "", "yearly": ""}
    total_enterprise_contracts = 0

    monthly_info = {
        "total_subscriptions": 0,
        "has_monthly": False,
        "next_payment": {},
    }

    # Support admin "view as" functionality.
    email = kwargs.get("email", "").strip()
    accounts = g.api.get_accounts(email=email)

    for account in accounts:
        monthly_purchased_products = {}
        yearly_purchased_products = {}
        account["contracts"] = g.api.get_account_contracts(account["id"])

        all_subscriptions = g.api.get_account_subscriptions(
            account_id=account["id"],
            marketplace="canonical-ua",
        )

        monthly_subscriptions = []
        yearly_subscriptions = []
        for subscription in all_subscriptions:
            period = subscription["subscription"]["period"]
            status = subscription["subscription"]["status"]

            if status not in ["active", "locked"]:
                continue

            if subscription.get("pendingPurchases"):
                pending_purchase_id = subscription.get("pendingPurchases")[0]

            previous_purchase_ids[period] = subscription.get("lastPurchaseID")

            if subscription["subscription"]["period"] == "yearly":
                yearly_subscriptions.append(subscription)
                continue

            monthly_subscriptions.append(subscription)

        for subscription in monthly_subscriptions:
            purchased_products = subscription.get("purchasedProductListings")
            if purchased_products is None:
                continue

            for purchased_product_listing in purchased_products:
                product_listing = purchased_product_listing["productListing"]
                product_id = product_listing["productID"]
                quantity = purchased_product_listing["value"]
                monthly_purchased_products[product_id] = {
                    "quantity": quantity,
                    "price": product_listing["price"],
                    "product_listing_id": product_listing["id"],
                }

            _prepare_monthly_info(monthly_info, subscription)

        for subscription in yearly_subscriptions:
            purchased_products = subscription.get("purchasedProductListings")
            if purchased_products is None:
                continue

            for purchased_product_listing in purchased_products:
                product_listing = purchased_product_listing["productListing"]
                product_id = product_listing["productID"]
                quantity = purchased_product_listing["value"]
                yearly_purchased_products[product_id] = {
                    "quantity": quantity,
                    "price": product_listing["price"],
                    "product_listing_id": product_listing["id"],
                }

        for contract in account["contracts"]:
            contract_info = contract["contractInfo"]
            items = contract_info.get("items")
            if not items:
                # TODO(frankban): clean up existing contracts with no items in
                # production.
                continue

            contract_id = contract_info["id"]
            contract["token"] = g.api.get_contract_token(contract_id)

            if contract_info.get("origin", "") == "free":
                personal_account = account
                personal_account["free_token"] = contract["token"]

                continue

            entitlements = {}
            for entitlement in contract_info["resourceEntitlements"]:
                contract["supportLevel"] = "-"
                if entitlement["type"] == "support":
                    affordance = entitlement["affordances"]
                    contract["supportLevel"] = affordance["supportLevel"]

                    continue

                entitlement_type = entitlement["type"]
                entitlements[entitlement_type] = True
            contract["entitlements"] = entitlements

            created_at = parse(contract_info["createdAt"])
            format_create = created_at.strftime("%d %B %Y")
            contract["contractInfo"]["createdAtFormatted"] = format_create
            contract["contractInfo"]["status"] = "active"

            time_now = datetime.utcnow().replace(tzinfo=pytz.utc)

            if (
                not new_subscription_start_date
                or created_at > new_subscription_start_date
            ):
                new_subscription_start_date = created_at
                new_subscription_id = contract["contractInfo"]["id"]

            effective_to = parse(contract_info["effectiveTo"])
            format_effective = effective_to.strftime("%d %B %Y")
            contract["contractInfo"]["effectiveToFormatted"] = format_effective

            if effective_to < time_now:
                contract["contractInfo"]["status"] = "expired"
                restart_date = time_now - timedelta(days=1)
                contract["contractInfo"]["expired_restart_date"] = restart_date

            date_difference = effective_to - time_now
            contract["expiring"] = date_difference.days <= 30
            contract["contractInfo"]["daysTillExpiry"] = date_difference.days

            try:
                contract["renewal"] = _make_renewal(contract["contractInfo"])
            except KeyError:
                flask.current_app.extensions["sentry"].captureException()
                contract["renewal"] = None

            enterprise_contract = enterprise_contracts.setdefault(
                contract["accountInfo"]["name"], []
            )

            product_name = contract["contractInfo"]["products"][0]

            contract["productID"] = product_name
            contract["is_detached"] = False
            contract["machineCount"] = 0
            contract["rowMachineCount"] = 0

            has_trial = False
            trial_contract_item = None
            for item in items:
                reason = item.get("reason")
                if reason == "trial_started":
                    has_trial = True
                    trial_contract_item = item

                    break

            is_trialled = has_trial and date_difference.days > 0
            if is_trialled:
                trial_contract = contract.copy()
                trial_contract["is_detached"] = True
                trial_contract["is_trialled"] = True
                active_trial = [
                    subscription
                    for subscription in all_subscriptions
                    if subscription["subscription"]["startedWithTrial"]
                    and subscription["subscription"]["inTrial"]
                    and subscription["subscription"]["status"] == "active"
                ]

                trial_contract["is_trialled_but_cancelled"] = (
                    False if active_trial else True
                )
                trial_contract["machineCount"] = trial_contract_item["value"]
                trial_contract["rowMachineCount"] = trial_contract_item[
                    "value"
                ]

                if trial_contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, trial_contract)
                elif (
                    trial_contract["contractInfo"]["id"] == new_subscription_id
                ):
                    enterprise_contract.insert(0, trial_contract)
                else:
                    enterprise_contract.append(trial_contract)

                total_enterprise_contracts += 1

            if is_trialled and len(items) == 1:
                continue

            contract["is_trialled"] = False

            allowances = contract_info.get("allowances")
            if (
                allowances
                and len(allowances) > 0
                and allowances[0]["metric"] == "units"
            ):
                contract["rowMachineCount"] = allowances[0]["value"]
                if trial_contract_item:
                    contract["rowMachineCount"] = (
                        contract["rowMachineCount"]
                        - trial_contract_item["value"]
                    )

            if product_name in yearly_purchased_products:
                purchased_product = yearly_purchased_products[product_name]
                contract["price_per_unit"] = purchased_product["price"]
                contract["machineCount"] = purchased_product["quantity"]
                contract["product_listing_id"] = purchased_product[
                    "product_listing_id"
                ]
                contract["period"] = "yearly"

                if contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, contract)
                elif contract["contractInfo"]["id"] == new_subscription_id:
                    enterprise_contract.insert(0, contract)
                else:
                    enterprise_contract.append(contract)

                if contract["contractInfo"]["status"] != "expired":
                    total_enterprise_contracts += 1

            if product_name in monthly_purchased_products:
                contract = contract.copy()
                purchased_product = monthly_purchased_products[product_name]
                contract["price_per_unit"] = purchased_product["price"]
                contract["machineCount"] = purchased_product["quantity"]
                contract["is_cancelable"] = True
                contract["product_listing_id"] = purchased_product[
                    "product_listing_id"
                ]
                contract["period"] = "monthly"

                if contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, contract)
                elif contract["contractInfo"]["id"] == new_subscription_id:
                    enterprise_contract.insert(0, contract)
                else:
                    enterprise_contract.append(contract)

                if contract["contractInfo"]["status"] != "expired":
                    total_enterprise_contracts += 1

            if (
                product_name not in yearly_purchased_products
                and product_name not in monthly_purchased_products
            ):
                contract["is_detached"] = True

                if contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, contract)
                elif contract["contractInfo"]["id"] == new_subscription_id:
                    enterprise_contract.insert(0, contract)
                else:
                    enterprise_contract.append(contract)

                if contract["contractInfo"]["status"] != "expired":
                    total_enterprise_contracts += 1

    return flask.render_template(
        "advantage/index.html",
        accounts=accounts,
        monthly_information=monthly_info,
        total_enterprise_contracts=total_enterprise_contracts,
        pending_purchase_id=pending_purchase_id,
        enterprise_contracts=enterprise_contracts,
        previous_purchase_ids=previous_purchase_ids,
        personal_account=personal_account,
        open_subscription=open_subscription,
        new_subscription_id=new_subscription_id,
    )


@advantage_decorator(permission="user", response="json")
@use_kwargs({"email": String()}, location="query")
def get_user_subscriptions(**kwargs):
    g.api.set_convert_response(True)

    email = kwargs.get("email")

    listings = g.api.get_product_listings("canonical-ua")
    accounts = g.api.get_accounts(email=email)

    user_summary = []
    for account in accounts:
        contracts = g.api.get_account_contracts(account_id=account.id)
        subscriptions = g.api.get_account_subscriptions(
            account_id=account.id,
            marketplace="canonical-ua",
        )

        user_summary.append(
            {
                "account": account,
                "contracts": contracts,
                "subscriptions": subscriptions,
            }
        )

    user_subscriptions = build_user_subscriptions(user_summary, listings)

    return flask.jsonify(to_dict(user_subscriptions))


@advantage_decorator(permission="user", response="json")
@use_kwargs({"account_id": String()}, location="query")
def get_last_purchase_ids(account_id):
    g.api.set_convert_response(True)

    subscriptions = g.api.get_account_subscriptions(
        account_id=account_id,
        marketplace="canonical-ua",
    )

    last_purchase_ids = extract_last_purchase_ids(subscriptions)

    return flask.jsonify(last_purchase_ids)


@advantage_decorator(permission="user", response="json")
def get_account_users():
    g.api.set_convert_response(True)

    try:
        account = g.api.get_purchase_account()
    except UAContractsUserHasNoAccount as error:
        # if no account throw 404
        raise UAContractsAPIError(error)

    account_users = g.api.get_account_users(account_id=account.id)

    return flask.jsonify(
        {
            "account_id": account.id,
            "name": account.name,
            "users": to_dict(account_users),
        }
    )


@advantage_decorator(permission="user", response="json")
@use_kwargs(post_account_user_role, location="json")
def post_account_user_role(account_id, **kwargs):
    g.api.set_convert_response(True)

    account_users = g.api.get_account_users(account_id=account_id)

    user_exists = any(
        user for user in account_users if user.email == kwargs.get("email")
    )

    if user_exists:
        return flask.jsonify({"error": "email already exists"}), 400

    return g.api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "nameHint": kwargs.get("name"),
            "role": kwargs.get("role"),
        },
    )


@advantage_decorator(permission="user", response="json")
@use_kwargs(put_account_user_role, location="json")
def put_account_user_role(account_id, **kwargs):
    return g.api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "role": kwargs.get("role"),
        },
    )


@advantage_decorator(permission="user", response="json")
@use_kwargs(delete_account_user_role, location="json")
def delete_account_user_role(account_id, **kwargs):
    return g.api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "role": "none",
        },
    )


@advantage_decorator(permission="user", response="json")
@use_kwargs({"contract_id": String()}, location="query")
def get_contract_token(contract_id):
    g.api.set_convert_response(True)

    contract_token = g.api.get_contract_token(contract_id)

    return flask.jsonify({"contract_token": contract_token})


@advantage_decorator(permission="user", response="json")
def get_user_info():
    g.api.set_convert_response(True)

    try:
        account = g.api.get_purchase_account()
    except UAContractsUserHasNoAccount as error:
        # if no account throw 404
        raise UAContractsAPIError(error)

    subscriptions = g.api.get_account_subscriptions(
        account_id=account.id,
        marketplace="canonical-ua",
        filters={"status": "active", "period": "monthly"},
    )

    monthly_subscription: Optional[Subscription] = (
        subscriptions[0] if len(subscriptions) > 0 else None
    )

    renewal_info = None
    if monthly_subscription and monthly_subscription.is_auto_renewing:
        renewal_info = g.api.get_subscription_auto_renewal(
            monthly_subscription.id
        )

    user_summary = {
        "subscription": monthly_subscription,
        "renewal_info": renewal_info,
    }

    return build_get_user_info(user_summary)


@advantage_decorator(response="html")
def advantage_shop_view():
    g.api.set_convert_response(True)

    account = None
    if user_info(flask.session):
        try:
            account = g.api.get_purchase_account()
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    all_subscriptions = []
    if account:
        all_subscriptions = g.api.get_account_subscriptions(
            account_id=account.id,
            marketplace="canonical-ua",
        )

    current_subscriptions = [
        subscription
        for subscription in all_subscriptions
        if subscription.status in ["active", "locked"]
    ]

    is_trialling = any(
        subscription
        for subscription in current_subscriptions
        if subscription.in_trial
    )

    listings = g.api.get_product_listings("canonical-ua")

    previous_purchase_ids = extract_last_purchase_ids(current_subscriptions)
    user_listings = set_listings_trial_status(listings, all_subscriptions)

    return flask.render_template(
        "advantage/subscribe/index.html",
        account=account,
        previous_purchase_ids=previous_purchase_ids,
        product_listings=user_listings,
        is_trialling=is_trialling,
    )


@advantage_decorator(permission="user", response="html")
def advantage_account_users_view():
    return flask.render_template("advantage/users/index.html")


@advantage_decorator(permission="user", response="html")
def payment_methods_view():
    account = None
    default_payment_method = None
    account_id = ""
    pending_purchase_id = ""

    try:
        account = g.api.get_purchase_account()
    except UAContractsUserHasNoAccount:
        # No Stripe account

        pass

    if account:
        account_id = account["id"]
        subscriptions = []

        for marketplace in SERVICES:
            market_subscriptions = g.api.get_account_subscriptions(
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
            account_info = g.api.get_customer_info(account_id)
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


@advantage_decorator(response="html")
@use_kwargs({"email": String()}, location="query")
def advantage_thanks_view(**kwargs):
    return flask.render_template(
        "advantage/subscribe/thank-you.html",
        email=kwargs.get("email"),
    )


@advantage_decorator(permission="user_or_guest", response="json")
@use_kwargs(post_advantage_subscriptions, location="json")
def post_advantage_subscriptions(preview, **kwargs):
    account_id = kwargs.get("account_id")
    previous_purchase_id = kwargs.get("previous_purchase_id")
    period = kwargs.get("period")
    products = kwargs.get("products")
    resizing = kwargs.get("resizing", False)
    trialling = kwargs.get("trialling", False)
    marketplace = kwargs.get("marketplace", "canonical-ua")

    current_subscription = {}
    if user_info(flask.session):
        subscriptions = g.api.get_account_subscriptions(
            account_id=account_id,
            marketplace=marketplace,
            filters={"status": "active"},
        )

        for subscription in subscriptions:
            if (
                subscription["subscription"]["period"] == period
                and subscription["subscription"]["marketplace"] == marketplace
            ):
                current_subscription = subscription

    # If there is a subscription we get the current metric
    # value for each product listing so we can generate a
    # purchase request with updated quantities later.
    # If we resize we want to override the existing value
    subscribed_quantities = {}
    if not resizing and current_subscription:
        for item in current_subscription["purchasedProductListings"]:
            product_listing_id = item["productListing"]["id"]
            subscribed_quantities[product_listing_id] = item["value"]

    purchase_items = []
    for product in products:
        product_listing_id = product["product_listing_id"]
        metric_value = product["quantity"] + subscribed_quantities.get(
            product_listing_id, 0
        )

        purchase_items.append(
            {
                "productListingID": product_listing_id,
                "metric": "active-machines",
                "value": metric_value,
            }
        )

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": purchase_items,
        "previousPurchaseID": previous_purchase_id,
    }

    if trialling:
        purchase_request["inTrial"] = True

    try:
        if not preview:
            purchase = g.api.purchase_from_marketplace(
                marketplace=marketplace, purchase_request=purchase_request
            )
        else:
            purchase = g.api.preview_purchase_from_marketplace(
                marketplace=marketplace, purchase_request=purchase_request
            )
    except CannotCancelLastContractError as error:
        raise UAContractsAPIError(error)

    return flask.jsonify(purchase), 200


@advantage_decorator(permission="user", response="json")
@use_kwargs(cancel_advantage_subscriptions, location="json")
def cancel_advantage_subscriptions(**kwargs):
    account_id = kwargs.get("account_id")
    previous_purchase_id = kwargs.get("previous_purchase_id")
    product_listing_id = kwargs.get("product_listing_id")

    monthly_subscriptions = g.api.get_account_subscriptions(
        account_id=account_id,
        marketplace="canonical-ua",
        filters={"status": "active", "period": "monthly"},
    )

    if not monthly_subscriptions:
        return flask.jsonify({"errors": "no monthly subscriptions found"}), 400

    monthly_subscription = monthly_subscriptions[0]

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": [
            {
                "productListingID": product_listing_id,
                "metric": "active-machines",
                "value": 0,
                "delete": True,
            }
        ],
        "previousPurchaseID": previous_purchase_id,
    }

    try:
        purchase = g.api.purchase_from_marketplace(
            marketplace="canonical-ua", purchase_request=purchase_request
        )
    except CannotCancelLastContractError:
        g.api.cancel_subscription(
            subscription_id=monthly_subscription["subscription"]["id"]
        )

        return (
            flask.jsonify({"message": "Subscription Cancelled"}),
            200,
        )

    return flask.jsonify(purchase), 200


@advantage_decorator(permission="user", response="json")
@use_kwargs(put_contract_entitlements, location="json")
def put_contract_entitlements(contract_id, **kwargs):
    g.api.set_convert_response(True)

    settings = kwargs.get("entitlements")

    contract = g.api.get_contract(contract_id)

    allowed_entitlements = [
        "cis",
        "esm-infra",
        "esm-apps",
        "fips",
        "fips-updates",
        "livepatch",
        "support",
    ]

    # validate request body
    for setting in settings:
        # prevent updating entitlements not on the allow list
        if setting["type"] not in allowed_entitlements:
            return (
                flask.jsonify(
                    {
                        "error": (
                            f"Updating entitlement '{setting['type']}' "
                            f"is not allowed."
                        )
                    }
                ),
                400,
            )

        # prevent updating entitlements with the status "Not available"
        has_not_available_entitlements = not any(
            entitlement
            for entitlement in contract.entitlements
            if entitlement.type == setting["type"]
        )

        if has_not_available_entitlements:
            return (
                flask.jsonify(
                    {
                        "error": (
                            f"Entitlement '{setting['type']}' "
                            f"is not available."
                        )
                    }
                ),
                400,
            )

    # merge current entitlements settings with new entitlement settings
    all_entitlements = settings
    for entitlement in contract.entitlements:
        current_setting = any(
            setting
            for setting in settings
            if setting["type"] == entitlement.type
        )

        if not current_setting:
            all_entitlements.append(
                {
                    "type": entitlement.type,
                    "is_enabled": entitlement.enabled_by_default,
                }
            )

    # check current status of entitlements
    has_livepatch_on = False
    has_fips_on = False
    has_fips_updates_on = False
    for entitlement in all_entitlements:
        if entitlement["type"] == "livepatch":
            has_livepatch_on = entitlement["is_enabled"]
        if entitlement["type"] == "fips-updates":
            has_fips_updates_on = entitlement["is_enabled"]
        if entitlement["type"] == "fips":
            has_fips_on = entitlement["is_enabled"]

    # check rules on the current statuses
    if has_fips_on and (has_livepatch_on or has_fips_updates_on):
        return (
            flask.jsonify(
                {
                    "error": (
                        "Cannot have FIPS active at the same time as "
                        "Livepatch or FIPS Updates"
                    )
                }
            ),
            400,
        )

    # build entitlement request for the API
    entitlements_request = []
    for setting in settings:
        entitlements_request.append(
            {
                "type": setting["type"],
                "obligations": {
                    "enableByDefault": setting["is_enabled"],
                },
            }
        )

    return g.api.put_contract_entitlements(
        contract_id=contract_id, entitlements_request=entitlements_request
    )


@advantage_decorator(permission="user_or_guest", response="json")
@use_kwargs(post_anonymised_customer_info, location="json")
def post_anonymised_customer_info(**kwargs):
    account_id = kwargs.get("account_id")
    name = kwargs.get("name")
    address = kwargs.get("address")
    tax_id = kwargs.get("tax_id")

    if tax_id:
        tax_id["value"] = tax_id["value"].replace(" ", "")

        if tax_id["value"] == "":
            tax_id["delete"] = True

    return g.api.put_anonymous_customer_info(account_id, name, address, tax_id)


@advantage_decorator(permission="user", response="json")
@use_kwargs(post_payment_methods, location="json")
def post_payment_methods(**kwargs):
    account_id = kwargs.get("account_id")
    payment_method_id = kwargs.get("payment_method_id")

    try:
        response = g.api.put_payment_method(account_id, payment_method_id)
    except UAContractsUserHasNoAccount:
        name = flask.session["openid"]["fullname"]

        response = g.api.put_customer_info(
            account_id, payment_method_id, None, name, None
        )

    return response


@advantage_decorator(permission="user", response="json")
@use_kwargs({"should_auto_renew": Boolean()}, location="json")
def post_auto_renewal_settings(**kwargs):
    should_auto_renew = kwargs.get("should_auto_renew", False)

    accounts = g.api.get_accounts()

    for account in accounts:
        monthly_subscriptions = g.api.get_account_subscriptions(
            account_id=account["id"],
            marketplace="canonical-ua",
            filters={"status": "active", "period": "monthly"},
        )

        for subscription in monthly_subscriptions:
            g.api.post_subscription_auto_renewal(
                subscription_id=subscription["subscription"]["id"],
                should_auto_renew=should_auto_renew,
            )

    return (
        flask.jsonify({"message": "subscription renewal status was changed"}),
        200,
    )


@advantage_decorator(permission="user", response="json")
def get_customer_info(account_id, **kwargs):
    response = {"success": False, "data": {}}

    try:
        response["data"] = g.api.get_customer_info(account_id)
        response["success"] = True
    except HTTPError as error:
        if error.response.status_code == 404:
            response["data"] = error.response.json()
            response["success"] = False
        else:
            flask.current_app.extensions["sentry"].captureException()
            raise error

    return response


@advantage_decorator(permission="user_or_guest", response="json")
@use_kwargs(post_customer_info, location="json")
def post_customer_info(**kwargs):
    payment_method_id = kwargs.get("payment_method_id")
    account_id = kwargs.get("account_id")
    address = kwargs.get("address")
    name = kwargs.get("name")
    tax_id = kwargs.get("tax_id")

    if tax_id:
        tax_id["value"] = tax_id["value"].replace(" ", "")

        if tax_id["value"] == "":
            tax_id["delete"] = True

    return g.api.put_customer_info(
        account_id, payment_method_id, address, name, tax_id
    )


@advantage_decorator(permission="user_or_guest", response="json")
def post_stripe_invoice_id(tx_type, tx_id, invoice_id):
    return g.api.post_stripe_invoice_id(tx_type, tx_id, invoice_id)


@advantage_decorator(permission="user_or_guest", response="json")
def get_purchase(purchase_id):
    return g.api.get_purchase(purchase_id)


@advantage_decorator()
@use_kwargs(ensure_purchase_account, location="json")
def ensure_purchase_account(**kwargs):
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
        account = g.api.ensure_purchase_account(
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


@advantage_decorator(permission="user", response="json")
def cancel_trial(account_id):
    g.api.set_convert_response(True)

    subscriptions: List[Subscription] = g.api.get_account_subscriptions(
        account_id=account_id, marketplace="canonical-ua"
    )

    subscription_to_cancel = None
    for subscription in subscriptions:
        if subscription.started_with_trial and subscription.status == "active":
            subscription_to_cancel = subscription

            break

    if not subscription_to_cancel:
        return flask.jsonify({"errors": "no subscription in trial"}), 500

    return g.api.cancel_subscription(subscription_id=subscription_to_cancel.id)


@advantage_decorator(permission="user", response="json")
def get_renewal(renewal_id):
    return g.api.get_renewal(renewal_id)


@advantage_decorator(permission="user", response="json")
def accept_renewal(renewal_id):
    return g.api.accept_renewal(renewal_id)


@advantage_decorator(permission="user", response="html")
def account_view():
    email = flask.session["openid"]["email"]

    return flask.render_template(
        "account/index.html",
        email=email,
    )


@advantage_decorator(permission="user", response="html")
@use_kwargs(invoice_view, location="query")
def invoices_view(**kwargs):
    email = kwargs.get("email", "").strip()
    marketplace = kwargs.get("marketplace")

    accounts = g.api.get_accounts(email=email)

    total_payments = []
    filters = {"marketplace": marketplace} if marketplace else None
    for account in accounts:
        raw_payments = g.api.get_account_purchases(
            account_id=account["id"],
            filters=filters,
        )

        if not raw_payments:
            continue

        product_listings = raw_payments["productListings"]
        for raw_payment in raw_payments["purchases"]:
            payment_id = raw_payment["id"]
            payment_marketplace = raw_payment["marketplace"]
            created_at = raw_payment["createdAt"]

            total = None
            invoice = raw_payment.get("invoice")
            status = invoice.get("status")
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


@advantage_decorator(permission="user", response="html")
def download_invoice(purchase_id):
    purchase = g.api.get_purchase(purchase_id)
    download_link = purchase["invoice"]["url"]

    return flask.redirect(download_link)


def _prepare_monthly_info(monthly_info, subscription):
    purchased_products = subscription.get("purchasedProductListings")
    subscription_info = subscription.get("subscription")
    subscription_id = subscription_info.get("id")
    is_renewing = subscription_info.get("autoRenew", False)

    monthly_info["total_subscriptions"] += len(purchased_products)
    monthly_info["has_monthly"] = True
    monthly_info["id"] = subscription_id
    monthly_info["is_auto_renewal_enabled"] = is_renewing

    if is_renewing:
        renewal_info = g.api.get_subscription_auto_renewal(subscription_id)
        last_renewal = parse(renewal_info["subscriptionStartOfCycle"])
        next_renewal = parse(renewal_info["subscriptionEndOfCycle"])
        total = renewal_info["total"] / 100
        currency = renewal_info["currency"]

        monthly_info["last_payment_date"] = last_renewal.strftime("%d %B %Y")
        monthly_info["next_payment"] = {
            "date": next_renewal.strftime("%d %B %Y"),
            "amount": f"{total} {currency}",
        }


def _make_renewal(contract_info):
    """Return the renewal as present in the given info, or None."""
    renewals = contract_info.get("renewals")
    if not renewals:
        return None

    sorted_renewals = sorted(
        (r for r in renewals if r["status"] not in ["lost", "closed"]),
        key=lambda renewal: parse(renewal["start"]),
    )

    if len(sorted_renewals) == 0:
        return None

    renewal = sorted_renewals[0]

    # If the renewal is processing, we need to find out
    # whether payment failed and requires user action,
    # which is information only available in the fuller
    # renewal object get_renewal gives us.
    if renewal["status"] == "processing":
        renewal = g.api.get_renewal(renewal["id"])

    renewal["renewable"] = False

    if renewal["status"] == "done":
        try:
            renewal_modified_date = parse(renewal["lastModified"])
            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)

            renewal["recently_renewed"] = one_hour_ago < renewal_modified_date
        except KeyError:
            renewal["recently_renewed"] = False

    # Only actionable renewals are renewable.
    # If "actionable" isn't set, it's not actionable
    # If "actionable" IS set, but not true, it's not actionable
    if "actionable" not in renewal:
        renewal["actionable"] = False
        return renewal
    elif not renewal["actionable"]:
        return renewal

    # The renewal is renewable only during its time window.
    start = parse(renewal["start"])
    end = parse(renewal["end"])
    if not (start <= datetime.now(timezone.utc) <= end):
        return renewal

    # Pending renewals are renewable.
    if renewal["status"] == "pending":
        renewal["renewable"] = True
        return renewal

    # Renewals not pending or processing are never renewable.
    if renewal["status"] != "processing":
        return renewal

    invoices = renewal.get("stripeInvoices")
    if invoices:
        invoice = invoices[-1]
        renewal["renewable"] = (
            invoice["pi_status"] == "requires_payment_method"
            or invoice["pi_status"] == "requires_action"
        ) and invoice["subscription_status"] == "incomplete"

    return renewal


@advantage_decorator(response="html")
def blender_shop_view():
    g.api.set_convert_response(True)

    account = None
    if user_info(flask.session):
        try:
            account = g.api.get_purchase_account()
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    all_subscriptions = []
    if account:
        all_subscriptions = g.api.get_account_subscriptions(
            account_id=account.id,
            marketplace="blender",
        )

    current_subscriptions = [
        subscription
        for subscription in all_subscriptions
        if subscription.status in ["active", "locked"]
    ]

    listings = g.api.get_product_listings("blender")
    previous_purchase_ids = extract_last_purchase_ids(current_subscriptions)

    return flask.render_template(
        "advantage/blender/index.html",
        account=account,
        previous_purchase_ids=previous_purchase_ids,
        product_listings=listings,
    )


@advantage_decorator(response="html")
@use_kwargs({"email": String()}, location="query")
def blender_thanks_view(**kwargs):
    return flask.render_template(
        "advantage/blender/thank-you.html",
        email=kwargs.get("email"),
    )
