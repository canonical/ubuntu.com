---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Container runtimes"
  description: Configure and use containerd or docker as the container runtime
keywords: containerd, docker, runtime, image
tags: [architecture]
sidebar: k8smain-sidebar
permalink: container-runtime.html
layout: [base, ubuntu-com]
toc: False
---

From 1.15 onwards, **Charmed Kubernetes** uses **containerd** as part of a pluggable architecture for
container runtimes, instead of directly using Docker only. This change has been
demonstrated to increase performance, and also provides scope for using different
runtimes on a case-by case basis.

However, it is also possible to use Docker for running containers as in previous versions
of **Charmed Kubernetes**.


## Configuring containerd

Settings which require additional explanation are described below.

|Name             |   Type         |  Default Value                              |  Description                           |
|==========|=========|========================|=====================|
| custom_registries:   |  json |  '[]' |  Setting this config allows images to be pulled from registries requiring auth. [See below](#custom-registries).  |
|enable-cgroups   | bool   | False   |   WARNING changing this option will reboot the host - [see notes](#enable-cgroups).|
|extra-packages | string  | ""  | Space separated list of extra deb packages to install.  |
|gpu-driver  |  string |   'auto' |  Override GPU driver installation.  Options are "auto", "nvidia", "none". |
|http_proxy   |  string | ""  | URL to use for HTTP_PROXY: useful in egress-filtered environments where a proxy is the only option for accessing the registry to pull images.  |
|https_proxy   | string | "" | URL to use for HTTP_PROXY: useful in egress-filtered environments where a proxy is the only option for accessing the registry to pull images. |
|install_keys   |  string | ""  | List of signing keys for install_sources package sources - [see notes](#install-keys)  |
|install_sources   | string  | ""  |  List of extra apt sources - [See notes](#install-sources.) |
|no_proxy | string | "" | Comma-separated list of destinations (either domain names or IP addresses) which should be accessed directly, rather than through the proxy defined in http_proxy or https_proxy. Must be less than 2023 characters long.|
|package_status  |  string | 'install'  |  The status of service-affecting packages will be set to this value in the dpkg database. Valid values are "install" and "hold". |
| runtime   |  string | 'auto'   | Set a custom containerd runtime.  Set "auto" to select based on hardware.|
| shim | string | 'containerd-shim' |   Set a custom containerd shim. |

### Checking the current configuration

To check the current configuration settings for containerd, run the command:

```bash
juju config containerd
```

### Setting a config option

To set an option, simply run the config command with and additional `<key>=<value>` argument. For example, to explicitly turn off the nvidia driver:

```bash
juju config containerd gpu_driver=none
```

## Migrating to containerd

If you have upgraded to  **Charmed Kubernetes** version 1.15, you can transition to using containerd by following the steps outlined in
[this section of the upgrade notes][docker2containerd].

## Using Docker

Although the default set up for **Charmed Kubernetes** from version 1.15 is to use containerd to provide the container runtime, it is also possible to
run workers specifically using Docker. This is done by adding the Docker
charm to your cluster and deploying Docker-based workers:

```bash
juju deploy cs:~containers/kubernetes-worker kubernetes-worker-docker
juju deploy cs:~containers/docker
juju relate docker kubernetes-worker-docker
```


<!-- LINKS -->

[docker2containerd]: /kubernetes/docs/upgrade-notes#1.15
