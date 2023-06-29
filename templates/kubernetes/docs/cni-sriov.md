---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with SR-IOV"
  description: How to deploy and use SR-IOV CNI in Charmed Kubernetes
keywords: CNI, networking, sr-iov, sriov
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-sriov.html
layout: [base, ubuntu-com]
toc: False
---

SR-IOV support in **Charmed Kubernetes** makes it possible to take network
interfaces that are SR-IOV Virtual Functions (VFs) and attach them directly to
pods. SR-IOV support is provided by the sriov-cni and
sriov-network-device-plugin charms, which must be deployed into a Kubernetes
model in Juju.

## Requirements

### Juju 2.8.0

The SR-IOV CNI charms require Juju 2.8.0 or newer.

### SR-IOV Hardware Support

The kubernetes-worker host machines in your **Charmed Kubernetes** cluster must
have attached network interface cards that support SR-IOV. While you will be
attaching Virtual Functions to pods, the Physical Functions **must** be present
on the hosts as well.

### CNI providers

SR-IOV CNI is not a replacement for other CNI providers. Your
**Charmed Kubernetes** deployment must include at least one of the base CNI
providers documented in the [CNI overview][cni-overview] page.

### Multus

SR-IOV CNI requires Multus. You can read about how to enable Multus on
**Charmed Kubernetes** in the [Multus CNI][cni-multus] page.

### Persistent volume support

In order to deploy SR-IOV CNI, you will need a Kubernetes model in Juju, which
requires persistent volume support to be enabled in your **Charmed Kubernetes**
cluster.

If your cluster includes any of the cloud integrator charms, then you should
have persistent volume support already. Otherwise, you can read the
[Storage][storage] documentation page to learn how to enable persistent volume
support by adding Ceph to your cluster.

### Creating a Kubernetes model in Juju

To deploy the SR-IOV charms, you will first need a Kubernetes model in Juju.

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

## Deploying SR-IOV

Once all of the requirements have been met, you can deploy the SR-IOV charms
into a Kubernetes model by running:

```
juju deploy sriov-cni
juju deploy sriov-network-device-plugin
```

## Creating SR-IOV Virtual Functions

In order to use SR-IOV CNI, you must manually create SR-IOV virtual functions
(VFs) on the kubernetes-worker units. Consult the documentation for your network
interface card to determine how to create SR-IOV VFs. If needed, you can use the
`juju ssh` command to ssh into the kubernetes-worker units.

## Configuring sriov-network-device-plugin

Before the SR-IOV Network Device Plugin can function, you must configure it
with a list of definitions for SR-IOV resources you would like to use. An
example is shown below:

```bash
juju config sriov-network-device-plugin resource-list='
[
  {
    "resourceName": "intel_sriov_netdevice",
    "selectors": {
      "vendors": ["8086"],
      "devices": ["154c", "10ed"],
      "drivers": ["i40evf", "ixgbevf"]
    }
  }
]
'
```

For more details on available options in the resource-list config, please refer to the
[SR-IOV Network Device Plugin documentation for the resourceList config][sriov-resourcelist].

You can verify that the resource list has been configured correctly by checking
your Kubernetes nodes for the resources you defined. The example below indicates
that 8 intel.com/intel_sriov_netdevice resources were detected on the node and
are available to use:

```
$ kubectl get node node1 -o json | jq '.status.allocatable'
{
  "cpu": "8",
  "ephemeral-storage": "169986638772",
  "hugepages-1Gi": "0",
  "hugepages-2Mi": "8Gi",
  "intel.com/intel_sriov_netdevice": "8",
  "memory": "7880620Ki",
  "pods": "1k"
}
```

## Creating a NetworkAttachmentDefinition

You will also need to create a NetworkAttachmentDefinition that uses the SR-IOV
CNI plugin and references one of the SR-IOV resources you have defined. For
example:

```bash
juju config multus network-attachment-definitions='
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: sriov
  namespace: default
  annotations:
    k8s.v1.cni.cncf.io/resourceName: intel.com/intel_sriov_netdevice
spec:
  config: |
    {
      "type": "sriov",
      "ipam": {
        "type": "host-local",
        "ranges": [[{
            "subnet": "10.123.123.0/24"
        }]]
      }
    }
'
```

## Creating a Pod

The last step is to create a pod that requests the
intel.com/intel_sriov_netdevice resource and uses the
NetworkAttachmentDefinition defined above:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu
  namespace: default
  annotations:
    k8s.v1.cni.cncf.io/networks: sriov
spec:
  containers:
  - name: ubuntu
    image: ubuntu:20.04
    command: ['sleep', '3600']
    resources:
      requests:
        intel.com/intel_sriov_netdevice: '1'
      limits:
        intel.com/intel_sriov_netdevice: '1'
```
<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The pod must be created in the same namespace as the NetworkAttachmentDefinition.</p>
  </div>
</div>

If all goes well, the pod should come up in a Running state with the SR-IOV VF
available from within the device. The interface's name in this example will be
`net1`, since it is the first additional network attached by Multus.

## Troubleshooting

If there is an issue with SR-IOV CNI, it can be useful to inspect the Juju logs. To
see a complete set of logs for SR-IOV CNI:

```bash
juju debug-log --replay --include=sriov-cni
```

And to do the same for the SR-IOV Network Device Plugin:

```bash
juju debug-log --replay --include=sriov-network-device-plugin
```

For additional troubleshooting pointers, please see the [dedicated troubleshooting page][troubleshooting].

<!-- LINKS -->

[cni-overview]: /kubernetes/docs/cni-overview
[storage]: /kubernetes/docs/storage
[cni-multus]: /kubernetes/docs/cni-multus
[sriov-resourcelist]: https://github.com/intel/sriov-network-device-plugin/tree/db98d96cc0d6ad3fff917ba238bd1cc5cc3f7e82#config-parameters
[troubleshooting]: /kubernetes/docs/troubleshooting

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-sriov.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

