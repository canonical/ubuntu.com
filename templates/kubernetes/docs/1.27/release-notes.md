
---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "1.27 Release notes"
  description: Release notes for Charmed Kubernetes
keywords: kubernetes, release, notes
tags: [news]
sidebar: k8smain-sidebar
permalink: 1.27/release-notes.html
layout: [base, ubuntu-com]
toc: False
---

# 1.27

### April 21, 2023 - `charmed-kubernetes --channel 1.27/stable`

The release bundle can also be [downloaded here](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.27/bundle.yaml).

## What's new

### Cilium CNI

We are excited to announce the inclusion of Cilium in our portfolio of
Container Network Interface solutions for Charmed Kubernetes. Cilium is a
powerful CNI, network security and observability solution which provides
enhanced performance and improved security for containerised applications.
The current version of Cilium shipped within the charm is 1.12.5. It also
comes bundled with Hubble: a networking and security observability solution
that offers real time insights of the network and the security state of the
cluster with little performance impact.

### Cloud Providers and Cloud Storage

Operator charms for external cloud providers have been expanded and now
include AWS, Azure, GCP, and vSphere. Previously, cloud-specific features
such as load balancing and storage were managed by Kubernetes in-tree solutions.
Today, cloud provider charms offer flexible management of these features
decoupled from any specific Kubernetes release.

### NVIDIA Network Operator

The NVIDIA network operator charm is a new addition to the Charmed Kubernetes
ecosystem. It simplifies the deployment, operation, and management of NVIDIA
networking resources for Kubernetes.

### Support for Juju 3.1

With this release, Charmed Kubernetes can be deployed with a
juju 2.9, 3.0 or 3.1 controller. This release is intended to serve
as a migration point away from juju 2.9 deployments which is why we
offer a tested strategy of our charms on both 2.9 and 3.1 releases.

## Technical Previews

### KubeVirt

Offered as a technical preview, the KubeVirt charm offers an opinionated
deployment of KubeVirt on Charmed Kubernetes such that virtual machines can be
launched within your Kubernetes cluster.  Charmed Kubernetes on metal will
deploy KubeVirt in such a way to use faster, native hardware virtualization,
but KubeVirt also supports software emulation for cases where accelerated
hardware support is not available.

### Volcano Scheduler

Offered as a technical preview, the suite of Volcano charms deploys on either
MicroK8s or Charmed Kubernetes, and can be used to more effectively schedule
ML/AI workloads which need to ensure effective queuing of jobs requiring GPU
resources. The charm ships with v1.7.0 of Volcano and will follow future
upstream releases.

### Cluster API Providers

Cluster API providers for deploying Charmed Kubernetes are available as
technical previews. These providers consist of the Juju Infrastructure
Provider, the CharmedK8s Control Plane Provider, and the CharmedK8s Bootstrap
Provider.

The infrastructure provider is responsible for Juju model management and
machine deployment. The control plane provider handles control plane management,
kubeconfig management, and control plane status reporting. The bootstrap
provider controls what charms are deployed to the machines provisioned by the
infrastructure provider.

While the user experience surrounding certain Juju-related interactions is still
being improved, Charmed Kubernetes can be deployed using the familiar Cluster
API workflow using the providers in their current state.

## Component Versions

### Charm/Addons pinned versions

- kube-ovn 1.10.4
- calico 3.21.4
- cephcsi 3.7.2
- cinder-csi-plugin 1.26.2
- coredns 1.9.4 / 1.10.0
- ingress-nginx 1.6.4
- k8s-keystone-auth 1.26.2
- kube-state-metrics 2.8.2
- kubernetes-dashboard 2.7.0
- openstack-cloud-controller-manager 1.26.2

### Charm default versions

- cloud-provider-vsphere 1.26
- vsphere-csi-driver 3.0.0
- cloud-provider-azure 1.25.0
- azuredisk-csi-driver 1.23.0
- cloud-provider-aws 1.26.1
- aws-ebs-csi-driver 1.12.0
- gcp-compute-persistent-disk-csi-driver 1.8.0


## Fixes

A list of bug fixes and other minor feature updates in this release can be found at
[the launchpad milestone page for 1.27](https://launchpad.net/charmed-kubernetes/+milestone/1.27).

## Notes and Known Issues

- Cilium on AWS and OpenStack [LP#2016905](https://bugs.launchpad.net/charm-cilium/+bug/2016905)

  Deploying Cilium on AWS or Openstack can cause inter-node communication
  failures due to the Fan networking that Juju enables by default in those
  environments. To work around this issue, set model configuration prior
  to deployment:

  `juju model-config cluster-networking-mode=local`

- Known issues scheduled to be resolved in the first 1.27 maintenance
  release can be found at [the launchpad milestone page for 1.27+ck1](https://launchpad.net/charmed-kubernetes/+milestone/1.27+ck1).

## Deprecations and API changes

- Upstream

For details of other deprecation notices and API changes for
Kubernetes 1.27, please see the relevant sections of the
[upstream release notes][upstream-changelog-1.27].

[upstream-changelog-1.27]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md#deprecation

<!-- AUTOGENERATED RELEASE 1.27 ABOVE -->

<!--LINKS-->
