#!/usr/bin/env python3

# Copyright 2024 Canonical Ltd.
# Licensed under the Apache2.0. See LICENSE file in charm source for details.

"""Library to manage the relation data for the SAML Integrator charm.

This library contains the Requires and Provides classes for handling the relation
between an application and a charm providing the `saml`relation.
It also contains a `SamlRelationData` class to wrap the SAML data that will
be shared via the relation.

### Requirer Charm

```python

from charms.saml_integrator.v0 import SamlDataAvailableEvent, SamlRequires

class SamlRequirerCharm(ops.CharmBase):
    def __init__(self, *args):
        super().__init__(*args)
        self.saml = saml.SamlRequires(self)
        self.framework.observe(self.saml.on.saml_data_available, self._handler)
        ...

    def _handler(self, events: SamlDataAvailableEvent) -> None:
        ...

```

As shown above, the library provides a custom event to handle the scenario in
which new SAML data has been added or updated.

### Provider Charm

Following the previous example, this is an example of the provider charm.

```python
from charms.saml_integrator.v0 import SamlDataAvailableEvent, SamlRequires

class SamlRequirerCharm(ops.CharmBase):
    def __init__(self, *args):
        super().__init__(*args)
        self.saml = SamlRequires(self)
        self.framework.observe(self.saml.on.saml_data_available, self._on_saml_data_available)
        ...

    def _on_saml_data_available(self, events: SamlDataAvailableEvent) -> None:
        ...

    def __init__(self, *args):
        super().__init__(*args)
        self.saml = SamlProvides(self)

```
The SamlProvides object wraps the list of relations into a `relations` property
and provides an `update_relation_data` method to update the relation data by passing
a `SamlRelationData` data object.
Additionally, SamlRelationData can be used to directly parse the relation data with the
class method `from_relation_data`.
"""

# The unique Charmhub library identifier, never change it
LIBID = "511cdfa7de3d43568bf9b512f9c9f89d"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 10

# pylint: disable=wrong-import-position
import re
import typing

import ops
from pydantic import AnyHttpUrl, BaseModel, Field
from pydantic.tools import parse_obj_as

DEFAULT_RELATION_NAME = "saml"


class SamlEndpoint(BaseModel):
    """Represent a SAML endpoint.

    Attrs:
        name: Endpoint name.
        url: Endpoint URL.
        binding: Endpoint binding.
        response_url: URL to address the response to.
    """

    name: str = Field(..., min_length=1)
    url: typing.Optional[AnyHttpUrl]
    binding: str = Field(..., min_length=1)
    response_url: typing.Optional[AnyHttpUrl]

    def to_relation_data(self) -> typing.Dict[str, str]:
        """Convert an instance of SamlEndpoint to the relation representation.

        Returns:
            Dict containing the representation.
        """
        result: typing.Dict[str, str] = {}
        # Get the HTTP method from the SAML binding
        http_method = self.binding.split(":")[-1].split("-")[-1].lower()
        # Transform name into snakecase
        lowercase_name = re.sub(r"(?<!^)(?=[A-Z])", "_", self.name).lower()
        prefix = f"{lowercase_name}_{http_method}_"
        if self.url:
            result[f"{prefix}url"] = str(self.url)
        result[f"{prefix}binding"] = self.binding
        if self.response_url:
            result[f"{prefix}response_url"] = str(self.response_url)
        return result

    @classmethod
    def from_relation_data(cls, relation_data: typing.Dict[str, str]) -> "SamlEndpoint":
        """Initialize a new instance of the SamlEndpoint class from the relation data.

        Args:
            relation_data: the relation data.

        Returns:
            A SamlEndpoint instance.
        """
        url_key = ""
        for key in relation_data:
            # A key per method and entpoint type that is always present
            if key.endswith("_redirect_url") or key.endswith("_post_url"):
                url_key = key
        # Get endpoint name from the relation data key
        lowercase_name = "_".join(url_key.split("_")[:-2])
        name = "".join(x.capitalize() for x in lowercase_name.split("_"))
        # Get HTTP method from the relation data key
        http_method = url_key.split("_")[-2]
        prefix = f"{lowercase_name}_{http_method}_"
        return cls(
            name=name,
            url=(
                parse_obj_as(AnyHttpUrl, relation_data[f"{prefix}url"])
                if relation_data[f"{prefix}url"]
                else None
            ),
            binding=relation_data[f"{prefix}binding"],
            response_url=(
                parse_obj_as(AnyHttpUrl, relation_data[f"{prefix}response_url"])
                if f"{prefix}response_url" in relation_data
                else None
            ),
        )


class SamlRelationData(BaseModel):
    """Represent the relation data.

    Attrs:
        entity_id: SAML entity ID.
        metadata_url: URL to the metadata.
        certificates: Tuple of SAML certificates.
        endpoints: Tuple of SAML endpoints.
    """

    entity_id: str = Field(..., min_length=1)
    metadata_url: typing.Optional[AnyHttpUrl]
    certificates: typing.Tuple[str, ...]
    endpoints: typing.Tuple[SamlEndpoint, ...]

    def to_relation_data(self) -> typing.Dict[str, str]:
        """Convert an instance of SamlDataAvailableEvent to the relation representation.

        Returns:
            Dict containing the representation.
        """
        result = {
            "entity_id": self.entity_id,
            "x509certs": ",".join(self.certificates),
        }
        if self.metadata_url:
            result["metadata_url"] = str(self.metadata_url)
        for endpoint in self.endpoints:
            result.update(endpoint.to_relation_data())
        return result

    @classmethod
    def from_relation_data(cls, relation_data: ops.RelationDataContent) -> "SamlRelationData":
        """Get a SamlRelationData wrapping the relation data.

        Arguments:
            relation_data: the relation data.

        Returns: a SamlRelationData instance with the relation data.
        """
        # mypy is not aware of the relation data being present
        endpoints = [
            SamlEndpoint.from_relation_data(
                {
                    key2: relation_data.get(key2)  # type: ignore
                    for key2 in relation_data
                    if key2.startswith("_".join(key.split("_")[:-1]))
                }
            )
            for key in relation_data
            if key.endswith("_redirect_url") or key.endswith("_post_url")
        ]
        endpoints.sort(key=lambda ep: ep.name)
        return cls(
            entity_id=relation_data.get("entity_id"),  # type: ignore
            metadata_url=(
                parse_obj_as(AnyHttpUrl, relation_data.get("metadata_url"))
                if relation_data.get("metadata_url")
                else None
            ),  # type: ignore
            certificates=tuple(relation_data.get("x509certs").split(",")),  # type: ignore
            endpoints=tuple(endpoints),
        )


class SamlDataAvailableEvent(ops.RelationEvent):
    """Saml event emitted when relation data has changed.

    Attrs:
        saml_relation_data: the SAML relation data
        entity_id: SAML entity ID.
        metadata_url: URL to the metadata.
        certificates: Tuple containing the SAML certificates.
        endpoints: Tuple containing the SAML endpoints.
    """

    @property
    def saml_relation_data(self) -> SamlRelationData:
        """Get a SamlRelationData for the relation data."""
        assert self.relation.app
        return SamlRelationData.from_relation_data(self.relation.data[self.relation.app])

    @property
    def entity_id(self) -> str:
        """Fetch the SAML entity ID from the relation."""
        return self.saml_relation_data.entity_id

    @property
    def metadata_url(self) -> typing.Optional[str]:
        """Fetch the SAML metadata URL from the relation."""
        return str(self.saml_relation_data.metadata_url)

    @property
    def certificates(self) -> typing.Tuple[str, ...]:
        """Fetch the SAML certificates from the relation."""
        return self.saml_relation_data.certificates

    @property
    def endpoints(self) -> typing.Tuple[SamlEndpoint, ...]:
        """Fetch the SAML endpoints from the relation."""
        return self.saml_relation_data.endpoints


class SamlRequiresEvents(ops.CharmEvents):
    """SAML events.

    This class defines the events that a SAML requirer can emit.

    Attrs:
        saml_data_available: the SamlDataAvailableEvent.
    """

    saml_data_available = ops.EventSource(SamlDataAvailableEvent)


class SamlRequires(ops.Object):
    """Requirer side of the SAML relation.

    Attrs:
        on: events the provider can emit.
    """

    on = SamlRequiresEvents()

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

    def _on_relation_changed(self, event: ops.RelationChangedEvent) -> None:
        """Event emitted when the relation has changed.

        Args:
            event: event triggering this handler.
        """
        assert event.relation.app
        if event.relation.data[event.relation.app]:
            self.on.saml_data_available.emit(event.relation, app=event.app, unit=event.unit)

    def get_relation_data(self) -> typing.Optional[SamlRelationData]:
        """Retrieve the relation data.

        Returns:
            SmtpRelationData: the relation data.
        """
        relation = self.model.get_relation(self.relation_name)
        if not relation or not relation.app or not relation.data[relation.app]:
            return None
        return SamlRelationData.from_relation_data(relation.data[relation.app])


class SamlProvides(ops.Object):
    """Provider side of the SAML relation.

    Attrs:
        relations: list of charm relations.
    """

    def __init__(self, charm: ops.CharmBase, relation_name: str = DEFAULT_RELATION_NAME) -> None:
        """Construct.

        Args:
            charm: the provider charm.
            relation_name: the relation name.
        """
        super().__init__(charm, relation_name)
        self.charm = charm
        self.relation_name = relation_name

    @property
    def relations(self) -> typing.List[ops.Relation]:
        """The list of Relation instances associated with this relation_name.

        Returns:
            List of relations to this charm.
        """
        return list(self.model.relations[self.relation_name])

    def update_relation_data(self, relation: ops.Relation, saml_data: SamlRelationData) -> None:
        """Update the relation data.

        Args:
            relation: the relation for which to update the data.
            saml_data: a SamlRelationData instance wrapping the data to be updated.
        """
        relation.data[self.charm.model.app].update(saml_data.to_relation_data())
