---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with Calico"
  description: How to manage and deploy Kubernetes with Calico
keywords: CNI, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-calico.html
layout: [base, ubuntu-com]
toc: False
---

[Calico][] is a software-defined network solution that can be used with Kubernetes.
Support for Calico in **Charmed Kubernetes** is provided in the form of a `calico`
subordinate charm.

Unlike Flannel, Calico provides out-of-the-box support for the
[NetworkPolicy][] feature of Kubernetes, along with different modes of
network encapsulation that advanced users may find useful for optimising
the throughput of their clusters.

## Cloud configuration

Calico's network traffic is filtered on many clouds, and may require
special configuration at the cloud level to support it.

If Calico is configured to use [BGP mode][bgp] (the default), then all of the
Kubernetes instances must be located in the same subnet for Calico to work out
of the box. Alternatively, the Calico charm may be configured with external
BGP peers to allow cross-subnet traffic to work.

If Calico is configured to use IPIP mode, then the cloud must be configured to
allow IPIP (protocol 4) network traffic.

If all else fails, then running Calico with VXLAN encapsulation enabled should
make it work on most clouds with no special configuration.

### AWS

On AWS, it is recommended to run Calico in BGP mode. This usually requires the
creation of a VPC that has only a single subnet associated with it. See Juju's
[Creating an AWS VPC][] documentation for instructions on how to create a VPC
that's compatible with Juju.

After deployment, each AWS instance must be manually configured to disable
source/destination checks. See AWS's [Disabling Source/Destination Checks][]
documentation for instructions.

## Deploying Charmed Kubernetes with Calico

Calico became the default choice for networking with **Charmed Kubernetes** 1.24.
If you [deploy the bundle][quickstart] without changing the default settings,
calico will be the CNI.

## Calico configuration options

A full list of Calico configuration options and their descriptions can be found
in the [Calico charm] page.

### Checking the current configuration

To check the current configuration settings for Calico, run the command:

```bash
juju config calico
```

### Setting a config option

To set an option, simply run the config command with an additional `<key>=<value>` argument. For example, to disable NAT on outgoing traffic:

```bash
juju config calico nat-outgoing=False
```

Config settings which require additional explanation are described below.

## Calico IPIP configuration

By default, IPIP encapsulation is disabled. To enable IPIP encapsulation, set
the `ipip` charm config to `Always`:

```
juju config calico ipip=Always
```

Alternatively, if you would like IPIP encapsulation to be used for cross-subnet
traffic only, set the `ipip` charm config to `CrossSubnet`:

```
juju config calico ipip=CrossSubnet
```

## Calico VXLAN configuration

By default, VXLAN encapsulation is disabled. To enable VXLAN encapsulation, set
the `vxlan` charm config to `Always`:

```
juju config calico vxlan=Always
```

Alternatively, if you would like VXLAN encapsulation to be used for cross-subnet
traffic only, set the `vxlan` charm config to `CrossSubnet`:

```
juju config calico vxlan=CrossSubnet
```

## Calico BGP configuration

The default configuration of Calico uses BGP mode, with all Calico nodes
connected in a full node-to-node mesh, and with no external peerings. This
comes with some limitations which will be explained in the following sections.

<div class="p-notification--positive">
<p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
If you intend to use MetalLB with Calico in BGP mode,
please also refer to this
<a href="https://metallb.universe.tf/configuration/calico/">
explanation of the required MetalLB configuration</a> from the
<a href="https://metallb.universe.tf/"> MetalLB website</a>
</p></div>

### BGP with multiple subnets

If BGP mode is in use, and Calico units are deployed to separate subnets, then
Calico must be configured to peer with external routers in order to accommodate
cross-subnet traffic.

For example, if you have units across two subnets (10.0.0.0/24 and
10.0.1.0/24), and a single router that connects them (with IPs 10.0.0.1,
10.0.1.1, and AS number 64512), then the simplest configuration would be to
configure Calico to peer with that router and to use the same AS number.

Configure the AS number:
```bash
juju config calico global-as-number=64512
```

And configure the external peering:

```bash
juju config calico subnet-bgp-peers="
10.0.0.0/24:
- address: 10.0.0.1
  as-number: 64512
10.0.1.0/24:
- address: 10.0.1.1
  as-number: 64512
"
```

You will also need to configure the router to peer with each Calico node. This
step varies based on the router's BGP implementation. Here's an
[example configuration for BIRD][bgp-multiple-subnets-bird-example].

### BGP route reflection

By default, all Calico nodes are connected in a full BGP mesh. This works well
for small deployments, but does not scale well to larger deployments. For
large deployments, it is recommended that you configure Calico to use
[route reflection].

For example, in a deployment with more than 10 Calico units, you might
configure it such that units calico/0 (with IP 10.0.0.2) and calico/1 (with IP
10.0.0.3) are route reflectors, and all other Calico units only peer with them.
To do this, you would first configure route reflector cluster IDs:

```bash
juju config calico route-reflector-cluster-ids="
0: 0.0.0.0
1: 0.0.0.0
"
```

Then configure every node to peer with the route reflectors:
```bash
juju config calico global-bgp-peers="
- address: 10.0.0.2
  as-number: 64512
- address: 10.0.0.3
  as-number: 64512
"
```

And disable the node-to-node-mesh:
```bash
juju config calico node-to-node-mesh=false
```

### BGP with the AS Per Rack model

One commonly used model for Calico deployments on bare metal is the
[AS Per Rack model]. The configuration in this scenario can be tricky, so let's
walk through an example.

Given:
- Two racks:
  - Rack 0
    - Subnets 10.0.0.0/24, 10.0.1.0/24
    - ToR router with IPs 10.0.0.1, 10.0.1.1
    - Desired route reflectors:
      - calico/0 at 10.0.0.2
      - calico/1 at 10.0.1.2
  - Rack 1
    - Subnets 10.0.2.0/24, 10.0.3.0/24
    - ToR router with IPs 10.0.2.1, 10.0.3.1
    - Desired route reflectors:
      - calico/2 at 10.0.2.2
      - calico/3 at 10.0.3.2

Assign a different AS number to each rack:

```bash
juju config calico subnet-as-numbers="
10.0.0.0/24: 64512
10.0.1.0/24: 64512
10.0.2.0/24: 64513
10.0.3.0/24: 64513
"
```

Next, configure the route reflectors. Each route reflector needs to be assigned
a cluster ID. The exact cluster ID used isn't important, as long as both route
reflectors on a given rack share the same cluster ID. For this example, we'll
choose 0.0.0.0 for rack 0 and 0.0.0.1 for rack 1.

Configure the route reflectors:

```bash
juju config calico route-reflector-cluster-ids="
0: 0.0.0.0
1: 0.0.0.0
2: 0.0.0.1
3: 0.0.0.1
"
```

Configure route reflectors to peer with the top of rack switches:

```bash
juju config calico unit-bgp-peers="
0:
- address: 10.0.0.1
  as-number: 64512
1:
- address: 10.0.1.1
  as-number: 64512
2:
- address: 10.0.2.1
  as-number: 64513
3:
- address: 10.0.3.1
  as-number: 64513
"
```

Configure Calico nodes to peer with the route reflectors:

```bash
juju config calico subnet-bgp-peers="
10.0.0.0/24:
- address: 10.0.0.2
  as-number: 64512
- address: 10.0.1.2
  as-number: 64512
10.0.1.0/24:
- address: 10.0.0.2
  as-number: 64512
- address: 10.0.1.2
  as-number: 64512
10.0.2.0/24:
- address: 10.0.2.2
  as-number: 64513
- address: 10.0.3.2
  as-number: 64513
10.0.3.0/24:
- address: 10.0.2.2
  as-number: 64513
- address: 10.0.3.2
  as-number: 64513
"
```

And disable the node-to-node mesh:

```bash
juju config calico node-to-node-mesh=false
```

You will also need to configure the top of rack switches to peer with the
Calico route reflectors. Instructions for doing this should be provided in the
documentation for the specific model of switch you are using.

### Service IP advertisement

Calico supports advertising Kubernetes service IPs to external routers over BGP.
You can enable this in the charm by setting the bgp-service-cluster-ips config:

```
SERVICE_CIDR="$(juju config kubernetes-control-plane service-cidr)"
juju config calico bgp-service-cluster-ips="$SERVICE_CIDR"
```

Once the above config has been set, Calico will advertise Kubernetes service
routes to any external routers that the charm has been configured to peer with.

For more information, see the bgp-service-cluster-ips and
bgp-service-external-ips config descriptions in the [Calico charm] page.

## Configuring multiple Calico pools

The Calico charm creates a single IPPool. If multiple IPPools pools are desired,
then you must first disable the charm's built-in pool management:

```bash
juju config calico manage-pools=false
```

Then use calicoctl to create your own pools. For example:

```bash
juju ssh calico/0 calicoctl apply -f - << EOF
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
  name: my-pool
spec:
  cidr: 192.168.0.0/24
  ipipMode: Never
  natOutgoing: true
EOF
```

## Using a private Docker registry

For a general introduction to using a private Docker registry with
**Charmed Kubernetes**, please refer to the [Private Docker Registry][] page.

In addition to the steps documented there, you will need to upload the
following images to the registry:

```no-highlight
docker.io/calico/node:v3.6.1
docker.io/calico/kube-controllers:v3.6.1
```

And configure Calico to use the registry:

```bash
export IP=`juju exec --unit docker-registry/0 'network-get website --ingress-address'`
export PORT=`juju config docker-registry registry-port`
export REGISTRY=$IP:$PORT
juju config calico \
  calico-node-image=$registry/calico/node:v3.6.1 \
  calico-policy-image=$registry/calico/kube-controllers:v3.6.1
```

## Troubleshooting

If there is an issue with connectivity, it can be useful to inspect the Juju logs.
To see a complete set of logs for Calico

```bash
juju debug-log --replay --include=calico
```

For additional troubleshooting pointers, please see the [dedicated troubleshooting page][troubleshooting].

## Useful links

- The [Calico website][calico-learn] has a thorough explanation of its network management strategy.

<!-- LINKS -->

[calico-learn]: https://www.projectcalico.org/learn/
[NetworkPolicy]: https://kubernetes.io/docs/concepts/services-networking/network-policies/
[Creating an AWS VPC]: https://old-docs.jujucharms.com/2.5/en/charms-fan-aws-vpc
[Disabling Source/Destination Checks]: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_NAT_Instance.html#EIP_Disable_SrcDestCheck
[private docker registry]: /kubernetes/docs/docker-registry
[bgp]: https://docs.tigera.io/calico/3.25/networking/configuring/bgp
[Calico]: https://www.projectcalico.org/
[troubleshooting]: /kubernetes/docs/troubleshooting
[quickstart]:  /kubernetes/docs/quickstart
[install-manual]:  /kubernetes/docs/install-manual
[bgp-multiple-subnets-bird-example]: https://gist.github.com/Cynerva/46712dd1e9b75d42cb38fb966abfa932
[route reflection]: https://tools.ietf.org/html/rfc4456
[AS Per Rack model]: https://docs.projectcalico.org/reference/architecture/design/l3-interconnect-fabric
[Calico charm]: /kubernetes/docs/charm-calico

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-calico.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
