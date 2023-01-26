from typing import Optional

from requests.exceptions import HTTPError


class UAContractsAPI:
    def __init__(
        self,
        session,
        authentication_token,
        token_type="Macaroon",
        api_url="https://contracts.canonical.com",
        is_for_view=False,
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

    def set_authentication_token(self, token):
        self.authentication_token = token

    def set_token_type(self, token_type):
        self.token_type = token_type

    def set_is_for_view(self, is_for_view):
        self.is_for_view = is_for_view

    def _request(
        self,
        method,
        path,
        json=None,
        params=None,
        error_rules=None,
        headers={},
    ):
        headers[
            "Authorization"
        ] = f"{self.token_type} {self.authentication_token}"

        response = self.session.request(
            method=method,
            url=f"{self.api_url}/{path}",
            json=json,
            headers=headers,
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

    def get_accounts(self, email: str = None) -> dict:
        return self._request(
            method="get",
            path="v1/accounts",
            params={"email": email} if email else None,
            error_rules=["default"],
        ).json()

    def get_account_contracts(
        self,
        account_id: str,
        product_tags: str = "ua,classic,pro,blender",
        include_active_machines: bool = False,
    ) -> dict:
        include_active_machines = str(include_active_machines).lower()

        return self._request(
            method="get",
            path=(
                f"v1/accounts/{account_id}/contracts"
                f"?productTags={product_tags}"
                f"&include-active-machines={include_active_machines}"
            ),
            error_rules=["default"],
        ).json()

    def get_contract(self, contract_id: str) -> dict:
        return self._request(
            method="get",
            path=f"v1/contracts/{contract_id}",
            json={},
            error_rules=["default"],
        ).json()

    def get_account_offers(self, account_id: str) -> dict:
        return self._request(
            method="get",
            path=f"v1/accounts/{account_id}/offers",
            error_rules=["default", "no-found", "user-role"],
        ).json()

    def get_account_users(self, account_id: str) -> dict:
        return self._request(
            method="get",
            path=f"v1/accounts/{account_id}/users",
            json={},
            error_rules=["default"],
        ).json()

    def put_account_user_role(
        self,
        account_id: str,
        user_role_request: dict,
    ) -> dict:
        self._request(
            method="put",
            path=f"v1/accounts/{account_id}/user-role",
            json=user_role_request,
            error_rules=["default"],
        )

        return {}

    def get_contract_token(self, contract_id: str) -> Optional[str]:
        return self._request(
            method="post",
            path=f"v1/contracts/{contract_id}/token",
            json={},
            error_rules=["default"],
        ).json()

    def get_customer_info(self, account_id):
        return self._request(
            method="get",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            error_rules=["default", "no-found"],
        ).json()

    def put_customer_info(
        self, account_id, payment_method_id, address, name, tax_id
    ) -> dict:
        return self._request(
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
        ).json()

    def put_anonymous_customer_info(
        self, account_id, name, address, tax_id
    ) -> dict:
        return self._request(
            method="put",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            json={"address": address, "name": name, "taxID": tax_id},
            error_rules=["default"],
        ).json()

    def put_payment_method(self, account_id, payment_method_id) -> dict:
        return self._request(
            method="put",
            path=f"v1/accounts/{account_id}/customer-info/stripe",
            json={
                "defaultPaymentMethod": {"Id": payment_method_id},
            },
            error_rules=["default"],
        ).json()

    def post_stripe_invoice_id(self, tx_type, tx_id, invoice_id) -> dict:
        self._request(
            method="post",
            path=f"v1/{tx_type}/{tx_id}/payment/stripe/{invoice_id}",
            error_rules=["default"],
        )

        return {}

    def get_renewal(self, renewal_id) -> dict:
        return self._request(
            method="get",
            path=f"v1/renewals/{renewal_id}",
            error_rules=["default"],
        ).json()

    def accept_renewal(self, renewal_id) -> dict:
        self._request(
            method="post",
            path=f"v1/renewals/{renewal_id}/acceptance",
            error_rules=["default"],
        )

        return {}

    def get_product_listings(
        self, marketplace: str, filters: str = ""
    ) -> dict:
        return self._request(
            method="get",
            path=f"v1/marketplace/{marketplace}/product-listings{filters}",
            error_rules=["default"],
        ).json()

    def get_account_subscriptions(
        self, account_id: str, marketplace: str, filters: str = ""
    ) -> dict:
        return self._request(
            method="get",
            path=(
                f"v1/accounts/{account_id}"
                f"/marketplace/{marketplace}"
                f"/subscriptions{filters}"
            ),
            error_rules=["default", "auth"],
        ).json()

    def get_account_purchases(
        self, account_id: str, filters: str = ""
    ) -> dict:
        return self._request(
            method="get",
            path=f"v1/accounts/{account_id}/purchases{filters}",
            error_rules=["default"],
        ).json()

    def get_purchase(self, purchase_id: str) -> dict:
        return self._request(
            method="get",
            path=f"v1/purchase/{purchase_id}",
            error_rules=["default"],
        ).json()

    def ensure_purchase_account(
        self,
        marketplace: str = "",
        email: str = "",
        account_name: str = "",
        captcha_value: str = "",
    ) -> dict:
        return self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/account",
            json={
                "email": email,
                "accountName": account_name,
                "recaptchaToken": captcha_value,
            },
            error_rules=["default"],
        ).json()

    def get_purchase_account(self, marketplace: str = "") -> dict:
        return self._request(
            method="get",
            path=f"v1/marketplace/{marketplace}/account",
            error_rules=["default", "auth", "no-found", "user-role"],
        ).json()

    def purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ) -> dict:
        return self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase",
            json=purchase_request,
            error_rules=["default"],
        ).json()

    def preview_purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ) -> dict:
        return self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase/preview",
            json=purchase_request,
            error_rules=["default"],
        ).json()

    def cancel_subscription(self, subscription_id: str) -> dict:
        self._request(
            method="delete",
            path=f"v1/subscriptions/{subscription_id}",
            error_rules=["default"],
        )

        return {}

    def post_subscription_auto_renewal(
        self, subscription_id: str, should_auto_renew: bool
    ) -> dict:
        self._request(
            method="post",
            path=f"v1/subscription/{subscription_id}/auto-renewal",
            json={"shouldAutoRenew": should_auto_renew},
            error_rules=["default"],
        )

        return {}

    def put_contract_entitlements(
        self,
        contract_id: str,
        entitlements_request: dict,
    ) -> dict:
        self._request(
            method="put",
            path=f"v1/contracts/{contract_id}/defaultEnablement",
            json=entitlements_request,
            error_rules=["default"],
        )

        return {}

    def post_purchase_calculate(
        self,
        marketplace: str,
        request_body: dict,
    ) -> dict:
        return self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase/calculate",
            json=request_body,
            error_rules=["default"],
        ).json()

    def post_magic_attach(self, request_body: dict, headers: dict) -> dict:
        self._request(
            method="post",
            path="v1/magic-attach/activate",
            json=request_body,
            error_rules=["default"],
            headers=headers,
        )
        return {"success": "true"}

    def handle_error(self, error, error_rules=None):
        if not error_rules:
            return

        status_code = error.response.status_code

        if "user-role" in error_rules and status_code == 403:
            raise AccessForbiddenError(error)

        if "auth" in error_rules and status_code == 401:
            if self.is_for_view:
                raise UnauthorizedErrorView(error)
            raise UnauthorizedError(error)

        if "no-found" in error_rules and status_code == 404:
            raise UAContractsUserHasNoAccount(error)

        if "default" in error_rules:
            if self.is_for_view:
                raise UAContractsAPIErrorView(error)
            raise UAContractsAPIError(error)


class AccessForbiddenError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class UnauthorizedError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class UnauthorizedErrorView(HTTPError):
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
