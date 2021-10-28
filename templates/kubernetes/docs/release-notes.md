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

# 1.22+ck1 Bugfix release

### October 21, 2021 - [charmed-kubernetes-807](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-807/archive/bundle.yaml)

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

### September 1, 2021 - [charmed-kubernetes-761](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-761/archive/bundle.yaml)

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

### August 02, 2021 - [charmed-kubernetes-733](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-733/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck3).


# 1.21+ck2 Bugfix release

### May 28, 2021 - [charmed-kubernetes-679](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-679/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck2).


# 1.21+ck1 Bugfix release

### May 04, 2021 - [charmed-kubernetes-655](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-655/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck1).


# 1.21

### April 15, 2021 - [charmed-kubernetes-632](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-632/archive/bundle.yaml)

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

### February 23rd, 2021 - [charmed-kubernetes-596](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-596/archive/bundle.yaml)

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

### December 16th, 2020 - [charmed-kubernetes-559](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-559/archive/bundle.yaml)

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

### November 27th, 2020 - [charmed-kubernetes-545](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-545/archive/bundle.yaml)

## Fixes
A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck2).

# 1.19+ck1 Bugfix release

### November 20th, 2020 - [charmed-kubernetes-541](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-541/archive/bundle.yaml)

## Fixes
A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.19+ck1).

# 1.19

### September 30th, 2020 - [charmed-kubernetes-519](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-519/archive/bundle.yaml)

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
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
[cis-benchmark]: /kubernetes/docs/cis-compliance
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
[historic]: /kubernetes/docs/release-notes-historic
[ipv6]: /kubernetes/docs/ipv6
[cni-sriov]: /kubernetes/docs/cni-sriov
[authn]: /kubernetes/docs/auth#authn
[veth-mtu]: https://docs.projectcalico.org/networking/mtu
[1.19-calico]: /kubernetes/docs/1.19/charm-calico



## Previous releases

Please see [this page][historic] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
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
[cephcsi-upgrade]: https://github.com/ceph/ceph-csi/blob/devel/docs/ceph-csi-upgrade.md

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/release-notes.md" class="p-notification__action">edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
