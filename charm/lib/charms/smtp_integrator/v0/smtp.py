# Copyright 2025 Canonical Ltd.
# Licensed under the Apache2.0. See LICENSE file in charm source for details.

"""Library to manage the integration with the SMTP Integrator charm.

This library contains the Requires and Provides classes for handling the integration
between an application and a charm providing the `smtp` and `smtp-legacy` integrations.
If the requirer charm supports secrets, the preferred approach is to use the `smtp`
relation to leverage them.
This library also contains a `SmtpRelationData` class to wrap the SMTP data that will
be shared via the integration.

### Requirer Charm

```python

from charms.smtp_integrator.v0.smtp import SmtpDataAvailableEvent, SmtpRequires

class SmtpRequirerCharm(ops.CharmBase):
    def __init__(self, *args):
        super().__init__(*args)
        self.smtp = smtp.SmtpRequires(self)
        self.framework.observe(self.smtp.on.smtp_data_available, self._handler)
        ...

    def _handler(self, events: SmtpDataAvailableEvent) -> None:
        ...

```

As shown above, the library provides a custom event to handle the scenario in
which new SMTP data has been added or updated.

### Provider Charm

Following the previous example, this is an example of the provider charm.

```python
from charms.smtp_integrator.v0.smtp import SmtpProvides

class SmtpProviderCharm(ops.CharmBase):
    def __init__(self, *args):
        super().__init__(*args)
        self.smtp = SmtpProvides(self)
        ...

```
The SmtpProvides object wraps the list of relations into a `relations` property
and provides an `update_relation_data` method to update the relation data by passing
a `SmtpRelationData` data object.

```python
class SmtpProviderCharm(ops.CharmBase):
    ...

    def _on_config_changed(self, _) -> None:
        for relation in self.model.relations[self.smtp.relation_name]:
            self.smtp.update_relation_data(relation, self._get_smtp_data())

```
"""

# The unique Charmhub library identifier, never change it
LIBID = "09583c2f9c1d4c0f9a40244cfc20b0c2"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 15

PYDEPS = ["pydantic>=2"]

# pylint: disable=wrong-import-position
import itertools
import logging
import typing
from ast import literal_eval
from enum import Enum
from typing import Dict, Optional

import ops
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)

DEFAULT_RELATION_NAME = "smtp"
LEGACY_RELATION_NAME = "smtp-legacy"


class SmtpError(Exception):
    """Common ancestor for Smtp related exceptions."""


class SecretError(SmtpError):
    """Common ancestor for Secrets related exceptions."""


class TransportSecurity(str, Enum):
    """Represent the transport security values.

    Attributes:
        NONE: none
        STARTTLS: starttls
        TLS: tls
    """

    NONE = "none"
    STARTTLS = "starttls"
    TLS = "tls"


class AuthType(str, Enum):
    """Represent the auth type values.

    Attributes:
        NONE: none
        NOT_PROVIDED: not_provided
        PLAIN: plain
    """

    NONE = "none"
    NOT_PROVIDED = "not_provided"
    PLAIN = "plain"


class SmtpRelationData(BaseModel):
    """Represent the relation data.

    Attributes:
        host: The hostname or IP address of the outgoing SMTP relay.
        port: The port of the outgoing SMTP relay.
        user: The SMTP AUTH user to use for the outgoing SMTP relay.
        password: The SMTP AUTH password to use for the outgoing SMTP relay.
        password_id: The secret ID where the SMTP AUTH password for the SMTP relay is stored.
        auth_type: The type used to authenticate with the SMTP relay.
        transport_security: The security protocol to use for the outgoing SMTP relay.
        domain: The domain used by the emails sent from SMTP relay.
        skip_ssl_verify: Specifies if certificate trust verification is skipped in the SMTP relay.
    """

    host: str = Field(..., min_length=1)
    port: int = Field(..., ge=1, le=65536)
    user: Optional[str] = None
    password: Optional[str] = None
    password_id: Optional[str] = None
    auth_type: AuthType
    transport_security: TransportSecurity
    domain: Optional[str] = None
    skip_ssl_verify: Optional[bool] = False

    def to_relation_data(self) -> Dict[str, str]:
        """Convert an instance of SmtpRelationData to the relation representation.

        Returns:
            Dict containing the representation.
        """
        result = {
            "host": str(self.host),
            "port": str(self.port),
            "auth_type": self.auth_type.value,
            "transport_security": self.transport_security.value,
            "skip_ssl_verify": str(self.skip_ssl_verify),
        }
        if self.domain:
            result["domain"] = self.domain
        if self.user:
            result["user"] = self.user
        if self.password:
            result["password"] = self.password
        if self.password_id:
            result["password_id"] = self.password_id
        return result


class SmtpDataAvailableEvent(ops.RelationEvent):
    """Smtp event emitted when relation data has changed.

    Attributes:
        host: The hostname or IP address of the outgoing SMTP relay.
        port: The port of the outgoing SMTP relay.
        user: The SMTP AUTH user to use for the outgoing SMTP relay.
        password: The SMTP AUTH password to use for the outgoing SMTP relay.
        password_id: The secret ID where the SMTP AUTH password for the SMTP relay is stored.
        auth_type: The type used to authenticate with the SMTP relay.
        transport_security: The security protocol to use for the outgoing SMTP relay.
        domain: The domain used by the emails sent from SMTP relay.
        skip_ssl_verify: Specifies if certificate trust verification is skipped in the SMTP relay.
    """

    @property
    def host(self) -> str:
        """Fetch the SMTP host from the relation."""
        assert self.relation.app
        return typing.cast(str, self.relation.data[self.relation.app].get("host"))

    @property
    def port(self) -> int:
        """Fetch the SMTP port from the relation."""
        assert self.relation.app
        return int(typing.cast(str, self.relation.data[self.relation.app].get("port")))

    @property
    def user(self) -> str:
        """Fetch the SMTP user from the relation."""
        assert self.relation.app
        return typing.cast(str, self.relation.data[self.relation.app].get("user"))

    @property
    def password(self) -> str:
        """Fetch the SMTP password from the relation."""
        assert self.relation.app
        return typing.cast(str, self.relation.data[self.relation.app].get("password"))

    @property
    def password_id(self) -> str:
        """Fetch the SMTP password from the relation."""
        assert self.relation.app
        return typing.cast(str, self.relation.data[self.relation.app].get("password_id"))

    @property
    def auth_type(self) -> AuthType:
        """Fetch the SMTP auth type from the relation."""
        assert self.relation.app
        return AuthType(self.relation.data[self.relation.app].get("auth_type"))

    @property
    def transport_security(self) -> TransportSecurity:
        """Fetch the SMTP transport security protocol from the relation."""
        assert self.relation.app
        return TransportSecurity(self.relation.data[self.relation.app].get("transport_security"))

    @property
    def domain(self) -> str:
        """Fetch the SMTP domain from the relation."""
        assert self.relation.app
        return typing.cast(str, self.relation.data[self.relation.app].get("domain"))

    @property
    def skip_ssl_verify(self) -> bool:
        """Fetch the skip_ssl_verify flag from the relation."""
        assert self.relation.app
        return literal_eval(
            typing.cast(str, self.relation.data[self.relation.app].get("skip_ssl_verify"))
        )


class SmtpRequiresEvents(ops.CharmEvents):
    """SMTP events.

    This class defines the events that a SMTP requirer can emit.

    Attributes:
        smtp_data_available: the SmtpDataAvailableEvent.
    """

    smtp_data_available = ops.EventSource(SmtpDataAvailableEvent)


class SmtpRequires(ops.Object):
    """Requirer side of the SMTP relation.

    Attributes:
        on: events the provider can emit.
    """

    on = SmtpRequiresEvents()

    def __init__(self, charm: ops.CharmBase, relation_name: str = DEFAULT_RELATION_NAME) -> None:
        """Construct.

        Args:
            charm: the provider charm.
            relation_name: the relation name.
        """
        super().__init__(charm, relation_name)
        self.charm = charm
        self.relation_name = relation_name
        self.framework.observe(charm.on[relation_name].relation_changed, self._on_relation_changed)

    def get_relation_data(self) -> Optional[SmtpRelationData]:
        """Retrieve the relation data.

        Returns:
            SmtpRelationData: the relation data.
        """
        relation = self.model.get_relation(self.relation_name)
        return self._get_relation_data_from_relation(relation) if relation else None

    def _get_relation_data_from_relation(
        self, relation: ops.Relation
    ) -> Optional[SmtpRelationData]:
        """Retrieve the relation data.

        Args:
            relation: the relation to retrieve the data from.

        Returns:
            SmtpRelationData: the relation data.
        """
        assert relation.app
        relation_data = relation.data[relation.app]
        if not relation_data:
            return None

        password = relation_data.get("password")
        if password is None and relation_data.get("password_id"):
            try:
                password = (
                    self.model.get_secret(id=relation_data.get("password_id"))
                    .get_content()
                    .get("password")
                )
            except ops.model.ModelError as exc:
                raise SecretError(
                    f"Could not consume secret {relation_data.get('password_id')}"
                ) from exc

        return SmtpRelationData(
            host=typing.cast(str, relation_data.get("host")),
            port=typing.cast(int, relation_data.get("port")),
            user=relation_data.get("user"),
            password=password,
            password_id=relation_data.get("password_id"),
            auth_type=AuthType(relation_data.get("auth_type")),
            transport_security=TransportSecurity(relation_data.get("transport_security")),
            domain=relation_data.get("domain"),
            skip_ssl_verify=typing.cast(bool, relation_data.get("skip_ssl_verify")),
        )

    def _is_relation_data_valid(self, relation: ops.Relation) -> bool:
        """Validate the relation data.

        Args:
            relation: the relation to validate.

        Returns:
            true: if the relation data is valid.
        """
        try:
            _ = self._get_relation_data_from_relation(relation)
            return True
        except ValidationError as ex:
            error_fields = set(
                itertools.chain.from_iterable(error["loc"] for error in ex.errors())
            )
            error_field_str = " ".join(f"{f}" for f in error_fields)
            logger.warning("Error validation the relation data %s", error_field_str)
            return False

    def _on_relation_changed(self, event: ops.RelationChangedEvent) -> None:
        """Event emitted when the relation has changed.

        Args:
            event: event triggering this handler.
        """
        assert event.relation.app
        relation_data = event.relation.data[event.relation.app]
        if relation_data:
            if relation_data["auth_type"] == AuthType.NONE.value:
                logger.warning('Insecure setting: auth_type has a value "none"')
            if relation_data["transport_security"] == TransportSecurity.NONE.value:
                logger.warning('Insecure setting: transport_security has value "none"')
            if self._is_relation_data_valid(event.relation):
                self.on.smtp_data_available.emit(event.relation, app=event.app, unit=event.unit)


class SmtpProvides(ops.Object):
    """Provider side of the SMTP relation."""

    def __init__(self, charm: ops.CharmBase, relation_name: str = DEFAULT_RELATION_NAME) -> None:
        """Construct.

        Args:
            charm: the provider charm.
            relation_name: the relation name.
        """
        super().__init__(charm, relation_name)
        self.charm = charm
        self.relation_name = relation_name

    def update_relation_data(self, relation: ops.Relation, smtp_data: SmtpRelationData) -> None:
        """Update the relation data.

        Args:
            relation: the relation for which to update the data.
            smtp_data: a SmtpRelationData instance wrapping the data to be updated.
        """
        relation_data = smtp_data.to_relation_data()
        if relation_data["auth_type"] == AuthType.NONE.value:
            logger.warning('Insecure setting: auth_type has a value "none"')
        if relation_data["transport_security"] == TransportSecurity.NONE.value:
            logger.warning('Insecure setting: transport_security has value "none"')
        relation.data[self.charm.model.app].update(relation_data)
