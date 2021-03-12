import unittest

from requests.exceptions import HTTPError

from webapp.advantage.api import UAContractsAPI, UnauthorizedError


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


def make_client(session: Session):
    """Create and return a ua-contracts client for tests."""
    return UAContractsAPI(
        session,
        "secret-token",
        token_type="Bearer",
        api_url="https://1.2.3.4/contracts/",
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
                },
                "method": "post",
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
                },
                "method": "post",
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
