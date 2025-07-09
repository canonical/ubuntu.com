# Copyright 2023 Canonical Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

r"""Library to manage the relation for the data-platform products.

This library contains the Requires and Provides classes for handling the relation
between an application and multiple managed application supported by the data-team:
MySQL, Postgresql, MongoDB, Redis, and Kafka.

### Database (MySQL, Postgresql, MongoDB, and Redis)

#### Requires Charm
This library is a uniform interface to a selection of common database
metadata, with added custom events that add convenience to database management,
and methods to consume the application related data.


Following an example of using the DatabaseCreatedEvent, in the context of the
application charm code:

```python

from charms.data_platform_libs.v0.data_interfaces import (
    DatabaseCreatedEvent,
    DatabaseRequires,
)

class ApplicationCharm(CharmBase):
    # Application charm that connects to database charms.

    def __init__(self, *args):
        super().__init__(*args)

        # Charm events defined in the database requires charm library.
        self.database = DatabaseRequires(self, relation_name="database", database_name="database")
        self.framework.observe(self.database.on.database_created, self._on_database_created)

    def _on_database_created(self, event: DatabaseCreatedEvent) -> None:
        # Handle the created database

        # Create configuration file for app
        config_file = self._render_app_config_file(
            event.username,
            event.password,
            event.endpoints,
        )

        # Start application with rendered configuration
        self._start_application(config_file)

        # Set active status
        self.unit.status = ActiveStatus("received database credentials")
```

As shown above, the library provides some custom events to handle specific situations,
which are listed below:

-  database_created: event emitted when the requested database is created.
-  endpoints_changed: event emitted when the read/write endpoints of the database have changed.
-  read_only_endpoints_changed: event emitted when the read-only endpoints of the database
  have changed. Event is not triggered if read/write endpoints changed too.

If it is needed to connect multiple database clusters to the same relation endpoint
the application charm can implement the same code as if it would connect to only
one database cluster (like the above code example).

To differentiate multiple clusters connected to the same relation endpoint
the application charm can use the name of the remote application:

```python

def _on_database_created(self, event: DatabaseCreatedEvent) -> None:
    # Get the remote app name of the cluster that triggered this event
    cluster = event.relation.app.name
```

It is also possible to provide an alias for each different database cluster/relation.

So, it is possible to differentiate the clusters in two ways.
The first is to use the remote application name, i.e., `event.relation.app.name`, as above.

The second way is to use different event handlers to handle each cluster events.
The implementation would be something like the following code:

```python

from charms.data_platform_libs.v0.data_interfaces import (
    DatabaseCreatedEvent,
    DatabaseRequires,
)

class ApplicationCharm(CharmBase):
    # Application charm that connects to database charms.

    def __init__(self, *args):
        super().__init__(*args)

        # Define the cluster aliases and one handler for each cluster database created event.
        self.database = DatabaseRequires(
            self,
            relation_name="database",
            database_name="database",
            relations_aliases = ["cluster1", "cluster2"],
        )
        self.framework.observe(
            self.database.on.cluster1_database_created, self._on_cluster1_database_created
        )
        self.framework.observe(
            self.database.on.cluster2_database_created, self._on_cluster2_database_created
        )

    def _on_cluster1_database_created(self, event: DatabaseCreatedEvent) -> None:
        # Handle the created database on the cluster named cluster1

        # Create configuration file for app
        config_file = self._render_app_config_file(
            event.username,
            event.password,
            event.endpoints,
        )
        ...

    def _on_cluster2_database_created(self, event: DatabaseCreatedEvent) -> None:
        # Handle the created database on the cluster named cluster2

        # Create configuration file for app
        config_file = self._render_app_config_file(
            event.username,
            event.password,
            event.endpoints,
        )
        ...

```

When it's needed to check whether a plugin (extension) is enabled on the PostgreSQL
charm, you can use the is_postgresql_plugin_enabled method. To use that, you need to
add the following dependency to your charmcraft.yaml file:

```yaml

parts:
  charm:
    charm-binary-python-packages:
      - psycopg[binary]

```

### Provider Charm

Following an example of using the DatabaseRequestedEvent, in the context of the
database charm code:

```python
from charms.data_platform_libs.v0.data_interfaces import DatabaseProvides

class SampleCharm(CharmBase):

    def __init__(self, *args):
        super().__init__(*args)
        # Charm events defined in the database provides charm library.
        self.provided_database = DatabaseProvides(self, relation_name="database")
        self.framework.observe(self.provided_database.on.database_requested,
            self._on_database_requested)
        # Database generic helper
        self.database = DatabaseHelper()

    def _on_database_requested(self, event: DatabaseRequestedEvent) -> None:
        # Handle the event triggered by a new database requested in the relation
        # Retrieve the database name using the charm library.
        db_name = event.database
        # generate a new user credential
        username = self.database.generate_user()
        password = self.database.generate_password()
        # set the credentials for the relation
        self.provided_database.set_credentials(event.relation.id, username, password)
        # set other variables for the relation event.set_tls("False")
```
As shown above, the library provides a custom event (database_requested) to handle
the situation when an application charm requests a new database to be created.
It's preferred to subscribe to this event instead of relation changed event to avoid
creating a new database when other information other than a database name is
exchanged in the relation databag.

### Kafka

This library is the interface to use and interact with the Kafka charm. This library contains
custom events that add convenience to manage Kafka, and provides methods to consume the
application related data.

#### Requirer Charm

```python

from charms.data_platform_libs.v0.data_interfaces import (
    BootstrapServerChangedEvent,
    KafkaRequires,
    TopicCreatedEvent,
)

class ApplicationCharm(CharmBase):

    def __init__(self, *args):
        super().__init__(*args)
        self.kafka = KafkaRequires(self, "kafka_client", "test-topic")
        self.framework.observe(
            self.kafka.on.bootstrap_server_changed, self._on_kafka_bootstrap_server_changed
        )
        self.framework.observe(
            self.kafka.on.topic_created, self._on_kafka_topic_created
        )

    def _on_kafka_bootstrap_server_changed(self, event: BootstrapServerChangedEvent):
        # Event triggered when a bootstrap server was changed for this application

        new_bootstrap_server = event.bootstrap_server
        ...

    def _on_kafka_topic_created(self, event: TopicCreatedEvent):
        # Event triggered when a topic was created for this application
        username = event.username
        password = event.password
        tls = event.tls
        tls_ca= event.tls_ca
        bootstrap_server event.bootstrap_server
        consumer_group_prefic = event.consumer_group_prefix
        zookeeper_uris = event.zookeeper_uris
        ...

```

As shown above, the library provides some custom events to handle specific situations,
which are listed below:

- topic_created: event emitted when the requested topic is created.
- bootstrap_server_changed: event emitted when the bootstrap server have changed.
- credential_changed: event emitted when the credentials of Kafka changed.

### Provider Charm

Following the previous example, this is an example of the provider charm.

```python
class SampleCharm(CharmBase):

from charms.data_platform_libs.v0.data_interfaces import (
    KafkaProvides,
    TopicRequestedEvent,
)

    def __init__(self, *args):
        super().__init__(*args)

        # Default charm events.
        self.framework.observe(self.on.start, self._on_start)

        # Charm events defined in the Kafka Provides charm library.
        self.kafka_provider = KafkaProvides(self, relation_name="kafka_client")
        self.framework.observe(self.kafka_provider.on.topic_requested, self._on_topic_requested)
        # Kafka generic helper
        self.kafka = KafkaHelper()

    def _on_topic_requested(self, event: TopicRequestedEvent):
        # Handle the on_topic_requested event.

        topic = event.topic
        relation_id = event.relation.id
        # set connection info in the databag relation
        self.kafka_provider.set_bootstrap_server(relation_id, self.kafka.get_bootstrap_server())
        self.kafka_provider.set_credentials(relation_id, username=username, password=password)
        self.kafka_provider.set_consumer_group_prefix(relation_id, ...)
        self.kafka_provider.set_tls(relation_id, "False")
        self.kafka_provider.set_zookeeper_uris(relation_id, ...)

```
As shown above, the library provides a custom event (topic_requested) to handle
the situation when an application charm requests a new topic to be created.
It is preferred to subscribe to this event instead of relation changed event to avoid
creating a new topic when other information other than a topic name is
exchanged in the relation databag.
"""

import copy
import json
import logging
from abc import ABC, abstractmethod
from collections import UserDict, namedtuple
from datetime import datetime
from enum import Enum
from typing import (
    Callable,
    Dict,
    ItemsView,
    KeysView,
    List,
    Optional,
    Set,
    Tuple,
    Union,
    ValuesView,
)

from ops import JujuVersion, Model, Secret, SecretInfo, SecretNotFoundError
from ops.charm import (
    CharmBase,
    CharmEvents,
    RelationChangedEvent,
    RelationCreatedEvent,
    RelationEvent,
    SecretChangedEvent,
)
from ops.framework import EventSource, Object
from ops.model import Application, ModelError, Relation, Unit

# The unique Charmhub library identifier, never change it
LIBID = "6c3e6b6680d64e9c89e611d1a15f65be"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 48

PYDEPS = ["ops>=2.0.0"]

# Starting from what LIBPATCH number to apply legacy solutions
# v0.17 was the last version without secrets
LEGACY_SUPPORT_FROM = 17

logger = logging.getLogger(__name__)

Diff = namedtuple("Diff", "added changed deleted")
Diff.__doc__ = """
A tuple for storing the diff between two data mappings.

added - keys that were added
changed - keys that still exist but have new values
deleted - key that were deleted"""


PROV_SECRET_PREFIX = "secret-"
PROV_SECRET_FIELDS = "provided-secrets"
REQ_SECRET_FIELDS = "requested-secrets"
GROUP_MAPPING_FIELD = "secret_group_mapping"
GROUP_SEPARATOR = "@"

MODEL_ERRORS = {
    "not_leader": "this unit is not the leader",
    "no_label_and_uri": "ERROR either URI or label should be used for getting an owned secret but not both",
    "owner_no_refresh": "ERROR secret owner cannot use --refresh",
}


##############################################################################
# Exceptions
##############################################################################


class DataInterfacesError(Exception):
    """Common ancestor for DataInterfaces related exceptions."""


class SecretError(DataInterfacesError):
    """Common ancestor for Secrets related exceptions."""


class SecretAlreadyExistsError(SecretError):
    """A secret that was to be added already exists."""


class SecretsUnavailableError(SecretError):
    """Secrets aren't yet available for Juju version used."""


class SecretsIllegalUpdateError(SecretError):
    """Secrets aren't yet available for Juju version used."""


class IllegalOperationError(DataInterfacesError):
    """To be used when an operation is not allowed to be performed."""


class PrematureDataAccessError(DataInterfacesError):
    """To be raised when the Relation Data may be accessed (written) before protocol init complete."""


##############################################################################
# Global helpers / utilities
##############################################################################

##############################################################################
# Databag handling and comparison methods
##############################################################################


def get_encoded_dict(
    relation: Relation, member: Union[Unit, Application], field: str
) -> Optional[Dict[str, str]]:
    """Retrieve and decode an encoded field from relation data."""
    data = json.loads(relation.data[member].get(field, "{}"))
    if isinstance(data, dict):
        return data
    logger.error("Unexpected datatype for %s instead of dict.", str(data))


def get_encoded_list(
    relation: Relation, member: Union[Unit, Application], field: str
) -> Optional[List[str]]:
    """Retrieve and decode an encoded field from relation data."""
    data = json.loads(relation.data[member].get(field, "[]"))
    if isinstance(data, list):
        return data
    logger.error("Unexpected datatype for %s instead of list.", str(data))


def set_encoded_field(
    relation: Relation,
    member: Union[Unit, Application],
    field: str,
    value: Union[str, list, Dict[str, str]],
) -> None:
    """Set an encoded field from relation data."""
    relation.data[member].update({field: json.dumps(value)})


def diff(event: RelationChangedEvent, bucket: Optional[Union[Unit, Application]]) -> Diff:
    """Retrieves the diff of the data in the relation changed databag.

    Args:
        event: relation changed event.
        bucket: bucket of the databag (app or unit)

    Returns:
        a Diff instance containing the added, deleted and changed
            keys from the event relation databag.
    """
    # Retrieve the old data from the data key in the application relation databag.
    if not bucket:
        return Diff([], [], [])

    old_data = get_encoded_dict(event.relation, bucket, "data")

    if not old_data:
        old_data = {}

    # Retrieve the new data from the event relation databag.
    new_data = (
        {key: value for key, value in event.relation.data[event.app].items() if key != "data"}
        if event.app
        else {}
    )

    # These are the keys that were added to the databag and triggered this event.
    added = new_data.keys() - old_data.keys()  # pyright: ignore [reportAssignmentType]
    # These are the keys that were removed from the databag and triggered this event.
    deleted = old_data.keys() - new_data.keys()  # pyright: ignore [reportAssignmentType]
    # These are the keys that already existed in the databag,
    # but had their values changed.
    changed = {
        key
        for key in old_data.keys() & new_data.keys()  # pyright: ignore [reportAssignmentType]
        if old_data[key] != new_data[key]  # pyright: ignore [reportAssignmentType]
    }
    # Convert the new_data to a serializable format and save it for a next diff check.
    set_encoded_field(event.relation, bucket, "data", new_data)

    # Return the diff with all possible changes.
    return Diff(added, changed, deleted)


##############################################################################
# Module decorators
##############################################################################


def leader_only(f):
    """Decorator to ensure that only leader can perform given operation."""

    def wrapper(self, *args, **kwargs):
        if self.component == self.local_app and not self.local_unit.is_leader():
            logger.error(
                "This operation (%s()) can only be performed by the leader unit", f.__name__
            )
            return
        return f(self, *args, **kwargs)

    wrapper.leader_only = True
    return wrapper


def juju_secrets_only(f):
    """Decorator to ensure that certain operations would be only executed on Juju3."""

    def wrapper(self, *args, **kwargs):
        if not self.secrets_enabled:
            raise SecretsUnavailableError("Secrets unavailable on current Juju version")
        return f(self, *args, **kwargs)

    return wrapper


def dynamic_secrets_only(f):
    """Decorator to ensure that certain operations would be only executed when NO static secrets are defined."""

    def wrapper(self, *args, **kwargs):
        if self.static_secret_fields:
            raise IllegalOperationError(
                "Unsafe usage of statically and dynamically defined secrets, aborting."
            )
        return f(self, *args, **kwargs)

    return wrapper


def either_static_or_dynamic_secrets(f):
    """Decorator to ensure that static and dynamic secrets won't be used in parallel."""

    def wrapper(self, *args, **kwargs):
        if self.static_secret_fields and set(self.current_secret_fields) - set(
            self.static_secret_fields
        ):
            raise IllegalOperationError(
                "Unsafe usage of statically and dynamically defined secrets, aborting."
            )
        return f(self, *args, **kwargs)

    return wrapper


def legacy_apply_from_version(version: int) -> Callable:
    """Decorator to decide whether to apply a legacy function or not.

    Based on LEGACY_SUPPORT_FROM module variable value, the importer charm may only want
    to apply legacy solutions starting from a specific LIBPATCH.

    NOTE: All 'legacy' functions have to be defined and called in a way that they return `None`.
    This results in cleaner and more secure execution flows in case the function may be disabled.
    This requirement implicitly means that legacy functions change the internal state strictly,
    don't return information.
    """

    def decorator(f: Callable[..., None]):
        """Signature is ensuring None return value."""
        f.legacy_version = version

        def wrapper(self, *args, **kwargs) -> None:
            if version >= LEGACY_SUPPORT_FROM:
                return f(self, *args, **kwargs)

        return wrapper

    return decorator


##############################################################################
# Helper classes
##############################################################################


class Scope(Enum):
    """Peer relations scope."""

    APP = "app"
    UNIT = "unit"


class SecretGroup(str):
    """Secret groups specific type."""


class SecretGroupsAggregate(str):
    """Secret groups with option to extend with additional constants."""

    def __init__(self):
        self.USER = SecretGroup("user")
        self.TLS = SecretGroup("tls")
        self.MTLS = SecretGroup("mtls")
        self.EXTRA = SecretGroup("extra")

    def __setattr__(self, name, value):
        """Setting internal constants."""
        if name in self.__dict__:
            raise RuntimeError("Can't set constant!")
        else:
            super().__setattr__(name, SecretGroup(value))

    def groups(self) -> list:
        """Return the list of stored SecretGroups."""
        return list(self.__dict__.values())

    def get_group(self, group: str) -> Optional[SecretGroup]:
        """If the input str translates to a group name, return that."""
        return SecretGroup(group) if group in self.groups() else None


SECRET_GROUPS = SecretGroupsAggregate()


class CachedSecret:
    """Locally cache a secret.

    The data structure is precisely reusing/simulating as in the actual Secret Storage
    """

    KNOWN_MODEL_ERRORS = [MODEL_ERRORS["no_label_and_uri"], MODEL_ERRORS["owner_no_refresh"]]

    def __init__(
        self,
        model: Model,
        component: Union[Application, Unit],
        label: str,
        secret_uri: Optional[str] = None,
        legacy_labels: List[str] = [],
    ):
        self._secret_meta = None
        self._secret_content = {}
        self._secret_uri = secret_uri
        self.label = label
        self._model = model
        self.component = component
        self.legacy_labels = legacy_labels
        self.current_label = None

    @property
    def meta(self) -> Optional[Secret]:
        """Getting cached secret meta-information."""
        if not self._secret_meta:
            if not (self._secret_uri or self.label):
                return

            try:
                self._secret_meta = self._model.get_secret(label=self.label)
            except SecretNotFoundError:
                # Falling back to seeking for potential legacy labels
                self._legacy_compat_find_secret_by_old_label()

            # If still not found, to be checked by URI, to be labelled with the proposed label
            if not self._secret_meta and self._secret_uri:
                self._secret_meta = self._model.get_secret(id=self._secret_uri, label=self.label)
        return self._secret_meta

    ##########################################################################
    # Backwards compatibility / Upgrades
    ##########################################################################
    # These functions are used to keep backwards compatibility on rolling upgrades
    # Policy:
    # All data is kept intact until the first write operation. (This allows a minimal
    # grace period during which rollbacks are fully safe. For more info see the spec.)
    # All data involves:
    #   - databag contents
    #   - secrets content
    #   - secret labels (!!!)
    # Legacy functions must return None, and leave an equally consistent state whether
    # they are executed or skipped (as a high enough versioned execution environment may
    # not require so)

    # Compatibility

    @legacy_apply_from_version(34)
    def _legacy_compat_find_secret_by_old_label(self) -> None:
        """Compatibility function, allowing to find a secret by a legacy label.

        This functionality is typically needed when secret labels changed over an upgrade.
        Until the first write operation, we need to maintain data as it was, including keeping
        the old secret label. In order to keep track of the old label currently used to access
        the secret, and additional 'current_label' field is being defined.
        """
        for label in self.legacy_labels:
            try:
                self._secret_meta = self._model.get_secret(label=label)
            except SecretNotFoundError:
                pass
            else:
                if label != self.label:
                    self.current_label = label
                return

    # Migrations

    @legacy_apply_from_version(34)
    def _legacy_migration_to_new_label_if_needed(self) -> None:
        """Helper function to re-create the secret with a different label.

        Juju does not provide a way to change secret labels.
        Thus whenever moving from secrets version that involves secret label changes,
        we "re-create" the existing secret, and attach the new label to the new
        secret, to be used from then on.

        Note: we replace the old secret with a new one "in place", as we can't
        easily switch the containing SecretCache structure to point to a new secret.
        Instead we are changing the 'self' (CachedSecret) object to point to the
        new instance.
        """
        if not self.current_label or not (self.meta and self._secret_meta):
            return

        # Create a new secret with the new label
        content = self._secret_meta.get_content()
        self._secret_uri = None

        # It will be nice to have the possibility to check if we are the owners of the secret...
        try:
            self._secret_meta = self.add_secret(content, label=self.label)
        except ModelError as err:
            if MODEL_ERRORS["not_leader"] not in str(err):
                raise
        self.current_label = None

    ##########################################################################
    # Public functions
    ##########################################################################

    def add_secret(
        self,
        content: Dict[str, str],
        relation: Optional[Relation] = None,
        label: Optional[str] = None,
    ) -> Secret:
        """Create a new secret."""
        if self._secret_uri:
            raise SecretAlreadyExistsError(
                "Secret is already defined with uri %s", self._secret_uri
            )

        label = self.label if not label else label

        secret = self.component.add_secret(content, label=label)
        if relation and relation.app != self._model.app:
            # If it's not a peer relation, grant is to be applied
            secret.grant(relation)
        self._secret_uri = secret.id
        self._secret_meta = secret
        return self._secret_meta

    def get_content(self) -> Dict[str, str]:
        """Getting cached secret content."""
        if not self._secret_content:
            if self.meta:
                try:
                    self._secret_content = self.meta.get_content(refresh=True)
                except (ValueError, ModelError) as err:
                    # https://bugs.launchpad.net/juju/+bug/2042596
                    # Only triggered when 'refresh' is set
                    if isinstance(err, ModelError) and not any(
                        msg in str(err) for msg in self.KNOWN_MODEL_ERRORS
                    ):
                        raise
                    # Due to: ValueError: Secret owner cannot use refresh=True
                    self._secret_content = self.meta.get_content()
        return self._secret_content

    def set_content(self, content: Dict[str, str]) -> None:
        """Setting cached secret content."""
        if not self.meta:
            return

        # DPE-4182: do not create new revision if the content stay the same
        if content == self.get_content():
            return

        if content:
            self._legacy_migration_to_new_label_if_needed()
            self.meta.set_content(content)
            self._secret_content = content
        else:
            self.meta.remove_all_revisions()

    def get_info(self) -> Optional[SecretInfo]:
        """Wrapper function to apply the corresponding call on the Secret object within CachedSecret if any."""
        if self.meta:
            return self.meta.get_info()

    def remove(self) -> None:
        """Remove secret."""
        if not self.meta:
            raise SecretsUnavailableError("Non-existent secret was attempted to be removed.")
        try:
            self.meta.remove_all_revisions()
        except SecretNotFoundError:
            pass
        self._secret_content = {}
        self._secret_meta = None
        self._secret_uri = None


class SecretCache:
    """A data structure storing CachedSecret objects."""

    def __init__(self, model: Model, component: Union[Application, Unit]):
        self._model = model
        self.component = component
        self._secrets: Dict[str, CachedSecret] = {}

    def get(
        self, label: str, uri: Optional[str] = None, legacy_labels: List[str] = []
    ) -> Optional[CachedSecret]:
        """Getting a secret from Juju Secret store or cache."""
        if not self._secrets.get(label):
            secret = CachedSecret(
                self._model, self.component, label, uri, legacy_labels=legacy_labels
            )
            if secret.meta:
                self._secrets[label] = secret
        return self._secrets.get(label)

    def add(self, label: str, content: Dict[str, str], relation: Relation) -> CachedSecret:
        """Adding a secret to Juju Secret."""
        if self._secrets.get(label):
            raise SecretAlreadyExistsError(f"Secret {label} already exists")

        secret = CachedSecret(self._model, self.component, label)
        secret.add_secret(content, relation)
        self._secrets[label] = secret
        return self._secrets[label]

    def remove(self, label: str) -> None:
        """Remove a secret from the cache."""
        if secret := self.get(label):
            try:
                secret.remove()
                self._secrets.pop(label)
            except (SecretsUnavailableError, KeyError):
                pass
            else:
                return
        logging.debug("Non-existing Juju Secret was attempted to be removed %s", label)


################################################################################
# Relation Data base/abstract ancestors (i.e. parent classes)
################################################################################


# Base Data


class DataDict(UserDict):
    """Python Standard Library 'dict' - like representation of Relation Data."""

    def __init__(self, relation_data: "Data", relation_id: int):
        self.relation_data = relation_data
        self.relation_id = relation_id

    @property
    def data(self) -> Dict[str, str]:
        """Return the full content of the Abstract Relation Data dictionary."""
        result = self.relation_data.fetch_my_relation_data([self.relation_id])
        try:
            result_remote = self.relation_data.fetch_relation_data([self.relation_id])
        except NotImplementedError:
            result_remote = {self.relation_id: {}}
        if result:
            result_remote[self.relation_id].update(result[self.relation_id])
        return result_remote.get(self.relation_id, {})

    def __setitem__(self, key: str, item: str) -> None:
        """Set an item of the Abstract Relation Data dictionary."""
        self.relation_data.update_relation_data(self.relation_id, {key: item})

    def __getitem__(self, key: str) -> str:
        """Get an item of the Abstract Relation Data dictionary."""
        result = None

        # Avoiding "leader_only" error when cross-charm non-leader unit, not to report useless error
        if (
            not hasattr(self.relation_data.fetch_my_relation_field, "leader_only")
            or self.relation_data.component != self.relation_data.local_app
            or self.relation_data.local_unit.is_leader()
        ):
            result = self.relation_data.fetch_my_relation_field(self.relation_id, key)

        if not result:
            try:
                result = self.relation_data.fetch_relation_field(self.relation_id, key)
            except NotImplementedError:
                pass

        if not result:
            raise KeyError
        return result

    def __eq__(self, d: dict) -> bool:
        """Equality."""
        return self.data == d

    def __repr__(self) -> str:
        """String representation Abstract Relation Data dictionary."""
        return repr(self.data)

    def __len__(self) -> int:
        """Length of the Abstract Relation Data dictionary."""
        return len(self.data)

    def __delitem__(self, key: str) -> None:
        """Delete an item of the Abstract Relation Data dictionary."""
        self.relation_data.delete_relation_data(self.relation_id, [key])

    def has_key(self, key: str) -> bool:
        """Does the key exist in the Abstract Relation Data dictionary?"""
        return key in self.data

    def update(self, items: Dict[str, str]):
        """Update the Abstract Relation Data dictionary."""
        self.relation_data.update_relation_data(self.relation_id, items)

    def keys(self) -> KeysView[str]:
        """Keys of the Abstract Relation Data dictionary."""
        return self.data.keys()

    def values(self) -> ValuesView[str]:
        """Values of the Abstract Relation Data dictionary."""
        return self.data.values()

    def items(self) -> ItemsView[str, str]:
        """Items of the Abstract Relation Data dictionary."""
        return self.data.items()

    def pop(self, item: str) -> str:
        """Pop an item of the Abstract Relation Data dictionary."""
        result = self.relation_data.fetch_my_relation_field(self.relation_id, item)
        if not result:
            raise KeyError(f"Item {item} doesn't exist.")
        self.relation_data.delete_relation_data(self.relation_id, [item])
        return result

    def __contains__(self, item: str) -> bool:
        """Does the Abstract Relation Data dictionary contain item?"""
        return item in self.data.values()

    def __iter__(self):
        """Iterate through the Abstract Relation Data dictionary."""
        return iter(self.data)

    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Safely get an item of the Abstract Relation Data dictionary."""
        try:
            if result := self[key]:
                return result
        except KeyError:
            return default


class Data(ABC):
    """Base relation data mainpulation (abstract) class."""

    SCOPE = Scope.APP

    # Local map to associate mappings with secrets potentially as a group
    SECRET_LABEL_MAP = {
        "username": SECRET_GROUPS.USER,
        "password": SECRET_GROUPS.USER,
        "uris": SECRET_GROUPS.USER,
        "read-only-uris": SECRET_GROUPS.USER,
        "tls": SECRET_GROUPS.TLS,
        "tls-ca": SECRET_GROUPS.TLS,
        "mtls-cert": SECRET_GROUPS.MTLS,
    }

    SECRET_FIELDS = []

    def __init__(
        self,
        model: Model,
        relation_name: str,
    ) -> None:
        self._model = model
        self.local_app = self._model.app
        self.local_unit = self._model.unit
        self.relation_name = relation_name
        self._jujuversion = None
        self.component = self.local_app if self.SCOPE == Scope.APP else self.local_unit
        self.secrets = SecretCache(self._model, self.component)
        self.data_component = None
        self._local_secret_fields = []
        self._remote_secret_fields = list(self.SECRET_FIELDS)

    @property
    def relations(self) -> List[Relation]:
        """The list of Relation instances associated with this relation_name."""
        return self._model.relations[self.relation_name]

    @property
    def secrets_enabled(self):
        """Is this Juju version allowing for Secrets usage?"""
        if not self._jujuversion:
            self._jujuversion = JujuVersion.from_environ()
        return self._jujuversion.has_secrets

    @property
    def secret_label_map(self):
        """Exposing secret-label map via a property -- could be overridden in descendants!"""
        return self.SECRET_LABEL_MAP

    @property
    def local_secret_fields(self) -> Optional[List[str]]:
        """Local access to secrets field, in case they are being used."""
        if self.secrets_enabled:
            return self._local_secret_fields

    @property
    def remote_secret_fields(self) -> Optional[List[str]]:
        """Local access to secrets field, in case they are being used."""
        if self.secrets_enabled:
            return self._remote_secret_fields

    @property
    def my_secret_groups(self) -> Optional[List[SecretGroup]]:
        """Local access to secrets field, in case they are being used."""
        if self.secrets_enabled:
            return [
                self.SECRET_LABEL_MAP[field]
                for field in self._local_secret_fields
                if field in self.SECRET_LABEL_MAP
            ]

    # Mandatory overrides for internal/helper methods

    @juju_secrets_only
    def _get_relation_secret(
        self, relation_id: int, group_mapping: SecretGroup, relation_name: Optional[str] = None
    ) -> Optional[CachedSecret]:
        """Retrieve a Juju Secret that's been stored in the relation databag."""
        if not relation_name:
            relation_name = self.relation_name

        label = self._generate_secret_label(relation_name, relation_id, group_mapping)
        if secret := self.secrets.get(label):
            return secret

        relation = self._model.get_relation(relation_name, relation_id)
        if not relation:
            return

        if secret_uri := self.get_secret_uri(relation, group_mapping):
            return self.secrets.get(label, secret_uri)

    # Mandatory overrides for requirer and peer, implemented for Provider
    # Requirer uses local component and switched keys
    # _local_secret_fields -> PROV_SECRET_FIELDS
    # _remote_secret_fields -> REQ_SECRET_FIELDS
    # provider uses remote component and
    # _local_secret_fields -> REQ_SECRET_FIELDS
    # _remote_secret_fields -> PROV_SECRET_FIELDS
    @abstractmethod
    def _load_secrets_from_databag(self, relation: Relation) -> None:
        """Load secrets from the databag."""
        raise NotImplementedError

    def _fetch_specific_relation_data(
        self, relation: Relation, fields: Optional[List[str]]
    ) -> Dict[str, str]:
        """Fetch data available (directily or indirectly -- i.e. secrets) from the relation (remote app data)."""
        if not relation.app:
            return {}
        self._load_secrets_from_databag(relation)
        return self._fetch_relation_data_with_secrets(
            relation.app, self.remote_secret_fields, relation, fields
        )

    def _fetch_my_specific_relation_data(
        self, relation: Relation, fields: Optional[List[str]]
    ) -> dict:
        """Fetch our own relation data."""
        # load secrets
        self._load_secrets_from_databag(relation)
        return self._fetch_relation_data_with_secrets(
            self.local_app,
            self.local_secret_fields,
            relation,
            fields,
        )

    def _update_relation_data(self, relation: Relation, data: Dict[str, str]) -> None:
        """Set values for fields not caring whether it's a secret or not."""
        self._load_secrets_from_databag(relation)

        _, normal_fields = self._process_secret_fields(
            relation,
            self.local_secret_fields,
            list(data),
            self._add_or_update_relation_secrets,
            data=data,
        )

        normal_content = {k: v for k, v in data.items() if k in normal_fields}
        self._update_relation_data_without_secrets(self.local_app, relation, normal_content)

    def _add_or_update_relation_secrets(
        self,
        relation: Relation,
        group: SecretGroup,
        secret_fields: Set[str],
        data: Dict[str, str],
        uri_to_databag=True,
    ) -> bool:
        """Update contents for Secret group. If the Secret doesn't exist, create it."""
        if self._get_relation_secret(relation.id, group):
            return self._update_relation_secret(relation, group, secret_fields, data)

        return self._add_relation_secret(relation, group, secret_fields, data, uri_to_databag)

    @juju_secrets_only
    def _add_relation_secret(
        self,
        relation: Relation,
        group_mapping: SecretGroup,
        secret_fields: Set[str],
        data: Dict[str, str],
        uri_to_databag=True,
    ) -> bool:
        """Add a new Juju Secret that will be registered in the relation databag."""
        if uri_to_databag and self.get_secret_uri(relation, group_mapping):
            logging.error("Secret for relation %s already exists, not adding again", relation.id)
            return False

        content = self._content_for_secret_group(data, secret_fields, group_mapping)

        label = self._generate_secret_label(self.relation_name, relation.id, group_mapping)
        secret = self.secrets.add(label, content, relation)

        if uri_to_databag:
            # According to lint we may not have a Secret ID
            if not secret.meta or not secret.meta.id:
                logging.error("Secret is missing Secret ID")
                raise SecretError("Secret added but is missing Secret ID")

            self.set_secret_uri(relation, group_mapping, secret.meta.id)

        # Return the content that was added
        return True

    @juju_secrets_only
    def _update_relation_secret(
        self,
        relation: Relation,
        group_mapping: SecretGroup,
        secret_fields: Set[str],
        data: Dict[str, str],
    ) -> bool:
        """Update the contents of an existing Juju Secret, referred in the relation databag."""
        secret = self._get_relation_secret(relation.id, group_mapping)

        if not secret:
            logging.error("Can't update secret for relation %s", relation.id)
            return False

        content = self._content_for_secret_group(data, secret_fields, group_mapping)

        old_content = secret.get_content()
        full_content = copy.deepcopy(old_content)
        full_content.update(content)
        secret.set_content(full_content)

        # Return True on success
        return True

    @juju_secrets_only
    def _delete_relation_secret(
        self, relation: Relation, group: SecretGroup, secret_fields: List[str], fields: List[str]
    ) -> bool:
        """Update the contents of an existing Juju Secret, referred in the relation databag."""
        secret = self._get_relation_secret(relation.id, group)

        if not secret:
            logging.error("Can't delete secret for relation %s", str(relation.id))
            return False

        old_content = secret.get_content()
        new_content = copy.deepcopy(old_content)
        for field in fields:
            try:
                new_content.pop(field)
            except KeyError:
                logging.debug(
                    "Non-existing secret was attempted to be removed %s, %s",
                    str(relation.id),
                    str(field),
                )
                return False

        # Remove secret from the relation if it's fully gone
        if not new_content:
            field = self._generate_secret_field_name(group)
            try:
                relation.data[self.component].pop(field)
            except KeyError:
                pass
            label = self._generate_secret_label(self.relation_name, relation.id, group)
            self.secrets.remove(label)
        else:
            secret.set_content(new_content)

        # Return the content that was removed
        return True

    def _delete_relation_data(self, relation: Relation, fields: List[str]) -> None:
        """Delete data available (directily or indirectly -- i.e. secrets) from the relation for owner/this_app."""
        if relation.app:
            self._load_secrets_from_databag(relation)

        _, normal_fields = self._process_secret_fields(
            relation, self.local_secret_fields, fields, self._delete_relation_secret, fields=fields
        )
        self._delete_relation_data_without_secrets(self.local_app, relation, list(normal_fields))

    def _register_secret_to_relation(
        self, relation_name: str, relation_id: int, secret_id: str, group: SecretGroup
    ):
        """Fetch secrets and apply local label on them.

        [MAGIC HERE]
        If we fetch a secret using get_secret(id=<ID>, label=<arbitraty_label>),
        then <arbitraty_label> will be "stuck" on the Secret object, whenever it may
        appear (i.e. as an event attribute, or fetched manually) on future occasions.

        This will allow us to uniquely identify the secret on Provider side (typically on
        'secret-changed' events), and map it to the corresponding relation.
        """
        label = self._generate_secret_label(relation_name, relation_id, group)

        # Fetching the Secret's meta information ensuring that it's locally getting registered with
        CachedSecret(self._model, self.component, label, secret_id).meta

    def _register_secrets_to_relation(self, relation: Relation, params_name_list: List[str]):
        """Make sure that secrets of the provided list are locally 'registered' from the databag.

        More on 'locally registered' magic is described in _register_secret_to_relation() method
        """
        if not relation.app:
            return

        for group in SECRET_GROUPS.groups():
            secret_field = self._generate_secret_field_name(group)
            if secret_field in params_name_list and (
                secret_uri := self.get_secret_uri(relation, group)
            ):
                self._register_secret_to_relation(relation.name, relation.id, secret_uri, group)

    # Optional overrides

    def _legacy_apply_on_fetch(self) -> None:
        """This function should provide a list of compatibility functions to be applied when fetching (legacy) data."""
        pass

    def _legacy_apply_on_update(self, fields: List[str]) -> None:
        """This function should provide a list of compatibility functions to be applied when writing data.

        Since data may be at a legacy version, migration may be mandatory.
        """
        pass

    def _legacy_apply_on_delete(self, fields: List[str]) -> None:
        """This function should provide a list of compatibility functions to be applied when deleting (legacy) data."""
        pass

    # Internal helper methods

    @staticmethod
    def _is_secret_field(field: str) -> bool:
        """Is the field in question a secret reference (URI) field or not?"""
        return field.startswith(PROV_SECRET_PREFIX)

    @staticmethod
    def _generate_secret_label(
        relation_name: str, relation_id: int, group_mapping: SecretGroup
    ) -> str:
        """Generate unique group_mappings for secrets within a relation context."""
        return f"{relation_name}.{relation_id}.{group_mapping}.secret"

    def _generate_secret_field_name(self, group_mapping: SecretGroup) -> str:
        """Generate unique group_mappings for secrets within a relation context."""
        return f"{PROV_SECRET_PREFIX}{group_mapping}"

    def _relation_from_secret_label(self, secret_label: str) -> Optional[Relation]:
        """Retrieve the relation that belongs to a secret label."""
        contents = secret_label.split(".")

        if not (contents and len(contents) >= 3):
            return

        contents.pop()  # ".secret" at the end
        contents.pop()  # Group mapping
        relation_id = contents.pop()
        try:
            relation_id = int(relation_id)
        except ValueError:
            return

        # In case '.' character appeared in relation name
        relation_name = ".".join(contents)

        try:
            return self.get_relation(relation_name, relation_id)
        except ModelError:
            return

    def _group_secret_fields(self, secret_fields: List[str]) -> Dict[SecretGroup, List[str]]:
        """Helper function to arrange secret mappings under their group.

        NOTE: All unrecognized items end up in the 'extra' secret bucket.
        Make sure only secret fields are passed!
        """
        secret_fieldnames_grouped = {}
        for key in secret_fields:
            if group := self.secret_label_map.get(key):
                secret_fieldnames_grouped.setdefault(group, []).append(key)
            else:
                secret_fieldnames_grouped.setdefault(SECRET_GROUPS.EXTRA, []).append(key)
        return secret_fieldnames_grouped

    def _get_group_secret_contents(
        self,
        relation: Relation,
        group: SecretGroup,
        secret_fields: Union[Set[str], List[str]] = [],
    ) -> Dict[str, str]:
        """Helper function to retrieve collective, requested contents of a secret."""
        if (secret := self._get_relation_secret(relation.id, group)) and (
            secret_data := secret.get_content()
        ):
            return {
                k: v for k, v in secret_data.items() if not secret_fields or k in secret_fields
            }
        return {}

    def _content_for_secret_group(
        self, content: Dict[str, str], secret_fields: Set[str], group_mapping: SecretGroup
    ) -> Dict[str, str]:
        """Select <field>: <value> pairs from input, that belong to this particular Secret group."""
        if group_mapping == SECRET_GROUPS.EXTRA:
            return {
                k: v
                for k, v in content.items()
                if k in secret_fields and k not in self.secret_label_map.keys()
            }

        return {
            k: v
            for k, v in content.items()
            if k in secret_fields and self.secret_label_map.get(k) == group_mapping
        }

    @juju_secrets_only
    def _get_relation_secret_data(
        self, relation_id: int, group_mapping: SecretGroup, relation_name: Optional[str] = None
    ) -> Optional[Dict[str, str]]:
        """Retrieve contents of a Juju Secret that's been stored in the relation databag."""
        secret = self._get_relation_secret(relation_id, group_mapping, relation_name)
        if secret:
            return secret.get_content()

    # Core operations on Relation Fields manipulations (regardless whether the field is in the databag or in a secret)
    # Internal functions to be called directly from transparent public interface functions (+closely related helpers)

    def _process_secret_fields(
        self,
        relation: Relation,
        req_secret_fields: Optional[List[str]],
        impacted_rel_fields: List[str],
        operation: Callable,
        *args,
        **kwargs,
    ) -> Tuple[Dict[str, str], Set[str]]:
        """Isolate target secret fields of manipulation, and execute requested operation by Secret Group."""
        result = {}

        # If the relation started on a databag, we just stay on the databag
        # (Rolling upgrades may result in a relation starting on databag, getting secrets enabled on-the-fly)
        # self.local_app is sufficient to check (ignored if Requires, never has secrets -- works if Provider)
        fallback_to_databag = (
            req_secret_fields
            and (self.local_unit == self._model.unit and self.local_unit.is_leader())
            and set(req_secret_fields) & set(relation.data[self.component])
        )
        normal_fields = set(impacted_rel_fields)
        if req_secret_fields and self.secrets_enabled and not fallback_to_databag:
            normal_fields = normal_fields - set(req_secret_fields)
            secret_fields = set(impacted_rel_fields) - set(normal_fields)

            secret_fieldnames_grouped = self._group_secret_fields(list(secret_fields))

            for group in secret_fieldnames_grouped:
                # operation() should return nothing when all goes well
                if group_result := operation(relation, group, secret_fields, *args, **kwargs):
                    # If "meaningful" data was returned, we take it. (Some 'operation'-s only return success/failure.)
                    if isinstance(group_result, dict):
                        result.update(group_result)
                else:
                    # If it wasn't found as a secret, let's give it a 2nd chance as "normal" field
                    # Needed when Juju3 Requires meets Juju2 Provider
                    normal_fields |= set(secret_fieldnames_grouped[group])
        return (result, normal_fields)

    def _fetch_relation_data_without_secrets(
        self, component: Union[Application, Unit], relation: Relation, fields: Optional[List[str]]
    ) -> Dict[str, str]:
        """Fetching databag contents when no secrets are involved.

        Since the Provider's databag is the only one holding secrest, we can apply
        a simplified workflow to read the Require's side's databag.
        This is used typically when the Provider side wants to read the Requires side's data,
        or when the Requires side may want to read its own data.
        """
        if component not in relation.data or not relation.data[component]:
            return {}

        if fields:
            return {
                k: relation.data[component][k] for k in fields if k in relation.data[component]
            }
        else:
            return dict(relation.data[component])

    def _fetch_relation_data_with_secrets(
        self,
        component: Union[Application, Unit],
        req_secret_fields: Optional[List[str]],
        relation: Relation,
        fields: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """Fetching databag contents when secrets may be involved.

        This function has internal logic to resolve if a requested field may be "hidden"
        within a Relation Secret, or directly available as a databag field. Typically
        used to read the Provider side's databag (eigher by the Requires side, or by
        Provider side itself).
        """
        result = {}
        normal_fields = []

        if not fields:
            if component not in relation.data:
                return {}

            all_fields = list(relation.data[component].keys())
            normal_fields = [field for field in all_fields if not self._is_secret_field(field)]
            fields = normal_fields + req_secret_fields if req_secret_fields else normal_fields

        if fields:
            result, normal_fields = self._process_secret_fields(
                relation, req_secret_fields, fields, self._get_group_secret_contents
            )

        # Processing "normal" fields. May include leftover from what we couldn't retrieve as a secret.
        # (Typically when Juju3 Requires meets Juju2 Provider)
        if normal_fields:
            result.update(
                self._fetch_relation_data_without_secrets(component, relation, list(normal_fields))
            )
        return result

    def _update_relation_data_without_secrets(
        self, component: Union[Application, Unit], relation: Relation, data: Dict[str, str]
    ) -> None:
        """Updating databag contents when no secrets are involved."""
        if component not in relation.data or relation.data[component] is None:
            return

        if relation:
            relation.data[component].update(data)

    def _delete_relation_data_without_secrets(
        self, component: Union[Application, Unit], relation: Relation, fields: List[str]
    ) -> None:
        """Remove databag fields 'fields' from Relation."""
        if component not in relation.data or relation.data[component] is None:
            return

        for field in fields:
            try:
                relation.data[component].pop(field)
            except KeyError:
                logger.debug(
                    "Non-existing field '%s' was attempted to be removed from the databag (relation ID: %s)",
                    str(field),
                    str(relation.id),
                )
                pass

    # Public interface methods
    # Handling Relation Fields seamlessly, regardless if in databag or a Juju Secret

    def as_dict(self, relation_id: int) -> UserDict:
        """Dict behavior representation of the Abstract Data."""
        return DataDict(self, relation_id)

    def get_relation(self, relation_name, relation_id) -> Relation:
        """Safe way of retrieving a relation."""
        relation = self._model.get_relation(relation_name, relation_id)

        if not relation:
            raise DataInterfacesError(
                "Relation %s %s couldn't be retrieved", relation_name, relation_id
            )

        return relation

    def get_secret_uri(self, relation: Relation, group: SecretGroup) -> Optional[str]:
        """Get the secret URI for the corresponding group."""
        secret_field = self._generate_secret_field_name(group)
        # if the secret is not managed by this component,
        # we need to fetch it from the other side

        # Fix for the linter
        if self.my_secret_groups is None:
            raise DataInterfacesError("Secrets are not enabled for this component")
        component = self.component if group in self.my_secret_groups else relation.app
        return relation.data[component].get(secret_field)

    def set_secret_uri(self, relation: Relation, group: SecretGroup, secret_uri: str) -> None:
        """Set the secret URI for the corresponding group."""
        secret_field = self._generate_secret_field_name(group)
        relation.data[self.component][secret_field] = secret_uri

    def fetch_relation_data(
        self,
        relation_ids: Optional[List[int]] = None,
        fields: Optional[List[str]] = None,
        relation_name: Optional[str] = None,
    ) -> Dict[int, Dict[str, str]]:
        """Retrieves data from relation.

        This function can be used to retrieve data from a relation
        in the charm code when outside an event callback.
        Function cannot be used in `*-relation-broken` events and will raise an exception.

        Returns:
            a dict of the values stored in the relation data bag
                for all relation instances (indexed by the relation ID).
        """
        self._legacy_apply_on_fetch()

        if not relation_name:
            relation_name = self.relation_name

        relations = []
        if relation_ids:
            relations = [
                self.get_relation(relation_name, relation_id) for relation_id in relation_ids
            ]
        else:
            relations = self.relations

        data = {}
        for relation in relations:
            if not relation_ids or (relation_ids and relation.id in relation_ids):
                data[relation.id] = self._fetch_specific_relation_data(relation, fields)
        return data

    def fetch_relation_field(
        self, relation_id: int, field: str, relation_name: Optional[str] = None
    ) -> Optional[str]:
        """Get a single field from the relation data."""
        return (
            self.fetch_relation_data([relation_id], [field], relation_name)
            .get(relation_id, {})
            .get(field)
        )

    def fetch_my_relation_data(
        self,
        relation_ids: Optional[List[int]] = None,
        fields: Optional[List[str]] = None,
        relation_name: Optional[str] = None,
    ) -> Optional[Dict[int, Dict[str, str]]]:
        """Fetch data of the 'owner' (or 'this app') side of the relation.

        NOTE: Since only the leader can read the relation's 'this_app'-side
        Application databag, the functionality is limited to leaders
        """
        self._legacy_apply_on_fetch()

        if not relation_name:
            relation_name = self.relation_name

        relations = []
        if relation_ids:
            relations = [
                self.get_relation(relation_name, relation_id) for relation_id in relation_ids
            ]
        else:
            relations = self.relations

        data = {}
        for relation in relations:
            if not relation_ids or relation.id in relation_ids:
                data[relation.id] = self._fetch_my_specific_relation_data(relation, fields)
        return data

    def fetch_my_relation_field(
        self, relation_id: int, field: str, relation_name: Optional[str] = None
    ) -> Optional[str]:
        """Get a single field from the relation data -- owner side.

        NOTE: Since only the leader can read the relation's 'this_app'-side
        Application databag, the functionality is limited to leaders
        """
        if relation_data := self.fetch_my_relation_data([relation_id], [field], relation_name):
            return relation_data.get(relation_id, {}).get(field)

    @leader_only
    def update_relation_data(self, relation_id: int, data: dict) -> None:
        """Update the data within the relation."""
        self._legacy_apply_on_update(list(data.keys()))

        relation_name = self.relation_name
        relation = self.get_relation(relation_name, relation_id)
        return self._update_relation_data(relation, data)

    @leader_only
    def delete_relation_data(self, relation_id: int, fields: List[str]) -> None:
        """Remove field from the relation."""
        self._legacy_apply_on_delete(fields)

        relation_name = self.relation_name
        relation = self.get_relation(relation_name, relation_id)
        return self._delete_relation_data(relation, fields)


class EventHandlers(Object):
    """Requires-side of the relation."""

    def __init__(self, charm: CharmBase, relation_data: Data, unique_key: str = ""):
        """Manager of base client relations."""
        if not unique_key:
            unique_key = relation_data.relation_name
        super().__init__(charm, unique_key)

        self.charm = charm
        self.relation_data = relation_data

        self.framework.observe(
            charm.on[self.relation_data.relation_name].relation_changed,
            self._on_relation_changed_event,
        )

        self.framework.observe(
            self.charm.on[relation_data.relation_name].relation_created,
            self._on_relation_created_event,
        )

        self.framework.observe(
            charm.on.secret_changed,
            self._on_secret_changed_event,
        )

    # Event handlers

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the relation is created."""
        pass

    @abstractmethod
    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation data has changed."""
        raise NotImplementedError

    @abstractmethod
    def _on_secret_changed_event(self, event: SecretChangedEvent) -> None:
        """Event emitted when the relation data has changed."""
        raise NotImplementedError

    def _diff(self, event: RelationChangedEvent) -> Diff:
        """Retrieves the diff of the data in the relation changed databag.

        Args:
            event: relation changed event.

        Returns:
            a Diff instance containing the added, deleted and changed
                keys from the event relation databag.
        """
        return diff(event, self.relation_data.data_component)


# Base ProviderData and RequiresData


class ProviderData(Data):
    """Base provides-side of the data products relation."""

    RESOURCE_FIELD = "database"

    def __init__(
        self,
        model: Model,
        relation_name: str,
    ) -> None:
        super().__init__(model, relation_name)
        self.data_component = self.local_app
        self._local_secret_fields = []
        self._remote_secret_fields = list(self.SECRET_FIELDS)

    def _update_relation_data(self, relation: Relation, data: Dict[str, str]) -> None:
        """Set values for fields not caring whether it's a secret or not."""
        keys = set(data.keys())
        if self.fetch_relation_field(relation.id, self.RESOURCE_FIELD) is None and (
            keys - {"endpoints", "read-only-endpoints", "replset"}
        ):
            raise PrematureDataAccessError(
                "Premature access to relation data, update is forbidden before the connection is initialized."
            )
        super()._update_relation_data(relation, data)

    # Public methods - "native"

    def set_credentials(self, relation_id: int, username: str, password: str) -> None:
        """Set credentials.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            username: user that was created.
            password: password of the created user.
        """
        self.update_relation_data(relation_id, {"username": username, "password": password})

    def set_tls(self, relation_id: int, tls: str) -> None:
        """Set whether TLS is enabled.

        Args:
            relation_id: the identifier for a particular relation.
            tls: whether tls is enabled (True or False).
        """
        self.update_relation_data(relation_id, {"tls": tls})

    def set_tls_ca(self, relation_id: int, tls_ca: str) -> None:
        """Set the TLS CA in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            tls_ca: TLS certification authority.
        """
        self.update_relation_data(relation_id, {"tls-ca": tls_ca})

    # Public functions -- inherited

    fetch_my_relation_data = leader_only(Data.fetch_my_relation_data)
    fetch_my_relation_field = leader_only(Data.fetch_my_relation_field)

    def _load_secrets_from_databag(self, relation: Relation) -> None:
        """Load secrets from the databag."""
        requested_secrets = get_encoded_list(relation, relation.app, REQ_SECRET_FIELDS)
        provided_secrets = get_encoded_list(relation, relation.app, PROV_SECRET_FIELDS)
        if requested_secrets is not None:
            self._local_secret_fields = requested_secrets

        if provided_secrets is not None:
            self._remote_secret_fields = provided_secrets


class RequirerData(Data):
    """Requirer-side of the relation."""

    SECRET_FIELDS = ["username", "password", "tls", "tls-ca", "uris", "read-only-uris"]

    def __init__(
        self,
        model,
        relation_name: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
    ):
        """Manager of base client relations."""
        super().__init__(model, relation_name)
        self.extra_user_roles = extra_user_roles
        self._remote_secret_fields = list(self.SECRET_FIELDS)
        self._local_secret_fields = [
            field
            for field in self.SECRET_LABEL_MAP.keys()
            if field not in self._remote_secret_fields
        ]
        if additional_secret_fields:
            self._remote_secret_fields += additional_secret_fields
        self.data_component = self.local_unit

    # Internal helper functions

    def _is_resource_created_for_relation(self, relation: Relation) -> bool:
        if not relation.app:
            return False

        data = self.fetch_relation_data([relation.id], ["username", "password"]).get(
            relation.id, {}
        )
        return bool(data.get("username")) and bool(data.get("password"))

    # Public functions
    def is_resource_created(self, relation_id: Optional[int] = None) -> bool:
        """Check if the resource has been created.

        This function can be used to check if the Provider answered with data in the charm code
        when outside an event callback.

        Args:
            relation_id (int, optional): When provided the check is done only for the relation id
                provided, otherwise the check is done for all relations

        Returns:
            True or False

        Raises:
            IndexError: If relation_id is provided but that relation does not exist
        """
        if relation_id is not None:
            try:
                relation = [relation for relation in self.relations if relation.id == relation_id][
                    0
                ]
                return self._is_resource_created_for_relation(relation)
            except IndexError:
                raise IndexError(f"relation id {relation_id} cannot be accessed")
        else:
            return (
                all(
                    self._is_resource_created_for_relation(relation) for relation in self.relations
                )
                if self.relations
                else False
            )

    # Public functions -- inherited

    fetch_my_relation_data = leader_only(Data.fetch_my_relation_data)
    fetch_my_relation_field = leader_only(Data.fetch_my_relation_field)

    def _load_secrets_from_databag(self, relation: Relation) -> None:
        """Load secrets from the databag."""
        requested_secrets = get_encoded_list(relation, self.local_unit, REQ_SECRET_FIELDS)
        provided_secrets = get_encoded_list(relation, self.local_unit, PROV_SECRET_FIELDS)
        if requested_secrets:
            self._remote_secret_fields = requested_secrets

        if provided_secrets:
            self._local_secret_fields = provided_secrets


class RequirerEventHandlers(EventHandlers):
    """Requires-side of the relation."""

    def __init__(self, charm: CharmBase, relation_data: RequirerData, unique_key: str = ""):
        """Manager of base client relations."""
        super().__init__(charm, relation_data, unique_key)

    # Event handlers

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the relation is created."""
        if not self.relation_data.local_unit.is_leader():
            return

        if self.relation_data.remote_secret_fields:
            if self.relation_data.SCOPE == Scope.APP:
                set_encoded_field(
                    event.relation,
                    self.relation_data.local_app,
                    REQ_SECRET_FIELDS,
                    self.relation_data.remote_secret_fields,
                )

            set_encoded_field(
                event.relation,
                self.relation_data.local_unit,
                REQ_SECRET_FIELDS,
                self.relation_data.remote_secret_fields,
            )

        if self.relation_data.local_secret_fields:
            if self.relation_data.SCOPE == Scope.APP:
                set_encoded_field(
                    event.relation,
                    self.relation_data.local_app,
                    PROV_SECRET_FIELDS,
                    self.relation_data.local_secret_fields,
                )
            set_encoded_field(
                event.relation,
                self.relation_data.local_unit,
                PROV_SECRET_FIELDS,
                self.relation_data.local_secret_fields,
            )


class ProviderEventHandlers(EventHandlers):
    """Provider-side of the relation."""

    def __init__(self, charm: CharmBase, relation_data: ProviderData, unique_key: str = ""):
        """Manager of base client relations."""
        super().__init__(charm, relation_data, unique_key)

    # Event handlers

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation data has changed."""
        requested_secrets = get_encoded_list(event.relation, event.relation.app, REQ_SECRET_FIELDS)
        provided_secrets = get_encoded_list(event.relation, event.relation.app, PROV_SECRET_FIELDS)
        if requested_secrets is not None:
            self.relation_data._local_secret_fields = requested_secrets

        if provided_secrets is not None:
            self.relation_data._remote_secret_fields = provided_secrets


################################################################################
# Peer Relation Data
################################################################################


class DataPeerData(RequirerData, ProviderData):
    """Represents peer relations data."""

    SECRET_FIELDS = []
    SECRET_FIELD_NAME = "internal_secret"
    SECRET_LABEL_MAP = {}

    def __init__(
        self,
        model,
        relation_name: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        additional_secret_group_mapping: Dict[str, str] = {},
        secret_field_name: Optional[str] = None,
        deleted_label: Optional[str] = None,
    ):
        RequirerData.__init__(
            self,
            model,
            relation_name,
            extra_user_roles,
            additional_secret_fields,
        )
        self.secret_field_name = secret_field_name if secret_field_name else self.SECRET_FIELD_NAME
        self.deleted_label = deleted_label
        self._secret_label_map = {}

        # Legacy information holders
        self._legacy_labels = []
        self._legacy_secret_uri = None

        # Secrets that are being dynamically added within the scope of this event handler run
        self._new_secrets = []
        self._additional_secret_group_mapping = additional_secret_group_mapping

        for group, fields in additional_secret_group_mapping.items():
            if group not in SECRET_GROUPS.groups():
                setattr(SECRET_GROUPS, group, group)
            for field in fields:
                secret_group = SECRET_GROUPS.get_group(group)
                internal_field = self._field_to_internal_name(field, secret_group)
                self._secret_label_map.setdefault(group, []).append(internal_field)
                self._remote_secret_fields.append(internal_field)

    @property
    def scope(self) -> Optional[Scope]:
        """Turn component information into Scope."""
        if isinstance(self.component, Application):
            return Scope.APP
        if isinstance(self.component, Unit):
            return Scope.UNIT

    @property
    def secret_label_map(self) -> Dict[str, str]:
        """Property storing secret mappings."""
        return self._secret_label_map

    @property
    def static_secret_fields(self) -> List[str]:
        """Re-definition of the property in a way that dynamically extended list is retrieved."""
        return self._remote_secret_fields

    @property
    def local_secret_fields(self) -> List[str]:
        """Re-definition of the property in a way that dynamically extended list is retrieved."""
        return (
            self.static_secret_fields if self.static_secret_fields else self.current_secret_fields
        )

    @property
    def current_secret_fields(self) -> List[str]:
        """Helper method to get all currently existing secret fields (added statically or dynamically)."""
        if not self.secrets_enabled:
            return []

        if len(self._model.relations[self.relation_name]) > 1:
            raise ValueError(f"More than one peer relation on {self.relation_name}")

        relation = self._model.relations[self.relation_name][0]
        fields = []

        ignores = [
            SECRET_GROUPS.get_group("user"),
            SECRET_GROUPS.get_group("tls"),
            SECRET_GROUPS.get_group("mtls"),
        ]
        for group in SECRET_GROUPS.groups():
            if group in ignores:
                continue
            if content := self._get_group_secret_contents(relation, group):
                fields += list(content.keys())
        return list(set(fields) | set(self._new_secrets))

    @dynamic_secrets_only
    def set_secret(
        self,
        relation_id: int,
        field: str,
        value: str,
        group_mapping: Optional[SecretGroup] = None,
    ) -> None:
        """Public interface method to add a Relation Data field specifically as a Juju Secret.

        Args:
            relation_id: ID of the relation
            field: The secret field that is to be added
            value: The string value of the secret
            group_mapping: The name of the "secret group", in case the field is to be added to an existing secret
        """
        self._legacy_apply_on_update([field])

        full_field = self._field_to_internal_name(field, group_mapping)
        if self.secrets_enabled and full_field not in self.current_secret_fields:
            self._new_secrets.append(full_field)
        if self.valid_field_pattern(field, full_field):
            self.update_relation_data(relation_id, {full_field: value})

    # Unlike for set_secret(), there's no harm using this operation with static secrets
    # The restricion is only added to keep the concept clear
    @dynamic_secrets_only
    def get_secret(
        self,
        relation_id: int,
        field: str,
        group_mapping: Optional[SecretGroup] = None,
    ) -> Optional[str]:
        """Public interface method to fetch secrets only."""
        self._legacy_apply_on_fetch()

        full_field = self._field_to_internal_name(field, group_mapping)
        if (
            self.secrets_enabled
            and full_field not in self.current_secret_fields
            and field not in self.current_secret_fields
        ):
            return
        if self.valid_field_pattern(field, full_field):
            return self.fetch_my_relation_field(relation_id, full_field)

    @dynamic_secrets_only
    def delete_secret(
        self,
        relation_id: int,
        field: str,
        group_mapping: Optional[SecretGroup] = None,
    ) -> Optional[str]:
        """Public interface method to delete secrets only."""
        self._legacy_apply_on_delete([field])

        full_field = self._field_to_internal_name(field, group_mapping)
        if self.secrets_enabled and full_field not in self.current_secret_fields:
            logger.warning(f"Secret {field} from group {group_mapping} was not found")
            return

        if self.valid_field_pattern(field, full_field):
            self.delete_relation_data(relation_id, [full_field])

    ##########################################################################
    # Helpers
    ##########################################################################

    @staticmethod
    def _field_to_internal_name(field: str, group: Optional[SecretGroup]) -> str:
        if not group or group == SECRET_GROUPS.EXTRA:
            return field
        return f"{field}{GROUP_SEPARATOR}{group}"

    @staticmethod
    def _internal_name_to_field(name: str) -> Tuple[str, SecretGroup]:
        parts = name.split(GROUP_SEPARATOR)
        if not len(parts) > 1:
            return (parts[0], SECRET_GROUPS.EXTRA)
        secret_group = SECRET_GROUPS.get_group(parts[1])
        if not secret_group:
            raise ValueError(f"Invalid secret field {name}")
        return (parts[0], secret_group)

    def _group_secret_fields(self, secret_fields: List[str]) -> Dict[SecretGroup, List[str]]:
        """Helper function to arrange secret mappings under their group.

        NOTE: All unrecognized items end up in the 'extra' secret bucket.
        Make sure only secret fields are passed!
        """
        secret_fieldnames_grouped = {}
        for key in secret_fields:
            field, group = self._internal_name_to_field(key)
            secret_fieldnames_grouped.setdefault(group, []).append(field)
        return secret_fieldnames_grouped

    def _content_for_secret_group(
        self, content: Dict[str, str], secret_fields: Set[str], group_mapping: SecretGroup
    ) -> Dict[str, str]:
        """Select <field>: <value> pairs from input, that belong to this particular Secret group."""
        if group_mapping == SECRET_GROUPS.EXTRA:
            return {k: v for k, v in content.items() if k in self.local_secret_fields}
        return {
            self._internal_name_to_field(k)[0]: v
            for k, v in content.items()
            if k in self.local_secret_fields
        }

    def valid_field_pattern(self, field: str, full_field: str) -> bool:
        """Check that no secret group is attempted to be used together without secrets being enabled.

        Secrets groups are impossible to use with versions that are not yet supporting secrets.
        """
        if not self.secrets_enabled and full_field != field:
            logger.error(
                f"Can't access {full_field}: no secrets available (i.e. no secret groups either)."
            )
            return False
        return True

    def _load_secrets_from_databag(self, relation: Relation) -> None:
        """Load secrets from the databag."""
        requested_secrets = get_encoded_list(relation, self.component, REQ_SECRET_FIELDS)
        provided_secrets = get_encoded_list(relation, self.component, PROV_SECRET_FIELDS)
        if requested_secrets:
            self._remote_secret_fields = requested_secrets

        if provided_secrets:
            self._local_secret_fields = provided_secrets

    ##########################################################################
    # Backwards compatibility / Upgrades
    ##########################################################################
    # These functions are used to keep backwards compatibility on upgrades
    # Policy:
    # All data is kept intact until the first write operation. (This allows a minimal
    # grace period during which rollbacks are fully safe. For more info see spec.)
    # All data involves:
    #   - databag
    #   - secrets content
    #   - secret labels (!!!)
    # Legacy functions must return None, and leave an equally consistent state whether
    # they are executed or skipped (as a high enough versioned execution environment may
    # not require so)

    # Full legacy stack for each operation

    def _legacy_apply_on_fetch(self) -> None:
        """All legacy functions to be applied on fetch."""
        relation = self._model.relations[self.relation_name][0]
        self._legacy_compat_generate_prev_labels()
        self._legacy_compat_secret_uri_from_databag(relation)

    def _legacy_apply_on_update(self, fields) -> None:
        """All legacy functions to be applied on update."""
        relation = self._model.relations[self.relation_name][0]
        self._legacy_compat_generate_prev_labels()
        self._legacy_compat_secret_uri_from_databag(relation)
        self._legacy_migration_remove_secret_from_databag(relation, fields)
        self._legacy_migration_remove_secret_field_name_from_databag(relation)

    def _legacy_apply_on_delete(self, fields) -> None:
        """All legacy functions to be applied on delete."""
        relation = self._model.relations[self.relation_name][0]
        self._legacy_compat_generate_prev_labels()
        self._legacy_compat_secret_uri_from_databag(relation)
        self._legacy_compat_check_deleted_label(relation, fields)

    # Compatibility

    @legacy_apply_from_version(18)
    def _legacy_compat_check_deleted_label(self, relation, fields) -> None:
        """Helper function for legacy behavior.

        As long as https://bugs.launchpad.net/juju/+bug/2028094 wasn't fixed,
        we did not delete fields but rather kept them in the secret with a string value
        expressing invalidity. This function is maintainnig that behavior when needed.
        """
        if not self.deleted_label:
            return

        current_data = self.fetch_my_relation_data([relation.id], fields)
        if current_data is not None:
            # Check if the secret we wanna delete actually exists
            # Given the "deleted label", here we can't rely on the default mechanism (i.e. 'key not found')
            if non_existent := (set(fields) & set(self.local_secret_fields)) - set(
                current_data.get(relation.id, [])
            ):
                logger.debug(
                    "Non-existing secret %s was attempted to be removed.",
                    ", ".join(non_existent),
                )

    @legacy_apply_from_version(18)
    def _legacy_compat_secret_uri_from_databag(self, relation) -> None:
        """Fetching the secret URI from the databag, in case stored there."""
        self._legacy_secret_uri = relation.data[self.component].get(
            self._generate_secret_field_name(), None
        )

    @legacy_apply_from_version(34)
    def _legacy_compat_generate_prev_labels(self) -> None:
        """Generator for legacy secret label names, for backwards compatibility.

        Secret label is part of the data that MUST be maintained across rolling upgrades.
        In case there may be a change on a secret label, the old label must be recognized
        after upgrades, and left intact until the first write operation -- when we roll over
        to the new label.

        This function keeps "memory" of previously used secret labels.
        NOTE: Return value takes decorator into account -- all 'legacy' functions may return `None`

        v0.34 (rev69): Fixing issue https://github.com/canonical/data-platform-libs/issues/155
                       meant moving from '<app_name>.<scope>' (i.e. 'mysql.app', 'mysql.unit')
                       to labels '<relation_name>.<app_name>.<scope>' (like 'peer.mysql.app')
        """
        if self._legacy_labels:
            return

        result = []
        members = [self._model.app.name]
        if self.scope:
            members.append(self.scope.value)
        result.append(f"{'.'.join(members)}")
        self._legacy_labels = result

    # Migration

    @legacy_apply_from_version(18)
    def _legacy_migration_remove_secret_from_databag(self, relation, fields: List[str]) -> None:
        """For Rolling Upgrades -- when moving from databag to secrets usage.

        Practically what happens here is to remove stuff from the databag that is
        to be stored in secrets.
        """
        if not self.local_secret_fields:
            return

        secret_fields_passed = set(self.local_secret_fields) & set(fields)
        for field in secret_fields_passed:
            if self._fetch_relation_data_without_secrets(self.component, relation, [field]):
                self._delete_relation_data_without_secrets(self.component, relation, [field])

    @legacy_apply_from_version(18)
    def _legacy_migration_remove_secret_field_name_from_databag(self, relation) -> None:
        """Making sure that the old databag URI is gone.

        This action should not be executed more than once.

        There was a phase (before moving secrets usage to libs) when charms saved the peer
        secret URI to the databag, and used this URI from then on to retrieve their secret.
        When upgrading to charm versions using this library, we need to add a label to the
        secret and access it via label from than on, and remove the old traces from the databag.
        """
        # Nothing to do if 'internal-secret' is not in the databag
        if not (relation.data[self.component].get(self._generate_secret_field_name())):
            return

        # Making sure that the secret receives its label
        # (This should have happened by the time we get here, rather an extra security measure.)
        secret = self._get_relation_secret(relation.id)

        # Either app scope secret with leader executing, or unit scope secret
        leader_or_unit_scope = self.component != self.local_app or self.local_unit.is_leader()
        if secret and leader_or_unit_scope:
            # Databag reference to the secret URI can be removed, now that it's labelled
            relation.data[self.component].pop(self._generate_secret_field_name(), None)

    ##########################################################################
    # Event handlers
    ##########################################################################

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        pass

    def _on_secret_changed_event(self, event: SecretChangedEvent) -> None:
        """Event emitted when the secret has changed."""
        pass

    ##########################################################################
    # Overrides of Relation Data handling functions
    ##########################################################################

    def _generate_secret_label(
        self, relation_name: str, relation_id: int, group_mapping: SecretGroup
    ) -> str:
        members = [relation_name, self._model.app.name]
        if self.scope:
            members.append(self.scope.value)
        if group_mapping != SECRET_GROUPS.EXTRA:
            members.append(group_mapping)
        return f"{'.'.join(members)}"

    def _generate_secret_field_name(self, group_mapping: SecretGroup = SECRET_GROUPS.EXTRA) -> str:
        """Generate unique group_mappings for secrets within a relation context."""
        return f"{self.secret_field_name}"

    @juju_secrets_only
    def _get_relation_secret(
        self,
        relation_id: int,
        group_mapping: SecretGroup = SECRET_GROUPS.EXTRA,
        relation_name: Optional[str] = None,
    ) -> Optional[CachedSecret]:
        """Retrieve a Juju Secret specifically for peer relations.

        In case this code may be executed within a rolling upgrade, and we may need to
        migrate secrets from the databag to labels, we make sure to stick the correct
        label on the secret, and clean up the local databag.
        """
        if not relation_name:
            relation_name = self.relation_name

        relation = self._model.get_relation(relation_name, relation_id)
        if not relation:
            return

        label = self._generate_secret_label(relation_name, relation_id, group_mapping)

        # URI or legacy label is only to applied when moving single legacy secret to a (new) label
        if group_mapping == SECRET_GROUPS.EXTRA:
            # Fetching the secret with fallback to URI (in case label is not yet known)
            # Label would we "stuck" on the secret in case it is found
            return self.secrets.get(
                label, self._legacy_secret_uri, legacy_labels=self._legacy_labels
            )
        return self.secrets.get(label)

    def _get_group_secret_contents(
        self,
        relation: Relation,
        group: SecretGroup,
        secret_fields: Union[Set[str], List[str]] = [],
    ) -> Dict[str, str]:
        """Helper function to retrieve collective, requested contents of a secret."""
        secret_fields = [self._internal_name_to_field(k)[0] for k in secret_fields]
        result = super()._get_group_secret_contents(relation, group, secret_fields)
        if self.deleted_label:
            result = {key: result[key] for key in result if result[key] != self.deleted_label}
        if self._additional_secret_group_mapping:
            return {self._field_to_internal_name(key, group): result[key] for key in result}
        return result

    @either_static_or_dynamic_secrets
    def _fetch_my_specific_relation_data(
        self, relation: Relation, fields: Optional[List[str]]
    ) -> Dict[str, str]:
        """Fetch data available (directily or indirectly -- i.e. secrets) from the relation for owner/this_app."""
        return self._fetch_relation_data_with_secrets(
            self.component, self.local_secret_fields, relation, fields
        )

    @either_static_or_dynamic_secrets
    def _update_relation_data(self, relation: Relation, data: Dict[str, str]) -> None:
        """Update data available (directily or indirectly -- i.e. secrets) from the relation for owner/this_app."""
        self._load_secrets_from_databag(relation)

        _, normal_fields = self._process_secret_fields(
            relation,
            self.local_secret_fields,
            list(data),
            self._add_or_update_relation_secrets,
            data=data,
            uri_to_databag=False,
        )

        normal_content = {k: v for k, v in data.items() if k in normal_fields}
        self._update_relation_data_without_secrets(self.component, relation, normal_content)

    @either_static_or_dynamic_secrets
    def _delete_relation_data(self, relation: Relation, fields: List[str]) -> None:
        """Delete data available (directily or indirectly -- i.e. secrets) from the relation for owner/this_app."""
        self._load_secrets_from_databag(relation)
        if self.local_secret_fields and self.deleted_label:
            _, normal_fields = self._process_secret_fields(
                relation,
                self.local_secret_fields,
                fields,
                self._update_relation_secret,
                data=dict.fromkeys(fields, self.deleted_label),
            )
        else:
            _, normal_fields = self._process_secret_fields(
                relation,
                self.local_secret_fields,
                fields,
                self._delete_relation_secret,
                fields=fields,
            )
        self._delete_relation_data_without_secrets(self.component, relation, list(normal_fields))

    def fetch_relation_data(
        self,
        relation_ids: Optional[List[int]] = None,
        fields: Optional[List[str]] = None,
        relation_name: Optional[str] = None,
    ) -> Dict[int, Dict[str, str]]:
        """This method makes no sense for a Peer Relation."""
        raise NotImplementedError(
            "Peer Relation only supports 'self-side' fetch methods: "
            "fetch_my_relation_data() and fetch_my_relation_field()"
        )

    def fetch_relation_field(
        self, relation_id: int, field: str, relation_name: Optional[str] = None
    ) -> Optional[str]:
        """This method makes no sense for a Peer Relation."""
        raise NotImplementedError(
            "Peer Relation only supports 'self-side' fetch methods: "
            "fetch_my_relation_data() and fetch_my_relation_field()"
        )

    ##########################################################################
    # Public functions -- inherited
    ##########################################################################

    fetch_my_relation_data = Data.fetch_my_relation_data
    fetch_my_relation_field = Data.fetch_my_relation_field


class DataPeerEventHandlers(RequirerEventHandlers):
    """Requires-side of the relation."""

    def __init__(self, charm: CharmBase, relation_data: RequirerData, unique_key: str = ""):
        """Manager of base client relations."""
        super().__init__(charm, relation_data, unique_key)

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        pass

    def _on_secret_changed_event(self, event: SecretChangedEvent) -> None:
        """Event emitted when the secret has changed."""
        pass


class DataPeer(DataPeerData, DataPeerEventHandlers):
    """Represents peer relations."""

    def __init__(
        self,
        charm,
        relation_name: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        additional_secret_group_mapping: Dict[str, str] = {},
        secret_field_name: Optional[str] = None,
        deleted_label: Optional[str] = None,
        unique_key: str = "",
    ):
        DataPeerData.__init__(
            self,
            charm.model,
            relation_name,
            extra_user_roles,
            additional_secret_fields,
            additional_secret_group_mapping,
            secret_field_name,
            deleted_label,
        )
        DataPeerEventHandlers.__init__(self, charm, self, unique_key)


class DataPeerUnitData(DataPeerData):
    """Unit data abstraction representation."""

    SCOPE = Scope.UNIT

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class DataPeerUnit(DataPeerUnitData, DataPeerEventHandlers):
    """Unit databag representation."""

    def __init__(
        self,
        charm,
        relation_name: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        additional_secret_group_mapping: Dict[str, str] = {},
        secret_field_name: Optional[str] = None,
        deleted_label: Optional[str] = None,
        unique_key: str = "",
    ):
        DataPeerData.__init__(
            self,
            charm.model,
            relation_name,
            extra_user_roles,
            additional_secret_fields,
            additional_secret_group_mapping,
            secret_field_name,
            deleted_label,
        )
        DataPeerEventHandlers.__init__(self, charm, self, unique_key)


class DataPeerOtherUnitData(DataPeerUnitData):
    """Unit data abstraction representation."""

    def __init__(self, unit: Unit, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.local_unit = unit
        self.component = unit

    def update_relation_data(self, relation_id: int, data: dict) -> None:
        """This method makes no sense for a Other Peer Relation."""
        raise NotImplementedError("It's not possible to update data of another unit.")

    def delete_relation_data(self, relation_id: int, fields: List[str]) -> None:
        """This method makes no sense for a Other Peer Relation."""
        raise NotImplementedError("It's not possible to delete data of another unit.")


class DataPeerOtherUnitEventHandlers(DataPeerEventHandlers):
    """Requires-side of the relation."""

    def __init__(self, charm: CharmBase, relation_data: DataPeerUnitData):
        """Manager of base client relations."""
        unique_key = f"{relation_data.relation_name}-{relation_data.local_unit.name}"
        super().__init__(charm, relation_data, unique_key=unique_key)


class DataPeerOtherUnit(DataPeerOtherUnitData, DataPeerOtherUnitEventHandlers):
    """Unit databag representation for another unit than the executor."""

    def __init__(
        self,
        unit: Unit,
        charm: CharmBase,
        relation_name: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        additional_secret_group_mapping: Dict[str, str] = {},
        secret_field_name: Optional[str] = None,
        deleted_label: Optional[str] = None,
    ):
        DataPeerOtherUnitData.__init__(
            self,
            unit,
            charm.model,
            relation_name,
            extra_user_roles,
            additional_secret_fields,
            additional_secret_group_mapping,
            secret_field_name,
            deleted_label,
        )
        DataPeerOtherUnitEventHandlers.__init__(self, charm, self)


################################################################################
# Cross-charm Relations Data Handling and Events
################################################################################

# Generic events


class ExtraRoleEvent(RelationEvent):
    """Base class for data events."""

    @property
    def extra_user_roles(self) -> Optional[str]:
        """Returns the extra user roles that were requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("extra-user-roles")


class RelationEventWithSecret(RelationEvent):
    """Base class for Relation Events that need to handle secrets."""

    @property
    def _secrets(self) -> dict:
        """Caching secrets to avoid fetching them each time a field is referrd.

        DON'T USE the encapsulated helper variable outside of this function
        """
        if not hasattr(self, "_cached_secrets"):
            self._cached_secrets = {}
        return self._cached_secrets

    def _get_secret(self, group) -> Optional[Dict[str, str]]:
        """Retrieving secrets."""
        if not self.app:
            return
        if not self._secrets.get(group):
            self._secrets[group] = None
            secret_field = f"{PROV_SECRET_PREFIX}{group}"
            if secret_uri := self.relation.data[self.app].get(secret_field):
                secret = self.framework.model.get_secret(id=secret_uri)
                self._secrets[group] = secret.get_content()
        return self._secrets[group]

    @property
    def secrets_enabled(self):
        """Is this Juju version allowing for Secrets usage?"""
        return JujuVersion.from_environ().has_secrets


class AuthenticationEvent(RelationEventWithSecret):
    """Base class for authentication fields for events.

    The amount of logic added here is not ideal -- but this was the only way to preserve
    the interface when moving to Juju Secrets
    """

    @property
    def username(self) -> Optional[str]:
        """Returns the created username."""
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("user")
            if secret:
                return secret.get("username")

        return self.relation.data[self.relation.app].get("username")

    @property
    def password(self) -> Optional[str]:
        """Returns the password for the created user."""
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("user")
            if secret:
                return secret.get("password")

        return self.relation.data[self.relation.app].get("password")

    @property
    def tls(self) -> Optional[str]:
        """Returns whether TLS is configured."""
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("tls")
            if secret:
                return secret.get("tls")

        return self.relation.data[self.relation.app].get("tls")

    @property
    def tls_ca(self) -> Optional[str]:
        """Returns TLS CA."""
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("tls")
            if secret:
                return secret.get("tls-ca")

        return self.relation.data[self.relation.app].get("tls-ca")


# Database related events and fields


class DatabaseProvidesEvent(RelationEvent):
    """Base class for database events."""

    @property
    def database(self) -> Optional[str]:
        """Returns the database that was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("database")


class DatabaseRequestedEvent(DatabaseProvidesEvent, ExtraRoleEvent):
    """Event emitted when a new database is requested for use on this relation."""

    @property
    def external_node_connectivity(self) -> bool:
        """Returns the requested external_node_connectivity field."""
        if not self.relation.app:
            return False

        return (
            self.relation.data[self.relation.app].get("external-node-connectivity", "false")
            == "true"
        )


class DatabaseProvidesEvents(CharmEvents):
    """Database events.

    This class defines the events that the database can emit.
    """

    database_requested = EventSource(DatabaseRequestedEvent)


class DatabaseRequiresEvent(RelationEventWithSecret):
    """Base class for database events."""

    @property
    def database(self) -> Optional[str]:
        """Returns the database name."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("database")

    @property
    def endpoints(self) -> Optional[str]:
        """Returns a comma separated list of read/write endpoints.

        In VM charms, this is the primary's address.
        In kubernetes charms, this is the service to the primary pod.
        """
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("endpoints")

    @property
    def read_only_endpoints(self) -> Optional[str]:
        """Returns a comma separated list of read only endpoints.

        In VM charms, this is the address of all the secondary instances.
        In kubernetes charms, this is the service to all replica pod instances.
        """
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("read-only-endpoints")

    @property
    def replset(self) -> Optional[str]:
        """Returns the replicaset name.

        MongoDB only.
        """
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("replset")

    @property
    def uris(self) -> Optional[str]:
        """Returns the connection URIs.

        MongoDB, Redis, OpenSearch.
        """
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("user")
            if secret:
                return secret.get("uris")

        return self.relation.data[self.relation.app].get("uris")

    @property
    def read_only_uris(self) -> Optional[str]:
        """Returns the readonly connection URIs."""
        if not self.relation.app:
            return None

        if self.secrets_enabled:
            secret = self._get_secret("user")
            if secret:
                return secret.get("read-only-uris")

        return self.relation.data[self.relation.app].get("read-only-uris")

    @property
    def version(self) -> Optional[str]:
        """Returns the version of the database.

        Version as informed by the database daemon.
        """
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("version")


class DatabaseCreatedEvent(AuthenticationEvent, DatabaseRequiresEvent):
    """Event emitted when a new database is created for use on this relation."""


class DatabaseEndpointsChangedEvent(AuthenticationEvent, DatabaseRequiresEvent):
    """Event emitted when the read/write endpoints are changed."""


class DatabaseReadOnlyEndpointsChangedEvent(AuthenticationEvent, DatabaseRequiresEvent):
    """Event emitted when the read only endpoints are changed."""


class DatabaseRequiresEvents(CharmEvents):
    """Database events.

    This class defines the events that the database can emit.
    """

    database_created = EventSource(DatabaseCreatedEvent)
    endpoints_changed = EventSource(DatabaseEndpointsChangedEvent)
    read_only_endpoints_changed = EventSource(DatabaseReadOnlyEndpointsChangedEvent)


# Database Provider and Requires


class DatabaseProviderData(ProviderData):
    """Provider-side data of the database relations."""

    def __init__(self, model: Model, relation_name: str) -> None:
        super().__init__(model, relation_name)

    def set_database(self, relation_id: int, database_name: str) -> None:
        """Set database name.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            database_name: database name.
        """
        self.update_relation_data(relation_id, {"database": database_name})

    def set_endpoints(self, relation_id: int, connection_strings: str) -> None:
        """Set database primary connections.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        In VM charms, only the primary's address should be passed as an endpoint.
        In kubernetes charms, the service endpoint to the primary pod should be
        passed as an endpoint.

        Args:
            relation_id: the identifier for a particular relation.
            connection_strings: database hosts and ports comma separated list.
        """
        self.update_relation_data(relation_id, {"endpoints": connection_strings})

    def set_read_only_endpoints(self, relation_id: int, connection_strings: str) -> None:
        """Set database replicas connection strings.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            connection_strings: database hosts and ports comma separated list.
        """
        self.update_relation_data(relation_id, {"read-only-endpoints": connection_strings})

    def set_replset(self, relation_id: int, replset: str) -> None:
        """Set replica set name in the application relation databag.

        MongoDB only.

        Args:
            relation_id: the identifier for a particular relation.
            replset: replica set name.
        """
        self.update_relation_data(relation_id, {"replset": replset})

    def set_uris(self, relation_id: int, uris: str) -> None:
        """Set the database connection URIs in the application relation databag.

        MongoDB, Redis, and OpenSearch only.

        Args:
            relation_id: the identifier for a particular relation.
            uris: connection URIs.
        """
        self.update_relation_data(relation_id, {"uris": uris})

    def set_read_only_uris(self, relation_id: int, uris: str) -> None:
        """Set the database readonly connection URIs in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            uris: connection URIs.
        """
        self.update_relation_data(relation_id, {"read-only-uris": uris})

    def set_version(self, relation_id: int, version: str) -> None:
        """Set the database version in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            version: database version.
        """
        self.update_relation_data(relation_id, {"version": version})

    def set_subordinated(self, relation_id: int) -> None:
        """Raises the subordinated flag in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
        """
        self.update_relation_data(relation_id, {"subordinated": "true"})


class DatabaseProviderEventHandlers(ProviderEventHandlers):
    """Provider-side of the database relation handlers."""

    on = DatabaseProvidesEvents()  # pyright: ignore [reportAssignmentType]

    def __init__(
        self, charm: CharmBase, relation_data: DatabaseProviderData, unique_key: str = ""
    ):
        """Manager of base client relations."""
        super().__init__(charm, relation_data, unique_key)
        # Just to calm down pyright, it can't parse that the same type is being used in the super() call above
        self.relation_data = relation_data

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        super()._on_relation_changed_event(event)
        # Leader only
        if not self.relation_data.local_unit.is_leader():
            return
        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Emit a database requested event if the setup key (database name and optional
        # extra user roles) was added to the relation databag by the application.
        if "database" in diff.added:
            getattr(self.on, "database_requested").emit(
                event.relation, app=event.app, unit=event.unit
            )

    def _on_secret_changed_event(self, event: SecretChangedEvent) -> None:
        """Event emitted when the secret has changed."""
        pass


class DatabaseProvides(DatabaseProviderData, DatabaseProviderEventHandlers):
    """Provider-side of the database relations."""

    def __init__(self, charm: CharmBase, relation_name: str) -> None:
        DatabaseProviderData.__init__(self, charm.model, relation_name)
        DatabaseProviderEventHandlers.__init__(self, charm, self)


class DatabaseRequirerData(RequirerData):
    """Requirer-side of the database relation."""

    def __init__(
        self,
        model: Model,
        relation_name: str,
        database_name: str,
        extra_user_roles: Optional[str] = None,
        relations_aliases: Optional[List[str]] = None,
        additional_secret_fields: Optional[List[str]] = [],
        external_node_connectivity: bool = False,
    ):
        """Manager of database client relations."""
        super().__init__(model, relation_name, extra_user_roles, additional_secret_fields)
        self.database = database_name
        self.relations_aliases = relations_aliases
        self.external_node_connectivity = external_node_connectivity

    def is_postgresql_plugin_enabled(self, plugin: str, relation_index: int = 0) -> bool:
        """Returns whether a plugin is enabled in the database.

        Args:
            plugin: name of the plugin to check.
            relation_index: optional relation index to check the database
                (default: 0 - first relation).

        PostgreSQL only.
        """
        # Psycopg 3 is imported locally to avoid the need of its package installation
        # when relating to a database charm other than PostgreSQL.
        import psycopg

        # Return False if no relation is established.
        if len(self.relations) == 0:
            return False

        relation_id = self.relations[relation_index].id
        host = self.fetch_relation_field(relation_id, "endpoints")

        # Return False if there is no endpoint available.
        if host is None:
            return False

        host = host.split(":")[0]

        content = self.fetch_relation_data([relation_id], ["username", "password"]).get(
            relation_id, {}
        )
        user = content.get("username")
        password = content.get("password")

        connection_string = (
            f"host='{host}' dbname='{self.database}' user='{user}' password='{password}'"
        )
        try:
            with psycopg.connect(connection_string) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT TRUE FROM pg_extension WHERE extname=%s::text;", (plugin,)
                    )
                    return cursor.fetchone() is not None
        except psycopg.Error as e:
            logger.exception(
                f"failed to check whether {plugin} plugin is enabled in the database: %s", str(e)
            )
            return False


class DatabaseRequirerEventHandlers(RequirerEventHandlers):
    """Requires-side of the relation."""

    on = DatabaseRequiresEvents()  # pyright: ignore [reportAssignmentType]

    def __init__(
        self, charm: CharmBase, relation_data: DatabaseRequirerData, unique_key: str = ""
    ):
        """Manager of base client relations."""
        super().__init__(charm, relation_data, unique_key)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

        # Define custom event names for each alias.
        if self.relation_data.relations_aliases:
            # Ensure the number of aliases does not exceed the maximum
            # of connections allowed in the specific relation.
            relation_connection_limit = self.charm.meta.requires[
                self.relation_data.relation_name
            ].limit
            if len(self.relation_data.relations_aliases) != relation_connection_limit:
                raise ValueError(
                    f"The number of aliases must match the maximum number of connections allowed in the relation. "
                    f"Expected {relation_connection_limit}, got {len(self.relation_data.relations_aliases)}"
                )

        if self.relation_data.relations_aliases:
            for relation_alias in self.relation_data.relations_aliases:
                self.on.define_event(f"{relation_alias}_database_created", DatabaseCreatedEvent)
                self.on.define_event(
                    f"{relation_alias}_endpoints_changed", DatabaseEndpointsChangedEvent
                )
                self.on.define_event(
                    f"{relation_alias}_read_only_endpoints_changed",
                    DatabaseReadOnlyEndpointsChangedEvent,
                )

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        pass

    def _assign_relation_alias(self, relation_id: int) -> None:
        """Assigns an alias to a relation.

        This function writes in the unit data bag.

        Args:
            relation_id: the identifier for a particular relation.
        """
        # If no aliases were provided, return immediately.
        if not self.relation_data.relations_aliases:
            return

        # Return if an alias was already assigned to this relation
        # (like when there are more than one unit joining the relation).
        relation = self.charm.model.get_relation(self.relation_data.relation_name, relation_id)
        if relation and relation.data[self.relation_data.local_unit].get("alias"):
            return

        # Retrieve the available aliases (the ones that weren't assigned to any relation).
        available_aliases = self.relation_data.relations_aliases[:]
        for relation in self.charm.model.relations[self.relation_data.relation_name]:
            alias = relation.data[self.relation_data.local_unit].get("alias")
            if alias:
                logger.debug("Alias %s was already assigned to relation %d", alias, relation.id)
                available_aliases.remove(alias)

        # Set the alias in the unit relation databag of the specific relation.
        relation = self.charm.model.get_relation(self.relation_data.relation_name, relation_id)
        if relation:
            relation.data[self.relation_data.local_unit].update({"alias": available_aliases[0]})

        # We need to set relation alias also on the application level so,
        # it will be accessible in show-unit juju command, executed for a consumer application unit
        if self.relation_data.local_unit.is_leader():
            self.relation_data.update_relation_data(relation_id, {"alias": available_aliases[0]})

    def _emit_aliased_event(self, event: RelationChangedEvent, event_name: str) -> None:
        """Emit an aliased event to a particular relation if it has an alias.

        Args:
            event: the relation changed event that was received.
            event_name: the name of the event to emit.
        """
        alias = self._get_relation_alias(event.relation.id)
        if alias:
            getattr(self.on, f"{alias}_{event_name}").emit(
                event.relation, app=event.app, unit=event.unit
            )

    def _get_relation_alias(self, relation_id: int) -> Optional[str]:
        """Returns the relation alias.

        Args:
            relation_id: the identifier for a particular relation.

        Returns:
            the relation alias or None if the relation was not found.
        """
        for relation in self.charm.model.relations[self.relation_data.relation_name]:
            if relation.id == relation_id:
                return relation.data[self.relation_data.local_unit].get("alias")
        return None

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the database relation is created."""
        super()._on_relation_created_event(event)

        # If relations aliases were provided, assign one to the relation.
        self._assign_relation_alias(event.relation.id)

        # Sets both database and extra user roles in the relation
        # if the roles are provided. Otherwise, sets only the database.
        if not self.relation_data.local_unit.is_leader():
            return

        event_data = {"database": self.relation_data.database}

        if self.relation_data.extra_user_roles:
            event_data["extra-user-roles"] = self.relation_data.extra_user_roles

        # set external-node-connectivity field
        if self.relation_data.external_node_connectivity:
            event_data["external-node-connectivity"] = "true"

        self.relation_data.update_relation_data(event.relation.id, event_data)

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the database relation has changed."""
        is_subordinate = False
        remote_unit_data = None
        for key in event.relation.data.keys():
            if isinstance(key, Unit) and not key.name.startswith(self.charm.app.name):
                remote_unit_data = event.relation.data[key]
            elif isinstance(key, Application) and key.name != self.charm.app.name:
                is_subordinate = event.relation.data[key].get("subordinated") == "true"

        if is_subordinate:
            if not remote_unit_data:
                return

            if remote_unit_data.get("state") != "ready":
                return

        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Register all new secrets with their labels
        if any(newval for newval in diff.added if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, diff.added)

        # Check if the database is created
        # (the database charm shared the credentials).
        secret_field_user = self.relation_data._generate_secret_field_name(SECRET_GROUPS.USER)
        if (
            "username" in diff.added and "password" in diff.added
        ) or secret_field_user in diff.added:
            # Emit the default event (the one without an alias).
            logger.info("database created at %s", datetime.now())
            getattr(self.on, "database_created").emit(
                event.relation, app=event.app, unit=event.unit
            )

            # Emit the aliased event (if any).
            self._emit_aliased_event(event, "database_created")

            # To avoid unnecessary application restarts do not trigger
            # “endpoints_changed“ event if “database_created“ is triggered.
            return

        # Emit an endpoints changed event if the database
        # added or changed this info in the relation databag.
        if "endpoints" in diff.added or "endpoints" in diff.changed:
            # Emit the default event (the one without an alias).
            logger.info("endpoints changed on %s", datetime.now())
            getattr(self.on, "endpoints_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )

            # Emit the aliased event (if any).
            self._emit_aliased_event(event, "endpoints_changed")

            # To avoid unnecessary application restarts do not trigger
            # “read_only_endpoints_changed“ event if “endpoints_changed“ is triggered.
            return

        # Emit a read only endpoints changed event if the database
        # added or changed this info in the relation databag.
        if "read-only-endpoints" in diff.added or "read-only-endpoints" in diff.changed:
            # Emit the default event (the one without an alias).
            logger.info("read-only-endpoints changed on %s", datetime.now())
            getattr(self.on, "read_only_endpoints_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )

            # Emit the aliased event (if any).
            self._emit_aliased_event(event, "read_only_endpoints_changed")


class DatabaseRequires(DatabaseRequirerData, DatabaseRequirerEventHandlers):
    """Provider-side of the database relations."""

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
        database_name: str,
        extra_user_roles: Optional[str] = None,
        relations_aliases: Optional[List[str]] = None,
        additional_secret_fields: Optional[List[str]] = [],
        external_node_connectivity: bool = False,
    ):
        DatabaseRequirerData.__init__(
            self,
            charm.model,
            relation_name,
            database_name,
            extra_user_roles,
            relations_aliases,
            additional_secret_fields,
            external_node_connectivity,
        )
        DatabaseRequirerEventHandlers.__init__(self, charm, self)


################################################################################
# Charm-specific Relations Data and Events
################################################################################

# Kafka Events


class KafkaProvidesEvent(RelationEventWithSecret):
    """Base class for Kafka events."""

    @property
    def topic(self) -> Optional[str]:
        """Returns the topic that was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("topic")

    @property
    def consumer_group_prefix(self) -> Optional[str]:
        """Returns the consumer-group-prefix that was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("consumer-group-prefix")

    @property
    def mtls_cert(self) -> Optional[str]:
        """Returns TLS cert of the client."""
        if not self.relation.app:
            return None

        if not self.secrets_enabled:
            raise SecretsUnavailableError("Secrets unavailable on current Juju version")

        secret_field = f"{PROV_SECRET_PREFIX}{SECRET_GROUPS.MTLS}"
        if secret_uri := self.relation.data[self.app].get(secret_field):
            secret = self.framework.model.get_secret(id=secret_uri)
            content = secret.get_content(refresh=True)
            if content:
                return content.get("mtls-cert")


class KafkaClientMtlsCertUpdatedEvent(KafkaProvidesEvent):
    """Event emitted when the mtls relation is updated."""

    def __init__(self, handle, relation, old_mtls_cert: Optional[str] = None, app=None, unit=None):
        super().__init__(handle, relation, app, unit)

        self.old_mtls_cert = old_mtls_cert

    def snapshot(self):
        """Return a snapshot of the event."""
        return super().snapshot() | {"old_mtls_cert": self.old_mtls_cert}

    def restore(self, snapshot):
        """Restore the event from a snapshot."""
        super().restore(snapshot)
        self.old_mtls_cert = snapshot["old_mtls_cert"]


class TopicRequestedEvent(KafkaProvidesEvent, ExtraRoleEvent):
    """Event emitted when a new topic is requested for use on this relation."""


class KafkaProvidesEvents(CharmEvents):
    """Kafka events.

    This class defines the events that the Kafka can emit.
    """

    topic_requested = EventSource(TopicRequestedEvent)
    mtls_cert_updated = EventSource(KafkaClientMtlsCertUpdatedEvent)


class KafkaRequiresEvent(RelationEvent):
    """Base class for Kafka events."""

    @property
    def topic(self) -> Optional[str]:
        """Returns the topic."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("topic")

    @property
    def bootstrap_server(self) -> Optional[str]:
        """Returns a comma-separated list of broker uris."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("endpoints")

    @property
    def consumer_group_prefix(self) -> Optional[str]:
        """Returns the consumer-group-prefix."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("consumer-group-prefix")

    @property
    def zookeeper_uris(self) -> Optional[str]:
        """Returns a comma separated list of Zookeeper uris."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("zookeeper-uris")


class TopicCreatedEvent(AuthenticationEvent, KafkaRequiresEvent):
    """Event emitted when a new topic is created for use on this relation."""


class BootstrapServerChangedEvent(AuthenticationEvent, KafkaRequiresEvent):
    """Event emitted when the bootstrap server is changed."""


class KafkaRequiresEvents(CharmEvents):
    """Kafka events.

    This class defines the events that the Kafka can emit.
    """

    topic_created = EventSource(TopicCreatedEvent)
    bootstrap_server_changed = EventSource(BootstrapServerChangedEvent)


# Kafka Provides and Requires


class KafkaProviderData(ProviderData):
    """Provider-side of the Kafka relation."""

    RESOURCE_FIELD = "topic"

    def __init__(self, model: Model, relation_name: str) -> None:
        super().__init__(model, relation_name)

    def set_topic(self, relation_id: int, topic: str) -> None:
        """Set topic name in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            topic: the topic name.
        """
        self.update_relation_data(relation_id, {"topic": topic})

    def set_bootstrap_server(self, relation_id: int, bootstrap_server: str) -> None:
        """Set the bootstrap server in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            bootstrap_server: the bootstrap server address.
        """
        self.update_relation_data(relation_id, {"endpoints": bootstrap_server})

    def set_consumer_group_prefix(self, relation_id: int, consumer_group_prefix: str) -> None:
        """Set the consumer group prefix in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            consumer_group_prefix: the consumer group prefix string.
        """
        self.update_relation_data(relation_id, {"consumer-group-prefix": consumer_group_prefix})

    def set_zookeeper_uris(self, relation_id: int, zookeeper_uris: str) -> None:
        """Set the zookeeper uris in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            zookeeper_uris: comma-separated list of ZooKeeper server uris.
        """
        self.update_relation_data(relation_id, {"zookeeper-uris": zookeeper_uris})


class KafkaProviderEventHandlers(ProviderEventHandlers):
    """Provider-side of the Kafka relation."""

    on = KafkaProvidesEvents()  # pyright: ignore [reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: KafkaProviderData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        super()._on_relation_changed_event(event)

        new_data_keys = list(event.relation.data[event.app].keys())
        if any(newval for newval in new_data_keys if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, new_data_keys)

        getattr(self.on, "mtls_cert_updated").emit(event.relation, app=event.app, unit=event.unit)

        # Leader only
        if not self.relation_data.local_unit.is_leader():
            return

        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Emit a topic requested event if the setup key (topic name and optional
        # extra user roles) was added to the relation databag by the application.
        if "topic" in diff.added:
            getattr(self.on, "topic_requested").emit(
                event.relation, app=event.app, unit=event.unit
            )

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        if not event.secret.label:
            return

        relation = self.relation_data._relation_from_secret_label(event.secret.label)
        if not relation:
            logging.info(
                f"Received secret {event.secret.label} but couldn't parse, seems irrelevant"
            )
            return

        if relation.app == self.charm.app:
            logging.info("Secret changed event ignored for Secret Owner")

        remote_unit = None
        for unit in relation.units:
            if unit.app != self.charm.app:
                remote_unit = unit

        old_mtls_cert = event.secret.get_content().get("mtls-cert")
        # mtls-cert is the only secret that can be updated
        logger.info("mtls-cert updated")
        getattr(self.on, "mtls_cert_updated").emit(
            relation, app=relation.app, unit=remote_unit, old_mtls_cert=old_mtls_cert
        )


class KafkaProvides(KafkaProviderData, KafkaProviderEventHandlers):
    """Provider-side of the Kafka relation."""

    def __init__(self, charm: CharmBase, relation_name: str) -> None:
        KafkaProviderData.__init__(self, charm.model, relation_name)
        KafkaProviderEventHandlers.__init__(self, charm, self)


class KafkaRequirerData(RequirerData):
    """Requirer-side of the Kafka relation."""

    def __init__(
        self,
        model: Model,
        relation_name: str,
        topic: str,
        extra_user_roles: Optional[str] = None,
        consumer_group_prefix: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        mtls_cert: Optional[str] = None,
    ):
        """Manager of Kafka client relations."""
        super().__init__(model, relation_name, extra_user_roles, additional_secret_fields)
        self.topic = topic
        self.consumer_group_prefix = consumer_group_prefix or ""
        self.mtls_cert = mtls_cert

    @property
    def topic(self):
        """Topic to use in Kafka."""
        return self._topic

    @topic.setter
    def topic(self, value):
        # Avoid wildcards
        if value == "*":
            raise ValueError(f"Error on topic '{value}', cannot be a wildcard.")
        self._topic = value

    def set_mtls_cert(self, relation_id: int, mtls_cert: str) -> None:
        """Set the mtls cert in the application relation databag / secret.

        Args:
            relation_id: the identifier for a particular relation.
            mtls_cert: mtls cert.
        """
        self.update_relation_data(relation_id, {"mtls-cert": mtls_cert})


class KafkaRequirerEventHandlers(RequirerEventHandlers):
    """Requires-side of the Kafka relation."""

    on = KafkaRequiresEvents()  # pyright: ignore [reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: KafkaRequirerData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the Kafka relation is created."""
        super()._on_relation_created_event(event)

        if not self.relation_data.local_unit.is_leader():
            return

        # Sets topic, extra user roles, and "consumer-group-prefix" in the relation
        relation_data = {"topic": self.relation_data.topic}

        if self.relation_data.mtls_cert:
            relation_data["mtls-cert"] = self.relation_data.mtls_cert

        if self.relation_data.extra_user_roles:
            relation_data["extra-user-roles"] = self.relation_data.extra_user_roles

        if self.relation_data.consumer_group_prefix:
            relation_data["consumer-group-prefix"] = self.relation_data.consumer_group_prefix

        self.relation_data.update_relation_data(event.relation.id, relation_data)

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        pass

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the Kafka relation has changed."""
        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Check if the topic is created
        # (the Kafka charm shared the credentials).

        # Register all new secrets with their labels
        if any(newval for newval in diff.added if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, diff.added)

        secret_field_user = self.relation_data._generate_secret_field_name(SECRET_GROUPS.USER)
        if (
            "username" in diff.added and "password" in diff.added
        ) or secret_field_user in diff.added:
            # Emit the default event (the one without an alias).
            logger.info("topic created at %s", datetime.now())
            getattr(self.on, "topic_created").emit(event.relation, app=event.app, unit=event.unit)

            # To avoid unnecessary application restarts do not trigger
            # “endpoints_changed“ event if “topic_created“ is triggered.
            return

        # Emit an endpoints (bootstrap-server) changed event if the Kafka endpoints
        # added or changed this info in the relation databag.
        if "endpoints" in diff.added or "endpoints" in diff.changed:
            # Emit the default event (the one without an alias).
            logger.info("endpoints changed on %s", datetime.now())
            getattr(self.on, "bootstrap_server_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )  # here check if this is the right design
            return


class KafkaRequires(KafkaRequirerData, KafkaRequirerEventHandlers):
    """Provider-side of the Kafka relation."""

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
        topic: str,
        extra_user_roles: Optional[str] = None,
        consumer_group_prefix: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
        mtls_cert: Optional[str] = None,
    ) -> None:
        KafkaRequirerData.__init__(
            self,
            charm.model,
            relation_name,
            topic,
            extra_user_roles=extra_user_roles,
            consumer_group_prefix=consumer_group_prefix,
            additional_secret_fields=additional_secret_fields,
            mtls_cert=mtls_cert,
        )
        KafkaRequirerEventHandlers.__init__(self, charm, self)


# Opensearch related events


class OpenSearchProvidesEvent(RelationEvent):
    """Base class for OpenSearch events."""

    @property
    def index(self) -> Optional[str]:
        """Returns the index that was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("index")


class IndexRequestedEvent(OpenSearchProvidesEvent, ExtraRoleEvent):
    """Event emitted when a new index is requested for use on this relation."""


class OpenSearchProvidesEvents(CharmEvents):
    """OpenSearch events.

    This class defines the events that OpenSearch can emit.
    """

    index_requested = EventSource(IndexRequestedEvent)


class OpenSearchRequiresEvent(DatabaseRequiresEvent):
    """Base class for OpenSearch requirer events."""


class IndexCreatedEvent(AuthenticationEvent, OpenSearchRequiresEvent):
    """Event emitted when a new index is created for use on this relation."""


class OpenSearchRequiresEvents(CharmEvents):
    """OpenSearch events.

    This class defines the events that the opensearch requirer can emit.
    """

    index_created = EventSource(IndexCreatedEvent)
    endpoints_changed = EventSource(DatabaseEndpointsChangedEvent)
    authentication_updated = EventSource(AuthenticationEvent)


# OpenSearch Provides and Requires Objects


class OpenSearchProvidesData(ProviderData):
    """Provider-side of the OpenSearch relation."""

    RESOURCE_FIELD = "index"

    def __init__(self, model: Model, relation_name: str) -> None:
        super().__init__(model, relation_name)

    def set_index(self, relation_id: int, index: str) -> None:
        """Set the index in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            index: the index as it is _created_ on the provider charm. This needn't match the
                requested index, and can be used to present a different index name if, for example,
                the requested index is invalid.
        """
        self.update_relation_data(relation_id, {"index": index})

    def set_endpoints(self, relation_id: int, endpoints: str) -> None:
        """Set the endpoints in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            endpoints: the endpoint addresses for opensearch nodes.
        """
        self.update_relation_data(relation_id, {"endpoints": endpoints})

    def set_version(self, relation_id: int, version: str) -> None:
        """Set the opensearch version in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            version: database version.
        """
        self.update_relation_data(relation_id, {"version": version})


class OpenSearchProvidesEventHandlers(ProviderEventHandlers):
    """Provider-side of the OpenSearch relation."""

    on = OpenSearchProvidesEvents()  # pyright: ignore[reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: OpenSearchProvidesData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        super()._on_relation_changed_event(event)

        # Leader only
        if not self.relation_data.local_unit.is_leader():
            return
        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Emit an index requested event if the setup key (index name and optional extra user roles)
        # have been added to the relation databag by the application.
        if "index" in diff.added:
            getattr(self.on, "index_requested").emit(
                event.relation, app=event.app, unit=event.unit
            )

    def _on_secret_changed_event(self, event: SecretChangedEvent) -> None:
        """Event emitted when the relation data has changed."""
        pass


class OpenSearchProvides(OpenSearchProvidesData, OpenSearchProvidesEventHandlers):
    """Provider-side of the OpenSearch relation."""

    def __init__(self, charm: CharmBase, relation_name: str) -> None:
        OpenSearchProvidesData.__init__(self, charm.model, relation_name)
        OpenSearchProvidesEventHandlers.__init__(self, charm, self)


class OpenSearchRequiresData(RequirerData):
    """Requires data side of the OpenSearch relation."""

    def __init__(
        self,
        model: Model,
        relation_name: str,
        index: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
    ):
        """Manager of OpenSearch client relations."""
        super().__init__(model, relation_name, extra_user_roles, additional_secret_fields)
        self.index = index


class OpenSearchRequiresEventHandlers(RequirerEventHandlers):
    """Requires events side of the OpenSearch relation."""

    on = OpenSearchRequiresEvents()  # pyright: ignore[reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: OpenSearchRequiresData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the OpenSearch relation is created."""
        super()._on_relation_created_event(event)

        if not self.relation_data.local_unit.is_leader():
            return

        # Sets both index and extra user roles in the relation if the roles are provided.
        # Otherwise, sets only the index.
        data = {"index": self.relation_data.index}
        if self.relation_data.extra_user_roles:
            data["extra-user-roles"] = self.relation_data.extra_user_roles

        self.relation_data.update_relation_data(event.relation.id, data)

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        if not event.secret.label:
            return

        relation = self.relation_data._relation_from_secret_label(event.secret.label)
        if not relation:
            logging.info(
                f"Received secret {event.secret.label} but couldn't parse, seems irrelevant"
            )
            return

        if relation.app == self.charm.app:
            logging.info("Secret changed event ignored for Secret Owner")

        remote_unit = None
        for unit in relation.units:
            if unit.app != self.charm.app:
                remote_unit = unit

        logger.info("authentication updated")
        getattr(self.on, "authentication_updated").emit(
            relation, app=relation.app, unit=remote_unit
        )

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the OpenSearch relation has changed.

        This event triggers individual custom events depending on the changing relation.
        """
        # Check which data has changed to emit customs events.
        diff = self._diff(event)

        # Register all new secrets with their labels
        if any(newval for newval in diff.added if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, diff.added)

        secret_field_user = self.relation_data._generate_secret_field_name(SECRET_GROUPS.USER)
        secret_field_tls = self.relation_data._generate_secret_field_name(SECRET_GROUPS.TLS)
        updates = {"username", "password", "tls", "tls-ca", secret_field_user, secret_field_tls}
        if len(set(diff._asdict().keys()) - updates) < len(diff):
            logger.info("authentication updated at: %s", datetime.now())
            getattr(self.on, "authentication_updated").emit(
                event.relation, app=event.app, unit=event.unit
            )

        # Check if the index is created
        # (the OpenSearch charm shares the credentials).
        if (
            "username" in diff.added and "password" in diff.added
        ) or secret_field_user in diff.added:
            # Emit the default event (the one without an alias).
            logger.info("index created at: %s", datetime.now())
            getattr(self.on, "index_created").emit(event.relation, app=event.app, unit=event.unit)

            # To avoid unnecessary application restarts do not trigger
            # “endpoints_changed“ event if “index_created“ is triggered.
            return

        # Emit a endpoints changed event if the OpenSearch application added or changed this info
        # in the relation databag.
        if "endpoints" in diff.added or "endpoints" in diff.changed:
            # Emit the default event (the one without an alias).
            logger.info("endpoints changed on %s", datetime.now())
            getattr(self.on, "endpoints_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )  # here check if this is the right design
            return


class OpenSearchRequires(OpenSearchRequiresData, OpenSearchRequiresEventHandlers):
    """Requires-side of the OpenSearch relation."""

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
        index: str,
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
    ) -> None:
        OpenSearchRequiresData.__init__(
            self,
            charm.model,
            relation_name,
            index,
            extra_user_roles,
            additional_secret_fields,
        )
        OpenSearchRequiresEventHandlers.__init__(self, charm, self)


# Etcd related events


class EtcdProviderEvent(RelationEventWithSecret):
    """Base class for Etcd events."""

    @property
    def prefix(self) -> Optional[str]:
        """Returns the index that was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("prefix")

    @property
    def mtls_cert(self) -> Optional[str]:
        """Returns TLS cert of the client."""
        if not self.relation.app:
            return None

        if not self.secrets_enabled:
            raise SecretsUnavailableError("Secrets unavailable on current Juju version")

        secret_field = f"{PROV_SECRET_PREFIX}{SECRET_GROUPS.MTLS}"
        if secret_uri := self.relation.data[self.app].get(secret_field):
            secret = self.framework.model.get_secret(id=secret_uri)
            content = secret.get_content(refresh=True)
            if content:
                return content.get("mtls-cert")


class MTLSCertUpdatedEvent(EtcdProviderEvent):
    """Event emitted when the mtls relation is updated."""

    def __init__(self, handle, relation, old_mtls_cert: Optional[str] = None, app=None, unit=None):
        super().__init__(handle, relation, app, unit)

        self.old_mtls_cert = old_mtls_cert

    def snapshot(self):
        """Return a snapshot of the event."""
        return super().snapshot() | {"old_mtls_cert": self.old_mtls_cert}

    def restore(self, snapshot):
        """Restore the event from a snapshot."""
        super().restore(snapshot)
        self.old_mtls_cert = snapshot["old_mtls_cert"]


class EtcdProviderEvents(CharmEvents):
    """Etcd events.

    This class defines the events that Etcd can emit.
    """

    mtls_cert_updated = EventSource(MTLSCertUpdatedEvent)


class EtcdReadyEvent(AuthenticationEvent, DatabaseRequiresEvent):
    """Event emitted when the etcd relation is ready to be consumed."""


class EtcdRequirerEvents(CharmEvents):
    """Etcd events.

    This class defines the events that the etcd requirer can emit.
    """

    endpoints_changed = EventSource(DatabaseEndpointsChangedEvent)
    etcd_ready = EventSource(EtcdReadyEvent)


# Etcd Provides and Requires Objects


class EtcdProviderData(ProviderData):
    """Provider-side of the Etcd relation."""

    RESOURCE_FIELD = "prefix"

    def __init__(self, model: Model, relation_name: str) -> None:
        super().__init__(model, relation_name)

    def set_uris(self, relation_id: int, uris: str) -> None:
        """Set the database connection URIs in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            uris: connection URIs.
        """
        self.update_relation_data(relation_id, {"uris": uris})

    def set_endpoints(self, relation_id: int, endpoints: str) -> None:
        """Set the endpoints in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            endpoints: the endpoint addresses for etcd nodes "ip:port" format.
        """
        self.update_relation_data(relation_id, {"endpoints": endpoints})

    def set_version(self, relation_id: int, version: str) -> None:
        """Set the etcd version in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            version: etcd API version.
        """
        self.update_relation_data(relation_id, {"version": version})

    def set_tls_ca(self, relation_id: int, tls_ca: str) -> None:
        """Set the TLS CA in the application relation databag.

        Args:
            relation_id: the identifier for a particular relation.
            tls_ca: TLS certification authority.
        """
        self.update_relation_data(relation_id, {"tls-ca": tls_ca, "tls": "True"})


class EtcdProviderEventHandlers(ProviderEventHandlers):
    """Provider-side of the Etcd relation."""

    on = EtcdProviderEvents()  # pyright: ignore[reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: EtcdProviderData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the relation has changed."""
        super()._on_relation_changed_event(event)
        # register all new secrets with their labels
        new_data_keys = list(event.relation.data[event.app].keys())
        if any(newval for newval in new_data_keys if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, new_data_keys)

        getattr(self.on, "mtls_cert_updated").emit(event.relation, app=event.app, unit=event.unit)
        return

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        if not event.secret.label:
            return

        relation = self.relation_data._relation_from_secret_label(event.secret.label)
        if not relation:
            logging.info(
                f"Received secret {event.secret.label} but couldn't parse, seems irrelevant"
            )
            return

        if relation.app == self.charm.app:
            logging.info("Secret changed event ignored for Secret Owner")

        remote_unit = None
        for unit in relation.units:
            if unit.app != self.charm.app:
                remote_unit = unit

        old_mtls_cert = event.secret.get_content().get("mtls-cert")
        # mtls-cert is the only secret that can be updated
        logger.info("mtls-cert updated")
        getattr(self.on, "mtls_cert_updated").emit(
            relation, app=relation.app, unit=remote_unit, old_mtls_cert=old_mtls_cert
        )


class EtcdProvides(EtcdProviderData, EtcdProviderEventHandlers):
    """Provider-side of the Etcd relation."""

    def __init__(self, charm: CharmBase, relation_name: str) -> None:
        EtcdProviderData.__init__(self, charm.model, relation_name)
        EtcdProviderEventHandlers.__init__(self, charm, self)
        if not self.secrets_enabled:
            raise SecretsUnavailableError("Secrets unavailable on current Juju version")


class EtcdRequirerData(RequirerData):
    """Requires data side of the Etcd relation."""

    def __init__(
        self,
        model: Model,
        relation_name: str,
        prefix: str,
        mtls_cert: Optional[str],
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
    ):
        """Manager of Etcd client relations."""
        super().__init__(model, relation_name, extra_user_roles, additional_secret_fields)
        self.prefix = prefix
        self.mtls_cert = mtls_cert

    def set_mtls_cert(self, relation_id: int, mtls_cert: str) -> None:
        """Set the mtls cert in the application relation databag / secret.

        Args:
            relation_id: the identifier for a particular relation.
            mtls_cert: mtls cert.
        """
        self.update_relation_data(relation_id, {"mtls-cert": mtls_cert})


class EtcdRequirerEventHandlers(RequirerEventHandlers):
    """Requires events side of the Etcd relation."""

    on = EtcdRequirerEvents()  # pyright: ignore[reportAssignmentType]

    def __init__(self, charm: CharmBase, relation_data: EtcdRequirerData) -> None:
        super().__init__(charm, relation_data)
        # Just to keep lint quiet, can't resolve inheritance. The same happened in super().__init__() above
        self.relation_data = relation_data

    def _on_relation_created_event(self, event: RelationCreatedEvent) -> None:
        """Event emitted when the Etcd relation is created."""
        super()._on_relation_created_event(event)

        payload = {
            "prefix": self.relation_data.prefix,
        }
        if self.relation_data.mtls_cert:
            payload["mtls-cert"] = self.relation_data.mtls_cert

        self.relation_data.update_relation_data(
            event.relation.id,
            payload,
        )

    def _on_relation_changed_event(self, event: RelationChangedEvent) -> None:
        """Event emitted when the Etcd relation has changed.

        This event triggers individual custom events depending on the changing relation.
        """
        # Check which data has changed to emit customs events.
        diff = self._diff(event)
        # Register all new secrets with their labels
        if any(newval for newval in diff.added if self.relation_data._is_secret_field(newval)):
            self.relation_data._register_secrets_to_relation(event.relation, diff.added)

        secret_field_user = self.relation_data._generate_secret_field_name(SECRET_GROUPS.USER)
        secret_field_tls = self.relation_data._generate_secret_field_name(SECRET_GROUPS.TLS)

        # Emit a endpoints changed event if the etcd application added or changed this info
        # in the relation databag.
        if "endpoints" in diff.added or "endpoints" in diff.changed:
            # Emit the default event (the one without an alias).
            logger.info("endpoints changed on %s", datetime.now())
            getattr(self.on, "endpoints_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )

        if (
            secret_field_tls in diff.added
            or secret_field_tls in diff.changed
            or secret_field_user in diff.added
            or secret_field_user in diff.changed
            or "username" in diff.added
            or "username" in diff.changed
        ):
            # Emit the default event (the one without an alias).
            logger.info("etcd ready on %s", datetime.now())
            getattr(self.on, "etcd_ready").emit(event.relation, app=event.app, unit=event.unit)

    def _on_secret_changed_event(self, event: SecretChangedEvent):
        """Event notifying about a new value of a secret."""
        if not event.secret.label:
            return

        relation = self.relation_data._relation_from_secret_label(event.secret.label)
        if not relation:
            logging.info(
                f"Received secret {event.secret.label} but couldn't parse, seems irrelevant"
            )
            return

        if relation.app == self.charm.app:
            logging.info("Secret changed event ignored for Secret Owner")

        remote_unit = None
        for unit in relation.units:
            if unit.app != self.charm.app:
                remote_unit = unit

        # secret-user or secret-tls updated
        logger.info("etcd_ready updated")
        getattr(self.on, "etcd_ready").emit(relation, app=relation.app, unit=remote_unit)


class EtcdRequires(EtcdRequirerData, EtcdRequirerEventHandlers):
    """Requires-side of the Etcd relation."""

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
        prefix: str,
        mtls_cert: Optional[str],
        extra_user_roles: Optional[str] = None,
        additional_secret_fields: Optional[List[str]] = [],
    ) -> None:
        EtcdRequirerData.__init__(
            self,
            charm.model,
            relation_name,
            prefix,
            mtls_cert,
            extra_user_roles,
            additional_secret_fields,
        )
        EtcdRequirerEventHandlers.__init__(self, charm, self)
        if not self.secrets_enabled:
            raise SecretsUnavailableError("Secrets unavailable on current Juju version")
