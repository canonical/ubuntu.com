---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on OpenStack"
  description: Running Charmed Kubernetes on OpenStack using the openstack-integrator.
keywords: openstack, integrator, cinder, lbaas
tags: [install]
sidebar: k8smain-sidebar
permalink: openstack-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will run seamlessly
on OpenStack. With the addition of the `openstack-integrator`, your cluster
will also be able to directly use OpenStack native features.


## OpenStack integrator

The `openstack-integrator` charm simplifies working with **Charmed Kubernetes** on OpenStack. Using the
credentials provided to Juju, it acts as a proxy between Charmed Kubernetes and the underlying cloud,
granting permissions to dynamically create, for example, Cinder volumes.

### Installing

When installing **Charmed Kubernetes** [using the Juju bundle][install], you can add the openstack-integrator at
the same time by using the following overlay file
([download it here][asset-openstack-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native OpenStack support.
applications:
  openstack-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: cs:~containers/openstack-integrator
    num_units: 1
    trust: true
relations:
  - ['openstack-integrator', 'kubernetes-master:openstack']
  - ['openstack-integrator', 'kubernetes-worker:openstack']
```

If desired, the openstack-integrator can also replace kubeapi-load-balancer and create a native OpenStack
load balancer for the Kubernetes API server, which both reduces the number of machines required and is
HA. To enable this, use this overlay instead ([download it here][asset-openstack-lb-overlay]):

```yaml
applications:
  kubeapi-load-balancer: null
  openstack-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: cs:~containers/openstack-integrator
    num_units: 1
    trust: true
relations:
  - ['kubernetes-master:kube-api-endpoint', 'kubernetes-worker:kube-api-endpoint']
  - ['openstack-integrator', 'kubernetes-master:loadbalancer']
  - ['openstack-integrator', 'kubernetes-master:openstack']
  - ['openstack-integrator', 'kubernetes-worker:openstack']
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
If you create load balancers and subsequently tear down the cluster, check with
the OpenStack administration tools to make sure all the associated resources
have also been released.
  </p>
</div>

To use the overlay with the **Charmed Kubernetes** bundle, specify it during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/openstack-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju scp kubernetes-master/0:config ~/.kube/config
```

For more configuration options and details of the permissions which the integrator uses,
please see the [charm readme][openstack-integrator-readme].

### Using Cinder volumes

Many  pods you may wish to deploy will require storage. Although you can use any type
of storage supported by Kubernetes (see the [storage documentation][storage]), you
also have the option to use Cinder storage volumes, if supported by your OpenStack.

A `cdk-cinder` storage class will be automatically created when the integrator is
used.  This storage class can then be used when creating a Persistent Volume Claim:

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
      storage: 1Gi
  storageClassName: cdk-cinder
EOY
```

This should finish with a confirmation. You can check the current PVCs with:

```bash
kubectl get pvc
```

...which should return something similar to:

```bash
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
testclaim   Bound    pvc-54a94dfa-3128-11e9-9c54-028fdae42a8c   1Gi        RWO            cinder         9s
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

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
If you create Cinder volumes and subsequently tear down the cluster, check with
the OpenStack administration tools to make sure all the associated resources
have also been released.
  </p>
</div>

### Using LBaaS load balancers

With the openstack-integrator charm in place, actions which invoke a
loadbalancer in Kubernetes will automatically request a load balancer from
OpenStack using Octavia, if available, or Neutron. This can be demonstrated
with a simple application. Here we will create a simple application running in
five pods:

```bash
kubectl run hello-world --replicas=5 --labels="run=load-balancer-example" --image=gcr.io/google-samples/node-hello:1.0  --port=8080
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

To create a LoadBalancer, the application should now be exposed as a service:

```bash
 kubectl expose deployment hello-world --type=LoadBalancer --name=hello
 ```

To check that the service is running correctly:

```bash
kubectl get service hello
```

...which should return output similar to:

```yaml
NAME    TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
hello   LoadBalancer   10.152.183.136   202.49.242.3  8080:32662/TCP   2m
```

You can see that the External IP is now in front of the five endpoints of the
example deployment. You can test the ingress address:

```bash
curl  http://202.49.242.3:8080
```
```
Hello Kubernetes!
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
If you create load balancers and subsequently tear down the cluster, check with
the OpenStack administration tools to make sure all the associated resources
have also been released.
  </p>
</div>

#### Note: LBaaS and Security Groups

Charmed Kubernetes and the OpenStack integrator assume by default that you will
be using Octavia for load balancers, and that the Amphora instances providing
the LBs will reside in the same subnet as the workers and have at least traffic
on the NodePort range (30000-32767) open from the Amphora instances to the
worker instances. In general, Juju assumes that traffic between units in a model
and other resources used by that model is unrestricted or is otherwise managed
outside of Juju.

If you are instead using Neutron-based LBaaS, or if you have more restrictions
on traffic between resources within or used by the model, you may need to
either set the `manage-security-groups` [config option][charm-config] on the
OpenStack Integrator charm to `true`, or manage the security group rules
manually. Setting `manage-security-groups` to `true` will cause Kubernetes to
ensure that the nodes' port security groups include a rule allowing traffic from
the Amphorae to the nodes within the NodePort range.

### Upgrading the integrator charm

The openstack-integrator is not specifically tied to the version of Charmed Kubernetes installed and may
generally be upgraded at any time with the following command:

```bash
juju upgrade-charm openstack-integrator
```

### Troubleshooting

If you have any specific problems with the openstack-integrator, you can report bugs on
[Launchpad][bugs].

For logs of what the charm itself believes the world to look like, you can use Juju to replay
the log history for that specific unit:

```bash
juju debug-log --replay --include openstack-integrator/0
```


<!-- LINKS -->

[asset-openstack-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/openstack-overlay.yaml
[asset-openstack-lb-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/openstack-lb-overlay.yaml
[storage]: /kubernetes/docs/storage
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[openstack-integrator-readme]: https://jujucharms.com/u/containers/openstack-integrator/
[install]: /kubernetes/docs/install-manual
[charm-config]: https://ubuntu.com/kubernetes/docs/charm-openstack-integrator#configuration

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/openstack-integration.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
