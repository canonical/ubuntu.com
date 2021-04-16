---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CDK add-ons"
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
and/or to add support for specific features.

This page details these components, their purpose and how they may be
enabled/disabled where applicable.


## CephCSI
Sourced from: <https://github.com/ceph/ceph-csi.git>

The CephCSI addon provides a Container Storage Interface enabling Kubernetes to
dynamically allocate storage to workloads from a Ceph cluster.

The [Storage documentation][] details how to set up and use Ceph for storage
with **Charmed Kubernetes**.

## CoreDNS
Sourced from: <https://github.com/coredns/deployment.git>

CoreDNS has been the default DNS provider for Charmed Kubernetes clusters
since 1.14.

For additional control over CoreDNS, you can also deploy it into the cluster
using the [CoreDNS Kubernetes operator charm][coredns-charm]. To do so, set
the `dns-provider` [kubernetes-master configuration][] option to `none` and
deploy the charm into a Kubernetes model on your cluster. You'll also need
to cross-model relate it to kubernetes-master:

```bash
juju config -m cluster-model kubernetes-master dns-provider=none
juju add-k8s k8s-cloud --controller mycontroller
juju add-model k8s-model k8s-cloud
juju deploy cs:~containers/coredns
juju offer coredns:dns-provider
juju consume -m cluster-model k8s-model.coredns
juju relate -m cluster-model coredns kubernetes-master
```

Once everything settles out, new or restarted pods will use the CoreDNS
charm as their DNS provider. The CoreDNS charm config allows you to change
the cluster domain, the IP address or config file to forward unhandled
queries to, add additional DNS servers, or even override the Corefile entirely.

It is also possible to use `kube-dns` as the DNS provider, or turn off DNS
altogether using the `dns-provider` [kubernetes-master configuration][].

## Kubernetes Dashboard

Sourced from: <https://github.com/kubernetes/dashboard.git>

The Kubernetes Dashboard is a standard and easy way to inspect and
interact with your Kubernetes cluster.

![dashboard image](https://assets.ubuntu.com/v1/4ec7e026-ck8s-dashboard.png)

For instructions on how to access the dashboard, please see the
[Operations page][].

If desired, the dashboard can be disabled:

```bash
juju config kubernetes-master enable-dashboard-addons=false
```

...and re-enabled with:

```
juju config kubernetes-master enable-dashboard-addons=true
```

For additional control over the Kubernetes Dashboard (Different versions,
authentication methods...) you can also deploy it into the cluster using the
[Kubernetes Dashboard operator bundle][kubernetes-dashboard-bundle].

To do so, set the `enable-dashboard-addons` [kubernetes-master configuration][]
option to `false` and deploy the charm into a Kubernetes model on your cluster:

```bash
juju config -m cluster-model kubernetes-master enable-dashboard-addons=false
juju add-k8s k8s-cloud --controller mycontroller
juju add-model kubernetes-dashboard k8s-cloud
juju deploy cs:~containers/kubernetes-dashboard-bundle
```

For accessing the Dashboard use the same instructions in the [Operations page][].

## Nvidia plugin
Sourced from: <https://github.com/NVIDIA/k8s-device-plugin.git>

This plugin enables GPU support for nodes when running with the appropriate
resources. The plugin is set to 'auto' by default, so it only runs when
the drivers and GPU resources are available on the host system.

If you wish to disable the plugin entirely, it can be turned off by setting the
`kubernetes-master` configuration:

```bash
juju config kubernetes-master enable-nvidia-plugin="false"
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

## kube-state-metrics
Sourced from: <https://github.com/kubernetes/kube-state-metrics.git>

Since version 1.17, kube-state-metrics have been enabled by default in
**Charmed Kubernetes**

The `kube-state-metrics` plugin can be disabled with:

```bash
juju config kubernetes-master enable-metrics=false
```

...and re-enabled with:
```bash
juju config kubernetes-master enable-metrics=true
```

There is more information on accessing the metrics and integrating them into
a Prometheus/Grafana/Telegraf stack in the [monitoring docs][].

<!-- LINKS -->
[Operations page]: /kubernetes/docs/operations
[kubernetes-master configuration]: /kubernetes/docs/charm-kubernetes-master#dns-provider-description
[Storage documentation]: /kubernetes/docs/storage
[GPU workers page]: /kubernetes/docs/gpu-workers
[LDAP and Keystone page]: /kubernetes/docs/ldap
[monitoring docs]: /kubernetes/docs/monitoring
[coredns-charm]: https://jaas.ai/u/containers/coredns
[kubernetes-dashboard-bundle]: https://jaas.ai/u/containers/kubernetes-dashboard-bundle
