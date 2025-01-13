---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Custom load balancers"
  description: How to configure your Kubernetes cluster to use a custom load balancer.
keywords: high availability, vip, load balancer, f5
tags: [operating]
sidebar: k8smain-sidebar
permalink: custom-loadbalancer.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** supports setting a
custom IP address for the control plane.  There are two ways of achieving this, depending
on which type of load balancing solution you wish to configure:

 -  If you have a virtual IP to place in front of machines, configure the settings on the
    `kubeapi-load-balancer` charm.

 -  If a full load balancing solution is in place such as an F5 appliance, remove the
     `kubeapi-load-balancer` and use the settings on the `kubernetes-control-plane` charm to
      configure the load balancer. This is also the appropriate step if you want to use
      a load balancer integrated with a particular cloud (e.g **OctaviaLB** for
      OpenStack). See the relevant entry in the "Cloud Integration" section of the
      documentation for more on native load balancers.

Both solutions are described in the sections below.

# Virtual IP in front of kubeapi-load-balancer

If you have a virtual IP in front of the kubeapi-load-balancer
units which isn't charm based, you should use the loadbalancer-ips configuration to
specify them:

```bash
juju config kubeapi-load-balancer loadbalancer-ips="10.0.0.1 10.0.0.2"
```

Multiple IP addresses should be given as a space-separated list.


# Custom load balancer in front of kubernetes-control-plane charm

If you have a full load balancer such as an F5 appliance or OpenStack's Neutron,
use the configuration options on the `kubernetes-control-plane` charm and forgo
`kubeapi-load-balancer`  entirely.

Remove the `kubeapi-load-balancer` application if it exists:

```bash
juju remove-application kubeapi-load-balancer
```

Then configure the IP addresses provided by the load balancing solution with the
`kubernetes-control-plane` charm.

```bash
juju config kubernetes-control-plane loadbalancer-ips="192.168.1.1 192.168.2.1"
```

Multiple IP addresses should be given as a space-separated list.

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/custom-loadbalancer.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

