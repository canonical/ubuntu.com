---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
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

# 1.14

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

## Previous releases

Please see [this page][historic] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-xxx/archive/bundle.yaml
[historic]: /kubernetes/docs/release-notes-historic
[upgrading-docker]: /kubernetes/docs/upgrading#upgrading-docker
[tigera-home]: https://www.tigera.io/tigera-secure-ee/
[tigera-docs]: /kubernetes/docs/tigera-secure-ee
[haoverview]: /kubernetes/docs/high-availability
[metallb-docs]: /kubernetes/docs/metallb
[hacluster-docs]: /kubernetes/docs/hacluster
