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

## Previous releases

Please see [this page][rel] for release notes of earlier versions.

<!--LINKS-->
[upgrade-notes]: /kubernetes/docs/upgrade-notes
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
[cis-benchmark]: /kubernetes/docs/cis-compliance
[bundle]: https://api.jujucharms.com/charmstore/v5/canonical-kubernetes-471/archive/bundle.yaml
[rel]: /kubernetes/docs/release-notes
[ipv6]: /kubernetes/docs/ipv6
[cni-sriov]: /kubernetes/docs/cni-sriov
[authn]: /kubernetes/docs/auth#authn
[veth-mtu]: https://docs.projectcalico.org/networking/mtu
[1.19-calico]: /kubernetes/docs/1.19/charm-calico
[coredns]: /kubernetes/docs/cdk-addons#coredns
[dashboard]: /kubernetes/docs/cdk-addons#kubernetes-dashboard
