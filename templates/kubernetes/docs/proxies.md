---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Using proxies with Charmed Kubernetes"
  description: Set up Charmed Kubernetes to use proxies.
keywords: oflline, proxy, configuration
tags: [configure]
sidebar: k8smain-sidebar
permalink: proxies.html
layout: [base, ubuntu-com]
toc: False
---

There are many occasions, particularly in production environments, when
your Kubernetes cluster does not have direct, unfettered access to the internet.
This can cause complications when installing, updating or modifying your cluster.

This is usually worked around by setting a proxy to point at a resource which
handles requests to the desired internet resource - a proxy. Charmed Kubernetes
relies entirely on Juju for its proxy settings - there are no special
configurations required for individual services or charms.

A Juju model can define proxies for the resources Charmed Kubernetes will need:

- A snap proxy, for installing software from snap packages ([see below](#snap-store-proxy))
- An apt proxy, for software installed via apt packages.
- A Juju proxy, which exposes proxy settings to Juju itself, and to deployed
   charms.

Note that Juju can also set other proxy types, but these are not relevant to
Charmed Kubernetes.

## Setting proxies for the Juju model

Proxy settings are made by configuring the Juju model they are to apply to.
For example, to set the snap-http(s)-proxy for the model:

```bash
juju model-config snap-http-proxy=http://squid.local:3128
juju model-config snap-https-proxy=http://squid.local:3128
```

For some services, e.g. `apt`, you may wish to also configure the `no-proxy`
setting - for example where you have set up and configured a local or
otherwise accessible source for packages:

```bash
juju model-config apt-no-proxy=localhost,127.0.0.1,ppa.local,10.24.2.0/24
```

As demonstrated here, it is possible to indicate several resources by
supplying a comma-delimited list. It is also possible to select a range of
network addresses using a CIDR.

You can see the configuration settings for the current model by running:

```bash
juju model-config
```

The relevant options for setting proxies for Charmed Kubernetes are:

- apt-http-proxy
- apt-https-proxy
- apt-no-proxy
- juju-http-proxy
- juju-https-proxy
- juju-no-proxy
- snap-http-proxy
- snap-https-proxy

For more extensive documentation on configuring proxies with Juju, please
refer to the [Juju proxy documentation][]

## Snap Store Proxy

The majority of charms, including all the core Charmed Kubernetes charms, rely on
[snap][] packages to deliver applications. Snaps are packages for desktop, cloud and
IoT that are easy to install, secure, cross‐platform and dependency‐free.

The list of snaps required by Charmed Kubernetes is detailed in the "components"
page for each release. For example, for 1.23, the
[snaps are listed here][1.23-components].

If your installation needs to proxy the connection to the Snap Store for any reason,
the recommended solution is to use the [Snap Store Proxy][] software. This can
also be configured for offline use (see the
[Charmed Kubernetes offline documentation][offline]).

<!-- LINKS -->

[Juju proxy documentation]: https://juju.is/docs/juju/working-offline
[1.23-components]: 1.23/components#snaps
[offline]: install-offline
[snap]: https://snapcraft.io
[Snap Store Proxy]: https://docs.ubuntu.com/snap-store-proxy/en/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/proxies.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
