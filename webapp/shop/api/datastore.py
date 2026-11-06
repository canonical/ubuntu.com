from typing import Callable

from google.cloud import datastore
from canonicalwebteam.flask_base.env import get_flask_env

# A public URL, not a secret. Inline in the dict, Bandit flags it as B105.
GOOGLE_OAUTH_URL = "https://oauth2.googleapis.com/token"


def get_datastore_client() -> datastore.Client:
    return datastore.Client.from_service_account_info(
        {
            "token_uri": GOOGLE_OAUTH_URL,
            "project_id": get_flask_env("GOOGLE_DATASTORE_PROJECT_ID"),
            "private_key": get_flask_env(
                "GOOGLE_DATASTORE_PRIVATE_KEY"
            ).replace("\\n", "\n"),
            "client_email": get_flask_env("GOOGLE_DATASTORE_EMAIL"),
        }
    )


def handle_confidentiality_agreement_submission(
    email: str,
    client_factory: Callable[[], datastore.Client] = get_datastore_client,
) -> datastore.Entity:
    client = client_factory()
    entity = datastore.Entity(client.key("Confidentiality", email))
    client.put(entity)
    return entity


def has_filed_confidentiality_agreement(
    email: str,
    client_factory: Callable[[], datastore.Client] = get_datastore_client,
) -> bool:
    client = client_factory()
    entity = client.get(client.key("Confidentiality", email))
    return True if entity is not None else False
