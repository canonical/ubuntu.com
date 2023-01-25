---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on vSphere"
  description: Running Charmed Kubernetes on vSphere using the out-of-tree provider.
keywords: vsphere, integrator
tags: [install]
sidebar: k8smain-sidebar
permalink: vsphere-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will install and run on vSphere virtual servers.
With the  addition of the `vsphere-cloud-provider` and the `vsphere-integrator`, your cluster will also be able
to directly use native vSphere features such as storage.

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">These instructions for deploying Charmed Kubernetes with the vSphere Cloud Provider assume that Juju has been configured appropriately for your vSphere server. For reference, the configuration options may be found in the <a href="https://juju.is/docs/olm/vmware-vsphere" >Juju documentation</a>.</p>
  </div>
</div>

## Upgrading from 1.25 to 1.26

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">vSphere CSI Migration requires vSphere 7.0u2. If you have in-tree vSphere volumes you should update to this version. On the other hand, if you do not need to migrate in-tree vSphere volumes you can use vSphere 67u3 and above. More information about the requirements may be found in the <a href="https://docs.vmware.com/en/VMware-vSphere-Container-Storage-Plug-in/2.0/vmware-vsphere-csp-getting-started/GUID-D4AAD99E-9128-40CE-B89C-AD451DA8379D.html#GUID-E59B13F5-6F49-4619-9877-DF710C365A1E" >vSphere documentation</a>.</p>
  </div>
</div>

vSphere has migrated to the out-of-tree provider and the legacy in-tree provider is marked for
deprecation. Nevertheless, it is possible to migrate the workload volumes provisioned with the
in-tree provider to the new out-of-tree provider. Follow the instructions below to prepare to
migrate the volumes:


### 1. Enable privileged containers support

The new out-of-tree provider requires privileged containers. Please ensure that your Kubernetes
cluster supports this. You can enable this feature using:

```bash
juju config kubernetes-control-plane allow-privileged=true
```

### 2. Install vSphere Cloud Provider
Install the vSphere Cloud Provider charm and relate it to the required components. Follow the
instructions in the [vsphere-cloud-provider][] charm documentation.

### 3. Prepare kube-controller and kubelet

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">In case you have other flags enabled on these components, remember to add the following flags to the existing configuration.</p>
  </div>
</div>


To enable volume migration you must add the CSIMigration and CSIMigrationvSphere flags in
kube-controller and kubelet options of the Kubernetes Control Plane. You can do this via
Juju using:

```bash
juju config kubernetes-control-plane controller-manager-extra-args="feature-gates=CSIMigration=true,CSIMigrationvSphere=true"
juju config kubernetes-control-plane kubelet-extra-config="{featureGates: {CSIMigration: true,CSIMigrationvSphere: true}}"
```

### 4. vSphere in-tree volume migrations

Now you can follow the instructions in the vSphere documentation about [Migrating In-Tree vSphere volumes][].

## vSphere Cloud Provider

The `vsphere-cloud-provider` charm allows **Charmed Kubernetes** to connect to the vSphere API 
via the out-of-tree cloud provider. This allow your cluster to manage parts of the vSphere infrastructure, 
such as virtual disks.

## vSphere integrator

The `vsphere-integrator` charm simplifies working with **Charmed Kubernetes** on
vSphere servers. Using the credentials provided to **Juju**, it acts as a proxy between
Charmed Kubernetes and the underlying cloud. This charm integrates with the `vsphere-cloud-provider` 
charm to share the credentials required for its operation.

### Model configuration

If the cluster has multiple datastores or a non-default network name, you'll need to configure the model defaults before deployment. For example:

```bash
juju model-config datastore=mydatastore primary-network=mynetwork
```

### Installing

If you install **Charmed Kubernetes** [using the Juju bundle][install],
you can add both `vsphere-cloud-provider` and `vsphere-integrator` at the same time by using the following
overlay file ([download it here][asset-vsphere-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native vSphere support.
applications:
  kubernetes-control-plane:
    options:
      allow-privileged: "true"
  vsphere-integrator:
    charm: vsphere-integrator
    num_units: 1
    trust: true
  vsphere-cloud-provider:
    charm: vsphere-cloud-provider
relations:
- - vsphere-cloud-provider:certificates
  - easyrsa:client
- - vsphere-cloud-provider:kube-control
  - kubernetes-control-plane:kube-control
- - vsphere-cloud-provider:external-cloud-provider
  - kubernetes-control-plane:external-cloud-provider
- - vsphere-cloud-provider:vsphere-integration
  - vsphere-integrator:clients
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
    <p class="p-notification__message">By relating to these charms, other charms can directly allocate resources, such as managed disks and load balancers, which could lead to cloud charges and
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

The vSphere charms can make use of vSphere-backed storage for Kubernetes.
The steps below create a busybox pod with a persistent volume claim backed by
vSphere's PersistentDisk as an example.


### 1. Create a storage class using the `csi.vsphere.vmware.com` provisioner:

```bash
kubectl create -f - <<EOY
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mystorage
provisioner: csi.vsphere.vmware.com
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

For more configuration options and details of the permissions which the cloud provider uses,
please see the [vSphere Cloud Provider charm page][vsphere-cloud-provider].

<!-- LINKS -->

[asset-vsphere-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/vsphere-overlay.yaml
[Migrating In-Tree vSphere volumes]: https://docs.vmware.com/en/VMware-vSphere-Container-Storage-Plug-in/2.0/vmware-vsphere-csp-getting-started/GUID-968D421F-D464-4E22-8127-6CB9FF54423F.html
[storage]: /kubernetes/docs/storage
[vsphere-cloud-provider]: https://charmhub.io/vsphere-cloud-provider/docs
[vsphere-juju]: https://juju.is/docs/olm/vmware-vsphere
[install]: /kubernetes/docs/install-manual
[vmware documentation]: https://docs.vmware.com/en/VMware-vSphere-Container-Storage-Plug-in/index.html

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/vsphere-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
