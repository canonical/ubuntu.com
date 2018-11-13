---
wrapper_template: base_docs.html
markdown_includes:
    nav: shared/_side-navigation.md
---

# Upgrading

It is recommended that you keep your **Kubernetes** deployment updated to the
latest available stable version. You should also update the other applications
which make up the **Canonical Distribution of Kubernetes<sup>&reg;</sup>.**
Keeping up to date ensures you have the latest bug-fixes and security
patches for smooth operation of your cluster.

New minor versions of **Kubernetes** are set to release once per quarter. You can
check the latest release version on the
[Kubernetes release page on GitHub][k8s-release].  The **CDK** is kept in close sync
with upstream Kubernetes: updated versions will be released within a week of a new
upstream version of **Kubernetes**.

<div class="p-notification--information">
  <p class="p-notification__response">
    <span class="p-notification__status">Note:</span>
<strong>Kubernetes</strong> will automatically handle patch releases. This means that
the cluster will perform an unattended automatic upgrade between patch versions, e.g.
1.10.7 to 1.10.8. Attended upgrades are only required when you wish to upgrade a minor
version, e.g. 1.9.x to 1.10.x.
  </p>
</div>

You can see which version of each application is currently deployed by running

```bash
juju status
```

The 'App' section of the output lists each application and its version number.
Note that this is the version of the upstream application deployed. The version
of the Juju charm is indicated under the column titled 'Rev'. The charms may be
updated in between new versions of the application.

![juju output](https://assets.ubuntu.com/v1/6691d706-CDK-010.png)

## Before you begin

As with all upgrades, there is a possibility that there may be unforeseen
difficulties. It is **highly recommended that you make a backup** of any
important data, including any running workloads. For more details on creating
backups, see the separate [documentation on backups][backups].

You should also make sure:

  * The machine from which you will perform the backup has sufficient internet access to
      retrieve updated software
  * Your cluster is running normally
  * You read the [Upgrade notes][notes] to see if any caveats apply to the versions you are
     upgrading to/from
  * You read the [Release notes][release-notes] for the version you are upgrading to,
      which will alert you to any important changes to the operation of your cluster

## Infrastructure updates

The applications which run alongside the core Kubernetes components can be
upgraded at any time. These applications are widely used and may frequently
receive upgrades outside of the cycle of new releases of Kubernetes.

This includes:

 - easyrsa
 - etcd
 - flannel

 Note that this may include other applications which you may have installed, such as
 Elasticsearch, Prometheus, Nagios, Helm, etc.

### Upgrading **etcd**

 As **etcd** manages critical data for the cluster, it is advisable to create a snapshot of
 this data before running an upgrade. This is covered in more detail in the
 [documentation on backups][backups], but the basic steps are:

  * **Run the snapshot action on the charm:**
     ```bash
     juju run-action etcd/0 snapshot --wait
     ```
     You should see confirmation of the snapshot being created, and the location of the
     file _on the **etcd** unit_
 * **Fetch a local copy of the snapshot**
    Knowing the path to the snapshot file from the output of the above command, you can
    download a local copy:
    ```bash
    juju scp etcd/0:/home/ubuntu/etcd-snapshots/<filename>.tar.gz .
    ```
You can now upgrade **etcd**:

```bash
juju upgrade-charm etcd
```

### Upgrading additional components

The other infrastructure applications can be upgraded by running the `upgrade-charm` command:

```bash
juju upgrade-charm flannel
juju upgrade-charm easyrsa
```
Any other infrastructure charms can be upgraded in a similar way.

<div class="p-notification--caution">
  <p class="p-notification__response">
    <span class="p-notification__status">Note:</span>
Some services may be briefly interrupted during the upgrade process. Upgrading
<strong>flannel</strong> will cause a small amount of network downtime. Upgrading
<strong>easyrsa</strong> will not cause any downtime. The behaviour of other
components you have added to your cluster may vary - check individual documentation
for these charms for more information on upgrades.
  </p>
</div>

## Upgrading Kubernetes

Before you upgrade the **Kubernetes** components, you should be aware of the
exact release you wish to upgrade to.

The **Kubernetes** charms use **snap**  _channels_ to manage the version of
**Kubernetes** to use.  Channels are explained in more detail in the  [official
snap documentation][snap-channels], but in terms of **Kubernetes** all you need to
know are the major and minor version numbers and the 'risk-level':

| Risk level |   Description                                                                                       |
|----------------|---------------------------------------------------------------------------------------|
|stable	        | The latest stable released version of Kubernetes                 |
|candidate  |	Release candidate versions of Kubernetes                              |
|beta	           | Latest alpha/beta of Kubernetes for the specified release|
|edge	          | Nightly builds of the specified release of Kubernetes          |

For most use cases, it is strongly recommended to use the 'stable' version of charms.

### Upgrading the **kube-api-loadbalancer**

A core part of **CDK** is the kubeapi-load-balancer component. A mismatch of versions
could have an effect on API availability and access controls. To ensure API service
continuity this upgrade should precede any upgrades to the **Kubernetes** master
and worker units.

```bash
juju upgrade-charm kubeapi-load-balancer
```

### Upgrading the **kubernetes-master** units

To start upgrading the Kubernetes master units, first upgrade the charm:

```bash
juju upgrade-charm kubernetes-master
```

Once the charm has been upgraded, it can be configured to select the desired
**Kubernetes** channel, which takes the form `Major.Minor/risk-level`.  This is
then passed as a configuration option to the charm. So, for example, to select
the stable 1.10 version of **Kubernetes**, you would enter:

```bash
juju config kubernetes-master channel=1.10/stable
```

If you wanted to try a release candidate for 1.12, the channel would be `1.12/candidate`.

<div class="p-notification--caution">
  <p class="p-notification__response">
    <span class="p-notification__status">Note:</span>
Once the configuration has been changed, the charms will be put into a `blocked` state.
You must continue the upgrade process, even if you revert the configuration to the
currently active version of Kubernetes.
  </p>
</div>

Once the desired version has been configured, the upgrades should be performed.
This is done by running the `upgrade` action on each master unit in the
cluster:

```bash
juju run-action kubernetes-master/0 upgrade
juju run-action kubernetes-master/1 upgrade
```

If you have more master units in your cluster, you should continue and run this
process on every one of them.

You can check the progress of the upgrade by running:

```bash
juju status | grep master
```

Ensure that all the master units have upgraded and are reporting normal status
before continuing to upgrade the worker units.

### Upgrading the **kubernetes-worker** units

For a running cluster, there are two different ways to proceed:

 * [Blue-green][blue-green] upgrade - This requires more resources, but should ensure a
    safe, zero-downtime transition of workloads to an updated cluster
 * In-place upgrade - this simply upgrades the workers in situ, which may involve some
    service interruption but doesn't require extra resources

 Both methods are outlined below. The blue-green method is recommended for
 production systems.

#### Blue-green upgrade

To begin, upgrade the kubernetes-worker charm itself:

```bash
juju upgrade-charm kubernetes-worker
```

Next, run the command to configure the workers for the version of Kubernetes
you wish to run (as you did previously for the master units). For example:

```bash
juju config kubernetes-worker channel=1.12/stable
```

Now add additional units of the kubernetes-worker. You should add as many units
as you are replacing. For example, to add three additional units:

```bash
juju add-unit kubernetes-worker -n 3
```

This will create new units to migrate the existing workload to. As you
configured the version prior to adding the units, they will be using the
newly-selected version of **Kubernetes**.

Now we can pause the existing workers, which will cause the workloads to
migrate to the new units recently added. A worker unit is paused by running the
corresponding action on that unit:

```bash
juju run-action kubernetes-worker/0 pause
juju run-action kubernetes-worker/1 pause
juju run-action kubernetes-worker/2 pause
...
```

Continue until all the 'old' units have been paused. You can check on the
workload status by running the command:

```bash
kubectl get pod -o wide
```

Once the workloads are running on the new units, it is safe to remove the old units:

```bash
juju remove-unit kubernetes-worker/0
```

Removing these units from the model will also release the underlying
machines/instances they were running on, so no further clean up is required.

<div class="p-notification--information">
  <p class="p-notification__response">
    <span class="p-notification__status">Note:</span>
A variation on this method is to add, pause, remove  and recycle units one at a time. This
reduces the resource overhead to a single extra instance.
  </p>
</div>

#### In-place upgrade

To proceed with an in-place upgrade, first upgrade the charm itself:

```bash
juju upgrade-charm kubernetes-worker
```

Next, run the command to configure the workers for the version of **Kubernetes**
you wish to run (as you did previously for the master units). For example:

```bash
juju config kubernetes-worker channel=1.12/stable
```

All the units can now be upgraded by running the `upgrade`  action on each one:

```bash
juju run-action kubernetes-worker/0 upgrade
juju run-action kubernetes-worker/1 upgrade
...
```


## Verify your upgrade

The output from:

```bash
juju status
```
.. should now indicate the selected version of **Kubernetes** is running.

It is recommended that you run a [cluster validation][validation] to ensure
that the cluster upgrade has successfully completed.


 <!--LINKS-->

[k8s-release]: https://github.com/kubernetes/kubernetes/releases
[backups]: ./backups.html
[notes]: ./upgrade-notes.html
[snap-channels]: https://docs.snapcraft.io/reference/channels
[blue-green]: https://martinfowler.com/bliki/BlueGreenDeployment.html
[validation]: ./validation.html
