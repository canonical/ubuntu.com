---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: kubernetes/docs/shared/_side-navigation.md
context:
  title: 'Docker-registry charm '
  description: Registry for docker images
keywords: component, charms, versions, release
tags:
    - reference
sidebar: k8smain-sidebar
permalink: 1.16/charm-docker-registry.html
layout:
    - base
    - ubuntu-com
toc: false
charm_revision: '152'
bundle_release: '1.16'
---

This charm provides a registry for storage and distribution of docker images.
See [https://docs.docker.com/registry/][upstream-project] for details.

[upstream-project]: https://docs.docker.com/registry/

## Deployment

The registry is deployed as a stand alone application and supports integration
with clients that implement the [docker-registry][interface] interface.

[interface]: https://github.com/juju-solutions/interface-docker-registry

### Standalone Registry

For testing purposes, a simple, insecure registry can be deployed with:

```bash
juju deploy cs:~containers/docker-registry
```

### Secure Registry with TLS

This charm supports TLS via the `tls-certificates` relation. This can
be enabled by deploying and relating to a TLS provider, such as `easyrsa`:

```bash
juju deploy cs:~containers/docker-registry
juju deploy cs:~containers/easyrsa

juju add-relation easyrsa docker-registry
```

This charm also supports configuration-based TLS, which does not require a
relation to a TLS provider. Instead, transfer required files and configure
this charm as follows:

```bash
juju scp /my/local/ca.pem docker-registry/0:/home/ubuntu/ca.pem
juju scp /my/local/cert.crt docker-registry/0:/home/ubuntu/cert.crt
juju scp /my/local/cert.key docker-registry/0:/home/ubuntu/cert.key

juju config docker-registry \
  tls-ca-path=/home/ubuntu/ca.pem \
  tls-cert-path=/home/ubuntu/cert.crt \
  tls-key-path=/home/ubuntu/cert.key
```

Finally, custom TLS data may be provided as base64-encoded config options to
the charm. The configured `tls-*-blob` data will be written to corresponding
configured `tls-*-path` files:

```bash
juju config docker-registry \
  tls-ca-blob=$(base64 /path/to/ca) \
  tls-cert-blob=$(base64 /path/to/cert) \
  tls-key-blob=$(base64 /path/to/key)
```

### Proxied Registry

This charm supports an `http` proxy relation that allows operators to
control how the registry is exposed on the network. This is achieved by
deploying and relating to a proxy provider, such as `haproxy`:

```bash
juju deploy cs:~containers/docker-registry
juju deploy haproxy

juju add-relation haproxy docker-registry
```

When multiple `docker-registry` units are deployed, the proxy will be
configured with one unit chosen as the primary proxied service with remaining
units configured as backups. This provides a highly available deployment that
will fail over to a backup if the primary service becomes unavailable.

>Note: HA deployments require the proxy to be in `active-passive` peering
mode, which is the default for `haproxy`.

#### TLS/SSL
TLS is supported between `haproxy` and `docker-registry`, though some manual
configuration is required. You will need to transfer the registry CA certificate
to the proxy so the registry certificate can be verified. The path to the
CA must match on both registry and proxy units. For example:

```bash
juju run --unit haproxy/$UNIT_NUM 'mkdir -p /etc/docker/registry'
juju run --unit haproxy/$UNIT_NUM 'chown ubuntu:ubuntu /etc/docker/registry'
juju scp docker-registry/$UNIT_NUM:/etc/docker/registry/ca.crt ./ca.crt
juju scp ./ca.crt haproxy/$UNIT_NUM:/etc/docker/registry
```

### Nagios Monitoring

This charm supports monitoring with nagios:

```bash
juju deploy cs:~containers/docker-registry
juju deploy nrpe --series bionic

juju relate docker-registry nrpe
```

### Kubernetes Integration

See the [Private Docker Registry][k8s-docs] documentation for details on
integrating this charm with Kubernetes.

[k8s-docs]: https://www.ubuntu.com/kubernetes/docs/docker-registry

## Actions

### Adding Images

To make an image available in the deployed registry, it must be tagged and
pushed. This charm provides the `push` action to do this:

```bash
juju run-action --wait docker-registry/0 push \
  image=<image> pull=<True|False> tag=<optional-tag-name>
```

This action will always tag and push a local image to the registry. By
specifying `pull=True` (the default), the action will first pull the
given `image` and subsequently tag/push it.

The default image tag is 'net_loc/name:version', where 'net_loc' is the
`http-host` config option or http[s]://[private-ip]:[port] if config is not
set. The image tag can be overriden by specifying the `tag` action parameter.

### Listing Images

List images known to the registry with the `images` action:

```bash
juju run-action --wait docker-registry/0 images \
  options=<extra-args> repository=<repository[:tag]>
```

This runs `docker images` on the registry machine. The optional `options` and
`repository` parameters are passed through to the underlying command. For
example, show non-truncated output with numeric image IDs:

```bash
juju run-action --wait docker-registry/0 images \
  options="--no-trunc --quiet"
```

### Removing Images

Remove images from the registry with the `rmi` action:

```bash
juju run-action --wait docker-registry/0 rmi \
  options=<extra-args> image=<image [image...]>
```

This runs `docker rmi` on the registry machine. The image name (or space
separated names) must be specified using the `image` parameter. The optional
`options` parameter is passed through to the underlying command. For
example, remove the ubuntu:18.04 image without deleting untagged parents:

```bash
juju run-action --wait docker-registry/0 rmi \
  options="--no-prune" image="ubuntu:18.04"
```

### Starting/Stopping

The registry is configured to start automatically with the dockerd system
service. It can also be started or stopped with charm actions as follows:

```bash
juju run-action --wait docker-registry/0 stop
juju run-action --wait docker-registry/0 start
```

## Configuration

<!-- CONFIG STARTS -->
<!--AUTOGENERATED CONFIG TEXT - DO NOT EDIT -->


| name | type   | Default      | Description                               |
|------|--------|--------------|-------------------------------------------|
| <a id="table-apt-key-server"> </a> apt-key-server | string | [See notes](#apt-key-server-default) | APT Key Server  |
| <a id="table-auth-basic-password"> </a> auth-basic-password | string |  | Password for basic (htpasswd) authentication. Set this to something other than an empty string to configure basic auth for the registry.  |
| <a id="table-auth-basic-user"> </a> auth-basic-user | string | admin | Username for basic (htpasswd) authentication.  |
| <a id="table-auth-token-issuer"> </a> auth-token-issuer | string |  | The name on the certificate that authentication tokens must me signed by.  |
| <a id="table-auth-token-realm"> </a> auth-token-realm | string |  | The location from which clients should fetch authentication tokens.  |
| <a id="table-auth-token-root-certs"> </a> auth-token-root-certs | string |  | The root certificate bundle (base64 encoded) for the authentication tokens.  |
| <a id="table-auth-token-service"> </a> auth-token-service | string |  | The name of the server which authentication tokens will be addressed to.  |
| <a id="table-cuda_repo"> </a> cuda_repo | string | 10.0.130-1 | The cuda-repo package version to install.  |
| <a id="table-docker-ce-package"> </a> docker-ce-package | string | [See notes](#docker-ce-package-default) | The pinned version of docker-ce package installed with nvidia-docker.  |
| <a id="table-docker-opts"> </a> docker-opts | string |  | Extra options to pass to the Docker daemon. e.g. --insecure-registry.  |
| <a id="table-docker_runtime"> </a> docker_runtime | string | auto | [See notes](#docker_runtime-description)  |
| <a id="table-docker_runtime_key_url"> </a> docker_runtime_key_url | string |  | Custom Docker repository validation key URL.  |
| <a id="table-docker_runtime_package"> </a> docker_runtime_package | string |  | Custom Docker repository package name.  |
| <a id="table-docker_runtime_repo"> </a> docker_runtime_repo | string |  | [See notes](#docker_runtime_repo-description)  |
| <a id="table-enable-cgroups"> </a> enable-cgroups | boolean | False | Enable GRUB cgroup overrides cgroup_enable=memory swapaccount=1. WARNING changing this option will reboot the host - use with caution on production services.  |
| <a id="table-extra_packages"> </a> extra_packages | string |  | Space separated list of extra deb packages to install.  |
| <a id="table-http-host"> </a> http-host | string |  | [See notes](#http-host-description)  |
| <a id="table-http_proxy"> </a> http_proxy | string |  | URL to use for HTTP_PROXY to be used by Docker. Useful in egress-filtered environments where a proxy is the only option for accessing the registry to pull images.  |
| <a id="table-https_proxy"> </a> https_proxy | string |  | URL to use for HTTPS_PROXY to be used by Docker. Useful in egress-filtered environments where a proxy is the only option for accessing the registry to pull images.  |
| <a id="table-install_from_upstream"> </a> install_from_upstream | boolean | False | Toggle installation from Ubuntu archive vs the Docker PPA (DEPRECATED; please use docker_runtime instead).  |
| <a id="table-install_keys"> </a> install_keys | string |  | [See notes](#install_keys-description)  |
| <a id="table-install_sources"> </a> install_sources | string |  | [See notes](#install_sources-description)  |
| <a id="table-log-level"> </a> log-level | string | info | Logging output level ('error', 'warn', 'info', or 'debug').  |
| <a id="table-nagios_context"> </a> nagios_context | string | juju | [See notes](#nagios_context-description)  |
| <a id="table-nagios_servicegroups"> </a> nagios_servicegroups | string |  | A comma-separated list of nagios servicegroups. If left empty, the nagios_context will be used as the servicegroup  |
| <a id="table-no_proxy"> </a> no_proxy | string |  | [See notes](#no_proxy-description)  |
| <a id="table-nvidia-container-runtime-package"> </a> nvidia-container-runtime-package | string | [See notes](#nvidia-container-runtime-package-default) | The pinned version of nvidia-container-runtime package.  |
| <a id="table-nvidia-docker-package"> </a> nvidia-docker-package | string | [See notes](#nvidia-docker-package-default) | The pinned version of nvidia-docker2 package.  |
| <a id="table-package_status"> </a> package_status | string | install | The status of service-affecting packages will be set to this value in the dpkg database. Valid values are "install" and "hold".  |
| <a id="table-registry-image"> </a> registry-image | string | registry:2 | Registry image.  |
| <a id="table-registry-name"> </a> registry-name | string | registry | Name of the registry container.  |
| <a id="table-registry-port"> </a> registry-port | int | 5000 | The external port on which the docker registry listens.  |
| <a id="table-storage-delete"> </a> storage-delete | boolean | False | Enable/disable the "delete" storage option. False, the default, disables this option in the registry config file.  |
| <a id="table-storage-read-only"> </a> storage-read-only | boolean | False | Enable/disable the "readonly" storage maintenance option. False, the default, disables this option in the registry config file.  |
| <a id="table-storage-swift-authurl"> </a> storage-swift-authurl | string |  | The URL of the keystone used to authenticate to swift.  |
| <a id="table-storage-swift-container"> </a> storage-swift-container | string | docker-registry | The name of the swift container that will hold the images.  |
| <a id="table-storage-swift-domain"> </a> storage-swift-domain | string |  | OpenStack Identity v3 API domain.  |
| <a id="table-storage-swift-password"> </a> storage-swift-password | string |  | The password to use to access swift.  |
| <a id="table-storage-swift-region"> </a> storage-swift-region | string |  | The region containing the swift service.  |
| <a id="table-storage-swift-tenant"> </a> storage-swift-tenant | string |  | The tenant containing the swift service.  |
| <a id="table-storage-swift-username"> </a> storage-swift-username | string |  | The username to use to access swift.  |
| <a id="table-tls-ca-blob"> </a> tls-ca-blob | string |  | Base64 encoded TLS CA certificate (overwrites tls-cert-path file).  |
| <a id="table-tls-ca-path"> </a> tls-ca-path | string | [See notes](#tls-ca-path-default) | Path to the TLS CA certificate.  |
| <a id="table-tls-cert-blob"> </a> tls-cert-blob | string |  | Base64 encoded TLS certificate (overwrites tls-cert-path file).  |
| <a id="table-tls-cert-path"> </a> tls-cert-path | string | [See notes](#tls-cert-path-default) | Path to the TLS certificate.  |
| <a id="table-tls-key-blob"> </a> tls-key-blob | string |  | Base64 encoded TLS certificate private key (overwrites tls-key-path file).  |
| <a id="table-tls-key-path"> </a> tls-key-path | string | [See notes](#tls-key-path-default) | Path to the TLS certificate private key.  |

---

### apt-key-server


<a id="apt-key-server-default"> </a>
**Default:**

```
hkp://keyserver.ubuntu.com:80
```


[Back to table](#table-apt-key-server)


### docker-ce-package


<a id="docker-ce-package-default"> </a>
**Default:**

```
docker-ce=5:18.09.1~3-0~ubuntu-bionic
```


[Back to table](#table-docker-ce-package)


### docker_runtime


<a id="docker_runtime-description"> </a>
**Description:**

Docker runtime to install valid values are "upstream" (Docker PPA), "nvidia" (Nvidia PPA),
"apt" (Ubuntu archive), "auto" (Nvidia PPA or Ubuntu archive, based on your hardware),
or "custom" (must have set `docker_runtime_repo` URL, `docker_runtime_key_url` URL and
`docker_runtime_package` name).

[Back to table](#table-docker_runtime)


### docker_runtime_repo


<a id="docker_runtime_repo-description"> </a>
**Description:**

Custom Docker repository, given in deb format.  Use `{ARCH}` to determine architecture at
runtime.  Use `{CODE}` to set release codename.  E.g.
`deb [arch={ARCH}] https://download.docker.com/linux/ubuntu {CODE} stable`.

[Back to table](#table-docker_runtime_repo)


### http-host


<a id="http-host-description"> </a>
**Description:**

The external URL where the docker registry is hosted. This URL will
be prepended to all locations generated by the docker registry to
ensure that those URLs are reachable by the client.  For example
"https://example.com/docker-registry/". Any path component must
include a trailing "/". If this is not configured then the docker
registry will derive its location from the incoming requests.

[Back to table](#table-http-host)


### install_keys


<a id="install_keys-description"> </a>
**Description:**

List of signing keys for install_sources package sources, per charmhelpers standard format (a yaml list of strings encoded as a string). The keys should be the full ASCII armoured GPG public keys. While GPG key ids are also supported and looked up on a keyserver, operators should be aware that this mechanism is insecure. null can be used if a standard package signing key is used that will already be installed on the machine, and for PPA sources where the package signing key is securely retrieved from Launchpad.

[Back to table](#table-install_keys)


### install_sources


<a id="install_sources-description"> </a>
**Description:**

List of extra apt sources, per charm-helpers standard format (a yaml list of strings encoded as a string). Each source may be either a line that can be added directly to sources.list(5), or in the form ppa:<user>/<ppa-name> for adding Personal Package Archives, or a distribution component to enable.

[Back to table](#table-install_sources)


### nagios_context


<a id="nagios_context-description"> </a>
**Description:**

Used by the nrpe subordinate charms.
A string that will be prepended to instance name to set the host name
in nagios. So for instance the hostname would be something like:

```
    juju-myservice-0
```

If you're running multiple environments with the same services in them
this allows you to differentiate between them.

[Back to table](#table-nagios_context)


### no_proxy


<a id="no_proxy-description"> </a>
**Description:**

Comma-separated list of destinations (either domain names or IP
addresses) which should be accessed directly, rather than through
the proxy defined in http_proxy or https_proxy. Must be less than
2023 characters long.

[Back to table](#table-no_proxy)


### nvidia-container-runtime-package


<a id="nvidia-container-runtime-package-default"> </a>
**Default:**

```
nvidia-container-runtime=2.0.0+docker18.09.1-1
```


[Back to table](#table-nvidia-container-runtime-package)


### nvidia-docker-package


<a id="nvidia-docker-package-default"> </a>
**Default:**

```
nvidia-docker2=2.0.3+docker18.09.1-1
```


[Back to table](#table-nvidia-docker-package)


### tls-ca-path


<a id="tls-ca-path-default"> </a>
**Default:**

```
/etc/docker/registry/ca.crt
```


[Back to table](#table-tls-ca-path)


### tls-cert-path


<a id="tls-cert-path-default"> </a>
**Default:**

```
/etc/docker/registry/registry.crt
```


[Back to table](#table-tls-cert-path)


### tls-key-path


<a id="tls-key-path-default"> </a>
**Default:**

```
/etc/docker/registry/registry.key
```


[Back to table](#table-tls-key-path)



<!-- CONFIG ENDS -->












### Authentication

This charm supports basic (htpasswd) as well as token-based authentication.
Configure either method as follows:

```bash
juju config docker-registry \
  auth-basic-user='admin' \
  auth-basic-password='redrum'

juju config docker-registry \
  auth-token-issuer='auth.example.com' \
  auth-token-realm='myorg' \
  auth-token-root-certs='$(base64 /path/to/file)' \
  auth-token-service='myapp'
```

### Delete by digest

The recommended way to delete images from the registry is to use the `rmi`
action. If necessary, this charm can be configured to
allow deletion of blobs and manifests by digest by setting
the `storage-delete` config option to `true`:

```bash
juju config docker-registry storage-delete=true
```

[storage-delete]: https://docs.docker.com/registry/configuration/#delete

### Read-Only Mode

The registry can be switched to [read-only mode][storage-readonly] by setting
the `storage-read-only` config option to `true`:

```bash
juju config docker-registry storage-read-only=true
```

[storage-readonly]: https://docs.docker.com/registry/configuration/#readonly

This may be useful when performing maintenance or deploying an environment
with complex authentication requirements.

As an example, consider a scenario that requires unauthenticated pull
and authenticated push access to the registry. This can be achieved by
deploying this charm twice with the same storage backend (for example,
a Swift object storage cluster):

```bash
juju deploy docker-registry public --config <storage-swift-opts>
juju deploy docker-registry private --config <storage-swift-opts>
```

Configure the unauthenticated public registry to be read-only, and enable
authentication for the private registry:

```bash
juju config public storage-read-only=true
juju config private <auth-opts>
```

With a common storage backend and appropriate configuration, unauthenticated
public users have a read-only view of the images pushed by authenticated
private users.

### Swift Storage

The charm supports Swift configuration options that can be used to store
images in a Swift backend:

```bash
juju config docker-registry \
  storage-swift-authurl=<url> \
  storage-swift-container=<container> \
  storage-swift-password=<pass> \
  storage-swift-region=<region> \
  storage-swift-tenant=<tenant> \
  storage-swift-username=<user>
```

>Note: If any of the above config options are set, then they must all be set. Optional params are noted below.

It is possible to configure the swift backend with an OpenStack domain name for Identity v3. To enable this, set the following optional config parameter:
```
storage-swift-domain=<val>
```

Also note that if the swift container is empty, requests to the registry may
return 503 errors like the following:

```
{"errors":[{"code":"UNAVAILABLE","message":"service unavailable","detail":"health check failed: please see /debug/health"}]}
```

Per https://github.com/docker/distribution/issues/2292, upload an empty file
called "files" at the root of the container to workaround the issue.

For more details on the swift driver configuration see [here for more details.](https://github.com/docker/docker.github.io/blob/master/registry/storage-drivers/swift.md)
