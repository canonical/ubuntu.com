---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "IPv6"
  description: Using IPv6 with Charmed Kubernetes.
keywords: juju, network, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: ipv6.html
layout: [base, ubuntu-com]
toc: False
---

<div class="p-notification--caution"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
Calico is the only CNI which supports IPv6 at this time.
</p></div>

As of Kubernetes 1.19, support for IPv6 is in beta and [dual-stack][](running clusters
with both IPv4 and IPv6) is in alpha.
Charmed Kubernetes supports both these features, though it is important to be
familiar with the [known issues](#known-issues) described below.

<a id='enabling'> </a>
## Enabling IPv6 and dual-stack in Charmed Kubernetes

These features can be used simply by changing the configuration for Calico and the
Kubernetes master to include the relevant CIDRs.

For Calico, the `cidr` configuration can contain two comma-separated values, with the
first CIDR in the list being the preferred family for pods.

For the Kubernetes master, the `service-cidr` configuration can contain two
comma-separated values, with the first being the default family for services.

Note that Kubernetes supports [explicitly setting the `ipFamilies`][ip-families] for a
service when creating it.

The following example shows how to deploy Charmed Kubernetes with IPv6 and dual-stack
enabled.


<a id='example'> </a>
### Example deployment

You can use the following overlay file ([download it here][asset-ipv4-ipv6-overlay])
along with [the Calico overlay][asset-calico-overlay] to enable IPv4-preferred
dual-stack:

```yaml
description: Charmed Kubernetes overlay to enable IPv4-IPv6 dual-stack.
applications:
  calico:
    options:
      cidr: "192.168.0.0/16,fd00:c00b:1::/112"
  kubernetes-master:
    options:
      service-cidr: "10.152.183.0/24,fd00:c00b:2::/112"
```

You can deploy all of that with:

```
juju deploy cs:charmed-kubernetes --overlay ./calico-overlay.yaml --overlay ipv4-ipv6-overlay.yaml
```

Once that is deployed, you can use the following spec ([download it
here][asset-nginx-dual-stack]) to run a dual-stack enabled nginx pod with an
IPv6 service in front of it:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginxdualstack
spec:
  selector:
    matchLabels:
      run: nginxdualstack
  replicas: 2
  template:
    metadata:
      labels:
        run: nginxdualstack
    spec:
      containers:
      - name: nginxdualstack
        image: rocks.canonical.com/cdk/diverdane/nginxdualstack:1.0.0
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx6
  labels:
    run: nginxdualstack
spec:
  type: NodePort
  ipFamilies: [IPv6]
  ports:
  - port: 80
    protocol: TCP
  selector:
    run: nginxdualstack
```

<a id='known-issues'> </a>
## Known Issues

Because of the pre-release feature status for IPv6 and dual-stack in Kubernetes
and since Juju does not officially support IPv6, there are currently
some things which won't work 100% and some limitations on IPv6 configuration.
These will also vary depending on the underlying cloud provider.

### Juju

The following arise because Juju does not fully support IPv6:

* The charms require IPv4 on the underlying hosts, even when running a cluster
  in IPv6-only mode.

* By default, connections to the API server will use the IPv4 address even when
  running a cluster in IPv6-preferred or IPv6-only mode. This can be modified
  in the client config by hand or overridden via the `loadbalancer-ips` config
  on the [kubernetes-master] and / or kubeapi-load-balancer charms.

* IPv6 NodePort listeners won't function on the master, though they will work
  on the worker units.

* Juju's `open-port` cannot be used to allow NodePort connections for IPv6.

### AWS

The following arise when using AWS as the underlying cloud provider:

* Kubernetes creates classic load balancers for LoadBalancer-type services,
  which do not support IPv6.

* Juju does not honor the "automatically assign IPv6 address" setting and
  creates instances without IPv6 addresses. You can attach IPv6 addresses
  after deploying with something like:

  ```bash
  for machine in $(juju status --format=json | jq -r '.machines|keys[]' | sort -n); do
      echo -n "Machine $machine: "
      instance="pending"
      while [[ "$instance" == "pending" ]]; do
          instance=$(juju status --format=json | jq -r '.machines["'"$machine"'"]."instance-id"')
      done
      interface=$(aws ec2 describe-instances --instance-id "$instance" --output text --query 'Reservations[*].Instances[*].NetworkInterfaces[*].NetworkInterfaceId')
      aws ec2 modify-instance-attribute --instance-id "$instance" --no-source-dest-check
      ipv6_addresses=$(aws ec2 describe-instances --instance-id "$instance" --output text --query 'Reservations[*].Instances[*].NetworkInterfaces[*].Ipv6Addresses')
      if [[ -n "$ipv6_addresses" ]]; then
          echo "$ipv6_addresses"
      else
          aws ec2 assign-ipv6-addresses --network-interface-id "$interface" --ipv6-address-count 1 --output text --query 'AssignedIpv6Addresses'
      fi
  done
  ```

### OpenStack

No additional issues with IPv6 on OpenStack are known at this time.

### MAAS

No additional issues with IPv6 on MAAS are known at this time.


<!-- LINKS -->

[dual-stack]: https://kubernetes.io/docs/concepts/services-networking/dual-stack/
[ip-families]: https://kubernetes.io/docs/concepts/services-networking/dual-stack/#services
[asset-calico-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/calico-overlay.yaml
[asset-ipv4-ipv6-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/ipv4-ipv6-overlay.yaml
[asset-nginx-dual-stack]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/specs/nginx-dual-stack.yaml
