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

r"""A library for communicating with the S3 credentials providers and consumers.

This library provides the relevant interface code implementing the communication
specification for fetching, retrieving, triggering, and responding to events related to
the S3 provider charm and its consumers.

### Provider charm

The provider is implemented in the `s3-provider` charm which is meant to be deployed
alongside one or more consumer charms. The provider charm is serving the s3 credentials and
metadata needed to communicate and work with an S3 compatible backend.

Example:
```python

from charms.data_platform_libs.v0.s3 import CredentialRequestedEvent, S3Provider


class ExampleProviderCharm(CharmBase):
    def __init__(self, *args) -> None:
        super().__init__(*args)
        self.s3_provider = S3Provider(self, "s3-credentials")

        self.framework.observe(self.s3_provider.on.credentials_requested,
            self._on_credential_requested)

    def _on_credential_requested(self, event: CredentialRequestedEvent):
        if not self.unit.is_leader():
            return

        # get relation id
        relation_id = event.relation.id

        # get bucket name
        bucket = event.bucket

        # S3 configuration parameters
        desired_configuration = {"access-key": "your-access-key", "secret-key":
            "your-secret-key", "bucket": "your-bucket"}

        # update the configuration
        self.s3_provider.update_connection_info(relation_id, desired_configuration)

        # or it is possible to set each field independently

        self.s3_provider.set_secret_key(relation_id, "your-secret-key")


if __name__ == "__main__":
    main(ExampleProviderCharm)


### Requirer charm

The requirer charm is the charm requiring the S3 credentials.
An example of requirer charm is the following:

Example:
```python

from charms.data_platform_libs.v0.s3 import (
    CredentialsChangedEvent,
    CredentialsGoneEvent,
    S3Requirer
)

class ExampleRequirerCharm(CharmBase):

    def __init__(self, *args):
        super().__init__(*args)

         bucket_name = "test-bucket"
        # if bucket name is not provided the bucket name will be generated
        # e.g., ('relation-{relation.id}')

        self.s3_client = S3Requirer(self, "s3-credentials", bucket_name)

        self.framework.observe(self.s3_client.on.credentials_changed, self._on_credential_changed)
        self.framework.observe(self.s3_client.on.credentials_gone, self._on_credential_gone)

    def _on_credential_changed(self, event: CredentialsChangedEvent):

        # access single parameter credential
        secret_key = event.secret_key
        access_key = event.access_key

        # or as alternative all credentials can be collected as a dictionary
        credentials = self.s3_client.get_s3_credentials()

    def _on_credential_gone(self, event: CredentialsGoneEvent):
        # credentials are removed
        pass

 if __name__ == "__main__":
    main(ExampleRequirerCharm)
```

"""
import json
import logging
from collections import namedtuple
from typing import Dict, List, Optional, Union

import ops.charm
import ops.framework
import ops.model
from ops.charm import (
    CharmBase,
    CharmEvents,
    RelationBrokenEvent,
    RelationChangedEvent,
    RelationEvent,
    RelationJoinedEvent,
)
from ops.framework import EventSource, Object, ObjectEvents
from ops.model import Application, Relation, RelationDataContent, Unit

# The unique Charmhub library identifier, never change it
LIBID = "fca396f6254246c9bfa565b1f85ab528"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 5

logger = logging.getLogger(__name__)

Diff = namedtuple("Diff", "added changed deleted")
Diff.__doc__ = """
A tuple for storing the diff between two data mappings.

added - keys that were added
changed - keys that still exist but have new values
deleted - key that were deleted"""


def diff(event: RelationChangedEvent, bucket: Union[Unit, Application]) -> Diff:
    """Retrieves the diff of the data in the relation changed databag.

    Args:
        event: relation changed event.
        bucket: bucket of the databag (app or unit)

    Returns:
        a Diff instance containing the added, deleted and changed
            keys from the event relation databag.
    """
    # Retrieve the old data from the data key in the application relation databag.
    old_data = json.loads(event.relation.data[bucket].get("data", "{}"))
    # Retrieve the new data from the event relation databag.
    new_data = (
        {key: value for key, value in event.relation.data[event.app].items() if key != "data"}
        if event.app
        else {}
    )

    # These are the keys that were added to the databag and triggered this event.
    added = new_data.keys() - old_data.keys()
    # These are the keys that were removed from the databag and triggered this event.
    deleted = old_data.keys() - new_data.keys()
    # These are the keys that already existed in the databag,
    # but had their values changed.
    changed = {key for key in old_data.keys() & new_data.keys() if old_data[key] != new_data[key]}

    # TODO: evaluate the possibility of losing the diff if some error
    # happens in the charm before the diff is completely checked (DPE-412).
    # Convert the new_data to a serializable format and save it for a next diff check.
    event.relation.data[bucket].update({"data": json.dumps(new_data)})

    # Return the diff with all possible changes.
    return Diff(added, changed, deleted)


class BucketEvent(RelationEvent):
    """Base class for bucket events."""

    @property
    def bucket(self) -> Optional[str]:
        """Returns the bucket was requested."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("bucket", "")


class CredentialRequestedEvent(BucketEvent):
    """Event emitted when a set of credential is requested for use on this relation."""


class S3CredentialEvents(CharmEvents):
    """Event descriptor for events raised by S3Provider."""

    credentials_requested = EventSource(CredentialRequestedEvent)


class S3Provider(Object):
    """A provider handler for communicating S3 credentials to consumers."""

    on = S3CredentialEvents()  # pyright: ignore [reportAssignmentType]

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
    ):
        super().__init__(charm, relation_name)
        self.charm = charm
        self.local_app = self.charm.model.app
        self.local_unit = self.charm.unit
        self.relation_name = relation_name

        # monitor relation changed event for changes in the credentials
        self.framework.observe(charm.on[relation_name].relation_changed, self._on_relation_changed)

    def _on_relation_changed(self, event: RelationChangedEvent) -> None:
        """React to the relation changed event by consuming data."""
        if not self.charm.unit.is_leader():
            return
        diff = self._diff(event)
        # emit on credential requested if bucket is provided by the requirer application
        if "bucket" in diff.added:
            getattr(self.on, "credentials_requested").emit(
                event.relation, app=event.app, unit=event.unit
            )

    def _load_relation_data(self, raw_relation_data: dict) -> dict:
        """Loads relation data from the relation data bag.

        Args:
            raw_relation_data: Relation data from the databag
        Returns:
            dict: Relation data in dict format.
        """
        connection_data = {}
        for key in raw_relation_data:
            try:
                connection_data[key] = json.loads(raw_relation_data[key])
            except (json.decoder.JSONDecodeError, TypeError):
                connection_data[key] = raw_relation_data[key]
        return connection_data

    # def _diff(self, event: RelationChangedEvent) -> Diff:
    #     """Retrieves the diff of the data in the relation changed databag.

    #     Args:
    #         event: relation changed event.

    #     Returns:
    #         a Diff instance containing the added, deleted and changed
    #             keys from the event relation databag.
    #     """
    #     # Retrieve the old data from the data key in the application relation databag.
    #     old_data = json.loads(event.relation.data[self.local_app].get("data", "{}"))
    #     # Retrieve the new data from the event relation databag.
    #     new_data = {
    #         key: value for key, value in event.relation.data[event.app].items() if key != "data"
    #     }

    #     # These are the keys that were added to the databag and triggered this event.
    #     added = new_data.keys() - old_data.keys()
    #     # These are the keys that were removed from the databag and triggered this event.
    #     deleted = old_data.keys() - new_data.keys()
    #     # These are the keys that already existed in the databag,
    #     # but had their values changed.
    #     changed = {
    #         key for key in old_data.keys() & new_data.keys() if old_data[key] != new_data[key]
    #     }

    #     # TODO: evaluate the possibility of losing the diff if some error
    #     # happens in the charm before the diff is completely checked (DPE-412).
    #     # Convert the new_data to a serializable format and save it for a next diff check.
    #     event.relation.data[self.local_app].update({"data": json.dumps(new_data)})

    #     # Return the diff with all possible changes.
    #     return Diff(added, changed, deleted)

    def _diff(self, event: RelationChangedEvent) -> Diff:
        """Retrieves the diff of the data in the relation changed databag.

        Args:
            event: relation changed event.

        Returns:
            a Diff instance containing the added, deleted and changed
                keys from the event relation databag.
        """
        return diff(event, self.local_app)

    def fetch_relation_data(self) -> dict:
        """Retrieves data from relation.

        This function can be used to retrieve data from a relation
        in the charm code when outside an event callback.

        Returns:
            a dict of the values stored in the relation data bag
                for all relation instances (indexed by the relation id).
        """
        data = {}
        for relation in self.relations:
            data[relation.id] = (
                {key: value for key, value in relation.data[relation.app].items() if key != "data"}
                if relation.app
                else {}
            )
        return data

    def update_connection_info(self, relation_id: int, connection_data: dict) -> None:
        """Updates the credential data as set of key-value pairs in the relation.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            connection_data: dict containing the key-value pairs
                that should be updated.
        """
        # check and write changes only if you are the leader
        if not self.local_unit.is_leader():
            return

        relation = self.charm.model.get_relation(self.relation_name, relation_id)

        if not relation:
            return

        # configuration options that are list
        s3_list_options = ["attributes", "tls-ca-chain"]

        # update the databag, if connection data did not change with respect to before
        # the relation changed event is not triggered
        updated_connection_data = {}
        for configuration_option, configuration_value in connection_data.items():
            if configuration_option in s3_list_options:
                updated_connection_data[configuration_option] = json.dumps(configuration_value)
            else:
                updated_connection_data[configuration_option] = configuration_value

        relation.data[self.local_app].update(updated_connection_data)
        logger.debug(f"Updated S3 connection info: {updated_connection_data}")

    @property
    def relations(self) -> List[Relation]:
        """The list of Relation instances associated with this relation_name."""
        return list(self.charm.model.relations[self.relation_name])

    def set_bucket(self, relation_id: int, bucket: str) -> None:
        """Sets bucket name in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            bucket: the bucket name.
        """
        self.update_connection_info(relation_id, {"bucket": bucket})

    def set_access_key(self, relation_id: int, access_key: str) -> None:
        """Sets access-key value in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            access_key: the access-key value.
        """
        self.update_connection_info(relation_id, {"access-key": access_key})

    def set_secret_key(self, relation_id: int, secret_key: str) -> None:
        """Sets the secret key value in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            secret_key: the value of the secret key.
        """
        self.update_connection_info(relation_id, {"secret-key": secret_key})

    def set_path(self, relation_id: int, path: str) -> None:
        """Sets the path value in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            path: the path value.
        """
        self.update_connection_info(relation_id, {"path": path})

    def set_endpoint(self, relation_id: int, endpoint: str) -> None:
        """Sets the endpoint address in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            endpoint: the endpoint address.
        """
        self.update_connection_info(relation_id, {"endpoint": endpoint})

    def set_region(self, relation_id: int, region: str) -> None:
        """Sets the region location in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            region: the region address.
        """
        self.update_connection_info(relation_id, {"region": region})

    def set_s3_uri_style(self, relation_id: int, s3_uri_style: str) -> None:
        """Sets the S3 URI style in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            s3_uri_style: the s3 URI style.
        """
        self.update_connection_info(relation_id, {"s3-uri-style": s3_uri_style})

    def set_storage_class(self, relation_id: int, storage_class: str) -> None:
        """Sets the storage class in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            storage_class: the storage class.
        """
        self.update_connection_info(relation_id, {"storage-class": storage_class})

    def set_tls_ca_chain(self, relation_id: int, tls_ca_chain: List[str]) -> None:
        """Sets the tls_ca_chain value in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            tls_ca_chain: the TLS Chain value.
        """
        self.update_connection_info(relation_id, {"tls-ca-chain": tls_ca_chain})

    def set_s3_api_version(self, relation_id: int, s3_api_version: str) -> None:
        """Sets the S3 API version in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            s3_api_version: the S3 version value.
        """
        self.update_connection_info(relation_id, {"s3-api-version": s3_api_version})

    def set_delete_older_than_days(self, relation_id: int, days: int) -> None:
        """Sets the retention days for full backups in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            days: the value.
        """
        self.update_connection_info(relation_id, {"delete-older-than-days": str(days)})

    def set_attributes(self, relation_id: int, attributes: List[str]) -> None:
        """Sets the connection attributes in application databag.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            attributes: the attributes value.
        """
        self.update_connection_info(relation_id, {"attributes": attributes})


class S3Event(RelationEvent):
    """Base class for S3 storage events."""

    @property
    def bucket(self) -> Optional[str]:
        """Returns the bucket name."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("bucket")

    @property
    def access_key(self) -> Optional[str]:
        """Returns the access key."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("access-key")

    @property
    def secret_key(self) -> Optional[str]:
        """Returns the secret key."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("secret-key")

    @property
    def path(self) -> Optional[str]:
        """Returns the path where data can be stored."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("path")

    @property
    def endpoint(self) -> Optional[str]:
        """Returns the endpoint address."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("endpoint")

    @property
    def region(self) -> Optional[str]:
        """Returns the region."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("region")

    @property
    def s3_uri_style(self) -> Optional[str]:
        """Returns the s3 uri style."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("s3-uri-style")

    @property
    def storage_class(self) -> Optional[str]:
        """Returns the storage class name."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("storage-class")

    @property
    def tls_ca_chain(self) -> Optional[List[str]]:
        """Returns the TLS CA chain."""
        if not self.relation.app:
            return None

        tls_ca_chain = self.relation.data[self.relation.app].get("tls-ca-chain")
        if tls_ca_chain is not None:
            return json.loads(tls_ca_chain)
        return None

    @property
    def s3_api_version(self) -> Optional[str]:
        """Returns the S3 API version."""
        if not self.relation.app:
            return None

        return self.relation.data[self.relation.app].get("s3-api-version")

    @property
    def delete_older_than_days(self) -> Optional[int]:
        """Returns the retention days for full backups."""
        if not self.relation.app:
            return None

        days = self.relation.data[self.relation.app].get("delete-older-than-days")
        if days is None:
            return None
        return int(days)

    @property
    def attributes(self) -> Optional[List[str]]:
        """Returns the attributes."""
        if not self.relation.app:
            return None

        attributes = self.relation.data[self.relation.app].get("attributes")
        if attributes is not None:
            return json.loads(attributes)
        return None


class CredentialsChangedEvent(S3Event):
    """Event emitted when S3 credential are changed on this relation."""


class CredentialsGoneEvent(RelationEvent):
    """Event emitted when S3 credential are removed from this relation."""


class S3CredentialRequiresEvents(ObjectEvents):
    """Event descriptor for events raised by the S3Provider."""

    credentials_changed = EventSource(CredentialsChangedEvent)
    credentials_gone = EventSource(CredentialsGoneEvent)


S3_REQUIRED_OPTIONS = ["access-key", "secret-key"]


class S3Requirer(Object):
    """Requires-side of the s3 relation."""

    on = S3CredentialRequiresEvents()  # pyright: ignore[reportAssignmentType]

    def __init__(
        self, charm: ops.charm.CharmBase, relation_name: str, bucket_name: Optional[str] = None
    ):
        """Manager of the s3 client relations."""
        super().__init__(charm, relation_name)

        self.relation_name = relation_name
        self.charm = charm
        self.local_app = self.charm.model.app
        self.local_unit = self.charm.unit
        self.bucket = bucket_name

        self.framework.observe(
            self.charm.on[self.relation_name].relation_changed, self._on_relation_changed
        )

        self.framework.observe(
            self.charm.on[self.relation_name].relation_joined, self._on_relation_joined
        )

        self.framework.observe(
            self.charm.on[self.relation_name].relation_broken,
            self._on_relation_broken,
        )

    def _generate_bucket_name(self, event: RelationJoinedEvent):
        """Returns the bucket name generated from relation id."""
        return f"relation-{event.relation.id}"

    def _on_relation_joined(self, event: RelationJoinedEvent) -> None:
        """Event emitted when the application joins the s3 relation."""
        if self.bucket is None:
            self.bucket = self._generate_bucket_name(event)
        self.update_connection_info(event.relation.id, {"bucket": self.bucket})

    def fetch_relation_data(self) -> dict:
        """Retrieves data from relation.

        This function can be used to retrieve data from a relation
        in the charm code when outside an event callback.

        Returns:
            a dict of the values stored in the relation data bag
                for all relation instances (indexed by the relation id).
        """
        data = {}

        for relation in self.relations:
            data[relation.id] = self._load_relation_data(relation.data[self.charm.app])
        return data

    def update_connection_info(self, relation_id: int, connection_data: dict) -> None:
        """Updates the credential data as set of key-value pairs in the relation.

        This function writes in the application data bag, therefore,
        only the leader unit can call it.

        Args:
            relation_id: the identifier for a particular relation.
            connection_data: dict containing the key-value pairs
                that should be updated.
        """
        # check and write changes only if you are the leader
        if not self.local_unit.is_leader():
            return

        relation = self.charm.model.get_relation(self.relation_name, relation_id)

        if not relation:
            return

        # update the databag, if connection data did not change with respect to before
        # the relation changed event is not triggered
        # configuration options that are list
        s3_list_options = ["attributes", "tls-ca-chain"]
        updated_connection_data = {}
        for configuration_option, configuration_value in connection_data.items():
            if configuration_option in s3_list_options:
                updated_connection_data[configuration_option] = json.dumps(configuration_value)
            else:
                updated_connection_data[configuration_option] = configuration_value

        relation.data[self.local_app].update(updated_connection_data)
        logger.debug(f"Updated S3 credentials: {updated_connection_data}")

    def _load_relation_data(self, raw_relation_data: RelationDataContent) -> Dict[str, str]:
        """Loads relation data from the relation data bag.

        Args:
            raw_relation_data: Relation data from the databag
        Returns:
            dict: Relation data in dict format.
        """
        connection_data = {}
        for key in raw_relation_data:
            try:
                connection_data[key] = json.loads(raw_relation_data[key])
            except (json.decoder.JSONDecodeError, TypeError):
                connection_data[key] = raw_relation_data[key]
        return connection_data

    def _diff(self, event: RelationChangedEvent) -> Diff:
        """Retrieves the diff of the data in the relation changed databag.

        Args:
            event: relation changed event.

        Returns:
            a Diff instance containing the added, deleted and changed
                keys from the event relation databag.
        """
        return diff(event, self.local_unit)

    def _on_relation_changed(self, event: RelationChangedEvent) -> None:
        """Notify the charm about the presence of S3 credentials."""
        # check if the mandatory options are in the relation data
        contains_required_options = True
        # get current credentials data
        credentials = self.get_s3_connection_info()
        # records missing options
        missing_options = []
        for configuration_option in S3_REQUIRED_OPTIONS:
            if configuration_option not in credentials:
                contains_required_options = False
                missing_options.append(configuration_option)
        # emit credential change event only if all mandatory fields are present
        if contains_required_options:
            getattr(self.on, "credentials_changed").emit(
                event.relation, app=event.app, unit=event.unit
            )
        else:
            logger.warning(
                f"Some mandatory fields: {missing_options} are not present, do not emit credential change event!"
            )

    def get_s3_connection_info(self) -> Dict[str, str]:
        """Return the s3 credentials as a dictionary."""
        for relation in self.relations:
            if relation and relation.app:
                return self._load_relation_data(relation.data[relation.app])

        return {}

    def _on_relation_broken(self, event: RelationBrokenEvent) -> None:
        """Notify the charm about a broken S3 credential store relation."""
        getattr(self.on, "credentials_gone").emit(event.relation, app=event.app, unit=event.unit)

    @property
    def relations(self) -> List[Relation]:
        """The list of Relation instances associated with this relation_name."""
        return list(self.charm.model.relations[self.relation_name])
