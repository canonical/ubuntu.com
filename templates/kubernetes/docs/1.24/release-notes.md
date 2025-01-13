---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes,  release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.24/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.24+ck2 Bugfix release

### June 19, 2023 - `charmed-kubernetes --channel 1.24/stable`

## Fixes

Two bug fixes related to the `kubeapi-load-balancer` charm have been backported
from Charmed Kubernetes 1.27:

- Kubernetes API Load Balancer [LP#2017814](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017814)

  nginx configuration is missing on non-leader units when VIP is set.

- Kubernetes API Load Balancer [LP#2017812](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017812)

  ha-cluster-vip not correctly written to kubeconfig.

# 1.24+ck1 Bugfix release 

### August 5, 2022 - `charmed-kubernetes --channel 1.24/stable` 

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.24/bundle.yaml).

## What's new

- Jammy Jellyfish (22.04) Support

All Charmed Kubernetes charms now come with the ability to run on `jammy`
series machines. Xenial (16.04) support has been removed. Focal (20.04)
remains the default series in all bundles and charms, however the charms
now advertise `jammy` support and are considered stable for that series.

- Improved Documentation

Vault documentation updated to cover 20.04 `focal` environment.
Operator charms and replacements for addons now have dedicated guides.
CIDR size limitations are better described in the charm's `cidr` config option.

- Containerd

Improved GPU support by referencing apt sources with https and refreshing
NVIDIA repository keys. Also improved NVIDIA driver upgrades and debug messages for
units that encounter connectivity failures in air-gapped or proxied environments.

Improved upgrade actions for containerd packages as well as NVIDIA packages.

- Docker Registry

Exposes docker registry `cache-*` settings to configure it as a pull-through cache.

- Etcd

Limits the set of TLS ciphers to remove weaker ones.
 
## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.24+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.24+ck1).


# 1.24

### May 6th, 2022 - `charmed-kubernetes --channel 1.24/stable`

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).
Specific instructions for the 1.23 => 1.24 upgrade can be found [here](/kubernetes/docs/1.24/upgrading).

## What's new

- Transition to Charmhub

Starting with this release, charms and bundles will be published to Charmhub
instead of the Charm Store.

If you have any processes that rely on pulling Charmed Kubernetes components
from the Charm Store (for example, references to `cs:charmed-kubernetes` or
`cs:~containers/...`), make sure you update those processes to pull from
Charmhub instead.

When upgrading existing clusters, please refer to the
[upgrade notes](/kubernetes/docs/upgrade-notes) for instructions on how to
navigate this transition properly.

- kubernetes-master renamed to kubernetes-control-plane

The kubernetes-master charm has been renamed to kubernetes-control-plane. See
the [inclusive naming](/kubernetes/docs/inclusive-naming) page for more details about this change.

- Kubelet added to kubernetes-control-plane

The kubernetes-control-plane charm now includes Kubelet, allowing
kubernetes-control-plane units to participate as fully functioning nodes within
Kubernetes clusters.

By default, the kubernetes-control-plane nodes will be
configured with a taint to prevent pods from being scheduled to them. The new
`register-with-taints` config option can be used to control this behavior at
deploy time.

- Calico is now the default CNI

The `charmed-kubernetes` and `kubernetes-core` reference bundles have been
updated to use Calico for pod networking instead of Flannel. We recommend Calico
as the default CNI choice for all new deployments due to the rich set of
advanced networking features that it provides.

While we do recommend Calico as the default choice, we will continue to support
new and existing deployments that use Flannel as well.

- Docker support deprecated

The default container runtime in Charmed Kubernetes has been containerd for 
some time. The Docker container runtime is no longer supported.

## Component upgrades

- calico 3.21.4
- cephcsi 3.5.1
- cinder-csi-plugin 1.23.0
- coredns 1.9.0
- ingress-nginx 1.2.0
- k8s-keystone-auth 1.23.0
- kube-state-metrics 2.4.2
- kubernetes-dashboard 2.5.1
- openstack-cloud-controller-manager 1.23.0

## Fixes

A list of bug fixes and other feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.24).

## Notes and Known Issues

- [LP 1907153](https://bugs.launchpad.net/snapd/+bug/1907153) Snap install failure in LXD

Snaps may fail to install when the `kubernetes-control-plane` charm is deployed to a LXD container.
This happens when the version of `snapd` on the host does not match the version inside the
container. As a workaround, ensure the same version of `snapd` is installed on the host and
in LXD containers.

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.24, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.24].

<!--LINKS-->
[rel]: /kubernetes/docs/release-notes
[upstream-changelog-1.24]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md#deprecation
