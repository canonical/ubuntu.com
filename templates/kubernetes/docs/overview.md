---
wrapper_template: base_docs.html
context:
    title: Overview
markdown_includes:
    nav: shared/_side-navigation.md
---

<div class="p-content__row">
    <div class="u-equal-height">
        <div class="col-6">

<p>Deliver ‘Containers as a Service’ across the enterprise with the
<strong>Canonical Distribution of Kubernetes<sup>&reg;</sup> </strong>
(<strong>CDK</strong>) , enabling each project to
spin up a standardised K8s of arbitrary scale, on demand, with centralised
operational control. <strong>CDK</strong>  provides a
well integrated, turn-key <strong>Kubernetes<sup>&reg;</sup></strong>
platform that is open, extensible, and secure.
</p>
<p>
    For more information on the features and benefits of <strong>CDK</strong>, including details
on the <a href="https://www.ubuntu.com/kubernetes/managed">
<strong>Managed Kubernetes</strong></a>
 service, please see
the <a href=" https://www.ubuntu.com/kubernetes">main website</a>.</p>

</div>
<div class="col-6 u-align--right">
    <img style="border: 0" src="https://assets.ubuntu.com/v1/b3b65bb0-k8s-bundle.png" width="350" height="350">
</div>
</div></div>

<hr class="is-deep">

## Components

**CDK** is built around a number of applications, bundled together and deployed using
[**Juju**][juju], the open source modelling tool for deploying and operating software in
the cloud.

### Storage

**CDK** comes with a powerful volume plugin system that enables many different
 types of storage systems to:

 - Automatically create storage when required.
 - Make storage available to containers wherever they’re scheduled.
 - Automatically delete the storage when no longer needed.

### Networking

**Kubernetes** uses Container Network Interface (CNI) as an interface between
network providers and **Kubernetes** networking.
**CDK**  comes pre-packaged with several tested CNI plugins like Calico and Flannel.


### Logging and monitoring

Operations in  large-scale distributed clusters require a new level of operational
monitoring and observability. Canonical delivers a standardised set of open source log
aggregation and systems monitoring dashboards with every cloud, using
**Prometheus**, the **Elasticsearch** and **Kibana** stack (ELK), and **Nagios**.

### Cloud integration

Depending on your choice of cloud, **CDK** will also install an integration
application. This enables **CDK** to seamlessly access cloud resources and
components without additional configuration or hassle.



<!-- LINKS -->
[maas]: https://maas.io
[cdk]: https://www.ubuntu.com/kubernetes
[managed-cdk]: https://www.ubuntu.com/kubernetes/managed
[juju]: https://jujucharms.com
