---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for CDK
keywords: kubernetes,  release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: release-notes.html
layout: [base, ubuntu-com]
toc: False
---

<!-- AUTOGENERATE RELEASE NOTES HERE -->

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
  
  :warning: do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` unless your cluster has taken steps to mitigate the lack of built-in storage such as:
  * Not using storage
  * Using alternative storage like `ceph-csi`
  * Manually configuring the out-of-tree storage provisioner

* PodSecurityPolicy Removed
  PodSecurityPolicy has been removed in 1.25. Please see the [PodSecurityPolicy Migration Guide](https://kubernetes.io/docs/tasks/configure-pod-container/migrate-from-psp/) if you have deployed pod security policies in your cluster. 
  :warning: do not set `channel=1.25` on charm config `kubernetes-control-plane` and `kubernetes-worker` until your policies have been migrated. 

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




<!--LINKS-->


[calico-service-ip-advertisement]: /kubernetes/docs/cni-calico#service-ip-advertisement
[upstream-changelog]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.22.md#deprecation
[upstream-changelog-1.23]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.23.md#deprecation
[upstream-changelog-1.24]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md#deprecation
[cephcsi-upgrade]: https://github.com/ceph/ceph-csi/blob/devel/docs/ceph-csi-upgrade.md


<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/release-notes.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

