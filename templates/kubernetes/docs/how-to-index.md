---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
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

- [Install on a cloud](/kubernetes/docs/install-manual) 
- [Install locally with LXD](/kubernetes/docs/install-local)  
- [Install on Equinix](/kubernetes/docs/equinix)  


There are also two 'special case' scenarios we provide guidance for:

- [Installing offline, or in a restricted environment](/kubernetes/docs/install-offline)
- [Installing for NVIDIA DGX](/kubernetes/docs/nvidia-dgx)

## Cloud integration

- [AWS](/kubernetes/docs/aws-integration)
- [Azure](/kubernetes/docs/azure-integration)
- [GCP](/kubernetes/docs/gcp-integration)
- [OpenStack](/kubernetes/docs/openstack-integration)
- [vSphere](/kubernetes/docs/vsphere-integration)
- [LXD (Local install)](/kubernetes/docs/install-local)
- [Equinix Metal](/kubernetes/docs/equinix)

## CNI and networking

Charmed Kubernetes supports a wide variety of network options for your cluster, provided by additional charms. 

- [Flannel](/kubernetes/docs/cni-flannel)
- [Calico](/kubernetes/docs/cni-calico)
- [Canal](/kubernetes/docs/cni-canal)
- [Cilium](/kubernetes/docs/cni-cilium)
- [Kube OVN](/kubernetes/docs/cni-kube-ovn)
- [Tigera Secure EE](/kubernetes/docs/tigera-secure-ee)
- [Multus](/kubernetes/docs/cni-multus)
- [SR-IOV](/kubernetes/docs/cni-sriov)
- [Using multiple networks](/kubernetes/docs/multiple-networks)
- [IPv6](/kubernetes/docs/ipv6)
- [Ingress](/kubernetes/docs/ingress)

## Container runtimes
In addition to the standard runtime, Charmed Kubernetes supports a variety of container runtime options.
- [Containerd](/kubernetes/docs/container-runtime)
- [Kata](/kubernetes/docs/kata)
- [VM workloads (KubeVirt)](/kubernetes/docs/kubevirt)
- [GPU workers](/kubernetes/docs/gpu-workers)


## Operating Kubernetes

These guides demonstrate the common tasks any user is likely to need:

- [Basic operations](/kubernetes/docs/operations)
- [Configure ingress](/kubernetes/docs/ingress)
- [Add storage](/kubernetes/docs/storage)
- [Scale your cluster](/kubernetes/docs/scaling)
- [Make an etcd backup](/kubernetes/docs/backups)
- [Upgrade to a new version](/kubernetes/docs/upgrading)
- [Decommission a cluster](/kubernetes/docs/decommissioning)
- [Logging](/kubernetes/docs/logging)
- [Perform audit Logging](/kubernetes/docs/audit-logging)

There are additional services supported by the Charmed Kubernetes team, which
can be added to your cluster, or further configuration made to the default
setup which are covered in these guides:

- [Configure and use CDK addons](/kubernetes/docs/cdk-addons)
- [Monitor with Grafana/Prometheus](/kubernetes/docs/monitoring)
- [Use K8s Operator Charms](/kubernetes/docs/operator-charms)
- [Schedule containers with Volcano](/kubernetes/docs/volcano)
- [Use the cluster autoscaler](/kubernetes/docs/autoscaler)
- [Validate your cluster with e2e](/kubernetes/docs/validation)
- [Use a private Docker Registry](/kubernetes/docs/docker-registry)
- [Configuring proxies](/kubernetes/docs/proxies)


If you run into trouble, please see the troubleshooting guide:

- [Troubleshooting](/kubernetes/docs/troubleshooting)

## High availability
Charmed Kubernetes supports enhancement for High Availability through a variety of approaches. Follow the links below for more information:

- [Using keepalived](/kubernetes/docs/keepalived)
- [Using HAcluster](/kubernetes/docs/hacluster)
- [Using MetalLB](/kubernetes/docs/metallb)
- [Adding a custom load balancer](/kubernetes/docs/custom-loadbalancer)

## Securing your cluster
The term 'security' covers a great many subtopics related to running a Kubernetes cluster, ranging from aspects of the workloads to the underlying OS. Please see the [overview of security](/kubernetes/docs/security) page for a better understanding of the approach to securing your cluster.

The guides in this section contain How tos for pursuing specific security goals: 

- [Authorisation and authentication](/kubernetes/docs/auth)
- [Use Vault as a CA](/kubernetes/docs/using-vault)
- [Authenticate with LDAP](/kubernetes/docs/ldap)
- [Use the OPA Gatekeeper](/kubernetes/docs/gatekeeper)
- [Use encryption-at-rest](/kubernetes/docs/encryption-at-rest)





<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-index.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
