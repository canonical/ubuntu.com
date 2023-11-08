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

# 1.25+ck4 Bugfix release

### June 19, 2023 - `charmed-kubernetes --channel 1.25/stable`

## Fixes

Two bug fixes related to the `kubeapi-load-balancer` charm have been backported
from Charmed Kubernetes 1.27:

- Kubernetes API Load Balancer [LP#2017814](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017814)

  nginx configuration is missing on non-leader units when VIP is set.

- Kubernetes API Load Balancer [LP#2017812](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017812)

  ha-cluster-vip not correctly written to kubeconfig.

# 1.25+ck3 Bugfix release

### December 1, 2022 - `charmed-kubernetes --channel 1.25/stable`

## Fixes

Notable fixes in this release include:

- Kubernetes Control Plane [LP#1991957](https://bugs.launchpad.net/bugs/1991957)

  Resolves an issue deploying the charm on Bionic, constituting the last supported release
  of this charm into this ubuntu series.

- Kubernetes Control Plane [LP#1994203](https://bugs.launchpad.net/bugs/1994203)

  Resolves an issue deploying the charm into a jammy lxd container, where a missing
  path definition to `/etc/fstab` interrupted the configure kubelet hook.


# 1.25+ck2 Bugfix release 

### September 30, 2022 - `charmed-kubernetes --channel 1.25/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.25/bundle.yaml).

## Fixes

Notable fixes in this release include:

- AzureDisk in Kubernetes-Control-Plane / Kubernetes-Worker [LP#1990687](https://bugs.launchpad.net/bugs/1990687)

  With the pinning of [CSIMigrationAzureDisk=True](https://github.com/kubernetes/kubernetes/pull/110491) in 
  Kubernetes 1.25, the charm must not allow these to be set `False`.  This means that in-tree storage
  provided by AzureDisk is only supported in 1.25 and beyond with an [out-of-tree deployment](https://github.com/kubernetes-sigs/azuredisk-csi-driver).

- IPv6DualStack in Kubernetes-Control-Plane / Kubernetes-Worker [LP#1990455](https://bugs.launchpad.net/bugs/1990455)

  The feature gate [`IPv6DualStack=true`](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.25.md#other-cleanup-or-flake)
  is the default since `1.21`, and GA since `1.23`, so this flag was removed in `1.25` in the upstream source.
  As this charm release supports 1.22 through 1.25, there's no need for this flag anymore and it is being removed.

- GCP snap in GCP-Integrator [LP#1988865](https://bugs.launchpad.net/bugs/1988865)

  The snap installed by the gcp-integrator charm to manage gcp resources collided with the snap
  automatically installed on new installations. The gcp-integrator charm will automatically
  remove the old snap (`google-cloud-sdk`) and install the correct one (`google-cloud-cli`) on upgrades.

  Bug is marked resolved in 1.25+ck2, but was available in the gcp-integrator charm at time of 1.25+ck1 release.

- AwsEbs in Kubernetes-Control-Plane / Kubernetes-Worker [LP#1988186](https://bugs.launchpad.net/bugs/1988186)

  With the pinning of [CSIMigrationAWS=True](https://github.com/kubernetes/kubernetes/pull/111479) in 
  Kubernetes 1.25, the charm must not allow these to be set `False`.  This means that in-tree storage
  provided by AWS is only supported in 1.25 and beyond with an [out-of-tree deployment](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/).

  [aws-k8s-storage](https://charmhub.io/aws-k8s-storage) provides the out-of-tree deployment as a charm.

- GCE in Kubernetes-Control-Plane / Kubernetes-Worker [LP#1988186](https://bugs.launchpad.net/bugs/1988186)

  With the pinning of [CSIMigrationGCE=True](https://github.com/kubernetes/kubernetes/pull/111301) in 
  Kubernetes 1.25, the charm must not allow these to be set `False`.  This means that in-tree storage
  provided by GCE is only supported in 1.25 and beyond with an [out-of-tree deployment](https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver).

  [gcp-k8s-storage](https://charmhub.io/gcp-k8s-storage) provides the out-of-tree deployment as a charm.

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.25+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.25+ck2).


# 1.25+ck1 Bugfix release 

### September 19, 2022 - `charmed-kubernetes --channel 1.25/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.25/bundle.yaml).

## Fixes

Notable fixes in this release include:

- Metallb-Operators [LP#1988410](https://bugs.launchpad.net/bugs/1988410)

    With the [removal of PodSecurityPolicy](https://kubernetes.io/docs/concepts/security/pod-security-policy/)
    in Kubernetes 1.25, the metallb operators (speaker and controller) no longer include PSP-related podspec
    rules if the API endpoint does not support PSP. Existing PSP rules from deployments < 1.25 will be removed
    upon upgrade to 1.25+.

- Kubernetes-Control-Plane / Vault relation [LP#1988448](https://bugs.launchpad.net/bugs/1988448)

    Fixes a race condition which can occur when a Vault unit loses connectivity with a related database.
    Vault will now retry the connection until the database becomes available again.

- Kubernetes-Control-Plane / Google Cloud Platform [LP#1988867](https://bugs.launchpad.net/bugs/1988867)

    Fixes a race condition which can occur when applying configuration changes in Google Cloud Platform
    deployments when the `NetworkUnavailable` index cannot be found in a node's status conditions.

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.25+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.25+ck1).


# 1.25

### September 1, 2022 - `charmed-kubernetes --channel 1.25/stable` 

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

* [LP1988186](https://bugs.launchpad.net/bugs/1988186)
  Storage Components on AWS and Google Cloud

  Beginning in 1.25 `CSIMigrationAWS` and `CSIMigrationGCE` have been locked to `true` resulting this release being unable to support storage volume mounting in AWS or Google Cloud without the use of those providers' out-of-tree csi-drivers. No charms yet exist for these two cloud platforms but will soon be addressed.
  
  Do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` unless your cluster has taken steps to mitigate the lack of built-in storage such as:
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
