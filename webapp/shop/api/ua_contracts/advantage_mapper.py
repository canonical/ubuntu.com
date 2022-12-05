from typing import List, Dict, Optional, Union

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.models import (
    Purchase,
    Invoice,
    UserSubscription,
    Offer,
    Listing,
)
from webapp.shop.api.ua_contracts.primitives import (
    Account,
    Contract,
    Subscription,
    User,
)
from webapp.shop.api.ua_contracts.api import (
    UAContractsUserHasNoAccount,
    UnauthorizedError,
)
from webapp.shop.api.ua_contracts.builders import build_user_subscriptions
from webapp.shop.api.ua_contracts.parsers import (
    parse_contracts,
    parse_subscriptions,
    parse_product_listing,
    parse_product_listings,
    parse_users,
    parse_contract,
    parse_offers,
)
from webapp.shop.api.ua_contracts.schema import (
    PurchaseSchema,
    AccountSchema,
    InvoiceSchema,
    EnsurePurchaseAccountSchema,
)


class AdvantageMapper:
    def __init__(self, ua_contrats_api: UAContractsAPI):
        self.ua_contracts_api = ua_contrats_api

    def get_accounts(self, email: str = None) -> List[Account]:
        response = self.ua_contracts_api.get_accounts(email)

        return AccountSchema(many=True).load(response.get("accounts", []))

    def get_account_contracts(
        self, account_id: str, include_active_machines: bool = False
    ) -> List[Contract]:
        response = self.ua_contracts_api.get_account_contracts(
            account_id, include_active_machines
        )
        contracts = response.get("contracts", [])

        return parse_contracts(contracts)

    def get_contract(self, contract_id: str) -> Contract:
        contract = self.ua_contracts_api.get_contract(contract_id)

        return parse_contract(contract)

    def get_account_offers(self, account_id: str) -> List[Offer]:
        offers = self.ua_contracts_api.get_account_offers(account_id)

        return parse_offers(offers)

    def get_account_users(self, account_id: str) -> List[User]:
        response = self.ua_contracts_api.get_account_users(account_id)
        users = [user.get("userInfo") for user in response.get("users")]

        return parse_users(users)

    def get_contract_token(self, contract_id: str) -> Optional[str]:
        response = self.ua_contracts_api.get_contract_token(contract_id)

        return response.get("contractToken")

    def get_product_listings(
        self, marketplace: str, filters=None
    ) -> Dict[str, Listing]:
        url_filters = ""
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )
            url_filters = f"?{filters}"

        response = self.ua_contracts_api.get_product_listings(
            marketplace, url_filters
        )

        return parse_product_listings(
            response.get("productListings", []),
            response.get("products", []),
        )

    def get_purchase_account(self, marketplace: str = "") -> Account:
        response = self.ua_contracts_api.get_purchase_account(marketplace)

        return AccountSchema().load(response)

    def get_account_subscriptions(
        self, account_id: str, marketplace: str, filters=None
    ) -> List[Subscription]:
        url_filters = ""
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )
            url_filters = f"?{filters}"

        response = self.ua_contracts_api.get_account_subscriptions(
            account_id, marketplace, url_filters
        )

        subscriptions = response.get("subscriptions", [])

        return parse_subscriptions(raw_subscriptions=subscriptions)

    def get_account_purchases(
        self, account_id: str, filters=None
    ) -> List[Purchase]:
        url_filters = ""
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )
            url_filters = f"?{filters}"

        response = self.ua_contracts_api.get_account_purchases(
            account_id, url_filters
        )

        response = response.get("purchases", [])
        if not response:
            return []

        listings = {
            listing["id"]: parse_product_listing(listing)
            for listing in response.get("productListings", [])
        }

        purchases = PurchaseSchema(many=True).load(
            response.get("purchases", [])
        )

        for purchase in purchases:
            for item in purchase.items:
                item.listing = listings.get(item.listing_id)

        purchases.sort(key=lambda purchase: purchase.created_at, reverse=True)

        return purchases

    def get_purchase(self, purchase_id) -> Purchase:
        response = self.ua_contracts_api.get_purchase(purchase_id)

        return PurchaseSchema().load(response)

    def purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict, preview=True
    ) -> Purchase:
        if preview:
            response = self.ua_contracts_api.preview_purchase_from_marketplace(
                marketplace, purchase_request
            )
        else:
            response = self.ua_contracts_api.purchase_from_marketplace(
                marketplace, purchase_request
            )

        return PurchaseSchema().load(response)

    def ensure_purchase_account(
        self,
        marketplace: str = "",
        email: str = "",
        account_name: str = "",
        captcha_value: str = "",
    ) -> dict:
        response = self.ua_contracts_api.ensure_purchase_account(
            marketplace=marketplace,
            email=email,
            account_name=account_name,
            captcha_value=captcha_value,
        )

        return EnsurePurchaseAccountSchema().load(response)

    def get_user_subscriptions(self, email: str) -> List[UserSubscription]:
        listings = {}
        for marketplace in ["canonical-ua", "blender"]:
            marketplace_listings = self.get_product_listings(
                marketplace,
                filters={"include-hidden": "true"},
            )
            listings.update(marketplace_listings)

        accounts = self.get_accounts(email=email)

        user_summary = []
        for account in accounts:
            contracts = self.get_account_contracts(
                account_id=account.id,
                include_active_machines=True,
            )
            subscriptions = []
            if account.role != "technical":
                for marketplace in ["canonical-ua", "blender"]:
                    market_subscriptions = self.get_account_subscriptions(
                        account_id=account.id,
                        marketplace=marketplace,
                    )
                    subscriptions.extend(market_subscriptions)

            user_summary.append(
                {
                    "account": account,
                    "contracts": contracts,
                    "subscriptions": subscriptions,
                }
            )

        return build_user_subscriptions(user_summary, listings)

    def get_or_create_user_account(
        self, marketplace, customer_info, captcha_value
    ) -> Account:
        try:
            return self.get_purchase_account(marketplace)
        except (UnauthorizedError, UAContractsUserHasNoAccount):
            email = customer_info.get("email", "") if customer_info else ""
            name = customer_info.get("name", "") if customer_info else ""

            account = self.ensure_purchase_account(
                marketplace=marketplace,
                email=email,
                account_name=name,
                captcha_value=captcha_value,
            )

            if account.token:
                self.ua_contracts_api.set_authentication_token(account.token)
                self.ua_contracts_api.set_token_type("Bearer")

            return account

    def post_user_purchase(
        self,
        account_id: str,
        marketplace: str,
        customer_info: dict,
        action: str,
        products: dict,
        offer_id: str,
        renewal_id: str,
        previous_purchase_id: str,
        session: dict,
        preview: bool = False,
    ) -> Union[Purchase, Invoice]:
        if customer_info is not None:
            tax_id = customer_info.get("tax_id")
            if tax_id and tax_id["value"] == "":
                tax_id["delete"] = True

            self.ua_contracts_api.put_customer_info(
                account_id,
                customer_info.get("payment_method_id"),
                customer_info.get("address"),
                customer_info.get("name"),
                tax_id,
            )

        subscribed_quantities = {}
        if action == "purchase":
            try:
                subscriptions = self.get_account_subscriptions(
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

        if action == "trial":
            purchase_request["inTrial"] = True

        if action == "offer":
            purchase_request["offerID"] = offer_id

        if action == "renewal":
            purchase_request["renewalID"] = renewal_id

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
                "value": session.get(metadata_key),
            }
            for metadata_key in metadata_keys
            if session.get(metadata_key)
        ]

        if metadata:
            purchase_request["metadata"] = metadata

        if preview:
            invoice = self.ua_contracts_api.preview_purchase_from_marketplace(
                marketplace=marketplace, purchase_request=purchase_request
            )

            invoice["account_id"] = account_id

            return InvoiceSchema().load(invoice)

        purchase = self.ua_contracts_api.purchase_from_marketplace(
            marketplace=marketplace, purchase_request=purchase_request
        )

        return PurchaseSchema().load(purchase)
