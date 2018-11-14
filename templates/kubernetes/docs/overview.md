---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Overview"
  description: Understand how the Canonical Distribution of Kubernetes workloads.
---

Deliver ‘Containers as a Service’ across the enterprise with the **Canonical Distribution of Kubernetes<sup>&reg;</sup> (CDK)** , enabling each project to spin up a standardised K8s of arbitrary scale, on demand, with centralised operational control. **CDK** provides a well integrated, turn-key **Kubernetes<sup>&reg;</sup>** platform that is open, extensible, and secure.

For more information on the features and benefits of **CDK**, including details on the [Managed Kubernetes][managedk8s] service, please see the [Kubernetes section][k8s-u-c].

## Components

**CDK** is built around a number of applications, bundled together and deployed using [**Juju**][juju], the open source modelling tool for deploying and operating software in the cloud.

### Storage

**CDK** comes with a powerful volume plugin system that enables many different types of storage systems to:

- Automatically create storage when required.
- Make storage available to containers wherever they’re scheduled.
- Automatically delete the storage when no longer needed.

### Networking

**Kubernetes** uses Container Network Interface (CNI) as an interface between network providers and **Kubernetes** networking. **CDK** comes pre-packaged with several tested CNI plugins like Calico and Flannel.

### Logging and monitoring

Operations in large-scale distributed clusters require a new level of operational monitoring and observability. Canonical delivers a standardised set of open source log aggregation and systems monitoring dashboards with every cloud, using **Prometheus**, the **Elasticsearch** and **Kibana** stack (ELK), and **Nagios**.

### Cloud integration

Depending on your choice of cloud, **CDK** will also install an integration application. This enables **CDK** to seamlessly access cloud resources and components without additional configuration or hassle.

<!-- LINKS -->

[managedk8s]: /kubernetes/managed
[k8s-u-c]: /kubernetes
[maas]: https://maas.io
[cdk]: /kubernetes
[managed-cdk]: /kubernetes/managed
[juju]: https://jujucharms.com
