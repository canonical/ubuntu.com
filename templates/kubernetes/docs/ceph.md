---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Ceph storage"
  description: How to get Ceph deployed and related to Kubernetes in order to have a default storage class. This allows for easy storage allocation.
keywords: quickstart
tags: [getting_started]
sidebar: k8smain-sidebar
permalink: ceph.html
layout: [base, ubuntu-com]
toc: False
---

## How to add **Ceph** storage

Many things you will want to use your Kubernetes cluster for will require some
form of available storage. Storage is quite a large topic -- this guide will
focus on just adding some quick storage using **Ceph**, so you can get up and
running quickly.

### What you'll need

- A **Charmed Kubernetes** environment set up and running. See the [quickstart][quickstart] if you haven't .
- An existing **Ceph** cluster or the ability to create one.

### Deploying Ceph

Setting up a Ceph cluster is easy with Juju. For this example we will deploy
three ceph monitor nodes:

```bash
 juju deploy -n 3 ceph-mon
```

...and then we'll add three storage nodes. For the storage nodes, we will also
specify some actual storage for these nodes to use by using `-- storage`. In
this case the Juju charm uses labels for different types of storage:

```bash
 juju deploy -n 3 ceph-osd --storage osd-devices=32G,2 --storage osd-journals=8G,1
```

This will deploy a storage node, and attach two 32GB devices for storage and
8GB for journalling. As we have asked for 3 machines, this means a total of
192GB of storage and 24GB of journal space. The storage comes from whatever the
default storage class is for the cloud (e.g., on AWS this will be EBS volumes).

```bash
juju integrate ceph-osd ceph-mon
```

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">For more on how Juju makes use of storage, please see the relevant
<a href="https://juju.is/docs/olm/defining-and-using-persistent-storage"> Juju documentation</a></p>
  </div>
</div>

### Relating to Charmed Kubernetes

Making **Charmed Kubernetes** aware of your **Ceph** cluster just requires a **Juju** relation.

```bash
juju integrate ceph-mon kubernetes-control-plane
```

Note that the **Ceph** CSI containers require privileged access:

```bash
juju config kubernetes-control-plane allow-privileged=true
```

And finally, you need the pools that are defined in the storage class:

```bash
juju run ceph-mon/0 create-pool name=xfs-pool
```

```yaml
unit-ceph-mon-0:
  id: c12f0688-f31b-4956-8314-abacd2d6516f
  status: completed
  timing:
    completed: 2018-08-20 20:49:34 +0000 UTC
    enqueued: 2018-08-20 20:49:31 +0000 UTC
    started: 2018-08-20 20:49:31 +0000 UTC
  unit: ceph-mon/0
```

```bash
juju run ceph-mon/0 create-pool name=ext4-pool
```

```yaml
unit-ceph-mon-0:
  id: 4e82d93d-546f-441c-89e1-d36152c082f2
  status: completed
  timing:
    completed: 2018-08-20 20:49:45 +0000 UTC
    enqueued: 2018-08-20 20:49:41 +0000 UTC
    started: 2018-08-20 20:49:43 +0000 UTC
  unit: ceph-mon/0
```

### Verifying things are working

Now you can look at your **Charmed Kubernetes** cluster to verify things are
working. Running:

```bash
kubectl get sc,po
```

... should return output similar to:

```no-highlight
NAME                                             PROVISIONER     AGE
storageclass.storage.k8s.io/ceph-ext4            csi-rbdplugin    7m
storageclass.storage.k8s.io/ceph-xfs (default)   csi-rbdplugin    7m

NAME                                                   READY     STATUS    RESTARTS   AGE
pod/csi-rbdplugin-attacher-0                           1/1       Running   0          7m
pod/csi-rbdplugin-cnh9k                                2/2       Running   0          7m
pod/csi-rbdplugin-lr66m                                2/2       Running   0          7m
pod/csi-rbdplugin-mnn94                                2/2       Running   0          7m
pod/csi-rbdplugin-provisioner-0                        1/1       Running   0          7m
```

If you have installed **Helm**, you can then add a chart to verify the persistent volume is automatically created for you.

```bash
helm install stable/phpbb
kubectl get pvc
```

Which should return something similar to:

```ǹo-highlight
NAME                            STATUS    VOLUME                 CAPACITY   ACCESS MODES   STORAGECLASS   AGE
calling-wombat-phpbb-apache     Bound     pvc-b1d04079a4bd11e8   1Gi        RWO            ceph-xfs       34s
calling-wombat-phpbb-phpbb      Bound     pvc-b1d1131da4bd11e8   8Gi        RWO            ceph-xfs       34s
data-calling-wombat-mariadb-0   Bound     pvc-b1df7ac9a4bd11e8   8Gi        RWO            ceph-xfs       34s
```

### Conclusion

Now you have a **Ceph** cluster talking to your **Kubernetes** cluster. From
here you can install any of the things that require storage out of the box.

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/ceph.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

