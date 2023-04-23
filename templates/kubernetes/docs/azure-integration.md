---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on Azure"
  description: Running Charmed Kubernetes on Azure using the azure-integrator.
keywords: azure, integrator
tags: [install]
sidebar: k8smain-sidebar
permalink: azure-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will run seamlessly on Microsoft Azure <sup>&reg;</sup>.
With the addition of the `azure-integrator`, your cluster will also be able
to directly use Azure native features.


## Azure integrator

The `azure-integrator` charm simplifies working with **Charmed Kubernetes** on
Azure. Using the credentials provided to **Juju**, it acts as a proxy between
Charmed Kubernetes and the underlying cloud, granting permissions to
dynamically create, for example, storage.

### Installing using the Out-of-Tree Providers

If you install **Charmed Kubernetes** [using the Juju bundle][install],
you can add the `azure-cloud-provider` charm at the same time by using the following
overlay file ([download it here][asset-azure-cloud-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native Azure support.
applications:
  kubernetes-control-plane:
    options:
      register-with-taints: ""
      allow-privileged: "true"
  azure-integrator:
    charm: azure-integrator
    num_units: 1
    trust: true
  azure-cloud-provider:
    charm: azure-cloud-provider

relations:
- [ 'azure-cloud-provider:certificates', 'easyrsa:client' ]   # or whichever application supplies cluster certs
- [ 'azure-cloud-provider:kube-control', 'kubernetes-control-plane:kube-control' ]
- [ 'azure-cloud-provider:azure-integration', 'azure-integrator:clients' ]
- [ 'azure-cloud-provider:external-cloud-provider', 'kubernetes-control-plane:external-cloud-provider' ]
```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay azure-cloud-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

For more configuration options and details of the permissions which the
integrator uses, please see the [charm readme][azure-integrator].

### Installing using In-Tree Providers

The Kubernetes binaries have in-tree providers for common cloud platforms, 
and Azure is no different. The in-tree providers are less flexible, deprecated,
and will eventually cease to operate.  It's recommended to use the out-of-tree 
providers because of this.

If you install **Charmed Kubernetes** [using the Juju bundle][install],
you can add the azure-integrator alone at the same time by using the following
overlay file ([download it here][asset-azure-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native Azure support.
applications:
  azure-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: azure-integrator
    num_units: 1
    trust: true
relations:
  - ['azure-integrator', 'kubernetes-control-plane:azure']
  - ['azure-integrator', 'kubernetes-worker:azure']
  ```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay azure-overlay.yaml --trust
```

### Installation Notes

After installation, remember to fetch the configuration file!

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">A standard install of Charmed Kubernetes will use more resources than the current quotas allocated to a new Azure account. If you see error messages saying allocating machines would exceed your quota, you will need to log a <a href="https://docs.microsoft.com/en-us/azure/azure-portal/supportability/regional-quota-requests">support request with Azure</a> to increase the quota accordingly.</p>
  </div>
</div>

<div class="p-notification--caution is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Resource usage:</span>
    <p class="p-notification__message">By relating to this charm, other charms can directly allocate resources, such
    as managed disks and load balancers, which could lead to cloud charges and
    count against quotas. Because these resources are not managed by Juju, they
    will not be automatically deleted when the models or applications are
    destroyed, nor will they show up in Juju's status or GUI. It is therefore up
    to the operator to manually delete these resources when they are no longer
    needed, using the Azure management website or API.</p>
  </div>
</div>

## Storage

This section describes creating a busybox pod with a persistent volume claim
backed by Azure's Disk Storage. Differenced between the In-tree and Out-of-Tree 
storage will be noted in each step.

### 1. Create a storage class:
* Out-of-Tree uses the `azuredisk-csi-provisioner` provisioner and a
  storage class is already prepared.

  ```bash
  kubectl describe sc csi-azure-default
  ```
* In-Tree uses the `kubernetes.io/azure-disk` provisioner
  ```bash
  kubectl create -f - <<EOY
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: csi-azure-default
  provisioner: kubernetes.io/azure-disk
  parameters:
    storageaccounttype: Standard_LRS
    kind: managed
  EOY
  ```

### 2. Create a persistent volume claim using that storage class:

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
  storageClassName: csi-azure-default
EOY
```

### 3. Create the busybox pod with a volume using that PVC:

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

Charmed Kubernetes can make use of additional types of storage - for more
information see the [storage documentation][storage].

## Azure load-balancers for services

The following commands start the 'hello-world' pod behind an Azure-backed
load-balancer.

Here are the commands for Kubernetes 1.18+ and above as the kubectl run command was deprecated:

```bash
# Kubernetes 1.18+
kubectl create deployment hello-world --image=gcr.io/google-samples/node-hello:1.0 --port=8080
kubectl expose deployment hello-world --type=LoadBalancer --name=hello
watch kubectl get svc -o wide --selector=app=hello-world
```

Here are the commands for Kubernetes 1.17 and below where the kubectl run command can be used:

```bash
# Kubernetes 1.17 and below
kubectl run hello-world --replicas=5 --labels="run=load-balancer-example" --image=gcr.io/google-samples/node-hello:1.0  --port=8080
kubectl expose deployment hello-world --type=LoadBalancer --name=hello
watch kubectl get svc hello -o wide
```

You can then verify this works by loading the described IP address (on port
8080!) in a browser.

For more configuration options and details of the permissions which the integrator uses,
please see the [azure-integrator charm page][azure-integrator] and 
[azure-cloud-provider charm page][azure-cloud-provider].

## Azure load-balancers for the control plane

With revision 1015 and later of the `kubernetes-control-plane` charm, Charmed
Kubernetes can also use Azure native load balancers in front of the control
plane, replacing the need to deploy the `kubeapi-load-balancer` charm. The
`kubernetes-control-plane` charm supports two relation endpoints, `loadbalancer-external`
for a publicly accessible load balancer which can be used by external clients as
well as the control plane, and `loadbalancer-internal` for a non-public load
balancer which can only be used by the rest of the control plane but not by
external clients.

<!-- LINKS -->

[asset-azure-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/azure-overlay.yaml
[asset-azure-cloud-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/azure-cloud-overlay.yaml

[storage]: /kubernetes/docs/storage
[azure-cloud-provider]: https://charmhub.io/azure-cloud-provider/docs
[azure-integrator]: https://charmhub.io/azure-integrator/docs

[install]: /kubernetes/docs/install-manual

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/azure-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

