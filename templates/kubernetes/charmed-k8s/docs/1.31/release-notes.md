---
wrapper_template: templates/docs/markdown.html
markdown_includes:
  nav: kubernetes/charmed-k8s/docs/shared/_side-navigation.md
context:
  title: 1.31 Release notes
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: 
  - news
sidebar: k8smain-sidebar
permalink: 1.31/release-notes.html
layout:
  - base
  - ubuntu-com
toc: False

---

# 1.31+ck2

### Mar 31, 2025 - `charmed-kubernetes --channel 1.31/stable`

## Notable Fixes

### Kubernetes Worker Charm
* [LP#2104056](https://bugs.launchpad.net/bugs/2104056) Update ingress-nginx to 1.11.5 resolving CVE-2025-1974

# 1.31+ck1

### Dec 16, 2024 - `charmed-kubernetes --channel 1.31/stable`

## Notable Fixes

### Kubernetes Control Plane Charm
* [LP#2091126](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2091126) Return the correct internal lb response
* [LP#2078951](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2078951) Updates gunicorn to 23.0.0 to remove dependency on pkg_resources
* [LP#2044219](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2044219) Added CIS-benchmark action
* [LP#2032533](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/2032533) Mark the unit as waiting when kube-system pods aren't ready

### Kubernetes Worker Charm
* [LP#2074388](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/2074388) Improve reconciler handlers to prevent early reconcilation
* [LP#2044219](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2044219) Port the CIS-benchmark to the ops worker charm

### Kubernetes API Load Balancer
* [LP#2091120](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2091120) Charm events should reconcile lb_addresses to requirers

### Docker Registry Charm 
* [LP#2080349](https://bugs.launchpad.net/layer-docker-registry/+bug/2080349) Added explicit configuration option `storage-redirect-disable`

### Cilium Charm
* [LP#2077734](https://bugs.launchpad.net/charm-cilium/+bug/2077734) Create charm actions for listing Cilium resources
* [LP#2032533](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/2032533) Block when Kubelets are unfriendly hosts

### Cinder CSI Charm
* [LP#2067404](https://bugs.launchpad.net/charm-cinder-csi/+bug/2067404) Check and log all events on failed resources

### Kata Containers Charm
* [LP#2040498](https://bugs.launchpad.net/charm-kata/+bug/2040498) Fix failed installation on Jammy

### vSphere Cloud Provider Charm
* [LP#2083999](https://bugs.launchpad.net/charm-vsphere-cloud-provider/+bug/2083999) Update images for CPI and CSI

### Ceph CSI Charm
* [LP#2078646](https://bugs.launchpad.net/charm-ceph-csi/+bug/2078646) Alter the home of Ceph conf to not interfere with other applications
* [LP#2035399](https://bugs.launchpad.net/charm-ceph-csi/+bug/2035399) Provides charm config to adjust or disable the default metrics-ports used to expose metrics from the CSI provisioners

# 1.31

### September 04, 2024 - `charmed-kubernetes --channel 1.31/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.31/bundle.yaml).

## What's new

### aws-k8s-storage

* Updates aws-storage manifests to include versions 1.12.1 -> 1.32.0

### azure-cloud-provider

* Updates azure resources to include azure-disk versions 1.28.9 -> 1.30.2
* Updates azure resources to include cloud-provider versions 1.27.14 -> 1.30.0

### calico

* Increases charm debug logs to better isolate failures in [LP#2064145](https://bugs.launchpad.net/bugs/2064145)

### kubernetes-control-plane

* Improvements to logging when failing to create a cloud-based load-balancer
* Enhances the upgrade action to avoid clearing charm status warnings

### openstack-cloud-controller

* Updates manifests to include up to v1.30.0

### openstack-integrator

* Adds project-id to the openstack credentials handed out by this relation

## Component Versions

### Charm/Addons pinned versions
- kube-ovn 1.12.6
- calico 3.27.4
- coredns 1.9.4
- ingress-nginx 1.11.2
- kube-state-metrics 2.10.1
- kubernetes-dashboard 2.7.0

### Charm default versions
- ceph-csi (rbd) 3.9.0
- ceph-csi (cephfs) 3.9.0
- cinder-csi 1.27.1
- cilium 1.12.5
- coredns 1.11.1
- k8s-keystone-auth 1.30.0
- cloud-provider-vsphere 1.26
- vsphere-csi-driver 3.0.0
- cloud-provider-azure 1.30.0
- azuredisk-csi-driver 1.30.2
- cloud-provider-aws 1.26.1
- aws-ebs-csi-driver 1.32.0
- gcp-compute-persistent-disk-csi-driver 1.8.0
- gcp-cloud-provider 0.27.1


## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.31](https://launchpad.net/charmed-kubernetes/+milestone/1.31).


## Notes and Known Issues

A list of known issues remaining unfixed in this release can be found at
[the launchpad milestone page for 1.31+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.31+ck1).


## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.31, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.31].

[upstream-changelog-1.31]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.31.md#deprecation

<!-- AUTOGENERATED RELEASE 1.31 ABOVE -->


<!--LINKS-->


[rel]: /kubernetes/charmed-k8s/docs/release-notes
