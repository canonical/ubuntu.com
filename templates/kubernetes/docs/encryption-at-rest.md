---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Encryption at rest"
  description: How to enable encryption-at-rest using Vault
keywords: juju, kubernetes, Charmed Kubernetes, security, encryption, vault
tags: [operating, security]
sidebar: k8smain-sidebar
permalink: encryption-at-rest.html
layout: [base, ubuntu-com]
toc: False
---

**Kubernetes** has the concept of [secrets][] for managing sensitive information
needed by a cluster, such as usernames and passwords, encryption keys, etc.
Secrets can be managed independently of the pod(s) which need them and can be
made available to the pods that require them as needed.

By default, the secret data is stored in plaintext in **etcd**. **Kubernetes**
does support [encryption at rest][] for the data in **etcd**, but the key for
that encryption is stored in plaintext in the config file on the master nodes.
To protect this key at rest, **Charmed Kubernetes** can use
[HashiCorp's Vault][] and [VaultLocker][] to securely generate, share, and
configure the encryption key used by **Kubernetes**.

## Using Encryption-at-Rest with Charmed Kubernetes

To enable encryption-at-rest for **Charmed Kubernetes**, simply deploy the [Vault charm][] (as
well as a database backend for it), and relate it to `kubernetes-control-plane` via
the `vault-kv` relation endpoint.  The easiest way to do this is to deploy **Charmed Kubernetes**
with the following overlay:

```yaml
applications:
  vault:
    charm: cs:vault
    num_units: 1
  percona-cluster:
    charm: cs:percona-cluster
    num_units: 1
relations:
  - ['vault', 'percona-cluster']
  - ['vault:secrets', 'kubernetes-control-plane:vault-kv']
```

To deploy **Charmed Kubernetes** with this overlay - [download it][cdk-vault-overlay]), save it as, e.g.,
`cdk-vault-overlay.yaml`, and deploy with:

```
juju deploy charmed-kubernetes --overlay cdk-vault-overlay.yaml
```

Once **Vault** comes up (and any time it is rebooted), you will need to [unseal][]
it.

Charmed Kubernetes will then automatically enable encryption for the secrets data stored in
**etcd**.

## Known Issues

This does not work on **LXD** at this time, due to security limitations
preventing charms from acquiring and managing the block devices and file
systems needed to implement this.  In the future, support for KMS, or
encryption-as-a-service, will remove this restriction.  In the meantime,
**LXD** deployments can make use of encryption at the level of the **LXD**
storage pool, or even full-disk-encryption on the host machine.

[cdk-vault-overlay]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/cdk-vault-overlay.yaml
[secrets]: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/
[encryption at rest]: https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/
[HashiCorp's Vault]: https://www.vaultproject.io/
[VaultLocker]: https://github.com/openstack-charmers/vaultlocker
[Vault charm]: https://charmhub.io/vault
[unseal]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/victoria/app-vault.html#initialize-and-unseal-vault

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/encryption-at-rest.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

