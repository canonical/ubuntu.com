from typing import List, Dict, Optional

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.models import (
    Purchase,
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
from webapp.shop.api.ua_contracts.builders import build_user_subscriptions
from webapp.shop.api.ua_contracts.parsers import (
    parse_contracts,
    parse_subscriptions,
    parse_product_listing,
    parse_product_listings,
    parse_accounts,
    parse_account,
    parse_users,
    parse_contract,
    parse_offers,
)
from webapp.shop.api.ua_contracts.schema import PurchaseSchema


class AdvantageMapper:
    def __init__(self, ua_contrats_api: UAContractsAPI):
        self.ua_contracts_api = ua_contrats_api

    def get_accounts(self, email: str = None) -> List[Account]:
        response = self.ua_contracts_api.get_accounts(email)
        accounts = response.get("accounts", [])

        return parse_accounts(accounts)

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

    def get_product_listings(self, marketplace: str) -> Dict[str, Listing]:
        response = self.ua_contracts_api.get_product_listings(marketplace)

        return parse_product_listings(
            response.get("productListings", []),
            response.get("products", []),
        )

    def get_purchase_account(self, marketplace: str = "") -> Account:
        response = self.ua_contracts_api.get_purchase_account(marketplace)

        return parse_account(response)

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

    def get_user_subscriptions(self, email: str) -> List[UserSubscription]:
        listings = {}
        for marketplace in ["canonical-ua", "blender"]:
            marketplace_listings = self.get_product_listings(marketplace)
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
