from requests import Session

class SecurityAPI:
  def __init__(
    self, session: Session, base_url: str, 
  ):
    self.session = session
    self.base_url = base_url

  def _get(
    self, 
    path: str,
    params = {}
  ):
    uri=f"{self.base_url}{path}"

    response = self.session.get (
      uri, params=params
    )

    response.raise_for_status()

    return response

  def get_cve(
    self,
    id: str,
  ):
    return self._get(
      f"cves/{id.upper()}.json"
    ).json()

  def get_releases(
    self,
  ):
    return self._get(
      "releases.json"
    ).json()

    

  