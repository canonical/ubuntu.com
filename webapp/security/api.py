from requests import Session
from requests.exceptions import HTTPError
from urllib.parse import urlencode


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

        response.raise_for_status()

        return response

    def get_cve(
        self,
        id: str,
    ):
        """
        Makes request for specific cve_id,
        returns json object if found
        """

        try:
            cve_response = self._get(f"cves/{id.upper()}.json")
        except HTTPError as error:
            if error.response.status_code == 404:
                return None
            raise SecurityAPIError(error)

        return cve_response.json()

    def get_releases(self):
        """
        Makes request for all releases with ongoing support,
        returns json object if found
        """

        try:
            releases_response = self._get("releases.json")
        except HTTPError as error:
            raise SecurityAPIError(error)

        return releases_response.json().get("releases")

    def get_notice(
        self,
        id: str,
    ):
        """
        Makes request for specific notice_id,
        returns json object if found
        """

        try:
            notice_response = self._get(f"notices/{id.upper()}.json")
        except HTTPError as error:
            if error.response.status_code == 404:
                return None
            raise SecurityAPIError(error)

        return notice_response.json()

    def get_notices(
        self,
        limit: int,
        offset: int,
        details: str,
        release: str,
        order: str,
    ):
        """
        Makes request for all releases with ongoing support,
        returns json object if found
        """

        parameters = {
            "limit": limit,
            "offset": offset,
            "details": details,
            "release": release,
            "order": order,
        }

        # Remove falsey items from dictionary
        parameters = {k: v for k, v in parameters.items() if v}

        filtered_parameters = urlencode(parameters)

        try:
            notices_response = self._get(f"notices.json?{filtered_parameters}")
        except HTTPError as error:
            raise SecurityAPIError(error)

        return notices_response.json()

    def get_cves(
        self,
        query: str,
        priority: str,
        package: str,
        limit: int,
        offset: int,
        component: str,
        versions: list,
        statuses: list,
        order: str,
    ):
        parameters = {
            "q": query,
            "priority": priority,
            "package": package,
            "limit": limit,
            "offset": offset,
            "component": component,
            "version": versions,
            "status": statuses,
            "order": order,
        }

        # Remove falsey items from dictionary
        filtered_parameters = {}
        for key, value in parameters.items():
            if value:
                filtered_parameters[key] = value

        query_string = urlencode(filtered_parameters, doseq=True)

        try:
            cves_response = self._get(f"cves.json?{query_string}")
        except HTTPError as error:
            if error.response.status_code == 404:
                return None
            raise SecurityAPIError(error)

        return cves_response.json()
