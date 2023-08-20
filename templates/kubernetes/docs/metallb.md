---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "MetalLB"
  description: How to configure your Kubernetes cluster to use MetalLB.
keywords: high availability, metallb, vip, load balancer
tags: [operating]
sidebar: k8smain-sidebar
permalink: metallb.html
layout: [base, ubuntu-com]
toc: False
---

[MetalLB][] is a load-balancer implementation for bare metal Kubernetes
clusters, using standard routing protocols. It will monitor for services with
the type `LoadBalancer` and assign them an IP address from a virtual pool.

The Charmed MetalLB Operator delivers automated operations management from day 0 to day 2
using the "MetalLB Load Balancer Implementation for Bare Metal Kubernetes".
It is an open source, production-ready charm for [Juju][].

The Charmed MetalLB Operator provides Layer 2 (with ARP [Address Resolution Protocol](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)) or BGP([Border Gateway Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)) to expose services.

MetalLB has support for local traffic, meaning that the machine that receives
the data will be the machine that services the request. It is not suggested
to use a virtual IP with high traffic workloads because only one machine will
receive the traffic for a service - the other machines are solely used for failover.

BGP does not have this limitation but does see nodes as the atomic unit. This
means if the service is running on two of five nodes then only those two nodes
will receive traffic, but they will each receive 50% of the traffic even if one
of the nodes has three pods and the other only has one pod running on it. It is
recommended to use node anti-affinity to prevent Kubernetes pods from stacking
on a single node.

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">
      For more information on configuring MetalLB with Calico in BGP mode, please see this
      <a href="https://metallb.universe.tf/configuration/calico/">explanation of the required configuration</a> from the
      <a href="https://metallb.universe.tf/"> MetalLB website</a>
    </p>
  </div>
</div>

## Deployment

### Layer 2 mode


To deploy the operators, you will first need a Kubernetes model in Juju.
Add your Charmed Kubernetes as a cloud to your Juju controller:

```bash
juju add-k8s ck8s --controller $(juju switch | cut -d: -f1)
```

Next, create a new Kubernetes model:

```bash
juju add-model metallb-system ck8s
```

Run the following command, which will fetch the charm from
[Charmhub](https://charmhub.io/metallb?channel=1.28/stable) and deploy it to
your model:

```bash
juju deploy metallb --channel 1.28/stable --trust
```

Juju will now fetch Charmed MetalLB and begin deploying it to the Kubernetes
cluster. This process can take several minutes depending on how provisioned
(RAM, CPU, etc) your machine is. You can track the progress by running:

```bash
juju status --watch 1s
```

This command is useful for checking the status of Charmed MetalLB and
gathering information about the containers hosting Charmed MetalLB. Some of the
helpful information it displays include IP addresses, ports, state, etc. The
command updates the status of Charmed MetalLB every second and as the
application starts you can watch the status and messages of Charmed MetalLB
change. Wait until the application is ready - when it is ready, `juju status`
will show:

```no-highlight
Model         Controller       Cloud/Region                     Version  SLA          Timestamp
juju-metallb  overlord         k8s-cloud/default                3.1.5    unsupported  13:32:58-05:00

App      Version  Status  Scale  Charm    Channel      Rev  Address        Exposed  Message
metallb           active      1  metallb  1.28/stable  9    10.152.183.85  no       

Unit        Workload  Agent  Address       Ports  Message
metallb/0*  active    idle   192.168.0.15         
```

To exit the screen with `juju status --watch 1s`, enter `Ctrl+c`.
If you want to further inspect Juju logs, can watch for logs with `juju debug-log`.
More info on logging at [juju logs](https://juju.is/docs/olm/juju-logs).

#### Configuration

You will need to change the IP addresses allocated to MetalLB to suit your
environment. The IP addresses can be specified as a range, such as
“192.168.1.88-192.168.1.89”, or as a comma-separated list of pools in CIDR
notation, such as “192.168.1.240/28, 10.0.0.0/28”.

Configuring the IP addresses can be done either at time of deployment via
single-line config or later by changing the charm config via Juju.

This will adjust the default IPAddressPool.spec.addresses created by the charm
according to the specification.

An example single-line config adjustment might look like:

```bash
juju deploy metallb --config iprange='192.168.1.88-192.168.1.89' --trust
```

Alternatively, you can change the config directly on the metallb charm at any time:

```bash
juju config metallb iprange="192.168.1.240/28, 10.0.0.0/28"
```

### BGP mode

Since the Kubernetes operator charms for MetalLB do not yet support BGP mode,
for now the recommended way to deploy MetalLB in BGP mode is to use the
[upstream manifests][]:

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```

#### Configuration

The BGP configuration can then be performed by using a [MetalLB ConfigMap][configmap].

## Using MetalLB

Once deployed, MetalLB will automatically assign IPs from its pools to any
service of type `LoadBalancer`. When the services are deleted, the IPs are
available again.

<!-- LINKS -->

[Juju]: https://juju.is
[metallb]: https://metallb.universe.tf
[arp]: https://tools.ietf.org/html/rfc826
[bgp]: https://tools.ietf.org/html/rfc1105
[rbac-manifest]: https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/release_1.27/docs/rbac-permissions-operators.yaml
[upstream manifests]: https://github.com/metallb/metallb/tree/main/config/manifests
[configmap]: https://metallb.universe.tf/configuration/#bgp-configuration
[microbot manifest]: https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/release_1.27/docs/example-microbot-lb.yaml

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/metallb.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

