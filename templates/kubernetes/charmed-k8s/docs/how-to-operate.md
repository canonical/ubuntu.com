---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Installing Charmed Kubernetes"
  description: installing to different substrates
keywords: operate, logging , monitoring, storage, backups
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-operate.html
layout: [base, ubuntu-com]
toc: False
---

We don't desert our users on day zero - while this documentation can never be a
complete guide to the general operation of a Kubernetes cluster, we can provide
guides for many of the common activities and functions of a Charmed Kubernetes
cluster. 

These guides demonstrate the common tasks any user is likely to need:

- [Basic operations](/kubernetes/charmed-k8s/docs/operations)
- [Configure ingress](/kubernetes/charmed-k8s/docs/ingress)
- [Add storage](/kubernetes/charmed-k8s/docs/storage)
- [Scale your cluster](/kubernetes/charmed-k8s/docs/scaling)
- [Make an etcd backup](/kubernetes/charmed-k8s/docs/backups)
- [Upgrade to a new version](/kubernetes/charmed-k8s/docs/upgrading)
- [Decommission a cluster](/kubernetes/charmed-k8s/docs/decommissioning)
- [Logging](/kubernetes/charmed-k8s/docs/logging)
- [Perform audit Logging](/kubernetes/charmed-k8s/docs/audit-logging)

There are additional services supported by the Charmed Kubernetes team, which
can be added to your cluster, or further configuration made to the default
setup which are covered in these guides:

- [Configure and use CDK addons](/kubernetes/charmed-k8s/docs/cdk-addons)
- [Monitor with COS Lite](/kubernetes/charmed-k8s/docs/how-to-cos-lite)
- [Use K8s Operator Charms](/kubernetes/charmed-k8s/docs/operator-charms)
- [Schedule containers with Volcano](/kubernetes/charmed-k8s/docs/volcano)
- [Use the cluster autoscaler](/kubernetes/charmed-k8s/docs/autoscaler)
- [Validate your cluster with e2e](/kubernetes/charmed-k8s/docs/validation)
- [Use a private Docker Registry](/kubernetes/charmed-k8s/docs/docker-registry)
- [Configuring proxies](/kubernetes/charmed-k8s/docs/proxies)


If you run into trouble, please see the troubleshooting guide:

- [Troubleshooting](/kubernetes/charmed-k8s/docs/troubleshooting)

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-operate.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
