---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Ceph storage"
  description: How to include Ceph CSI for Ceph storage support.
keywords: quickstart
tags: [getting_started]
sidebar: k8smain-sidebar
permalink: ceph.html
layout: [base, ubuntu-com]
toc: False
---

Many workloads that you may want to run on your Kubernetes cluster will require some
form of available storage. This guide will help you deploy **Charmed Kubernetes** with
**Ceph** container storage support. Available storage backends include `ceph-xfs`,
`ceph-ext4`, and `cephfs`.

## Deploying Ceph and Charmed Kubernetes

In this section, we'll create a small Ceph cluster along with a basic Charmed Kubernetes
environment that includes Ceph CSI support.

### Deploy Ceph

Start by deploying three Ceph monitor nodes:

```bash
juju deploy -n 3 ceph-mon
```

...and then add three storage nodes. For the storage nodes, we will specify additional
deployment parameters by using the `--storage` flag:

```bash
juju deploy -n 3 ceph-osd --storage osd-devices=32G,2 --storage osd-journals=8G,1
```

The storage nodes above will have two 32GB devices for storage and 8GB for journaling.
As we have asked for 3 machines, this means a total of 192GB of storage and 24GB of
journal space. The storage comes from whatever the default storage class is for the
cloud (e.g., on AWS this will be EBS volumes).

```bash
juju integrate ceph-osd ceph-mon
```

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">For more on how Juju makes use of storage, please see the relevant
<a href="https://juju.is/docs/juju/manage-storage">Juju documentation</a></p>
  </div>
</div>

### Deploy Charmed Kubernetes with Ceph CSI

Ceph CSI creates various Kubernetes resources, including pods. Therefore it requires the
`kubernetes-control-plane` application to run in privileged mode. Create a suitable environment as follows:

```bash
juju deploy charmed-kubernetes
juju config kubernetes-control-plane allow-privileged=true

juju deploy ceph-csi
juju deploy ceph-fs
juju config ceph-csi cephfs-enable=True
```

Now add the relevant Ceph integrations:

```bash
juju integrate ceph-csi:kubernetes kubernetes-control-plane:juju-info
juju integrate ceph-csi:ceph-client ceph-mon:client
juju integrate ceph-fs:ceph-mds ceph-mon:mds
```

## Verify things are working

Check the Charmed Kubernetes cluster to verify Ceph cluster resources are
available. Running:

```bash
juju ssh kubernetes-control-plane/leader -- kubectl get sc,po --namespace default
```

...should return output similar to:

```no-highlight
NAME                                             PROVISIONER           RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
storageclass.storage.k8s.io/ceph-ext4            rbd.csi.ceph.com      Delete          Immediate           true                   142m
storageclass.storage.k8s.io/ceph-xfs (default)   rbd.csi.ceph.com      Delete          Immediate           true                   142m
storageclass.storage.k8s.io/cephfs               cephfs.csi.ceph.com   Delete          Immediate           true                   127m

NAME                                               READY   STATUS    RESTARTS   AGE
pod/csi-cephfsplugin-4gs22                         3/3     Running   0          127m
pod/csi-cephfsplugin-ljfw9                         3/3     Running   0          127m
pod/csi-cephfsplugin-mlbdx                         3/3     Running   0          127m
pod/csi-cephfsplugin-provisioner-9f479bcc4-48v8f   5/5     Running   0          127m
pod/csi-cephfsplugin-provisioner-9f479bcc4-92bt6   5/5     Running   0          127m
pod/csi-cephfsplugin-provisioner-9f479bcc4-hbb82   5/5     Running   0          127m
pod/csi-cephfsplugin-wlp2w                         3/3     Running   0          127m
pod/csi-cephfsplugin-xwdb2                         3/3     Running   0          127m
pod/csi-rbdplugin-b8nk8                            3/3     Running   0          142m
pod/csi-rbdplugin-bvqwn                            3/3     Running   0          142m
pod/csi-rbdplugin-provisioner-85dc49c6c-9rckg      7/7     Running   0          142m
pod/csi-rbdplugin-provisioner-85dc49c6c-f6h6k      7/7     Running   0          142m
pod/csi-rbdplugin-provisioner-85dc49c6c-n47fx      7/7     Running   0          142m
pod/csi-rbdplugin-vm25h                            3/3     Running   0          142m
```

If you have installed **Helm**, you can then add a chart to verify the persistent volume
is automatically created for you:

```bash
helm install stable/phpbb
kubectl get pvc
```

...which should return output similar to:

```ǹo-highlight
NAME                            STATUS    VOLUME                 CAPACITY   ACCESS MODES   STORAGECLASS   AGE
calling-wombat-phpbb-apache     Bound     pvc-b1d04079a4bd11e8   1Gi        RWO            ceph-xfs       34s
calling-wombat-phpbb-phpbb      Bound     pvc-b1d1131da4bd11e8   8Gi        RWO            ceph-xfs       34s
data-calling-wombat-mariadb-0   Bound     pvc-b1df7ac9a4bd11e8   8Gi        RWO            ceph-xfs       34s
```

## Warning: Removal

When the `ceph-csi` charm is removed, it will not clean up Ceph pools that were created
when the relation with `ceph-mon:client` was joined. If you wish to remove ceph pools,
use the `delete-pool` action on a `ceph-mon` unit.

## Conclusion

Now you have a **Ceph** cluster integrated with your **Charmed Kubernetes** cluster. From
here you can install any of the things that require storage out of the box.

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/ceph.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
