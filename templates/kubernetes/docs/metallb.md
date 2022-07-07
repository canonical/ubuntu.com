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
# About

[MetalLB][metallb] is a Kubernetes-aware solution that will monitor for services with
the type `LoadBalancer` and assign them an IP address from a virtual pool.

It uses BGP([Border Gateway Protocol][bgp]) or Layer 2 (with ARP [Address Resolution Protocol][arp])
to expose services.

MetalLB has support for local traffic, meaning that the machine that receives the
data will be the machine that services the request. It is not suggested to use a
virtual IP with high traffic workloads because only one machine will receive the
traffic for a service - the other machines are solely used for failover.

BGP does not have this limitation but does see nodes as the atomic unit. This means
if the service is running on two of five nodes then only those two nodes will receive
traffic, but they will each receive 50% of the traffic even if one of the nodes has
three pods and the other only has one pod running on it. It is recommended to use node
anti-affinity to prevent Kubernetes pods from stacking on a single node.

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">For more information on configuring MetalLB with Calico in BGP mode, please see this
    <a href="https://metallb.universe.tf/configuration/calico/">
    explanation of the required configuration</a> from the
    <a href="https://metallb.universe.tf/"> MetalLB website</a></p>
  </div>
</div>

# Deployment

## Layer 2 mode

The best way to deploy MetalLB in layer 2 mode on Charmed Kubernetes is with
the MetalLB bundle, which includes Kubernetes operator charms both the
controller and speaker components.

To deploy the operator, you will first need a Kubernetes model in Juju.
Add your Kubernetes as a cloud to your Juju controller:

```
juju add-k8s k8s-cloud --controller $(juju switch | cut -d: -f1)
```

Next, create a new Kubernetes model:

```
juju add-model metallb-system k8s-cloud
```

Then you can deploy MetalLB:

```bash
juju deploy metallb
```

### Configuration

You will likely want to change the IP addresses allocated to MetalLB to suit
your environment. The IP addresses can be specified as a range, such as
"192.168.1.88-192.168.1.89", or as a comma-separated list of pools in CIDR
notation, such as "192.168.1.240/28, 10.0.0.0/28".

Configuring the IP addresses can be done either at time of deployment via a
[bundle overlay][], or later by changing the charm config via Juju.

An example bundle overlay might look like:

```yaml
applications:
  metallb-controller:
    options:
      iprange: "192.168.1.88-192.168.1.89"
```

You would then specify this when deploying the bundle:

```bash
juju deploy metallb --overlay ./overlay.yaml
```

Alternatively, you can change the config directly on the metallb-controller
charm at any time:

```bash
juju config metallb-controller iprange="192.168.1.240/28, 10.0.0.0/28"
```

### Note: Using RBAC

If RBAC is enabled in the Kubernetes cluster, an extra deployment step is
required: before deploying MetalLB, you must apply the [RBAC permissions
manifest][rbac-manifest].  This manifest gives permissions to the operator pods
to use the Kubernetes API to create the necessary resources to make MetalLB
work. You can apply the manifest using `kubectl`:

```bash
wget https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/master/docs/rbac-permissions-operators.yaml
kubectl apply -f rbac-permissions-operators.yaml
```

Be aware that the manifest has to refer to the namespace in which MetalLB is
deployed.  This namespace will be the same as the Juju model you deployed it
into, above. If you used a model name other than `metallb-system`, you will
need to edit the manifest before applying it.

If you forgot to apply this manifest before deploying MetalLB, the units will
fail in the start hook. But don't worry! You can apply the manifest afterwards,
and then resolve the units that are in error to get them back into a working state:

```bash
juju resolve metallb-controller/0
juju resolve metallb-speaker/0
```

## BGP mode

Since the Kubernetes operator charms for MetalLB do not yet support BGP mode,
for now the recommended way to deploy MetalLB in BGP mode is to use the
[upstream manifests][]:

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```

### Configuration

The BGP configuration can then be performed by using a [MetalLB ConfigMap][configmap].

# Using MetalLB

Once deployed, MetalLB will automatically assign IPs from its pools to any
service of type `LoadBalancer`. When the services are deleted, the IPs are
available again.

# Testing MetalLB

To test your deployment of MetalLB, you can use the [microbot manifest][] to
deploy a simple webapp with a service type of `LoadBalancer`:

```bash
wget https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/master/docs/example-microbot-lb.yaml
kubectl apply -f example-microbot-lb.yaml
kubectl get service microbot-lb
```

The EXTERNAL-IP is the IP assigned to the microbot service by the MetalLB controller.
If you reach this IP with a browser, you should see the image of a microbot. If you
cannot, most probably the IP range is not correctly chosen; the IP range needs to
be a pool reserved solely for MetalLB to avoid IP conflicts.

To remove the test webapp and service, simply delete the manifest with kubectl:

```bash
kubectl delete -f example-microbot-lb.yaml
```


<!-- LINKS -->

[metallb]: https://metallb.universe.tf
[arp]: https://tools.ietf.org/html/rfc826
[bgp]: https://tools.ietf.org/html/rfc1105
[bundle overlay]: https://juju.is/docs/charm-bundles#heading--overlay-bundles
[rbac-manifest]: https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/master/docs/rbac-permissions-operators.yaml
[upstream manifests]: https://github.com/metallb/metallb/tree/main/manifests
[configmap]: https://metallb.universe.tf/configuration/#bgp-configuration
[microbot manifest]: https://raw.githubusercontent.com/charmed-kubernetes/metallb-operator/master/docs/example-microbot-lb.yaml

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/metallb.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

