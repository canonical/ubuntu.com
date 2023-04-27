---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "KubeVirt charm"
  description: Deploy, configure and manage the KubeVirt
keywords: charms, kubevirt, operators
tags: [operating]
sidebar: k8smain-sidebar
permalink: kubevirt.html
layout: [base, ubuntu-com]
toc: False
---

KubeVirt is a a vm-based workload system built on Kubernetes.

KubeVirt technology addresses the needs of development teams that have adopted
or want to adopt Kubernetes but possess existing Virtual Machine-based workloads
that cannot be easily containerised. More specifically, the technology provides
a unified development platform where developers can build, modify, and deploy
applications residing in both Application Containers as well as Virtual Machines
in a common, shared environment.

This work is based on the upstream project [kubevirt.io][upstream].

## Deploying the kubevirt charms

### Prerequisites 
* The [kubevirt charm][charmhub] is deployed as a subordinate to the Kubernetes Worker
* These instructions assume you have a cluster created with Juju and named `charmed-kubernetes`. 
    - Please adjust the commands given appropriately if you have used a different name.
* kubevirt requires that the control-plane allows for privileged containers:
```bash
juju config kubernetes-control-plane allow-privileged=true
```
* **Optional** If the worker machines are themselves VMs, you will be creating VMs
 in VMs or (nested virtualisation).
    - The charm will enable software-emulation for virtualisation if `/dev/kvm` is not
    detected on any one worker node.

### Deploying

The charm is deployed as a subordinate on the workers and will install `qemu` on each worker
unit where it is deployed. The most recent release the charm supports will be installed into
the cluster after which `virtctl` can be used to launch VMs into the cluster.

```bash
juju deploy kubevirt --trust
juju integrate kubevirt:juju-info kubernetes-worker
juju integrate kubevirt:kube-control kubernetes-control-plane
```

### Configuration

**operator-release**
- defaults: auto
- Specifies the version of KubeVirt as defined by the release
  tags of https://github.com/kubevirt/kubevirt/releases

  The charm has a fixed set of supported versions which can be queried with:
  ```bash
  juju run kube-virt/leader list-releases
  ```

**software-emulation**
- defaults: unset
- Whether or not to allow software-emulation of VMs
    * **true**: allows such behavior
    * **false**: disallows such behavior
    * **unset**: automatically determined by the group of units

**pvc-tolerate-less-space-up-to-percent**
- defaults: 10
- Since not every storage provisioner provides volumes
  with the exact usable amount of space as requested
  (e.g. due to filesystem overhead), KubeVirt tolerates
  up to **N**% less available space.

<!-- LINKS -->
[Kubernetes-operators]: /kubernetes/docs/operator-charms
[upstream]: https://kubevirt.io/
[charmhub]: https://charmhub.io/kubevirt

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/kubevirt.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
