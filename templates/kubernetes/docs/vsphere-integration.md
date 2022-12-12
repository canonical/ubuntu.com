---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on vSphere"
  description: Running Charmed Kubernetes on vSphere using the integrator.
keywords: vsphere, integrator
tags: [install]
sidebar: k8smain-sidebar
permalink: vsphere-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will install and run on vSphere virtual servers.
With the  addition of the `vsphere-integrator`, your cluster will also be able
to directly use native vSphere features such as storage.

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">These instructions for deploying Charmed Kubernetes with the vSphere integrator assume that Juju has been configured appropriately for your vSphere server. For reference, the configuration options may be found in the <a href="https://juju.is/docs/olm/vmware-vsphere" >Juju documentation</a>.</p>
  </div>
</div>

## vSphere integrator

The `vsphere-integrator` charm simplifies working with **Charmed Kubernetes** on
vSphere servers. Using the credentials provided to **Juju**, it acts as a proxy between
Charmed Kubernetes and the underlying cloud, granting permissions to
dynamically create, for example, storage.

### Model configuration

If the cluster has multiple datastores or a non-default network name, you'll need to configure the model defaults before deployment. For example:

```bash
juju model-config datastore=mydatastore primary-network=mynetwork
```

### Installing

If you install **Charmed Kubernetes** [using the Juju bundle][install],
you can add the vsphere-integrator at the same time by using the following
overlay file ([download it here][asset-vsphere-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native vSphere support.
applications:
  vsphere-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: vsphere-integrator
    num_units: 1
    trust: true
relations:
  - ['vsphere-integrator', 'kubernetes-control-plane']
  - ['vsphere-integrator', 'kubernetes-worker']
  ```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay vsphere-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju scp kubernetes-control-plane/0:config ~/.kube/config
```

<div class="p-notification--caution is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Resource usage:</span>
    <p class="p-notification__message">By relating to this charm, other charms can directly allocate resources, such as managed disks and load balancers, which could lead to cloud charges and
    count against quotas. Because these resources are not managed by Juju, they
    will not be automatically deleted when the models or applications are
    destroyed, nor will they show up in Juju's status or GUI. It is therefore up
    to the operator to manually delete these resources when they are no longer
    needed.</p>
  </div>
</div>

## Configuration

The vSphere integrator supports multiple configuration options which can be
used to describe the vSphere environment.

The only required option is `datastore`, as it is not included in the Juju
credential that this charm relies on. By default, this is set to *datastore1*.
This can be changed with:

```bash
juju config vsphere-integrator datastore='mydatastore'
```

You may also configure a *folder* and *resource pool path* for this charm.
Details about these options can be found in the [vmware documentation][]:

```bash
juju config vsphere-integrator folder='juju-kubernetes' respool_path='foo'
```

The credentials used to interact with vSphere are obtained from Juju 
(via '--trust' during deployment). These may be overriden by specifying 
credentials directly in the charm configuration:

```bash
juju config vsphere-integrator \
  vsphere_ip='a.b.c.d' \
  user='joe' \
  password='passw0rd' \
  datacenter='dc0'
```

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If any configuration option is set, they must all be set.</p>
  </div>
</div>

When all of the credential config options are empty, this charm will fall
back to the credential data it received via `juju trust`.

## Storage

The vSphere integrator can make use of vSphere-backed storage for Kubernetes.
The steps below create a busybox pod with a persistent volume claim backed by
vSphere's PersistentDisk as an example.


### 1. Create a storage class using the `kubernetes.io/vsphere-volume` provisioner:

```bash
kubectl create -f - <<EOY
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mystorage
provisioner: kubernetes.io/vsphere-volume
parameters:
  diskformat: zeroedthick
EOY
```

### 2. Create a persistent volume claim (PVC) using that storage class:

```bash
kubectl create -f - <<EOY
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: testclaim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
  storageClassName: mystorage
EOY
```

### 3. Create a busybox pod with a volume using that PVC:

```bash
kubectl create -f - <<EOY
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  namespace: default
spec:
  containers:
    - image: busybox
      command:
        - sleep
        - "3600"
      imagePullPolicy: IfNotPresent
      name: busybox
      volumeMounts:
        - mountPath: "/pv"
          name: testvolume
  restartPolicy: Always
  volumes:
    - name: testvolume
      persistentVolumeClaim:
        claimName: testclaim
EOY
```

For more configuration options and details of the permissions which the integrator uses,
please see the [vSphere integrator charm page][vsphere-integrator].

<!-- LINKS -->

[asset-vsphere-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/vsphere-overlay.yaml

[storage]: /kubernetes/docs/storage
[vsphere-integrator]: https://charmhub.io/vsphere-integrator/docs
[vsphere-juju]: https://juju.is/docs/olm/vmware-vsphere
[install]: /kubernetes/docs/install-manual
[vmware documentation]: https://vmware.github.io/vsphere-storage-for-kubernetes/documentation/existing.html

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/vsphere-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
