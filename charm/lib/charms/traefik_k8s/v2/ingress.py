# Copyright 2024 Canonical Ltd.
# See LICENSE file for licensing details.

r"""# Interface Library for ingress.

This library wraps relation endpoints using the `ingress` interface
and provides a Python API for both requesting and providing per-application
ingress, with load-balancing occurring across all units.

## Getting Started

To get started using the library, you just need to fetch the library using `charmcraft`.

```shell
cd some-charm
charmcraft fetch-lib charms.traefik_k8s.v2.ingress
```

In the `metadata.yaml` of the charm, add the following:

```yaml
requires:
    ingress:
        interface: ingress
        limit: 1
```

Then, to initialise the library:

```python
from charms.traefik_k8s.v2.ingress import (IngressPerAppRequirer,
  IngressPerAppReadyEvent, IngressPerAppRevokedEvent)

class SomeCharm(CharmBase):
  def __init__(self, *args):
    # ...
    self.ingress = IngressPerAppRequirer(self, port=80)
    # The following event is triggered when the ingress URL to be used
    # by this deployment of the `SomeCharm` is ready (or changes).
    self.framework.observe(
        self.ingress.on.ready, self._on_ingress_ready
    )
    self.framework.observe(
        self.ingress.on.revoked, self._on_ingress_revoked
    )

    def _on_ingress_ready(self, event: IngressPerAppReadyEvent):
        logger.info("This app's ingress URL: %s", event.url)

    def _on_ingress_revoked(self, event: IngressPerAppRevokedEvent):
        logger.info("This app no longer has ingress")
"""
import ipaddress
import json
import logging
import socket
import typing
from dataclasses import dataclass
from functools import partial
from typing import (
    Any,
    Callable,
    Dict,
    List,
    MutableMapping,
    Optional,
    Sequence,
    Tuple,
    Union,
    cast,
)

import pydantic
from ops.charm import CharmBase, RelationBrokenEvent, RelationEvent
from ops.framework import EventSource, Object, ObjectEvents, StoredState
from ops.model import ModelError, Relation, Unit
from pydantic import AnyHttpUrl, BaseModel, Field

# The unique Charmhub library identifier, never change it
LIBID = "e6de2a5cd5b34422a204668f3b8f90d2"

# Increment this major API version when introducing breaking changes
LIBAPI = 2

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 15

PYDEPS = ["pydantic"]

DEFAULT_RELATION_NAME = "ingress"
RELATION_INTERFACE = "ingress"

log = logging.getLogger(__name__)
BUILTIN_JUJU_KEYS = {"ingress-address", "private-address", "egress-subnets"}

PYDANTIC_IS_V1 = int(pydantic.version.VERSION.split(".")[0]) < 2
if PYDANTIC_IS_V1:
    from pydantic import validator

    input_validator = partial(validator, pre=True)

    class DatabagModel(BaseModel):  # type: ignore
        """Base databag model."""

        class Config:
            """Pydantic config."""

            allow_population_by_field_name = True
            """Allow instantiating this class by field name (instead of forcing alias)."""

        _NEST_UNDER = None

        @classmethod
        def load(cls, databag: MutableMapping):
            """Load this model from a Juju databag."""
            if cls._NEST_UNDER:
                return cls.parse_obj(json.loads(databag[cls._NEST_UNDER]))

            try:
                data = {
                    k: json.loads(v)
                    for k, v in databag.items()
                    # Don't attempt to parse model-external values
                    if k in {f.alias for f in cls.__fields__.values()}  # type: ignore
                }
            except json.JSONDecodeError as e:
                msg = f"invalid databag contents: expecting json. {databag}"
                log.error(msg)
                raise DataValidationError(msg) from e

            try:
                return cls.parse_raw(json.dumps(data))  # type: ignore
            except pydantic.ValidationError as e:
                msg = f"failed to validate databag: {databag}"
                log.debug(msg, exc_info=True)
                raise DataValidationError(msg) from e

        def dump(self, databag: Optional[MutableMapping] = None, clear: bool = True):
            """Write the contents of this model to Juju databag.

            :param databag: the databag to write the data to.
            :param clear: ensure the databag is cleared before writing it.
            """
            if clear and databag:
                databag.clear()

            if databag is None:
                databag = {}

            if self._NEST_UNDER:
                databag[self._NEST_UNDER] = self.json(by_alias=True, exclude_defaults=True)
                return databag

            for key, value in self.dict(by_alias=True, exclude_defaults=True).items():  # type: ignore
                databag[key] = json.dumps(value)

            return databag

else:
    from pydantic import ConfigDict, field_validator

    input_validator = partial(field_validator, mode="before")

    class DatabagModel(BaseModel):
        """Base databag model."""

        model_config = ConfigDict(
            # tolerate additional keys in databag
            extra="ignore",
            # Allow instantiating this class by field name (instead of forcing alias).
            populate_by_name=True,
            # Custom config key: whether to nest the whole datastructure (as json)
            # under a field or spread it out at the toplevel.
            _NEST_UNDER=None,
        )  # type: ignore
        """Pydantic config."""

        @classmethod
        def load(cls, databag: MutableMapping):
            """Load this model from a Juju databag."""
            nest_under = cls.model_config.get("_NEST_UNDER")
            if nest_under:
                return cls.model_validate(json.loads(databag[nest_under]))  # type: ignore

            try:
                data = {
                    k: json.loads(v)
                    for k, v in databag.items()
                    # Don't attempt to parse model-external values
                    if k in {(f.alias or n) for n, f in cls.model_fields.items()}  # type: ignore
                }
            except json.JSONDecodeError as e:
                msg = f"invalid databag contents: expecting json. {databag}"
                log.error(msg)
                raise DataValidationError(msg) from e

            try:
                return cls.model_validate_json(json.dumps(data))  # type: ignore
            except pydantic.ValidationError as e:
                msg = f"failed to validate databag: {databag}"
                log.debug(msg, exc_info=True)
                raise DataValidationError(msg) from e

        def dump(self, databag: Optional[MutableMapping] = None, clear: bool = True):
            """Write the contents of this model to Juju databag.

            :param databag: the databag to write the data to.
            :param clear: ensure the databag is cleared before writing it.
            """
            if clear and databag:
                databag.clear()

            if databag is None:
                databag = {}
            nest_under = self.model_config.get("_NEST_UNDER")
            if nest_under:
                databag[nest_under] = self.model_dump_json(  # type: ignore
                    by_alias=True,
                    # skip keys whose values are default
                    exclude_defaults=True,
                )
                return databag

            dct = self.model_dump(mode="json", by_alias=True, exclude_defaults=True)  # type: ignore
            databag.update({k: json.dumps(v) for k, v in dct.items()})
            return databag


# todo: import these models from charm-relation-interfaces/ingress/v2 instead of redeclaring them
class IngressUrl(BaseModel):
    """Ingress url schema."""

    url: AnyHttpUrl


class IngressProviderAppData(DatabagModel):
    """Ingress application databag schema."""

    ingress: Optional[IngressUrl] = None


class ProviderSchema(BaseModel):
    """Provider schema for Ingress."""

    app: IngressProviderAppData


class IngressHealthCheck(BaseModel):
    """HealthCheck schema for Ingress."""

    path: str = Field(description="The health check endpoint path (required).")
    scheme: Optional[str] = Field(
        default=None, description="Replaces the server URL scheme for the health check endpoint."
    )
    hostname: Optional[str] = Field(
        default=None, description="Hostname to be set in the health check request."
    )
    port: Optional[int] = Field(
        default=None, description="Replaces the server URL port for the health check endpoint."
    )
    interval: str = Field(default="30s", description="Frequency of the health check calls.")
    timeout: str = Field(default="5s", description="Maximum duration for a health check request.")


class IngressRequirerAppData(DatabagModel):
    """Ingress requirer application databag model."""

    model: str = Field(description="The model the application is in.")
    name: str = Field(description="the name of the app requesting ingress.")
    port: int = Field(description="The port the app wishes to be exposed.")
    healthcheck_params: Optional[IngressHealthCheck] = Field(
        default=None, description="Optional health check configuration for ingress."
    )

    # fields on top of vanilla 'ingress' interface:
    strip_prefix: Optional[bool] = Field(
        default=False,
        description="Whether to strip the prefix from the ingress url.",
        alias="strip-prefix",
    )
    redirect_https: Optional[bool] = Field(
        default=False,
        description="Whether to redirect http traffic to https.",
        alias="redirect-https",
    )

    scheme: Optional[str] = Field(
        default="http", description="What scheme to use in the generated ingress url"
    )

    @input_validator("scheme")
    def validate_scheme(cls, scheme):  # noqa: N805  # pydantic wants 'cls' as first arg
        """Validate scheme arg."""
        if scheme not in {"http", "https", "h2c"}:
            raise ValueError("invalid scheme: should be one of `http|https|h2c`")
        return scheme

    @input_validator("port")
    def validate_port(cls, port):  # noqa: N805  # pydantic wants 'cls' as first arg
        """Validate port."""
        assert isinstance(port, int), type(port)
        assert 0 < port < 65535, "port out of TCP range"
        return port


class IngressRequirerUnitData(DatabagModel):
    """Ingress requirer unit databag model."""

    host: str = Field(description="Hostname at which the unit is reachable.")
    ip: Optional[str] = Field(
        None,
        description="IP at which the unit is reachable, "
        "IP can only be None if the IP information can't be retrieved from juju.",
    )

    @input_validator("host")
    def validate_host(cls, host):  # noqa: N805  # pydantic wants 'cls' as first arg
        """Validate host."""
        assert isinstance(host, str), type(host)
        return host

    @input_validator("ip")
    def validate_ip(cls, ip):  # noqa: N805  # pydantic wants 'cls' as first arg
        """Validate ip."""
        if ip is None:
            return None
        if not isinstance(ip, str):
            raise TypeError(f"got ip of type {type(ip)} instead of expected str")
        try:
            ipaddress.IPv4Address(ip)
            return ip
        except ipaddress.AddressValueError:
            pass
        try:
            ipaddress.IPv6Address(ip)
            return ip
        except ipaddress.AddressValueError:
            raise ValueError(f"{ip!r} is not a valid ip address")


class RequirerSchema(BaseModel):
    """Requirer schema for Ingress."""

    app: IngressRequirerAppData
    unit: IngressRequirerUnitData


class IngressError(RuntimeError):
    """Base class for custom errors raised by this library."""


class NotReadyError(IngressError):
    """Raised when a relation is not ready."""


class DataValidationError(IngressError):
    """Raised when data validation fails on IPU relation data."""


class _IngressPerAppBase(Object):
    """Base class for IngressPerUnit interface classes."""

    def __init__(self, charm: CharmBase, relation_name: str = DEFAULT_RELATION_NAME):
        super().__init__(charm, relation_name)

        self.charm: CharmBase = charm
        self.relation_name = relation_name
        self.app = self.charm.app
        self.unit = self.charm.unit

        observe = self.framework.observe
        rel_events = charm.on[relation_name]
        observe(rel_events.relation_created, self._handle_relation)
        observe(rel_events.relation_joined, self._handle_relation)
        observe(rel_events.relation_changed, self._handle_relation)
        observe(rel_events.relation_departed, self._handle_relation)
        observe(rel_events.relation_broken, self._handle_relation_broken)
        observe(charm.on.leader_elected, self._handle_upgrade_or_leader)  # type: ignore
        observe(charm.on.upgrade_charm, self._handle_upgrade_or_leader)  # type: ignore

    @property
    def relations(self):
        """The list of Relation instances associated with this endpoint."""
        return list(self.charm.model.relations[self.relation_name])

    def _handle_relation(self, event):
        """Subclasses should implement this method to handle a relation update."""
        pass

    def _handle_relation_broken(self, event):
        """Subclasses should implement this method to handle a relation breaking."""
        pass

    def _handle_upgrade_or_leader(self, event):
        """Subclasses should implement this method to handle upgrades or leadership change."""
        pass


class _IPAEvent(RelationEvent):
    __args__: Tuple[str, ...] = ()
    __optional_kwargs__: Dict[str, Any] = {}

    @classmethod
    def __attrs__(cls):
        return cls.__args__ + tuple(cls.__optional_kwargs__.keys())

    def __init__(self, handle, relation, *args, **kwargs):
        super().__init__(handle, relation)

        if not len(self.__args__) == len(args):
            raise TypeError("expected {} args, got {}".format(len(self.__args__), len(args)))

        for attr, obj in zip(self.__args__, args):
            setattr(self, attr, obj)
        for attr, default in self.__optional_kwargs__.items():
            obj = kwargs.get(attr, default)
            setattr(self, attr, obj)

    def snapshot(self):
        dct = super().snapshot()
        for attr in self.__attrs__():
            obj = getattr(self, attr)
            try:
                dct[attr] = obj
            except ValueError as e:
                raise ValueError(
                    "cannot automagically serialize {}: "
                    "override this method and do it "
                    "manually.".format(obj)
                ) from e

        return dct

    def restore(self, snapshot) -> None:
        super().restore(snapshot)
        for attr, obj in snapshot.items():
            setattr(self, attr, obj)


class IngressPerAppDataProvidedEvent(_IPAEvent):
    """Event representing that ingress data has been provided for an app."""

    __args__ = ("name", "model", "hosts", "strip_prefix", "redirect_https")

    if typing.TYPE_CHECKING:
        name: Optional[str] = None
        model: Optional[str] = None
        # sequence of hostname, port dicts
        hosts: Sequence["IngressRequirerUnitData"] = ()
        strip_prefix: bool = False
        redirect_https: bool = False


class IngressPerAppDataRemovedEvent(RelationEvent):
    """Event representing that ingress data has been removed for an app."""


class IngressPerAppProviderEvents(ObjectEvents):
    """Container for IPA Provider events."""

    data_provided = EventSource(IngressPerAppDataProvidedEvent)
    data_removed = EventSource(IngressPerAppDataRemovedEvent)


@dataclass
class IngressRequirerData:
    """Data exposed by the ingress requirer to the provider."""

    app: "IngressRequirerAppData"
    units: List["IngressRequirerUnitData"]


class IngressPerAppProvider(_IngressPerAppBase):
    """Implementation of the provider of ingress."""

    on = IngressPerAppProviderEvents()  # type: ignore

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str = DEFAULT_RELATION_NAME,
    ):
        """Constructor for IngressPerAppProvider.

        Args:
            charm: The charm that is instantiating the instance.
            relation_name: The name of the relation endpoint to bind to
                (defaults to "ingress").
        """
        super().__init__(charm, relation_name)

    def _handle_relation(self, event):
        # created, joined or changed: if remote side has sent the required data:
        # notify listeners.
        if self.is_ready(event.relation):
            data = self.get_data(event.relation)
            self.on.data_provided.emit(  # type: ignore
                event.relation,
                data.app.name,
                data.app.model,
                [
                    unit.dict() if PYDANTIC_IS_V1 else unit.model_dump(mode="json")
                    for unit in data.units
                ],
                data.app.strip_prefix or False,
                data.app.redirect_https or False,
            )

    def _handle_relation_broken(self, event):
        self.on.data_removed.emit(event.relation)  # type: ignore

    def wipe_ingress_data(self, relation: Relation):
        """Clear ingress data from relation."""
        assert self.unit.is_leader(), "only leaders can do this"
        try:
            relation.data
        except ModelError as e:
            log.warning(
                "error {} accessing relation data for {!r}. "
                "Probably a ghost of a dead relation is still "
                "lingering around.".format(e, relation.name)
            )
            return
        del relation.data[self.app]["ingress"]

    def _get_requirer_units_data(self, relation: Relation) -> List["IngressRequirerUnitData"]:
        """Fetch and validate the requirer's app databag."""
        out: List["IngressRequirerUnitData"] = []

        unit: Unit
        for unit in relation.units:
            databag = relation.data[unit]
            try:
                data = IngressRequirerUnitData.load(databag)
                out.append(data)
            except pydantic.ValidationError:
                log.info(f"failed to validate remote unit data for {unit}")
                raise
        return out

    @staticmethod
    def _get_requirer_app_data(relation: Relation) -> "IngressRequirerAppData":
        """Fetch and validate the requirer's app databag."""
        app = relation.app
        if app is None:
            raise NotReadyError(relation)

        databag = relation.data[app]
        return IngressRequirerAppData.load(databag)

    def get_data(self, relation: Relation) -> IngressRequirerData:
        """Fetch the remote (requirer) app and units' databags."""
        try:
            return IngressRequirerData(
                self._get_requirer_app_data(relation), self._get_requirer_units_data(relation)
            )
        except (pydantic.ValidationError, DataValidationError) as e:
            raise DataValidationError("failed to validate ingress requirer data") from e

    def is_ready(self, relation: Optional[Relation] = None):
        """The Provider is ready if the requirer has sent valid data."""
        if not relation:
            return any(map(self.is_ready, self.relations))

        try:
            self.get_data(relation)
        except (DataValidationError, NotReadyError) as e:
            log.debug("Provider not ready; validation error encountered: %s" % str(e))
            return False
        return True

    def _published_url(self, relation: Relation) -> Optional["IngressProviderAppData"]:
        """Fetch and validate this app databag; return the ingress url."""
        if not self.is_ready(relation) or not self.unit.is_leader():
            # Handle edge case where remote app name can be missing, e.g.,
            # relation_broken events.
            # Also, only leader units can read own app databags.
            # FIXME https://github.com/canonical/traefik-k8s-operator/issues/34
            return None

        # fetch the provider's app databag
        databag = relation.data[self.app]
        if not databag.get("ingress"):
            raise NotReadyError("This application did not `publish_url` yet.")

        return IngressProviderAppData.load(databag)

    def publish_url(self, relation: Relation, url: str):
        """Publish to the app databag the ingress url."""
        ingress_url = {"url": url}
        try:
            IngressProviderAppData(ingress=ingress_url).dump(relation.data[self.app])  # type: ignore
        except pydantic.ValidationError as e:
            # If we cannot validate the url as valid, publish an empty databag and log the error.
            log.error(f"Failed to validate ingress url '{url}' - got ValidationError {e}")
            log.error(
                "url was not published to ingress relation for {relation.app}.  This error is likely due to an"
                " error or misconfiguration of the charm calling this library."
            )
            IngressProviderAppData(ingress=None).dump(relation.data[self.app])  # type: ignore

    @property
    def proxied_endpoints(self) -> Dict[str, Dict[str, str]]:
        """Returns the ingress settings provided to applications by this IngressPerAppProvider.

        For example, when this IngressPerAppProvider has provided the
        `http://foo.bar/my-model.my-app` URL to the my-app application, the returned dictionary
        will be:

        ```
        {
            "my-app": {
                "url": "http://foo.bar/my-model.my-app"
            }
        }
        ```
        """
        results: Dict[str, Dict[str, str]] = {}

        for ingress_relation in self.relations:
            if not ingress_relation.app:
                log.warning(
                    f"no app in relation {ingress_relation} when fetching proxied endpoints: skipping"
                )
                continue
            try:
                ingress_data = self._published_url(ingress_relation)
            except NotReadyError:
                log.warning(
                    f"no published url found in {ingress_relation}: "
                    f"traefik didn't publish_url yet to this relation."
                )
                continue

            if not ingress_data:
                log.warning(f"relation {ingress_relation} not ready yet: try again in some time.")
                continue

            # Validation above means ingress cannot be None, but type checker doesn't know that.
            ingress = ingress_data.ingress
            ingress = cast(IngressProviderAppData, ingress)
            if PYDANTIC_IS_V1:
                results[ingress_relation.app.name] = ingress.dict()
            else:
                results[ingress_relation.app.name] = ingress.model_dump(mode="json")
        return results


class IngressPerAppReadyEvent(_IPAEvent):
    """Event representing that ingress for an app is ready."""

    __args__ = ("url",)
    if typing.TYPE_CHECKING:
        url: Optional[str] = None


class IngressPerAppRevokedEvent(RelationEvent):
    """Event representing that ingress for an app has been revoked."""


class IngressPerAppRequirerEvents(ObjectEvents):
    """Container for IPA Requirer events."""

    ready = EventSource(IngressPerAppReadyEvent)
    revoked = EventSource(IngressPerAppRevokedEvent)


class IngressPerAppRequirer(_IngressPerAppBase):
    """Implementation of the requirer of the ingress relation."""

    on = IngressPerAppRequirerEvents()  # type: ignore

    # used to prevent spurious urls to be sent out if the event we're currently
    # handling is a relation-broken one.
    _stored = StoredState()

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str = DEFAULT_RELATION_NAME,
        *,
        host: Optional[str] = None,
        ip: Optional[str] = None,
        port: Optional[int] = None,
        strip_prefix: bool = False,
        redirect_https: bool = False,
        # fixme: this is horrible UX.
        #  shall we switch to manually calling provide_ingress_requirements with all args when ready?
        scheme: Union[Callable[[], str], str] = lambda: "http",
        healthcheck_params: Optional[Dict[str, Any]] = None,
    ):
        """Constructor for IngressRequirer.

        The request args can be used to specify the ingress properties when the
        instance is created. If any are set, at least `port` is required, and
        they will be sent to the ingress provider as soon as it is available.
        All request args must be given as keyword args.

        Args:
            charm: The charm that is instantiating the library.
            relation_name: The name of the relation endpoint to bind to (defaults to "ingress");
                the relation must be of interface type "ingress" and have a limit of 1.
            host: Hostname to be used by the ingress provider to address the requiring
                application; if unspecified, the default Kubernetes service name will be used.
            ip: Alternative addressing method other than host to be used by the ingress provider;
                if unspecified, the binding address from the Juju network API will be used.
            healthcheck_params: Optional dictionary containing health check
                configuration parameters conforming to the IngressHealthCheck schema. The dictionary must include:
                    - "path" (str): The health check endpoint path (required).
                It may also include:
                    - "scheme" (Optional[str]): Replaces the server URL scheme for the health check endpoint.
                    - "hostname" (Optional[str]): Hostname to be set in the health check request.
                    - "port" (Optional[int]): Replaces the server URL port for the health check endpoint.
                    - "interval" (str): Frequency of the health check calls (defaults to "30s" if omitted).
                    - "timeout" (str): Maximum duration for a health check request (defaults to "5s" if omitted).
                If provided, "path" is required while "interval" and "timeout" will use Traefik's defaults when not specified.
            strip_prefix: Configure Traefik to strip the path prefix.
            redirect_https: Redirect incoming requests to HTTPS.
            scheme: Either a callable that returns the scheme to use when constructing the ingress URL,
                or a string if the scheme is known and stable at charm initialization.

        Request Args:
            port: the port of the service
        """
        super().__init__(charm, relation_name)
        self.charm: CharmBase = charm
        self.healthcheck_params = healthcheck_params
        self.relation_name = relation_name
        self._strip_prefix = strip_prefix
        self._redirect_https = redirect_https
        self._get_scheme = scheme if callable(scheme) else lambda: scheme

        self._stored.set_default(current_url=None)  # type: ignore

        # if instantiated with a port, and we are related, then
        # we immediately publish our ingress data  to speed up the process.
        if port:
            self._auto_data = host, ip, port
        else:
            self._auto_data = None

    def _handle_relation(self, event):
        # created, joined or changed: if we have auto data: publish it
        self._publish_auto_data()
        if self.is_ready():
            # Avoid spurious events, emit only when there is a NEW URL available
            new_url = (
                None
                if isinstance(event, RelationBrokenEvent)
                else self._get_url_from_relation_data()
            )
            if self._stored.current_url != new_url:  # type: ignore
                self._stored.current_url = new_url  # type: ignore
                self.on.ready.emit(event.relation, new_url)  # type: ignore

    def _handle_relation_broken(self, event):
        self._stored.current_url = None  # type: ignore
        self.on.revoked.emit(event.relation)  # type: ignore

    def _handle_upgrade_or_leader(self, event):
        """On upgrade/leadership change: ensure we publish the data we have."""
        self._publish_auto_data()

    def is_ready(self):
        """The Requirer is ready if the Provider has sent valid data."""
        try:
            return bool(self._get_url_from_relation_data())
        except DataValidationError as e:
            log.debug("Requirer not ready; validation error encountered: %s" % str(e))
            return False

    def _publish_auto_data(self):
        if self._auto_data:
            host, ip, port = self._auto_data
            self.provide_ingress_requirements(host=host, ip=ip, port=port)

    def provide_ingress_requirements(
        self,
        *,
        scheme: Optional[str] = None,
        host: Optional[str] = None,
        ip: Optional[str] = None,
        port: int,
    ):
        """Publishes the data that Traefik needs to provide ingress.

        Args:
            scheme: Scheme to be used; if unspecified, use the one used by __init__.
            host: Hostname to be used by the ingress provider to address the
             requirer unit; if unspecified, FQDN will be used instead
            ip: Alternative addressing method other than host to be used by the ingress provider.
                if unspecified, binding address from juju network API will be used.
            port: the port of the service (required)
        """
        for relation in self.relations:
            self._provide_ingress_requirements(scheme, host, ip, port, relation)

    def _provide_ingress_requirements(
        self,
        scheme: Optional[str],
        host: Optional[str],
        ip: Optional[str],
        port: int,
        relation: Relation,
    ):
        if self.unit.is_leader():
            self._publish_app_data(scheme, port, relation)

        self._publish_unit_data(host, ip, relation)

    def _publish_unit_data(
        self,
        host: Optional[str],
        ip: Optional[str],
        relation: Relation,
    ):
        if not host:
            host = socket.getfqdn()

        if ip is None:
            network_binding = self.charm.model.get_binding(relation)
            if (
                network_binding is not None
                and (bind_address := network_binding.network.bind_address) is not None
            ):
                ip = str(bind_address)
            else:
                log.error("failed to retrieve ip information from juju")

        unit_databag = relation.data[self.unit]
        try:
            IngressRequirerUnitData(host=host, ip=ip).dump(unit_databag)
        except pydantic.ValidationError as e:
            msg = "failed to validate unit data"
            log.info(msg, exc_info=True)  # log to INFO because this might be expected
            raise DataValidationError(msg) from e

    def _publish_app_data(
        self,
        scheme: Optional[str],
        port: int,
        relation: Relation,
    ):
        # assumes leadership!
        app_databag = relation.data[self.app]

        if not scheme:
            # If scheme was not provided, use the one given to the constructor.
            scheme = self._get_scheme()

        try:
            IngressRequirerAppData(  # type: ignore  # pyright does not like aliases
                model=self.model.name,
                name=self.app.name,
                scheme=scheme,
                port=port,
                strip_prefix=self._strip_prefix,  # type: ignore  # pyright does not like aliases
                redirect_https=self._redirect_https,  # type: ignore  # pyright does not like aliases
                healthcheck_params=(
                    IngressHealthCheck(**self.healthcheck_params)
                    if self.healthcheck_params
                    else None
                ),
            ).dump(app_databag)
        except pydantic.ValidationError as e:
            msg = "failed to validate app data"
            log.info(msg, exc_info=True)  # log to INFO because this might be expected
            raise DataValidationError(msg) from e

    @property
    def relation(self):
        """The established Relation instance, or None."""
        return self.relations[0] if self.relations else None

    def _get_url_from_relation_data(self) -> Optional[str]:
        """The full ingress URL to reach the current unit.

        Returns None if the URL isn't available yet.
        """
        relation = self.relation
        if not relation or not relation.app:
            return None

        # fetch the provider's app databag
        try:
            databag = relation.data[relation.app]
        except ModelError as e:
            log.debug(
                f"Error {e} attempting to read remote app data; "
                f"probably we are in a relation_departed hook"
            )
            return None

        if not databag:  # not ready yet
            return None

        ingress = IngressProviderAppData.load(databag).ingress
        if ingress is None:
            return None

        return str(ingress.url)

    @property
    def url(self) -> Optional[str]:
        """The full ingress URL to reach the current unit.

        Returns None if the URL isn't available yet.
        """
        data = (
            typing.cast(Optional[str], self._stored.current_url)  # type: ignore
            or self._get_url_from_relation_data()
        )
        return data
