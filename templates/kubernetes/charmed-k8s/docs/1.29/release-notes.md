---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "1.29 Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.29/release-notes.html
layout: [base, ubuntu-com]
toc: false
---

# 1.29+ck6

### Sep 5, 2025 - `charmed-kubernetes --channel 1.29/stable`

## Notable Fixes

### Kubernetes Control Plane | Worker Charm
* [LP#2009525](https://bugs.launchpad.net/bugs/2009525) Add `ignore-missing-cni` configuration option.

# 1.29+ck5

### Mar 31, 2025 - `charmed-kubernetes --channel 1.29/stable`

## Notable Fixes

### Kubernetes Worker Charm
* [LP#2104056](https://bugs.launchpad.net/bugs/2104056) Update ingress-nginx to 1.11.5 resolving CVE-2025-1974

# 1.29+ck4

### Jul 31, 2024 - `charmed-kubernetes --channel 1.29/stable`

## Notable Fixes

### Ceph-CSI Charm

* [LP#2073297](https://bugs.launchpad.net/bugs/2073297)
  Provides charm configuration options for each of the storage-class parameters
  * `cephfs-storage-class-parameters`
  * `ceph-xfs-storage-class-parameters`
  * `ceph-ext4-storage-class-parameters`

  Provides a charm action which aids in remove storage-classes if they prevent
    the charm from creating with the existing storage-class parameters.
  * `delete-storage-class`


# 1.29+ck3

### Jun 14, 2024 - `charmed-kubernetes --channel 1.29/stable`

The release bundle can also be
[downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.29/bundle.yaml).

## Notable Fixes

### Kubernetes-Control-Plane

* [LP#2068770](https://bugs.launchpad.net/bugs/2068770)
  Upgrade `keystone-credentials` relation with a warning and docs change to [ldap][]
* [LP#2070053](https://bugs.launchpad.net/bugs/2070053)
  Upgrade `ceph-client` relation with a warning and docs change to [ceph][]

# 1.29+ck2

### May 30, 2024 - `charmed-kubernetes --channel 1.29/stable`

The release bundle can also be
[downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.29/bundle.yaml).

## What's new

### Integration gaps

- Vault storage: [vault](https://charmhub.io/vault)
  - The charm returns support for encryption-at-rest of the secrets in etcd
    which were created using a relation to `vault-kv`. The cluster secrets
    stored in etcd are encrypted and can only be unlocked by a key which is
    stored in Vault.
- Kubernetes-Worker:
  - [LP#2066049](https://bugs.launchpad.net/bugs/2066049): The charm returns
    support for the `ingress-proxy` relation.

## Notable Fixes

### Kubernetes-Control-Plane

* [LP#2058269](https://bugs.launchpad.net/bugs/2058269)
  Stray "\n" characters after an upgrade to 1.29

* [LP#2067427](https://bugs.launchpad.net/bugs/2067427)
  Improved build reliability via pinning python dependencies

### Kubernetes-Worker

* [LP#2065251](https://bugs.launchpad.net/bugs/2065251)
  The charm waits appropriately for tokens when related with cos-agent

A list of all bug fixes and minor updates in this release can be found at
[the launchpad milestone page for 1.29+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.29+ck2).

# 1.29+ck1 Bugfix release

### April 20, 2024 - `charmed-kubernetes --channel 1.29/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.29/bundle.yaml).

## Notable Fixes

### Etcd and EasyRSA

* [LP#2061581](https://bugs.launchpad.net/bugs/2061581)
  Could not find a version that satisfies the requirement setuptools>=64

### Docker-Registry

* [LP#2049360](https://bugs.launchpad.net/bugs/2049360)
  image corruption with docker-registry charm

### Kubernetes-Control-Plane

* [LP#2052140](https://bugs.launchpad.net/bugs/2052140)
  grafana agent config not rendered completely

### Calico-Enterprise

* [LP#2053143](https://bugs.launchpad.net/bugs/2053143)
  Tigera units do not become active after the first installation of the bundle

### Ceph-CSI

* [LP#2054486](https://bugs.launchpad.net/bugs/2054486)
  ceph-csi charm does not handle ceph-fs correctly

### Kubernetes-Worker

* [LP#2054819](https://bugs.launchpad.net/bugs/2054819)
  New alert rules shipped from k8s worker

A list of all bug fixes and minor updates in this release can be found at
[the launchpad milestone page for 1.29+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.29+ck1).

# 1.29

### February 12, 2024 - `charmed-kubernetes --channel 1.29/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.29/bundle.yaml).

## What's new

### Charmed Operator Framework (Ops)

We're pleased to announce the completion of the Charmed Kubernetes refactor
that began last year. Core charms have moved from the `reactive` and `pod-spec`
styles to the `ops` framework. This shift aims to enable access to common charm
libraries, gain better Juju support, and provide a more consistent charming
experience for community engagement.

### Out of the box monitoring enhancements

The Canonical Observability Stack (COS) gathers, processes, visualises and
alerts on telemetry signals generated by workloads running both within and
outside of Juju. COS provides an out of the box observability suite relying on
the best-in-class open-source observability tools.

This release expands our COS integration so that it includes rich monitoring for the
control plane and worker node components of Charmed Kubernetes.

### Ceph CSI

Ceph CSI resource management has been decoupled from the
`kubernetes-control-plane` charm. All new deployments should use the
[ceph-csi][] charm for Ceph storage provisioning, including support for CephFS.
See the [updated documentation][ceph] for details on deploying Charmed
Kubernetes with Ceph support.

### OpenStack integration

OpenStack capabilities (including cinder storage and cloud provider) have been
decoupled from the `kubernetes-control-plane` charm. All new deployments should
use the new `openstack-integrator`, `openstack-controller-manager`, and
`cinder-csi` charms. See the [updated documentation][openstack] for more
details.

### NVIDIA GPU Operator

The new [nvidia-gpu-operator][] charm simplifies the management of NVIDIA GPU
resources in a Kubernetes cluster. See the [updated documentation][gpu-workers]
for details on deploying Charmed Kubernetes with GPU workers.

### LXD deployment

Updated recommendations for deploying Charmed Kubernetes in a LXD environment
are now available. See the [local install documentation][install-local] for
details.

### Manual cloud deployment

Guidelines for deploying Charmed Kubernetes to pre-existing machines are now
available. See the [manual cloud documentation][install-existing] for details.

### Container networking enhancements

#### Kube-OVN 1.12

Charmed Kubernetes continues its commitment to advanced container networking
with support for the Kube-OVN CNI. This release includes a Kube-OVN upgrade to
v1.12. You can find more information about features and fixes in the upstream
release notes.

#### Tigera Calico Enterprise

The `calico-enterprise` charm debuts as a new container networking option for
Charmed Kubernetes in this release. This charm brings advanced Calico
networking/network policy support and is offered as an alternative to the
default Calico CNI.

## Fixes

All bug fixes and other feature updates in this release can be found at
[the launchpad milestone page for 1.29](https://launchpad.net/charmed-kubernetes/+milestone/1.29).

<a id="notes-issues"> </a>

## Notes and Known Issues

### Integration gaps

While Charmed Kubernetes core charms have been rewritten in the `ops` framework, some
integrations with other charms in the Juju ecosystem are not available in this release.
If your deployment depends on the following, we recommend remaining on Charmed Kubernetes
1.28 until compatible support is provided in a subsequent release:

- AWS IAM authentication: [aws-iam](https://charmhub.io/aws-iam)
- Keystone authentication: [keystone](https://charmhub.io/keystone)
- Vault storage: [vault](https://charmhub.io/vault)

### Cloud integrators

Direct integration between `[aws|azure|gcp|openstack]-integrator` charms and
`kubernetes-control-plane` has been removed in this release. The recommended method for
enabling native cloud features is to use the respective out-of-tree cloud provider
charms. See the cloud-specific documentation for details.

### Bugs

A list of known bugs scheduled to be fixed in the first maintenance release can be found
on the [1.29+ck1 milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.29+ck1).

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.29, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.29].

[upstream-changelog-1.29]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.29.md#deprecation

<!-- AUTOGENERATED RELEASE 1.29 ABOVE -->


<!--LINKS-->

[rel]: /kubernetes/charmed-k8s/docs/release-notes
[ceph-csi]: https://charmhub.io/ceph-csi?channel=1.29/stable
[ceph]: /kubernetes/charmed-k8s/docs/ceph
[ldap]: /kubernetes/charmed-k8s/docs/ldap
[openstack]: /kubernetes/openstack-integration
[nvidia-gpu-operator]: https://charmhub.io/nvidia-gpu-operator?channel=1.29/stable
[gpu-workers]: /kubernetes/charmed-k8s/docs/gpu-workers
[install-local]: /kubernetes/charmed-k8s/docs/install-local
[install-existing]: /kubernetes/charmed-k8s/docs/install-existing
[ldap]: /kubernetes/charmed-k8s/docs/ldap
