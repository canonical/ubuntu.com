from typing import List

from webapp.shop.api.ua_contracts.api import UAContractsAPI
from webapp.shop.api.ua_contracts.helpers import to_dict
from webapp.shop.api.ua_contracts.models import UserSubscription
from webapp.shop.api.ua_contracts.builders import build_user_subscriptions


class AdvantageMapper:
    def __init__(self, ua_contrats_api: UAContractsAPI):
        self.ua_contracts_api = ua_contrats_api

    def get_user_subscriptions(self, email: str) -> List[UserSubscription]:
        self.ua_contracts_api.set_convert_response(True)

        advantage_marketplaces = ["canonical-ua", "blender"]

        listings = {}
        for marketplace in advantage_marketplaces:
            marketplace_listings = self.ua_contracts_api.get_product_listings(
                marketplace
            )
            listings.update(marketplace_listings)

        accounts = self.ua_contracts_api.get_accounts(email=email)

        user_summary = []
        for account in accounts:
            contracts = self.ua_contracts_api.get_account_contracts(
                account_id=account.id
            )
            subscriptions = []
            if account.role != "technical":
                for marketplace in advantage_marketplaces:
                    market_subscriptions = (
                        self.ua_contracts_api.get_account_subscriptions(
                            account_id=account.id,
                            marketplace=marketplace,
                        )
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

        return to_dict(user_subscriptions)
