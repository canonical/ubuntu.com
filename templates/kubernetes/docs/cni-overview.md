---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI overview"
  description: How to manage and deploy Kubernetes with flannel, calico, canal or Tigera Secure EE
keywords: CNI, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-overview.html
layout: [base, ubuntu-com]
toc: False
---

Managing a network where containers can interoperate efficiently is very
important. Kubernetes has adopted the Container Network Interface(CNI)
specification for managing network resources on a cluster. This relatively
simple specification makes it easy for Kubernetes to interact with a wide range
of CNI-based software solutions.

With **Charmed Kubernetes**, these networking 'plug-ins' are deployed as
subordinate charms with each  node running as a `kubernetes-control-plane` or
`kubernetes-worker`, and ensure the smooth running of the cluster. It is
possible to choose one of several different CNI providers for **Charmed
Kubernetes**, which are listed below:

## Supported CNI options

The currently supported base CNI solutions for **Charmed Kubernetes** are:

 -   [Calico][calico]
 -   [Canal][canal]
 -   [Cilium][cilium]
 -   [Flannel][flannel]
 -   [Kube-OVN][kube-ovn]
 -   [Tigera Secure EE][tigera]

By default, **Charmed Kubernetes** will deploy the cluster using Calico. To choose
a different CNI provider, see the individual links above.

The following CNI addons are also available:
 -   [Multus][multus]
 -   [SR-IOV][sr-iov]

## Migrating to a different CNI solution

As networking is a fundamental part of the cluster, changing the network on a live cluster
is not straightforward. Currently it is recommended to create a new cluster with **Charmed Kubernetes**
using the desired option. When [federation][] becomes part of a future release of
Kubernetes, such a migration should be manageable with no downtime.


## CNI Requirements in a LXD

As they develop and mature, CNIs such as [cilium][] and [calico][] more frequently require
specific kernel features which make them more difficult to operate from within the
confinement of LXD. **Charmed Kubernetes** makes a best effort to operate CNIs, but admins
should consider avoiding LXD as a choice to operate `kubernetes-worker` or 
`kubernetes-control-plane` since the CNIs require deeper access on the host machine's kernel.

If the choice is made to continue using LXD for nodes where a CNI is deployed, the LXD profile must be opened
up for those units to adjust the host machine's kernel space. Consider a deployment where [calico][] is deployed
as a subordinate unit of `kubernetes-control-plane` on LXD. Those LXDs exist solely on machines where the primary 
app is `ubuntu-control-plane-nodes` with the `ubuntu` charm.

Both CNIs require access to the host `/sys/fs/bpf` and this can be exposed through the following profile adjustment
```bash
machine_app=ubuntu-control-plane-nodes
# Mount the host /sys/fs/bpf into the lxd containers of these machines
juju exec -a $machine_app -- 'sudo lxc profile edit default << EOF
devices:
  sysfsbpf:
    path: /sys/fs/bpf
    source: /sys/fs/bpf
    type: disk
EOF'
```

Every container in the machine should then be restarted to update its profile:

```bash
readarray units < <(juju status $machine_app --format yaml | yq ".applications.$machine_app.units | keys" )
for unit in "${units[@]}"; do
    juju exec -u $(echo $unit | yq .[0]) -- 'sudo lxc restart --all'
done

# wait for the cluster to settle
juju-wait
```

<!-- LINKS -->

[calico]: /kubernetes/docs/cni-calico
[canal]: /kubernetes/docs/cni-canal
[cilium]: /kubernetes/docs/cni-cilium
[flannel]: /kubernetes/docs/cni-flannel
[kube-ovn]: /kubernetes/docs/cni-kube-ovn
[tigera]: /kubernetes/docs/tigera-secure-ee
[multus]: /kubernetes/docs/cni-multus
[sr-iov]: /kubernetes/docs/cni-sriov
[install]: /kubernetes/docs/install-manual
[federation]: https://github.com/kubernetes-sigs/kubefed

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-overview.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

