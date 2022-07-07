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
