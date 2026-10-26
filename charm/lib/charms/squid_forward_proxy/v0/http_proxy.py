# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.

"""Library to manage the http-proxy relation.

This library contains the Requirer and Provider classes for handling the
http-proxy interface.

## Getting Started

To get started using the library, you just need to fetch the library using `charmcraft`.

```shell
cd some-charm
charmcraft fetch-lib charms.http_proxy.v0.http_proxy
```

### Using library as a requirer

In the `metadata.yaml` of the charm, add the following:

```yaml
requires:
  http-proxy:
    interface: http-proxy
    limit: 1
```

There are three ways to initialize the requirer class. For requirers that need to issue only
a single request, they must either use the `HttpProxyRequirer` class or the
`HttpProxyDynamicRequirer` class. `HttpProxyRequirer` class is used when the requirer parameters
are known at initialization time. `HttpProxyDynamicRequirer` class is used when the requirer
parameters are not known at initialization time and will be provided later through the
`request_http_proxy` method. The main use case for the `HttpProxyDynamicRequirer` class
is when the list of domains requiring proxy is dynamic. For requirers that need to issue
multiple requests, they must use the `HttpProxyPolyRequirer` class.

1. To initialize the requirer with parameters using the `HttpProxyRequirer` class:

```python
from charms.http_proxy.v0.http_proxy import {
    HTTPProxyNotAvailableError,
    HttpProxyRequirer
    DEFAULT_HTTP_PROXY_INTEGRATION_NAME
)

class FooCharm(ops.CharmBase):
    def __init__(self, *args):
        ...
         self.http_proxy_requirer = HttpProxyRequirer(
            self,
             relation_name=DEFAULT_HTTP_PROXY_INTEGRATION_NAME,
            domains=["example.com", "example.org"],
            auth=["userpass", "none", "srcip", "srcip+userpass"],
            src_ips=[],
        )
        self.framework.observe(
            self.on[DEFAULT_HTTP_PROXY_INTEGRATION_NAME].relation_changed, self.get_proxies
        )
        self.framework.observe(self.on.secret_changed, self.get_proxies)

    def get_proxies(self, _: ops.EventBase):
        try:
            proxies = self.http_proxy_requirer.fetch_proxies()
        except HTTPProxyUnavailableError as e:
            logging.error(f"HTTP proxy not available. Proxy status: {e.status}")
            return None
        return (proxies.http_proxy, proxies.https_proxy)
```

2. To initialize the requirer with no parameters using the `HttpProxyDynamicRequirer` class:

```python
# This will simply initialize the requirer class and it won't perform any action.
# Later provide the requirer data through the request_http_proxy method.

from charms.http_proxy.v0.http_proxy import {
    HTTPProxyNotAvailableError,
    HttpProxyDynamicRequirer,
    DEFAULT_HTTP_PROXY_INTEGRATION_NAME
)

class FooCharmDynamic(ops.CharmBase):
    def __init__(self, *args):
        ...
        self.http_proxy_dynamic_requirer = HttpProxyDynamicRequirer(
            self,
            relation_name=DEFAULT_HTTP_PROXY_INTEGRATION_NAME,
        )
        self.framework.observe(
            self.on[DEFAULT_HTTP_PROXY_INTEGRATION_NAME].relation_changed, self.get_proxies
        )
        self.framework.observe(self.on.config_changed, self.provide_proxy)
        ...

    def provide_proxy(self, _: ops.EventBase):
        # If you have initialized the HttpProxyDynamicRequirer class
        # you can call the request_http_proxy method anywhere in your charm
        # to request proxy.
        if not self.model.unit.is_leader():
            return
        self.http_proxy_dynamic_requirer.request_http_proxy(
            domains=["example.com", "example.org"],
            auth=["userpass", "none", "srcip", "srcip+userpass"],
            src_ips=[],
        )

    def get_proxies(self, _: ops.EventBase):
        try:
            proxies = self.http_proxy_requirer.fetch_proxies()
        except HTTPProxyUnavailableError as e:
            logging.error(f"HTTP proxy not available. Proxy status: {e.status}")
            return None
        return (proxies.http_proxy, proxies.https_proxy)
```

3. To initialize the requirer with multiple requests using the `HttpProxyPolyRequirer` class,
refer to the implementation in [http-proxy-policy-operator]. This class is for more advanced use
cases where developers want to issue multiple requests with different parameters.

[http-proxy-policy-operator]:
    https://github.com/canonical/http-proxy-operators/blob/main/http-proxy-policy-operator/src/charm.py


### Using library as a provider

In the `metadata.yaml` of the charm, add the following:
```yaml
provides:
  http-proxy:
    interface: http-proxy
```

Import HTTPProxyPolyProvider in your charm by adding the following to `src/charm.py`:
```python
from charms.http_proxy.v0.http_proxy import (
    DEFAULT_HTTP_PROXY_INTEGRATION_NAME,
    HttpProxyPolyProvider,
)
```

The provider class must be instantiated as follows:
```python
class FooCharm:
    def __init__(self, *args):
        super().__init__(*args, **kwargs)
        ...
        self._http_proxy_provider = HttpProxyPolyProvider(self)
        # This will simply initialize the requirer class and it won't perform any action.
        self.framework.observe(
            self.on[DEFAULT_HTTP_PROXY_INTEGRATION_NAME].relation_changed, self.provide_proxy
        )
        ...

    def provide_proxy(self, event: ops.EventBase) -> None:
        if not self.model.unit.is_leader():
            return
        relation = self.model.get_relation(DEFAULT_HTTP_PROXY_INTEGRATION_NAME)
        proxy_requests = self._http_proxy_provider.open_request_list(relation.id)
        responses = self._http_proxy_provider.open_response_list(relation.id)
        for requirer in proxy_requests.get_requirer_ids():
            request = proxy_requests.get(requirer)
            responses.add_or_replace(
                requirer_id=request.id,
                status=http_proxy.PROXY_STATUS_READY,
                auth=request.auth[0],
                http_proxy="http://proxy.test",
                https_proxy="https://proxy.test",
                user=None,
            )
"""

# The unique Charmhub library identifier, never change it
LIBID = "0dd2d8435fad41ce9a4bcdbda4d9a22d"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 2

import copy
import ipaddress
import json
import logging
import re
import urllib.parse
import uuid
from dataclasses import dataclass
from typing import Annotated, Dict, Iterable, List, Optional, Sequence, Tuple, Union, cast

import ops
from ops.framework import Object
from pydantic import (
    AnyUrl,
    BaseModel,
    ConfigDict,
    Field,
    SecretStr,
    ValidationError,
    field_validator,
    model_validator,
)

AUTH_METHOD_SRCIP_USERPASS = "srcip+userpass"
AUTH_METHOD_USERPASS = "userpass"
AUTH_METHOD_SRCIP = "srcip"
AUTH_METHOD_NONE = "none"
AUTH_METHODS = [
    AUTH_METHOD_SRCIP_USERPASS,
    AUTH_METHOD_USERPASS,
    AUTH_METHOD_SRCIP,
    AUTH_METHOD_NONE,
]
PROXY_STATUS_PENDING = "pending"
PROXY_STATUS_ACCEPTED = "accepted"
PROXY_STATUS_REJECTED = "rejected"
PROXY_STATUS_INVALID = "invalid"
PROXY_STATUS_ERROR = "error"
PROXY_STATUS_READY = "ready"
PROXY_STATUS_UNSUPPORTED = "unsupported"
PROXY_STATUSES = [
    PROXY_STATUS_PENDING,
    PROXY_STATUS_ACCEPTED,
    PROXY_STATUS_REJECTED,
    PROXY_STATUS_INVALID,
    PROXY_STATUS_UNSUPPORTED,
    PROXY_STATUS_ERROR,
    PROXY_STATUS_READY,
]
DEFAULT_HTTP_PROXY_INTEGRATION_NAME = "http-proxy"
NO_CHANGE = object()


@dataclass
class ProxyConfig:
    """Proxy configuration.

    Attributes:
        http_proxy: HTTP proxy.
        https_proxy: HTTPS proxy.
    """

    http_proxy: str
    https_proxy: str


class HTTPProxyUnavailableError(Exception):
    """Raised when HTTP proxy is not available."""

    def __init__(self, message: str, status: str | None) -> None:
        """Initialize the exception.

        Args:
            message: The exception message.
            status: The HTTP proxy status.
        """
        full_message = f"{message}. (status: {status})" if status is not None else message
        super().__init__(full_message)
        self.message = message
        self.status = status


def dedup(input_list: list[str]) -> list[str]:
    """Deduplicate a list without changing the order.

    Args:
        input_list: The input list.

    Returns:
        The deduplicated list.
    """
    seen = set()
    result = []
    for i in input_list:
        if i in seen:
            continue
        seen.add(i)
        result.append(i)
    return result


class HttpProxySpec(BaseModel):
    """HTTP proxy model.

    Attributes:
        group: group id. Along with id, uniquely identifies the proxy request within a charm scope.
        id: id. Along with group, uniquely identifies the proxy request within a charm scope.
        domains: HTTP proxy destination domains.
        auth: HTTP proxy authentication methods.
        src_ips: HTTP proxy source IPs.
    """

    group: Annotated[int, Field(ge=0)]
    id: uuid.UUID
    domains: Tuple[str, ...]
    auth: Tuple[str, ...]
    src_ips: Tuple[str, ...] = tuple()

    @staticmethod
    def parse_domain(domain: str) -> Tuple[str, int]:
        """Parse a domain string in the form of host[:port].

        Args:
            domain: The domain string.

        Returns:
            A (host, port) tuple. Port is 0 if not specified.

        Raises:
            ValueError: If the domain string is invalid.
        """
        host: str
        port: int | str
        # ipv6 (the correct way), i.e. "[::1]:8080" or "[::1]"
        if domain.startswith("["):
            if "]:" in domain:
                host, port = domain.rsplit("]:", maxsplit=1)
                host = host.removeprefix("[")
            else:
                host = domain.removeprefix("[").removesuffix("]")
                port = 0
            ipaddress.ip_network(host, strict=False)
            host = f"[{host}]"
        # ipv6 (the "incorrect" way), i.e. "fe80::1", "::1"
        elif domain.count(":") >= 2:
            ipaddress.ip_network(domain, strict=False)
            host, port = f"[{domain}]", 0
        # ipv4
        elif re.match("^[0-9.:]+$", domain):
            if ":" in domain:
                host, port = domain.rsplit(":", 1)
            else:
                host, port = domain, 0
            ipaddress.ip_address(host)
        # DNS domain
        else:
            match = re.match(
                r"^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*"
                r"([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])"
                r"(:[0-9]+)?$",
                domain,
            )
            if not match:
                raise ValueError(f"invalid domain: {domain}")
            if ":" in domain:
                host, port = domain.rsplit(":", 1)
            else:
                host, port = domain, 0
        return host, int(port)

    @field_validator("domains", mode="before")
    @classmethod
    def _validate_and_transform_domains(cls, domains: Sequence[str]) -> Tuple[str, ...]:
        """Validate and transform the domains input.

        Args:
            domains: The input domains.

        Returns:
            The canonical representation of the domains.
        """
        if domains is None:
            raise ValueError("Domains cannot be None.")
        if isinstance(domains, str):
            raise ValueError("domains cannot be a string.")
        if len(domains) == 0:
            return tuple()
        valid_domains = []
        invalid_domains = []
        for domain in domains:
            try:
                host, port = cls.parse_domain(domain)
                if not 0 <= port <= 65535:
                    raise ValueError(f"invalid port: {port}")
                if port != 0:
                    valid_domains.append(f"{host}:{port}")
                else:
                    valid_domains.append(f"{host}:80")
                    valid_domains.append(f"{host}:443")
            except ValueError:
                invalid_domains.append(domain)
        if invalid_domains:
            raise ValueError(f"invalid domains: {invalid_domains}")
        return tuple(dedup(sorted(valid_domains, key=cls.parse_domain)))

    @field_validator("auth", mode="before")
    @classmethod
    def _validate_and_transform_auth(cls, auth: Sequence[str]) -> Tuple[str, ...]:
        """Validate and transform the auth input.

        Args:
            auth: The input auth.

        Returns:
            The canonical representation of the auth.
        """
        if auth is None:
            raise ValueError("auth cannot be None.")
        if isinstance(auth, str):
            raise ValueError("auth cannot be a string.")
        if len(auth) == 0:
            return tuple()
        sorted_auth = dedup(
            sorted(
                auth,
                key=lambda a: AUTH_METHODS.index(a) if a in AUTH_METHODS else -1,
            )
        )
        return tuple(sorted_auth)

    @field_validator("src_ips", mode="before")
    @classmethod
    def _validate_and_sort_src_ip(cls, src_ips: Sequence[str]) -> Tuple[str, ...]:
        """Validate and transform the src_ips input.

        Args:
            src_ips: The input src_ips.

        Returns:
            The canonical representation of the src_ips.
        """
        if src_ips is None:
            return tuple()
        if isinstance(src_ips, str):
            raise ValueError("source IPs cannot be a string.")
        validated_ips = []
        invalid_ips = []
        for ip in src_ips:
            try:
                ipaddress.ip_network(ip, strict=False)
                validated_ips.append(ip)
            except ValueError:
                invalid_ips.append(ip)
        if invalid_ips:
            raise ValueError(f"invalid src_ips: {invalid_ips}")
        return tuple(dedup(sorted(validated_ips)))

    @model_validator(mode="after")
    def _validate(self) -> "HttpProxySpec":
        """Validate the object as a whole.

        Returns:
            The validated object.
        """
        if (
            any(auth in (AUTH_METHOD_SRCIP, AUTH_METHOD_SRCIP_USERPASS) for auth in self.auth)
            and not self.src_ips
        ):
            raise ValueError("no src_ips specified for srcip authentication")
        return self


class HttpProxyRequest(HttpProxySpec):
    """HTTP proxy request model.

    Attributes:
        implicit_src_ips: src_ips is provided implicitly.
    """

    implicit_src_ips: bool


class HttpProxyUser(BaseModel):
    """HTTP proxy user model.

    Attributes:
        username: username.
        password: password.
    """

    username: str
    password: SecretStr

    def dump(self) -> Dict[str, str]:
        """Dump the model with secret revealed.

        Returns:
            Dictionary representation of the model with secret revealed.
        """
        return {"username": self.username, "password": self.password.get_secret_value()}


class HttpProxyResponse(BaseModel):
    """HTTP proxy response model.

    Attributes:
        model_config: pydantic model config.
        group: group id. Along with id, uniquely identifies the proxy request within a charm scope.
        id: id. Along with group, uniquely identifies the proxy request within a charm scope.
        status: HTTP proxy status.
        auth: HTTP proxy authentication method.
        http_proxy: HTTP proxy.
        https_proxy: HTTPS proxy.
        user: HTTP proxy user.
    """

    model_config = ConfigDict(hide_input_in_errors=True)

    group: Annotated[int, Field(ge=0)]
    id: uuid.UUID
    status: str
    auth: Optional[str] = None
    http_proxy: Optional[AnyUrl] = None
    https_proxy: Optional[AnyUrl] = None
    user: Optional[HttpProxyUser] = None

    @field_validator("status", mode="before")
    @classmethod
    def _validate_status(cls, status: str) -> str:
        """Validate the status input.

        Args:
            status: status input.

        Returns:
            The validated status.
        """
        if status not in PROXY_STATUSES:
            raise ValueError(f"invalid status: {status}")
        return status

    @model_validator(mode="after")
    def _validate(self) -> "HttpProxyResponse":
        """Validate the object as a whole.

        Returns:
            The validated object.
        """
        if not self.http_proxy and self.https_proxy:
            raise ValueError("no http_proxy specified")
        if self.http_proxy and not self.https_proxy:
            raise ValueError("no https_proxy specified")
        if self.status == PROXY_STATUS_READY:
            if not self.auth:
                raise ValueError("auth type is missing")
            if not self.https_proxy or not self.http_proxy:
                raise ValueError("http_proxy or https_proxy is missing")
        if self.auth in (AUTH_METHOD_USERPASS, AUTH_METHOD_SRCIP_USERPASS) and not self.user:
            raise ValueError("user is missing for userpass authentication")
        return self


class IntegrationDataError(Exception):
    """Integration contains ill-formed data."""


class _HttpProxyRequestListReader:
    """Integration helper: read request list."""

    def __init__(
        self,
        charm: ops.CharmBase,
        integration: ops.Relation,
        integration_id: int,
        integration_data: ops.RelationDataContent,
    ) -> None:
        """Initialize the object.

        Args:
            charm: charm object.
            integration: integration object.
            integration_id: integration id.
            integration_data: integration data.
        """
        self._charm = charm
        self._integration = integration
        self._integration_data = integration_data
        self._integration_id = integration_id
        self._requests: Dict[str, dict] = {}
        self._load()

    def _get_remote_unit_ips(self) -> List[str]:
        """Get IPs of the remote units.

        Returns:
            IPs of the remote units.
        """
        ips = []
        for unit in self._integration.units:
            address = self._integration.data[unit].get("private-address")
            if address:
                ips.append(address)
        return ips

    def _load(self) -> None:
        """Load data from integration.

        Raises:
            IntegrationDataError: ill-formed integration data.
        """
        data = self._integration_data.get("requests", "[]")
        try:
            requests = json.loads(data)
        except json.decoder.JSONDecodeError as exc:
            raise IntegrationDataError("not json") from exc
        if not isinstance(requests, list):
            raise IntegrationDataError("not a list")
        for request in requests:
            if not isinstance(request, dict):
                raise IntegrationDataError("not a dict")
            try:
                requirer_id = request["requirer"]
            except KeyError as exc:
                raise IntegrationDataError("missing requirer id") from exc
            if requirer_id in self._requests:
                raise IntegrationDataError(f"duplicate requirer id: {requirer_id}")
            self._requests[requirer_id] = request

    def get_requirer_ids(self) -> Iterable[str]:
        """Get all requirer ids.

        Returns:
            All requirer ids.
        """
        return list(self._requests.keys())

    def get(self, requirer_id: Union[str, uuid.UUID]) -> Optional[HttpProxyRequest]:
        """Get a specific HTTP proxy request.

        Args:
            requirer_id: requirer id of the proxy request.

        Returns:
            the proxy request.
        """
        requirer_id = str(requirer_id)
        if requirer_id not in self._requests:
            return None
        request = copy.deepcopy(self._requests[requirer_id])
        request["group"] = self._integration_id
        if not request.get("src_ips"):
            src_ips = self._get_remote_unit_ips()
            request["src_ips"] = src_ips
            request["implicit_src_ips"] = True
        else:
            request["implicit_src_ips"] = False
        request["id"] = request["requirer"]
        del request["requirer"]
        return HttpProxyRequest(**request)


class _HttpProxyRequestListReadWriter(_HttpProxyRequestListReader):
    """Integration helper: read and write request list."""

    def _dump(self) -> None:
        """Write HTTP requests in the buffer to the integration."""
        requests = [self._requests[id] for id in sorted(self._requests)]
        self._integration_data["requests"] = json.dumps(
            requests, sort_keys=True, ensure_ascii=True
        )

    def delete(self, requirer_id: Union[str, uuid.UUID]) -> None:
        """Delete a HTTP proxy request.

        Args:
            requirer_id: requirer id of the proxy request.
        """
        requirer_id = str(requirer_id)
        self._requests.pop(requirer_id, None)
        self._dump()

    def add(
        self,
        requirer_id: Union[str, uuid.UUID],
        domains: Sequence[str],
        auth: Sequence[str],
        src_ips: Sequence[str] | None = None,
    ) -> None:
        """Add a new HTTP proxy request.

        Args:
            requirer_id: requirer id of the proxy request.
            domains: proxy request domains.
            auth: proxy request auth.
            src_ips: proxy request src_ips.

        Raises:
            KeyError: request already exists.
        """
        requirer_id = str(requirer_id)
        if requirer_id in self._requests:
            raise KeyError(
                f"http proxy request with requirer id {repr(requirer_id)} already exists"
            )
        # here to validate the inputs only
        HttpProxySpec(
            group=0,
            id=requirer_id,  # type: ignore
            domains=domains,  # type: ignore
            auth=auth,  # type: ignore
            src_ips=src_ips or ["10.0.0.1"],  # type: ignore
        )
        request = {
            "requirer": requirer_id,
            "domains": domains,
            "auth": auth,
        }
        if src_ips:
            request["src_ips"] = src_ips
        self._requests[requirer_id] = request
        self._dump()

    def add_or_replace(
        self,
        requirer_id: Union[str, uuid.UUID],
        domains: Sequence[str],
        auth: Sequence[str],
        src_ips: Sequence[str] | None = None,
    ) -> None:
        """Add a new HTTP proxy request or replace an existing one.

        Args:
            requirer_id: requirer id of the proxy request.
            domains: proxy request domains.
            auth: proxy request auth.
            src_ips: proxy request src_ips.
        """
        requirer_id = str(requirer_id)
        if requirer_id in self._requests:
            self.delete(requirer_id=requirer_id)
        self.add(
            requirer_id=requirer_id,
            domains=domains,
            auth=auth,
            src_ips=src_ips,
        )

    def clear(self) -> None:
        """Delete all HTTP proxy requests."""
        self._requests.clear()
        self._dump()


class _HttpProxyResponseListReader:
    """Integration helper: read response list."""

    def __init__(
        self,
        charm: ops.CharmBase,
        integration: ops.Relation,
        integration_id: int,
        integration_data: ops.RelationDataContent,
    ):
        """Initialize the object.

        Args:
            charm: charm object.
            integration: integration object.
            integration_id: integration id.
            integration_data: integration data.
        """
        self._charm = charm
        self._integration = integration
        self._integration_id = integration_id
        self._integration_data = integration_data
        self._responses: Dict[str, dict] = {}
        self._load()

    def _read_secret(self, secret_id: str) -> Dict[str, str]:
        """Read a juju secret.

        Args:
            secret_id: juju secret id.

        Returns:
            Juju secret content.
        """
        try:
            return self._charm.model.get_secret(id=secret_id).get_content(refresh=True)
        except (ops.SecretNotFoundError, ops.ModelError) as e:
            raise KeyError(f"secret {secret_id} not found or not readable") from e

    def _load(self) -> None:
        """Load responses from the integration.

        Raises:
            IntegrationDataError: ill-formed integration data.
        """
        data = self._integration_data.get("responses", "[]")
        try:
            responses = json.loads(data)
        except json.decoder.JSONDecodeError as exc:
            raise IntegrationDataError("not json") from exc
        if not isinstance(responses, list):
            raise IntegrationDataError("not a list")
        for response in responses:
            if not isinstance(response, dict):
                raise IntegrationDataError("not a dict")
            try:
                requirer_id = response["requirer"]
            except KeyError as exc:
                raise IntegrationDataError("missing requirer id") from exc
            if requirer_id in self._responses:
                raise IntegrationDataError(f"duplicate requirer id: {requirer_id}")
            self._responses[requirer_id] = response

    def _parse_response(self, data: dict, fetch_user_secrets: bool = True) -> HttpProxyResponse:
        """Parse an HTTP proxy response.

        Args:
            data: HTTP proxy response data.
            fetch_user_secrets: fetch user secrets during parsing.

        Returns:
            parsed HTTP proxy response.
        """
        data = copy.deepcopy(data)
        data["group"] = self._integration_id
        data["id"] = data["requirer"]
        del data["requirer"]
        user = data.get("user")
        if user and fetch_user_secrets:
            data["user"] = self._read_secret(secret_id=user)
        return HttpProxyResponse(**data)

    def get_requirer_ids(self) -> Iterable[str]:
        """Get all requirer ids.

        Return:
            all requirer ids.
        """
        return self._responses.keys()

    def get(self, requirer_id: Union[str, uuid.UUID]) -> Optional[HttpProxyResponse]:
        """Get a specific HTTP proxy response.

        Args:
            requirer_id: response requirer id.

        Returns:
            HTTP proxy response if exists.
        """
        requirer_id = str(requirer_id)
        if requirer_id not in self._responses:
            return None
        response = self._responses[requirer_id]
        return self._parse_response(response)


class _HttpProxyResponseListReadWriter(_HttpProxyResponseListReader):
    """Integration helper: read and write response list."""

    def _create_secret(self, content: Dict[str, str]) -> str:
        """Create a juju secret.

        Args:
            content: juju secret content

        Returns:
            Juju secret id.
        """
        secret = self._charm.app.add_secret(content=content)
        secret.grant(self._integration)
        return cast(str, secret.id)

    def _update_secret(self, secret_id: str, content: Dict[str, str]) -> None:
        """Update a juju secret.

        Args:
            secret_id: juju secret id.
            content: juju secret content.
        """
        secret = self._charm.model.get_secret(id=secret_id)
        if dict(secret.get_content(refresh=True)) != content:
            secret.set_content(content)

    def _delete_secret(self, secret_id: str) -> None:
        """Delete a juju secret.

        Args:
            secret_id: juju secret id.
        """
        secret = self._charm.model.get_secret(id=secret_id)
        secret.remove_all_revisions()

    def _dump(self) -> None:
        """Write HTTP responses in the buffer to the integration."""
        responses = [self._responses[id] for id in sorted(self._responses)]
        self._integration_data["responses"] = json.dumps(
            responses, sort_keys=True, ensure_ascii=True
        )

    def add(  # pylint: disable=too-many-arguments
        self,
        requirer_id: Union[str, uuid.UUID],
        *,
        status: str,
        auth: str | None = None,
        http_proxy: Optional[AnyUrl | str] = None,
        https_proxy: Optional[AnyUrl | str] = None,
        user: Dict[str, str] | None = None,
    ) -> None:
        """Add a new HTTP proxy response.

        Args:
            requirer_id: response requirer id.
            status: HTTP proxy status.
            auth: HTTP proxy auth.
            http_proxy: HTTP proxy url.
            https_proxy: HTTPS proxy url.
            user: HTTP proxy user.

        Raises:
            KeyError: if response already exists.
        """
        requirer_id = str(requirer_id)
        if requirer_id in self._responses:
            raise KeyError(
                f"http proxy response with requirer id {repr(requirer_id)} already exists"
            )
        # here to validate the inputs only
        HttpProxyResponse(
            group=0,
            id=requirer_id,  # type: ignore
            status=status,
            auth=auth,
            http_proxy=http_proxy,  # type: ignore
            https_proxy=https_proxy,  # type: ignore
            user=user,  # type: ignore
        )
        response = {
            "requirer": requirer_id,
            "status": status,
        }
        if auth is not None:
            response["auth"] = auth
        if user is not None:
            response["user"] = self._create_secret(user)
        if http_proxy is not None:
            response["http_proxy"] = str(http_proxy)
        if https_proxy is not None:
            response["https_proxy"] = str(https_proxy)
        self._responses[requirer_id] = response
        self._dump()

    def update(  # pylint: disable=too-many-arguments
        self,
        requirer_id: Union[str, uuid.UUID],
        *,
        status: str | object = NO_CHANGE,
        auth: str | None | object = NO_CHANGE,
        http_proxy: AnyUrl | str | None | object = NO_CHANGE,
        https_proxy: AnyUrl | str | None | object = NO_CHANGE,
        user: Dict[str, str] | None | object = NO_CHANGE,
    ) -> None:
        """Update an HTTP proxy response.

        Args:
            requirer_id: response requirer id.
            status: HTTP proxy status.
            auth: HTTP proxy auth.
            http_proxy: HTTP proxy url.
            https_proxy: HTTPS proxy url.
            user: HTTP proxy user.
        """
        requirer_id = str(requirer_id)
        response = copy.deepcopy(self._responses[requirer_id])
        if status is not NO_CHANGE:
            response["status"] = status
        if auth is not NO_CHANGE:
            response["auth"] = auth
        for key, value in {"http_proxy": http_proxy, "https_proxy": https_proxy}.items():
            if value is not NO_CHANGE:
                response[key] = str(value) if value is not None else None
        test_response = copy.deepcopy(response)
        if user is not NO_CHANGE:
            test_response["user"] = user
        # validate the input only
        self._parse_response(test_response, fetch_user_secrets=False)
        if user and user is not NO_CHANGE:
            secret_id = response.get("user")
            # mypy doesn't handle the NO_CHANGE very well
            if secret_id is None:
                response["user"] = self._create_secret(user)  # type: ignore
            else:
                self._update_secret(secret_id, user)  # type: ignore
        if user is None and response.get("user"):
            self._delete_secret(response["user"])
            response["user"] = None
        self._responses[requirer_id] = {k: v for k, v in response.items() if v is not None}
        self._dump()

    def add_or_replace(  # pylint: disable=too-many-arguments
        self,
        requirer_id: Union[str, uuid.UUID],
        *,
        status: str,
        auth: str | None = None,
        http_proxy: Optional[str | AnyUrl] = None,
        https_proxy: Optional[str | AnyUrl] = None,
        user: Dict[str, str] | None = None,
    ) -> None:
        """Add a new HTTP proxy response or replace an existing one.

        Args:
            requirer_id: response requirer id.
            status: HTTP proxy status.
            auth: HTTP proxy auth.
            http_proxy: HTTP proxy url.
            https_proxy: HTTPS proxy url.
            user: HTTP proxy user.
        """
        requirer_id = str(requirer_id)
        if requirer_id in self._responses:
            self.update(
                requirer_id=requirer_id,
                status=status,
                auth=auth,
                http_proxy=http_proxy,
                https_proxy=https_proxy,
                user=user,
            )
        else:
            self.add(
                requirer_id=requirer_id,
                status=status,
                auth=auth,
                http_proxy=http_proxy,
                https_proxy=https_proxy,
                user=user,
            )

    def delete(self, requirer_id: str) -> None:
        """Delete a HTTP proxy response.

        Args:
            requirer_id: response requirer id.
        """
        if requirer_id not in self._responses:
            return
        response = self._responses[requirer_id]
        secret_id = response.get("user")
        if secret_id:
            self._delete_secret(secret_id)
        del self._responses[requirer_id]
        self._dump()

    def clear(self) -> None:
        """Delete all HTTP proxy responses."""
        self._responses.clear()
        self._dump()

    def get_juju_secrets(self) -> List[str]:
        """Get all juju secret ids stored in the response list.

        Returns:
            A list of juju secret ids.
        """
        result = []
        for response in self._responses.values():
            secret_id = response.get("user")
            if secret_id:
                result.append(secret_id)
        return result


class HttpProxyPolyProvider:
    """HTTP proxy provider."""

    def __init__(
        self, charm: ops.CharmBase, integration_name: str = DEFAULT_HTTP_PROXY_INTEGRATION_NAME
    ) -> None:
        """Initialize the object.

        Args:
            charm: the charm instance.
            integration_name: HTTP proxy integration name.
        """
        self._charm = charm
        self._integration_name = integration_name

    def open_request_list(self, integration_id: int) -> _HttpProxyRequestListReader:
        """Start reading the request list in the integration data.

        Args:
            integration_id: integration id.

        Returns:
            A instance of HttpProxyRequestListReader.

        Raises:
            ValueError: if the integration id is invalid.
        """
        integration = self._charm.model.get_relation(
            self._integration_name, relation_id=integration_id
        )
        if integration is None:
            raise ValueError("integration not found")
        if integration.app is None:
            integration_data = {}
        else:
            integration_data = integration.data[integration.app]
        return _HttpProxyRequestListReader(
            charm=self._charm,
            integration=integration,
            integration_id=integration.id,
            integration_data=integration_data,
        )

    def open_response_list(self, integration_id: int) -> _HttpProxyResponseListReadWriter:
        """Start reading/writing the response list in the integration data.

        Args:
            integration_id: integration id.

        Returns:
            A instance of HttpProxyResponseListReadWriter.

        Raises:
            ValueError: if the integration id is invalid.
        """
        integration = self._charm.model.get_relation(
            self._integration_name, relation_id=integration_id
        )
        if integration is None:
            raise ValueError("integration not found")
        return _HttpProxyResponseListReadWriter(
            charm=self._charm,
            integration=integration,
            integration_id=integration.id,
            integration_data=integration.data[self._charm.app],
        )


class HttpProxyPolyRequirer:
    """HTTP proxy requirer."""

    def __init__(
        self, charm: ops.CharmBase, integration_name: str = DEFAULT_HTTP_PROXY_INTEGRATION_NAME
    ):
        """Initialize the object.

        Args:
            charm: the charm instance.
            integration_name: HTTP proxy integration name.
        """
        self._charm = charm
        self._integration_name = integration_name

    def open_request_list(self, integration_id: int) -> _HttpProxyRequestListReadWriter:
        """Start reading/writing the request list in the integration data.

        Args:
            integration_id: integration id.

        Returns:
            A instance of HttpProxyRequestListReadWriter.

        Raises:
            ValueError: if the integration id is invalid.
        """
        integration = self._charm.model.get_relation(
            self._integration_name, relation_id=integration_id
        )
        if integration is None:
            raise ValueError("integration not found")
        return _HttpProxyRequestListReadWriter(
            charm=self._charm,
            integration=integration,
            integration_id=integration.id,
            integration_data=integration.data[self._charm.app],
        )

    def open_response_list(self, integration_id: int) -> _HttpProxyResponseListReader:
        """Start reading the response list in the integration data.

        Args:
            integration_id: integration id.

        Returns:
            A instance of HttpProxyResponseListReader.

        Raises:
            ValueError: if the integration id is invalid.
        """
        integration = self._charm.model.get_relation(
            self._integration_name, relation_id=integration_id
        )
        if integration is None:
            raise ValueError("integration not found")
        if integration.app is None:
            integration_data = {}
        else:
            integration_data = integration.data[integration.app]
        return _HttpProxyResponseListReader(
            charm=self._charm,
            integration=integration,
            integration_id=integration.id,
            integration_data=integration_data,
        )


class _BaseHttpProxyRequirer(Object):  # pylint: disable=too-many-instance-attributes
    """Base class for HTTP proxy requirers."""

    def __init__(
        self, charm: ops.CharmBase, relation_name: str = DEFAULT_HTTP_PROXY_INTEGRATION_NAME
    ) -> None:
        """Initialize the BaseHttpProxyRequirer class.

        Args:
            charm: the charm instance.
            relation_name: HTTP proxy integration name.
        """
        super().__init__(charm, relation_name)
        self._charm = charm
        self._relation_name = relation_name
        self._relation = self.model.get_relation(relation_name)
        self._requirer_id = self._get_requirer_id()
        self._requirer = HttpProxyPolyRequirer(self._charm, self._relation_name)

    def _get_requirer_id(self) -> str:
        """Get the requirer ID from integration data or generate a new one.

        Returns:
            The requirer ID.
        """
        new_id = str(uuid.uuid4())
        if not self._relation:
            logging.warning("relation not found, using a new requirer ID")
            return new_id
        relation_data = self._relation.data[self._charm.app]
        data = relation_data.get("requests")
        if not data:
            logging.warning("no requests found in relation data, using a new requirer ID")
            return new_id
        requests = json.loads(data)
        if not requests:
            logging.warning("empty requests found in relation data, using a new requirer ID")
            return new_id
        request = requests[0]
        try:
            logging.info("using existing requirer ID : %s from relation data", request["requirer"])
            return request["requirer"]
        except KeyError:
            logging.warning("no requirer ID found in relation data, using a new requirer ID")
            return new_id

    def fetch_proxies(self) -> ProxyConfig:
        """Get HTTP proxy values returned by the provider.

        Returns:
            HTTP proxy values.

        Raises:
            HTTPProxyUnavailableError: If proxies are not ready.
        """
        response = self._get_response()
        if response.status != PROXY_STATUS_READY:
            raise HTTPProxyUnavailableError(
                message="HTTP proxy is not ready",
                status=response.status,
            )

        http_proxy_url = str(response.http_proxy)
        https_proxy_url = str(response.https_proxy)

        user = response.user
        if user:
            username, password = user.username, user.password.get_secret_value()
            http_proxy_url = self._set_user(http_proxy_url, username, password)
            https_proxy_url = self._set_user(https_proxy_url, username, password)
        try:
            proxy_config = ProxyConfig(http_proxy=http_proxy_url, https_proxy=https_proxy_url)
        except ValidationError as exc:
            raise HTTPProxyUnavailableError(
                "Invalid proxy url", status=PROXY_STATUS_READY
            ) from exc
        return proxy_config

    def _create_or_update_http_proxy_request(
        self,
        domains: Optional[Sequence[str]] = None,
        auth: Optional[Sequence[str]] = None,
        src_ips: Optional[Sequence[str]] = None,
    ) -> None:
        """Create or update a HTTP proxy request."""
        domains = domains if domains is not None else []
        auth = auth if auth is not None else []
        # relation would not be None here
        request_list = self._requirer.open_request_list(self._relation.id)  # type: ignore
        request_list.add_or_replace(
            requirer_id=self._requirer_id,
            domains=domains,
            auth=auth,
            src_ips=src_ips,
        )

    def _get_response(self) -> HttpProxyResponse:
        """Get the HTTP proxy response."""
        if not self._relation:
            raise ValueError("relation not found")

        responses = self._requirer.open_response_list(self._relation.id)
        response = responses.get(self._requirer_id)
        if not response:
            raise HTTPProxyUnavailableError(
                f"Response not found. " f"Requirer ID: {self._requirer_id}", status=None
            )
        return response

    def _set_user(self, url: str, username: str, password: str) -> str:
        """Set the user credentials in the proxy url."""
        parsed = urllib.parse.urlparse(url)
        return f"{parsed.scheme}://{username}:{password}@{parsed.netloc}"


class HttpProxyRequirer(_BaseHttpProxyRequirer):
    """HTTP proxy static requirer."""

    def __init__(  # pylint: disable=too-many-arguments
        self,
        charm: ops.CharmBase,
        relation_name: str = DEFAULT_HTTP_PROXY_INTEGRATION_NAME,
        *,
        domains: Optional[Sequence[str]] = None,
        auth: Optional[Sequence[str]] = None,
        src_ips: Optional[Sequence[str]] = None,
    ) -> None:
        """Initialize the HttpProxyRequirer class.

        Args:
            charm: The charm instance.
            relation_name: The name of the relation to use for the HTTP proxy.
            domains: Sequence of domains to request proxy access for.
            auth: Sequence of authentication modes supported by the application.
                See AUTH_METHODS for valid values.
            src_ips: Sequence of source IPs to override the source IP addresses
                provided by the Juju integration binding information.
        """
        super().__init__(charm, relation_name)
        self._domains = domains
        self._auth = auth
        self._src_ips = src_ips

        self.framework.observe(
            self._charm.on[self._relation_name].relation_joined, self._request_proxy
        )
        self.framework.observe(self._charm.on.upgrade_charm, self._request_proxy)

    def _request_proxy(self, _: ops.EventBase) -> None:
        """Request a HTTP proxy."""
        if not self._relation or not self.model.unit.is_leader():
            return
        self._create_or_update_http_proxy_request(self._domains, self._auth, self._src_ips)


class HttpProxyDynamicRequirer(_BaseHttpProxyRequirer):
    """HTTP proxy dynamic requirer."""

    def request_http_proxy(
        self,
        domains: Optional[Sequence[str]] = None,
        auth: Optional[Sequence[str]] = None,
        src_ips: Optional[Sequence[str]] = None,
    ) -> None:
        """Request a HTTP proxy.

        Args:
            domains: Sequence of domains to request proxy access for.
            auth: Sequence of authentication modes supported by the application.
                See AUTH_METHODS for valid values.
            src_ips: Sequence of source IPs to override the source IP addresses
                provided by the Juju integration binding information.

        Raises:
            ValueError: If the relation is not established.
        """
        if not self._relation:
            raise ValueError("relation not found")
        if not self.model.unit.is_leader():
            raise ValueError("unit is not leader")
        self._create_or_update_http_proxy_request(domains, auth, src_ips)
