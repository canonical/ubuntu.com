---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "kata charm"
  description: Kubernetes-master Charm reference
keywords: kubernetes-master, charm, config
tags: [reference]
sidebar: k8smain-sidebar
permalink: charm-kata.html
layout: [base, ubuntu-com]
toc: False
---

This subordinate charm deploys the [Kata](https://katacontainers.io/)
untrusted container runtime within a running Juju charm model.  It is
an open source community working to build a secure container runtime with
lightweight virtual machines that feel and perform like containers, but
provide stronger workload isolation using hardware virtualization technology
as a second layer of defense.

## States

The following states are set by this subordinate:

* `endpoint.{relation name}.available`

  This state is set when Kata is available for use.


## Using the Kata subordinate charm

The Kata subordinate charm is to be used with a principal charm and a
container runtime subordinate.  To use, we deploy the Kata charm and
then relate to a principal and a subordinate container runtime.

For example:

```
juju deploy cs:~containers/kata
juju add-relation kata kubernetes-worker
juju add-relation kata:untrusted containerd:untrusted
```

## Scale out Usage

This charm will automatically scale out with the
principal charm.


## Containerd links

  - The [Kata Containers homepage](https://katacontainers.io/)
