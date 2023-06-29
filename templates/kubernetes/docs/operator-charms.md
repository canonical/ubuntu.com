---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Kubernetes Operator Charms"
  description: How to deploy and use Kubernetes operator charms Charmed Kubernetes
keywords: charms, operators
tags: [operating]
sidebar: k8smain-sidebar
permalink: operator-charms.html
layout: [base, ubuntu-com]
toc: False
---

Charmed Kubernetes is built with Juju's Charmed Operators. These operators are
not limited to being deployed only on 'machines' (cloud instances, local VMs or
metal) but many Charmed Operators are designed to be deployed on Kubernetes too.
Additional features of Charmed Kubernetes are often supplied as Kubernetes Operator
charms (for example, the [Multus][] charm which provides multiple container
network capability). To make full use of these operators, some additional setup
of the Charmed Kubernetes cluster is required, as explained below.

## Adding your cluster to the Juju controller

To manage operators within the cluster, Juju needs to be made aware of it
and given the details of the cluster. If you are currently using `kubectl` with
your Charmed Kubernetes cluster, you may already have performed the step of
retrieving the cluster information from Charmed Kubernetes:

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

This fetches the cluster information directly from Charmed Kubernetes and stores
it in the default location (Note: if you run multiple clusters you may wish to
merge these files rather than simple replace them).

Next, add your Kubernetes cluster as a cloud to your Juju controller:

```bash
juju add-k8s ck8s --controller $(juju switch | cut -d: -f1)
```

You may replace `ck8s` with whatever name you want to use to refer to this cluster.

Finally, to be able to deploy operators you will need to create a Juju model in the cluster:

```
juju add-model my-k8s-model ck8s
```

Again, you should replace `my-k8s-model` with a name you want to use to refer to
this Kubernetes model. As well as creating a Juju model, this action will also
create a Kubernetes namespace of the same name which you can use to easily
monitor or manage operators you install on the cluster.

<!-- LINKS -->

[Multus]: /kubernetes/docs/cni-multus

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/operator-charms.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
