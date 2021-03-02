from requests.exceptions import HTTPError


class AdvantageContracts:
    def __init__(
        self,
        session,
        authentication_token,
        token_type="Macaroon",
        api_url="https://contracts.canonical.com",
    ):
        """
        Expects a Talisker session in most circumstances,
        from `talisker.requests.get_session()`
        """

        self.session = session
        self.authentication_token = authentication_token
        self.token_type = token_type
        self.api_url = api_url.rstrip("/")

    def _request(self, method, path, json=None):
        headers = {}

        headers["Authorization"] = (
            f"{self.token_type} " f"{self.authentication_token}"
        )

        response = self.session.request(
            method=method,
            url=f"{self.api_url}/{path}",
            json=json,
            headers=headers,
        )
        response.raise_for_status()

        return response

    def get_accounts(self):
        response = self._request(method="get", path="v1/accounts")

        return response.json().get("accounts", [])

    def get_account_contracts(self, account):
        account_id = account["id"]
        response = self._request(
            method="get", path=f"v1/accounts/{account_id}/contracts"
        )

        return response.json().get("contracts", [])

    def get_contract_token(self, contract):
        contract_id = contract["contractInfo"]["id"]
        response = self._request(
            method="post", path=f"v1/contracts/{contract_id}/token", json={}
        )

        return response.json().get("contractToken")

    def get_contract_machines(self, contract):
        contract_id = contract["contractInfo"]["id"]

        response = self._request(
            method="get", path=f"v1/contracts/{contract_id}/context/machines"
        )

        return response.json()

    def get_customer_info(self, account_id):
        response = self._request(
            method="get", path=f"v1/accounts/{account_id}/customer-info/stripe"
        )

        return response.json()

    def put_customer_info(
        self, account_id, payment_method_id, address, name, tax_id
    ):
        try:
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
            )
        except HTTPError as http_error:
            return http_error.response.json()

        return response.json()

    def put_anonymous_customer_info(self, account_id, address, tax_id):
        try:
            response = self._request(
                method="put",
                path=f"v1/accounts/{account_id}/customer-info/stripe",
                json={"address": address, "taxID": tax_id},
            )
        except HTTPError as http_error:
            return http_error.response.json()

        return response.json()

    def put_payment_method(self, account_id, payment_method_id):
        try:
            response = self._request(
                method="put",
                path=f"v1/accounts/{account_id}/customer-info/stripe",
                json={
                    "defaultPaymentMethod": {"Id": payment_method_id},
                },
            )
        except HTTPError as http_error:
            return http_error.response.json()

        return response.json()

    def post_stripe_invoice_id(self, tx_type, tx_id, invoice_id):
        try:
            response = self._request(
                method="post",
                path=f"v1/{tx_type}/{tx_id}/payment/stripe/{invoice_id}",
            )
        except HTTPError as http_error:
            return http_error.response.json()

        return response.json()

    def get_renewal(self, renewal_id):
        response = self._request(
            method="get", path=f"v1/renewals/{renewal_id}"
        )

        return response.json()

    def accept_renewal(self, renewal_id):
        try:
            response = self._request(
                method="post", path=f"v1/renewals/{renewal_id}/acceptance"
            )
        except HTTPError as http_error:
            if http_error.response.status_code == 500:
                return response.json()
            else:
                raise http_error

        return {}

    def get_marketplace_product_listings(self, marketplace: str) -> dict:
        response = self._request(
            method="get", path=f"v1/marketplace/{marketplace}/product-listings"
        )

        return response.json()

    def get_account_subscriptions_for_marketplace(
        self, account_id: str, marketplace: str, filters=None
    ) -> dict:
        if filters:
            filters = "&".join(
                "{}={}".format(key, value) for key, value in filters.items()
            )

        response = self._request(
            method="get",
            path=(
                f"v1/accounts/{account_id}"
                f"/marketplace/{marketplace}"
                f"/subscriptions?{filters}"
            ),
        )
        return response.json()

    def get_account_purchases(self, account_id: str) -> dict:
        response = self._request(
            method="get", path=f"v1/accounts/{account_id}/purchases"
        )

        return response.json()

    def get_purchase(self, purchase_id: str) -> dict:
        response = self._request(
            method="get", path=f"v1/purchase/{purchase_id}"
        )

        return response.json()

    def ensure_purchase_account(
        self,
        email: str = "",
        account_name: str = "",
        payment_method_id: str = "",
    ) -> dict:
        try:
            response = self._request(
                method="post",
                path="v1/purchase-account",
                json={
                    "email": email,
                    "name": account_name,
                    "defaultPaymentMethod": {"Id": payment_method_id},
                },
            )
        except HTTPError as err:
            # Raise an UnauthorizedError in case of unauthorized response.
            if email and payment_method_id and err.response.status_code == 401:
                resp = err.response.json()
                raise UnauthorizedError(resp["code"], resp["message"])
            # Re-raise the same error otherwise.
            raise
        return response.json()

    def get_purchase_account(self) -> dict:
        response = self._request(method="get", path="v1/purchase-account")
        return response.json()

    def purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ) -> dict:
        try:
            response = self._request(
                method="post",
                path=f"v1/marketplace/{marketplace}/purchase",
                json=purchase_request,
            )
        except HTTPError as http_error:
            api_response = http_error.response.json()

            if (
                "cannot remove all subscription items"
                in api_response["message"]
            ):
                raise CannotCancelLastContractError

            raise

        return response.json()

    def preview_purchase_from_marketplace(
        self, marketplace: str, purchase_request: dict
    ) -> dict:
        response = self._request(
            method="post",
            path=f"v1/marketplace/{marketplace}/purchase/preview",
            json=purchase_request,
        )

        return response.json()

    def cancel_subscription(self, subscription_id: str) -> dict:
        response = self._request(
            method="delete",
            path=f"v1/subscriptions/{subscription_id}",
        )

        return response.json() if response.status_code != 200 else None

    def post_subscription_auto_renewal(
        self, subscription_id: str, should_auto_renew: bool
    ) -> dict:
        response = self._request(
            method="post",
            path=f"v1/subscription/{subscription_id}/auto-renewal",
            json={"shouldAutoRenew": should_auto_renew},
        )

        return response.json() if response.status_code != 200 else None


class UnauthorizedError(Exception):
    """An error representing an unauthorized request."""

    def __init__(self, code, message):
        self.code = code
        self.message = message

    def __str__(self):
        return f"unauthorized error: {self.code}: {self.message}"

    def asdict(self):
        return self.__dict__


class CannotCancelLastContractError(Exception):
    pass
