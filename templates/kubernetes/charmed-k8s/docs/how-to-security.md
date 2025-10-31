---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Securing Charmed Kubernetes"
  description: security related topics
keywords: operate, logging , monitoring, storage, backups
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-security.html
layout: [base, ubuntu-com]
toc: False
---

The term 'security' covers a great many subtopics related to running a Kubernetes cluster, ranging from aspects of the workloads to the underlying OS. Please see the [overview of security](/kubernetes/charmed-k8s/docs/security) page for a better understanding of the approach to securing your cluster.

The guides in this section contain How tos for pursuing specific security goals:

- [Authorisation and authentication](/kubernetes/charmed-k8s/docs/auth)
- [Use Vault as a CA](/kubernetes/charmed-k8s/docs/using-vault)
- [Authenticate with LDAP](/kubernetes/charmed-k8s/docs/ldap)
- [Use the OPA Gatekeeper](/kubernetes/charmed-k8s/docs/gatekeeper)
- [Use encryption-at-rest](/kubernetes/charmed-k8s/docs/encryption-at-rest)

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-security.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://kubernetes.slack.com/archives/CG1V2CAMB"> public Slack  channel</a>.</p>
  </div>
</div>
