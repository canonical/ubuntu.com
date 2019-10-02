---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Using Vault as a CA"
  description: How to replace EasyRSA with Vault for increased security
keywords: juju, kubernetes, security, encryption, vault
tags: [operating, security]
sidebar: k8smain-sidebar
permalink: using-vault.html
layout: [base, ubuntu-com]
toc: True
---

As mentioned in the [Certificates and trust reference][certs-doc] documentation,
[HashiCorp's Vault][vault] can be used to provide either a root or intermediate CA. It can
also be deployed HA, as well as provide a secure secrets store which can be used to enable
[encryption-at-rest for **Charmed Kubernetes**][encryption-doc].

Vault does require an additional database to store its data and (depending on
configuration) some manual steps will be required after deployment or any reboot so
that secrets, such as certificates and signing keys, can be accessed.

## Deploying Charmed Kubernetes with Vault as a root CA

When deploying **Charmed Kubernetes** manually via the
[published Juju bundle][cdk-bundle], it is possible to make use of an overlay
file to change the composition and configuration of the cluster.

The following overlay file ([download][vault-pki-yaml]) alters
**Charmed Kubernetes** to use **Vault** instead of EasyRSA:

```yaml
applications:
  easyrsa: null
  vault:
    charm: cs:~openstack-charmers-next/vault
    num_units: 1
    options:
      # this makes Vault act as a self-signed root CA
      auto-generate-root-ca-cert: true
  percona-cluster:
    charm: cs:percona-cluster
    num_units: 1
relations:
- - kubernetes-master:certificates
  - vault:certificates
- - etcd:certificates
  - vault:certificates
- - kubernetes-worker:certificates
  - vault:certificates
- - kubeapi-load-balancer:certificates
  - vault:certificates
- - vault:shared-db
  - percona-cluster:shared-db
```

Save this to a file named `vault-pki-overlay.yaml` and deploy with:

```bash
juju deploy charmed-kubernetes --overlay ./vault-pki-overlay.yaml
```

Once the deployment settles, you will notice that several applications are in a
`blocked` state in **Juju**, with **Vault** indicating that it needs to be initialised
and unsealed. To unseal **Vault**, you can read [the guide][vault-guide-unseal] for
in-depth instructions (you may also need to [expose][] **Vault**), or you can use
the **Vault** client already on the deployed unit with the following steps:

```bash
juju ssh vault/0
export HISTCONTROL=ignorespace  # enable leading space to suppress command history
export VAULT_ADDR='http://localhost:8200'
vault operator init -key-shares=5 -key-threshold=3  # this will give you 5 keys and a root token
  vault operator unseal {key1}
  vault operator unseal {key2}
  vault operator unseal {key3}
  VAULT_TOKEN={root token} vault token create -ttl 10m  # this will give you a token to auth the charm
exit
juju run-action vault/0 authorize-charm token={charm token}
```

<div class="p-notification--information">
  <p markdown="1" class="p-notification__response">
    It is <strong><em>critical </em></strong> that you save all five unseal keys as well as the root
    token.  If the <strong>Vault</strong> unit is ever rebooted, you will have to repeat the
    unseal steps (but not the init step) before the CA can become functional
    again.
  </p>
</div>

## Transitioning an existing cluster from EasyRSA to Vault

An existing **Charmed Kubernetes** deployment which is using EasyRSA can
be transitioned to use **Vault** as a CA.

<div class="p-notification--information">
  <p markdown="1" class="p-notification__response">
    During the transition, any pods that use ServiceAccounts to talk to the
    Kubernetes API may need to be restarted. Addons that are deployed and
    managed by **Charmed Kubernetes** will be restarted automatically. If you
    have deployed anything into Kubernetes that talks to the Kubernetes API, it
    is recommended that you restart them after the transition by using the
    `kubectl rollout restart` command.
  </p>
</div>

Deploy **Vault** and Percona Cluster:

```bash
juju deploy cs:percona-cluster
juju deploy cs:~openstack-charmers-next/vault
juju config vault auto-generate-root-ca-cert=true
juju add-relation vault:shared-db percona-cluster:shared-db
```

Unseal **Vault** as described earlier in this document.

Relate **Vault** to etcd:

```bash
juju add-relation vault:certificates etcd:certificates
```

Wait a few minutes for the cluster to settle, with all units showing as active
and idle. Then relate **Vault** to Kubernetes:

```bash
juju add-relation vault:certificates kubeapi-load-balancer:certificates
juju add-relation vault:certificates kubernetes-master:certificates
juju add-relation vault:certificates kubernetes-worker:certificates
```

Wait a few minutes for the cluster to settle, and ensure that all services and
workloads are functioning as expected.

After the transition, you must remove **EasyRSA** to prevent it from
conflicting with **Vault**:

```bash
juju remove-application easyrsa
```

You will need to re-download the `kubectl` config file,
since it contains the certificate info for connecting to the cluster:

```bash
juju scp kubernetes-master/0:config ~/.kube/config
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Caution:</span>
If you have multiple clusters you will need to manage the config file rather than just
replacing it. See the <a href="https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/">
Kubernetes documentation</a> for more information on managing multiple clusters.
  </p>
</div>

## Using Vault as an intermediary CA

If you don't wish **Vault** to act as a self-signed root CA, you can remove the
`auto-generate-root-ca-cert: true` option from the overlay and follow [these
instructions][vault-guide-csr] to generate a
[Certificate Signing Request (CSR)][csr], have it signed by a trusted root CA,
and upload it back to **Vault**.

## Using Vault in Auto-Unseal mode

The **Vault** charm supports the ability to store and manage the unseal keys and
root token using **Juju** [leadership data][leadership]. Note that this means that
the unseal keys can be accessed at any time from the machine that **Vault** is
running on, significantly reducing the security of **Vault**, particularly with
respect to serving as a secure secrets store. If you are comfortable with this
reduction in security and don't want to have to deal with the manual steps
involved in managing the unseal keys and root token, you can add the following
to the `options` section of `vault` in the overlay above:

```yaml
    totally-unsecure-auto-unlock: true
```

## Using Vault with HA

**Vault** also supports HA mode by adding a second unit and a relation to Etcd.
To deploy with this configuration, you can use the following overlay
([download][vault-pki-ha-yaml]) instead with the instructions from above to
deploy, init, and unseal Vault:

```yaml
applications:
  easyrsa: null
  vault:
    charm: cs:~openstack-charmers-next/vault
    num_units: 2
    options:
      auto-generate-root-ca-cert: true
  percona-cluster:
    charm: cs:percona-cluster
    num_units: 1
relations:
- - kubernetes-master:certificates
  - vault:certificates
- - etcd:certificates
  - vault:certificates
- - kubernetes-worker:certificates
  - vault:certificates
- - vault:shared-db
  - percona-cluster:shared-db
- - vault:etcd
  - etcd:db
```

<div class="p-notification--information">
  <p markdown="1" class="p-notification__response">
    You will only need to perform the `vault init` step once, but you will
    need to unseal each unit individually.
  </p>
</div>


<!-- LINKS -->
[vault-pki-yaml]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/vault-pki-overlay.yaml
[vault-pki-ha-yaml]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/vault-pki-ha-overlay.yaml
[certs-doc]: /kubernetes/docs/certs-and-trust
[encryption-doc]: /kubernetes/docs/encryption-at-rest
[vault]: https://www.vaultproject.io
[expose]: https://docs.jujucharms.com/stable/en/charms-deploying#exposing-deployed-applications
[hacluster]: https://jujucharms.com/hacluster/
[vault-guide-csr]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/latest/app-certificate-management.html
[vault-guide-unseal]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/latest/app-vault.html#initialize-and-unseal-vault
[csr]: https://en.wikipedia.org/wiki/Certificate_signing_request
[leadership]: https://docs.jujucharms.com/stable/en/authors-charm-leadership
[cdk-bundle]: https://jujucharms.com/charmed-kubernetes

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/using-vault.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
