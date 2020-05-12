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
        return self.session.request(
            method=method,
            url=f"{self.api_url}/{path}",
            json=json,
            headers={"Authorization": f"Macaroon {self.authentication_token}"},
        )

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

    def put_method_id(self, account_id, payment_method_id):
        response = self._request(
            method="put",
            path=f"v1/accounts/{account_id}/payment-method/stripe",
            data={"paymentMethodID": payment_method_id},
        )

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
        response = (
            self._request(
                method="post", path=f"v1/renewals/{renewal_id}/acceptance"
            ),
        )

        return response.json()
