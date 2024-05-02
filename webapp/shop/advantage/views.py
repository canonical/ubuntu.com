# Packages
import json
from typing import List

import flask
from webargs.fields import String

from webapp.login import user_info
from webapp.shop.api.ua_contracts.advantage_mapper import AdvantageMapper
from webapp.shop.api.ua_contracts.api import (
    AccessForbiddenError,
    UAContractsUserHasNoAccount,
    UnauthorizedError,
)
from webapp.shop.api.ua_contracts.helpers import (
    extract_last_purchase_ids,
    set_listings_trial_status,
    to_dict,
)

# Local
from webapp.shop.api.ua_contracts.primitives import Subscription
from webapp.shop.decorators import shop_decorator
from webapp.shop.flaskparser import use_kwargs
from webapp.shop.schemas import (
    account_purhcase,
    cancel_advantage_subscriptions,
    delete_account_user_role,
    post_account_user_role,
    post_auto_renewal_settings,
    post_offer_schema,
    put_account_user_role,
    put_contract_entitlements,
)


@shop_decorator(area="advantage", response="html")
def pro_page_view(advantage_mapper, **kwargs):
    """
    Renders the /pro page. If there is a logged in user it checks for active
    subscriptions so we can display a contact form, otherwise renders the page
    without any form. Anonymous requests don't see the form either.
    """
    show_beta_request = False
    user = user_info(flask.session)
    if user:
        try:
            subscriptions = advantage_mapper.get_user_subscriptions(
                email=None, marketplaces=["canonical-ua"]
            )
            for subscription in subscriptions:
                if (
                    subscription.marketplace == "canonical-ua"
                    and subscription.statuses["has_access_to_support"]
                ):
                    show_beta_request = True
                    break
        except Exception:
            flask.current_app.extensions["sentry"].captureException(
                extra={
                    "message": "Could not get user subscriptions on pro page"
                }
            )

    return flask.render_template(
        "pro/index.html",
        show_beta_request=show_beta_request,
    )


@shop_decorator(area="advantage", permission="user", response="html")
def advantage_view(advantage_mapper, is_in_maintenance, **kwargs):
    is_technical = False
    try:
        advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        pass
    except AccessForbiddenError:
        # only "technical" user are denied access to purchase account
        is_technical = True

    return flask.render_template(
        "advantage/index.html",
        is_technical=is_technical,
        is_in_maintenance=is_in_maintenance,
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs({"email": String()}, location="query")
def get_user_subscriptions(
    advantage_mapper: AdvantageMapper,
    is_in_maintenance: bool,
    is_community_member: bool,
    **kwargs,
):
    user_subscriptions = advantage_mapper.get_user_subscriptions(
        email=kwargs.get("email"),
        is_in_maintenance=is_in_maintenance,
        is_community_member=is_community_member,
    )

    return flask.jsonify(to_dict(user_subscriptions))


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs({"email": String()}, location="query")
def get_annotated_subscriptions(advantage_mapper: AdvantageMapper, **kwargs):
    email = kwargs.get("email")
    subscriptions = advantage_mapper.get_annotated_subscriptions(email)

    return flask.jsonify(to_dict(subscriptions))


@shop_decorator(area="advantage", permission="user", response="json")
def get_account_users(advantage_mapper, **kwargs):
    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        return flask.jsonify({"errors": "cannot find purchase account"}), 404

    account_users = advantage_mapper.get_account_users(account_id=account.id)

    return flask.jsonify(
        {
            "account_id": account.id,
            "name": account.name,
            "users": to_dict(account_users),
        }
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(post_account_user_role, location="json")
def post_account_user_role(ua_contracts_api, advantage_mapper, **kwargs):
    account_id = kwargs.get("account_id")

    account_users = advantage_mapper.get_account_users(account_id=account_id)

    user_exists = any(
        user for user in account_users if user.email == kwargs.get("email")
    )

    if user_exists:
        return flask.jsonify({"error": "email already exists"}), 400

    return ua_contracts_api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "nameHint": kwargs.get("name"),
            "role": kwargs.get("role"),
        },
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(put_account_user_role, location="json")
def put_account_user_role(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")

    return ua_contracts_api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "role": kwargs.get("role"),
        },
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(delete_account_user_role, location="json")
def delete_account_user_role(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")

    return ua_contracts_api.put_account_user_role(
        account_id=account_id,
        user_role_request={
            "email": kwargs.get("email"),
            "role": "none",
        },
    )


@shop_decorator(area="advantage", permission="user", response="json")
def get_contract_token(advantage_mapper, **kwargs):
    contract_id = kwargs.get("contract_id")

    contract_token = advantage_mapper.get_contract_token(contract_id)

    return flask.jsonify({"contract_token": contract_token})


@shop_decorator(area="advantage", response="html")
def advantage_shop_view(advantage_mapper, **kwargs):
    account = None
    if user_info(flask.session):
        try:
            account = advantage_mapper.get_purchase_account("canonical-ua")
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass
        except AccessForbiddenError:
            return flask.render_template(
                "account/forbidden.html", reason="is_technical"
            )

    all_subscriptions = []
    if account:
        all_subscriptions = advantage_mapper.get_account_subscriptions(
            account_id=account.id,
            marketplace="canonical-ua",
        )

    current_subscriptions = [
        subscription
        for subscription in all_subscriptions
        if subscription.status in ["active", "locked"]
    ]

    is_trialling = any(sub for sub in current_subscriptions if sub.in_trial)

    listings = advantage_mapper.get_product_listings("canonical-ua")

    previous_purchase_ids = extract_last_purchase_ids(current_subscriptions)
    user_listings = set_listings_trial_status(listings, all_subscriptions)

    return flask.render_template(
        "advantage/subscribe/index.html",
        account=account,
        previous_purchase_ids=previous_purchase_ids,
        product_listings=user_listings,
        is_trialling=is_trialling,
    )


@shop_decorator(area="advantage", permission="user", response="html")
def advantage_account_users_view(advantage_mapper, **kwargs):
    account = None

    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        return flask.render_template(
            "account/forbidden.html", reason="is_only_personal"
        )
    except AccessForbiddenError:
        return flask.render_template(
            "account/forbidden.html", reason="is_technical"
        )

    if account.role != "admin":
        return flask.render_template(
            "account/forbidden.html", reason="is_not_admin"
        )

    return flask.render_template("advantage/users/index.html")


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(account_purhcase, location="json")
def post_advantage_purchase(advantage_mapper: AdvantageMapper, **kwargs):
    account_id = kwargs.get("account_id")
    marketplace = kwargs.get("marketplace", "canonical-ua")
    action = kwargs.get("action", "purchase")

    subscribed_quantities = {}
    if action == "purchase":
        try:
            subscriptions = advantage_mapper.get_account_subscriptions(
                account_id=account_id,
                marketplace=marketplace,
                filters={"status": "active"},
            )

            for subscription in subscriptions:
                for item in subscription.items:
                    product_listing_id = item.product_listing_id
                    subscribed_quantities[product_listing_id] = item.value
        except UnauthorizedError:
            pass  # user is guest

    purchase_items = []
    for product in kwargs.get("products", []):
        product_listing_id = product["product_listing_id"]
        previous_quantity = subscribed_quantities.get(product_listing_id, 0)
        metric_value = product["quantity"] + previous_quantity

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
        "previousPurchaseID": kwargs.get("previous_purchase_id"),
    }

    if action == "trial":
        purchase_request["inTrial"] = True

    if action == "offer":
        purchase_request["offerID"] = kwargs.get("offer_id")

    if action == "renewal":
        purchase_request["renewalID"] = kwargs.get("renewal_id")

    # marketing parameters
    metadata_keys = [
        "ad_source",
        "google-click-id",
        "google-gbraid-id",
        "google-wbraid-id",
        "facebook-click-id",
        "salesforce-campaign-id",
    ]

    metadata = [
        {
            "key": metadata_key,
            "value": flask.session.get(metadata_key),
        }
        for metadata_key in metadata_keys
        if flask.session.get(metadata_key)
    ]

    if metadata:
        purchase_request["metadata"] = metadata

    response = advantage_mapper.purchase_from_marketplace(
        marketplace=marketplace,
        purchase_request=purchase_request,
        preview=kwargs.get("preview"),
    )

    return flask.jsonify(to_dict(response)), 200


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(cancel_advantage_subscriptions, location="json")
def cancel_advantage_subscriptions(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    previous_purchase_id = kwargs.get("previous_purchase_id")
    product_listing_id = kwargs.get("product_listing_id")
    marketplace = kwargs.get("marketplace")

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

    purchase = ua_contracts_api.purchase_from_marketplace(
        marketplace=marketplace, purchase_request=purchase_request
    )

    return flask.jsonify(purchase), 200


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(post_offer_schema, location="json")
def post_offer(ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")
    offer_id = kwargs.get("offer_id")
    marketplace = kwargs.get("marketplace", "canonical-ua")

    return ua_contracts_api.purchase_from_marketplace(
        marketplace=marketplace,
        purchase_request={
            "accountID": account_id,
            "offerID": offer_id,
        },
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(put_contract_entitlements, location="json")
def put_contract_entitlements(advantage_mapper, ua_contracts_api, **kwargs):
    contract_id = kwargs.get("contract_id")

    settings = kwargs.get("entitlements")

    contract = advantage_mapper.get_contract(contract_id)

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

    return ua_contracts_api.put_contract_entitlements(
        contract_id=contract_id, entitlements_request=entitlements_request
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs(post_auto_renewal_settings, location="json")
def post_auto_renewal_settings(ua_contracts_api, **kwargs):
    subscriptions = kwargs.get("subscriptions", {})
    for subscription in subscriptions:
        ua_contracts_api.post_subscription_auto_renewal(
            subscription_id=subscription.get("subscription_id"),
            should_auto_renew=subscription.get("should_auto_renew"),
        )
    return (
        flask.jsonify(
            {"message": "subscriptions renewal status were changed"}
        ),
        200,
    )


@shop_decorator(area="advantage", permission="user", response="json")
def cancel_trial(advantage_mapper, ua_contracts_api, **kwargs):
    account_id = kwargs.get("account_id")

    subscriptions: List[
        Subscription
    ] = advantage_mapper.get_account_subscriptions(
        account_id=account_id, marketplace="canonical-ua"
    )

    subscription_to_cancel = None
    for subscription in subscriptions:
        if subscription.started_with_trial and subscription.status == "active":
            subscription_to_cancel = subscription

            break

    if not subscription_to_cancel:
        return flask.jsonify({"errors": "no subscription in trial"}), 500

    return ua_contracts_api.cancel_subscription(
        subscription_id=subscription_to_cancel.id
    )


@shop_decorator(area="advantage", permission="user", response="json")
def get_renewal(ua_contracts_api, **kwargs):
    renewal_id = kwargs.get("renewal_id")

    return ua_contracts_api.get_renewal(renewal_id)


@shop_decorator(area="advantage", permission="user", response="json")
def accept_renewal(ua_contracts_api, **kwargs):
    renewal_id = kwargs.get("renewal_id")

    return ua_contracts_api.accept_renewal(renewal_id)


@shop_decorator(area="advantage", permission="user", response="json")
def get_channel_offers(advantage_mapper, **kwargs):
    try:
        account = advantage_mapper.get_purchase_account(
            "canonical-pro-channel"
        )
    except UAContractsUserHasNoAccount:
        return flask.jsonify({"error": "User has no purchase account"}), 400
    except AccessForbiddenError:
        return (
            flask.jsonify({"error": "User has no permission to purchase"}),
            403,
        )
    offers = [
        offer for offer in advantage_mapper.get_account_offers(account.id)
    ]
    return flask.jsonify(to_dict(offers))


@shop_decorator(area="advantage", permission="user", response="html")
def get_distributor_view(**kwargs):
    return flask.render_template(
        "/pro/distributor/index.html",
    )


@shop_decorator(area="advantage", permission="user", response="json")
def get_account_offers(advantage_mapper, ua_contracts_api, **kwargs):
    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        return flask.jsonify({"error": "User has no purchase account"}), 400
    except AccessForbiddenError:
        return (
            flask.jsonify({"error": "User has no permission to purchase"}),
            403,
        )

    offers = [
        offer
        for offer in advantage_mapper.get_account_offers(account.id)
        if offer.actionable
    ]

    return flask.jsonify(to_dict(offers))


@shop_decorator(
    area="advantage",
    permission="user",
    response="html",
)
def get_advantage_offers(**kwargs):
    return flask.render_template("advantage/offers/index.html")


@shop_decorator(area="advantage", response="html")
def blender_shop_view(advantage_mapper, **kwargs):
    account = None
    if user_info(flask.session):
        try:
            account = advantage_mapper.get_purchase_account("blender")
        except UAContractsUserHasNoAccount:
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass
        except AccessForbiddenError:
            return flask.render_template(
                "account/forbidden.html", reason="is_technical"
            )

    all_subscriptions = []
    if account:
        all_subscriptions = advantage_mapper.get_account_subscriptions(
            account_id=account.id,
            marketplace="blender",
        )

    current_subscriptions = [
        subscription
        for subscription in all_subscriptions
        if subscription.status in ["active", "locked"]
    ]

    listings = advantage_mapper.get_product_listings("blender")
    previous_purchase_ids = extract_last_purchase_ids(current_subscriptions)

    return flask.render_template(
        "advantage/subscribe/blender/index.html",
        account=account,
        previous_purchase_ids=previous_purchase_ids,
        product_listings=to_dict(listings),
    )


@shop_decorator(area="advantage", permission="user", response="html")
def activate_magic_attach(advantage_mapper, **kwargs):
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )
    try:
        activation_status = advantage_mapper.activate_magic_attach(
            contract_id=flask.request.form.get("contractID"),
            user_code=flask.request.form.get("userCode").upper(),
            client_ip=client_ip,
        )
        return flask.render_template(
            "/pro/attach/confirmation.html", status=activation_status
        )
    except Exception as e:
        return flask.render_template(
            "/pro/attach/confirmation.html",
            status=json.loads(e.response.content),
        )


@shop_decorator(area="advantage", permission="user", response="html")
@use_kwargs(
    {
        "email": String(),
        "subscription": String(),
        "magic-attach-code": String(),
    },
    location="query",
)
def magic_attach_view(advantage_mapper: AdvantageMapper, **kwargs):
    email = kwargs.get("email")
    selected_id = kwargs.get("subscription")
    magic_attach_code = kwargs.get("magic-attach-code", "")

    user_subscriptions = advantage_mapper.get_user_subscriptions(
        email=email, marketplaces=["canonical-ua"]
    )

    return flask.render_template(
        "pro/attach/index.html",
        subscriptions=user_subscriptions,
        selected_id=selected_id,
        magic_attach_code=magic_attach_code,
    )


@shop_decorator(area="advantage", permission="user", response="html")
def get_activate_view(advantage_mapper: AdvantageMapper, **kwargs):
    account = None
    try:
        account = advantage_mapper.get_purchase_account("canonical-ua")
    except UAContractsUserHasNoAccount:
        pass
    except AccessForbiddenError:
        return flask.render_template(
            "account/forbidden.html", reason="is_technical"
        )

    return flask.render_template(
        "pro/activate.html",
        needs_paid_account_created=False if account else True,
    )


@shop_decorator(area="advantage", permission="user", response="json")
@use_kwargs({"key": String(required=True)}, location="json")
def pro_activate_activation_key(ua_contracts_api, advantage_mapper, **kwargs):
    account = advantage_mapper.get_purchase_account("canonical-ua")

    return ua_contracts_api.activate_activation_key(
        {
            "accountID": account.id,
            "activationKey": kwargs.get("key"),
        }
    )
