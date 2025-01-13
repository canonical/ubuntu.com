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
permalink: 1.21/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.21+ck3 Bugfix release

### August 02, 2021 - charmed-kubernetes-733

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck3).


# 1.21+ck2 Bugfix release

### May 28, 2021 - charmed-kubernetes-679

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck2).


# 1.21+ck1 Bugfix release

### May 04, 2021 - charmed-kubernetes-655

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page](https://launchpad.net/charmed-kubernetes/+milestone/1.21+ck1).

# 1.21

### April 15, 2021 - charmed-kubernetes-632

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
