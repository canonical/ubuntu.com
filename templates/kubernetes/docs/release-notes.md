---
wrapper_template: "kubernetes/docs/base_docs.html"
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

# 1.16+ck1 Bugfix release

### October 4, 2019 - [charmed-kubernetes-268](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-268/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1).

# 1.16

### September 27, 2019 -  [charmed-kubernetes-252](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-252/archive/bundle.yaml)

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- Kata Containers support

Beginning with Charmed Kubernetes 1.16, the [Kata Containers](https://katacontainers.io) runtime can be used
with containerd to safely run insecure or untrusted pods. When enabled, Kata provides hypervisor isolation
for pods that request it, while trusted pods can continue to run on a shared kernel via runc.
For details on using Kata Containers with Charmed Kubernetes, consult the [documentation](/kubernetes/docs/kata).

- AWS IAM support

Amazon AWS IAM authentication and authorisation is now supported via a subordinate charm. See
[AWS-IAM documentation](/kubernetes/docs/aws-iam-auth) for details on how to use AWS credentials
to log in to your Charmed Kubernetes cluster.

- SSL passthrough support

A new configuration parameter was added to the kubernetes-worker charm to enable ssl passthrough.
This allows TLS termination to happen on the workload. Refer to the
[upstream documentation](https://kubernetes.github.io/ingress-nginx/user-guide/tls/#ssl-passthrough)
for more information.

- Improved LXD support

LXD containers used for hosting Kubernetes components require some specific profile settings. These
profiles are now embedded in the charms themselves and applied when deployed, dramatically
simplifying the process of installing Charmed Kubernetes on a single machine. See the
[Local install documentation](/kubernetes/docs/install-local) for the updated instructions.

- Improved Prometheus/Grafana integration

The setup and configuration of Prometheus and Grafana has been significantly streamlined with
new relations to allow the charms to manage the scraper job and dashboards. This means that
monitoring can now be added by specifying a single overlay when deploying Charmed Kubernetes.
Refer to the [updated documentation](/kubernetes/docs/monitoring) for more information.

- Improved OpenStack integration

The OpenStack Integrator charm can now replace the Kube API Load Balancer by providing a
native OpenStack load balancer (Octavia or Neutron) to provide HA load balancing for the
Kubernetes control plane. Refer to the [updated documentation](/kubernetes/docs/openstack-integration)
for more information.

- Docker Registry with Containerd

The Docker registry charm can now be related directly to the Containerd runtime charm.
Refer to the [documentation](/kubernetes/docs/docker-registry) for instructions on how to deploy the charm.

- Renamed default container registry

The Canonical container image registry has a new, firewall-friendly name:
`image-registry.canonical.com:5000` is now `rocks.canonical.com`. The old URL
is an alias for `rocks` and will continue to work. However, the default
configuration for current charms has changed to the new URL.

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16](https://launchpad.net/charmed-kubernetes/+milestone/1.16).

Special thanks to [pierrop](https://github.com/pierrop) for contributing a fix to
[issue 1841965](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1841965)!

## Known Issues

The Kubernetes Dashboard shipped with Charmed Kubernetes 1.16 is version 2.0.0-beta4. While unusual to ship a beta component with a stable release, in this case it was necessary, since the latest stable dashboard (v1.10.1) does not work with Kubernetes 1.16.

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

## Previous releases

Please see [this page][historic] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
[historic]: /kubernetes/docs/release-notes-historic
[upgrading-docker]: /kubernetes/docs/upgrading#upgrading-docker
[tigera-home]: https://www.tigera.io/tigera-secure-ee/
[tigera-docs]: /kubernetes/docs/tigera-secure-ee
[haoverview]: /kubernetes/docs/high-availability
[metallb-docs]: /kubernetes/docs/metallb
[hacluster-docs]: /kubernetes/docs/hacluster
[cni-calico]: /kubernetes/docs/cni-calico
[containerd]: /kubernetes/docs/containerd
[container-runtime]: /kubernetes/docs/container-runtime

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/release-notes.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
