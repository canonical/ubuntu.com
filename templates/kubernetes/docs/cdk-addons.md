---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes addons"
  description: Explaining how to make use of the pre-installed additions to Kubernetes provided by Charmed Kubernetes.
keywords: operating, add-ons, addons, config
tags: [operating]
sidebar: k8smain-sidebar
permalink: cdk-addons.html
layout: [base, ubuntu-com]
toc: False
---

In addition to the components strictly required to create a Kubernetes cluster,
**Charmed Kubernetes** installs and configures some components for convenience
and/or to add support for specific features. These 'addons' have historically 
been 'baked in' with the default install of Charmed Kubernetes, but as these
components are no longer going to be updated upstream, these are being replaced by 
specific **Operator Charms**. Such charms are deployed by Juju into Kubernetes
itself and require some additional steps. 

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Please see the <a href="/kubernetes/docs/operator-charms"> Operator Charms</a> page for 
    information on how to set-up Juju prior to deploying the addon charms into Charmed Kubernetes.</p>
  </div>
</div>


## CephCSI
Sourced from: <https://github.com/ceph/ceph-csi.git>

The CephCSI addon provides a Container Storage Interface enabling Kubernetes to
dynamically allocate storage to workloads from a Ceph cluster.

The [Storage documentation][] details how to set up and use Ceph for storage
with **Charmed Kubernetes**.

## CoreDNS
Sourced from: <https://github.com/coredns/deployment.git>

CoreDNS has been the default DNS provider for Charmed Kubernetes clusters
since 1.14. It will be installed and configured as part of the install
process of Charmed Kubernetes.

If you use the operator charm to deploy CoreDNS to your cluster instead, 
there is additional flexibility for configuring:
-  the cluster domain
-  forwarding rules for unhandled addresses
-  additional DNS servers

For a step-by-step guide to installing the Operator Charm version of CoreDNS, 
please refer to the [How to guide][howto].


## Kubernetes Dashboard
Sourced from: <https://github.com/kubernetes/dashboard.git>

The Kubernetes Dashboard is a standard and easy way to inspect and
interact with your Kubernetes cluster.

![dashboard image](https://assets.ubuntu.com/v1/4ec7e026-ck8s-dashboard.png)

For instructions on how to access the dashboard, please see the
[Operations page][].

If desired, the dashboard can be disabled:

```bash
juju config kubernetes-control-plane enable-dashboard-addons=false
```

...and re-enabled with:

```
juju config kubernetes-control-plane enable-dashboard-addons=true
```

For additional control over the Kubernetes Dashboard, you can also deploy it into
the cluster using the [Kubernetes Dashboard operator charm][kubernetes-dashboard-charm].
For a step-by-step guide to installing the Operator Charm version of the dashboard, 
please refer to the [How to guide][howto].

## Nvidia plugin
Sourced from: <https://github.com/NVIDIA/k8s-device-plugin.git>

This plugin enables GPU support for nodes when running with the appropriate
resources. The plugin is set to 'auto' by default, so it only runs when
the drivers and GPU resources are available on the host system.

If you wish to disable the plugin entirely, it can be turned off by setting the
`kubernetes-control-plane` configuration:

```bash
juju config kubernetes-control-plane enable-nvidia-plugin="false"
```

The default setting is "auto", and it is also possible to set the configuration
to "true", which will load the plugin regardless of whether the resources were
found, which may be useful for troubleshooting.

There is more information on using GPUs for workloads, and working with
public cloud GPU instances, on the [GPU workers page][].

## OpenStack/Keystone
Sourced from: <https://github.com/kubernetes/cloud-provider-openstack.git>

This addon provides the components required to enable **Charmed Kubernetes**
to work with LDAP/Keystone for Authentication and Authorisation.

Please refer to the [LDAP and Keystone page][] for more information on using
this feature.


## Metrics
**Charmed Kubernetes** provides the `kube-state-metrics` and `metrics-server` 
services for monitoring some health aspects of the cluster.

For each **Charmed Kubernetes** release, the `kubernetes-control-plane` charm
includes two metrics services.  

* `kube-state-metrics` - a fixed commit aligned with the latest-at-the-time release
* `metrics-server` - a set of kubernetes components defined by kubernetes as an in-tree addon

Both of the built-in applications can be disabled with:

```bash
juju config kubernetes-control-plane enable-metrics=false
```

...or re-enabled with:
```bash
juju config kubernetes-control-plane enable-metrics=true
```

Both of these services are also available as Operator Charms, to be deployed by Juju
into the cluster. For a step-by-step guide to installing the metrics services, 
please refer to the [How to guide][howto].

<!-- LINKS -->
[howto]: /kubernetes/docs/how-to-addons
[Operations page]: /kubernetes/docs/operations
[kubernetes-control-plane configuration]: https://charmhub.io/kubernetes-control-plane/configure
[Storage documentation]: /kubernetes/docs/storage
[GPU workers page]: /kubernetes/docs/gpu-workers
[LDAP and Keystone page]: /kubernetes/docs/ldap
[monitoring docs]: /kubernetes/docs/monitoring
[coredns-charm]: https://charmhub.io/coredns
[kubernetes-dashboard-charm]: https://charmhub.io/kubernetes-dashboard
[kube-state-metrics example]: https://github.com/kubernetes/kube-state-metrics/tree/master/examples/standard
[metrics-server releases]: https://github.com/kubernetes-sigs/metrics-server/releases
[add a k8s cloud]: https://juju.is/docs/juju/get-started-on-kubernetes#heading--register-the-cluster-with-juju
[kubernetes-metrics-server]: https://charmhub.io/kubernetes-metrics-server
[aggregation-extentions]: https://kubernetes.io/docs/tasks/extend-kubernetes/configure-aggregation-layer/
