---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "How-to topics"
  description: an index of topics in this category
keywords: Cloud, cluster, storage
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-index.html
layout: [base, ubuntu-com]
toc: False
---

If you have a specific goal, but are already familiar with Kubernetes, our How-to guides are more specific and contain less background information. They’ll help you achieve an end result but may require you to understand and adapt the steps to fit your specific requirements.

There are a large number of guides, so we list them here by the same categories used in the navigation.


## Installation

- [Install on a cloud](/kubernetes/charmed-k8s/docs/install-manual)
- [Install locally with LXD](/kubernetes/charmed-k8s/docs/install-local)
- [Install on Equinix](/kubernetes/charmed-k8s/docs/equinix)


There are also two 'special case' scenarios we provide guidance for:

- [Installing offline, or in a restricted environment](/kubernetes/charmed-k8s/docs/install-offline)
- [Installing for NVIDIA DGX](/kubernetes/charmed-k8s/docs/nvidia-dgx)

## Cloud integration

- [AWS](/kubernetes/charmed-k8s/docs/aws-integration)
- [Azure](/kubernetes/charmed-k8s/docs/azure-integration)
- [GCP](/kubernetes/charmed-k8s/docs/gcp-integration)
- [OpenStack](/kubernetes/charmed-k8s/docs/openstack-integration)
- [vSphere](/kubernetes/charmed-k8s/docs/vsphere-integration)
- [LXD (Local install)](/kubernetes/charmed-k8s/docs/install-local)
- [Equinix Metal](/kubernetes/charmed-k8s/docs/equinix)

## CNI and networking

Charmed Kubernetes supports a wide variety of network options for your cluster, provided by additional charms.

- [Flannel](/kubernetes/charmed-k8s/docs/cni-flannel)
- [Calico](/kubernetes/charmed-k8s/docs/cni-calico)
- [Canal](/kubernetes/charmed-k8s/docs/cni-canal)
- [Cilium](/kubernetes/charmed-k8s/docs/cni-cilium)
- [Kube OVN](/kubernetes/charmed-k8s/docs/cni-kube-ovn)
- [Tigera Secure EE](/kubernetes/charmed-k8s/docs/tigera-secure-ee)
- [Multus](/kubernetes/charmed-k8s/docs/cni-multus)
- [SR-IOV](/kubernetes/charmed-k8s/docs/cni-sriov)
- [Using multiple networks](/kubernetes/charmed-k8s/docs/multiple-networks)
- [IPv6](/kubernetes/charmed-k8s/docs/ipv6)
- [Ingress](/kubernetes/charmed-k8s/docs/ingress)

## Container runtimes
In addition to the standard runtime, Charmed Kubernetes supports a variety of container runtime options.
- [Containerd](/kubernetes/charmed-k8s/docs/container-runtime)
- [Kata](/kubernetes/charmed-k8s/docs/kata)
- [VM workloads (KubeVirt)](/kubernetes/charmed-k8s/docs/kubevirt)
- [GPU workers](/kubernetes/charmed-k8s/docs/gpu-workers)


## Operating Kubernetes

These guides demonstrate the common tasks any user is likely to need:

- [Basic operations](/kubernetes/charmed-k8s/docs/operations)
- [Configure ingress](/kubernetes/charmed-k8s/docs/ingress)
- [Add storage](/kubernetes/charmed-k8s/docs/storage)
- [Scale your cluster](/kubernetes/charmed-k8s/docs/scaling)
- [Make an etcd backup](/kubernetes/charmed-k8s/docs/backups)
- [Upgrade to a new version](/kubernetes/charmed-k8s/docs/upgrading)
- [Decommission a cluster](/kubernetes/charmed-k8s/docs/decommissioning)
- [Logging](/kubernetes/charmed-k8s/docs/logging)
- [Perform audit Logging](/kubernetes/charmed-k8s/docs/audit-logging)

There are additional services supported by the Charmed Kubernetes team, which
can be added to your cluster, or further configuration made to the default
setup which are covered in these guides:

- [Configure and use CDK addons](/kubernetes/charmed-k8s/docs/cdk-addons)
- [Monitor with Grafana/Prometheus](/kubernetes/charmed-k8s/docs/monitoring)
- [Use K8s Operator Charms](/kubernetes/charmed-k8s/docs/operator-charms)
- [Schedule containers with Volcano](/kubernetes/charmed-k8s/docs/volcano)
- [Use the cluster autoscaler](/kubernetes/charmed-k8s/docs/autoscaler)
- [Validate your cluster with e2e](/kubernetes/charmed-k8s/docs/validation)
- [Use a private Docker Registry](/kubernetes/charmed-k8s/docs/docker-registry)
- [Configuring proxies](/kubernetes/charmed-k8s/docs/proxies)


If you run into trouble, please see the troubleshooting guide:

- [Troubleshooting](/kubernetes/charmed-k8s/docs/troubleshooting)

## High availability
Charmed Kubernetes supports enhancement for High Availability through a variety of approaches. Follow the links below for more information:

- [Using keepalived](/kubernetes/charmed-k8s/docs/keepalived)
- [Using HAcluster](/kubernetes/charmed-k8s/docs/hacluster)
- [Using MetalLB](/kubernetes/charmed-k8s/docs/metallb)
- [Adding a custom load balancer](/kubernetes/charmed-k8s/docs/custom-loadbalancer)

## Securing your cluster
The term 'security' covers a great many subtopics related to running a Kubernetes cluster, ranging from aspects of the workloads to the underlying OS. Please see the [overview of security](/kubernetes/charmed-k8s/docs/security) page for a better understanding of the approach to securing your cluster.

The guides in this section contain How tos for pursuing specific security goals:

- [Authorisation and authentication](/kubernetes/charmed-k8s/docs/auth)
- [Use Vault as a CA](/kubernetes/charmed-k8s/docs/using-vault)
- [Authenticate with LDAP](/kubernetes/charmed-k8s/docs/ldap)
- [Use the OPA Gatekeeper](/kubernetes/charmed-k8s/docs/gatekeeper)
- [Use encryption-at-rest](/kubernetes/charmed-k8s/docs/encryption-at-rest)





<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-index.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://kubernetes.slack.com/archives/CG1V2CAMB"> public Slack  channel</a>.</p>
  </div>
</div>
