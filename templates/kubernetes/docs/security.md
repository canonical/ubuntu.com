---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Security in Charmed Kubernetes"
  description: Using LDAP authentication via Keystone
keywords: LDAP, Keystone, authorisation, AIM, SSH, Juju, users
tags: [operating]
sidebar: k8smain-sidebar
permalink: security.html
layout: [base, ubuntu-com]
toc: False
---

This page provides an overview of various aspects of security to be considered
when operating a **Charmed Kubernetes** cluster. To consider security properly,
this means not just aspects of Kubernetes itself, but also how and where
it is installed and operated.

A lot of important aspects of security therefore lie outside the direct scope
of **Charmed Kubernetes**, but links for further reading
are provided.


## Juju

Having admin access via the Juju client to the model where the components
of Charmed Kubernetes are deployed effectively allows a user to do
anything with the cluster, as they can access secrets, change configurations
and get shell access to any of the machines running the cluster.

Of course, this level of access is also useful and occasionally required to
operate the cluster, perform upgrades, etc. However, many lesser
operations need not be carried out by the admin user of the cluster, and in the
case of multiple clusters on multiple models, admin permissions can be devolved
on a per-model basis.

Juju supports a system of user management which also incorporates three levels
of permissions - read, write and admin. Users without 'admin' rights cannot
make an SSH connection to the machines on the cluster, but with write access
can perform many of the actions required to operate and maintain a cluster.

For more information on creating users, assigning access levels and what access
these levels bestow, please check the following pages of Juju documentation:

-   [Juju user types][juju-user-types] - describes the different types of users
    supported by Juju and their abilities.
-   [Working with multiple users][juju-users] - An explanation of how to share control of
    a cluster with multiple Juju users.
-   [Machine auth][] - describes how SSH keys are stored and used by Juju.


## Cloud security

As well as Juju admin users, anyone with credentials to the cloud where
Charmed Kubernetes is deployed may also have access to your cluster. Describing
the security mechanisms of these clouds is out of the scope of this
documentation, but you may find the following links useful.

-   Amazon Web Services -	<https://aws.amazon.com/security/>
-   Google Cloud Platform	- <https://cloud.google.com/security/>
-   Metal As A Service(MAAS) -  <https://maas.io/docs/snap/3.0/ui/hardening-your-maas-installation>
-   Microsoft Azure	- <https://docs.microsoft.com/en-us/azure/security/azure-security>
-   VMWare VSphere	- <https://www.vmware.com/security/hardening-guides.html>

## Kubernetes Security

The Kubernetes cluster deployed by **Charmed Kubernetes** can be secured using
any of the methods and options described by the upstream
[Kubernetes Security Documentation][].


### Common tasks

-   [Setting up vault as a CA][k8s-vault]


### Additional security-related documentation

-   [Configuring authorisation and authentication][k8s-auth]
-   [Using AWS IAM for auth][k8s-aws-iam]
-   [Authentication with LDAP and Keystone][k8s-ldap]
-   [Overview of certificates and trust in Charmed Kubernetes][k8s-trust]
-   [Using the OPA Gatekeeper charm][k8s-gatekeeper]

## CIS Benchmark

The **Center for Internet Security (CIS)** maintains a
[Kubernetes benchmark][cis-benchmark] that is helpful to ensure clusters are
deployed in accordance with security best practices. **Charmed Kubernetes**
supports the `kube-bench` utility to report how well a cluster complies
with a benchmark.

To test your cluster, please see the
[CIS compliance][] section of the Charmed Kubernetes docs.


<!-- LINKS -->

[cis-benchmark]: https://www.cisecurity.org/benchmark/kubernetes/
[Kubernetes Security documentation]: https://kubernetes.io/docs/concepts/security/overview/
[Machine auth]: https://juju.is/docs/olm/accessing-individual-machines-with-ssh
[juju-users]: https://juju.is/docs/olm/working-with-multiple-users
[juju-user-types]: https://juju.is/docs/user-types-and-abilities
[CIS compliance]: /kubernetes/docs/cis-compliance
[k8s-auth]: /kubernetes/docs/auth
[k8s-aws-iam]: /kubernetes/docs/aws-iam-auth
[k8s-ldap]: /kubernetes/docs/ldap
[k8s-trust]: /kubernetes/docs/certs-and-trust
[k8s-vault]: /kubernetes/docs/using-vault
[k8s-gatekeeper]: /kubernetes/docs/gatekeeper