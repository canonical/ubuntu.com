import os

from requests import Request, Session
from pymacaroons import Macaroon

from webapp.macaroons import binary_serialize_macaroons


API_URL = os.getenv("ADVANTAGE_API", "https://contracts.canonical.com/")
api_session = Session()


def _prepare_request(method, path, data=None, session=None):
    request = Request(method=method, url=f"{API_URL}{path}")

    if session:
        root = Macaroon.deserialize(session["macaroon_root"])
        discharge = Macaroon.deserialize(session["macaroon_discharge"])
        bound = root.prepare_for_request(discharge)
        token = binary_serialize_macaroons([root, bound]).decode("utf-8")
        request.headers["Authorization"] = f"Macaroon {token}"

    if data is not None:
        request.json = data

    return request.prepare()


def _send(request, timeout=5, raise_http_errors=True):
    response = api_session.send(request, timeout=timeout)

    if raise_http_errors:
        response.raise_for_status()

    return response


def get_macaroon():
    response = _send(
        _prepare_request(method="get", path="v1/canonical-sso-macaroon")
    )

    payload = response.json()
    return payload["macaroon"]


def get_accounts(session):
    response = _send(
        _prepare_request(method="get", path="v1/accounts", session=session)
    )

    payload = response.json()
    return payload.get("accounts", [])


def get_account_contracts(account, session):
    account_id = account["id"]
    response = _send(
        _prepare_request(
            method="get",
            path=f"v1/accounts/{account_id}/contracts",
            session=session,
        )
    )

    payload = response.json()
    return payload.get("contracts", [])


def get_contract_token(contract, session):
    contract_id = contract["contractInfo"]["id"]
    response = _send(
        _prepare_request(
            method="post",
            path=f"v1/contracts/{contract_id}/token",
            data={},
            session=session,
        )
    )

    payload = response.json()
    return payload.get("contractToken")


def get_contract_machines(contract, session):
    contract_id = contract["contractInfo"]["id"]
    response = _send(
        _prepare_request(
            method="get",
            path=f"v1/contracts/{contract_id}/context/machines",
            session=session,
        )
    )

    payload = response.json()
    return payload


def put_method_id(session, account_id, payment_method_id):
    response = _send(
        _prepare_request(
            method="put",
            path=f"v1/accounts/{account_id}/payment-method/stripe",
            data={"paymentMethodID": payment_method_id},
            session=session,
        ),
        raise_http_errors=False,
    )

    return response.json()


def post_stripe_invoice_id(session, invoice_id, renewal_id):
    response = _send(
        _prepare_request(
            method="post",
            path=f"v1/renewals/{renewal_id}/payment/stripe/{invoice_id}",
            session=session,
        ),
        raise_http_errors=False,
    )

    return response.json()


def get_renewal(session, renewal_id):
    response = _send(
        _prepare_request(
            method="get", path=f"v1/renewals/{renewal_id}", session=session,
        )
    )

    return response.json()


def accept_renewal(session, renewal_id):
    response = _send(
        _prepare_request(
            method="post",
            path=f"v1/renewals/{renewal_id}/acceptance",
            session=session,
        ),
        timeout=30,
        raise_http_errors=False,
    )

    if response.status_code == 200:
        return {}
    else:
        return response.json()
