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
permalink: 1.17/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

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

### CIS Benchmark

The **Center for Internet Security (CIS)** maintains a [Kubernetes benchmark][cis-benchmark]
that is helpful to ensure clusters are deployed in accordance with security best practices.
See the [CIS Compliance](/kubernetes/docs/cis-compliance) documentation for instructions on
how to run this compliance benchmark.

### Snap Coherence

Beginning with Charmed Kubernetes 1.17, updates to Kubernetes snap packages used by
`kubernetes-master` and `kubernetes-worker` charms will be applied in a controlled fashion. Known
as **Snap Coherence**, this feature ensures snap updates are first applied to individual master
units, followed by workers. If an update fails, the process is aborted before affecting the entire
cluster. This feature also allows snap revisions to be controlled by a snap store proxy. See
[snap coherence](/kubernetes/docs/snap-coherence) documentation for details.

### Nagios checks

Additional Nagios checks have been added for the `kubernetes-master` and `kubernetes-worker` charms.
These checks enhance the monitoring and reporting available via Nagios by collecting data on node
registration and API server connectivity.

### Improved metrics

`kube-state-metrics` is now added by default to the cluster when monitoring is enabled. New default
dashboards are also included to highlight these metrics with Prometheus/Grafana.

### Storage Classes created by default

Storage classes will now be created if the `kubernetes-master` charm is related to an
integrator charm. These classes are for AWS, GCE, OpenStack, and Azure and are named cdk-ebs,
cdk-gce-pd, cdk-cinder, and cdk-azure-disk, respectively.

### Support for etcd 3.3 and 3.4

Whilst Charmed Kubernetes 1.17 ships with etcd 3.3 by default, it also brings support for
running etcd 3.4. To do so, you can simply run the followiung Juju command:

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
