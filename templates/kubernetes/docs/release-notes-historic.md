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
# 1.18+ck2 Bugfix release

### August 12, 2020 - charmed-kubernetes-485
## Fixes

Bug fixes included in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.18+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.18+ck2).


# 1.18+ck1 Bugfix release

### June 11, 2020 - charmed-kubernetes-464

Before upgrading from 1.17 or earlier, please read the
[upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- New options for custom TLS data in container runtime charms

All container runtime subordinate charms now support a `custom-registry-ca`
option that can be used to specify a `base64` encoded Certificate Authority
(CA) certificate. The value set here will be installed as a system-wide
trusted CA. See the
[related issue](https://bugs.launchpad.net/layer-container-runtime-common/+bug/1831153)
for more details.

For users that require custom TLS configuration per registry, the `containerd`
subordinate charm has expanded the `custom_registries` config option to
support `ca_file`, `cert_file`, and `cert_key`. These can be set for each
custom registry to enable TLS without altering the system-wide trusted CAs.
See the
[related issue](https://bugs.launchpad.net/charm-containerd/+bug/1879347)
for more details.

Both of the above options allow the container runtime located on
`kubernetes-worker` units to pull containers from a registry that utilizes
custom TLS certificates.

- New memory constraint for `kubeapi-load-balancer`

Deploying Charmed Kubernetes now requires a minimum of 4GB of RAM for the
`kubeapi-load-balancer`. This addresses OOM errors reported in the
[related issue](https://bugs.launchpad.net/charmed-kubernetes-bundles/+bug/1873044).

- Updated profile when deploying to LXD

An updated LXD profile has been included in `kubernetes-master` and
`kubernetes-worker` charms. This resolves an
[issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1876618)
where containers would fail to start in a LXD environment.

## Fixes

Bug fixes included in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.18+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.18+ck1).

# 1.18

### April 13, 2020 - charmed-kubernetes-430

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- New SSL options for nginx-ingress-controller

New configuration options on the kubernetes-worker charm,
`ingress-default-ssl-certificate` and `ingress-default-ssl-key`, allow you to
configure nginx-ingress-controller with your own SSL certificate for serving
Kubernetes ingress traffic.

- Multus support

This release of Charmed Kubernetes introduces support for
[Multus](https://github.com/intel/multus-cni), a CNI provider that makes it
possible to attach multiple network interfaces to your pods.

Along the way, we've also updated existing charms to make it possible for
multiple CNI providers to be deployed together in the same cluster.

For more details on Multus support in Charmed Kubernetes and how to get started,
please refer to the [Multus documentation page](/kubernetes/docs/cni-multus).

- CIS Benchmark 1.5.0

The `cis-benchmark` action now supports version 1.5.0 of the CIS Kubernetes Benchmark.
See the [CIS compliance](/kubernetes/docs/cis-compliance) page for information on
running this action on Charmed Kubernetes components.

- Containerd version hold

The version of [containerd](https://containerd.io/) will now be held. This means
that the version of [containerd](https://containerd.io/) will not be upgraded along
with the charm. To update containerd to the latest stable, currently 1.3.3, you can
call the `upgrade-containerd` action:

```bash
juju run-action --wait containerd/0 upgrade-containerd
```

This will perform the upgrade and return any output. If you have more than
one unit of containerd,  you should run this on each unit. The upgrades can be
staggered to avoid downtime.

## Component Upgrades

Many of the components in Charmed Kubernetes 1.18 have been upgraded. The following list
highlights some of the more notable version changes:

- containerd 1.3.3 (see above)
- coredns 1.6.7
- dashboard 2.0.0-rc5
- etcd 3.3.15
- openstack-provider 1.17

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.18](https://launchpad.net/charmed-kubernetes/+milestone/1.18).

## Notes / Known Issues

- Heapster, InfluxDB, Grafana addons have been removed from `cdk-addons`

Heapster was initially [deprecated][heapster-deprecation] in 1.11; users
were encouraged to move to the `metrics-server` for similar functionality.
With 1.18, the `cluster-monitoring` addons (Heapster, InfluxDB, and Grafana)
have been removed from the Kubernetes source tree and therefore removed from
the `cdk-addons` snap as well. Customers relying on these addons should
migrate to a `metrics-server` solution prior to upgrading. Note: these
removals do not affect the Kubernetes Dashboard nor the methods described in
[Monitoring Charmed Kubernetes](/kubernetes/docs/monitoring).

- Containerd cannot pull images from a registry with TLS mutual authentication

An issue with the `containerd` charm prevents pulling images from a private
container registry when TLS mutual authentication is enabled. Where possible,
users can workaround this issue by disabling mutual authentication on the
registry. More details can be found in the following bug:

https://bugs.launchpad.net/charm-containerd/+bug/1853653

- New provisioner value for Cinder storage classes

The new version of the openstack-provisioner includes an upstream change
to the `provisioner` field for storage classes using Cinder. The `cdk-cinder`
storage class will be automatically updated, but any manually created storage
classes will need to be edited and the `provisioner` field changed to
`cinder.csi.openstack.org`. Existing volumes will be unaffected, but new
PVCs using those storage classes will hang until the storage class is updated.

# 1.17+ck2 Bugfix release

### March 2, 2020 - charmed-kubernetes-410

## Fixes

CephFS is now supported in Charmed Kubernetes. This allows for ReadWriteMany volumes
which can be attached to multiple pods. More information can be found in the
[storage documentation](/kubernetes/docs/storage).

Additional bug fixes included in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.17+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.17+ck2).

# 1.17+ck1 Bugfix release

### January 15, 2020 - charmed-kubernetes-372

## Fixes

We fixed an issue where pod-to-pod network traffic was being unnecessarily
masqueraded when using Flannel or Canal. More details can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.17+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.17+ck1).

# 1.17

### December 17, 2019 - charmed-kubernetes-335

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- CIS Benchmark

The **Center for Internet Security (CIS)** maintains a [Kubernetes benchmark][cis-benchmark]
that is helpful to ensure clusters are deployed in accordance with security best practices.
See the [CIS Compliance](/kubernetes/docs/cis-compliance) documentation for instructions on
how to run this compliance benchmark.

- Snap Coherence

Beginning with Charmed Kubernetes 1.17, updates to Kubernetes snap packages used by
`kubernetes-master` and `kubernetes-worker` charms will be applied in a controlled fashion. Known
as **Snap Coherence**, this feature ensures snap updates are first applied to individual master
units, followed by workers. If an update fails, the process is aborted before affecting the entire
cluster. This feature also allows snap revisions to be controlled by a snap store proxy. See
[snap coherence](/kubernetes/docs/snap-coherence) documentation for details.

- Nagios checks

Additional Nagios checks have been added for the `kubernetes-master` and `kubernetes-worker` charms.
These checks enhance the monitoring and reporting available via Nagios by collecting data on node
registration and API server connectivity.

- Improved metrics

`kube-state-metrics` is now added by default to the cluster when monitoring is enabled. New default
dashboards are also included to highlight these metrics with Prometheus/Grafana.

- Storage Classes created by default

Storage classes will now be created if the `kubernetes-master` charm is related to an
integrator charm. These classes are for AWS, GCE, OpenStack, and Azure and are named cdk-ebs,
cdk-gce-pd, cdk-cinder, and cdk-azure-disk, respectively.

- Support for etcd 3.3 and 3.4

Whilst Charmed Kubernetes 1.17 ships with etcd 3.3 by default, it also brings support for
running etcd 3.4. To do so, you can simply run the following Juju command:

```bash
juju config etcd channel=3.4/stable
```

## Component Upgrades

Many of the components in Charmed Kubernetes 1.17 have been upgraded. The following list
highlights some of the more notable version changes:

- calico 3.10.1
- coredns 1.6.5
- etcd 3.3
- nfs-provisioner 3.1.0
- nginx-ingress-controller 0.26.1

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.17](https://launchpad.net/charmed-kubernetes/+milestone/1.17).

## Notes / Known Issues

- The `registry` action for the `kubernetes-worker` charm has been deprecated and will be removed
in a future release. To enable a custom container registry, please see the
[registry](/kubernetes/docs/docker-registry) documentation.

# 1.16+ck2 Bugfix release

### November 22, 2019 - charmed-kubernetes-316

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck2).

# 1.16+ck1 Bugfix release

### October 4, 2019 - charmed-kubernetes-270

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1).

# 1.16

### September 27, 2019 - charmed-kubernetes-252

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

### August 15, 2019 - charmed-kubernetes-209

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.15+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.15+ck1).


# 1.15

### June 28, 2019 -  charmed-kubernetes-142

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

### June 19th, 2019 - charmed-kubernetes-124

## Fixes

 - Fixed leader_set being called by kubernetes-master followers ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1833089))


# 1.14 Bugfix release

### June 6th, 2019 - charmed-kubernetes-96

## Fixes

 - Fixed leader_get import error in .reactive/kubernetes_master_worker_base.py ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1831550))
 - Fixed kernel network tunables need better defaults and to be configurable ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1825436))
 - Fixed proxy-extra-args config missing from kubernetes-master ([Issue](https://github.com/charmed-kubernetes/layer-kubernetes-master-worker-base/pull/3))


# 1.14 Bugfix release

### May 23rd, 2019 - charmed-kubernetes-74

## Fixes

 - Fixed missing core snap resource for etcd, kubernetes-master, kubernetes-worker, and kubernetes-e2e charms ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1828063))
 - Fixed kubernetes-master charm resetting user changes to basic_auth.csv ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1826260))
 - Fixed charm upgrades removing /srv/kubernetes directory ([Issue](https://bugs.launchpad.net/charm-kubeapi-load-balancer/+bug/1825288))
 - Fixed docker-opts charm config being ignored on kubernetes-worker ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1826463))
 - Fixed master services constantly restarting due to cert change ([Issue](https://bugs.launchpad.net/charm-easyrsa/+bug/1826625))
 - Fixed kubernetes-worker tag error on GCP ([Issue](https://bugs.launchpad.net/charm-kubernetes-worker/+bug/1827528))


# 1.14 Bugfix release

### April 23rd, 2019 - charmed-kubernetes-31

## Fixes

 - Added automatic and manual cleanup for subnet tags (
 - Added action apply-manifest ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-master/pull/3))
 - Added label to inform Juju of cloud ([Issue](https://github.com/charmed-kubernetes/charm-kubernetes-worker/pull/3))
 - Added support for loadbalancer-ips ([Issue](https://github.com/charmed-kubernetes/charm-kubeapi-load-balancer/pull/1))
 - Fixed handling "not found" error message 
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
 - Fixed credentials fields to allow for fallback and override 


# 1.14 Bugfix release

### April 4th, 2019 - canonical-kubernetes-471

## Fixes

- Fixed Ceph PV fails to mount in pod ([Issue](https://bugs.launchpad.net/cdk-addons/+bug/1820908))
- Fixed Problems switching from kube-dns to CoreDNS ([Issue](https://bugs.launchpad.net/charm-kubernetes-master/+bug/1822001))
- Fixed defaultbackend-s390x image 
- Fixed `keystone-ssl-ca` config description 
- Partial fix for using custom CA with Keystone


# 1.14

### March 27, 2019 - canonical-kubernetes-466

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

- Registry enhancements: Read-only mode, frontend support, and additional TLS configuration options have been added to the [Docker registry charm](https://charmhub.io/containers-docker-registry).

- Cloud integrations: New configuration options have been added to the
[vSphere](https://charmhub.io/containers-vsphere-integrator/) (`folder` and `respool_path`) and
[OpenStack]( https://charmhub.io/containers-openstack-integrator/) (`ignore-volume-az`, `bs-version`, `trust-device-path`) integrator charms.


## Fixes

 - Added an action to upgrade Docker 
 - Added better multi-client support to EasyRSA 
 - Added block storage options for OpenStack 
 - Added dashboard-auth config option to master 
 - Added docker registry handling to master
 - Added more TLS options to Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/20))
 - Added new folder/respool_path config for vSphere 
 - Added proxy support to Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/21))
 - Added read-only mode for Docker registry ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/22))
 - Fixed `allow-privileged` not enabled when Ceph relation joins 
 - Fixed apt install source for VaultLocker 
 - Fixed Ceph relation join not creating necessary pools 
 - Fixed Ceph volume provisioning fails with "No such file or directory" 
 - Fixed detecting of changed AppKV values 
 - Fixed docker-ce-version config not working for non-NVIDIA configuration 
 - Fixed Docker registry behavior with multiple frontends ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/26))
 - Fixed Docker registry not cleaning up old relation data ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/28))
 - Fixed Docker registry to correctly handle frontend removal ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/29))
 - Fixed Docker registry to work behind a TLS-terminating frontend ([Issue](https://github.com/CanonicalLtd/docker-registry-charm/pull/25))
 - Fixed error: snap "etcd" is not compatible with --classic
 - Fixed file descriptor limit on api server 
 - Fixed GCP NetworkUnavailable hack when only some pods pending 
 - Fixed handle_requests being called when no clients are related 
 - Fixed handling of nameless and SANless server certificates 
 - Fixed inconsistent cert flags 
 - Fixed ingress=false not allowing custom ingress to be used
 - Fixed installing from outdated docker APT respository
 - Fixed IPv6 disabled on kubeapi-loadbalancer machines leads to error during installation 
 - Fixed Keystone not working with multiple masters
 - Fixed kubeconfig should contain the VIP when keepalived used with kubeapi-load-balancer 
 - Fixed metrics server for k8s 1.11 
 - Fixed proxy var to apply when adding an apt-key 
 - Fixed RBAC enabled results in error: unable to upgrade connection 
 - Fixed registry action creating configmap in the wrong namespace 
 - Fixed rules for metrics-server
 - Fixed status when writing kubeconfig file 
 - Fixed "subnet not found" to be non-fatal
 - Fixed vSphere integrator charm not updating cloud-config when setting new charm defaults 
 - Removed deprecated allow-privileged config from worker
 - Removed use of global / shared client certificate 
 - Updated default nginx-ingress controller to 0.22.0 for amd64 and arm64

# 1.13 Bugfix Release

### February 21, 2019 - canonical-kubernetes-435

## Fixes

- Fixed docker does not start when docker_runtime is set to nvidia 
- Fixed snapd_refresh charm option conflict 

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

Added support for using [Vault](https://charmhub.io/vault/)
for PKI in place of EasyRSA. Vault is more secure and robust than EasyRSA and supports
more advanced features for certificate management. See the
[documentation][docs-vault] for details of how to add Vault to Charmed Kubernetes and configure it as a
root or intermediary CA.

- Encryption-at-rest support using Vault

Added support for encryption-at-rest for cluster secrets, leveraging
[Vault](https://charmhub.io/vault/) for data protection. This
ensures that even the keys used to encrypt the data are protected at rest, unlike many
configurations of encryption-at-rest for Kubernetes. Please see the
[documentation][docs-ear] for further details.

- Private Docker registry support

Added support for the [Docker Registry](https://charmhub.io/containers-docker-registry)
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

 - Added post deployment script for jaas/jujushell 
 - Added support for load-balancer failover 
 - Added always restart for etcd 
 - Added Xenial support to Azure integrator 
 - Added Bionic support to OpenStack integrator 
 - Added support for ELB service-linked role 
 - Added ability to configure Docker install source 
 - Fixed EasyRSA does not run as an LXD container on 18.04 
 - Fixed ceph volumes cannot be attached to the pods after 1.12 
 - Fixed ceph volumes fail to attach with "node has no NodeID annotation" 
 - Fixed ceph-xfs volumes failing to format due to "executable file not found in $PATH" 
 - Fixed ceph volumes not detaching properly 
 - Fixed ceph-csi addons not getting cleaned up properly 
 - Fixed Calico/Canal not working with kube-proxy on master 
 - Fixed issue with Canal charm not populating the kubeconfig option in 10-canal.conflist 
 - Fixed cannot access logs after enabling RBAC 
 - Fixed RBAC breaking prometheus/grafana metric collection
 - Fixed upstream Docker charm config option using wrong package source 
 - Fixed a timing issue where ceph can appear broken when it's not 
 - Fixed status when cni is not ready 
 - Fixed an issue with calico-node service failures not surfacing 
 - Fixed empty configuration due to timing issue with cni. 
 - Fixed an issue where the calico-node service failed to start 
 - Fixed updating policy definitions during upgrade-charm on AWS integrator
 - Fixed parsing credentials config value 
 - Fixed pvc stuck in pending (azure-integrator)
 - Fixed updating properties of the openstack integrator charm do not propagate automatically (openstack-integrator)
 - Fixed flannel error during install hook due to incorrect resource (flannel)
 - Updated master and worker to handle upstream changes from OpenStack Integrator 
 - Updated to CNI 0.7.4 
 - Updated to Flannel v0.10.0 
 - Updated Calico and Canal charms to Calico v2.6.12 
 - Updated to latest CUDA and removed version pins of nvidia-docker stack 
 - Updated to nginx-ingress-controller v0.21.0 
 - Removed portmap from Calico resource 
 - Removed CNI bins from flannel resource 

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

While we recommend `kubelet-extra-config` as a more robust and approachable way to configure Kubelet, we've also made it possible to configure kubelet using the Dynamic Kubelet Configuration feature that comes with Kubernetes 1.11+. 

- New etcd charm config: bind_to_all_interfaces ([PR](https://github.com/juju-solutions/layer-etcd/pull/137))

Default `true`, which retains the old behavior of binding to 0.0.0.0. Setting this to `false` makes etcd bind only to the addresses it expects traffic on, as determined by the configuration of [Juju endpoint bindings](https://docs.jujucharms.com/2.4/en/charms-deploying-advanced#deploying-to-network-spaces).

Special thanks to [@rmescandon](https://github.com/rmescandon) for this contribution!

- Updated proxy configuration

For operators who currently use the `http-proxy`, `https-proxy` and `no-proxy` Juju model configs, we recommend using the newer `juju-http-proxy`, `juju-https-proxy` and `juju-no-proxy` model configs instead. See the [Proxy configuration](https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Proxy-configuration) page for details.

## Fixes

- Fixed kube-dns constantly restarting on 18.04
- Fixed LXD machines not working on 18.04 
- Fixed kubernetes-worker unable to restart services after kubernetes-master leader is removed 
- Fixed kubeapi-load-balancer default timeout might be too low 
- Fixed unable to deploy on NVidia hardware 
<!--LINKS-->

[docs-ldap]: /kubernetes/docs/ldap
[docs-vault]: /kubernetes/docs/using-vault
[docs-ear]: /kubernetes/docs/encryption-at-rest
[docs-keepalived]: /kubernetes/docs/keepalived
[docs-registry]: /kubernetes/docs/docker-registry

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/release-notes-historic.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

