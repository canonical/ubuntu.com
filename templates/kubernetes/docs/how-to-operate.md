---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
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

- [Basic operations](/kubernetes/docs/operations)
- [Configure ingress](/kubernetes/docs/ingress)
- [Add storage](/kubernetes/docs/storage)
- [Scale your cluster](/kubernetes/docs/scaling)
- [Make an etcd backup](/kubernetes/docs/backups)
- [Upgrade to a new version](/kubernetes/docs/upgrading)
- [Decommission a cluster](/kubernetes/docs/decommissioning)
- [Logging](/kubernetes/docs/logging)
- [Perform audit Logging](/kubernetes/docs/audit-logging)

There are additional services supported by the Charmed Kubernetes team, which
can be added to your cluster, or further configuration made to the default
setup which are covered in these guides:

- [Configure and use CDK addons](/kubernetes/docs/cdk-addons)
- [Monitor with Grafana/Prometheus](/kubernetes/docs/monitoring)
- [Use K8s Operator Charms](/kubernetes/docs/operator-charms)
- [Schedule containers with Volcano](/kubernetes/docs/volcano)
- [Use the cluster autoscaler](/kubernetes/docs/autoscaler)
- [Validate your cluster with e2e](/kubernetes/docs/validation)
- [Use a private Docker Registry](/kubernetes/docs/docker-registry)
- [Configuring proxies](/kubernetes/docs/proxies)


If you run into trouble, please see the troubleshooting guide:

- [Troubleshooting](/kubernetes/docs/troubleshooting)

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-operate.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>