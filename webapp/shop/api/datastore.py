import os
from typing import Callable

from google.cloud import datastore


def get_datastore_client() -> datastore.Client:
    return datastore.Client.from_service_account_info(
        {
            "token_uri": "https://oauth2.googleapis.com/token",
            "project_id": os.getenv("GOOGLE_DATASTORE_PROJECT_ID"),
            "private_key": os.getenv("GOOGLE_DATASTORE_PRIVATE_KEY").replace(
                "\\n", "\n"
            ),
            "client_email": os.getenv("GOOGLE_DATASTORE_EMAIL"),
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
