from typing import Optional

from requests.exceptions import HTTPError

from webapp.advantage.ua_contracts.parsers import (
    parse_contracts,
    parse_subscriptions,
    parse_product_listings,
    parse_accounts,
    parse_account,
)


class UAContractsAPI:
    def __init__(
        self,
        session,
        authentication_token,
        token_type="Macaroon",
        api_url="https://contracts.canonical.com",
        is_for_view=False,
        convert_response=False,
    ):
        """
        Expects a Talisker session in most circumstances,
        from `talisker.requests.get_session()`
        """

        self.session = session
        self.authentication_token = authentication_token
        self.token_type = token_type
        self.api_url = api_url.rstrip("/")
        self.is_for_view = is_for_view
        self.convert_response = convert_response

    def set_is_for_view(self, is_for_view):
        self.is_for_view = is_for_view

    def set_convert_response(self, convert_response):
        self.convert_response = convert_response

    def _request(self, method, path, json=None, params=None, error_rules=None):
        authorization = f"{self.token_type} {self.authentication_token}"

        response = self.session.request(
            method=method,
            url=f"{self.api_url}/{path}",
            json=json,
            headers={"Authorization": authorization},
            params=params,
        )

        if error_rules:
            try:
                response.raise_for_status()
            except HTTPError as error:
                self.handle_error(error, error_rules)
        else:
            response.raise_for_status()

        return response

    def get_accounts(self, email: str = None):
        response = self._request(
            method="get",
            path="v1/accounts",
            params={"email": email} if email else None,
            error_rules=["default"],
        )

        accounts = response.json().get("accounts", [])

        if self.convert_response:
            return parse_accounts(accounts)

        return accounts

    def get_account_contracts(self, account_id: str):
        response = self._request(
            method="get",
            path=(
                f"v1/accounts/{account_id}/contracts"
                f"?productTags=ua&productTags=classic&productTags=pro"
            ),
            error_rules=["default"],
        )

        contracts = response.json().get("contracts", [])

        if self.convert_response:
            return parse_contracts(contracts)

        return contracts

    def get_contract_token(self, contract_id: str) -> Optional[str]:
        response = self._request(
            method="post",
            path=f"v1/contracts/{contract_id}/token",
            json={},
            error_rules=["default"],
        )

        return response.json().get("contractToken")

    def get_customer_info(self, account_id):
        response = self._request(
            method="get",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            error_rules=["default", "no-found"],
        )

        return response.json()

    def put_customer_info(
        self, account_id, payment_method_id, address, name, tax_id
    ):
        response = self._request(
            method="put",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            json={
                "defaultPaymentMethod": {"Id": payment_method_id},
                "paymentMethodID": payment_method_id,
                "address": address,
                "name": name,
                "taxID": tax_id,
            },
            error_rules=["default"],
        )

        return response.json()

    def put_anonymous_customer_info(self, account_id, name, address, tax_id):
        response = self._request(
            method="put",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            json={"address": address, "name": name, "taxID": tax_id},
            error_rules=["default"],
        )

        return response.json()

    def put_payment_method(self, account_id, payment_method_id):
        response = self._request(
            method="put",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            json={
                "defaultPaymentMethod": {"Id": payment_method_id},
            },
            error_rules=["default"],
        )

        return response.json()

    def post_stripe_invoice_id(self, tx_type, tx_id, invoice_id):
        self._request(
            method="post",
            path=f"v1/{tx_type}/{tx_id}/payment/stripe/{invoice_id}",
            error_rules=["default"],
        )

        return {}

    def get_renewal(self, renewal_id):
        response = self._request(
            method="get",
            path=f"v1/renewals/{renewal_id}",
            error_rules=["default"],
        )

        return response.json()

    def accept_renewal(self, renewal_id):
        self._request(
            method="post",
            path=f"v1/renewals/{renewal_id}/acceptance",
            error_rules=["default"],
        )

        return {}

    def get_product_listings(self, marketplace: str):
        response = self._request(
            method="get",
            path=f"v1/marketplace/{marketplace}/product-listings",
            error_rules=["default"],
        )

        if self.convert_response:
            return parse_product_listings(
                response.json().get("productListings", []),
                response.json().get("products", []),
            )

        return response.json()

    def get_account_subscriptions(
        self, account_id: str, marketplace: str, filters=None
    ):
        url_filters = ""
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )
            url_filters = f"?{filters}"

        response = self._request(
            method="get",
            path=(
                f"v1/accounts/{account_id}"
                f"/marketplace/{marketplace}"
                f"/subscriptions{url_filters}"
            ),
            error_rules=["default"],
        )

        subscriptions = response.json().get("subscriptions", [])

        if self.convert_response:
            return parse_subscriptions(raw_subscriptions=subscriptions)

        return subscriptions

    def get_account_purchases(self, account_id: str, filters=None) -> dict:
        url_filters = ""
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )
            url_filters = f"?{filters}"

        response = self._request(
            method="get",
            path=f"v1/accounts/{account_id}/purchases{url_filters}",
            error_rules=["default"],
        )

        return response.json().get("purchases", [])

    def get_purchase(self, purchase_id: str):
        response = self._request(
            method="get",
            path=f"v1/purchase/{purchase_id}",
            error_rules=["default"],
        )

        return response.json()

    def ensure_purchase_account(
        self,
        email: str = "",
        account_name: str = "",
        payment_method_id: str = "",
        country: str = "",
    ) -> dict:
        response = self._request(
            method="post",
            path="v1/purchase-account",
            json={
                "email": email,
                "name": account_name,
                "defaultPaymentMethod": {"Id": payment_method_id},
                "address": {"country": country},
            },
            error_rules=["default", "ensure-purchase-account"],
        )

        return response.json()

    def get_purchase_account(self):
        response = self._request(
            method="get",
            path="v1/purchase-account",
            error_rules=["default", "no-found"],
        )

        if self.convert_response:
            return parse_account(response.json())

        return response.json()

    def purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ):
        response = self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase",
            json=purchase_request,
            error_rules=["default", "cancel-subscription"],
        )

        return response.json()

    def preview_purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ):
        response = self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase/preview",
            json=purchase_request,
            error_rules=["default", "cancel-subscription"],
        )

        return response.json()

    def cancel_subscription(self, subscription_id: str):
        self._request(
            method="delete",
            path=f"v1/subscriptions/{subscription_id}",
            error_rules=["default"],
        )

        return {}

    def get_subscription_auto_renewal(self, subscription_id: str):
        response = self._request(
            method="get",
            path=f"v1/subscription/{subscription_id}/auto-renewal",
            error_rules=["default"],
        )

        return response.json()

    def post_subscription_auto_renewal(
        self, subscription_id: str, should_auto_renew: bool
    ):
        self._request(
            method="post",
            path=f"v1/subscription/{subscription_id}/auto-renewal",
            json={"shouldAutoRenew": should_auto_renew},
            error_rules=["default"],
        )

        return {}

    def handle_error(self, error, error_rules=None):
        if not error_rules:
            return

        status_code = error.response.status_code
        message = error.response.json().get("message")

        if "cancel-subscription" in error_rules and status_code == 400:
            if "cannot remove all subscription items" in message:
                raise CannotCancelLastContractError(error)

        if "ensure-purchase-account" in error_rules and status_code == 401:
            raise UnauthorizedError(error)

        if "no-found" in error_rules and status_code == 404:
            raise UAContractsUserHasNoAccount(error)

        if "default" in error_rules:
            if self.is_for_view:
                raise UAContractsAPIErrorView(error)
            raise UAContractsAPIError(error)


class UnauthorizedError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class CannotCancelLastContractError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class UAContractsAPIError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class UAContractsAPIErrorView(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class UAContractsUserHasNoAccount(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)
