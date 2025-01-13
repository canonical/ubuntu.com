---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Integrate Charmed Kubernetes with your cloud"
  description: How to use cloud integrators
keywords: Cloud, cluster, storage
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-clouds.html
layout: [base, ubuntu-com]
toc: False
---

Charmed Kubernetes is designed to be cloud-agnostic. It can be deployed on any cloud or substrate supported by Juju. However, there are specific features of clouds (e.g. storage and load-balancers) which can more effectively be integrated for Charmed Kubernetes. This integration is provided by a series of substrate specific charms. Their use is described in the pages linked below:

- [AWS](/kubernetes/docs/aws-integration)
- [Azure](/kubernetes/docs/azure-integration)
- [GCP](/kubernetes/docs/gcp-integration)
- [OpenStack](/kubernetes/docs/openstack-integration)
- [vSphere](/kubernetes/docs/vsphere-integration)
- [LXD](/kubernetes/docs/install-local)
- [Equinix Metal](/kubernetes/docs/equinix)


<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-clouds.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
