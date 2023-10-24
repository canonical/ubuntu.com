---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Installing Charmed Kubernetes"
  description: installing to different substrates
keywords: install, , metallb, loadbalancer
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-install.html
layout: [base, ubuntu-com]
toc: False
---

In addition to the easy to follow [tutorial](/kubernetes/docs/quickstart) for
Charmed Kubernetes, additional guides are available to take you through the
installation steps for a number of different substrates. The 'Cloud' install
page covers many different scenarios with Juju-supported clouds.

- [Install on a cloud](/kubernetes/docs/install-manual)
- [Install locally with LXD](/kubernetes/docs/install-local)
- [Install on Equinix](/kubernetes/docs/equinix)

There are also two 'special case' scenarios we provide guidance for:

- [Installing offline, or in a restricted environment](/kubernetes/docs/install-offline)
- [Installing for NVIDIA DGX](/kubernetes/docs/nvidia-dgx)

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-install.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>