import unittest

from requests.exceptions import HTTPError

from webapp.advantage.ua_contracts.api import (
    UAContractsAPI,
    UAContractsAPIAuthError,
    UAContractsAPIAuthErrorView,
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UnauthorizedError,
)


class Response:
    """An HTTP response for testing."""

    def __init__(self, status_code, content):
        self.status_code = status_code
        self._content = content

    def raise_for_status(self):
        if self.status_code != 200:
            raise (HTTPError(response=self))

    def json(self):
        return self._content


class Session:
    """A request session for testing."""

    def __init__(self, resp: Response):
        self._resp = resp
        self.request_kwargs = None

    def request(self, **kwargs):
        self.request_kwargs = kwargs
        return self._resp


def make_client(session: Session, **kwargs):
    """Create and return a ua-contracts client for tests."""
    return UAContractsAPI(
        session,
        "secret-token",
        token_type="Bearer",
        api_url="https://1.2.3.4/contracts/",
        **kwargs,
    )


class TestGetAccounts(unittest.TestCase):
    def test_errors(self):
        """Exceptions are raised in case of errors."""
        for code, is_for_view, want_error in (
            (500, False, UAContractsAPIError),
            (500, True, UAContractsAPIErrorView),
            (401, False, UAContractsAPIAuthError),
            (401, True, UAContractsAPIAuthErrorView),
        ):
            with self.subTest(code=code, is_for_view=is_for_view):
                session = Session(Response(code, {"code": "bad wolf"}))
                client = make_client(session, is_for_view=is_for_view)
                with self.assertRaises(want_error) as ctx:
                    client.get_accounts()
                self.assertEqual(
                    ctx.exception.response.json(), {"code": "bad wolf"}
                )

    def test_success(self):
        """Accounts are returned for the current user."""
        session = Session(Response(200, {"accounts": ["acc1", "acc2"]}))
        client = make_client(session)
        resp = client.get_accounts()
        self.assertEqual(resp, ["acc1", "acc2"])
        self.assertEqual(
            session.request_kwargs,
            {
                "headers": {"Authorization": "Bearer secret-token"},
                "json": None,
                "method": "get",
                "params": None,
                "url": "https://1.2.3.4/contracts/v1/accounts",
            },
        )

    def test_success_email(self):
        """Accounts are returned for the given email."""
        session = Session(Response(200, {"accounts": ["acc3", "acc4"]}))
        client = make_client(session)
        resp = client.get_accounts(email="picard@enterprise")
        self.assertEqual(resp, ["acc3", "acc4"])
        self.assertEqual(
            session.request_kwargs,
            {
                "headers": {"Authorization": "Bearer secret-token"},
                "json": None,
                "method": "get",
                "params": {"email": "picard@enterprise"},
                "url": "https://1.2.3.4/contracts/v1/accounts",
            },
        )


class TestEnsurePurchaseAccount(unittest.TestCase):
    def test_guest(self):
        """The JSON decoded response is returned for guest requests."""
        session = Session(Response(200, {"ok": True}))
        client = make_client(session)
        resp = client.ensure_purchase_account(
            email="picard@enterprise",
            account_name="jeanluc",
            payment_method_id="pmid",
            country="BR",
        )
        self.assertEqual(resp, {"ok": True})
        self.assertEqual(
            session.request_kwargs,
            {
                "headers": {"Authorization": "Bearer secret-token"},
                "json": {
                    "defaultPaymentMethod": {"Id": "pmid"},
                    "email": "picard@enterprise",
                    "name": "jeanluc",
                    "address": {"country": "BR"},
                },
                "method": "post",
                "params": None,
                "url": "https://1.2.3.4/contracts/v1/purchase-account",
            },
        )

    def test_authenticated(self):
        """The JSON decoded response is returned for authenticated requests."""
        session = Session(Response(200, {"ok": True}))
        client = make_client(session)
        resp = client.ensure_purchase_account()
        self.assertEqual(resp, {"ok": True})
        self.assertEqual(
            session.request_kwargs,
            {
                "headers": {"Authorization": "Bearer secret-token"},
                "json": {
                    "defaultPaymentMethod": {"Id": ""},
                    "email": "",
                    "name": "",
                    "address": {"country": ""},
                },
                "method": "post",
                "params": None,
                "url": "https://1.2.3.4/contracts/v1/purchase-account",
            },
        )

    def test_unauthorized(self):
        """The JSON decoded unauthorized error response is returned."""
        session = Session(
            Response(
                401,
                {
                    "code": "bad wolf",
                    "message": "end of the universe",
                },
            )
        )
        client = make_client(session)
        with self.assertRaises(UnauthorizedError) as ctx:
            client.ensure_purchase_account(
                email="picard@enterprise",
                account_name="jeanluc",
                payment_method_id="pmid",
            )
        self.assertEqual(
            ctx.exception.asdict(),
            {
                "code": "bad wolf",
                "message": "end of the universe",
            },
        )

    def test_error(self):
        """An error is raised for non-unauthorized HTTP errors."""
        session = Session(Response(500, {"error": "bad wolf"}))
        client = make_client(session)
        with self.assertRaises(HTTPError) as ctx:
            client.ensure_purchase_account()
        resp = ctx.exception.response
        self.assertEqual(resp.status_code, 500)
        self.assertEqual(resp.json(), {"error": "bad wolf"})


class TestGetPurchaseAccount(unittest.TestCase):
    def test_success(self):
        """The JSON decoded response is returned."""
        session = Session(Response(200, {"ok": True}))
        client = make_client(session)
        resp = client.get_purchase_account()
        self.assertEqual(resp, {"ok": True})
        self.assertEqual(
            session.request_kwargs,
            {
                "headers": {"Authorization": "Bearer secret-token"},
                "method": "get",
                "json": None,
                "params": None,
                "url": "https://1.2.3.4/contracts/v1/purchase-account",
            },
        )

    def test_error(self):
        """An error is raised for any HTTP errors."""
        session = Session(Response(500, {"error": "bad wolf"}))
        client = make_client(session)
        with self.assertRaises(HTTPError) as ctx:
            client.get_purchase_account()
        resp = ctx.exception.response
        self.assertEqual(resp.status_code, 500)
        self.assertEqual(resp.json(), {"error": "bad wolf"})


class TestUnauthorizedError(unittest.TestCase):

    err = UnauthorizedError("bad wolf", "end of the universe")

    def test_str(self):
        """The error is well represented as a string."""
        self.assertEqual(
            str(self.err), "unauthorized error: bad wolf: end of the universe"
        )

    def test_asdict(self):
        """The error is well represented as a dict."""
        self.assertEqual(
            self.err.asdict(),
            {
                "code": "bad wolf",
                "message": "end of the universe",
            },
        )
