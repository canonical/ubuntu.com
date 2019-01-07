---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Using Vault as a CA"
  description: How to replace EasyRSA with Vault for increased security
keywords: juju, kubernetes, cdk, security, encryption, vault
tags: [operating, security]
sidebar: k8smain-sidebar
permalink: using-vault.html
layout: [base, ubuntu-com]
toc: True
---

As mentioned in the [Certificates and trust reference][certs-doc] documentation,
[HashiCorp's Vault][vault] can be used to provide either a root or intermediate CA. It can
also be deployed HA, as well as provide a secure secrets store which can be used to enable
[encryption-at-rest for **CDK**][encryption-doc].

Vault does require an additional database to store its data and (depending on
configuration) some manual steps will be required after deployment or any reboot so
that secrets, such as certificates and signing keys, can be accessed.

## Deploying CDK with Vault as a root CA

When deploying **CDK** manually via the [published Juju bundle][cdk-bundle], it is
possible to make use of an overlay file to change the composition and  configuration of
**CDK**

The following overlay file ([download][k8s-vault-yaml]) alters **CDK** to use **Vault**
instead of EasyRSA:

```yaml
applications:
  easyrsa:
    # it's currently not possible to remove an application in an overlay
    num_units: 0
  vault:
    charm: cs:~openstack-charmers-next/vault
    num_units: 1
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
```

Save this to a file named `k8s-vault.yaml` and deploy with:

```bash
juju deploy cs:canonical-kubernetes --overlay ./k8s-vault.yaml
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

Note that it is _critical_ that you save all five unseal keys as well as the
root token.  If the **Vault** unit is ever rebooted, you will have to repeat the
unseal steps (but not the init step) before the CA can become functional again.

## Using Vault as an intermediary CA

If you don't wish **Vault** to act as a self-signed root CA, you can remove the
`auto-generate-root-ca-cert: true` option from the overlay and follow [these
instructions][vault-guide-csr] to generate a
[Certificate Signing Request (CSR)][csr], have it signed by a trusted root CA, and upload it
back to **Vault**.

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

To enable HA for **Vault**, you will need to add [hacluster][], as well as a
relation between Vault and **etcd**. You may also need **EasyRSA** to provide a
certificate for **etcd** before Vault can be brought up, although it may be
possible to first bring up **Vault** in non-HA mode and then transition to HA.

More details can be found [in the guide][vault-guide-ha].


<!-- LINKS -->
[k8s-vault-yaml]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/k8s-vault.yaml
[certs-doc]: /kubernetes/docs/certs-and-trust
[encryption-doc]: /kubernetes/docs/encryption-at-rest
[vault]: https://www.vaultproject.io
[expose]: https://docs.jujucharms.com/stable/en/charms-exposing
[hacluster]: https://jujucharms.com/stable/en/hacluster
[vault-guide-csr]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/latest/app-certificate-management.html
[vault-guide-unseal]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/latest/app-vault.html#initialize-and-unseal-vault
[vault-guide-ha]: https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/latest/app-vault.html#enabling-ha
[csr]: https://en.wikipedia.org/wiki/Certificate_signing_request
[leadership]: https://docs.jujucharms.com/stable/en/authors-charm-leadership
[cdk-bundle]: https://jujucharms.com/canonical-kubernetes
