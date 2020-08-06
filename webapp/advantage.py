from requests.exceptions import HTTPError


class AdvantageContracts:
    def __init__(
        self,
        session,
        authentication_token,
        api_url="https://contracts.canonical.com",
    ):
        """
        Expects a Talisker session in most circumstances,
        from `talisker.requests.get_session()`
        """

        self.session = session
        self.authentication_token = authentication_token
        self.api_url = api_url.rstrip("/")

    def _request(self, method, path, json=None):
        headers = {}

        if self.authentication_token:
            headers["Authorization"] = f"Macaroon {self.authentication_token}"

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

    def post_stripe_invoice_id(self, invoice_id, renewal_id):
        response = self._request(
            method="post",
            path=f"v1/renewals/{renewal_id}/payment/stripe/{invoice_id}",
        )

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
            if http_error.code == 500:
                return response.json()
            else:
                raise http_error

        return {}

    def get_marketplace_product_listings(self, marketplace: str) -> dict:
        response = self._request(
            method="get",
            path=f"v1/marketplace/{marketplace}/product-listings",
        )

        return response.json()
