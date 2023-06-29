---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with Multus"
  description: How to deploy and use Multus in Charmed Kubernetes
keywords: CNI, networking, multus
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-multus.html
layout: [base, ubuntu-com]
toc: False
---

[Multus][multus] is a CNI plugin for Kubernetes which enables attaching multiple
network interfaces to pods. Multus support for **Charmed Kubernetes** is
provided by the Multus charm, which must be deployed into a Kubernetes model
in Juju.

## Requirements

### Juju 2.8.0

The Multus charm requires Juju 2.8.0 or newer.

### CNI providers

Multus is not a replacement for other CNI providers. Your **Charmed Kubernetes**
deployment must include at least one of the base CNI providers documented in the
[CNI overview][cni-overview] page.

### Persistent volume support

In order to deploy Multus, you will need a Kubernetes model in Juju, which
requires persistent volume support to be enabled in your **Charmed Kubernetes**
cluster.

If your cluster includes any of the cloud integrator charms, then you should
have persistent volume support already. Otherwise, you can read the
[Storage][storage] documentation page to learn how to enable persistent volume
support by adding Ceph to your cluster.

### Creating a Kubernetes model in Juju

To deploy the Multus charm, you will first need a Kubernetes model in Juju.

Make sure your local kubeconfig is pointing to the correct Kubernetes cluster:

```
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

Next, add your Kubernetes as a cloud to your Juju controller:

```
juju add-k8s my-k8s-cloud --controller $(juju switch | cut -d: -f1)
```

And create a new Kubernetes model:

```
juju add-model my-k8s-model my-k8s-cloud
```

## Deploying Multus

Once all of the requirements have been met, you can deploy Multus into a
Kubernetes model by running:

```
juju deploy multus
```

## Configuring the Default CNI

Multus delegates to a single CNI network by default. If you have multiple CNI
subordinates in your cluster then you can use the default-cni config on
kubernetes-control-plane to set the default:

```
juju config kubernetes-control-plane default-cni=flannel
```

Multus will use this as the default network as well.

## Example: Pod with multiple Flannel interfaces

If you have Flannel in your cluster, then you can use it to attach additional
network interfaces to your pods. In this example, we'll create an Ubuntu pod
with 2 extra Flannel interfaces, in addition to the default one.

Create a NetworkAttachmentDefinition for Flannel:
```
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: flannel
spec:
  config: |
    {
        "cniVersion": "0.3.1",
        "plugins": [
          {
            "type": "flannel",
            "delegate": {
              "hairpinMode": true,
              "isDefaultGateway": true
            }
          },
          {
            "type": "portmap",
            "capabilities": {"portMappings": true},
            "snat": true
          }
        ]
    }
```

Create a Pod with the `k8s.v1.cni.cncf.io/networks` annotation:
```
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu
  annotations:
    k8s.v1.cni.cncf.io/networks: flannel, flannel
spec:
  containers:
  - name: ubuntu
    image: ubuntu
    command: ['sleep', '3600']
```

That's it. After the pod comes up, you can exec into the pod and confirm that
it has multiple network interfaces with IP addresses belonging to the Flannel
network:

```
$ kubectl exec -it ubuntu bash
root@ubuntu:/# apt update && apt install -y net-tools
...
root@ubuntu:/# ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 8951
        inet 10.1.34.6  netmask 255.255.255.0  broadcast 0.0.0.0
        inet6 fe80::c001:5aff:feb8:fefd  prefixlen 64  scopeid 0x20<link>
        ether c2:01:5a:b8:fe:fd  txqueuelen 0  (Ethernet)
        RX packets 5447  bytes 18185162 (18.1 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4666  bytes 356784 (356.7 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

net1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 8951
        inet 10.1.34.3  netmask 255.255.255.0  broadcast 0.0.0.0
        inet6 fe80::78fe:9ff:fe80:ec57  prefixlen 64  scopeid 0x20<link>
        ether 7a:fe:09:80:ec:57  txqueuelen 0  (Ethernet)
        RX packets 42  bytes 3220 (3.2 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 11  bytes 838 (838.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

net2: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 8951
        inet 10.1.34.4  netmask 255.255.255.0  broadcast 0.0.0.0
        inet6 fe80::acad:f6ff:feaa:416f  prefixlen 64  scopeid 0x20<link>
        ether ae:ad:f6:aa:41:6f  txqueuelen 0  (Ethernet)
        RX packets 40  bytes 3088 (3.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 11  bytes 838 (838.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

In this case, `eth0` is the default interface that gets attached to all pods,
while `net1` and `net2` are the additional interfaces that Multus attached to
the pod based on the pod's `k8s.v1.cni.cncf.io/networks` annotation.

For additional examples of how you can use Multus, please refer to the official
Multus documentation here: [Create network attachment definition][multus-examples].

## Troubleshooting

If there is an issue with Multus, it can be useful to inspect the Juju logs. To
see a complete set of logs for Multus:

```bash
juju debug-log --replay --include=multus
```

For additional troubleshooting pointers, please see the [dedicated troubleshooting page][troubleshooting].

<!-- LINKS -->

[multus]: https://github.com/intel/multus-cni
[cni-overview]: /kubernetes/docs/cni-overview
[storage]: /kubernetes/docs/storage
[multus-examples]: https://github.com/intel/multus-cni/blob/master/docs/how-to-use.md#create-network-attachment-definition
[troubleshooting]: /kubernetes/docs/troubleshooting

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-multus.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

