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
permalink: 1.16/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.16+ck2 Bugfix release

### November 22, 2019 - [charmed-kubernetes-316](https://api.jujucharms.com/charmstore/v5/bundle/charmed-kubernetes-316/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck2](https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck2).

# 1.16+ck1 Bugfix release

### October 4, 2019 - [charmed-kubernetes-270](https://api.jujucharms.com/charmstore/v5/bundle/charmed-kubernetes-270/archive/bundle.yaml)

## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.16+ck1).

# 1.16

### September 27, 2019 -  [charmed-kubernetes-252](https://api.jujucharms.com/charmstore/v5/charmed-kubernetes-252/archive/bundle.yaml)

Before upgrading, please read the [upgrade notes](/kubernetes/docs/upgrade-notes).

## What's new

### Kata Containers support

Beginning with Charmed Kubernetes 1.16, the [Kata Containers](https://katacontainers.io) runtime can be used
with containerd to safely run insecure or untrusted pods. When enabled, Kata provides hypervisor isolation
for pods that request it, while trusted pods can continue to run on a shared kernel via runc.
For details on using Kata Containers with Charmed Kubernetes, consult the [documentation](/kubernetes/docs/kata).

### AWS IAM support

Amazon AWS IAM authentication and authorisation is now supported via a subordinate charm. See
[AWS-IAM documentation](/kubernetes/docs/aws-iam-auth) for details on how to use AWS credentials
to log in to your Charmed Kubernetes cluster.

### SSL passthrough support

A new configuration parameter was added to the kubernetes-worker charm to enable ssl passthrough.
This allows TLS termination to happen on the workload. Refer to the
[upstream documentation](https://kubernetes.github.io/ingress-nginx/user-guide/tls/#ssl-passthrough)
for more information.

### Improved LXD support

LXD containers used for hosting Kubernetes components require some specific profile settings. These
profiles are now embedded in the charms themselves and applied when deployed, dramatically
simplifying the process of installing Charmed Kubernetes on a single machine. See the
[Local install documentation](/kubernetes/docs/install-local) for the updated instructions.

### Improved Prometheus/Grafana integration

The setup and configuration of Prometheus and Grafana has been significantly streamlined with
new relations to allow the charms to manage the scraper job and dashboards. This means that
monitoring can now be added by specifying a single overlay when deploying Charmed Kubernetes.
Refer to the [updated documentation](/kubernetes/docs/monitoring) for more information.

### Improved OpenStack integration

The OpenStack Integrator charm can now replace the Kube API Load Balancer by providing a
native OpenStack load balancer (Octavia or Neutron) to provide HA load balancing for the
Kubernetes control plane. Refer to the [updated documentation](/kubernetes/docs/openstack-integration)
for more information.

### Docker Registry with Containerd

The Docker registry charm can now be related directly to the Containerd runtime charm.
Refer to the [documentation](/kubernetes/docs/docker-registry) for instructions on how to deploy the charm.

### Renamed default container registry

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

The Kubernetes Dashboard shipped with Charmed Kubernetes 1.16 is version
2.0.0-beta4. While unusual to ship a beta component with a stable release, in
this case it was necessary, since the latest stable dashboard (v1.10.1) does
not work with Kubernetes 1.16.


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
