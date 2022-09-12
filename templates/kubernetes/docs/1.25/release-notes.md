
---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "1.25 Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.25/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

#### September 1, 2022 - `charmed-kubernetes --channel 1.25/stable` 

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.25/bundle.yaml).

## What's new

- Telco-ready CNI

Identifying a need for increasingly sophisticated SDN within Kubernetes, Charmed Kubernetes now has a Kube-OVN charm. 
This enables a set of new networking capabilities such as VXLAN, QoS, IP Dualstack and more. 

- High availability secret management

Furthering our commitment to resilience, we have now extended the Hashicorp Vault charm to provide HA capabilities, 
ensuring your secrets are always available.

- Cloud provider integration

OpenStack, vSphere and Azure become the latest Cloud integrations to benefit from updated Charmed Kubernetes charms. With these integrations, 
we enable you to deploy our Kubernetes and make it your own as you leverage native features within those clouds.

- Lightweight observability

Canonical Observability Stack (COS Lite) now integrates with our flagship networking charm Kube-OVN. 
This marks a commitment to providing high quality relations that enable zero-ops observability.

- CDK-addons uplifted to operators

As an effort to keep our charms evergreen and ready for production use, we have uplifted CDK-addons to individual operators. 
This provides a range of benefits, from individual build processes to versioning and releasing. 

- Ubuntu 22.04 LTS support

All the components of Charmed Kubernetes can now run on the newest Ubuntu release for the very latest kernel features and security enhancements.

## Component Versions

### Charm/Addons pinned versions
- kube-ovn 1.10.4
- calico 3.21.4
- cephcsi 3.5.1
- cinder-csi-plugin 1.23.0
- coredns 1.9.0
- ingress-nginx 1.2.0
- k8s-keystone-auth 1.23.0
- kube-state-metrics 2.4.2
- kubernetes-dashboard 2.5.1
- openstack-cloud-controller-manager 1.23.0

### Charm default versions
- cloud-provider-vsphere 1.24
- vsphere-csi-driver v2.6.0
- cloud-provider-azure v1.24.0
- azuredisk-csi-driver v1.21.0


## Fixes

Notable fixes in this release include:

- [configurable tls ciphers](https://bugs.launchpad.net/charm-etcd/+bug/1970993)
- NVIDIA updates
  - [updated ppa key](https://bugs.launchpad.net/bugs/1971831)
  - [updated containerd config](https://bugs.launchpad.net/charm-containerd/+bug/1982034)
  - [ensure cuda-drivers on upgrade](https://bugs.launchpad.net/charm-containerd/+bug/1982197)
- [updated vault recommendations](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/1946290)
- [pod security policy removal](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1986856)
- [csi migration flag always enabled](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1988186)

A full list of bug fixes and updates since Charmed Kubernetes 1.24 can be found at:
- [1.24+ck1 milestone](https://launchpad.net/charmed-kubernetes/+milestone/1.24+ck1)
- [1.25 milestone](https://launchpad.net/charmed-kubernetes/+milestone/1.25)


## Notes and Known Issues

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Warning!:</span>
    do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` unless your cluster has taken steps to mitigate the issues below
</p></div>

* [LP1988186](https://bugs.launchpad.net/bugs/1988186)
  Storage Components on AWS and Google Cloud

  Beginning in 1.25 `CSIMigrationAWS` and `CSIMigrationGCE` have been locked to `true` resulting this release being unable to support storage volume mounting in AWS or Google Cloud without the use of those providers' out-of-tree csi-drivers. No charms yet exist for these two cloud platforms but will soon be addressed. Do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` unless your cluster has taken steps to address:
  * Not using storage
  * Using alternative storage like `ceph-csi`
  * Manually configuring the out-of-tree storage provisioner

* PodSecurityPolicy Removed
  PodSecurityPolicy has been removed in 1.25. Please see the [PodSecurityPolicy Migration Guide](https://kubernetes.io/docs/tasks/configure-pod-container/migrate-from-psp/) if you have deployed pod security policies in your cluster. 
  Do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` until your policies have been migrated. 

## Deprecations and API changes

- CSIMigration
The CSIMigration feature is generally available, and its feature flag was locked to enable.
- PodSecurityPolicy
The beta `PodSecurityPolicy` admission plugin, deprecated since 1.21, is removed. See the above section for instructions to migrate to the built-in PodSecurity admission plugin.
- PodDisruptionBudget
The `policy/v1beta1` API version of PodDisruptionBudget is deprecated. Migrate manifests and API clients to use the `policy/v1` API version, available since 1.21.
- vSphere
vSphere releases less than `7.0u2` are not supported for in-tree vSphere volumes as of Kubernetes 1.25. Upgrading vSphere (ESXi and vCenter) to `7.0u2` or above is advised.

For details of other deprecation notices and API changes for Kubernetes 1.25, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.25].

[upstream-changelog-1.25]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.25.md#deprecation

<!-- AUTOGENERATED RELEASE 1.25 ABOVE -->

<!--LINKS-->
[rel]: /kubernetes/docs/release-notes
