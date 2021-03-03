# Standard library
from datetime import datetime, timedelta, timezone
import os

# Packages
import dateutil.parser
import flask
import talisker.requests
import pytz
from requests.exceptions import HTTPError


# Local
from webapp.advantage.api import (
    UAContractsAPI,
    CannotCancelLastContractError,
    UnauthorizedError,
)
from webapp.login import empty_session, user_info
from webapp.decorators import store_maintenance


session = talisker.requests.get_session()


@store_maintenance
def advantage_view():
    is_test_backend = flask.request.args.get("test_backend", False)

    stripe_publishable_key = os.getenv(
        "STRIPE_LIVE_PUBLISHABLE_KEY", "pk_live_68aXqowUeX574aGsVck8eiIE"
    )

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        stripe_publishable_key = os.getenv(
            "STRIPE_TEST_PUBLISHABLE_KEY",
            "pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46",
        )
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not user_info(flask.session):
        return flask.render_template(
            "advantage/index-no-login.html",
            is_test_backend=is_test_backend,
        )

    open_subscription = flask.request.args.get("subscription", None)

    personal_account = None
    new_subscription_id = None
    new_subscription_start_date = None
    payment_method_warning = None

    enterprise_contracts = {}
    previous_purchase_ids = {"monthly": "", "yearly": ""}
    monthly_info = {
        "total_subscriptions": 0,
        "has_monthly": False,
        "next_payment": {},
    }

    advantage = UAContractsAPI(
        session,
        flask.session["authentication_token"],
        api_url=api_url,
    )

    try:
        accounts = advantage.get_accounts()
    except HTTPError as http_error:
        if http_error.response.status_code == 401:
            # We got an unauthorized request, so we likely
            # need to re-login to refresh the macaroon
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "session_keys": flask.session.keys(),
                    "request_url": http_error.request.url,
                    "request_headers": http_error.request.headers,
                    "response_headers": http_error.response.headers,
                    "response_body": http_error.response.json(),
                    "response_code": http_error.response.json()["code"],
                    "response_message": http_error.response.json()["message"],
                }
            )

            empty_session(flask.session)

            return flask.render_template("advantage/index-no-login.html")

        raise http_error

    for account in accounts:
        monthly_purchased_products = {}
        yearly_purchased_products = {}
        account["contracts"] = advantage.get_account_contracts(account)

        try:
            all_subscriptions = (
                advantage.get_account_subscriptions_for_marketplace(
                    account_id=account["id"],
                    marketplace="canonical-ua",
                    filters={"status": "active"},
                )
            )
        except HTTPError:
            flask.current_app.extensions["sentry"].captureException(
                extra={"account_id": account["id"]}
            )
            return (
                flask.jsonify(
                    {"error": "could not retrieve account subscriptions"}
                ),
                500,
            )

        monthly_subscriptions = []
        yearly_subscriptions = []
        for subscription in all_subscriptions.get("subscriptions", []):
            period = subscription["subscription"]["period"]
            status = subscription["subscription"]["status"]

            # If there are any pending purchase, for monthly (active or locked)
            # we show the payment method warning.
            if period == "monthly" and status in ["active", "locked"]:
                payment_method_warning = subscription.get("pendingPurchases")

            previous_purchase_ids[period] = subscription["lastPurchaseID"]

            if subscription["subscription"]["period"] == "yearly":
                yearly_subscriptions.append(subscription)
                continue

            monthly_subscriptions.append(subscription)

        for subscription in monthly_subscriptions:
            purchased_products = subscription["purchasedProductListings"]
            for purchased_product_listing in purchased_products:
                product_listing = purchased_product_listing["productListing"]
                product_id = product_listing["productID"]
                quantity = purchased_product_listing["value"]
                monthly_purchased_products[product_id] = {
                    "quantity": quantity,
                    "price": product_listing["price"],
                }

            _prepare_monthly_info(monthly_info, subscription, advantage)

        for subscription in yearly_subscriptions:
            purchased_products = subscription["purchasedProductListings"]
            for purchased_product_listing in purchased_products:
                product_listing = purchased_product_listing["productListing"]
                product_id = product_listing["productID"]
                quantity = purchased_product_listing["value"]
                yearly_purchased_products[product_id] = {
                    "quantity": quantity,
                    "price": product_listing["price"],
                }

        for contract in account["contracts"]:
            try:
                contract["token"] = advantage.get_contract_token(contract)
            except HTTPError:
                flask.current_app.extensions["sentry"].captureException(
                    extra={"contract_id": contract["contractInfo"]["id"]}
                )
                return (
                    flask.jsonify(
                        {"error": "could not retrieve contract token"}
                    ),
                    500,
                )

            if contract["contractInfo"].get("origin", "") == "free":
                personal_account = account
                personal_account["free_token"] = contract["token"]

                continue

            contract_info = contract["contractInfo"]
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

            created_at = dateutil.parser.parse(contract_info["createdAt"])
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

            effective_to = dateutil.parser.parse(contract_info["effectiveTo"])
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
                contract["renewal"] = _make_renewal(
                    advantage, contract["contractInfo"]
                )
            except KeyError:
                flask.current_app.extensions["sentry"].captureException()
                contract["renewal"] = None

            enterprise_contract = enterprise_contracts.setdefault(
                contract["accountInfo"]["name"], []
            )

            product_name = contract["contractInfo"]["products"][0]

            contract["productID"] = product_name
            contract["is_detached"] = False
            contract["machineCount"] = "-"

            if product_name in yearly_purchased_products:
                purchased_product = yearly_purchased_products[product_name]
                contract["price_per_unit"] = purchased_product["price"]
                contract["machineCount"] = purchased_product["quantity"]
                contract["period"] = "yearly"

                if contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, contract)
                elif contract["contractInfo"]["id"] == new_subscription_id:
                    enterprise_contract.insert(0, contract)
                else:
                    enterprise_contract.append(contract)

            if product_name in monthly_purchased_products:
                contract = contract.copy()
                purchased_product = monthly_purchased_products[product_name]
                contract["price_per_unit"] = purchased_product["price"]
                contract["machineCount"] = purchased_product["quantity"]
                contract["is_cancelable"] = True
                contract["period"] = "monthly"

                if contract["contractInfo"]["id"] == open_subscription:
                    enterprise_contract.insert(0, contract)
                elif contract["contractInfo"]["id"] == new_subscription_id:
                    enterprise_contract.insert(0, contract)
                else:
                    enterprise_contract.append(contract)

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

    return flask.render_template(
        "advantage/index.html",
        accounts=accounts,
        subscriptions=monthly_info,
        payment_method_warning=payment_method_warning,
        enterprise_contracts=enterprise_contracts,
        previous_purchase_ids=previous_purchase_ids,
        personal_account=personal_account,
        open_subscription=open_subscription,
        new_subscription_id=new_subscription_id,
        stripe_publishable_key=stripe_publishable_key,
        is_test_backend=is_test_backend,
    )


@store_maintenance
def advantage_shop_view():
    account = None
    previous_purchase_ids = {"monthly": "", "yearly": ""}
    is_test_backend = flask.request.args.get("test_backend", False)

    stripe_publishable_key = os.getenv(
        "STRIPE_LIVE_PUBLISHABLE_KEY", "pk_live_68aXqowUeX574aGsVck8eiIE"
    )
    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        stripe_publishable_key = os.getenv(
            "STRIPE_TEST_PUBLISHABLE_KEY",
            "pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46",
        )
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if user_info(flask.session):
        advantage = UAContractsAPI(
            session,
            flask.session["authentication_token"],
            api_url=api_url,
        )
        if flask.session.get("guest_authentication_token"):
            flask.session.pop("guest_authentication_token")

        try:
            account = advantage.get_purchase_account()
        except HTTPError as err:
            code = err.response.status_code
            if code == 401:
                # We got an unauthorized request, so we likely
                # need to re-login to refresh the macaroon
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "session_keys": flask.session.keys(),
                        "request_url": err.request.url,
                        "request_headers": err.request.headers,
                        "response_headers": err.response.headers,
                        "response_body": err.response.json(),
                        "response_code": err.response.json()["code"],
                        "response_message": err.response.json()["message"],
                    }
                )

                empty_session(flask.session)

                return flask.render_template(
                    "advantage/subscribe/index.html",
                    account=None,
                    previous_purchase_ids=previous_purchase_ids,
                    product_listings=[],
                    stripe_publishable_key=stripe_publishable_key,
                    is_test_backend=is_test_backend,
                )
            if code != 404:
                raise
            # There is no purchase account yet for this user.
            # One will need to be created later, but this is an expected
            # condition.
    else:
        advantage = UAContractsAPI(session, None, api_url=api_url)

    if account is not None:
        resp = advantage.get_account_subscriptions_for_marketplace(
            account_id=account["id"],
            marketplace="canonical-ua",
            filters={"status": "active"},
        )

        for subscription in resp.get("subscriptions", []):
            period = subscription["subscription"]["period"]
            previous_purchase_ids[period] = subscription["lastPurchaseID"]

    listings_response = advantage.get_marketplace_product_listings(
        "canonical-ua"
    )
    product_listings = listings_response.get("productListings")
    if not product_listings:
        # For the time being, no product listings means the shop has not been
        # activated, so fallback to shopify. This should become an error later.
        return flask.redirect("https://buy.ubuntu.com/")

    products = {pr["id"]: pr for pr in listings_response["products"]}
    listings = []
    for listing in product_listings:
        if "price" not in listing:
            continue
        listing["product"] = products[listing["productID"]]
        listings.append(listing)

    return flask.render_template(
        "advantage/subscribe/index.html",
        account=account,
        previous_purchase_ids=previous_purchase_ids,
        product_listings=listings,
        stripe_publishable_key=stripe_publishable_key,
        is_test_backend=is_test_backend,
    )


@store_maintenance
def advantage_payment_methods_view():
    is_test_backend = flask.request.args.get("test_backend", False)
    default_payment_method = None
    account_id = None

    stripe_publishable_key = os.getenv(
        "STRIPE_LIVE_PUBLISHABLE_KEY", "pk_live_68aXqowUeX574aGsVck8eiIE"
    )

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        stripe_publishable_key = os.getenv(
            "STRIPE_TEST_PUBLISHABLE_KEY",
            "pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46",
        )
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if user_info(flask.session):
        advantage = UAContractsAPI(
            session,
            flask.session["authentication_token"],
            api_url=api_url,
        )

        try:
            account = advantage.get_purchase_account()
            customer_info_response = get_customer_info(account["id"])
            if customer_info_response["success"]:
                customer_info = customer_info_response["data"].get(
                    "customerInfo"
                )

                if customer_info:
                    default_payment_method = customer_info.get(
                        "defaultPaymentMethod"
                    )

                    if customer_info.get("accountInfo"):
                        account_id = customer_info["accountInfo"].get("id")

        except HTTPError as http_error:
            if http_error.response.status_code == 401:
                # We got an unauthorized request, so we likely
                # need to re-login to refresh the macaroon
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "session_keys": flask.session.keys(),
                        "request_url": http_error.request.url,
                        "request_headers": http_error.request.headers,
                        "response_headers": http_error.response.headers,
                        "response_body": http_error.response.json(),
                        "response_code": http_error.response.json()["code"],
                        "response_message": http_error.response.json()[
                            "message"
                        ],
                    }
                )

                empty_session(flask.session)

                return flask.render_template("advantage/index.html")

            raise http_error

    return flask.render_template(
        "advantage/payment-methods/index.html",
        stripe_publishable_key=stripe_publishable_key,
        is_test_backend=is_test_backend,
        default_payment_method=default_payment_method,
        account_id=account_id,
    )


@store_maintenance
def advantage_thanks_view():
    email = flask.request.args.get("email")

    if user_info(flask.session):
        return flask.redirect("/advantage")
    else:
        return flask.render_template(
            "advantage/subscribe/thank-you.html",
            email=email,
        )


def post_advantage_subscriptions(preview):
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    user_token = flask.session.get("authentication_token")
    guest_token = flask.session.get("guest_authentication_token")

    if user_info(flask.session) or guest_token:
        advantage = UAContractsAPI(
            session,
            user_token or guest_token,
            token_type=("Macaroon" if user_token else "Bearer"),
            api_url=api_url,
        )
    else:
        return flask.jsonify({"error": "authentication required"}), 401

    payload = flask.request.json
    if not payload:
        return flask.jsonify({}), 400

    account_id = payload.get("account_id")
    previous_purchase_id = payload.get("previous_purchase_id")
    period = payload.get("period")
    existing_subscription = {}

    if not guest_token:
        try:
            subscriptions = (
                advantage.get_account_subscriptions_for_marketplace(
                    account_id=account_id,
                    marketplace="canonical-ua",
                    filters={"status": "active"},
                )
            )
        except HTTPError:
            flask.current_app.extensions["sentry"].captureException(
                extra={"payload": payload}
            )
            return (
                flask.jsonify(
                    {"error": "could not retrieve account subscriptions"}
                ),
                500,
            )

        for subscription in subscriptions.get("subscriptions", []):
            if subscription["subscription"]["period"] == period:
                existing_subscription = subscription

    # If there is a subscription we get the current metric
    # value for each product listing so we can generate a
    # purchase request with updated quantities later.
    subscribed_quantities = {}
    if existing_subscription:
        for item in existing_subscription["purchasedProductListings"]:
            product_listing_id = item["productListing"]["id"]
            subscribed_quantities[product_listing_id] = item["value"]

    purchase_items = []
    for product in payload.get("products"):
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

    try:
        if not preview:
            purchase = advantage.purchase_from_marketplace(
                marketplace="canonical-ua", purchase_request=purchase_request
            )
        else:
            purchase = advantage.preview_purchase_from_marketplace(
                marketplace="canonical-ua", purchase_request=purchase_request
            )
    except HTTPError as http_error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "purchase_request": purchase_request,
                "api_response": http_error.response.json(),
            }
        )
        return (
            flask.jsonify(
                {
                    "purchase_request": purchase_request,
                    "api_response": http_error.response.json(),
                }
            ),
            500,
        )

    return flask.jsonify(purchase), 200


def cancel_advantage_subscriptions():
    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if flask.request.args.get("test_backend", False):
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    user_token = flask.session.get("authentication_token")

    if user_info(flask.session):
        advantage = UAContractsAPI(
            session,
            user_token,
            token_type=("Macaroon" if user_token else "Bearer"),
            api_url=api_url,
        )
    else:
        return flask.jsonify({"error": "authentication required"}), 401

    payload = flask.request.json

    account_id = payload.get("account_id")
    previous_purchase_id = payload.get("previous_purchase_id")
    product_listings = payload.get("product_listings")

    if not (account_id and previous_purchase_id and product_listings):
        return flask.jsonify({"error": "bad request"}), 400

    account_id = payload.get("account_id")
    previous_purchase_id = payload.get("previous_purchase_id")

    try:
        monthly_subscriptions = (
            advantage.get_account_subscriptions_for_marketplace(
                account_id=account_id,
                marketplace="canonical-ua",
                filters={"status": "active", "period": "monthly"},
            )
        )
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException(
            extra={"payload": payload}
        )
        return (
            flask.jsonify(
                {"error": "could not retrieve account subscriptions"}
            ),
            500,
        )

    if not monthly_subscriptions.get("subscriptions"):
        return flask.jsonify({"error": "no monthly subscriptions found"}), 400

    monthly_subscription = monthly_subscriptions.get("subscriptions")[0]

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": [
            {
                "productListingID": product_listing,
                "metric": "active-machines",
                "value": 0,
                "delete": True,
            }
            for product_listing in product_listings
        ],
        "previousPurchaseID": previous_purchase_id,
    }

    try:
        purchase = advantage.purchase_from_marketplace(
            marketplace="canonical-ua", purchase_request=purchase_request
        )
    except CannotCancelLastContractError:
        try:
            advantage.cancel_subscription(
                subscription_id=monthly_subscription["subscription"]["id"]
            )

            return (
                flask.jsonify({"message": "Subscription Cancelled"}),
                200,
            )
        except HTTPError as http_error:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "subscription": monthly_subscription,
                    "api_response": http_error.response.json(),
                }
            )

            return (
                flask.jsonify({"error": "could not cancel subscription"}),
                500,
            )
    except HTTPError as http_error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "purchase_request": purchase_request,
                "api_response": http_error.response.json(),
            }
        )

        return flask.jsonify({"error": "purchase failed"}), 500

    return flask.jsonify(purchase), 200


def post_anonymised_customer_info():
    user_token = flask.session.get("authentication_token")
    guest_token = flask.session.get("guest_authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not (user_info(flask.session) or guest_token):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        user_token or guest_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    if not flask.request.is_json:
        return flask.jsonify({"error": "JSON required"}), 400

    account_id = flask.request.json.get("account_id")
    if not account_id:
        return flask.jsonify({"error": "account_id required"}), 400

    address = flask.request.json.get("address")
    if not address:
        return flask.jsonify({"error": "address required"}), 400

    tax_id = flask.request.json.get("tax_id")

    return advantage.put_anonymous_customer_info(account_id, address, tax_id)


def post_payment_method():
    user_token = flask.session.get("authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not user_info(flask.session):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        user_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    if not flask.request.is_json:
        return flask.jsonify({"error": "JSON required"}), 400

    account_id = flask.request.json.get("account_id")
    if not account_id:
        return flask.jsonify({"error": "account_id required"}), 400

    payment_method_id = flask.request.json.get("payment_method_id")
    if not payment_method_id:
        return flask.jsonify({"error": "payment_method_id required"}), 400

    try:
        return advantage.put_payment_method(account_id, payment_method_id)
    except HTTPError as http_error:
        flask.current_app.extensions["sentry"].captureException(
            extra={
                "payment_method_id": payment_method_id,
                "api_response": http_error.response.json(),
            }
        )
        return (
            flask.jsonify(
                {"error": "could not update default payment method"}
            ),
            500,
        )


def post_auto_renewal_settings():
    user_token = flask.session.get("authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not user_info(flask.session):
        return flask.jsonify({"error": "authentication required"}), 401

    should_auto_renew = flask.request.json.get("should_auto_renew", False)

    if not should_auto_renew:
        return flask.jsonify({"error": "should_auto_renew required"}), 400

    advantage = UAContractsAPI(
        session,
        user_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    try:
        accounts = advantage.get_accounts()
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()
        return (
            flask.jsonify({"error": "could not retrieve accounts"}),
            500,
        )

    for account in accounts:
        try:
            monthly_subscriptions = (
                advantage.get_account_subscriptions_for_marketplace(
                    account_id=account["id"],
                    marketplace="canonical-ua",
                    filters={"status": "active", "period": "monthly"},
                )
            )
        except HTTPError:
            flask.current_app.extensions["sentry"].captureException(
                extra={"account_id": account["id"]}
            )
            return (
                flask.jsonify(
                    {"error": "could not retrieve account subscriptions"}
                ),
                500,
            )

        for subscription in monthly_subscriptions.get("subscriptions", []):
            try:
                advantage.post_subscription_auto_renewal(
                    subscription_id=subscription["subscription"]["id"],
                    should_auto_renew=should_auto_renew,
                )
            except HTTPError as http_error:
                flask.current_app.extensions["sentry"].captureException(
                    extra={
                        "subscription_id": subscription["subscription"]["id"],
                        "api_response": http_error.response.json(),
                    }
                )
                return (
                    flask.jsonify(
                        {
                            "error": "could not change auto renewal settings",
                        }
                    ),
                    500,
                )

    return (
        flask.jsonify({"message": "subscription renewal status was changed"}),
        200,
    )


def get_customer_info(account_id):
    is_test_backend = flask.request.args.get("test_backend", False)
    response = {"success": False, "data": {}}

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not user_info(session):
        return flask.jsonify({"error": "authentication required"}), 401

    try:
        advantage = UAContractsAPI(
            session,
            flask.session["authentication_token"],
            api_url=api_url,
        )
        response["data"] = advantage.get_customer_info(account_id)
        response["success"] = True
    except HTTPError as error:
        if error.response.status_code == 404:
            response["data"] = error.response.json()
            response["success"] = False
        else:
            flask.current_app.extensions["sentry"].captureException()
            raise error

    return response


def post_customer_info():
    user_token = flask.session.get("authentication_token")
    guest_token = flask.session.get("guest_authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not (user_info(flask.session) or guest_token):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        user_token or guest_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    if not flask.request.is_json:
        return flask.jsonify({"error": "JSON required"}), 400

    payment_method_id = flask.request.json.get("payment_method_id")
    if not payment_method_id:
        return flask.jsonify({"error": "payment_method_id required"}), 400

    account_id = flask.request.json.get("account_id")
    if not account_id:
        return flask.jsonify({"error": "account_id required"}), 400

    address = flask.request.json.get("address")
    name = flask.request.json.get("name")
    tax_id = flask.request.json.get("tax_id")

    return advantage.put_customer_info(
        account_id, payment_method_id, address, name, tax_id
    )


def post_stripe_invoice_id(tx_type, tx_id, invoice_id):
    user_token = flask.session.get("authentication_token")
    guest_token = flask.session.get("guest_authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not (user_info(flask.session) or guest_token):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        user_token or guest_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    return advantage.post_stripe_invoice_id(tx_type, tx_id, invoice_id)


def get_purchase(purchase_id):
    user_token = flask.session.get("authentication_token")
    guest_token = flask.session.get("guest_authentication_token")
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not (user_info(flask.session) or guest_token):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        user_token or guest_token,
        token_type=("Macaroon" if user_token else "Bearer"),
        api_url=api_url,
    )

    return advantage.get_purchase(purchase_id)


def ensure_purchase_account():
    """
    Returns an object with the ID of an account a user can make
    purchases on. If the user is not logged in, the object also
    contains an auth token required for subsequent calls to the
    contract API.
    """
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not flask.request.is_json:
        return flask.jsonify({"error": "JSON required"}), 400

    auth_token = None
    if user_info(flask.session):
        auth_token = flask.session["authentication_token"]

    advantage = UAContractsAPI(
        session,
        auth_token,
        api_url=api_url,
    )

    request = flask.request.json
    try:
        account = advantage.ensure_purchase_account(
            email=request.get("email"),
            account_name=request.get("account_name"),
            payment_method_id=request.get("payment_method_id"),
        )
    except UnauthorizedError as err:
        # This kind of errors are handled js side.
        return err.asdict(), 200
    except HTTPError as err:
        flask.current_app.extensions["sentry"].captureException()
        return err.response.content, 500

    # The guest authentication token is included in the response only when the
    # user is not logged in.
    token = account.get("token")
    if token:
        flask.session["guest_authentication_token"] = token
    return flask.jsonify(account), 200


def get_renewal(renewal_id):
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if user_info(flask.session):
        advantage = UAContractsAPI(
            session,
            flask.session["authentication_token"],
            api_url=api_url,
        )

        return advantage.get_renewal(renewal_id)
    else:
        return flask.jsonify({"error": "authentication required"}), 401


def accept_renewal(renewal_id):
    is_test_backend = flask.request.args.get("test_backend", False)

    api_url = flask.current_app.config["CONTRACTS_LIVE_API_URL"]

    if is_test_backend:
        api_url = flask.current_app.config["CONTRACTS_TEST_API_URL"]

    if not user_info(flask.session):
        return flask.jsonify({"error": "authentication required"}), 401

    advantage = UAContractsAPI(
        session,
        flask.session["authentication_token"],
        api_url=api_url,
    )

    return advantage.accept_renewal(renewal_id)


def _prepare_monthly_info(monthly_info, subscription, advantage):
    purchased_products = subscription["purchasedProductListings"]
    purchased_products_no = len(purchased_products)

    monthly_info["total_subscriptions"] += purchased_products_no
    monthly_info["has_monthly"] = True
    monthly_info["id"] = subscription["subscription"]["id"]
    monthly_info["is_auto_renewal_enabled"] = subscription.get(
        "autoRenew", False
    )

    last_purchase_id = subscription["lastPurchaseID"]

    try:
        last_purchase = advantage.get_purchase(last_purchase_id)
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException(
            extra={"last_purchase_id": last_purchase_id}
        )
        return (
            flask.jsonify({"error": "could not fetch last purchase"}),
            500,
        )

    monthly_info["last_payment_date"] = dateutil.parser.parse(
        last_purchase["createdAt"]
    ).strftime("%d %B %Y")
    monthly_info["current_subscription_no"] = purchased_products_no
    monthly_info["next_payment"]["date"] = dateutil.parser.parse(
        subscription["subscription"]["endOfCycle"]
    ).strftime("%d %B %Y")
    monthly_info["next_payment"]["ammount"] = _get_subscription_payment_total(
        subscription["purchasedProductListings"]
    )


def _get_subscription_payment_total(products_listings):
    total = 0

    for listing in products_listings:
        total += listing["productListing"]["price"]["value"] * listing["value"]

    return (
        f"{total / 100} "
        f'{products_listings[0]["productListing"]["price"]["currency"]}'
    )


def _make_renewal(advantage, contract_info):
    """Return the renewal as present in the given info, or None."""
    renewals = contract_info.get("renewals")
    if not renewals:
        return None

    sorted_renewals = sorted(
        (r for r in renewals if r["status"] != "closed"),
        key=lambda renewal: dateutil.parser.parse(renewal["start"]),
    )

    if len(sorted_renewals) == 0:
        return None

    renewal = sorted_renewals[0]

    # If the renewal is processing, we need to find out
    # whether payment failed and requires user action,
    # which is information only available in the fuller
    # renewal object get_renewal gives us.
    if renewal["status"] == "processing":
        renewal = advantage.get_renewal(renewal["id"])

    renewal["renewable"] = False

    if renewal["status"] == "done":
        try:
            renewal_modified_date = dateutil.parser.parse(
                renewal["lastModified"]
            )
            oneHourAgo = datetime.now(timezone.utc) - timedelta(hours=1)

            renewal["recently_renewed"] = oneHourAgo < renewal_modified_date
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
    start = dateutil.parser.parse(renewal["start"])
    end = dateutil.parser.parse(renewal["end"])
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
