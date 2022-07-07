---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Upgrading"
  description: How to upgrade your version of Charmed Kubernetes.
keywords: juju, upgrading, track, version
tags: [operating]
sidebar: k8smain-sidebar
permalink: upgrading.html
layout: [base, ubuntu-com]
toc: False
---

<!-- UPGRADE VERSIONS -->

<div class="p-notification--caution">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">This page describes the general upgrade process. It is important to follow the specific upgrade pages for each release, as these may include additional steps and workarounds for safely upgrading.</p>
  </div>
  <div class="p-notification__meta">
    <div class="p-notification__actions">
      <a class='p-notification__action' href='/kubernetes/docs/1.24/upgrading'>Upgrade to 1.24 </a>
      <a class='p-notification__action' href='/kubernetes/docs/1.23/upgrading'>Upgrade to 1.23 </a>
      <a class='p-notification__action' href='/kubernetes/docs/1.22/upgrading'>Upgrade to 1.22 </a>
    </div>
  </div>
</div>

<!-- END OF UPGRADE VERSIONS-->



It is recommended that you keep your **Kubernetes** deployment updated to the latest available stable version. You should also update the other applications which make up the **Charmed Kubernetes**. Keeping up to date ensures you have the latest bug-fixes and security patches for smooth operation of your cluster.

New minor versions of **Kubernetes** are set to release once per quarter. You can check the latest release version on the [Kubernetes release page on GitHub][k8s-release]. **Charmed Kubernetes** is kept in close sync with upstream Kubernetes: updated versions will be released within a week of a new upstream version of **Kubernetes**.

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message"><strong>Kubernetes</strong> will automatically handle patch releases. This means that the cluster will perform an unattended automatic upgrade between patch versions, e.g. 1.23.1 to 1.23.2. Attended upgrades are only required when you wish to upgrade a minor version, e.g. 1.22.x to 1.23.x.</p>
  </div>
</div>

You can see which version of each application is currently deployed by running

```bash
juju status
```

The 'App' section of the output lists each application and its version number. Note that this is the version of the upstream application deployed. The version of the Juju charm is indicated under the column titled 'Rev'. The charms may be updated in between new versions of the application.

![juju output](https://assets.ubuntu.com/v1/6691d706-CDK-010.png)

## Before you begin

As with all upgrades, there is a possibility that there may be unforeseen difficulties. It is **highly recommended that you make a backup** of any important data, including any running workloads. For more details on creating backups, see the separate [documentation on backups][backups].

You should also make sure:

-   The machine from which you will perform the backup has sufficient internet access to retrieve updated software
-   Your cluster is running normally
-   You read the [Upgrade notes][notes] to see if any caveats apply to the versions you are upgrading to/from
-   You read the [Release notes][release-notes] for the version you are upgrading to, which will alert you to any important changes to the operation of your cluster
-   You read the [Upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md#deprecation) for details of deprecation notices and API changes for Kubernetes 1.24 which may impact your workloads.

It is also important to understand that **Charmed Kubernetes** will only upgrade
and if necessary migrate, components relating specifically to elements of
Kubernetes installed and configured as part of Charmed Kubernetes.
This may not include any customised configuration of Kubernetes, or user
generated objects (e.g. storage classes) or deployments which rely on
deprecated APIs.

## Infrastructure updates

The applications which run alongside the core Kubernetes components can be upgraded at any time. These applications are widely used and may frequently receive upgrades outside of the cycle of new releases of Kubernetes.

This includes:

- containerd
- easyrsa
- etcd
- calico, flannel or other CNI charms

Note that this may include other applications which you may have installed, such as Elasticsearch, Prometheus, Nagios, Helm, etc.


<a id='upgrading-containerd'> </a>

### Upgrading Containerd

By default, **Charmed Kubernetes** 1.15 and later use Containerd as the container
runtime. This subordinate charm can be upgraded with the command:

```bash
juju upgrade-charm containerd --channel=1.24/stable
```

<a id='upgrading-docker'> </a>

### Migrating to Containerd

Upstream support for the Docker container runtime was removed in the 1.24 release. Thus, the
`docker` subordinate charm will no longer function from **Charmed Kubernetes** 1.24 onwards.

If you are upgrading from a version of **Charmed Kubernetes** that uses the `docker`
subordinate charm for the container runtime, transition to `containerd` by following
the steps outlined in [this section of the upgrade notes][docker2containerd].

### Upgrading etcd

As **etcd** manages critical data for the cluster, it is advisable to create a snapshot of
this data before running an upgrade. This is covered in more detail in the
[documentation on backups][backups], but the basic steps are:

#### 1. Run the snapshot action on the charm

```bash
juju run-action etcd/0 snapshot --wait
```
You should see confirmation of the snapshot being created, and the command needed to download the snapshot
_from the **etcd** unit_. See the following truncated, example output:

```
...
copy:
      cmd: juju scp etcd/40:/home/ubuntu/etcd-snapshots/etcd-snapshot-2020-11-18-21.37.11.tar.gz
        .
...
```

#### 2. Fetch a local copy of the snapshot

You can use the `juju scp` command from the output above to download a local copy. For example:

```
juju scp etcd/40:/home/ubuntu/etcd-snapshots/etcd-snapshot-2020-11-18-21.37.11.tar.gz .
```

Substitute in your own etcd unit number and filename, or copy and paste the command from the previous
output. Remember to add the ` .` at the end to copy to your local directory!


#### 3. Upgrade the charm

You can now upgrade the **etcd** charm:

```bash
juju upgrade-charm etcd --channel=1.24/stable
```

#### 4. Upgrade etcd

To upgrade **etcd** itself, you will need to set the **etcd** charm's channel
config.

To determine the correct channel, go to the
[Supported Versions][supported-versions] page and check the relevant
**Charmed Kubernetes** bundle. Within the bundle, you should see which channel
the **etcd** charm is configured to use.

Once you know the correct channel, set the **etcd** charm's channel config:

```bash
juju config etcd channel=3.4/stable
```


### Upgrading additional components

The other infrastructure applications can be upgraded by running the `upgrade-charm`
command:

```bash
juju upgrade-charm easyrsa --channel=1.24/stable
```

Any other infrastructure charms should be upgraded in a similar way. For
example, if you are using the flannel CNI:

```bash
juju upgrade-charm flannel --channel=1.24/stable
```

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Some services may be briefly interrupted during the upgrade process. Upgrading
    your CNI (e.g. flannel) will cause a small amount of network downtime. Upgrading
    <strong>easyrsa</strong> will not cause any downtime. The behaviour of other
    components you have added to your cluster may vary - check individual documentation
    for these charms for more information on upgrades.</p>
  </div>
</div>

## Upgrading Kubernetes

Before you upgrade the **Kubernetes** components, you should be aware of the exact
release you wish to upgrade to.

The **Kubernetes** charms use **snap** _channels_ to manage the version of
**Kubernetes** to use. Channels are explained in more detail in the
[official snap documentation][snap-channels], but in terms of **Kubernetes** all you
need to know are the major and minor version numbers and the 'risk-level':

| Risk level | Description                                               |
| ---------- | --------------------------------------------------------- |
| stable     | The latest stable released version of Kubernetes          |
| candidate  | Release candidate versions of Kubernetes                  |
| beta       | Latest alpha/beta of Kubernetes for the specified release |
| edge       | Nightly builds of the specified release of Kubernetes     |

For most use cases, it is strongly recommended to use the 'stable' version of charms.

### Upgrading the **kube-api-loadbalancer**

A core part of **Charmed Kubernetes** is the kubeapi-load-balancer component. To ensure API service
continuity this upgrade should precede any upgrades to the **Kubernetes** control-plane and
worker units.

```bash
juju upgrade-charm kubeapi-load-balancer --channel=1.24/stable
```

The load balancer itself is based on NGINX, and the version reported by `juju status` is
that of NGINX rather than Kubernetes. Unlike the other Kubernetes components, there
is no need to set a specific channel or version for this charm.

### Upgrading the **kubernetes-control-plane** units

To start upgrading the Kubernetes control plane units, first upgrade the charm.  


<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message"> In the event the current deployment was made with a bundle prior to the 1.23 release, 
    the application will be named `kubernetes-master` instead of `kubernetes-control-plane`.
    The same instructions below apply, however instead use the name `kubernetes-master`. See 
    <a href= "/kubernetes/docs/inclusive-naming"> inclusive-naming</a> for more information.</p>
  </div>
</div>

Switch to the new charm name
```bash
juju upgrade-charm kubernetes-master --switch kubernetes-control-plane --channel=1.24/stable
```

To upgrade the current application
```bash
juju upgrade-charm kubernetes-control-plane --channel=1.24/stable
```

Once the charm has been upgraded, it can be configured to select the desired **Kubernetes** channel, which takes the form `Major.Minor/risk-level`. This is then passed as a configuration option to the charm. So, for example, to select the stable 1.24 version of **Kubernetes**, you would enter:

```bash
juju config kubernetes-control-plane channel=1.24/stable
```

If you wanted to try a release candidate for 1.24, the channel would be `1.24/candidate`.

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Once the configuration has been changed, the charms will be put into a `blocked` state.
    You must continue the upgrade process, even if you revert the configuration to the
    currently active version of Kubernetes.</p>
  </div>
</div>

Once the desired version has been configured, the upgrades should be performed. This is done by running the `upgrade` action on each control-plane unit in the cluster:

```bash
juju run-action kubernetes-control-plane/0 upgrade
juju run-action kubernetes-control-plane/1 upgrade
```

If you have more control-plane units in your cluster, you should continue and run this process on every one of them.

You can check the progress of the upgrade by running:

```bash
juju status | grep control-plane
```

Ensure that all the control-plane units have upgraded and are reporting normal status before continuing to upgrade the worker units.

### Upgrading the **kubernetes-worker** units

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">A <a href="https://github.com/kubernetes/kubernetes/issues/70044"> current bug in Kubernetes</a> could prevent the upgrade from properly deleting old pods. See the <a href="#known-issues"> Known issues section</a> at the bottom of this page.</p>
  </div>
</div>

For a running cluster, there are two different ways to proceed:

- [Blue-green][blue-green] upgrade - This requires more resources, but should ensure a safe, zero-downtime transition of workloads to an updated cluster
- In-place upgrade - this simply upgrades the workers in situ, which may involve some service interruption but doesn't require extra resources

Both methods are outlined below. The blue-green method is recommended for production systems.

#### Blue-green upgrade

To begin, upgrade the kubernetes-worker charm itself:

```bash
juju upgrade-charm kubernetes-worker --channel=1.24/stable
```

Next, run the command to configure the workers for the version of Kubernetes you wish to run (as you did previously for the control-plane units). For example:

```bash
juju config kubernetes-worker channel=1.24/stable
```

Now add additional units of the kubernetes-worker. You should add as many units as you are replacing. For example, to add three additional units:

```bash
juju add-unit kubernetes-worker -n 3
```

This will create new units to migrate the existing workload to. As you configured the version prior to adding the units, they will be using the newly-selected version of **Kubernetes**.

Now we can pause the existing workers, which will cause the workloads to migrate to the new units recently added. A worker unit is paused by running the corresponding action on that unit:

```bash
juju run-action kubernetes-worker/0 pause
juju run-action kubernetes-worker/1 pause
juju run-action kubernetes-worker/2 pause
...
```

Continue until all the 'old' units have been paused. You can check on the workload status by running the command:

```bash
kubectl get pod -o wide
```

Once the workloads are running on the new units, it is safe to remove the old units:

```bash
juju remove-unit kubernetes-worker/0
```

Removing these units from the model will also release the underlying machines/instances they were running on, so no further clean up is required.

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">A variation on this method is to add, pause, remove  and recycle units one at a time. This reduces the resource overhead to a single extra instance.</p>
  </div>
</div>

#### In-place upgrade

To proceed with an in-place upgrade, first upgrade the charm itself:

```bash
juju upgrade-charm kubernetes-worker --channel=1.24/stable
```

Next, run the command to configure the workers for the version of **Kubernetes** you wish to run (as you did previously for the control-plane units). For example:

```bash
juju config kubernetes-worker channel=1.24/stable
```

All the units can now be upgraded by running the `upgrade` action on each one:

```bash
juju run-action kubernetes-worker/0 upgrade
juju run-action kubernetes-worker/1 upgrade
...
```

<a id='upgrading-series'> </a>

## Upgrading the Machine's Series

All of the charms support [upgrading the machine's series via Juju](https://juju.is/docs/upgrading-series).
As each machine is upgraded, the applications on that machine will be stopped and the unit will
go into a `blocked` status until the upgrade is complete. For the worker units, pods will be drained
from the node and onto one of the other nodes at the start of the upgrade, and the node will be removed
from the pool until the upgrade is complete.

<a id='verify-upgrade'> </a>

## Verify an Upgrade

Once an upgrade is complete and units settle, the output from:

```bash
juju status
```

... should indicate that all units are active and the correct version of **Kubernetes** is running.

It is recommended that you run a [cluster validation][validation] to ensure that the cluster is fully functional.


## Known Issues

A [current bug](https://github.com/kubernetes/kubernetes/issues/70044) in Kubernetes could prevent the upgrade from properly deleting old pods. You can see such an issue here:

```bash
kubectl get po --all-namespaces
```

```
NAMESPACE                         NAME                                                          READY   STATUS        RESTARTS   AGE
default                           nginx-ingress-kubernetes-worker-controller-r8d2v              0/1     Terminating   0          17m
ingress-nginx-kubernetes-worker   default-http-backend-kubernetes-worker-5d9bb77bc5-76c8w       1/1     Running       0          10m
ingress-nginx-kubernetes-worker   nginx-ingress-controller-kubernetes-worker-5dcf47fc4c-q9mh6   1/1     Running       0          10m
kube-system                       heapster-v1.6.0-beta.1-6db4b87d-phjvb                         4/4     Running       0          16m
kube-system                       kube-dns-596fbb8fbd-bp8lz                                     3/3     Running       0          18m
kube-system                       kubernetes-dashboard-67d4c89764-nwxss                         1/1     Running       0          18m
kube-system                       metrics-server-v0.3.1-67bb5c8d7-x9nzx                         2/2     Running       0          17m
kube-system                       monitoring-influxdb-grafana-v4-65cc9bb8c8-mwvcm               2/2     Running       0          17m
```

In this case the  `nginx-ingress-kubernetes-worker-controller-r8d2v` has been stuck in the `Terminating` state for roughly 10 minutes. The workaround for such a problem is to force a deletion:

```bash
kubectl delete po/nginx-ingress-kubernetes-worker-controller-r8d2v --force --grace-period=0
```

This will result in output similar to the following:

```
warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
pod "nginx-ingress-kubernetes-worker-controller-r8d2v" force deleted
```

You should verify that the pod has been sucessfully removed:

```bash
kubectl get po --all-namespaces
```

```
NAMESPACE                         NAME                                                          READY   STATUS    RESTARTS   AGE
ingress-nginx-kubernetes-worker   default-http-backend-kubernetes-worker-5d9bb77bc5-76c8w       1/1     Running   0          11m
ingress-nginx-kubernetes-worker   nginx-ingress-controller-kubernetes-worker-5dcf47fc4c-q9mh6   1/1     Running   0          11m
kube-system                       heapster-v1.6.0-beta.1-6db4b87d-phjvb                         4/4     Running   0          17m
kube-system                       kube-dns-596fbb8fbd-bp8lz                                     3/3     Running   0          19m
kube-system                       kubernetes-dashboard-67d4c89764-nwxss                         1/1     Running   0          19m
kube-system                       metrics-server-v0.3.1-67bb5c8d7-x9nzx                         2/2     Running   0          18m
kube-system                       monitoring-influxdb-grafana-v4-65cc9bb8c8-mwvcm               2/2     Running   0          18m
```


 <!--LINKS-->

[k8s-release]: https://github.com/kubernetes/kubernetes/releases
[backups]: /kubernetes/docs/backups
[release-notes]: /kubernetes/docs/release-notes
[notes]: /kubernetes/docs/upgrade-notes
[snap-channels]: https://docs.snapcraft.io/reference/channels
[blue-green]: https://martinfowler.com/bliki/BlueGreenDeployment.html
[validation]: /kubernetes/docs/validation
[supported-versions]: /kubernetes/docs/supported-versions
[inclusive-naming]: /kubernetes/docs/inclusive-naming

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/upgrading.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

