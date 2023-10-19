---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
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

The term 'security' covers a great many subtopics related to running a Kubernetes cluster, ranging from aspects of the workloads to the underlying OS. Please see the [overview of security](/kubernetes/docs/security) page for a better understanding of the approach to securing your cluster.

The guides in this section contain How tos for pursuing specific security goals: 

- [Authorisation and authentication](/kubernetes/docs/auth)
- [Use Vault as a CA](/kubernetes/docs/using-vault)
- [Authenticate with LDAP](/kubernetes/docs/ldap)
- [Use the OPA Gatekeeper](/kubernetes/docs/gatekeeper)
- [Use encryption-at-rest](/kubernetes/docs/encryption-at-rest)

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-security.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>