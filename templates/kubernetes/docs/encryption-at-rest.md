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

By default, the secret data is base64-encoded in **etcd**. **Kubernetes**
does support [encryption at rest][] for the data in **etcd**, but the key for
that encryption is stored in plaintext in the config file on the control plane
nodes. To protect this key at rest, **Charmed Kubernetes** can use
[HashiCorp's Vault][] and [VaultLocker][] to securely generate, share, and
configure the encryption key used by **Kubernetes**.

## Using Encryption-at-Rest with Charmed Kubernetes

To enable encryption-at-rest for **Charmed Kubernetes**, simply deploy the [Vault charm][] (as
well as a database backend for it), and relate it to `kubernetes-control-plane` via
the `vault-kv` relation endpoint.

The following overlay file ([download][vault-storage-yaml]) alters
**Charmed Kubernetes** to use **Vault** for encrypted data:

```yaml
applications:
  mysql-innodb-cluster:
    channel: 8.0/stable
    charm: mysql-innodb-cluster
    constraints: cores=2 mem=8G root-disk=64G
    num_units: 3
    options:
      enable-binlogs: true
      innodb-buffer-pool-size: 256M
      max-connections: 2000
      wait-timeout: 3600
  vault:
    channel: 1.7/stable
    charm: vault
    num_units: 1
  vault-mysql-router:
    channel: 8.0/stable
    charm: mysql-router
relations:
- - kubernetes-control-plane:vault-kv
  - vault:secrets
- - mysql-innodb-cluster:db-router
  - vault-mysql-router:db-router
- - vault-mysql-router:shared-db
  - vault:shared-db
```

Save this to a file named `vault-storage-overlay.yaml` and deploy with:

```bash
juju deploy charmed-kubernetes --overlay ./vault-storage-overlay.yaml
```

Once the deployment settles, you will notice that several applications are in a
`blocked` state in **Juju**, with **Vault** indicating that it needs to be initialised
and unsealed. To unseal **Vault**, you can read the
[vault charm documentation](https://opendev.org/openstack/charm-vault/src/branch/master/src/README.md#post-deployment-tasks)  for in-depth instructions (you may also need to [expose][] **Vault**), or you can use
the **Vault** client already on the deployed unit with the following steps:

```bash
juju ssh vault/0
export HISTCONTROL=ignorespace  # enable leading space to suppress command history
export VAULT_ADDR='http://localhost:8200'
vault operator init -key-shares=5 -key-threshold=3  # outputs 5 keys and a root token
 vault operator unseal {key1}
 vault operator unseal {key2}
 vault operator unseal {key3}
 VAULT_TOKEN={root token} vault token create -ttl 10m  # outputs a {charm token} to auth the charm
exit
juju run vault/0 authorize-charm token={charm token}
```

<div class="p-notification--information">
  <div markdown="1" class="p-notification__content">
    <p class="p-notification__message">It is <strong><em>critical </em></strong> that you save all five unseal keys as well as the root token.  If the <strong>Vault</strong> unit is ever rebooted, you will have to repeat the unseal steps (but not the init step) before the CA can become functional again.</p>
  </div>
</div>

Once the deployment settles, **Charmed Kubernetes** will automatically enable
encryption for the secrets data stored in **etcd**.

## Known Issues

This does not work on **LXD** at this time, due to security limitations
preventing charms from acquiring and managing the block devices and file
systems needed to implement this.  In the future, support for KMS, or
encryption-as-a-service, will remove this restriction.  In the meantime,
**LXD** deployments can make use of encryption at the level of the **LXD**
storage pool, or even full-disk-encryption on the host machine.

<!-- LINKS -->
[vault-storage-yaml]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/vault-storage-overlay.yaml
[secrets]: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/
[encryption at rest]: https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/
[HashiCorp's Vault]: https://www.vaultproject.io/
[VaultLocker]: https://github.com/openstack-charmers/vaultlocker
[Vault charm]: https://charmhub.io/vault
[expose]: https://juju.is/docs/juju/expose-a-deployed-application

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/encryption-at-rest.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

