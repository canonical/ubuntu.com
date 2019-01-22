---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for CDK
keywords: kubernetes, news, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# CVE-2018-18264 - January 10, 2019

## What happened

- A security vulnerability was found in the Kubernetes dashboard that affected all
versions of the dashboard.

A new dashboard version, v1.10.1, was released to address this vulnerability. This
includes an important change to logging in to the dashboard. The Skip button is now
missing from the login page and a user and password is now required. The easiest way
to log in to the dashboard is to select your ~/.kube/config file and use credentials
from there.

# 1.13 Release Notes

## What's new

- LDAP and Keystone support

Added support for LDAP-based authentication and authorisation via Keystone. Please
read the [documentation][docs-ldap] for details on how to enable this.

- Vault PKI support

Added support for using [Vault](https://jujucharms.com/u/openstack-charmers/vault/)
for PKI in place of EasyRSA. Vault is more secure and robust than EasyRSA and supports
more advanced features for certificate management. See the
[documentation][docs-vault] for details of how to add Vault to CDK and configure it as a
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
 - Fixed pvc stuck in pending ([Issue](https://github.com/juju-solutions/charm-azure-integrator/issues/16))
 - Fixed updating properties of the openstack integrator charm do not propagate automatically ([Issue](https://github.com/juju-solutions/charm-openstack-integrator/issues/10))
 - Fixed flannel error during install hook due to incorrect resource ([Issue](https://github.com/juju-solutions/charm-flannel/issues/52))
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

## Contact Us

- Issues: https://github.com/juju-solutions/bundle-canonical-kubernetes/issues
- IRC: #cdk8s on freenode.net





## 1.12 Release Notes

- Added support for Ubuntu 18.04 (Bionic)

New deployments will get Ubuntu 18.04 machines by default. We will also continue to support CDK on Ubuntu 16.04 (Xenial) machines for existing deployments.

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

## Contact Us

- Issues: <https://github.com/juju-solutions/bundle-canonical-kubernetes/issues>

- IRC: #cdk8s on freenode.net



<!--LINKS-->

[docs-ldap]: /kubernetes/docs/ldap
[docs-vault]: /kubernetes/docs/using-vault
[docs-ear]: /kubernetes/docs/encryption-at-rest
[docs-keepalived]: /kubernetes/docs/keepalived
[docs-registry]: /kubernetes/docs/docker-registry
