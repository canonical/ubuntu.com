from requests import Session
from requests.exceptions import HTTPError


class SecurityAPIError(HTTPError):
    def __init__(self, error: HTTPError):
        super().__init__(request=error.request, response=error.response)


class SecurityAPI:
    def __init__(
        self,
        session: Session,
        base_url: str,
    ):
        self.session = session
        self.base_url = base_url

    def _get(self, path: str, params={}):
        """
        Defines get request set up, returns data if succesful,
        raises HTTP errors if not
        """
        uri = f"{self.base_url}{path}"

        response = self.session.get(uri, params=params)
        
        try:
            response.raise_for_status()
        except HTTPError as error:
            raise SecurityAPIError(error)

        return response

    def get_cve(
        self,
        id: str,
    ):
        """
        Makes request for specific cve_id,
        returns json object if found
        """
        return self._get(f"cves/{id.upper()}.json").json()

    def get_releases(self):
        """
        Makes request for all releases with ongoing support,
        returns json object if found
        """

        return self._get("releases.json").json()
