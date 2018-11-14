---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Storage"
  description: How to add and configure different types of persistent storage for your Kubernetes cluster.
---

On-disk files in a container are ephemeral and can't be shared with other members of a pod. For some applications, this is not an issue, but for many persistent storage is required.

The **Canonical Distribution of Kubernetes**<sup>&reg;</sup> makes it easy to add and configure different types of persistent storage for your **Kubernetes** cluster, as outlined below. For more detail on the concept of storage volumes in **Kubernetes**, please see the [Kubernetes documentation][kubernetes-storage-docs].

## Ceph storage

**CDK** can make use of [Ceph][ceph-home] to provide persistent storage
volumes. The following sections assume you have already deployed a **CDK**
cluster and you have internet access to the **Juju** Charm Store.

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

<div class="p-notification--positive"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
For a more detailed explanation of Juju's storage pools and options, please see the relevant <a href="https://docs.jujucharms.com/stable/en/charms-storage">Juju documentation</a>.
</p></div>

Note that actually deploying these charms with storage may take some time, but you can continue

The `ceph-osd` and `ceph-mon` deployments should then be connected:

```bash
juju add-relation ceph-osd ceph-mon
```

### Relate to CDK

Making **CDK** aware of your **Ceph** cluster just requires a **Juju** relation.

```bash
juju add-relation ceph-mon kubernetes-master
```

Note that the **Ceph** CSI containers require privileged access:

```bash
juju config kubernetes-master allow-privileged=true
```

### Create storage pools

Finally, the pools that are defined in the storage class can be created:

```bash
juju run-action ceph-mon/0 create-pool name=xfs-pool --wait
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
juju run-action ceph-mon/0 create-pool name=ext4-pool --wait
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

Now you can look at your **CDK** cluster to verify things are working. Running:

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

### Using a separate **Juju** model

In some circumstances it can be useful to locate the persistent storage in a different **Juju** model, for example to have one set of storage used by different clusters. The only change required is in adding relations between **Ceph** and CDK.

For more information on how to achieve this, please see the [Juju documentation][juju-cmr] on cross-model relations.

## NFS

It is possible to add simple storage for **Kubernetes** using NFS. In this case, the storage is implemented on the root disk of units running the `nfs` charm.

### Deploy NFS

Make use of **Juju** constraints to allocate an instance with the required amount of storage. For example, for 200G of storage:

```bash
juju deploy nfs --constraints root-disk=200G
```

### Relate to CDK

The NFS units can be related directly to the **Kubernetes** workers:

```bash
 juju add-relation nfs kubernetes-worker
```

### Verification

Now you can look at your **CDK** cluster to verify things are working. Running:

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
[ceph-charm]: https://jujucharms.com/ceph-osd/
[juju-storage]: https://docs.jujucharms.com/stable/en/charms-storage
[juju-cmr]: https://docs.jujucharms.com/stable/en/models-cmr
