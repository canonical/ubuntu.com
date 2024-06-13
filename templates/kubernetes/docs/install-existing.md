---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Installing Charmed Kubernetes on Existing Machines"
  description: How to install and customise Charmed Kubernetes on existing machines.
keywords: lxd, requirements, developer
tags: [install]
sidebar: k8smain-sidebar
permalink: install-existing.html
layout: [base, ubuntu-com]
toc: False
---

Machines that are provisioned without Juju can still be used for Juju deployments.
This is known as a *manual cloud* and is described in the following Juju documentation:

[https://juju.is/docs/juju/manual][juju-manual]

In this guide, we will create a manual cloud with 3 existing machines. We will then
deploy a minimal installation of **Charmed Kubernetes** to this cloud using the
[Kubernetes Core][kubernetes-core] bundle.

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The default <a href="https://charmhub.io/charmed-kubernetes">Charmed Kubernetes</a> bundle is supported on manual clouds. However, it has significantly higher resource requirements (10+ machines) due to the focus on highly available components.</p>
  </div>
</div>

## What you will need

Ensure you have Juju 3.1 or greater installed on your management client. You will also
need 3 existing machines installed with Ubuntu 22.04 (or equivalent). Your management
client will need to be able to SSH to an administrative user on these machines.

## Bootstrap the environment

Designate one of your existing machines to be a Juju controller for this manual cloud.
Bootstrap the controller with the following:

```bash
juju bootstrap manual/<user>@<controller IP address> my-cloud
```

Juju will SSH to the specified IP address as the specified user and install all
necessary requirements. When the controller is ready, create a model to house the
**Charmed Kubernetes** deployment:

```bash
juju add-model my-model
```

Before starting the deployment, add the remaining existing machines to the Juju model
with the following:

```bash
juju add-machine ssh:<user>@<machine IP address>
```

As before, Juju will SSH to the machine and install all necessary requirements. Repeat
this step for as many machines as you wish Juju to use.

When complete, check the Juju model status to ensure at least two existing machines
are running:

```bash
juju status
```

## Deploy a minimal bundle

As mentioned, we are deploying a minimal installation of **Charmed Kubernetes** in this
guide. The [Kubernetes Core][kubernetes-core] bundle deploys a single unit of `easyrsa`,
`etcd`, and `kubernetes-control-plane` on one machine and a single unit of
`kubernetes-worker` on another.

Deploy `kubernetes-core` to the Juju model as follows:

```bash
juju deploy kubernetes-core --map-machines=existing
```

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The "--map-machines" flag instructs Juju to use existing machines to satisfy placement directives defined in the budnle. Without this, Juju would attempt to provision new machines for this deployment. More information about machine mapping can be found in the <a href="https://juju.is/docs/juju/juju-deploy">Juju deploy</a> documentation.</p>
  </div>
</div>

When complete, monitor the Juju model status until all workloads report *active*:

```bash
juju status
```

## Next Steps

Now that you have a **Charmed Kubernetes** cluster up and running, check out the
[Operations guide][operations] for how to use it!

<!-- LINKS -->

[juju-manual]: https://juju.is/docs/juju/manual
[kubernetes-core]: https://charmhub.io/kubernetes-core
[operations]: /kubernetes/docs/operations

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/install-manual.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
