---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Upgrade notes"
  description: How to deal with specific, special circumstances you may encounter when upgrading between versions of Kubernetes.
---

This page is intended to deal with specific, special circumstances you may encounter when upgrading between versions of the **Charmed Distribution of Kubernetes<sup>&reg;</sup>.** The notes are organised according to the upgrade path below, but also be aware that any upgrade that spans more than one minor version may need to beware of notes in any of the intervening steps.

## Upgrading from 1.9.x to 1.10.x

This upgrade includes a transistion between major versions of **etcd**, from 2.3 to 3.x. Between these releases, **etcd** changed the way it accesses storage, so it is necessary to reconfigure this. There is more detailed information on the change and the upgrade proceedure in the [upstream **etcd** documentation][etcd-upgrade].

!!! Warning: This upgrade **must** be completed before attempting to upgrade the running cluster.

To make this upgrade more convenient for users of **CDK**, a script has been prepared to manage the transition. The script can be [examined here][script].

To use the script to update **etcd**, follow these steps:

### 1. Download the script with the command:

```bash
curl -O https://raw.githubusercontent.com/juju-solutions/cdk-etcd-2to3/master/migrate
```

### 2. Make the script executable:

```bash
chmod +x migrate
```

### 3. Execute the script:

```
./migrate
```

### 4. etcd OutputSed

The script should update **etcd** and you will see output similar to the following:

```no-highlight
· Waiting for etcd units to be active and idle...
· Acquiring configured version of etcd...
· Upgrading etcd to version 3.0/stable from 2.3/stable.
· Waiting for etcd upgrade to 3.0/stable............................................................
· Waiting for etcd units to be active and idle....................................................
· Waiting for etcd cluster convergence...
· Stopping all Kubernetes api servers...
· Waiting for etcd cluster convergence...
· Stopping etcd...
· Migrating etcd/0...
· Migrating etcd/1...
· Migrating etcd/2...
· Starting etcd...
· Configuring storage-backend to etcd3...
· Waiting for all Kubernetes api servers to restart.......
· Done.
```

You can now proceed with the rest of the upgrade.

<!--LINKS-->

[etcd-upgrade]: https://github.com/etcd-io/etcd/blob/master/Documentation/upgrades/upgrade_3_0.md
[script]: https://raw.githubusercontent.com/juju-solutions/cdk-etcd-2to3/master/migrate
