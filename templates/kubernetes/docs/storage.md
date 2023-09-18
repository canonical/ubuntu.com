---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Storage"
  description: How to add and configure different types of persistent storage for your Kubernetes cluster.
keywords: storage, ceph, nfs, pvc
tags: [operating]
sidebar: k8smain-sidebar
permalink: storage.html
layout: [base, ubuntu-com]
toc: False
---

On-disk files in a container are ephemeral and can't be shared with other members of a pod. For some applications, this is not an issue, but for many persistent storage is required.

**Charmed Kubernetes** makes it easy to add and configure different types of persistent storage for your **Kubernetes** cluster, as outlined below. For more detail on the concept of storage volumes in **Kubernetes**, please see the [Kubernetes documentation][kubernetes-storage-docs].

## Ceph storage

**Charmed Kubernetes** can make use of [Ceph][ceph-home] to provide persistent storage
volumes. The following sections assume you have already deployed a
**Charmed Kubernetes** cluster and you have internet access to the
**Juju** Charm Store.

### Deploy Ceph

Check that the current **Juju** model is the one where you wish to deploy **Ceph**

```bash
juju switch
```

Begin by adding a minimum number of **Ceph** monitor nodes:

```bash
 juju deploy -n 3 ceph-mon
```

For the storage nodes we will also need to specify storage volumes for the backing cloud to add. This is done by using the `--storage` option. The [`ceph-osd` charm][ceph-charm] defines two useful types of storage, `osd-devices` for the volumes which will be formatted and used to provide storage, and `osd-journals` for storage used for journalling.

The format for the `--storage` option is `<storage pool>,<size>,<number>`. The storage pools available are dependent on and defined by the backing cloud. However, by omitting the storage type, the default pool for that cloud will be chosen (E.g. for AWS, the default pool is EBS storage).

So, for example, to deploy three `ceph-osd` storage nodes, using the default storage pool, with 2x 32G volumes of storage per node, and one 8G journal, we would use the command:

```bash
 juju deploy -n 3 ceph-osd --storage osd-devices=32G,2 --storage osd-journals=8G,1
```

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">For a more detailed explanation of Juju's storage pools and options, please see the relevant <a href="https://juju.is/docs/juju/defining-and-using-persistent-storage">Juju documentation</a>.</p>
  </div>
</div>

Note that actually deploying these charms with storage may take some time, but you can continue to run other Juju commands in the meantime.

The `ceph-osd` and `ceph-mon` deployments should then be connected:

```bash
juju integrate ceph-osd ceph-mon
```

If you wish to include CephFS support, which allows for ReadWriteMany volumes,
you can also deploy and relate `ceph-fs`:

```bash
juju deploy -n1 ceph-fs
juju integrate ceph-fs ceph-mon
```

**Charmed Kubernetes** will then deploy the CephFS provisioner pod
and create a `cephfs` storage class in the cluster.

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">CephFS support in Kubernetes requires at least Ubuntu 18.04LTS and OpenStack Train. OpenStack Ussuri or newer is recommended.</p>
  </div>
</div>

When deploying **Charmed Kubernetes** on Ubuntu 18.04(Bionic), you will need
to explicitly set the `install_sources` config option on the `kubernetes-control-plane`
charm to include `cloud:bionic-ussuri` (or whatever OpenStack release you are
using).

When using OpenStack Train, ReadWriteMany (RWX) CephFS volumes on containers
running as a non-root user will be mounted as owned by root instead of the
container's user, potentially leading to permissions issues.  You can work
around this by adding an initContainer to your pod to adjust the mounted
volume's ownership or permissions. For example:

```yaml
initContainers:
  - name: fix-cephfs-rwx-volume-perm
    securityContext:
      runAsUser: 0
    image: ubuntu  # or whatever image your pod is using
    volumeMounts:
      - name: shared-data  # adjust volume name and mountPath
        mountPath: /data   # to match your pod spec
    command: ['chmod', '0777', '/data']
```

### Relate to Charmed Kubernetes

Making **Charmed Kubernetes** aware of your **Ceph** cluster requires a **Juju** relation.

```bash
juju integrate ceph-mon:client kubernetes-control-plane
```

### Create storage pools

By default, the `kubernetes-control-plane` charm will create the required pools defined
in the storage class.  To view the default options, run:

```bash
juju list-actions ceph-mon --schema --format json | jq '.["create-pool"]'
```

If you're happy with this, you can skip the section.  Otherwise, if you want to
change these, you can delete the pools:

```bash
juju exec --unit ceph-mon/0 "ceph tell mon.\* injectargs '--mon-allow-pool-delete=true'"

juju run ceph-mon/0 delete-pool name=xfs-pool
juju run ceph-mon/0 delete-pool name=ext4-pool
```

Then recreate them, using the options listed from the `list-actions` command ran
earlier.  For example:

```bash
juju run ceph-mon/0 create-pool name=xfs-pool replicas=6
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
juju run ceph-mon/0 create-pool name=ext4-pool replicas=6
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

### Verification

Now you can look at your **Charmed Kubernetes** cluster to verify things are working. Running:

```bash
kubectl get sc,po
```

... should return output similar to:

```no-highlight
NAME                                             PROVISIONER           RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
storageclass.storage.k8s.io/ceph-ext4            rbd.csi.ceph.com      Delete          Immediate           false                  7m
storageclass.storage.k8s.io/ceph-xfs (default)   rbd.csi.ceph.com      Delete          Immediate           false                  7m
storageclass.storage.k8s.io/cephfs               cephfs.csi.ceph.com   Delete          Immediate           false                  7m

NAME                                 READY   STATUS    RESTARTS   AGE
pod/csi-cephfsplugin-attacher-0      1/1     Running   0          7m
pod/csi-cephfsplugin-bzzgn           2/2     Running   0          7m
pod/csi-cephfsplugin-provisioner-0   2/2     Running   0          7m
pod/csi-rbdplugin-69xp6              2/2     Running   0          7m
pod/csi-rbdplugin-attacher-0         1/1     Running   0          7m
pod/csi-rbdplugin-provisioner-0      3/3     Running   0          7m
```

Note that the CephFS storage class and pods will only be present if CephFS was included above.

### Scaling out

To check existing storage allocation, use the command:

```bash
juju storage
```

If extra storage is required, it is possible to add extra `ceph-osd` units as
desired:

```bash
juju add-unit ceph-osd -n 2
```

Once again, it is necessary to attach appropriate storage volumes as before. In this case though, the storage needs to be added on a per-unit basis.

Confirm the running units of `ceph-osd`

```bash
juju status ceph-osd
```

Add additional storage to existing or new units with the `add-storage` command. For example, to add two volumes of 32G to the unit `ceph-osd/2`:

```bash
juju add-storage ceph-osd/2 --storage osd-devices=32G,2
```

### Using a separate Juju model

In some circumstances it can be useful to locate the persistent storage in a different **Juju** model, for example to have one set of storage used by different clusters. The only change required is in adding relations between **Ceph** and **Charmed Kubernetes**.

For more information on how to achieve this, please see the [Juju documentation][juju-cmr] on cross-model relations.

## NFS

It is possible to add simple storage for **Kubernetes** using NFS. In this case, the storage is implemented on the root disk of units running the `nfs` charm.

### Deploy NFS

Make use of **Juju** constraints to allocate an instance with the required amount of storage. For example, for 200G of storage:

```bash
juju deploy nfs --constraints root-disk=200G
```

### Relate to Charmed Kubernetes

The NFS units can be related directly to the **Kubernetes** workers:

```bash
 juju integrate nfs kubernetes-worker
```

### Verification

Now you can look at your **Charmed Kubernetes** cluster to verify things
are working. Running:

```bash
kubectl get sc,po
```

... should return output similar to:

```no-highlight
NAME                                            PROVISIONER      AGE
storageclass.storage.k8s.io/default (default)   fuseim.pri/ifs   3m

NAME                                                   READY     STATUS    RESTARTS   AGE
pod/nfs-client-provisioner-778dcffbc8-2725b            1/1       Running   0          3m
```

### Scaling out

If extra storage is required, it is possible to add extra `nfs` units as desired. For example, to add three new units, each with 100G of storage:

```bash
juju add-unit nfs  -n 3 --constraints root-disk=100G
```

There is no requirement that these additional units should have the same amount of storage space as previously.

<!-- LINKS -->

[kubernetes-storage-docs]: https://kubernetes.io/docs/concepts/storage/
[ceph-home]: https://ceph.com/
[ceph-charm]: https://charmhub.io/ceph-osd
[juju-storage]: https://juju.is/docs/juju/defining-and-using-persistent-storage
[juju-cmr]: https://juju.is/docs/juju/cross-model-relations

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/storage.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
