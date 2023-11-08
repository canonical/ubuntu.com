---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "1.28 Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.28/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

## 1.28+ck2 Bugfix release

### November 7, 2023 - `charmed-kubernetes --channel 1.28/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.28/bundle.yaml).

## What's new

### Containerd
* [LP#2034080](https://bugs.launchpad.net/bugs/2034080)
  Updated source repository for nvidia debs.

### Calico
* [LP#2037236](https://bugs.launchpad.net/bugs/2037236)
  1.28 charm release no longer ignores `cni` networking binding.

### Kubernetes-Control-Plane and Kubernetes Worker
* [LP#2038970](https://bugs.launchpad.net/bugs/2038970)
  Check the kubernetes cluster version before applying DevicePlugin feature gates.

### Openstack Cloud Controller and CDK Addons
* [LP#2039886](https://bugs.launchpad.net/bugs/2039886)
  Correctly update the kubernetes cluster-name when starting the cloud-controller-manager.

### Updated Images
* [LP#2035139](https://bugs.launchpad.net/bugs/2035139)
  Updated of various container images which address numerous CVEs in the following operators
  - coredns charm
  - ceph-csi charm
  - openstack-cloud-controller charm
  - cdk-addons


## 1.28+ck1 Bugfix release

### September 25, 2023 - `charmed-kubernetes --channel 1.28/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.28/bundle.yaml).

## What's new
### Cloud Integrator Charms
* [LP#2033082](https://bugs.launchpad.net/bugs/2033082) 
  Replaces deprecated yaml library method to `yaml.safe_load` over `yaml.load`
  - aws-integrator
  - gcp-integrator
  - vsphere-integrator

### Calico
* [LP#2034737](https://bugs.launchpad.net/bugs/2034737) [LP#2034736](https://bugs.launchpad.net/bugs/2034736)
  The charm configured Calico `assign_ipv{4,6}` as null instead of the actual value.
  Adds a call to reconfigure the `cni_config` when the charm configuration or the etcd config changes.
  Casts the value of veth_mtu to string rather than an int

### Ceph-csi
* [LP#2034267](https://bugs.launchpad.net/bugs/2034267)
  Support custom kubelet_dir over kubernetes-info interface

### CoreDNS
* [LP#2032822](https://bugs.launchpad.net/bugs/2032822)
  Prevents attempts to deploy the charm in a machine charm (non-k8s)

### KubeOVN
* [LP#2030772](https://bugs.launchpad.net/bugs/2030772)
  Update to kube-ovn v1.11.10

### Kubeapi Load Balancer
* [LP#1893681](https://bugs.launchpad.net/bugs/1893681)
  Adds the option to handle Nginx configuration contexts via config `nginx-http-config`.

* [LP#1948019](https://bugs.launchpad.net/bugs/1948019)
  Adds the option to handle Nginx configuration contexts via config `nginx-events-config` and `nginx-main-config`.

### Kubernetes Control Plane
* [LP#2033682](https://bugs.launchpad.net/bugs/2033682)
  Adds ipvs kernel modules to lxd profile (#300)
  Required when using kube-proxy in ipvs mode

* [LP#2034448](https://bugs.launchpad.net/bugs/2034448)
  Updates documentation for operating CNIs like Cilium and Calico on units hosted by lxd containers

### Kubernetes Worker
* [LP#2034448](https://bugs.launchpad.net/bugs/2034448)
  Updates documentation for operating CNIs like Cilium and Calico on units hosted by lxd containers

### MetalLB
* [LP#2031937](https://bugs.launchpad.net/bugs/2031937)
  Updates Charmhub Documentation to a Diataxis version

## 1.28

### August 18, 2023 - `charmed-kubernetes --channel 1.28/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.28/bundle.yaml).

## What's new

### calico

Update Calico to v3.25.1
Convert Calico to the ops framework

### canal

Add flannel cni-plugin 1.2.0, update to flannel 0.22.1

### ceph-csi

Update charm to apply manifests with `ops.manifest``

### flannel

Add flannel cni-plugin 1.2.0, update to flanneld 0.22.1 (#89)

### kube-ovn

Update to kube-ovn 1.11.10
Resolves Error state when relating to cos-lite 

### kubernetes-worker

Update to CNI 1.2.0

### metallb

Convert to Ops Framework

### volcano

Create a bundle for volcano scheduler

## Component Versions

### Charm(/Addons) pinned versions

- kube-ovn 1.11.10
- calico 3.25.1
- ceph-csi 3.7.2 / 3.7.2
- cinder-csi 1.27.1 / 1.26.2 
- coredns 1.10.1 / 1.9.4
- ingress-nginx 1.6.4
- k8s-keystone-auth 1.26.2
- kube-state-metrics 2.0.0 / 2.8.2
- kubernetes-dashboard 2.7.0 / 2.7.0
- openstack-cloud-controller-manager 1.27.1 / 1.26.2 

### Charm default versions

- cloud-provider-vsphere 1.26
- vsphere-csi-driver 3.0.0
- cloud-provider-azure 1.25.0
- azuredisk-csi-driver 1.23.0
- cloud-provider-aws 1.26.1
- aws-ebs-csi-driver 1.12.0
- gcp-compute-persistent-disk-csi-driver 1.8.0

## Fixes

A list of other bug fixes and minor feature updates in this release can be found at
[the launchpad milestone page for 1.28](https://launchpad.net/charmed-kubernetes/+milestone/1.28).

- **azure-cloud-provider**
Apply `topologySpreadConstraints` to control-plane Deployments [LP#2016053](https://launchpad.net/bugs/2016053) 
- **ceph-csi**
Support CephFS [LP#1940922](https://launchpad.net/bugs/1940922) and [LP#1940921](https://launchpad.net/bugs/1940921)
- **cilium**
Resolves Error state when relating to cos-lite [LP#2025162](https://launchpad.net/bugs/2025162)
- **coredns**
Resolves multiple architecture deployment [LP#1998607](https://launchpad.net/bugs/1998607)
- **etcd**
Redirect nagios cron output through tee [LP#2021950](https://launchpad.net/bugs/2021950)
Provide etcd certs to prometheus reation [LP#2004612](https://launchpad.net/bugs/2004612)
- **kubernetes-control-plane**
Restart kube-proxy if proxy-extra-config changes [LP#2020059](https://launchpad.net/bugs/2020059)
Add cinder-availability-zone config [LP#1972861](https://launchpad.net/bugs/1972861)
Update renamed metrics to fix grafana dashboard [LP#1956611](https://launchpad.net/bugs/1956611)
Update to CNI 1.2.0
- **kubernetes-worker**
update clusterrole for ingress-nginx to support 1.6.4 release [LP#2015761](https://launchpad.net/bugs/2015761)
Restart kube-proxy if proxy-extra-config changes [LP#2020059](https://launchpad.net/bugs/2020059)
- **metallb**
Update charm icon [LP#1926982](https://launchpad.net/bugs/1926982)
Add L2 Advertisements deployed via the charm [LP#2030108](https://launchpad.net/bugs/2030108)
- **openstack-integrator**
Fix endpoint url regex to parse trailing slash [LP#1964544](https://launchpad.net/bugs/1964544)

## Notes and Known Issues

None

## Deprecations and API changes

- Upstream
For details of other deprecation notices and API changes for Kubernetes 1.28, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.28].

[upstream-changelog-1.28]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.28.md#deprecation


<!-- AUTOGENERATED RELEASE 1.28 ABOVE -->


<!--LINKS-->

[rel]: /kubernetes/docs/release-notes
