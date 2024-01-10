---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with Cilium"
  description: How to manage and deploy Kubernetes with Cilium
keywords: CNI, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-cilium.html
layout: [base, ubuntu-com]
toc: False
---

[Cilium CNI][cilium-documentation] is a powerful networking plugin for Kubernetes
which provides enhanced security and networking capabilities for containerised
applications. It leverages the power of eBPF (extended Berkeley Packet Filter),
a highly efficient and programmable kernel-level technology, to deliver
transparent network security and traffic monitoring features.

## Deploying Charmed Kubernetes with Cilium

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you are deploying Charmed Kubernetes + Cilium on AWS or OpenStack, please set the following model configurations to disable FAN networking, as this conflicts with the network interfaces created by Cilium: `juju model-config container-networking-method=local fan-config=`
    </p>
  </div>
</div>

To deploy a cluster with Cilium, deploy the `charmed-kubernetes` bundle with
the [Cilium overlay][cilium-overlay]:

```bash
juju deploy charmed-kubernetes --overlay cilium-overlay.yaml
```

You can apply any additional customisation overlays to this deployment as
well.

## Cilium configuration options

A full list of Cilium configuration options and their descriptions can be found
in the [Cilium charm][cilium-charm] page on Charmhub.

### Checking the current configuration

To check the current configuration settings for Cilium, run the command:

```bash
juju config cilium
```

### Setting a config option

To set an option, simply run the config command with an additional
`<key>=<value>` argument. For example, to configure the port-forward 
service for Hubble:

```bash
juju config cilium port-forward-hubble=true
```

The configuration settings that require further explanation are 
provided below.

## Configuring the default Cluster Pool CIDR

The Cilium charm uses the Cluster Scope IPAM mode as its default 
method for IP allocation. To define the IP address range that can be 
assigned to Kubernetes Pods within the cluster, two configuration 
settings can be adjusted: `cluster-pool-ipv4-cidr` and 
`cluster-pool-ipv4-mask-size`.

The `cluster-pool-ipv4-cidr` configuration specifies the IPv4 CIDR 
block for the cluster pool. This determines the range of IP addresses 
that the Kubernetes Pods can use. 
On the other hand, the `cluster-pool-ipv4-mask-size` configuration 
setting specifies the number of bits in the subnet mask to be used 
for the IP addresses in the cluster pool. It defines the number of 
IP addresses that are available in the node from the cluster pool.

For instance, if `cluster-pool-ipv4-cidr` is set to `10.1.0.0/16` 
and `cluster-pool-ipv4-mask-size` is set to `24`, then the available
IP addresses for the Kubernetes Pods in the one of the nodes will fall 
in the range of `10.1.0.1` to `10.1.0.254`.

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">It is vital to choose an appropriate IP address range and subnet mask size that corresponds to the size of your cluster and the number of Pods you expect to deploy.</p>
  </div>
</div>

If you need to configure Cilium with a different CIDR pool during
deployment, simply create a file named `cluster-pool-overlay.yaml`
and include the following contents:

```yaml
applications:
  cilium:
    options:
      cluster-pool-ipv4-cidr: 10.1.0.0/16
      cluster-pool-ipv4-mask-size: 24
```

After creating the `cluster-pool-overlay.yaml` file, add it as an 
overlay during the deployment of Charmed Kubernetes. Keep in mind 
that the order of the overlays is important:

```bash
juju deploy charmed-kubernetes --overlay cilium-overlay.yaml --overlay cluster-pool-overlay.yaml
```

## Configuring Hubble

[Hubble][hubble] is a fully distributed networking and security 
observability platform that complements the Cilium networking solution.
It provides a comprehensive view of the Kubernetes networking 
infrastructure, allowing users to monitor and troubleshoot network traffic, 
microservices, and policies.

Since Hubble is developed as a separate daemon that operates alongside the
Cilium agent, it must be enabled manually. To enable this component in the 
Cilium charm, execute the following command:

```bash
juju config cilium enable-hubble=true
```

This command will deploy Hubble in your cluster, allowing you 
to take advantage of its networking and security observability 
features.

## CLI Tools

The Cilium charm includes the `cilium-cli` and `hubble` CLI tools which enable 
you to manage, troubleshoot, and visualise insights about your Kubernetes 
cluster running Cilium. These CLI tools are accessible in each Kubernetes
Control Plane and Worker units. The [upstream documentation][cilium-documentation]
provides guidance on how to use these CLI tools. Please refer to it for further details.

### Hubble Port Forward

To access the Hubble API, you need to port-forward the Hubble service, which
enables you to connect the Hubble client to the service and access the 
Hubble Relay in your Kubernetes cluster. You can do this by running the 
following command:

```bash
juju config port-forward-hubble=true
```
Once you have done this, you should be able to reach Hubble from your units.
Run the following command to verify the connection and check the status:

```bash
hubble status
```
...which will return the current stats, for example:

```no-highlight
Healthcheck (via localhost:4245): Ok
Current/Max Flows: 20,475/20,475 (100.00%)
Flows/s: 17.18
Connected Nodes: 5/5
```

For further information and details on how to use the Hubble client, please
consult the relevant [documentation][hubble-client].

## Observability Configuration

Cilium and Hubble provide valuable metrics about the cluster and 
its workloads. However, by default, the Cilium charm disables 
metric exposure. Once you have enabled metric exposure for Cilium 
and Hubble, you can use the Canonical Observability Stack or 
another observability stack of your choosing to scrape and 
visualize the metrics.

To enable metrics for Cilium and Hubble, follow the instructions below:

### Cilium

To enable metrics for the Cilium CNI components, execute the 
following command:

```bash
juju config cilium enable-cilium-metrics=true
```

By executing this command, you will be able to access metrics 
for Cilium CNI components such as `cilium-agent` and `cilium-operator`. 
For more detailed information, please refer to the 
[upstream documentation][cilium-metrics].

### Hubble
Hubble provides several sets of metrics that can be enabled 
independently. To activate specific metrics, you can pass a 
list of metrics to enable as a space-separated string. 
Here is an example:

```bash
juju config cilium enable-hubble-metrics="dns icmp"
```

This command will enable both the `dns` and `icmp` metrics. For 
additional information about the available metrics that 
can be enabled, refer to the [Hubble metrics][hubble-metrics] 
section in the upstream documentation.

## COS Lite Integration

The Cilium charm integrates seamlessly with the Canonical 
Observability Stack (COS). You can refer to the COS observability 
stack documentation for detailed instructions on how to deploy the
required components:
[Deploy the COS Lite observability stack on MicroK8s][cos-deploy]

### Prometheus

Prometheus, from the COS Lite stack, can automatically scrape metrics 
from the Cilium and Hubble components. To set this up, you can integrate 
both Prometheus and Cilium via a Cross-Model Integration (CMI). 
The [COS Lite documentation][cos-deploy] provides detailed instructions 
on how to create cross-model integrations using overlays. You can also 
refer to the [Juju documentation][juju-cmi] for more information on how 
to set up and manage cross-model integrations.

### Grafana

The Cilium charm includes the necessary dashboards to visualise the metrics 
exported by the different Cilium components. For more information about the 
dashboards bundled in the Cilium charm, please refer to the 
[Cilium repository][cilium-dashboards].

To retrieve the dashboards, the Cilium charm needs to be related via a 
Cross-Model Integration to Grafana from the COS Lite stack.

## Troubleshooting

If there is an issue with connectivity, it can be useful to inspect the Juju logs.
To see a complete set of logs for Cilium, use the following command:

```bash
juju debug-log --replay --include=cilium
```
This will provide a detailed log output that can be used to identify and resolve issues.
For additional troubleshooting pointers, please see the
[dedicated troubleshooting page][troubleshooting].

## Useful links

- [Cilium Documentation][cilium-documentation]
- [Cilium Network Policies][cilium-network]
- [Hubble Introduction][hubble-introduction]
- [Cilium on GitHub][cilium-github]
- [Cilium Charm on Charmhub][cilium-charm]

<!-- LINKS -->

[cos-deploy]: https://charmhub.io/topics/canonical-observability-stack/install/microk8s
[cilium-charm]: https://charmhub.io/cilium
[cilium-documentation]: https://docs.cilium.io/en/stable/
[cilium-github]: https://github.com/cilium/cilium
[cilium-dashboards]: https://github.com/cilium/cilium/tree/22161112e06f215a5af9485c05489eba5aa21504/install/kubernetes/cilium/files
[cilium-metrics]: https://docs.cilium.io/en/stable/observability/metrics/
[cilium-network]: https://docs.cilium.io/en/stable/security/
[cilium-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/cilium-overlay.yaml
[hubble]: https://docs.cilium.io/en/stable/overview/intro/#what-is-hubble
[hubble-introduction]: https://docs.cilium.io/en/stable/gettingstarted/hubble_intro/
[hubble-client]: https://docs.cilium.io/en/stable/gettingstarted/hubble_cli/#hubble-cli
[hubble-metrics]: https://docs.cilium.io/en/stable/observability/metrics/#hubble-metrics
[juju-cmi]: https://juju.is/docs/juju/cross-model-integration
[troubleshooting]: /kubernetes/docs/troubleshooting

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-cilium.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
