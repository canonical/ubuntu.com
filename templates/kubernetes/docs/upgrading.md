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
-   Your Juju client and controller/models are running the latest versions (see the [Juju docs][juju-controller-upgrade])
-   You read the [Upgrade notes][notes] to see if any caveats apply to the versions you are upgrading to/from
-   You read the [Release notes][release-notes] for the version you are upgrading to, which will alert you to any important changes to the operation of your cluster
-   You read the [Upstream release notes](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md#deprecation) for details of deprecation notices and API changes for Kubernetes 1.24 which may impact your workloads.

It is also important to understand that **Charmed Kubernetes** will only upgrade
and if necessary migrate, components relating specifically to elements of
Kubernetes installed and configured as part of Charmed Kubernetes.
This may not include any customised configuration of Kubernetes, or user
generated objects (e.g. storage classes) or deployments which rely on
deprecated APIs.

## Specific upgrade instructions

We have never recommended skipping a version in an upgrade and no longer provide generic upgrade 
instructions for any version of Charmed Kubernetes. Please follow the specific upgrade 
documentation for the version you are upgrading to.

### Supported versions

- [Upgrading from 1.23.x to 1.24.x](/kubernetes/docs/1.24/upgrading)
- [Upgrading from 1.22.x to 1.23.x](/kubernetes/docs/1.23/upgrading)
- [Upgrading from 1.21.x to 1.22.x](/kubernetes/docs/1.22/upgrading)

### Older versions

- [Upgrading from 1.20.x to 1.21.x](/kubernetes/docs/1.21/upgrading)
- [Upgrading from 1.19.x to 1.20.x](/kubernetes/docs/1.20/upgrading)
- [Upgrading from 1.18.x to 1.19.x](/kubernetes/docs/1.19/upgrading)
- [Upgrading from 1.17.x to 1.18.x](/kubernetes/docs/1.18/upgrading)

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
[juju-controller-upgrade]: https://juju.is/docs/olm/upgrade-models

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/upgrading.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

