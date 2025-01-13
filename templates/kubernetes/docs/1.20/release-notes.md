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
permalink: 1.20/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.20+ck1 Bugfix release

### February 23rd, 2021 - charmed-kubernetes-596

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.20+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.20+ck1).

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

## Previous releases

Please see [this page][rel] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[cis-benchmark]: /kubernetes/docs/cis-compliance
[rel]: /kubernetes/docs/release-notes
[ipv6]: /kubernetes/docs/ipv6
[cni-sriov]: /kubernetes/docs/cni-sriov
[authn]: /kubernetes/docs/auth#authn
[veth-mtu]: https://docs.projectcalico.org/networking/mtu
[1.19-calico]: /kubernetes/docs/1.19/charm-calico
[coredns]: /kubernetes/docs/cdk-addons#coredns
[dashboard]: /kubernetes/docs/cdk-addons#kubernetes-dashboard
