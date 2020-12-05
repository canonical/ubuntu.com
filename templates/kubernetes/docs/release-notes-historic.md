---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, news, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: release-notes-historic.html
layout: [base, ubuntu-com]
toc: False
---

# 1.15+ck1 Bugfix release

### August 15, 2019 - [charmed-kubernetes-209](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-209/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.15+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.15+ck1).


# 1.15

### June 28, 2019 -  [charmed-kubernetes-142](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-142/archive/bundle.yaml)

## What's new

- Containerd support

Although Docker is still supported, [containerd](https://containerd.io/) is now
the default container runtime in Charmed Kubernetes. Containerd brings significant
[peformance improvements](https://kubernetes.io/blog/2018/05/24/kubernetes-containerd-integration-goes-ga/)
and prepares the way for Charmed Kubernetes integration with
[Kata](https://katacontainers.io/) in the future.

Container runtime code has been moved out of the kubernetes-worker charm, and
into subordinate charms (one for Docker and one for containerd). This allows
the operator to swap the container runtime as desired, and even mix
container runtimes within a cluster. It also allows for additional container
runtimes to be supported in the future. Because this is a significant change, you
are advised to read the [upgrade notes](/kubernetes/docs/upgrade-notes) before
upgrading from a previous version.

- Calico 3.x support

The Calico and Canal charms have been updated to install Calico 3.6.1 by
default. For users currently running Calico 2.x, the next time you upgrade your
Calico or Canal charm, the charm will automatically upgrade to Calico 3.6.1
with no user intervention required.

The Calico charm's `ipip` config option has been changed from a boolean to a
string to allow for the addition of a new mode. This change is illustrated in
the table below:

| New value     | Old value         | Description                                           |
|---------------|-------------------|-------------------------------------------------------|
| "Never"       | false             | Never use IPIP encapsulation. (The default)           |
| "Always"      | true              | Always use IPIP encapsulation.                        |
| "CrossSubnet" | \<Not supported\> | Only use IPIP encapsulation for cross-subnet traffic. |

- Calico BGP support

Several new config options have been added to the Calico charm to support BGP
functionality within Calico. These additions make it possible to configure
external BGP peers, route reflectors, and multiple IP pools. For instructions
on how to use the new config options, see the
[CNI with Calico documentation][cni-calico].

- Custom load balancer addresses

Support has been added to specify the IP address of an external load balancer.
This support is in the kubeapi-load-balancer and the kubernetes-master charms.
This allows a virtual IP address on the kubeapi-load-balancer charm or the
IP address of an external load balancer. See the
[custom load balancer page](https://www.ubuntu.com/kubernetes/docs/custom-loadbalancer)
for more information.

- Container image registry

By default, all container images required by the deployment come from the
[Canonical image registry](https://image-registry.canonical.com:5000). This includes
images used by the cdk-addons snap, ingress, dns, storage providers, etc. The registry
can be configured with the new `image-registry` config option on the `kubernetes-master`
charm.

The `addons-registry` config option is now deprecated. If set, this will take precedence
over the new `image-registry` option when deploying images from the cdk-addons snap.
However, the `addons-registry` option will be removed in 1.17. Users are encouraged
to migrate to the new `image-registry` option as soon as possible.

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.15](https://launchpad.net/charmed-kubernetes/+milestone/1.15).

## Known Issues

- Docker-registry interface does not support containerd ([bug 1833579](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1833579))

When a `docker-registry` charm is related, `kubernetes-worker` units will attempt to configure
the Docker `daemon.json` configuration file and may also attempt to use `docker login` to
authenticate with the connected registry. This will not work in a containerd environment,
as there is no `daemon.json` file nor `docker` command available to invoke.

Users relying on `docker-registry` to serve container images to Kubernetes deployments should
continue to use the Docker subordinate runtime as outlined in the [upgrade notes](/kubernetes/docs/upgrade-notes#1.15),
under the heading "To keep Docker as the container runtime".

- Containerd charm does not work on LXD ([bug 1834524](https://bugs.launchpad.net/charm-containerd/+bug/1834524))

We intend to fix this shortly after release. For now, if you want to deploy
Charmed Kubernetes on LXD, we recommend using the Docker subordinate charm
instead. Instructions for this can be found in the
[Container runtimes][container-runtime] section of our documentation.

- New provisioner value for Cinder storage classes

The switch to the external cloud provider for OpenStack includes an upstream change
to the `provisioner` field for storage classes using Cinder. A `cdk-cinder`
storage class will be automatically created with the correct value, but any
manually created storage classes will need to be edited and the `provisioner`
field changed to `csi-cinderplugin`. Existing volumes will be unaffected, but
new PVCs using those storage classes will hang until the storage class is
updated.


# 1.14 Bugfix release

### June 19th, 2019 - [charmed-kubernetes-124](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-124/archive/bundle.yaml)

## Fixes

 - Fixed leader_set being called by kubernetes-master followers ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1833089))


# 1.14 Bugfix release

### June 6th, 2019 - [charmed-kubernetes-96](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-96/archive/bundle.yaml)

## Fixes

 - Fixed leader_get import error in .reactive/kubernetes_master_worker_base.py ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1831550))
 - Fixed kernel network tunables need better defaults and to be configurable ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1825436))
 - Fixed proxy-extra-args config missing from kubernetes-master ([Issue](https://github.com/charmed-kubernetes/layer-kubernetes-master-worker-base/pull/3))


# 1.14 Bugfix release

### May 23rd, 2019 - [charmed-kubernetes-74](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-74/archive/bundle.yaml)

## Fixes

 - Fixed missing core snap resource for etcd, kubernetes-master, kubernetes-worker, and kubernetes-e2e charms ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1828063))
 - Fixed kubernetes-master charm resetting user changes to basic_auth.csv ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1826260))
 - Fixed charm upgrades removing /srv/kubernetes directory ([Issue](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/1825288))
 - Fixed docker-opts charm config being ignored on kubernetes-worker ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1826463))
 - Fixed master services constantly restarting due to cert change ([Issue](https://bugs.launchpad.net/charm-easyrsa/+bug/1826625))
 - Fixed kubernetes-worker tag error on GCP ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1827528))


# 1.14 Bugfix release

### April 23rd, 2019 - [charmed-kubernetes-31](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-31/archive/bundle.yaml)

## Fixes

 - Added automatic and manual cleanup for subnet tags ([Issue](https://github.com/juju-solutions/charm-aws-integrator/pull/36))
 - Added action apply-manifest ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-master/pull/3))
 - Added label to inform Juju of cloud ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-worker/pull/3))
 - Added support for loadbalancer-ips ([Issue](https://github.com/charmed-kubernetes/charm-kubeapi-load-balancer/pull/1))
 - Fixed handling "not found" error message ([Issue](https://github.com/juju-solutions/charm-azure-integrator/pull/20))
 - Fixed snapd_refresh smashed by subordinate charm ([Issue](https://github.com/charmed-kubernetes/layer-etcd/pull/148))
 - Fixed making sure cert has proper IP as well as DNS ([Issue](https://github.com/charmed-kubernetes/layer-etcd/pull/149))
 - Fixed etcd charm stuck on "Requesting tls certificates" ([Issue](https://github.com/charmed-kubernetes/layer-etcd/pull/150))
 - Fixed cert relation thrashing due to random SAN order ([Issue](https://github.com/charmed-kubernetes/layer-etcd/pull/151))
 - Fixed contact point for keystone to be public address ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-master/pull/2))
 - Fixed cluster tag not being sent to new worker applications ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-master/pull/4))
 - Fixed removal of ceph relations causing trouble ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-master/pull/6))
 - Fixed pause/resume actions ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-worker/pull/2))
 - Fixed ingress address selection to avoid fan IPs ([Issue](https://github.com/charmed-kubernetes/layer-kubernetes-common/pull/1))
 - Fixed snapd_refresh handler ([Issue](https://github.com/charmed-kubernetes/layer-kubernetes-master-worker-base/pull/2))
 - Fixed credentials fields to allow for fallback and override ([Issue](https://github.com/juju-solutions/charm-openstack-integrator/pull/17))


# 1.14 Bugfix release

### April 4th, 2019 - [canonical-kubernetes-471][bundle]

## Fixes

- Fixed Ceph PV fails to mount in pod ([Issue](https://bugs.launchpad.net/cdk-addons/+bug/1820908))
- Fixed Problems switching from kube-dns to CoreDNS ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1822001))
- Fixed defaultbackend-s390x image ([Issue](https://github.com/juju-solutions/kubernetes/pull/229))
- Fixed `keystone-ssl-ca` config description ([Issue](https://github.com/juju-solutions/kubernetes/pull/230))
- Partial fix for using custom CA with Keystone ([Issue](https://github.com/juju-solutions/cdk-addons/pull/91))


# 1.14

### March 27, 2019 - [canonical-kubernetes-466](https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-466/archive/bundle.yaml)

## What's new

- Tigera Secure EE support

**CDK** extends its support for CNI solutions by adding the option of using
[**Tigera Secure EE**][tigera-home], the enterprise-ready alternative to Calico. Users are now able
to deploy **CDK** with **Tigera Secure EE** installed and subsequently configure additional
features such as ElasticSearch and the CNX secure connectivity manager. For further
details, please see the [**CDK** CNI documentation][tigera-docs]

- Additional options for High Availability

Version 1.13 of **CDK** introduced support for **keepalived** to provide HA for the
api-loadbalancer. This new release adds support for both **HAcluster** and **MetalLB**. See
the relevant [HAcluster][hacluster-docs] and [MetalLB][metallb-docs] pages in the
documentation, as well as the [HA overview][haoverview] for more information.

- Added CoreDNS support

All new deployments of **CDK 1.14** will install **CoreDNS 1.4.0** by
default instead of **KubeDNS**.

Existing deployments that are upgraded to **CDK 1.14** will
continue to use **KubeDNS** until the operator chooses to upgrade to
**CoreDNS**. See the [upgrade notes][upgrade-notes] for details.

 - Docker upgrades: Docker 18.09.2 is the new default in Ubuntu. CDK now includes a charm action to simplify [upgrading Docker across a set of worker nodes][upgrading-docker].

- Registry enhancements: Read-only mode, frontend support, and additional TLS configuration options have been added to the [Docker registry charm](https://jujucharms.com/u/containers/docker-registry/114).

- Cloud integrations: New configuration options have been added to the
[vSphere](https://jujucharms.com/u/containers/vsphere-integrator/) (`folder` and `respool_path`) and
[OpenStack]( https://jujucharms.com/u/containers/openstack-integrator/) (`ignore-volume-az`, `bs-version`, `trust-device-path`) integrator charms.


## Fixes

 - Added an action to upgrade Docker ([Issue](https://github.com/juju-solutions/layer-docker/pull/135))
 - Added better multi-client support to EasyRSA ([Issue](https://github.com/juju-solutions/layer-easyrsa/pull/15))
 - Added block storage options for OpenStack ([Issue](https://github.com/juju-solutions/kubernetes/pull/218))
 - Added dashboard-auth config option to master ([Issue](https://github.com/juju-solutions/kubernetes/pull/222))
 - Added docker registry handling to master ([Issue](https://github.com/juju-solutions/kubernetes/pull/210))
 - Added more TLS options to Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/20))
 - Added new folder/respool_path config for vSphere ([Issue](https://github.com/juju-solutions/charm-vsphere-integrator/pull/2))
 - Added proxy support to Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/21))
 - Added read-only mode for Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/22))
 - Fixed `allow-privileged` not enabled when Ceph relation joins ([Issue](https://github.com/juju-solutions/kubernetes/pull/197))
 - Fixed apt install source for VaultLocker ([Issue](https://github.com/juju-solutions/layer-vaultlocker/pull/3))
 - Fixed Ceph relation join not creating necessary pools ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/631))
 - Fixed Ceph volume provisioning fails with "No such file or directory" ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/710))
 - Fixed detecting of changed AppKV values ([Issue](https://github.com/juju-solutions/layer-vault-kv/pull/6))
 - Fixed docker-ce-version config not working for non-NVIDIA configuration ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/621))
 - Fixed Docker registry behavior with multiple frontends ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/26))
 - Fixed Docker registry not cleaning up old relation data ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/28))
 - Fixed Docker registry to correctly handle frontend removal ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/29))
 - Fixed Docker registry to work behind a TLS-terminating frontend ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/25))
 - Fixed error: snap "etcd" is not compatible with --classic ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/727))
 - Fixed file descriptor limit on api server ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/703))
 - Fixed GCP NetworkUnavailable hack when only some pods pending ([Issue](https://github.com/juju-solutions/kubernetes/pull/211))
 - Fixed handle_requests being called when no clients are related ([Issue](https://github.com/juju-solutions/charm-openstack-integrator/pull/14))
 - Fixed handling of nameless and SANless server certificates ([Issue](https://github.com/juju-solutions/layer-easyrsa/pull/16))
 - Fixed inconsistent cert flags ([Issue](https://github.com/juju-solutions/layer-easyrsa/pull/18))
 - Fixed ingress=false not allowing custom ingress to be used ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/718))
 - Fixed installing from outdated docker APT respository ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/388))
 - Fixed IPv6 disabled on kubeapi-loadbalancer machines leads to error during installation ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/623))
 - Fixed Keystone not working with multiple masters ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/681))
 - Fixed kubeconfig should contain the VIP when keepalived used with kubeapi-load-balancer ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/712))
 - Fixed metrics server for k8s 1.11 ([Issue](https://github.com/juju-solutions/cdk-addons/pull/81))
 - Fixed proxy var to apply when adding an apt-key ([Issue](https://github.com/juju-solutions/layer-docker/pull/133))
 - Fixed RBAC enabled results in error: unable to upgrade connection ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/696))
 - Fixed registry action creating configmap in the wrong namespace  ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/721))
 - Fixed rules for metrics-server ([Issue](https://github.com/juju-solutions/cdk-addons/pull/76))
 - Fixed status when writing kubeconfig file ([Issue](https://github.com/juju-solutions/kubernetes/pull/202))
 - Fixed "subnet not found" to be non-fatal ([Issue](https://github.com/juju-solutions/charm-aws-integrator/pull/34))
 - Fixed vSphere integrator charm not updating cloud-config when setting new charm defaults  ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/695))
 - Removed deprecated allow-privileged config from worker ([Issue](https://github.com/juju-solutions/kubernetes/pull/204))
 - Removed use of global / shared client certificate ([Issue](https://github.com/juju-solutions/kubernetes/pull/207))
 - Updated default nginx-ingress controller to 0.22.0 for amd64 and arm64 ([Issue](https://github.com/juju-solutions/kubernetes/pull/220))

# 1.13 Bugfix Release

### February 21, 2019 - [canonical-kubernetes-435](https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-435/archive/bundle.yaml)

## Fixes

- Fixed docker does not start when docker_runtime is set to nvidia ([Issue](https://bugs.launchpad.net/charm-layer-docker/+bug/1816471))
- Fixed snapd_refresh charm option conflict ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/657))

# CVE-2018-18264

### January 10, 2019

## What happened

- A security vulnerability was found in the Kubernetes dashboard that affected all
versions of the dashboard.

A new dashboard version, v1.10.1, was released to address this vulnerability. This
includes an important change to logging in to the dashboard. The Skip button is now
missing from the login page and a user and password is now required. The easiest way
to log in to the dashboard is to select your ~/.kube/config file and use credentials
from there.

# 1.13 Release Notes

### December 10, 2018

## What's new

- LDAP and Keystone support

Added support for LDAP-based authentication and authorisation via Keystone. Please
read the [documentation][docs-ldap] for details on how to enable this.

- Vault PKI support

Added support for using [Vault](https://jujucharms.com/u/openstack-charmers/vault/)
for PKI in place of EasyRSA. Vault is more secure and robust than EasyRSA and supports
more advanced features for certificate management. See the
[documentation][docs-vault] for details of how to add Vault to Charmed Kubernetes and configure it as a
root or intermediary CA.

- Encryption-at-rest support using Vault

Added support for encryption-at-rest for cluster secrets, leveraging
[Vault](https://jujucharms.com/u/openstack-charmers/vault/) for data protection. This
ensures that even the keys used to encrypt the data are protected at rest, unlike many
configurations of encryption-at-rest for Kubernetes. Please see the
[documentation][docs-ear] for further details.

- Private Docker registry support

Added support for the [Docker Registry](https://jujucharms.com/u/containers/docker-registry)
charm to provide Docker images to cluster components without requiring access to
public registries. Full instructions on using this feature are in the [documentation][docs-registry].

- Keepalived support

The keepalived charm can be used to run multiple kube-api-loadbalancers behind a
virtual IP. For more details, please see the [documentation][docs-keepalived].

- Nginx update

Nginx was updated to v0.21.0, which brings a few changes of which to be aware. The first
is that nginx is now in a namespace by itself, which is derived from the application name.
By default this will be `ingress-nginx-kubernetes-worker`. The second change relates to
custom configmaps. The name has changed to `nginx-configuration` and the configmap needs to
reside in the same namespace as the nginx deployment.

## Fixes

 - Added post deployment script for jaas/jujushell ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/pull/697))
 - Added support for load-balancer failover ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/453))
 - Added always restart for etcd ([Issue](https://github.com/juju-solutions/layer-etcd/pull/145))
 - Added Xenial support to Azure integrator ([Issue](https://github.com/juju-solutions/charm-azure-integrator/pull/17))
 - Added Bionic support to Openstack integrator ([Issue](https://github.com/juju-solutions/charm-openstack-integrator/pull/13))
 - Added support for ELB service-linked role ([Issue](https://github.com/juju-solutions/charm-aws-integrator/pull/29))
 - Added ability to configure Docker install source ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/621))
 - Fixed EasyRSA does not run as an LXD container on 18.04 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/654))
 - Fixed ceph volumes cannot be attached to the pods after 1.12 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/662))
 - Fixed ceph volumes fail to attach with "node has no NodeID annotation" ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/675))
 - Fixed ceph-xfs volumes failing to format due to "executable file not found in $PATH" ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/668))
 - Fixed ceph volumes not detaching properly ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/669))
 - Fixed ceph-csi addons not getting cleaned up properly ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/680))
 - Fixed Calico/Canal not working with kube-proxy on master ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/660))
 - Fixed issue with Canal charm not populating the kubeconfig option in 10-canal.conflist ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/671))
 - Fixed cannot access logs after enabling RBAC ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/642))
 - Fixed RBAC breaking prometheus/grafana metric collection ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/635))
 - Fixed upstream Docker charm config option using wrong package source ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/620))
 - Fixed a timing issue where ceph can appear broken when it's not ([Issue](https://github.com/juju-solutions/kubernetes/pull/173))
 - Fixed status when cni is not ready ([Issue](https://github.com/juju-solutions/kubernetes/pull/174))
 - Fixed an issue with calico-node service failures not surfacing ([Issue](https://github.com/juju-solutions/layer-calico/pull/28))
 - Fixed empty configuration due to timing issue with cni. ([Issue](https://github.com/juju-solutions/layer-canal/pull/22))
 - Fixed an issue where the calico-node service failed to start ([Issue](https://github.com/juju-solutions/layer-canal/pull/24))
 - Fixed updating policy definitions during upgrade-charm on AWS integrator ([Issue](https://github.com/juju-solutions/charm-aws-integrator/pull/30))
 - Fixed parsing credentials config value ([Issue](https://github.com/juju-solutions/charm-azure-integrator/pull/18))
 - Fixed pvc stuck in pending (azure-integrator)
 - Fixed updating properties of the openstack integrator charm do not propagate automatically (openstack-integrator)
 - Fixed flannel error during install hook due to incorrect resource (flannel)
 - Updated master and worker to handle upstream changes from OpenStack Integrator ([Issue](https://github.com/juju-solutions/kubernetes/pull/176))
 - Updated to CNI 0.7.4 ([Issue](https://github.com/juju-solutions/kubernetes/pull/194))
 - Updated to Flannel v0.10.0 ([Issue](https://github.com/juju-solutions/charm-flannel/pull/50))
 - Updated Calico and Canal charms to Calico v2.6.12 ([Issue](https://github.com/juju-solutions/layer-calico/pull/30), [Issue](https://github.com/juju-solutions/layer-canal/pull/27))
 - Updated to latest CUDA and removed version pins of nvidia-docker stack ([Issue](https://github.com/juju-solutions/layer-docker/pull/123))
 - Updated to nginx-ingress-controller v0.21.0 ([Issue](https://github.com/juju-solutions/kubernetes/pull/195))
 - Removed portmap from Calico resource ([Issue](https://github.com/juju-solutions/layer-calico/pull/29))
 - Removed CNI bins from flannel resource ([Issue](https://github.com/juju-solutions/layer-canal/pull/25))

## Known issues

 - A [current bug](https://github.com/kubernetes/kubernetes/issues/70044) in Kubernetes could prevent the upgrade from properly deleting old pods. `kubectl delete pod <pod_name> --force --grace-period=0` can be used to clean them up.


## 1.12 Release Notes

- Added support for Ubuntu 18.04 (Bionic)

New deployments will get Ubuntu 18.04 machines by default. We will also continue to support Charmed Kubernetes on Ubuntu 16.04 (Xenial) machines for existing deployments.

- Added kube-proxy to kubernetes-master

The kubernetes-master charm now installs and runs kube-proxy along with the other master services. This makes it possible for the master services to reach Service IPs within the cluster, making it easier to enable certain integrations that depend on this functionality (e.g. Keystone).

For operators of offline deployments, please note that this change may require you to attach a kube-proxy resource to kubernetes-master.

- New kubernetes-worker charm config: kubelet-extra-config

In Kubernetes 1.10, a new KubeletConfiguration file was introduced, and many of Kubelet's command line options were moved there and marked as deprecated. In order to accomodate this change, we've introduced a new charm config to kubernetes-worker: `kubelet-extra-config`.

This config can be used to override KubeletConfiguration values provided by the charm, and is usable on any Canonical cluster running Kubernetes 1.10+.

The value for this config must be a YAML mapping that can be safely merged with a KubeletConfiguration file. For example:

```
juju config kubernetes-worker kubelet-extra-config="{evictionHard: {memory.available: 200Mi}}"
```

For more information about KubeletConfiguration, see upstream docs:
https://kubernetes.io/docs/tasks/administer-cluster/kubelet-config-file/

- Added support for Dynamic Kubelet Configuration

While we recommend `kubelet-extra-config` as a more robust and approachable way to configure Kubelet, we've also made it possible to configure kubelet using the Dynamic Kubelet Configuration feature that comes with Kubernetes 1.11+. You can read about that here:
https://kubernetes.io/docs/tasks/administer-cluster/reconfigure-kubelet/

- New etcd charm config: bind_to_all_interfaces ([PR](https://github.com/juju-solutions/layer-etcd/pull/137))

Default `true`, which retains the old behavior of binding to 0.0.0.0. Setting this to `false` makes etcd bind only to the addresses it expects traffic on, as determined by the configuration of [Juju endpoint bindings](https://docs.jujucharms.com/2.4/en/charms-deploying-advanced#deploying-to-network-spaces).

Special thanks to [@rmescandon](https://github.com/rmescandon) for this contribution!

- Updated proxy configuration

For operators who currently use the `http-proxy`, `https-proxy` and `no-proxy` Juju model configs, we recommend using the newer `juju-http-proxy`, `juju-https-proxy` and `juju-no-proxy` model configs instead. See the [Proxy configuration](https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Proxy-configuration) page for details.

## Fixes

- Fixed kube-dns constantly restarting on 18.04 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/655))
- Fixed LXD machines not working on 18.04 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/654))
- Fixed kubernetes-worker unable to restart services after kubernetes-master leader is removed ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/627))
- Fixed kubeapi-load-balancer default timeout might be too low ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/650))
- Fixed unable to deploy on NVidia hardware ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/664))

<!--LINKS-->

[docs-ldap]: /kubernetes/docs/ldap
[docs-vault]: /kubernetes/docs/using-vault
[docs-ear]: /kubernetes/docs/encryption-at-rest
[docs-keepalived]: /kubernetes/docs/keepalived
[docs-registry]: /kubernetes/docs/docker-registry

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/release-notes-historic.md" class="p-notification__action">edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
