from requests import Session

class SecurityAPI:
  def __init__(
    self, session: Session, base_url: str, 
  ):
    self.session = session
    self.base_url = base_url
  
  """
  Defines get request set up, returns data if succesful, 
  raises HTTP errors if not
  """
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

  """
  Makes request for specific cve_id, 
  returns json object if found  
  """
  def get_cve(
    self,
    id: str,
  ):
    return self._get(
      f"cves/{id.upper()}.json"
    ).json()

  """
  Makes request for all releases with ongoing support, 
  returns json object if found
  """
  def get_releases(
    self,
  ):
    return self._get(
      "releases.json"
    ).json()

    

  