---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on GCP"
  description: Running Charmed Kubernetes on Google Cloud Platform using the gcp-integrator.
keywords: gcp, integrator, LoadBalancer
tags: [install]
sidebar: k8smain-sidebar
permalink: gcp-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will run seamlessly on
**Google Cloud Platform**(GCP).  With the addition of the `gcp-integrator`,
your cluster will also be able to use GCP native features directly.

## GCP Credentials

If you have set up a service account with IAM roles as your credential for
Juju, there may be some additional authorisations you will need to make to
access all features of GCP with **Charmed Kubernetes**.

If you have a GCP project set up specifically for **Charmed Kubernetes**, the
quickest route is to simply add the service account as an `Owner` of that
project in the [GCP console][owner].

If you chose a more fine-grained approach to role administration, the service account
should have at least:

  - roles/compute.loadBalancerAdmin
  - roles/compute.instanceAdmin.v1
  - roles/compute.securityAdmin
  - roles/iam.serviceAccountUser

A full description of the various pre-defined roles is available in the
[GCP Documentation][iam-roles].

## GCP integrator

The `gcp-integrator` charm simplifies working with **Charmed Kubernetes** on
GCP. Using the credentials provided to Juju, it acts as a proxy between
**Charmed Kubernetes** and the underlying cloud, granting permissions to
dynamically create, for example, storage volumes.

## GCP K8S Storage

The `gcp-k8s-storage` charm moves the GCP specific functions of the PD csi-driver
out-of-tree. Using this charm, the drivers are installed as workloads in the kubernetes
cluster instead of as natural code paths of the kubernetes binaries.


### Installing

If you install **Charmed Kubernetes** [using the Juju bundle][install], you can add the
gcp-integrator at the same time by using the following overlay file ([download
it here][asset-gcp-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native GCP support.
applications:
  gcp-integrator:
    charm: gcp-integrator
    num_units: 1
    trust: true
relations:
  - ['gcp-integrator', 'kubernetes-control-plane']
  - ['gcp-integrator', 'kubernetes-worker']
  ```

As well as the storage overlay file ([download it here][asset-gcp-storage-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native GCP storage support.
applications:
  kubernetes-control-plane:
    options:
      allow-privileged: "true"
  gcp-integrator:
    charm: gcp-integrator
    num_units: 1
    trust: true
  gcp-k8s-storage:
    charm: gcp-k8s-storage
    trust: true
    options:
      image-registry: k8s.gcr.io
relations:
- ['gcp-k8s-storage:certificates', 'easyrsa:client']
- ['gcp-k8s-storage:kube-control', 'kubernetes-control-plane:kube-control']
- ['gcp-k8s-storage:gcp-integration', 'gcp-integrator:gcp']
```

To use these overlays with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/gcp-overlay.yaml --overlay ~/path/gcp-storage-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

For more configuration options and details of the permissions which the
integrator uses, please see the [charm readme][gcp-integrator-readme].

### Using persistent storage

Many pods you may wish to deploy will require storage. Although you can use any
type of storage supported by Kubernetes (see the
[storage documentation][storage]), you also have the option to use the native
GCP storage types.

GCP storage currently comes in two types - SSD (pd-ssd) or
'standard'(pd-standard). To use these, we need to create a storage classes in
Kubernetes.

#### Beginning in Kubernetes 1.25

The `gcp-k8s-storage` charm will need to be installed to make use of PD Volumes.
Google removed CSIMigration away from the in-tree binaries but made them available
as container workload in the cluster. This charm installs and relates to the
existing integrator charm.

A StorageClass will be created by this charm named `csi-gce-pd-default`

You can confirm this has been added by running:

```bash
kubectl get sc
```

which should return:
```bash
NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
csi-gce-pd-default   pd.csi.storage.gke.io   Delete          WaitForFirstConsumer   false                  4h19m
```

#### Prior to Kubernetes 1.25

First we need to create a storage class which can be used by Kubernetes.
To start with, we will create one for the 'General Purpose SSD' type of EBS
storage:

For the standard disks:

```bash
kubectl create -f - <<EOY
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gcp-standard
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard
EOY
```

Or for SSD:

```bash
kubectl create -f - <<EOY
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gcp-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
EOY
```

You can confirm this has been added by running:

```bash
kubectl get sc
```

which should return:
```bash
NAME           PROVISIONER            AGE
gcp-ssd        kubernetes.io/gce-pd   9s
gcp-standard   kubernetes.io/gce-pd   45s
```

#### Creating a PVC

To actually create storage using this new class, you can make a Persistent Volume Claim:

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
  storageClassName: gcp-standard
EOY
```

This should finish with a confirmation. You can check the current PVCs with:

```bash
kubectl get pvc
```

...which should return something similar to:

```bash
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
testclaim   Bound    pvc-e1d42bae-44e6-11e9-8dff-42010a840007   1Gi        RWO            gcp-standard   15s
```

This PVC can then be used by pods operating in the cluster. As an example, the following
deploys a `busybox` pod:

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

To set this type of storage as the default, you can use the command:

```bash
kubectl patch storageclass gcp-standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you create persistent disks and subsequently tear down the cluster, check with the GCP console to make sure all the associated resources have also been released.</p>
  </div>
</div>

### Using GCP Loadbalancers

With the gcp-integrator charm in place, actions which invoke a loadbalancer in
Kubernetes  will automatically generate a GCP [Target Pool][target-pool] and the
relevant forwarding rules.  This can be demonstrated with a simple application. Here we
will create a simple application and scale it to five pods:

```bash
kubectl create deployment hello-world --image=gcr.io/google-samples/node-hello:1.0
kubectl scale deployment hello-world --replicas=5
```

You can verify that the application and replicas have been created with:

```bash
kubectl get deployments hello-world
```

Which should return output similar to:

```bash
NAME              READY   UP-TO-DATE   AVAILABLE   AGE
hello-world      5/5               5                            5             2m38s
```

To create a target pool load balancer, the application should now be exposed as
a service:

```bash
kubectl expose deployment hello-world --type=LoadBalancer --name=hello --port 8080
```

To check that the service is running correctly:

```bash
kubectl describe service hello
```

...which should return output similar to:

```yaml
Name:                     hello
Namespace:                default
Labels:                   run=load-balancer-example
Annotations:              <none>
Selector:                 run=load-balancer-example
Type:                     LoadBalancer
IP:                       10.152.183.63
LoadBalancer Ingress:     34.76.144.215
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
NodePort:                 <unset>  31864/TCP
Endpoints:                10.1.54.11:8080,10.1.54.12:8080,10.1.54.13:8080 + 2 more...
Session Affinity:         None
External Traffic Policy:  Cluster
Events:
  Type    Reason                Age    From                Message
  ----    ------                ----   ----                -------
  Normal  EnsuringLoadBalancer  9m21s  service-controller  Ensuring load balancer
  Normal  EnsuredLoadBalancer   7m37s  service-controller  Ensured load balancer

```

You can see that the `LoadBalancer Ingress` is now associated with a new
ingress address in front of the five endpoints of the  example deployment. You
can test this address:

```bash
curl 34.76.144.215:8080
```
```
Hello Kubernetes!
```

### Upgrading the charms

The charm `gcp-integrator` and `gcp-k8s-storage`
can be refreshed within the current charm channel without concern and
can be upgraded at any time with the following command,

```bash
juju refresh gcp-integrator
juju refresh gcp-k8s-storage
```

It isn't recommended to switch charm channels unless a full charm upgrade is planned.

### Troubleshooting

If you have any specific problems with the gcp-integrator, you can report bugs on
[Launchpad][bugs].

Any activity in GCP can be monitored from the [Operations][operations] console.
If you are using a service account with IAM roles, it is relatively easy to see
the actions that particular account is responsible for.

For logs of what the charm itself believes the world to look like, you can use
Juju to replay the log history for that specific unit:

```bash
juju debug-log --replay --include gcp-integrator/0
```


<!-- LINKS -->

[quickstart]: /kubernetes/docs/quickstart
[owner]: https://console.cloud.google.com/iam-admin/iam
[iam-roles]: https://cloud.google.com/compute/docs/access/iam
[asset-gcp-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/gcp-overlay.yaml
[asset-gcp-storage-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/gcp-storage-overlay.yaml
[operations]: https://console.cloud.google.com/compute/operations
[storage]: /kubernetes/docs/storage
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[gcp-integrator-readme]: https://charmhub.io/gcp-integrator/
[target-pool]: https://cloud.google.com/load-balancing/docs/target-pools
[install]: /kubernetes/docs/install-manual

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/gcp-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

