---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Kubernetes Packages"
  description: How to manage and refresh snaps or Debian packages
keywords: snaps, debs
tags: [reference]
sidebar: k8smain-sidebar
permalink: packages.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** makes extensive use of [snaps], both for Kubernetes
services and for client-side tools to operate a cluster. This page details some
of the Kubernetes-related snaps available and how they are used.

## Client-side Snaps

The following client tools are available. Note that it is not _required_ that
you use the Snap version of these tools to work with Charmed Kubernetes, they
are just provided as a maintained and tested way of keeping up to date.

`kubectl` - client for running commands on a Kubernetes cluster. [Docs][kubectl] &#124; [Snap][kubectl-snap]

`kubeadm` - a tool for bootstrapping a Kubernetes cluster. [Docs][kubeadm] &#124; [Snap][kubeadm-snap]

These are installed in the same way. For example:

```bash
sudo snap install kubectl --classic
```

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you install tools such as **kubectl** from both the snap
    store and the apt archive they will be in different locations. Depending on your
    environment the snap may be resolved before the Debian installed package.</p>
  </div>
</div>


## Server Snaps

When installing **Charmed Kubernetes**, various necessary services are actually
installed from snap packages. The installation and management of these snaps is
undertaken by the charms; there is no need for a user to interact with the
snaps directly. The details here are provided for information only.


| Snap | Type | Store page |
|------|------|------------|
| kube-apiserver | strict | <https://snapcraft.io/kube-apiserver> |
| kube-controller-manager | strict  | <https://snapcraft.io/kube-controller-manager>  |
| kube-proxy | classic | <https://snapcraft.io/kube-proxy> |
| kube-scheduler  |  strict  | <https://snapcraft.io/kube-scheduler>  |
| kubelet  | classic  | <https://snapcraft.io/kubelet>  |

### Example: kube-apiserver

We will use kube-apiserver as an example. The other services generally work the
same way.

Install with `snap install`:

```
sudo snap install kube-apiserver
```

This creates a `systemd` service named `snap.kube-apiserver.daemon`. Initially,
it will be in an error state because it's missing important configuration:

Running:

```bash
systemctl status snap.kube-apiserver.daemon
```

... will return status similar to:

```no-highlight
● snap.kube-apiserver.daemon.service - Service for snap application kube-apiserver.daemon
   Loaded: loaded (/etc/systemd/system/snap.kube-apiserver.daemon.service; enabled; vendor preset: enabled)
   Active: inactive (dead) (Result: exit-code) since Fri 2020-09-01 15:54:39 UTC; 11s ago
   ...
```

The snap can be configured using `snap set`:

```bash
sudo snap set kube-apiserver args="
--etcd-servers=https://172.31.9.254:2379
--etcd-certfile=/root/certs/client.crt
--etcd-keyfile=/root/certs/client.key
--etcd-cafile=/root/certs/ca.crt
--service-cluster-ip-range=10.123.123.0/24
--cert-dir=/root/certs
"
```

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Any files used by the service, such as certificate files, must be
    placed within the /root/ directory to be visible to the service. This
    limitation allows some of the services to run in a strict confinement
    mode that offers better isolation and security.</p>
  </div>
</div>


After configuring, restart the service and you should see it running:

```bash
sudo snap restart kube-apiserver
systemctl status snap.kube-apiserver.daemon
```
```no-highlight
● snap.kube-apiserver.daemon.service - Service for snap application kube-apiserver.daemon
   Loaded: loaded (/etc/systemd/system/snap.kube-apiserver.daemon.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2017-09-01 16:02:33 UTC; 6s ago
   ...
```

## Going further

Want to know more? Here are a couple good things to know:

If you're confused about what `snap set ...` is actually doing, you can read
the snap configure hooks in `/snap/<snap-name>/current/meta/hooks/configure` to
see how they work.

The configure hook creates an args file at `/var/snap/<snap-name>/current/args`.
This contains the actual arguments that get passed to the service by the snap:

```
--cert-dir "/root/certs"
--etcd-cafile "/root/certs/ca.crt"
--etcd-certfile "/root/certs/client.crt"
--etcd-keyfile "/root/certs/client.key"
--etcd-servers "https://172.31.9.254:2379"
--service-cluster-ip-range "10.123.123.0/24"
```

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">While you can technically bypass <code>snap set</code> and edit the args file
    directly, it's best not to do so. The next time the configure hook runs, it
    will obliterate your changes. This can occur not only from a call to
    <code>snap set</code> but also during a background refresh of the snap.</p>
  </div>
</div>


The source code for the snaps can be found here:

<https://launchpad.net/snap-kubectl>

<https://launchpad.net/snap-kubeadm>

<https://launchpad.net/snap-kube-apiserver>

<https://launchpad.net/snap-kube-controller-manager>

<https://launchpad.net/snap-kube-scheduler>

<https://launchpad.net/snap-kubelet>

<https://launchpad.net/snap-kube-proxy>


<!-- LINKS -->

[snaps]: https://snapcraft.io/docs
[kubectl]: https://kubernetes.io/docs/reference/kubectl/overview/
[kubeadm]: https://kubernetes.io/docs/reference/setup-tools/kubeadm/
[kubefed]: https://github.com/kubernetes-sigs/kubefed
[kubeadm-snap]: https://snapcraft.io/kubeadm
[kubefed-snap]: https://snapcraft.io/kubefed
[kubectl-snap]: https://snapcraft.io/kubectl

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/packages.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
