---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with Kube-OVN"
  description: How to manage and deploy Kubernetes with Kube-OVN
keywords: CNI, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-kube-ovn.html
layout: [base, ubuntu-com]
toc: False
---

[Kube-OVN][kube-ovn-documentation] is a CNI implementation based on OVN that
provides a rich set of networking features for advanced enterprise applications.
For a list of features, see the [Kube-OVN GitHub repository][kube-ovn-github].

## Deploying Charmed Kubernetes with Kube-OVN

To deploy a cluster with Kube-OVN, deploy the `charmed-kubernetes` bundle with
the [Kube-OVN overlay][kube-ovn-overlay]:

```bash
juju deploy charmed-kubernetes --overlay kube-ovn-overlay.yaml
```

You can apply any additional customisation overlays that would apply to
`charmed-kubernetes` to this deployment as well.

## Kube-OVN configuration options

A full list of Kube-OVN configuration options and their descriptions can be found
in the [Kube-OVN charm][kube-ovn-charm] page.

### Checking the current configuration

To check the current configuration settings for Kube-OVN, run the command:

```bash
juju config kube-ovn
```

### Setting a config option

To set an option, simply run the config command with an additional
`<key>=<value>` argument. For example, to configure the Kube-OVN pinger:

```bash
juju config kube-ovn pinger-external-address=10.123.123.123 pinger-external-dns=example.internal
```

Config settings which require additional explanation are described below.

## Configuring the default subnet

When Kube-OVN first installs, it creates a default subnet named `ovn-default`
that is used to assign IPs to pods. By default, this subnet has CIDR
`192.168.0.0/24`.

To configure the default pod subnet with a different CIDR at deploy time, create
a file named `default-subnet-overlay.yaml` that contains the following:

```yaml
applications:
  kube-ovn:
    options:
      default-cidr: 10.123.0.0/16
      default-gateway: 10.123.0.1
```

Then include it as an overlay when you deploy Charmed Kubernetes. Note that the order of the
overlays is important:

```bash
juju deploy charmed-kubernetes --overlay kube-ovn-overlay.yaml --overlay default-subnet-overlay.yaml
```

## Changing the default subnet after deployment

Note that during the process of changing the default subnet, workload pods
belonging to that subnet will experience temporary downtime.

To change the default subnet after deployment, first
[edit the ovn-default subnet][change-default-subnet-edit] to have the desired config, then
[rebuild all pods under the ovn-default subnet][change-default-subnet-rebuild] to pick up the
new config.

Next, update the Kube-OVN charm configuration to match the new config:

```bash
juju config kube-ovn default-cidr=10.123.0.0/16 default-gateway=10.123.0.1
```

## Configuring the join subnet

Kube-OVN creates a subnet named `join` that is used to assign IP addresses to
the `ovn0` interface of Kubernetes nodes, enabling them to participate in the
broader Kube-OVN network and communicate directly with pods. By default, the
join subnet has CIDR `100.64.0.0/16`.

To configure the join subnet with a different CIDR at deploy time, create a file
named `join-overlay.yaml` that contains the following:

```yaml
applications:
  kube-ovn:
    options:
      node-switch-cidr: 10.234.0.0/16
      node-switch-gateway: 10.234.0.1
```

Then include it as an overlay when you deploy Charmed Kubernetes:

```bash
juju deploy charmed-kubernetes --overlay kube-ovn-overlay.yaml --overlay join-overlay.yaml
```

## Changing the join subnet after deployment

Note that during the process of changing the join subnet, Kubernetes nodes may
be temporarily unable to reach pods.

To change the join subnet after deployment, do the following:

1. [Delete the join subnet][change-join-subnet-delete]
2. [Cleanup allocated config][change-join-subnet-cleanup]
3. Update the kube-ovn charm configuration:
```bash
juju config kube-ovn node-switch-cidr=10.234.0.0/16 node-switch-gateway=10.234.0.1
```
4. Wait a minute, then verify that the join subnet has been recreated with the
expected configuration:
```bash
kubectl get subnet
```
5. [Reconfigure the ovn0 NIC address][change-join-subnet-reconfigure]

## Configuring kube-ovn-pinger

The kube-ovn-pinger service is a DaemonSet that collects OVS status and a
variety of metrics about network connectivity from each Kubernetes node. By
default, it is configured to check external network connectivity by pinging
`8.8.8.8` and `google.com`.

To change the external addresses used by kube-ovn-pinger, update the
`pinger-external-address` and `pinger-external-dns` config options:

```bash
juju config kube-ovn pinger-external-address=10.123.123.123 pinger-external-dns=example.internal
```

## Observability configuration

The Kube-OVN charm integrates seamlessly with Prometheus and Grafana from the
Canonical Observability Stack. See the COS observability stack documentation for
instructions on how to deploy the required observability components:
[Deploy the COS Lite observability stack on MicroK8s][cos-deploy]

### Prometheus

Kube-OVN exposes metrics for all its components and network quality. See
Kube-OVN upstream documentation for more information about the metrics
available: [Kube-OVN Monitor Metrics][kube-ovn-metrics]

Prometheus and Kube-OVN charm should be related through a cross-model relation;
for more information about how to create cross-model relations for the COS
observability stack, see the overlays section in the COS documentation:
[Deploy the COS Lite observability stack on MicroK8s][cos-deploy]

### Grafana

Kube-OVN charm uses the dashboard from upstream. These use the metrics scraped
by Prometheus from the various Kube-OVN components. You can find the available
dashboards in the upstream documentation:
[Kube-OVN Grafana Dashboards][kube-ovn-grafana-dashboards]

To fetch the dashboards, the Kube-OVN charm must be related (via a cross-model
relation) to Grafana from the COS observability stack.

## Using a private Docker registry

For a general introduction to using a private Docker registry with
**Charmed Kubernetes**, please refer to the [Private Docker Registry][] page.

In addition to the steps documented there, you will need to upload the
following image to the registry:

```no-highlight
docker.io/kubeovn/kube-ovn:v1.10.4
```

The Kube-OVN charm will automatically use the image registry that
kubernetes-control-plane is configured to use. If needed, you can override
the Kube-OVN image registry by setting the image-registry config:

```bash
export IP=`juju exec --unit docker-registry/0 'network-get website --ingress-address'`
export PORT=`juju config docker-registry registry-port`
export REGISTRY=$IP:$PORT
juju config kube-ovn image-registry=$REGISTRY
```

## Troubleshooting

If there is an issue with connectivity, it can be useful to inspect the Juju logs.
To see a complete set of logs for Kube-OVN:

```bash
juju debug-log --replay --include=kube-ovn
```

For additional troubleshooting pointers, please see the [dedicated troubleshooting page][troubleshooting].

## Useful links

- [Kube-OVN Documentation][kube-ovn-documentation]
- [Kube-OVN on GitHub][kube-ovn-github]
- [Kube-OVN Architecture Guide][kube-ovn-architecture]
- [Kube-OVN Charm on Charmhub][kube-ovn-charm]

<!-- LINKS -->

[change-default-subnet-edit]: https://kubeovn.github.io/docs/v1.10.x/en/ops/change-default-subnet/#edit-subnet
[change-default-subnet-rebuild]: https://kubeovn.github.io/docs/v1.10.x/en/ops/change-default-subnet/#rebuild-all-pods-under-this-subnet
[change-join-subnet-cleanup]: https://kubeovn.github.io/docs/v1.10.x/en/ops/change-join-subnet/#cleanup-allocated-config
[change-join-subnet-delete]: https://kubeovn.github.io/docs/v1.10.x/en/ops/change-join-subnet/#delete-join-subnet
[change-join-subnet-reconfigure]: https://kubeovn.github.io/docs/v1.10.x/en/ops/change-join-subnet/#reconfigure-ovn0-nic-address
[cos-deploy]: https://charmhub.io/topics/canonical-observability-stack/install/microk8s
[kube-ovn-architecture]: https://kubeovn.github.io/docs/v1.10.x/en/reference/architecture/
[kube-ovn-charm]: https://charmhub.io/kube-ovn
[kube-ovn-documentation]: https://kubeovn.github.io/docs/v1.10.x/en/
[kube-ovn-github]: https://github.com/kubeovn/kube-ovn
[kube-ovn-grafana-dashboards]: https://github.com/kubeovn/kube-ovn/blob/release-1.10/docs/prometheus.md#grafana-dashboard
[kube-ovn-metrics]: https://github.com/kubeovn/kube-ovn/blob/release-1.10/docs/ovn-ovs-monitor.md
[kube-ovn-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/kube-ovn-overlay.yaml
[private docker registry]: /kubernetes/docs/docker-registry
[troubleshooting]: /kubernetes/docs/troubleshooting

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-kube-ovn.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
