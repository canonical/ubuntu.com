from typing import Dict, List, Optional, Union

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.builders import build_user_subscriptions
from webapp.shop.api.ua_contracts.models import (
    Invoice,
    Listing,
    Offer,
    Purchase,
    UserSubscription,
)
from webapp.shop.api.ua_contracts.parsers import (
    parse_contract,
    parse_contracts,
    parse_offers,
    parse_product_listing,
    parse_product_listings,
    parse_subscriptions,
    parse_users,
)
from webapp.shop.api.ua_contracts.primitives import (
    Account,
    AnnotatedContractItem,
    Contract,
    Subscription,
    User,
)
from webapp.shop.api.ua_contracts.schema import (
    AccountSchema,
    AnnotatedContractItemsSchema,
    EnsurePurchaseAccountSchema,
    InvoiceSchema,
    PurchaseSchema,
)


class AdvantageMapper:
    def __init__(self, ua_contrats_api: UAContractsAPI):
        self.ua_contracts_api = ua_contrats_api

    def get_accounts(self, email: str = None) -> List[Account]:
        response = self.ua_contracts_api.get_accounts(email)

        return AccountSchema(many=True).load(response.get("accounts", []))

    def get_account_contracts(
        self,
        account_id: str,
        product_tags: str = "ua,classic,pro,blender",
        include_active_machines: bool = False,
    ) -> List[Contract]:
        response = self.ua_contracts_api.get_account_contracts(
            account_id, product_tags, include_active_machines
        )
        contracts = response.get("contracts", [])

        return parse_contracts(contracts)

    def get_all_account_contracts(self, account_id: str) -> List[Contract]:
        response = self.ua_contracts_api.get_all_account_contracts(account_id)
        contracts = response.get("contracts", [])

        return parse_contracts(contracts)

    def get_activation_key_contracts(self, account_id: str) -> List[Contract]:
        response = self.ua_contracts_api.get_activation_key_contracts(
            account_id
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
    ) -> Union[Invoice, Purchase]:
        if preview:
            invoice = self.ua_contracts_api.preview_purchase_from_marketplace(
                marketplace=marketplace, purchase_request=purchase_request
            )

            return InvoiceSchema().load(invoice)

        purchase = self.ua_contracts_api.purchase_from_marketplace(
            marketplace=marketplace, purchase_request=purchase_request
        )

        return PurchaseSchema().load(purchase)

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

    def get_user_subscriptions(
        self,
        email: str,
        marketplaces: List = ["canonical-ua", "blender"],
        is_in_maintenance: bool = False,
        is_community_member: bool = False,
    ) -> List[UserSubscription]:
        listings = {}
        product_tags = []
        for marketplace in marketplaces:
            marketplace_listings = self.get_product_listings(
                marketplace,
                filters={"include-hidden": "true"},
            )
            listings.update(marketplace_listings)
            if marketplace == "canonical-ua":
                product_tags.extend(["ua", "classic", "pro"])
            elif marketplace == "blender":
                product_tags.append("blender")
        accounts = self.get_accounts(email=email)

        user_summary = []
        for account in accounts:
            contracts = self.get_account_contracts(
                account_id=account.id,
                product_tags=",".join(product_tags),
                include_active_machines=True,
            )
            subscriptions = []
            if account.role != "technical":
                for marketplace in marketplaces:
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

        user_subscriptions = build_user_subscriptions(user_summary, listings)

        # overrides
        for user_subscription in user_subscriptions:
            is_stripe_sub = user_subscription.type in ["yearly", "monthly"]
            if is_stripe_sub and is_in_maintenance:
                user_subscription.statuses["is_upsizeable"] = False
                user_subscription.statuses["is_downsizeable"] = False
                user_subscription.statuses["is_cancellable"] = False
            if is_community_member and user_subscription.type == "free":
                user_subscription.number_of_machines = 50

        return user_subscriptions

    def get_annotated_subscriptions(
        self, email: str
    ) -> List[AnnotatedContractItem]:
        resp = self.ua_contracts_api.get_annotated_contract_items(email=email)
        items = AnnotatedContractItemsSchema(many=True).load(resp)

        return items

    def activate_magic_attach(
        self, user_code: str, contract_id: str, client_ip: int
    ):
        headers = {} if client_ip else {"X-Forwarded-For": client_ip}
        return self.ua_contracts_api.post_magic_attach(
            request_body={"userCode": user_code, "contractID": contract_id},
            headers=headers,
        )
