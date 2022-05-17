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
the `dns-provider` [kubernetes-control-plane configuration][] option to `none` and
deploy the charm into a Kubernetes model on your cluster. You'll also need
to cross-model relate it to kubernetes-control-plane:

```bash
juju config -m cluster-model kubernetes-control-plane dns-provider=none
juju add-k8s k8s-cloud --controller mycontroller
juju add-model k8s-model k8s-cloud
juju deploy cs:~containers/coredns
juju offer coredns:dns-provider
juju consume -m cluster-model k8s-model.coredns
juju relate -m cluster-model coredns kubernetes-control-plane
```

Once everything settles out, new or restarted pods will use the CoreDNS
charm as their DNS provider. The CoreDNS charm config allows you to change
the cluster domain, the IP address or config file to forward unhandled
queries to, add additional DNS servers, or even override the Corefile entirely.

It is also possible to use `kube-dns` as the DNS provider, or turn off DNS
altogether using the `dns-provider` [kubernetes-control-plane configuration][].

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

For additional control over the Kubernetes Dashboard (Different versions,
authentication methods...) you can also deploy it into the cluster using the
[Kubernetes Dashboard operator bundle][kubernetes-dashboard-bundle].

To do so, set the `enable-dashboard-addons` [kubernetes-control-plane configuration][]
option to `false` and deploy the charm into a Kubernetes model on your cluster:

```bash
juju config -m cluster-model kubernetes-control-plane enable-dashboard-addons=false
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
**Charmed Kubernetes** provides multiple means of installing services `kube-state-metrics` and `metrics-server` for monitoring some health aspects of the kubernetes cluster.

### Built-in Addons
For each **Charmed Kubernetes** release, baked into the snap which the charm deploys into the `kubernetes-control-plane` charm, are two metrics services.  
* `kube-state-metrics` - a fixed commit aligned with the latest-at-the-time release
* `metrics-server` - a set of kubernetes components defined by kubernetes as an in-tree addon

Both `kube-state-metrics` and `metrics-server` applications can be disabled with:

```bash
juju config kubernetes-control-plane enable-metrics=false
```

...or re-enabled with:
```bash
juju config kubernetes-control-plane enable-metrics=true
```

### Kube-State Metrics
Sourced from: <https://github.com/kubernetes/kube-state-metrics.git>

Kube-State-Metrics is described by upstream docs: 
> kube-state-metrics (KSM) is a simple service that listens to the Kubernetes API server and generates metrics about the state of the objects. ... It is not focused on the health of the individual Kubernetes components, but rather on the health of the various objects inside, such as deployments, nodes and pods.

You may follow the installation instructions from [kube-state-metrics example][]

#### Juju Deployment
`kube-state-metrics` can also be deployed as a juju charm.

One only needs to [add a k8s cloud][] so that juju exposes a means of installing Kubernetes operators into the kubernetes-cluster.

Deploy the [kube-state-metrics-operator][] charm into this kubernetes model with:

```bash
juju deploy kube-state-metrics --trust
juju relate kube-state-metrics prometheus  # if a prometheus application is deployed in the same model
```


### Kubernetes Metrics Server
The Kubernetes Metrics server is described by the upstream docs:

*** "Metrics Server is a scalable, efficient source of container resource metrics for Kubernetes built-in autoscaling pipelines.
 Metrics Server collects resource metrics from Kubelets and exposes them in Kubernetes apiserver through Metrics API for use by Horizontal Pod Autoscaler and Vertical Pod Autoscaler. Metrics API can also be accessed by `kubectl top`, making it easier to debug autoscaling pipelines."***

* In-Tree addon - <https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/metrics-server>
* Out-of-Tree - <https://github.com/kubernetes-sigs/metrics-server.git>

Since version 1.24, the `metrics-server` can be deployed into the cluster just like any other kubernetes application.

In order to deploy a different version of the metrics-server, first you must disable the built-in service while ensuring the kubernetes-api service still allows the [aggregation-extentions][].

```bash
juju config kubernetes-control-plane enable-metrics=false
juju config kubernetes-control-plane api-aggregation-extension=true
```

After which, one may follow the upstream deployment instructions from [metrics-server releases][]

#### Juju Deployment
The `metrics-server` can also be deployed as a juju charm.

One only needs to [add a k8s cloud][] so that juju exposes a means of installing Kubernetes operators into the kubernetes-cluster.

Deploy the [kubernetes-metrics-server][] charm into this kubernetes model with:

```bash
juju deploy kubernetes-metrics-server
```

This charm offers the following options 
* upgrade the release of the `metrics-server` via config
  ```bash
  juju config kubernetes-metrics-server release="v0.6.0"
  ```
* adjust the base image registry if the cluster demands a private registry
  ```bash
  juju config kubernetes-metrics-server image-registry="my.registry.server:5000"
  ```
* adjust the arguments of the running service
  ```bash
  juju config kubernetes-metrics-server extra-args="--kubelet-insecure-tls"
  ```


<!-- LINKS -->
[Operations page]: /kubernetes/docs/operations
[kubernetes-control-plane configuration]: https://charmhub.io/kubernetes-control-plane/configure
[Storage documentation]: /kubernetes/docs/storage
[GPU workers page]: /kubernetes/docs/gpu-workers
[LDAP and Keystone page]: /kubernetes/docs/ldap
[monitoring docs]: /kubernetes/docs/monitoring
[coredns-charm]: https://jaas.ai/u/containers/coredns
[kubernetes-dashboard-bundle]: https://jaas.ai/u/containers/kubernetes-dashboard-bundle
[kube-state-metrics example]: https://github.com/kubernetes/kube-state-metrics/tree/master/examples/standard
[metrics-server releases]: https://github.com/kubernetes-sigs/metrics-server/releases
[add a k8s cloud]: https://juju.is/docs/olm/get-started-on-kubernetes#heading--register-the-cluster-with-juju
[kubernetes-metrics-server]: https://charmhub.io/kubernetes-metrics-server
[aggregation-extentions]: https://kubernetes.io/docs/tasks/extend-kubernetes/configure-aggregation-layer/