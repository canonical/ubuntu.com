---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Backups"
  description: How to backup and restore the state of your Kubernetes cluster in the etcd datastore.
---

The state of your **Kubernetes** cluster is kept in the **etcd** datastore. This page shows how to backup and restore the etcd included in the **Canonical Distribution of Kubernetes <sup>&reg;</sup>**.

Backing up application specific data, normally stored in a persistent volume, is not currently supported by native Kubernetes. Various third party solutions are available -
please refer to their own documentation for details.

## Creating an **etcd** snapshot

 <div class="p-notification--warning"><p markdown="1" class="p-notification__response">
 <span class="p-notification__status">Warning:</span>
 Snapshots can only be restored on the **same version of etcd**.
  </p></div>

**etcd** is a distributed key/value store. To create a snapshot, all that is required is to run the `snapshot` action on one of the units running **etcd**:

```bash
juju run-action etcd/0 snapshot keys-version=v3 --wait
```

By specifying `--wait`, the console will wait to return the result of running the action, which in this case includes the path and filename of the generated snapshot file. For example:

```yaml
unit-etcd-0:
 id: 3d6a505e-07d7-4697-8471-60156f87b1b4
 results:
   copy:
     cmd: juju scp etcd/0:/home/ubuntu/etcd-snapshots/etcd-snapshot-2018-09-26-18.04.02.tar.gz
       .
   snapshot:
     path: /home/ubuntu/etcd-snapshots/etcd-snapshot-2018-09-26-18.04.02.tar.gz
     sha256: e85ae4d49b6a889de2063031379ab320cc8f09b6e328cdff2fb9179fc641eee9
     size: 68K
     version: |-
       etcdctl version: 3.2.10
       API version: 2
 status: completed
 timing:
   completed: 2018-09-26 18:04:04 +0000 UTC
   enqueued: 2018-09-26 18:04:04 +0000 UTC
   started: 2018-09-26 18:04:03 +0000 UTC
 unit: etcd/0
```

This path/filename relates to the unit where the action was run. As we will likely want to use the snapshot on a different unit, we should fetch the snapshot to the local machine. The command to perform this is also helpfully supplied in the `copy` section of the output (see above):

```bash
  juju scp etcd/0:/home/ubuntu/etcd-snapshots/etcd-snapshot-2018-09-26-18.04.02.tar.gz .
```

It is also wise to check the sha256 checksum of the file you have copied
against the value in the previous output:

```bash
sha256sum etcd-snapshot-2018-09-26-18.04.02.tar.gz
```

## Restoring a snapshot

<div class="p-notification--warning"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Warning:</span>
Restoring a snapshot should not be performed when there is more than one unit of **etcd** running.
 </p></div>

As restoring only works when there is a single unit of **etcd**, it is usual to deploy a new instance of the application first.

```bash
juju deploy etcd new-etcd --series=bionic
```

The `--series` option is included here to illustrate how to specify which series the new unit should be running on.

Next we upload and identify the snapshot file to this new unit:

```bash
juju attach newer-etcd snapshot=./etcd-snapshot-2018-09-26-18.04.02.tar.gz
```

Then run the restore action:

```bash
juju run-action new-etcd/0 restore --wait
```

Once the restore action has finished, you should see output confirming that the operation is `completed`. The new etcd application will need to be connected to the rest of the deployment:

```bash
juju add-relation new-etcd kubernetes-master
juju add-relation new-etcd flannel
```

To restore the cluster capabilities of etcd, you can now add more units:

```bash
juju add-unit new-etcd -n 2
```

Once the deployment has settled and all `new-etcd` units report ready, verify the cluster health with:

```bash
 juju run-action new-etcd/0 health --wait
```

which should return something similar to:

```yaml
unit-new-etcd-0:
  id: 27fe2081-6513-4968-869d-6c2c092210a1
  results:
    result-map:
      message: |-
        member 3c149609bfcf7692 is healthy: got healthy result from https://172.31.18.7:2379
        cluster is healthy
  status: completed
  timing:
    completed: 2018-10-26 15:16:33 +0000 UTC
    enqueued: 2018-10-26 15:16:32 +0000 UTC
    started: 2018-10-26 15:16:33 +0000 UTC
  unit: new-etcd/0
```
