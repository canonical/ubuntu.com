---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "MetalLB"
  description: How to configure your Kubernetes cluster to use MetalLB.
keywords: high availability, metallb, vip, load balancer
tags: [operating]
sidebar: k8smain-sidebar
permalink: metallb.html
layout: [base, ubuntu-com]
toc: False
---
# About

[MetalLB][metallb] is a Kubernetes-aware solution that will monitor for services with
the type `LoadBalancer` and assign them an IP address from a virtual pool.

It uses BGP([Border Gateway Protocol][bgp]) or Layer 2 (with ARP [Address Resolution Protocol][arp])
to expose services.

MetalLB has support for local traffic, meaning that the machine that receives the
data will be the machine that services the request. It is not suggested to use a
virtual IP with high traffic workloads because only one machine will receive the
traffic for a service - the other machines are solely used for failover.

BGP does not have this limitation but does see nodes as the atomic unit. This means
if the service is running on two of five nodes then only those two nodes will receive
traffic, but they will each receive 50% of the traffic even if one of the nodes has
three pods and the other only has one pod running on it. It is recommended to use node
anti-affinity to prevent Kubernetes pods from stacking on a single node.

<div class="p-notification--positive">
<p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
For more information on configuring MetalLB with Calico in BGP mode,
please see this
<a href="https://metallb.universe.tf/configuration/calico/">
explanation of the required configuration</a> from the
<a href="https://metallb.universe.tf/"> MetalLB website</a>

</p></div>

The best way to install MetalLB in layer 2 mode on Charmed Kubernetes is with 
the MetalLB Operator. The MetalLB Operator is a charm bundle that allows the 
deployment of both the controller and speaker components.

To deploy the operator, you will first need a Kubernetes model in Juju.
Add your Kubernetes as a cloud to your Juju controller:

```
juju add-k8s k8s-cloud --controller $(juju switch | cut -d: -f1)
```

And create a new Kubernetes model:

```
juju add-model metallb-system k8s-cloud
```

Then deploy the MetalLB operator:

```bash
juju deploy cs:~containers/metallb-operator
```

The IP range allocated to MetalLB can be controlled via the configuration of the metallb-controller:

```bash
juju config metallb-controller iprange="192.168.1.240-192.168.1.250"
```

Multiple IP pools can be specified as well, if using a CIDR notation delimited by a comma:
```bash
juju config metallb-controller iprange="192.168.1.240/28, 10.0.0.0/28"
```

Currently, to deploy MetalLB in BGP mode, the recommended way is to use the upstream
manifests:

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```
The BGP configuration can then be performed by using a [MetalLB configmap][configmap].


<!-- LINKS -->

[metallb]: https://metallb.universe.tf
[arp]: https://tools.ietf.org/html/rfc826
[bgp]: https://tools.ietf.org/html/rfc1105
[helm]: /kubernetes/docs/helm
[configmap]: https://metallb.universe.tf/configuration/#bgp-configuration

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/metallb.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
