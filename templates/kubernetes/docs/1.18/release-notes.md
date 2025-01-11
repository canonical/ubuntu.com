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
permalink: 1.18/release-notes.html
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

### April 13th, 2020 - charmed-kubernetes-430

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

- New SSL options for default ingress controller

- Multus support

This release of Charmed Kubernetes introduces support for
[Multus](https://github.com/intel/multus-cni), a CNI provider that makes it
possible to attach multiple network interfaces to your pods.

Along the way, we've also updated existing charms to make it possible for
multiple CNI providers to be deployed together in the same cluster.

Please note that while we are making Multus support available today, it is
dependent on functionality in Juju that is not yet considered stable. For more
details on the current state of Multus support in Charmed Kubernetes and how to
get started, please refer to the
[Multus documentation page](/kubernetes/docs/cni-multus).

- CIS Benchmark 1.5.0

The `cis-benchmark` action now supports version 1.5.0 of the CIS Kubernetes Benchmark.
See the [CIS compliance](/kubernetes/docs/cis-compliance) page for information on
running this action on Charmed Kubernetes components.

- Containerd version hold

The version of [containerd](https://containerd.io/) will now be held. This means that the version of [containerd](https://containerd.io/) will not be upgraded along with the charm. To update [containerd](https://containerd.io/) to the latest stable, currently 1.3.3, you can call the `upgrade-containerd` action. For example:

```bash
juju run-action --wait containerd/0 upgrade-containerd
```

After completion, the results of the upgrade will be returned. Run this for each instance of the `containerd` charm. The upgrades can be staggered to avoid downtime.

## Component Upgrades

Many of the components in Charmed Kubernetes 1.18 have been upgraded. The following list
highlights some of the more notable version changes:

- containerd 1.3.3 (see above `upgrade-containerd` note)
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

## Previous releases

Please see [this page][historic] for release notes of earlier versions.

<!--LINKS-->

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

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/release-notes.md" >edit this page</a>
    or
     <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
     <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>

  </div>
</div>
