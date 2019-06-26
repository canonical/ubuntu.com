---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "CDK on OpenStack"
  description: Running CDK on OpenStack using the openstack-integrator.
keywords: openstack, integrator, cinder, lbaas
tags: [install]
sidebar: k8smain-sidebar
permalink: openstack-integration.html
layout: [base, ubuntu-com]
toc: False
---

The **Charmed Distribution of Kubernetes<sup>&reg;</sup>** will run seamlessly
on OpenStack. With the addition of the `openstack-integrator`, your cluster
will also be able to directly use OpenStack native features.


## OpenStack integrator

The `openstack-integrator` charm simplifies working with **CDK** on OpenStack. Using the
credentials provided to Juju, it acts as a proxy between CDK and the underlying cloud,
granting permissions to dynamically create, for example, Cinder volumes.

### Installing

When installing **CDK** using the Juju bundle, you can add the openstack-integrator at
the same time by using the following overlay file
([download it here][asset-openstack-overlay]):

```yaml
applications:
  openstack-integrator:
    charm: cs:~containers/openstack-integrator
    num_units: 1
relations:
  - ['openstack-integrator', 'kubernetes-master']
  - ['openstack-integrator', 'kubernetes-worker']
  ```

To use this overlay with the **CDK** bundle, it is specified during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/openstack-overlay.yaml
```

Then run the command to share credentials with this charm:

```bash
juju trust openstack-integrator
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

A `cinder` storage class will be automatically created for you when the integrator is
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
      storage: 100Mi
  storageClassName: cinder
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

### Upgrading the integrator charm

The openstack-integrator is not specifically tied to the version of CDK installed and may
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

[asset-openstack-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/kubernetes-docs/master/assets/openstack-overlay.yaml
[storage]: /kubernetes/docs/storage
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[openstack-integrator-readme]: https://jujucharms.com/u/containers/openstack-integrator/
