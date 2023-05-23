---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Snap coherence"
  description: How to manage Kubernetes snap revisions
keywords: snaps, upgrading
tags: [operating]
sidebar: k8smain-sidebar
permalink: snap-coherence.html
layout: [base, ubuntu-com]
toc: False
---

The core Kubernetes components used in **Charmed Kubernetes** are installed as
snap packages. These include:

- `kube-apiserver`
- `kube-controller-manager`
- `kube-scheduler`
- `kube-proxy`
- `kubelet`
- `kubectl`

By default, the `snapd` daemon periodically checks installed snaps for updates
and will automatically refresh upgradeable packages to ensure the software is
current. If desired, an administrator can setup a
[Snap Store Proxy][store-proxy] to have more control over the snap revisions
used in a deployment.

When configured, snaps used by `kubernetes-control-plane` and `kubernetes-worker`
charms will track revisions defined on the proxy rather than those available
in the upstream Snap Store.

## Deploy a Snap Store Proxy

The [installation guide][store-proxy-install] covers manual installation of a
Snap Store Proxy and is best suited for administrators that wish to use
existing infrastructure for the proxy.

A bundle is also available for those that wish to Juju deploy a full snap
proxy environment. See the [Snap Store Proxy charm][store-proxy-charm]
documentation for details on this method of deployment.

Once deployed, the proxy will need to be registered. This process generates a
snap store id that will be used by **Charmed Kubernetes** charms. Registration
is described in the documentation available at the given links depending on
your chosen method of deployment.

The remainder of this guide assumes a snap store proxy is available in your
environment in a `snap-store-proxy/0` unit.

## Configure charms to use the proxy

Charm applications must be configured to use the proxied snap store. This is
done by acknowledging the signed assertion that allows `snapd` to trust the
proxy, followed by setting the core snap proxy to the new store id:

```bash
curl -s http://<domain>/v2/auth/store/assertions | sudo snap ack /dev/stdin
sudo snap set core proxy.store=<STORE_ID>
```

Relevant commands will be shown in `juju status` output when the proxy is
deployed with the `snap-store-proxy` charm:

```bash
$ juju status snap-store-proxy/0
...
snap-store-proxy/0*  active    idle   11       18.144.52.58    80/tcp  \
  curl -s http://18.144.52.58/v2/auth/store/assertions | sudo snap ack /dev/stdin ; \
  sudo snap set core proxy.store=<STORE_ID>
```

Run the required commands on `kubernetes-control-plane` and `kubernetes-worker` units:

```bash
juju exec --application kubernetes-control-plane \
  'curl -s http://18.144.52.58/v2/auth/store/assertions | sudo snap ack /dev/stdin ; \
  sudo snap set core proxy.store=<STORE_ID>'
juju exec --application kubernetes-worker \
  'curl -s http://18.144.52.58/v2/auth/store/assertions | sudo snap ack /dev/stdin ; \
  sudo snap set core proxy.store=<STORE_ID>'
```

## Override snap revisions

Use `snap-proxy override` to lock a snap channel to a particular revision. For
example:

```bash
$ juju exec --unit snap-store-proxy/0 'sudo snap-proxy override kubectl 1.16/stable=1342'
kubectl 1.16/stable amd64 1342
$ juju exec --unit snap-store-proxy/0 'sudo snap-proxy list-overrides kubectl'
kubectl 1.16/stable amd64 1342 (upstream 1309)
```

Any unit that uses the proxy to install `kubectl 1.16/stable` will now receive
revision 1342, even though the upstream snap store has this channel revision
defined as 1309. Repeat the above process to override channel revisions for
any desired snap.

Every subsequent hook will check for new snap revisions from the snap store
proxy. When updates are available, the relevant snaps will first be refreshed
across all `kubernetes-control-plane` units. If the update is successful, the
`kubernetes-worker` units will then be refreshed.

<!-- LINKS -->

[store-proxy]: https://docs.ubuntu.com/snap-store-proxy/
[store-proxy-install]: https://docs.ubuntu.com/snap-store-proxy/en/install
[store-proxy-charm]: https://github.com/johnsca/charm-snap-store-proxy

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/snap-coherence.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
