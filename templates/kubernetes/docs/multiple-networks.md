---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Using Multiple Host Networks"
  description: Using multiple host networks with Charmed Kubernetes.
keywords: juju, network, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: multiple-networks.html
layout: [base, ubuntu-com]
toc: False
---

This page is about using multiple host networks with Charmed Kubernetes. For
information on using multiple container networks, please refer to the
[Multus](/kubernetes/docs/cni-multus) page instead.

Using network spaces and bindings in Juju, it's possible to deploy Charmed
Kubernetes in an environment with multiple networks and assign traffic to
different networks explicitly.

Currently, multiple networks are only supported in Juju on MAAS.

The rest of this document assumes you're familiar with the basics of MAAS and
Juju. If you're not, you can familiarise yourself with them by reading the
[MAAS documentation](https://maas.io/docs) and
[Juju documentation](https://jaas.ai/docs).

## Configure MAAS

Preconditions:

-   You have MAAS nodes that are attached to multiple logical networks (separate
physical networks or VLANs).
-   You have commissioned the nodes in MAAS.

### Create spaces in MAAS

In the 'Subnets' tab of the MAAS GUI, click `Add -> Space` to create spaces as
needed. To add subnets to a space, enter the subnet's VLAN configuration page
(click in the 'VLAN' column on the main Subnets page) and assign it to the space.

### Enable network interfaces on nodes

By default, only the first network interface is enabled on each node. You need
to manually enable the rest.

Go to the 'Nodes' tab, click on a node, and click the 'Interfaces' tab. Set
each interface's IP mode to `Auto assign`.

## Configure Juju

If you've already bootstrapped a Juju controller, use `juju reload-spaces` to
pick up the changes from MAAS. Otherwise, bootstrap a new Juju controller and
the new controller should pick up the spaces automatically.

Run `juju spaces` and make sure you see the network spaces and subnet
assignments that you're expecting to see.

## Use bindings to direct network traffic

Using bindings, you can direct specific kinds of network traffic in your Charmed
Kubernetes cluster to go through specific networks.

The easiest way to do this is by using an overlay file when you deploy Charmed
Kubernetes. The following is an example overlay that defaults all bindings to
send traffic through a network space named `control`, with the exception of the
flannel cni binding, which will send its traffic through a network space named
`workload` instead:

```yaml
applications:
  easyrsa:
    bindings:
      "": control
  etcd:
    bindings:
      "": control
  kubeapi-load-balancer:
    bindings:
      "": control
  kubernetes-control-plane:
    bindings:
      "": control
  kubernetes-worker:
    bindings:
      "": control
  containerd:
    bindings:
      "": control
  flannel:
    bindings:
      "": control
      cni: workload
```

Once you have an overlay file created, use it to deploy Charmed Kubernetes with
your bindings:

```bash
juju deploy charmed-kubernetes --overlay my-overlay.yaml
```

The following endpoints are available for use in bindings:

| Charm | Endpoint | Description of traffic |
| ----- | -------- | ----------- |
| etcd  | cluster  | ETCD internal (peer) |
| etcd  | db       | ETCD external (client) |
| flannel | cni | Flannel traffic (pod to pod communication) |
| canal | cni | Flannel traffic (pod to pod communication) |
| calico | cni | Calico traffic (pod to pod communication) |
| kubernetes-control-plane | kube-api-endpoint | Main traffic to kube-apiserver, from kubeapi-load-balancer |
| kubernetes-control-plane | kube-control | Secondary traffic to kube-apiserver, from pods |
| kubeapi-load-balancer | website | Traffic to kubeapi-load-balancer, from kubectl, kubelet and kube-proxy |
| kubernetes-worker | kube-control | Traffic to kubelet, from kube-apiserver (health checks) |

You can read more about bindings in the Juju documentation here:
[Binding endpoints within a bundle](https://juju.is/docs/sdk/bind-endpoints-within-a-bundle)


<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/multiple-networks.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

