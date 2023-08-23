---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "1.26 Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.26/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.26+ck4 Bugfix release

### June 19, 2023 - `charmed-kubernetes --channel 1.26/stable`

## Fixes

Two bug fixes related to the `kubeapi-load-balancer` charm have been backported
from Charmed Kubernetes 1.27:

- Kubernetes API Load Balancer [LP#2017814](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017814)

  nginx configuration is missing on non-leader units when VIP is set.

- Kubernetes API Load Balancer [LP#2017812](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017812)

  ha-cluster-vip not correctly written to kubeconfig.

# 1.26+ck3 Bugfix release

### March 20, 2023 - `charmed-kubernetes --channel 1.26/stable`

## Fixes

Notable fixes in this release include:

- Kubernetes Control Plane [LP#1989362](https://bugs.launchpad.net/bugs/1989362)

  Resolves a hook error when related to vault but the vault api endpoint is not ready

- Kubernetes Control Plane [LP#1999542](https://bugs.launchpad.net/bugs/1999542)

  Resolves an issue where the charm incorrectly presumes a one-time vault token has
  been used successfully to create a secret.

- ETCD [LP#2008267](https://bugs.launchpad.net/bugs/2008267)

  Resolves a race-condition which occurs when etcd sends cluster information
  before its api endpoint is available, causing both it and calico to stall
  during deployment.

- Vsphere Cloud Provider [LP#2010233](https://bugs.launchpad.net/bugs/2010233)

  Resolves an issue where the sync-manifest action could result in pods described
  with the wrong image.

- Vsphere Cloud Provider [LP#2009965](https://bugs.launchpad.net/bugs/2009965)

  Resolves an issue where the charm is stuck in Maintenance state after running
  a sync-manifest action.

# 1.26+ck2 Bugfix release

### February 27, 2023 - `charmed-kubernetes --channel 1.26/stable`

## Fixes

Notable fixes in this release include:

- Kubernetes Autoscaler [LP#2007182](https://bugs.launchpad.net/charm-kubernetes-autoscaler/+bug/2007182)

  Update the autoscaler image for use with newer Juju controllers.

- Etcd [LP#1997531](https://bugs.launchpad.net/charm-etcd/+bug/1997531)

  Restrict non-root access to etcd snap data directory.

- Kubernetes Control Plane [LP#2007174](https://bugs.launchpad.net/bugs/2007174)

  Restrict non-root access to the script responsible for synchronizing control-plane leader files to followers.

- Bundles [LP#](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/2008582)

  Add missing bundle overlays for AWS/GCE cloud storage providers.


# 1.26+ck1 Bugfix release

### January 16, 2023 - `charmed-kubernetes --channel 1.26/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.26/bundle.yaml).


## Fixes

Notable fixes in this release include:

- Kubernetes Control Plane / Octavia [LP#1990494](https://bugs.launchpad.net/bugs/1990494)

  Resolves an issue which made it impossible to delete a kubernetes service when octavia loadbalancers are detected

- Kubernetes Control Plane / Octavia [LP#1995746](https://bugs.launchpad.net/bugs/1995746)

  Adds support to disable openstack loadbalancer integration

- Kubernetes Control Plane / Ceph [LP#1998257](https://bugs.launchpad.net/bugs/1998257)

  Resolves an issue where the `csi-rbdplugin` pod cannot start if the control-plane unit is running in a LXD machine.

- Containerd [#LP2002593](https://bugs.launchpad.net/bugs/2002593)
  
  Resolves issue with flooding `/var/log/syslog` with messages about a deprecation of `io.containerd.runc.v1`

- CoreDNS [LP#2002698](https://bugs.launchpad.net/bugs/2002698)

  Upgrade of the coredns image from `1.6.7` to `1.10.0`

- ops.lib-manifest library [LP#1999427](https://bugs.launchpad.net/bugs/1999427)

  Resolves an issue where a charm hook fails rather than retrying when the kubernetes-api is available.

- SRIOV CNI/Network Device Plugin [LP#2002186](https://bugs.launchpad.net/bugs/2002186)

  Add support for control-plane node toleration for SRIOV daemonsets


# 1.26

### December 15, 2022 - `charmed-kubernetes --channel 1.26/stable` 

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.26/bundle.yaml).

## What's new

- Ubuntu 22.04 default series

Ubuntu 22.04 is now the default series for new deployments of Charmed
Kubernetes.

Ubuntu 20.04 remains fully supported, but is no longer the default series.

Ubuntu 18.04 is no longer supported. For existing clusters still running Ubuntu
18.04, it is recommended to perform a series upgrade to Ubuntu 20.04 before
upgrading to Charmed Kubernetes 1.26.

- Kube-OVN BGP support

The Kube-OVN charm's new `bgp-speakers` config option makes it possible to peer
Kubernetes nodes with external BGP routers and exchange routing information for
Kube-OVN subnets. This makes it possible to access pod IPs directly from
external networks.

- Kube-OVN traffic mirroring

The new `enable-global-mirror` and `mirror-iface` config options make it
possible to configure traffic mirroring for Kube-OVN. When configured, Kube-OVN
will mirror pod network traffic to a network interface on each Kubernetes node,
making it easier to observe pod network traffic with tools such as tcpdump.

- MetalLB enhancements

The metallb-controller and metallb-speaker charms have been upgraded to
v0.12 and can now run on amd64, arm, arm64, ppc64le, and s390x hosts.

## Component Versions

### Charm/Addons pinned versions
- kube-ovn 1.10.4
- calico 3.21.4
- cephcsi 3.7.2
- cinder-csi-plugin 1.25.3
- coredns 1.9.4
- ingress-nginx 1.2.0
- k8s-keystone-auth 1.25.3
- kube-state-metrics 2.6.0
- kubernetes-dashboard 2.7.0
- openstack-cloud-controller-manager 1.25.3

### Charm default versions
- cloud-provider-vsphere 1.24
- vsphere-csi-driver 2.6.0
- cloud-provider-azure 1.25.0
- azuredisk-csi-driver 1.23.0
 
## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.26](https://launchpad.net/charmed-kubernetes/+milestone/1.26).


## Notes and Known Issues

A list of issues to be fixed in the first 1.26 maintenance release can be found at
[the launchpad milestone page for 1.26+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.26+ck1).

* [LP1999427](https://launchpad.net/bugs/1999427)
  Charm errors during update-status hook with 502 Gateway Error

  The charm's status may appear like this:
  ```
    aws-k8s-storage/0*         error        idle                54.80.73.214                    hook failed: "update-status"
  ```

  When the affected charms are deployed on a cloud with a `kube-api-loadbalancer`, the load-balancer
  can respond to client requests with a 502 Gateway Error, amongst other error statuses not produced
  by the API server itself.  The charm's kubernetes client library raises an unhandled exception in
  this case. This results is the charm being in an error state which is easily resolved by running

  ```bash
  juju resolve <charm/unit>
  ```

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.26, please see the
relevant sections of the [upstream release notes][upstream-changelog-1.26].

[upstream-changelog-1.26]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.26.md#deprecation

<!-- AUTOGENERATED RELEASE 1.26 ABOVE -->

<!--LINKS-->
[rel]: /kubernetes/docs/release-notes
