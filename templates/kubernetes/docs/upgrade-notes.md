---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Upgrade notes"
  description: How to deal with specific, special circumstances you may encounter when upgrading between versions of Kubernetes.
keywords: juju, upgrading, track, version
tags: [operating]
sidebar: k8smain-sidebar
permalink: upgrade-notes.html
layout: [base, ubuntu-com]
toc: False
---

This page is intended to deal with specific, special circumstances you may
encounter when upgrading between versions of **Charmed Kubernetes**.
The notes are organised according to the upgrade path below, but also be aware that any
upgrade that spans more than one minor version may need to beware of notes in
any of the intervening steps.

## Upgrades to all versions deployed to Juju's `localhost` LXD based cloud

There is a known issue ([https://bugs.launchpad.net/juju/+bug/1904619](https://bugs.launchpad.net/juju/+bug/1904619))
with container profiles not surviving an upgrade in clouds running on LXD. If your container-based applications fail to work properly after an upgrade, please see this [topic on the troubleshooting page](/kubernetes/docs/troubleshooting#charms-deployed-to-lxd-containers-fail-after-upgradereboot)

<a  id="1.24"> </a>

## Upgrading to 1.24

There are several important changes to 1.24 that will effect all users:

 - Charms have migrated to the [Charmhub.io](https://charmhub.io) store.
 - Control-plane units will switch to a new charm named
   `kubernetes-control-plane`.The application in the juju model and all
   relations to it will remain under the same name `kubernetes-master`, only the
   charm supporting the application will switch. See [inclusive-naming] for an
   explanation about this.

Due to these and other changes, it is recommended to follow the specific upgrade
procedure described in the [upgrading to 1.24 docs](/kubernetes/docs/1.24/upgrading).

### ceph-storage relation deprecated

The `kubernetes-control-plane:ceph-storage` relation has been deprecated. After
upgrading the kubernetes-control-plane charm, the charm may enter `blocked`
status with the message:
`ceph-storage relation deprecated, use ceph-client instead`.

If you see this message, you can resolve it by removing the ceph-storage
relation:

```
juju remove-relation kubernetes-control-plane:ceph-storage ceph-mon
```

<a  id="1.19"> </a>

## Upgrading to 1.19

New in 1.19, master units rely on Kubernetes secrets for authentication. Entries
in the previously used "basic_auth.csv" and "known_tokens.csv" will be migrated to
secrets and new kubeconfig files will be created during the upgrade. Administrators
should update any existing kubeconfig files that are used outside of the cluster.

There is a [known issue](https://bugs.launchpad.net/charm-etcd/+bug/1913227)
with etcd 3.2 and Kubernetes 1.19. If you are still running etcd 3.2, upgrade
to etcd 3.4 prior to upgrading Kubernetes.

As of Kubernetes 1.19, kube-proxy's userspace proxier no longer works. Before you
upgrade, check the proxy-extra-args configs to make sure that the userspace proxy
mode is not being used in your cluster:

```bash
juju config kubernetes-master proxy-extra-args
juju config kubernetes-worker proxy-extra-args
```

If you see `proxy-mode=userspace` in the charm configs, remove it, then proceed
with the upgrade.

Please follow the [upgrade instructions for 1.19](/kubernetes/docs/1.19/upgrading).


<a  id="1.18"> </a>

## Upgrading to 1.18

### CDK Addons

As stated in the release notes, from 1.18, the `cluster-monitoring` addons (Heapster, InfluxDB, and Grafana)
have been removed from the Kubernetes source tree and therefore removed from the `cdk-addons` snap as well.

Customers relying on these addons should migrate to a `metrics-server` solution prior to upgrading.

**Note:** these removals do not affect the Kubernetes Dashboard nor the methods described in
[Monitoring Charmed Kubernetes](/kubernetes/docs/monitoring).

<a  id="1.16"> </a>

## Upgrading to 1.16

### Docker Registry with Containerd

Prior to 1.16, some fixes were required to support using the
Docker Registry charm with Containerd.

This charm, if used, is now supported through standard relations. Before upgrading,
remove any reference of the registry in the `custom_registries`
[containerd charm configuration](/kubernetes/docs/container-runtime).

After upgrading, see the [docker registry](/kubernetes/docs/docker-registry)
instructions for details of how to configure a registry.

### Admission control plugins

In **Charmed Kubernetes 1.16**, the API server parameter by which additional,
non-default admission control plugins is specified has changed. The old
parameter was `--admission-control`; the new parameter is `--enable-admission-plugins`.

For example, prior to 1.16, The 'PodSecurityPolicy' admission plugin could be
applied like this:
```bash
juju config kubernetes-master api-extra-args="admission-control=PodSecurityPolicy"
```

As of 1.16, this changes to:
```bash
juju config kubernetes-master api-extra-args="enable-admission-plugins=PodSecurityPolicy"
```

If using non-default admission plugins, be sure to upgrade your charm config
accordingly after upgrading to 1.16.

<a  id="1.15"> </a>

## Upgrading to 1.15

This upgrade switches the container runtime to make use of containerd, rather
than Docker. You have the option of keeping Docker as the container runtime,
but even in that case you ***must*** perform the upgrade steps. To facilitate
different container runtimes, the architecture of **Charmed Kubernetes** has
changed slightly, and the container runtime is now part of a separate,
subordinate charm rather than being included in the `kubernetes-master` and
`kubernetes-worker` charms.

### To keep Docker as the container runtime

Docker is currently installed on your kubernetes-worker units. The Docker subordinate
charm includes clean-up code to manage the transition to the new pluggable architecture.
To upgrade whilst retaining Docker as the runtime, you need to additionally deploy the new charm
and add relations to the master and worker components:

```bash
juju deploy docker
juju add-relation docker kubernetes-master
juju add-relation docker kubernetes-worker
```

The upgrade is complete, and your worker nodes will continue to use the Docker runtime.
For information on configuring the Docker charm, see the [Docker configuration page][docker-page].

### To migrate to containerd

If you intend to switch to containerd, it's recommended that you first add some
temporary extra worker units. While not strictly necessary, skipping this step will result
in some cluster down time. Adding temporary additional workers provides a place for keeping pods running while new workers are brought online. The temporary workers can then be removed as the pods are migrated to the new workers. The rest of these instructions assume that you have deployed temporary workers.

#### Deploy temporary workers
```bash
CURRENT_WORKER_REV=$(juju status | grep '^kubernetes-worker\s' | awk '{print $7}')
CURRENT_WORKER_COUNT=$(juju status | grep '^kubernetes-worker/' | wc -l | sed -e 's/^[ \t]*//')

juju deploy kubernetes-worker-$CURRENT_WORKER_REV  kubernetes-worker-temp -n $CURRENT_WORKER_COUNT
```

#### Add necessary relations
```bash
juju status --relations | grep worker: | awk '{print $1,$2}' | sed 's/worker:/worker-temp:/g' | xargs -n2 juju relate
```
Wait for the temporary workers to become active before continuing.
Upgrade the master and worker charms:
```bash
juju upgrade-charm kubernetes-master
juju upgrade-charm kubernetes-worker
```

The kubernetes-worker units will enter a blocked state, with status message
"Connect a container runtime."

#### Deploy and relate the new Docker charm

This step is needed even if you do not intend to use Docker following the
upgrade. Docker is already installed on your `kubernetes-worker` units, and
the Docker subordinate includes clean-up code to uninstall Docker when the
Docker charm is replaced with the containerd charm.

```bash
juju deploy docker
juju add-relation docker kubernetes-master
juju add-relation docker kubernetes-worker
```

### Switching to Containerd

Now, pause the existing workers, which will move pods to the temporary workers.

```bash
juju run-action [unit] pause
```

For example:
```bash
juju run-action kubernetes-worker/0 pause --wait
juju run-action kubernetes-worker/1 pause --wait
juju run-action kubernetes-worker/2 pause --wait
```

One-liner:
```bash
juju status | grep ^kubernetes-worker/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} pause --wait
```

#### Remove Docker

This will uninstall Docker from the workers.

```bash
juju remove-relation docker kubernetes-master
juju remove-relation docker kubernetes-worker
juju remove-application docker
```

#### Deploy Containerd

```bash
juju deploy containerd
juju add-relation containerd kubernetes-master
juju add-relation containerd kubernetes-worker
```

#### Resume workers
Now we can allow pods to be rescheduled to our original workers.

```bash
juju run-action [unit] resume --wait
```

E.g.
```bash
juju run-action kubernetes-worker/0 resume --wait
juju run-action kubernetes-worker/1 resume --wait
juju run-action kubernetes-worker/2 resume --wait
```

One-liner:
```bash
juju status | grep ^kubernetes-worker/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} resume --wait
```

#### Cleanup

You can now pause the temporary workers to force all pods to migrate back
to your "real" workers, then remove the temporary workers.

```bash
juju status | grep ^kubernetes-worker-temp/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} pause --wait

juju remove-application kubernetes-worker-temp
```


#### Mixing Containerd and Docker


Once you have a Containerd backed Charmed Kubernetes running, you can add Docker backed
workers like so:

```bash
juju deploy kubernetes-worker kubernetes-worker-docker
juju deploy docker
juju relate docker kubernetes-worker-docker
```

### Clusters which previously ran etcd 2.3

If your cluster has run etcd 2.3 at any point in the past, then it is
strongly recommended not to upgrade the etcd charm to revision 449. Doing so
will cause etcd to lose all of its data. For details, see
https://bugs.launchpad.net/charm-etcd/+bug/1843497

We recommend upgrading etcd directly to charm revision 460 instead.

<a  id="1.14"> </a>

## Upgrading to 1.14

This upgrade includes support for **CoreDNS 1.4.0**. All new deployments of
**Charmed Kubernetes** will install **CoreDNS** by default instead of **KubeDNS**.

Existing deployments which are upgraded to **Charmed Kubernetes 1.14** will continue to use
**KubeDNS** until the operator chooses to upgrade to **CoreDNS**. To upgrade,
set the new dns-provider config:


```bash
juju config kubernetes-master dns-provider=core-dns
```

Please be aware that changing DNS providers will momentarily interrupt DNS
availability within the cluster. It is not necessary to recreate pods after the
upgrade completes.

The `enable-kube-dns` option has been removed to avoid confusion. The new
`dns-provider` option allows you to enable or disable **KubeDNS** as needed.

For more information on the new `dns-provider config`, see the
[dns-provider config description][dns-provider-config].

<a  id="1.10"> </a>

## Upgrading from 1.9.x to 1.10.x

This upgrade includes a transistion between major versions of **etcd**, from 2.3 to 3.x. Between these releases, **etcd** changed the way it accesses storage, so it is necessary to reconfigure this. There is more detailed information on the change and the upgrade proceedure in the [upstream **etcd** documentation][etcd-upgrade].


<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">This upgrade <strong>must</strong> be completed before attempting to upgrade the running cluster.</p>
  </div>
</div>

To make this upgrade more convenient for users of **Charmed Kubernetes**, a script has been prepared to manage the transition. The script can be [examined here][script].

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

```bash
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

[etcd-upgrade]: https://etcd.io/docs/v3.5/upgrades/upgrade_3_0/
[script]: https://raw.githubusercontent.com/juju-solutions/cdk-etcd-2to3/master/migrate
[dns-provider-config]: https://github.com/juju-solutions/kubernetes/blob/5f4868af82705a0636680a38d7f3ea760d35dadb/cluster/juju/layers/kubernetes-master/config.yaml#L58-L67
[docker-page]: https://jaas.ai/u/containers/docker#configuration
[inclusive-naming]: /kubernetes/docs/inclusive-naming

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/upgrade-notes.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
