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
permalink: 1.23/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.23

### December 15, 2021 - charmed-kubernetes-862

## What's new

- CNI support added to kubernetes-master

The core CNI plugins have been added to kubernetes-master, and the CNI
subordinate charms have been updated to render CNI configuration when attached
to kubernetes-master. These changes pave the way for Kubelet to be added to
kubernetes-master in a future release.

- Grafana dashboard for etcd

The etcd charm can now be related to the Prometheus and Grafana charms. When
doing so, a new Grafana dashboard will be created that makes it easier to monitor
the performance characteristics of etcd.

## Component upgrades

- kube-dns 1.21.1 (note: coredns 1.8.3 is the default DNS provider)
- metrics-server 0.5.1

## Fixes

A list of bug fixes and other feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.23).

## Notes and Known Issues

- [LP 1907153](https://bugs.launchpad.net/snapd/+bug/1907153) Snap install failure in LXD

Snaps may fail to install when the `kubernetes-master` charm is deployed to a LXD container.
This happens when the version of `snapd` on the host does not match the version inside the
container. As a workaround, ensure the same version of `snapd` is installed on the host and
in LXD containers.

- [LP 1936816](https://bugs.launchpad.net/bugs/1936816) and [LP 1913228](https://bugs.launchpad.net/bugs/1913228) Filesystem Hierachy Standards

  Applications running inside a kubernetes-master should set pid files and log files in
appropriate operational locations like `/run/` and `/var/log/kubernetes/`. Care was taken to restart
services using these new locations and migrate some existing files out of `/root/cdk/`.

  For the service `cdk.master.auth-webhook` the new pid file and log files are named
`/run/cdk.master.auth-webhook.pid` and `/var/log/kubernetes/cdk.master.auth-webhook.log`
to match the systemctl service name.

  If the [`filebeat`](https://charmhub.io/filebeat) charm is related to kubernetes-master,
ensure that its logpath include this new path ( e.g. `juju config filebeat logpath='/var/log/kubernetes/*.log'` )

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.23, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.23].



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

### September 1, 2021 - charmed-kubernetes-761

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
