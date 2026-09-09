# Copyright 2023 Canonical Ltd.
# See LICENSE file for licensing details.

"""# Oauth Library.

This library is designed to enable applications to register OAuth2/OIDC
clients with an OIDC Provider through the `oauth` interface.

## Getting started

To get started using this library you just need to fetch the library using `charmcraft`. **Note
that you also need to add `jsonschema` to your charm's `requirements.txt`.**

```shell
cd some-charm
charmcraft fetch-lib charms.hydra.v0.oauth
EOF
```

Then, to initialize the library:
```python
# ...
from charms.hydra.v0.oauth import ClientConfig, OAuthRequirer

OAUTH = "oauth"
OAUTH_SCOPES = "openid email"
OAUTH_GRANT_TYPES = ["authorization_code"]

class SomeCharm(CharmBase):
  def __init__(self, *args):
    # ...
    self.oauth = OAuthRequirer(self, client_config, relation_name=OAUTH)

    self.framework.observe(self.oauth.on.oauth_info_changed, self._configure_application)
    # ...

    def _on_ingress_ready(self, event):
        self.external_url = "https://example.com"
        self._set_client_config()

    def _set_client_config(self):
        client_config = ClientConfig(
            urljoin(self.external_url, "/oauth/callback"),
            OAUTH_SCOPES,
            OAUTH_GRANT_TYPES,
        )
        self.oauth.update_client_config(client_config)
```
"""

import json
import logging
import re
from dataclasses import asdict, dataclass, field, fields
from typing import Dict, List, Mapping, Optional

import jsonschema
from ops.charm import CharmBase, RelationBrokenEvent, RelationChangedEvent, RelationCreatedEvent
from ops.framework import EventBase, EventSource, Handle, Object, ObjectEvents
from ops.model import Relation, Secret, SecretNotFoundError, TooManyRelatedAppsError

# The unique Charmhub library identifier, never change it
LIBID = "a3a301e325e34aac80a2d633ef61fe97"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 12

PYDEPS = ["jsonschema"]


logger = logging.getLogger(__name__)

DEFAULT_RELATION_NAME = "oauth"
ALLOWED_GRANT_TYPES = [
    "authorization_code",
    "refresh_token",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:device_code",
]
ALLOWED_CLIENT_AUTHN_METHODS = ["client_secret_basic", "client_secret_post"]
CLIENT_SECRET_FIELD = "secret"

url_regex = re.compile(
    r"(^http://)|(^https://)"  # http:// or https://
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|"
    r"[A-Z0-9-]{2,}\.?)|"  # domain...
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
    r"(?::\d+)?"  # optional port
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)

OAUTH_PROVIDER_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://canonical.github.io/charm-relation-interfaces/interfaces/oauth/schemas/provider.json",
    "type": "object",
    "properties": {
        "issuer_url": {
            "type": "string",
        },
        "authorization_endpoint": {
            "type": "string",
        },
        "token_endpoint": {
            "type": "string",
        },
        "introspection_endpoint": {
            "type": "string",
        },
        "userinfo_endpoint": {
            "type": "string",
        },
        "jwks_endpoint": {
            "type": "string",
        },
        "scope": {
            "type": "string",
        },
        "client_id": {
            "type": "string",
        },
        "client_secret_id": {
            "type": "string",
        },
        "groups": {"type": "string", "default": None},
        "ca_chain": {"type": "array", "items": {"type": "string"}, "default": []},
        "jwt_access_token": {"type": "string", "default": "False"},
    },
    "required": [
        "issuer_url",
        "authorization_endpoint",
        "token_endpoint",
        "introspection_endpoint",
        "userinfo_endpoint",
        "jwks_endpoint",
        "scope",
    ],
}
OAUTH_REQUIRER_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://canonical.github.io/charm-relation-interfaces/interfaces/oauth/schemas/requirer.json",
    "type": "object",
    "properties": {
        "redirect_uri": {
            "type": "string",
            "default": None,
        },
        "audience": {"type": "array", "default": [], "items": {"type": "string"}},
        "scope": {"type": "string", "default": None},
        "grant_types": {
            "type": "array",
            "default": None,
            "items": {
                "enum": ALLOWED_GRANT_TYPES,
                "type": "string",
            },
        },
        "token_endpoint_auth_method": {
            "type": "string",
            "enum": ALLOWED_CLIENT_AUTHN_METHODS,
            "default": "client_secret_basic",
        },
    },
    "required": ["audience", "scope", "grant_types", "token_endpoint_auth_method"],
    "allOf": [
        {
            "if": {
                "properties": {
                    "grant_types": {
                        "contains": {
                            "const": "authorization_code",
                        }
                    }
                },
                "required": ["grant_types"],
            },
            "then": {
                "required": ["redirect_uri"],
            },
        }
    ],
}


class ClientConfigError(Exception):
    """Emitted when invalid client config is provided."""


class DataValidationError(RuntimeError):
    """Raised when data validation fails on relation data."""


def _load_data(data: Mapping, schema: Optional[Dict] = None) -> Dict:
    """Parses nested fields and checks whether `data` matches `schema`."""
    ret = {}
    for k, v in data.items():
        try:
            ret[k] = json.loads(v)
        except json.JSONDecodeError:
            ret[k] = v

    if schema:
        _validate_data(ret, schema)
    return ret


def _dump_data(data: Dict, schema: Optional[Dict] = None) -> Dict:
    if schema:
        _validate_data(data, schema)

    ret = {}
    for k, v in data.items():
        if isinstance(v, (list, dict)):
            try:
                ret[k] = json.dumps(v)
            except json.JSONDecodeError as e:
                raise DataValidationError(f"Failed to encode relation json: {e}")
        elif isinstance(v, bool):
            ret[k] = str(v)
        else:
            ret[k] = v
    return ret


def strtobool(val: str) -> bool:
    """Convert a string representation of truth to true (1) or false (0).

    True values are 'y', 'yes', 't', 'true', 'on', and '1'; false values
    are 'n', 'no', 'f', 'false', 'off', and '0'.  Raises ValueError if
    'val' is anything else.
    """
    if not isinstance(val, str):
        raise ValueError(f"invalid value type {type(val)}")

    val = val.lower()
    if val in ("y", "yes", "t", "true", "on", "1"):
        return True
    elif val in ("n", "no", "f", "false", "off", "0"):
        return False
    else:
        raise ValueError(f"invalid truth value {val}")


class OAuthRelation(Object):
    """A class containing helper methods for oauth relation."""

    def _pop_relation_data(self, relation_id: Relation) -> None:
        if not self.model.unit.is_leader():
            return

        if len(self.model.relations) == 0:
            return

        relation = self.model.get_relation(self._relation_name, relation_id=relation_id)
        if not relation or not relation.app:
            return

        try:
            for data in list(relation.data[self.model.app]):
                relation.data[self.model.app].pop(data, "")
        except Exception as e:
            logger.info(f"Failed to pop the relation data: {e}")


def _validate_data(data: Dict, schema: Dict) -> None:
    """Checks whether `data` matches `schema`.

    Will raise DataValidationError if the data is not valid, else return None.
    """
    try:
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.ValidationError as e:
        raise DataValidationError(data, schema) from e


@dataclass
class ClientConfig:
    """Helper class containing a client's configuration."""

    redirect_uri: str | None
    scope: str
    grant_types: List[str]
    audience: List[str] = field(default_factory=lambda: [])
    token_endpoint_auth_method: str = "client_secret_basic"
    client_id: Optional[str] = None

    def validate(self) -> None:
        """Validate the client configuration."""
        if "authorization_code" in self.grant_types and not self.redirect_uri:
            raise ClientConfigError(
                "redirect_uri is required when using authorization_code grant_type"
            )

        # Validate redirect_uri when configured
        if self.redirect_uri is not None and not re.match(url_regex, self.redirect_uri):
            raise ClientConfigError(f"Invalid URL {self.redirect_uri}")

        if self.redirect_uri is not None and self.redirect_uri.startswith("http://"):
            logger.warning("Provided Redirect URL uses http scheme. Don't do this in production")

        # Validate grant_types
        for grant_type in self.grant_types:
            if grant_type not in ALLOWED_GRANT_TYPES:
                raise ClientConfigError(
                    f"Invalid grant_type {grant_type}, must be one of {ALLOWED_GRANT_TYPES}"
                )

        # Validate client authentication methods
        if self.token_endpoint_auth_method not in ALLOWED_CLIENT_AUTHN_METHODS:
            raise ClientConfigError(
                f"Invalid client auth method {self.token_endpoint_auth_method}, "
                f"must be one of {ALLOWED_CLIENT_AUTHN_METHODS}"
            )

    def to_dict(self) -> Dict:
        """Convert object to dict."""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class OauthProviderConfig:
    """Helper class containing provider's configuration."""

    issuer_url: str
    authorization_endpoint: str
    token_endpoint: str
    introspection_endpoint: str
    userinfo_endpoint: str
    jwks_endpoint: str
    scope: str
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    groups: Optional[str] = None
    ca_chain: Optional[str] = None
    jwt_access_token: Optional[bool] = False

    @classmethod
    def from_dict(cls, dic: Dict) -> "OauthProviderConfig":
        """Generate OauthProviderConfig instance from dict."""
        jwt_access_token = False
        if "jwt_access_token" in dic:
            jwt_access_token = strtobool(dic["jwt_access_token"])
        return cls(
            jwt_access_token=jwt_access_token,
            **{
                k: v
                for k, v in dic.items()
                if k in [f.name for f in fields(cls)] and k != "jwt_access_token"
            },
        )


class OAuthInfoChangedEvent(EventBase):
    """Event to notify the charm that the information in the databag changed."""

    def __init__(self, handle: Handle, client_id: str, client_secret_id: str):
        super().__init__(handle)
        self.client_id = client_id
        self.client_secret_id = client_secret_id

    def snapshot(self) -> Dict:
        """Save event."""
        return {
            "client_id": self.client_id,
            "client_secret_id": self.client_secret_id,
        }

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        super().restore(snapshot)
        self.client_id = snapshot["client_id"]
        self.client_secret_id = snapshot["client_secret_id"]


class InvalidClientConfigEvent(EventBase):
    """Event to notify the charm that the client configuration is invalid."""

    def __init__(self, handle: Handle, error: str):
        super().__init__(handle)
        self.error = error

    def snapshot(self) -> Dict:
        """Save event."""
        return {
            "error": self.error,
        }

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        self.error = snapshot["error"]


class OAuthInfoRemovedEvent(EventBase):
    """Event to notify the charm that the provider data was removed."""

    def snapshot(self) -> Dict:
        """Save event."""
        return {}

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        pass


class OAuthRequirerEvents(ObjectEvents):
    """Event descriptor for events raised by `OAuthRequirerEvents`."""

    oauth_info_changed = EventSource(OAuthInfoChangedEvent)
    oauth_info_removed = EventSource(OAuthInfoRemovedEvent)
    invalid_client_config = EventSource(InvalidClientConfigEvent)


class OAuthRequirer(OAuthRelation):
    """Register an oauth client."""

    on = OAuthRequirerEvents()

    def __init__(
        self,
        charm: CharmBase,
        client_config: Optional[ClientConfig] = None,
        relation_name: str = DEFAULT_RELATION_NAME,
    ) -> None:
        super().__init__(charm, relation_name)
        self._charm = charm
        self._relation_name = relation_name
        self._client_config = client_config
        events = self._charm.on[relation_name]
        self.framework.observe(events.relation_created, self._on_relation_created_event)
        self.framework.observe(events.relation_changed, self._on_relation_changed_event)
        self.framework.observe(events.relation_broken, self._on_relation_broken_event)

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        try:
            self._update_relation_data(self._client_config, event.relation.id)
        except ClientConfigError as e:
            self.on.invalid_client_config.emit(e.args[0])

    def _on_relation_broken_event(self, event: RelationBrokenEvent) -> None:
        # This may be caused by a provider unit being removed.
        # Also the oauth data may still be there, perhaps we should remove this event altogether for now.

        # Notify the requirer that the relation data was removed
        self.on.oauth_info_removed.emit()

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        data = event.relation.data[event.app]
        if not data:
            logger.info("No relation data available.")
            return

        data = _load_data(data, OAUTH_PROVIDER_JSON_SCHEMA)

        client_id = data.get("client_id")
        client_secret_id = data.get("client_secret_id")
        if not client_id or not client_secret_id:
            logger.info("OAuth Provider info is available, waiting for client to be registered.")
            # The client credentials are not ready yet, so we do nothing
            # This could mean that the client credentials were removed from the databag,
            # but we don't allow that (for now), so we don't have to check for it.
            return

        self.on.oauth_info_changed.emit(client_id, client_secret_id)

    def _update_relation_data(
        self, client_config: Optional[ClientConfig], relation_id: Optional[int] = None
    ) -> None:
        if not self.model.unit.is_leader() or not client_config:
            return

        if not isinstance(client_config, ClientConfig):
            raise ValueError(f"Unexpected client_config type: {type(client_config)}")

        client_config.validate()

        try:
            relation = self.model.get_relation(
                relation_name=self._relation_name, relation_id=relation_id
            )
        except TooManyRelatedAppsError:
            raise RuntimeError("More than one relations are defined. Please provide a relation_id")

        if not relation or not relation.app:
            return

        data = _dump_data(client_config.to_dict(), OAUTH_REQUIRER_JSON_SCHEMA)
        relation.data[self.model.app].update(data)

    def is_client_created(self, relation_id: Optional[int] = None) -> bool:
        """Check if the client has been created."""
        if len(self.model.relations) == 0:
            return None
        try:
            relation = self.model.get_relation(self._relation_name, relation_id=relation_id)
        except TooManyRelatedAppsError:
            raise RuntimeError("More than one relations are defined. Please provide a relation_id")

        if not relation or not relation.app:
            return None

        return (
            "client_id" in relation.data[relation.app]
            and "client_secret_id" in relation.data[relation.app]
        )

    def get_provider_info(
        self, relation_id: Optional[int] = None
    ) -> Optional[OauthProviderConfig]:
        """Get the provider information from the databag."""
        if len(self.model.relations) == 0:
            return None
        try:
            relation = self.model.get_relation(self._relation_name, relation_id=relation_id)
        except TooManyRelatedAppsError:
            raise RuntimeError("More than one relations are defined. Please provide a relation_id")
        if not relation or not relation.app:
            return None

        data = relation.data[relation.app]
        if not data:
            logger.info("No relation data available.")
            return

        data = _load_data(data, OAUTH_PROVIDER_JSON_SCHEMA)

        client_secret_id = data.get("client_secret_id")
        if client_secret_id:
            _client_secret = self.get_client_secret(client_secret_id)
            client_secret = _client_secret.get_content()[CLIENT_SECRET_FIELD]
            data["client_secret"] = client_secret

        oauth_provider = OauthProviderConfig.from_dict(data)
        return oauth_provider

    def get_client_secret(self, client_secret_id: str) -> Secret:
        """Get the client_secret."""
        client_secret = self.model.get_secret(id=client_secret_id)
        return client_secret

    def update_client_config(
        self, client_config: ClientConfig, relation_id: Optional[int] = None
    ) -> None:
        """Update the client config stored in the object."""
        self._client_config = client_config
        self._update_relation_data(client_config, relation_id=relation_id)


class ClientCreatedEvent(EventBase):
    """Event to notify the Provider charm to create a new client."""

    def __init__(
        self,
        handle: Handle,
        redirect_uri: str,
        scope: str,
        grant_types: List[str],
        audience: List,
        token_endpoint_auth_method: str,
        relation_id: int,
    ) -> None:
        super().__init__(handle)
        self.redirect_uri = redirect_uri
        self.scope = scope
        self.grant_types = grant_types
        self.audience = audience
        self.token_endpoint_auth_method = token_endpoint_auth_method
        self.relation_id = relation_id

    def snapshot(self) -> Dict:
        """Save event."""
        return {
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
            "grant_types": self.grant_types,
            "audience": self.audience,
            "token_endpoint_auth_method": self.token_endpoint_auth_method,
            "relation_id": self.relation_id,
        }

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        self.redirect_uri = snapshot["redirect_uri"]
        self.scope = snapshot["scope"]
        self.grant_types = snapshot["grant_types"]
        self.audience = snapshot["audience"]
        self.token_endpoint_auth_method = snapshot["token_endpoint_auth_method"]
        self.relation_id = snapshot["relation_id"]

    def to_client_config(self) -> ClientConfig:
        """Convert the event information to a ClientConfig object."""
        return ClientConfig(
            self.redirect_uri,
            self.scope,
            self.grant_types,
            self.audience,
            self.token_endpoint_auth_method,
        )


class ClientChangedEvent(EventBase):
    """Event to notify the Provider charm that the client config changed."""

    def __init__(
        self,
        handle: Handle,
        redirect_uri: str,
        scope: str,
        grant_types: List,
        audience: List,
        token_endpoint_auth_method: str,
        relation_id: int,
        client_id: str,
    ) -> None:
        super().__init__(handle)
        self.redirect_uri = redirect_uri
        self.scope = scope
        self.grant_types = grant_types
        self.audience = audience
        self.token_endpoint_auth_method = token_endpoint_auth_method
        self.relation_id = relation_id
        self.client_id = client_id

    def snapshot(self) -> Dict:
        """Save event."""
        return {
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
            "grant_types": self.grant_types,
            "audience": self.audience,
            "token_endpoint_auth_method": self.token_endpoint_auth_method,
            "relation_id": self.relation_id,
            "client_id": self.client_id,
        }

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        self.redirect_uri = snapshot["redirect_uri"]
        self.scope = snapshot["scope"]
        self.grant_types = snapshot["grant_types"]
        self.audience = snapshot["audience"]
        self.token_endpoint_auth_method = snapshot["token_endpoint_auth_method"]
        self.relation_id = snapshot["relation_id"]
        self.client_id = snapshot["client_id"]

    def to_client_config(self) -> ClientConfig:
        """Convert the event information to a ClientConfig object."""
        return ClientConfig(
            self.redirect_uri,
            self.scope,
            self.grant_types,
            self.audience,
            self.token_endpoint_auth_method,
            self.client_id,
        )


class ClientDeletedEvent(EventBase):
    """Event to notify the Provider charm that the client was deleted."""

    def __init__(
        self,
        handle: Handle,
        relation_id: int,
    ) -> None:
        super().__init__(handle)
        self.relation_id = relation_id

    def snapshot(self) -> Dict:
        """Save event."""
        return {"relation_id": self.relation_id}

    def restore(self, snapshot: Dict) -> None:
        """Restore event."""
        self.relation_id = snapshot["relation_id"]


class OAuthProviderEvents(ObjectEvents):
    """Event descriptor for events raised by `OAuthProviderEvents`."""

    client_created = EventSource(ClientCreatedEvent)
    client_changed = EventSource(ClientChangedEvent)
    client_deleted = EventSource(ClientDeletedEvent)


class OAuthProvider(OAuthRelation):
    """A provider object for OIDC Providers."""

    on = OAuthProviderEvents()

    def __init__(self, charm: CharmBase, relation_name: str = DEFAULT_RELATION_NAME) -> None:
        super().__init__(charm, relation_name)
        self._charm = charm
        self._relation_name = relation_name

        events = self._charm.on[relation_name]
        self.framework.observe(
            events.relation_changed,
            self._get_client_config_from_relation_data,
        )
        self.framework.observe(
            events.relation_broken,
            self._on_relation_broken,
        )

    def _get_client_config_from_relation_data(self, event: RelationChangedEvent) -> None:
        if not self.model.unit.is_leader():
            return

        data = event.relation.data[event.app]
        if not data:
            logger.info("No requirer relation data available.")
            return

        client_data = _load_data(data, OAUTH_REQUIRER_JSON_SCHEMA)
        redirect_uri = client_data.get("redirect_uri")
        scope = client_data.get("scope")
        grant_types = client_data.get("grant_types")
        audience = client_data.get("audience")
        token_endpoint_auth_method = client_data.get("token_endpoint_auth_method")

        data = event.relation.data[self._charm.app]
        if not data:
            logger.info("No provider relation data available.")
            return
        provider_data = _load_data(data, OAUTH_PROVIDER_JSON_SCHEMA)
        client_id = provider_data.get("client_id")

        relation_id = event.relation.id

        if client_id:
            # Modify an existing client
            self.on.client_changed.emit(
                redirect_uri,
                scope,
                grant_types,
                audience,
                token_endpoint_auth_method,
                relation_id,
                client_id,
            )
        else:
            # Create a new client
            self.on.client_created.emit(
                redirect_uri, scope, grant_types, audience, token_endpoint_auth_method, relation_id
            )

    def _get_secret_label(self, relation: Relation) -> str:
        return f"client_secret_{relation.id}"

    def _on_relation_broken(self, event: RelationBrokenEvent) -> None:
        # There is no way to tell if this event was emitted because the relation was removed or if one of
        # the applications was scaled down. Until this is fixed, we don't delete the client.
        # Workaround for https://github.com/canonical/operator/issues/888
        # self._pop_relation_data(event.relation.id)

        # self._delete_juju_secret(event.relation)
        self.on.client_deleted.emit(event.relation.id)

    def _create_juju_secret(self, client_secret: str, relation: Relation) -> Secret:
        """Create a juju secret and grant it to a relation."""
        secret = {CLIENT_SECRET_FIELD: client_secret}
        juju_secret = self.model.app.add_secret(secret, label=self._get_secret_label(relation))
        juju_secret.grant(relation)
        return juju_secret

    def _delete_juju_secret(self, relation: Relation) -> None:
        try:
            secret = self.model.get_secret(label=self._get_secret_label(relation))
        except SecretNotFoundError:
            return
        else:
            secret.remove_all_revisions()

    def remove_secret(self, relation: Relation) -> None:
        return self._delete_juju_secret(relation)

    def set_provider_info_in_relation_data(
        self,
        issuer_url: str,
        authorization_endpoint: str,
        token_endpoint: str,
        introspection_endpoint: str,
        userinfo_endpoint: str,
        jwks_endpoint: str,
        scope: str,
        groups: Optional[str] = None,
        ca_chain: Optional[str] = None,
        jwt_access_token: Optional[bool] = False,
    ) -> None:
        """Put the provider information in the databag."""
        if not self.model.unit.is_leader():
            return

        data = {
            "issuer_url": issuer_url,
            "authorization_endpoint": authorization_endpoint,
            "token_endpoint": token_endpoint,
            "introspection_endpoint": introspection_endpoint,
            "userinfo_endpoint": userinfo_endpoint,
            "jwks_endpoint": jwks_endpoint,
            "scope": scope,
            "jwt_access_token": jwt_access_token,
        }
        if groups:
            data["groups"] = groups
        if ca_chain:
            data["ca_chain"] = ca_chain

        for relation in self.model.relations[self._relation_name]:
            relation.data[self.model.app].update(_dump_data(data))

    def set_client_credentials_in_relation_data(
        self, relation_id: int, client_id: str, client_secret: str
    ) -> None:
        """Put the client credentials in the databag."""
        if not self.model.unit.is_leader():
            return

        relation = self.model.get_relation(self._relation_name, relation_id)
        if not relation or not relation.app:
            return
        # TODO: What if we are refreshing the client_secret? We need to add a
        # new revision for that
        secret = self._create_juju_secret(client_secret, relation)
        data = {"client_id": client_id, "client_secret_id": secret.id}
        relation.data[self.model.app].update(_dump_data(data))
