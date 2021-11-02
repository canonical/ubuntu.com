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
permalink: 1.22/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.22+ck2 Bugfix release

### October 27, 2021 - [charmed-kubernetes-814](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-814/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.22+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.22+ck2).

# 1.22+ck1 Bugfix release

### October 21, 2021 - [charmed-kubernetes-807](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-807/archive/bundle.yaml)

## What's new

- Configurable default PodSecurityPolicy

A new `pod-security-policy` config option has been added to the
kubernetes-master charm. This option allows you to override the default
PodSecurityPolicy that is created by the charm.

- Configurable Nvidia APT sources

New config options have been added to the containerd charm:
`nvidia_apt_key_urls`, `nvidia_apt_sources`, and `nvidia_apt_packages`. These
provide better support for Nvidia GPUs in air gapped deployments by allowing
you to specify where the Nvidia Container Runtime and CUDA packages are pulled
from.

- Better OpenStack credential handling

The openstack-integrator charm now checks for updated cloud credentials from
Juju every time its update-status hook runs, ensuring that cloud credentials
are properly detected a short time after they change. To expedite this process,
you can use the new openstack-integrator charm's new `refresh-credentials`
action to force a recheck immediately.

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.22+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.22+ck1).

# 1.22

### September 1, 2021 - [charmed-kubernetes-761](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-761/archive/bundle.yaml)

## What's new

- Calico BGP Service IP Advertisement

The Calico charm now supports advertising Kubernetes service IPs using Border
Gateway Protocol (BGP). More information can be found in the
[CNI with Calico][calico-service-ip-advertisement] page.

- Improved load balancer provider support

Support for load balancing the Kubernetes control plane is being improved with
two new relation endpoints: `loadbalancer-external` and `loadbalancer-internal`.
This change adds support for Azure native load balancers for the Kubernetes control
plane, and improves LB configurability while still simplifying the relations needed
between the various components of the cluster.

## Component upgrades

- cephcsi 3.3.1 (note: see [upstream notes][cephcsi-upgrade] if upgrading from a previous release)
- kube-dns 1.17.3 (note: coredns 1.8.3 is the default DNS provider)
- nginx-ingress 1.0.0-beta.3
- metrics-server 0.5.0

## Fixes

A list of bug fixes and other feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.22).

## Notes and Known Issues

- [LP 1935992](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1935992) Code cleanup

  Previously deprecated features have been removed in this release. This includes
the following `kubernetes-master` features:

  - `addons-registry` config
  - `create-rbd-pv` action and related templates
  - `monitoring-storage` config
  - `kube-dns` interface
  - `migrate_from_pre_snaps` code

  The following deprecated `kubernetes-worker` features have been removed in this release:

  - `allow-privileged` config
  - `kube-dns` interface
  - `registry` action and related templates
  - code paths for k8s < 1.10

- [LP 1907153](https://bugs.launchpad.net/snapd/+bug/1907153) Snap install failure in LXD

  Snaps may fail to install when the `kubernetes-master` charm is deployed to a LXD container.
This happens when the version of `snapd` on the host does not match the version inside the
container. As a workaround, ensure the same version of `snapd` is installed on the host and
in LXD containers.

## Deprecations and API changes

- Upstream

  For details of other deprecation notices and API changes for Kubernetes 1.22, please see the
relevant sections of the [upstream release notes][upstream-changelog].

## Previous releases

Please see [this page][rel] for release notes of earlier versions.

<!--LINKS-->
[rel]: /kubernetes/docs/release-notes
[calico-service-ip-advertisement]: /kubernetes/docs/cni-calico#service-ip-advertisement
[upstream-changelog]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.22.md#deprecation
[cephcsi-upgrade]: https://github.com/ceph/ceph-csi/blob/devel/docs/ceph-csi-upgrade.md
