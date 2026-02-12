
---
wrapper_template: templates/docs/markdown.html
markdown_includes:
  nav: kubernetes/charmed-k8s/docs/shared/_side-navigation.md
context:
  title: 1.32 Release notes
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags:
  - news
sidebar: k8smain-sidebar
permalink: 1.32/release-notes.html
layout:
  - base
  - ubuntu-com
toc: False
---

# 1.32+ck5

### Feb 12, 2026 - `charmed-kubernetes --channel 1.32/stable`

## Notable Fixes

### Kubernetes Control Plane
* Reduced rules needed by `ClusterRole/system:cos` to improve security posture

# 1.32+ck4

### Sep 5, 2025 - `charmed-kubernetes --channel 1.32/stable`

## Notable Fixes

### Kubernetes Control Plane | Worker Charm
* [LP#2009525](https://bugs.launchpad.net/bugs/2009525) Add `ignore-missing-cni` configuration option.

# 1.32+ck3

### August 6, 2025 - `charmed-kubernetes --channel 1.32/stable`

## Notable Fixes

### Kubernetes Control Plane Charm
* [LP#2109614](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/2109614) Fetch `kube-control` address bindings
and include them in the Subject Alternative Names (SANs).

### Kubernetes Worker Charm
* [LP#2109614](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/2109614) Fetch `kube-control` address bindings
and include them in the Subject Alternative Names (SANs).

# 1.32+ck2

### May 8, 2025 - `charmed-kubernetes --channel 1.32/stable`

## Notable Fixes

### Kubernetes Control Plane Charm
* [LP#2108934](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2108934) The CPU usage Prometheus rule now correctly applies to pods running on any node in the cluster.
* [LP#2097158](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2097158) The `user-create` action ensures `groups` is treated as a list.

# 1.32+ck1

### Mar 28, 2025 - `charmed-kubernetes --channel 1.32/stable`

## Notable Fixes

### Kubernetes Worker Charm
* [LP#2104056](https://bugs.launchpad.net/bugs/2104056) Update ingress-nginx to 1.11.5 resolving CVE-2025-1974

# 1.32

### February 24, 2025 - `charmed-kubernetes --channel 1.32/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.32/bundle.yaml).

## What's new

### aws-cloud-provider

* Support kube-control v2 schema

### aws-k8s-storage

* Support kube-control v2 schema

### ceph-csi

* [LP#2068524](https://bugs.launchpad.net/bugs/2068524) Apply reconciler pattern to  ceph-csi charm
* Map ceph-csi to juju terraform syntax
* Add `image-registry` configuration option
* Create charm tolerations for ceph-rbd and cephfs deployments and daemonsets
* Support alternate names for ceph-fs charm and associated storage class
* Upgrade ceph upstream versions including 3.12 and 3.13

### cinder-csi

* Support kube-control v2 schema

### etcd

* Add support from focal to noble
* [LP#2053031](https://bugs.launchpad.net/charm-etcd/+bug/2053031) Add tuning parameters

### kubernetes-worker

* [LP#2083925](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/2083925)
Add rules to access leases for nginx ingress

### openstack-cloud-controller

* Support kube-control v2 schema
* Authorize the CCM to have CRD permissions
* Map openstack-cloud-controller to juju terraform syntax

### openstack-integrator

* Map openstack-integrator to juju terraform syntax
* lb-consumers now ignores default config lb-port if port mapping was provided

## Component Versions

### Charm/Addons pinned versions

- kube-ovn [v1.12.6](https://github.com/charmed-kubernetes/charm-kube-ovn/blob/release_1.32/templates/kube-ovn/ovn.yaml#L103)
- calico [v3.27.4](https://github.com/charmed-kubernetes/charm-calico/blob/release_1.32/upstream/calico/version)
- cephcsi [v3.13.0](https://github.com/charmed-kubernetes/ceph-csi-operator/blob/release_1.32/upstream/cephfs/version)
- cinder-csi-plugin [v1.27.1](https://github.com/charmed-kubernetes/cinder-csi-operator/blob/release_1.32/upstream/cloud_storage/version)
- coredns [v1.11.1](https://github.com/charmed-kubernetes/charm-coredns/blob/release_1.32/metadata.yaml#L22)
- ingress-nginx [v1.11.2](https://github.com/charmed-kubernetes/charm-kubernetes-worker/blob/release_1.32/src/charm.py#L190)
- kube-state-metrics [v2.10.1](https://github.com/charmed-kubernetes/cdk-addons/blob/release-1.32/Makefile#L21)
- kubernetes-dashboard [v2.7.0](https://github.com/charmed-kubernetes/cdk-addons/blob/release-1.32/Makefile#L20)
- openstack-cloud-controller-manager [v1.30.0](https://github.com/charmed-kubernetes/openstack-cloud-controller-operator/blob/release_1.32/upstream/controller_manager/version)

### Charm default versions

- cloud-provider-vsphere [v1.31](https://github.com/charmed-kubernetes/vsphere-cloud-provider/blob/release_1.32/upstream/cloud_provider/version)
- vsphere-csi-driver [v3.3.1](https://github.com/charmed-kubernetes/vsphere-cloud-provider/blob/release_1.32/upstream/cloud_storage/version)
- cloud-provider-azure [v1.30.0](https://github.com/charmed-kubernetes/charm-azure-cloud-provider/blob/release_1.32/upstream/cloud_provider/version)
- azuredisk-csi-driver [v1.30.2](https://github.com/charmed-kubernetes/charm-azure-cloud-provider/blob/release_1.32/upstream/azure_disk/version)
- cloud-provider-aws [v1.26.1](https://github.com/charmed-kubernetes/charm-aws-cloud-provider/blob/release_1.32/upstream/cloud_provider/version)
- aws-ebs-csi-driver [v1.32.0](https://github.com/charmed-kubernetes/aws-k8s-storage/blob/release_1.32/upstream/cloud_storage/version)
- cloud-provider-gce [v0.27.1](https://github.com/charmed-kubernetes/charm-gcp-cloud-provider/blob/release_1.32/upstream/cloud_provider/version)
- gcp-compute-persistent-disk-csi-driver [v1.8.0](https://github.com/charmed-kubernetes/gcp-k8s-storage/blob/release_1.32/upstream/cloud_storage/version)

## Fixes

- **ceph-csi** - [LP#2098004](https://bugs.launchpad.net/charm-ceph-csi/+bug/2098004)purge any cephfs storage classes installed by ops.manifest
- **etcd** - [LP#2096820](https://bugs.launchpad.net/charm-etcd/+bug/2096820) Don't push stderr through stdout when running etcdctl
- **kube-ovn** - [LP#2071494](https://bugs.launchpad.net/charm-kube-ovn/+bug/2071494) Run configure hook only on leader
- **kubernetes-control-plane** - [LP#2044219](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2044219)
Untested port of cis-benchmark action to the kubernetes-control-plane
- **kubernetes-control-plane** - [LP#2087936](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2087936) Address failing grafana-agent relation at CK boot
- **kubernetes-worker** - [LP#2077189](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/2077189) Don't use a status context on actions
- **openstack-cloud-controller** - [LP#2077468](https://bugs.launchpad.net/charm-openstack-cloud-controller/+bug/2077468)
Update out of date links
- **openstack-integrator** - [LP#2095043](https://launchpad.net/bugs/2095043) Address mishandled config of manage-security-group
- **openstack-integrator** - [LP#2098017](https://bugs.launchpad.net/charm-openstack-integrator/+bug/2098017) Pin pbr version so it continues to use setuptools

A full list of bug fixes and other minor feature updates in this release can be found
at
[the launchpad milestone page for 1.32](https://launchpad.net/charmed-kubernetes/+milestone/1.32).

## Notes and Known Issues

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.32,
please see the relevant sections of the
[upstream release notes][upstream-changelog-1.32].

[upstream-changelog-1.32]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.32.md#deprecation

<!--LINKS-->

[rel]: /kubernetes/charmed-k8s/docs/release-notes
