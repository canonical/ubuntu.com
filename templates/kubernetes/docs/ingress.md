---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md" # Fix syntax highlighting: _.
context:
  title: "Ingress"
  description: Using Ingress with Charmed Kubernetes.
keywords: juju, network, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: ingress.html
layout: [base, ubuntu-com]
toc: False
---

Applications in Kubernetes can be exposed outside of the cluster in several ways, such
as via `NodePort` or `LoadBalancer` type services, or via ingress controllers or
gateways.

`NodePort` services expose the service directly via a port on each of the nodes, which
can then be manually managed by firewall rules or external load balancers.

`LoadBalancer` services require something that can provide indvidual load balancers for
each service, which could be native load balancers provided by the underlying cloud
(see the relevant Cloud Integration section of the docs) or something like [MetalLB][].

Ingress controllers provide a single point of entry instead of needing to deal with
multiple individual service addresses, and then use rules or path matching to direct
traffic appropriately. The ingress endpoint itself still needs to be exposed via one
of the above methods but can provide feature-rich management of traffic routing into
the cluster.


## NGINX Ingress

By default, **Charmed Kubernetes** sets up the [NGINX Ingress Controller][ingress-nginx],
which can be customized via the config options on the [worker charm][].
[`Ingress` resources][ingress-resources] can then be used to configure routes for specific
applications.

## Istio Ingress

By deploying the [Istio bundle][] into your cluster, you can use the
[Istio traffic management features][istio-traffic]. You can then relate Kubernetes
charms which support the `ingress` relation to automatically manage [`VirtualServices`][virt-svc],
manually manage [`VirtualServices`][virt-svc] for your applications, or even use
[`Ingress` resources][istio-ingress].

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The Istio bundle requires a load balancer provider. If you're not using a cloud integrator which provides this, <a href="/kubernetes/docs/metallb">MetalLB</a> can be used.</p>
  </div>
</div>


## Multiple Ingress Controllers

Multiple ingress controllers or gateways can be used at the same time, typically with
different configuration or exposure. The `networking.k8s.io/v1` defines an
[`IngressClass` resource][ingress-class] to select between controllers, but some
controllers may rely on annotations, such as Istio's
[`kubernetes.io/ingress.class` annotation][istio-annotation].

<!-- LINKS -->

[ingress-nginx]: https://kubernetes.github.io/ingress-nginx/
[MetalLB]: metallb
[worker charm]: charm-kubernetes-worker
[ingress-resources]: https://kubernetes.io/docs/concepts/services-networking/ingress/
[Istio bundle]: https://jaas.ai/istio
[istio-traffic]: https://istio.io/latest/docs/concepts/traffic-management/
[virt-svc]: https://istio.io/latest/docs/concepts/traffic-management/#virtual-services
[istio-ingress]: https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
[ingress-class]: https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class
[istio-annotation]: https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/#configuring-ingress-using-an-ingress-resource

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/ingress.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>


