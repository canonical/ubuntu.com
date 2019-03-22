---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
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

It uses BGP([Border Gateway Protocol][bgp]) or ARP([Address Resolution Protocol][arp])
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

MetalLB is not currently available as a Juju CaaS charm, so the best way to install
it is with a helm chart:

```bash
helm install --name metallb stable/metallb
```
Further configuration can be performed by using a [MetalLB configmap][configmap].

See also the [Helm with CDK documentation][helm] for using Helm with CDK

<!-- LINKS -->

[metallb]: https://metallb.universe.tf
[arp]: https://tools.ietf.org/html/rfc826
[bgp]: https://tools.ietf.org/html/rfc1105
[helm]: /kubernetes/docs/helm
[configmap]: https://metallb.universe.tf/configuration/
