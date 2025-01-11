---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Overview"
  description: Understand how Charmed Kubernetes works.
keywords: juju, kubernetes, cdk
tags: [intro]
sidebar: k8smain-sidebar
permalink: overview.html
layout: [base, ubuntu-com]
toc: False
---

Deliver 'Containers as a Service' across the enterprise with
**Charmed Kubernetes<sup>&reg;</sup>** , enabling each
project to spin up a standardised K8s of arbitrary scale, on demand, with centralised
operational control. **Charmed Kubernetes** provides a well integrated, turn-key
**Kubernetes<sup>&reg;</sup>** platform that is open, extensible, and secure.

For more information on the features and benefits of **Charmed Kubernetes**, including details on the
[Managed Kubernetes][managedk8s] service, please see the [Kubernetes section][cdk].

## Components

**Charmed Kubernetes** is built around a number of applications, bundled together and deployed using
[**Juju**][juju], the open source modelling tool for deploying and operating software in
the cloud.

### Storage

**Charmed Kubernetes** comes with a powerful volume plugin system that enables many different types
of storage systems to:

- Automatically create storage when required.
- Make storage available to containers wherever they're scheduled.
- Automatically delete the storage when no longer needed.

### Networking

**Kubernetes** uses Container Network Interface (CNI) as an interface between
network providers and **Kubernetes** networking. **Charmed Kubernetes** comes pre-packaged with
several tested CNI plugins like Calico and Flannel.

### Logging and monitoring

Operations in large-scale distributed clusters require a new level of operational
monitoring and observability. Canonical delivers a standardised set of open source log
aggregation and systems monitoring dashboards with every cloud, using
**Prometheus**, the **Elasticsearch** and **Kibana** stack (ELK), and **Nagios**.

### Cloud integration

Depending on your choice of cloud, **Charmed Kubernetes** will also install an integration application.
This enables **Charmed Kubernetes** to seamlessly access cloud resources and components without
additional configuration or hassle.

<!-- LINKS -->

[managedk8s]: /kubernetes/managed
[maas]: https://maas.io
[cdk]: /kubernetes
[juju]: https://juju.is/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/overview.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

