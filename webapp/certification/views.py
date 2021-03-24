import flask
import talisker.requests
import talisker.sentry
from requests import Session
from webapp.certification.api import CertificationAPI

session = Session()
talisker.requests.configure(session)
api = CertificationAPI(
    base_url="https://certification.canonical.com/api/v1", session=session
)


def certification_home():
    return flask.render_template("certification/index.html")
