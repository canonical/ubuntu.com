import json
import pathlib
from requests.exceptions import HTTPError

from webapp.advantage.api import UAContractsAPI


class Response:
    def __init__(
        self,
        status_code: int,
        content: dict,
    ):
        self.status_code = status_code
        self._content = content

    def raise_for_status(self):
        if self.status_code != 200:
            raise (HTTPError(response=self))

    def json(self):
        return self._content


class Session:
    def __init__(self, response: Response):
        self._response = response
        self.request_kwargs = None

    def request(self, **kwargs):
        self.request_kwargs = kwargs

        return self._response


def make_client(session: Session, **kwargs):
    return UAContractsAPI(
        session,
        "secret-token",
        api_url="https://1.2.3.4",
        **kwargs,
    )


def get_fixture(file: str) -> dict:
    current_path = pathlib.Path(__file__).parent.absolute()
    with open(f"{current_path}/./fixtures/{file}.json") as json_data:
        file_data = json_data.read()
        json_data.close()

    return json.loads(file_data)
