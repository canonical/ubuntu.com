---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: release-notes.html
layout: [base, ubuntu-com]
toc: False
---

<!-- AUTOGENERATE RELEASE NOTES HERE -->


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


# 1.27+ck1 Bugfix release

### June 12, 2023 - `charmed-kubernetes --channel 1.27/stable`

## Fixes

Notable fixes in this release include:

- Vault KV [LP#1949913](https://bugs.launchpad.net/charm-layer-vault-kv/+bug/1949913)

  Possible collisions if two apps with same name related to vault from different models.

- Etcd [LP#2004612](https://bugs.launchpad.net/charm-etcd/+bug/2004612)

  Prometheus cannot access etcd targets created by relation.

- Ceph CSI [LP#2007423](https://bugs.launchpad.net/charm-ceph-csi/+bug/2007423)

  Make hostnetworking configurable.

- Kube-OVN [LP#2017004](https://bugs.launchpad.net/charm-kube-ovn/+bug/2017004)

  Upgrade kube-ovn to v1.11.5.

- Containerd [LP#2017175](https://bugs.launchpad.net/charm-containerd/+bug/2017175)

  Installation of GPU cude-drivers installs gnome-* packages which can shut the servers down on idle.

- Kubernetes API Load Balancer [LP#2017814](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/2017814)

  nginx configuration is missing on non-leader units when VIP is set.

- Kubernetes Control Plane [LP#2020059](https://bugs.launchpad.net/charm-kubernetes-master/+bug/2020059)

  Kubernetes charms don't set ipvs mode (code and docs bug).

A list of all bug fixes and minor updates in this release can be found at
[the launchpad milestone page for 1.27+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.27+ck1).

# 1.27

### April 21, 2023 - `charmed-kubernetes --channel 1.27/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.27/bundle.yaml).

## What's new

### Cilium CNI

We are excited to announce the inclusion of Cilium in our portfolio of
Container Network Interface solutions for Charmed Kubernetes. Cilium is a
powerful CNI, network security and observability solution which provides
enhanced performance and improved security for containerised applications.
The current version of Cilium shipped within the charm is 1.12.5. It also
comes bundled with Hubble: a networking and security observability solution
that offers real time insights of the network and the security state of the
cluster with little performance impact.

### Cloud Providers and Cloud Storage

Operator charms for external cloud providers have been expanded and now
include AWS, Azure, GCP, and vSphere. Previously, cloud-specific features
such as load balancing and storage were managed by Kubernetes in-tree solutions.
Today, cloud provider charms offer flexible management of these features
decoupled from any specific Kubernetes release.

### NVIDIA Network Operator

The NVIDIA network operator charm is a new addition to the Charmed Kubernetes
ecosystem. It simplifies the deployment, operation, and management of NVIDIA
networking resources for Kubernetes.

### Support for Juju 3.1

With this release, Charmed Kubernetes can be deployed with a
juju 2.9, 3.0 or 3.1 controller. This release is intended to serve
as a migration point away from juju 2.9 deployments which is why we
offer a tested strategy of our charms on both 2.9 and 3.1 releases.

## Technical Previews

### KubeVirt

Offered as a technical preview, the KubeVirt charm offers an opinionated
deployment of KubeVirt on Charmed Kubernetes such that virtual machines can be
launched within your Kubernetes cluster.  Charmed Kubernetes on metal will
deploy KubeVirt in such a way to use faster, native hardware virtualization,
but KubeVirt also supports software emulation for cases where accelerated
hardware support is not available.

### Volcano Scheduler

Offered as a technical preview, the suite of Volcano charms deploys on either
MicroK8s or Charmed Kubernetes, and can be used to more effectively schedule
ML/AI workloads which need to ensure effective queuing of jobs requiring GPU
resources. The charm ships with v1.7.0 of Volcano and will follow future
upstream releases. See the [Volcano documentation](/kubernetes/docs/volcano) for more information.


### Cluster API Providers

Cluster API providers for deploying Charmed Kubernetes are available as
technical previews. These providers consist of the Juju Infrastructure
Provider, the CharmedK8s Control Plane Provider, and the CharmedK8s Bootstrap
Provider.

The infrastructure provider is responsible for Juju model management and
machine deployment. The control plane provider handles control plane management,
kubeconfig management, and control plane status reporting. The bootstrap
provider controls what charms are deployed to the machines provisioned by the
infrastructure provider.

While the user experience surrounding certain Juju-related interactions is still
being improved, Charmed Kubernetes can be deployed using the familiar Cluster
API workflow using the providers in their current state. For the current 
instructions, see the [Juju cluster API provider repository](https://github.com/charmed-kubernetes/cluster-api-provider-juju).

## Component Versions

### Charm/Addons pinned versions

- kube-ovn 1.10.4
- calico 3.21.4
- cephcsi 3.7.2
- cinder-csi-plugin 1.26.2
- coredns 1.9.4 / 1.10.0
- ingress-nginx 1.6.4
- k8s-keystone-auth 1.26.2
- kube-state-metrics 2.8.2
- kubernetes-dashboard 2.7.0
- openstack-cloud-controller-manager 1.26.2

### Charm default versions

- cloud-provider-vsphere 1.26
- vsphere-csi-driver 3.0.0
- cloud-provider-azure 1.25.0
- azuredisk-csi-driver 1.23.0
- cloud-provider-aws 1.26.1
- aws-ebs-csi-driver 1.12.0
- gcp-compute-persistent-disk-csi-driver 1.8.0


## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.27](https://launchpad.net/charmed-kubernetes/+milestone/1.27).

## Notes and Known Issues

- Cilium on AWS and OpenStack [LP#2016905](https://bugs.launchpad.net/charm-cilium/+bug/2016905)

  Deploying Cilium on AWS or OpenStack can cause inter-node communication
  failures due to the Fan networking that Juju enables by default in those
  environments. To work around this issue, set model configuration prior
  to deployment:

  `juju model-config cluster-networking-mode=local`

- Known issues scheduled to be resolved in the first 1.27 maintenance
  release can be found at [the launchpad milestone page for 1.27+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.27+ck1).

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for
Kubernetes 1.27, please see the relevant sections of the
[upstream release notes][upstream-changelog-1.27].

[upstream-changelog-1.27]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md#deprecation

<!-- AUTOGENERATED RELEASE 1.27 ABOVE -->

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

- Kubernetes Control Plane LP#2007174

  Restrict non-root access to the script responsible for synchronizing control-plane leader files to followers.

- Bundles [LP#2008582](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/2008582)

  Add missing bundle overlays for AWS/GCE cloud storage providers.


# 1.26+ck1 Bugfix release

### January 16, 2022 - `charmed-kubernetes --channel 1.26/stable` 

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

### December 1, 2022

## Additions

Notable additions in this release include:

- Kubernetes Control Plane [LP#1991957](https://bugs.launchpad.net/bugs/1991957)

  Resolves an issue deploying the charm on Bionic, constituting the last supported release
  of this charm into this ubuntu series.

- Kubernetes Control Plane [LP#1994203](https://bugs.launchpad.net/bugs/1994203)

  Resolves an issue deploying the charm into a jammy lxd container, where a missing
  path definition to `/etc/fstab` interrupted the configure kubelet hook.

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

  The snap installed by the gcp-integrator charm to manage gcp resources collided with the sanp
  automatically installed on new installations. The gcp-integrator charm will automatically
  remove the old snap (`google-cloud-sdk`) and install the correct one (`google-cloud-cli`) on upgrades.

  Bug is marked resolved in 1.25+ck2, but was available in the gcp-integrator charm at time of 1.25+ck1 release.


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


# 1.23

### December 15, 2021 - [charmed-kubernetes-862](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.23/bundle.yaml)

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


# 1.22+ck2 Bugfix release

### October 27, 2021 - charmed-kubernetes-814

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.22+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.22+ck2).


# 1.22+ck1 Bugfix release

### October 21, 2021 - charmed-kubernetes-807

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

# 1.21+ck3 Bugfix release

### August 02, 2021 - charmed-kubernetes-733

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck3).


# 1.21+ck2 Bugfix release

### May 28, 2021 - charmed-kubernetes-679
## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck2).


# 1.21+ck1 Bugfix release

### May 04, 2021 - charmed-kubernetes-655

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck1).


# 1.21

### April 15, 2021 - charmed-kubernetes-632

## What's new

- Azure Arc conformance

Charmed Kubernetes is compliant with the Azure Arc Validation test suite.
More information about this program can be found in the
[azure-arc-validation documentation][arc-docs].

- Container images by release

[LP 1891530](https://bugs.launchpad.net/cdk-addons/+bug/1891530) describes an
upgrade failure for deployments that use a private image registry. The Charmed
Kubernetes release process now publishes a
[list of required images per-release][images-per-release] for administrators
to easily determine what registry changes are needed prior to an upgrade.

## Component upgrades

- cloud-provider-openstack 1.20.0
- coredns 1.8.3
- kube-state-metrics 1.9.8
- kubernetes-dashboard 2.2.0
- nginx-ingress 0.44.0
- pause 3.4.1

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21).

## Notes and Known Issues

- [LP 1920216](https://bugs.launchpad.net/operator-metallb/+bug/1920216) MetalLB
speaker pod logs error with "selfLink was empty, can't make reference".

## Deprecations and API changes

- Private container registry action

The `registry` action of the `kubernetes-worker` charm is deprecated and will
be removed in a future release. See the
[Private Docker Registry](https://ubuntu.com/kubernetes/docs/docker-registry)
documentation for using a custom registry with Charmed Kubernetes.

- Upstream

For details of other deprecation notices and API changes for Kubernetes 1.21, please see the
relevant sections of the [upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.21.md#deprecation)

## Previous releases

Please see [this page][rel] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[rel]: /kubernetes/docs/release-notes
[images-per-release]: https://github.com/charmed-kubernetes/bundle/tree/master/container-images
[arc-docs]: https://github.com/Azure/azure-arc-validation/blob/main/README.md


# 1.20+ck1 Bugfix release

### February 23rd, 2021 - [charmed-kubernetes-596](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.20/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.20+ck1)

## Notes / Known Issues

- Secret names

[LP 1906732](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1906732)
highlighted an issue where `kubernetes-worker` units would overwrite existing
secrets when deployed as different application names. This lead to some worker
units losing the ability to authenticate with the cluster. This has be resolved
by ensuring new secrets are uniquely named in the form: `auth-$username-$random`.

- Juju and GCP

[LP 1761838](https://bugs.launchpad.net/juju/+bug/1761838) describes an issue
with Juju and Google cloud where deployments may fail due to FAN networking.
Workaround this by disabling FAN configuration for Google cloud models:

`juju model-config -m <model_name> fan-config="" container-networking-method=""`



# 1.20

### December 16th, 2020 - charmed-kubernetes-559
## What's new

- Calico VXLAN support

The Calico charm now supports enabling VXLAN encapsulation for Calico network
traffic. This provides an easier alternative to the direct routing or IPIP
encapsulation modes, making it possible to run Calico on any Juju cloud without
special cloud configuration. For more details, see the
[Calico CNI documentation page][cni-calico].

- CoreDNS operator charm support

The CoreDNS component can now be deployed as an operator charm inside the
Kubernetes cluster instead of being managed by the `cdk-addons` snap. This allows
for more control over the component, including additional configuration options
and easier contribution of bug fixes or upgrades to that component.

Details on how to set this up can be found in the [CoreDNS section of the Addons page][coredns].

- Kubernetes Dashboard operator charm support

The Kubernetes Dashboard component can now be deployed as an operator charm inside the
Kubernetes cluster instead of being managed by the `cdk-addons` snap. This allows
for more control over the component, including additional configuration options
and easier contribution of bug fixes or upgrades to that component.

Details on how to set this up can be found in the [Kubernetes Dashboard section of the Addons page][dashboard].

## Component upgrades

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.20](https://launchpad.net/charmed-kubernetes/+milestone/1.20).


## Notes / Known Issues

## Deprecations and API changes

For details of deprecation notices and API changes for Kubernetes 1.20, please see the
relevant sections of the [upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.20.md#deprecation)


# 1.19+ck2 Bugfix release

### November 27th, 2020 - charmed-kubernetes-545

## Fixes
A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck2).

# 1.19+ck1 Bugfix release

### November 20th, 2020 - charmed-kubernetes-541

## Fixes
A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1).

# 1.19

### September 30th, 2020 - charmed-kubernetes-519

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- IPv6 support

This release of Charmed Kubernetes can now enable the alpha IPv6 dual-stack or
beta IPv6-only support in Kubernetes by using IPv6 CIDRs in addition to or
instead of IPv4 CIDRs in the Kubernetes Master charm's `service-cidr` and the
Calico charm's `cidr` charm config.

More information can be found in [Using IPv6 with Charmed Kubernetes][ipv6],
including limitations and known issues.

- CIS benchmark compliance

Charmed Kubernetes is now compliant with the Center for Internet Security (CIS)
benchmark for Kubernetes. Significant changes to the `kubernetes-master` and
`kubernetes-worker` charms have been made to achieve this. Find more information
about these changes, running the benchmark, and analyzing test results in the
[CIS compliance for Charmed Kubernetes][cis-benchmark] documentation.

- Authentication changes

File-based authentication is not compliant with the CIS benchmark. Charmed Kubernetes
now deploys a webhook authentication service that compares API requests to Kubernetes
secrets. If needed, any existing entries in previous authentication files
(`basic_auth.csv` and `known_tokens.csv`) are migrated to secrets during the
`kubernetes-master` charm upgrade.

More information about this new service can be found in the
[Authorisation and Authentication][authn] documentation.

- New Calico configuration options

The new `veth-mtu` setting allows fine tuning of the MTU setting for optimum
performance on the underlying network. See the
[Calico documentation][veth-mtu] for more details and recommendations, and
the [Calico charm docs][1.19-calico] for information on how to set this
configuration.

Calico and related charms (Canal, Tigera Secure EE) also have a new
`ignore-loose-rpf` configuration option. By default, for security, these charms check
that the kernel has strict reverse path forwarding set (`net.ipv4.conf.all.rp_filter`
set to `0` or `1`). In some circumstances you may need to set this to 2, in which case
you can now set `ignore-loose-rpf=true` to ignore the check.

- Ubuntu 20.04

The default operating system for deployed machines is now Ubuntu 20.04 (Focal). Ubuntu 18.04 (Bionic) and 16.04 (Xenial) are still supported.

- MetalLB Operator

MetalLB offers a software network load balancing implementation that allows for
LoadBalancing services in Kubernetes. This bundle has been made available
in the Charm Store to be deployed along Charmed Kubernetes, MicroK8s, or any Kubernetes
supported by Juju. This operator deploys upstream MetalLB in layer 2 mode. The BGP mode
of upstream MetalLB is not supported yet. For more information about deploying and
operating MetalLB, please see the [MetalLB documentation](https://ubuntu.com/kubernetes/docs/metallb).

- SR-IOV CNI

A new SR-IOV CNI addon has been made available for Charmed Kubernetes. Using
SR-IOV CNI, it is now possible to take network interfaces that are SR-IOV
Virtual Functions and attach them directly to pods. For more information, see
the new [SR-IOV CNI documentation][cni-sriov].

For a full list of the changes introduced in Kubernetes 1.19, please see the
[upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.19.md)

## Component upgrades

- addon-resizer 1.8.9
- ceph-csi 2.1.2
- cloud-provider-openstack 1.18.0
- coredns 1.6.7
- kube-state-metrics 1.9.7
- kubernetes-dashboard 2.0.1
- nginx-ingress 0.31.1

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.19](https://launchpad.net/charmed-kubernetes/+milestone/1.19).

## Notes / Known Issues

- The `insecure-bind-address` and `insecure-port` options to `kube-apiserver` have
been removed in this release. Using `juju run` with `kubectl` to interact with the
cluster now requires an explicit `--kubeconfig <file>` option:

    ```bash
    juju run --unit kubernetes-master/0 'kubectl --kubeconfig /root/.kube/config get nodes'
    NAME              STATUS   ROLES    AGE   VERSION
    ip-172-31-10-19   Ready    <none>   71m   v1.19.0
    ```

- The webhook authentication service included in this release runs on port 5000 of each
kubernetes-master unit. Ensure this port is available prior to upgrading.

- Additional known issues scheduled for the first 1.19 bugfix release can be found at [https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1)

## Deprecations and API changes

For details of deprecation notices and API changes for Kubernetes 1.19, please see the
relevant sections of the [upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.19.md#deprecation)

## Previous releases

Please see [this page][historic] for release notes of earlier versions.


<!--LINKS-->
[cis-benchmark]: /kubernetes/docs/cis-compliance
[ipv6]: /kubernetes/docs/ipv6
[cni-sriov]: /kubernetes/docs/cni-sriov
[authn]: /kubernetes/docs/auth#authn
[veth-mtu]: https://docs.tigera.io/calico/3.25/networking/configuring/mtu
[1.19-calico]: /kubernetes/docs/1.19/charm-calico
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[historic]: /kubernetes/docs/release-notes-historic
[upgrading-docker]: /kubernetes/docs/upgrading#upgrading-docker
[tigera-home]: https://www.tigera.io/tigera-products/calico-enterprise/
[tigera-docs]: /kubernetes/docs/tigera-secure-ee
[haoverview]: /kubernetes/docs/high-availability
[metallb-docs]: /kubernetes/docs/metallb
[hacluster-docs]: /kubernetes/docs/hacluster
[cni-calico]: /kubernetes/docs/cni-calico
[containerd]: /kubernetes/docs/containerd
[container-runtime]: /kubernetes/docs/container-runtime
[cis-benchmark]: https://www.cisecurity.org/benchmark/kubernetes/
[heapster-deprecation]: https://github.com/kubernetes-retired/heapster/blob/master/docs/deprecation.md
[dashboard]: /kubernetes/docs/cdk-addons#kubernetes-dashboard
[calico-service-ip-advertisement]: /kubernetes/docs/cni-calico#service-ip-advertisement
[upstream-changelog]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.22.md#deprecation
[upstream-changelog-1.23]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.23.md#deprecation
[upstream-changelog-1.24]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md#deprecation
[cephcsi-upgrade]: https://github.com/ceph/ceph-csi/blob/devel/docs/ceph-csi-upgrade.md
[inclusive-naming]: /kubernetes/docs/inclusive-naming

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/release-notes.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

