# Copyright 2022 Canonical Ltd.
# See LICENSE file for licensing details.
"""## Overview.

This document explains how to use the `JujuTopology` class to
create and consume topology information from Juju in a consistent manner.

The goal of the Juju topology is to uniquely identify a piece
of software running across any of your Juju-managed deployments.
This is achieved by combining the following four elements:

- Model name
- Model UUID
- Application name
- Unit identifier


For a more in-depth description of the concept, as well as a
walk-through of it's use-case in observability, see
[this blog post](https://juju.is/blog/model-driven-observability-part-2-juju-topology-metrics)
on the Juju blog.

## Library Usage

This library may be used to create and consume `JujuTopology` objects.
The `JujuTopology` class provides three ways to create instances:

### Using the `from_charm` method

Enables instantiation by supplying the charm as an argument. When
creating topology objects for the current charm, this is the recommended
approach.

```python
topology = JujuTopology.from_charm(self)
```

### Using the `from_dict` method

Allows for instantion using a dictionary of relation data, like the
`scrape_metadata` from Prometheus or the labels of an alert rule. When
creating topology objects for remote charms, this is the recommended
approach.

```python
scrape_metadata = json.loads(relation.data[relation.app].get("scrape_metadata", "{}"))
topology = JujuTopology.from_dict(scrape_metadata)
```

### Using the class constructor

Enables instantiation using whatever values you want. While this
is useful in some very specific cases, this is almost certainly not
what you are looking for as setting these values manually may
result in observability metrics which do not uniquely identify a
charm in order to provide accurate usage reporting, alerting,
horizontal scaling, or other use cases.

```python
topology = JujuTopology(
    model="some-juju-model",
    model_uuid="00000000-0000-0000-0000-000000000001",
    application="fancy-juju-application",
    unit="fancy-juju-application/0",
    charm_name="fancy-juju-application-k8s",
)
```

"""
from collections import OrderedDict
from typing import Dict, List, Optional
from uuid import UUID

# The unique Charmhub library identifier, never change it
LIBID = "bced1658f20f49d28b88f61f83c2d232"

LIBAPI = 0
LIBPATCH = 6


class InvalidUUIDError(Exception):
    """Invalid UUID was provided."""

    def __init__(self, uuid: str):
        self.message = "'{}' is not a valid UUID.".format(uuid)
        super().__init__(self.message)


class JujuTopology:
    """JujuTopology is used for storing, generating and formatting juju topology information.

    DEPRECATED: This class is deprecated. Use `pip install cosl` and
    `from cosl.juju_topology import JujuTopology` instead.
    """

    def __init__(
        self,
        model: str,
        model_uuid: str,
        application: str,
        unit: Optional[str] = None,
        charm_name: Optional[str] = None,
    ):
        """Build a JujuTopology object.

        A `JujuTopology` object is used for storing and transforming
        Juju topology information. This information is used to
        annotate Prometheus scrape jobs and alert rules. Such
        annotation when applied to scrape jobs helps in identifying
        the source of the scrapped metrics. On the other hand when
        applied to alert rules topology information ensures that
        evaluation of alert expressions is restricted to the source
        (charm) from which the alert rules were obtained.

        Args:
            model: a string name of the Juju model
            model_uuid: a globally unique string identifier for the Juju model
            application: an application name as a string
            unit: a unit name as a string
            charm_name: name of charm as a string
        """
        if not self.is_valid_uuid(model_uuid):
            raise InvalidUUIDError(model_uuid)

        self._model = model
        self._model_uuid = model_uuid
        self._application = application
        self._charm_name = charm_name
        self._unit = unit

    def is_valid_uuid(self, uuid):
        """Validate the supplied UUID against the Juju Model UUID pattern.

        Args:
            uuid: string that needs to be checked if it is valid v4 UUID.

        Returns:
            True if parameter is a valid v4 UUID, False otherwise.
        """
        try:
            return str(UUID(uuid, version=4)) == uuid
        except (ValueError, TypeError):
            return False

    @classmethod
    def from_charm(cls, charm):
        """Creates a JujuTopology instance by using the model data available on a charm object.

        Args:
            charm: a `CharmBase` object for which the `JujuTopology` will be constructed
        Returns:
            a `JujuTopology` object.
        """
        return cls(
            model=charm.model.name,
            model_uuid=charm.model.uuid,
            application=charm.model.app.name,
            unit=charm.model.unit.name,
            charm_name=charm.meta.name,
        )

    @classmethod
    def from_dict(cls, data: dict):
        """Factory method for creating `JujuTopology` children from a dictionary.

        Args:
            data: a dictionary with five keys providing topology information. The keys are
                - "model"
                - "model_uuid"
                - "application"
                - "unit"
                - "charm_name"
                `unit` and `charm_name` may be empty, but will result in more limited
                labels. However, this allows us to support charms without workloads.

        Returns:
            a `JujuTopology` object.
        """
        return cls(
            model=data["model"],
            model_uuid=data["model_uuid"],
            application=data["application"],
            unit=data.get("unit", ""),
            charm_name=data.get("charm_name", ""),
        )

    def as_dict(
        self,
        *,
        remapped_keys: Optional[Dict[str, str]] = None,
        excluded_keys: Optional[List[str]] = None,
    ) -> OrderedDict:
        """Format the topology information into an ordered dict.

        Keeping the dictionary ordered is important to be able to
        compare dicts without having to resort to deep comparisons.

        Args:
            remapped_keys: A dictionary mapping old key names to new key names,
                which will be substituted when invoked.
            excluded_keys: A list of key names to exclude from the returned dict.
            uuid_length: The length to crop the UUID to.
        """
        ret = OrderedDict(
            [
                ("model", self.model),
                ("model_uuid", self.model_uuid),
                ("application", self.application),
                ("unit", self.unit),
                ("charm_name", self.charm_name),
            ]
        )
        if excluded_keys:
            ret = OrderedDict({k: v for k, v in ret.items() if k not in excluded_keys})

        if remapped_keys:
            ret = OrderedDict(
                (remapped_keys.get(k), v) if remapped_keys.get(k) else (k, v) for k, v in ret.items()  # type: ignore
            )

        return ret

    @property
    def identifier(self) -> str:
        """Format the topology information into a terse string.

        This crops the model UUID, making it unsuitable for comparisons against
        anything but other identifiers. Mainly to be used as a display name or file
        name where long strings might become an issue.

        >>> JujuTopology( \
              model = "a-model", \
              model_uuid = "00000000-0000-4000-8000-000000000000", \
              application = "some-app", \
              unit = "some-app/1" \
            ).identifier
        'a-model_00000000_some-app'
        """
        parts = self.as_dict(
            excluded_keys=["unit", "charm_name"],
        )

        parts["model_uuid"] = self.model_uuid_short
        values = parts.values()

        return "_".join([str(val) for val in values]).replace("/", "_")

    @property
    def label_matcher_dict(self) -> Dict[str, str]:
        """Format the topology information into a dict with keys having 'juju_' as prefix.

        Relabelled topology never includes the unit as it would then only match
        the leader unit (ie. the unit that produced the dict).
        """
        items = self.as_dict(
            remapped_keys={"charm_name": "charm"},
            excluded_keys=["unit"],
        ).items()

        return {"juju_{}".format(key): value for key, value in items if value}

    @property
    def label_matchers(self) -> str:
        """Format the topology information into a promql/logql label matcher string.

        Topology label matchers should never include the unit as it
        would then only match the leader unit (ie. the unit that
        produced the matchers).
        """
        items = self.label_matcher_dict.items()
        return ", ".join(['{}="{}"'.format(key, value) for key, value in items if value])

    @property
    def model(self) -> str:
        """Getter for the juju model value."""
        return self._model

    @property
    def model_uuid(self) -> str:
        """Getter for the juju model uuid value."""
        return self._model_uuid

    @property
    def model_uuid_short(self) -> str:
        """Getter for the juju model value, truncated to the first eight letters."""
        return self._model_uuid[:8]

    @property
    def application(self) -> str:
        """Getter for the juju application value."""
        return self._application

    @property
    def charm_name(self) -> Optional[str]:
        """Getter for the juju charm name value."""
        return self._charm_name

    @property
    def unit(self) -> Optional[str]:
        """Getter for the juju unit value."""
        return self._unit
