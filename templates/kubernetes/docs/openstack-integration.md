---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md" # Fix syntax highlighting: _.
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

### Prerequisites

OpenStack integration requires [Octavia][octavia] to be available in the
underlying OpenStack cloud, both to support Kubernetes LoadBalancer services
and to support creation of a load balancer for the Kubernetes API.

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
    charm: openstack-integrator
    num_units: 1
    trust: true
relations:
  - ['openstack-integrator', 'kubernetes-control-plane:openstack']
  - ['openstack-integrator', 'kubernetes-worker:openstack']
```

To use the overlay with the **Charmed Kubernetes** bundle, specify it during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/openstack-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

For more configuration options and details of the permissions which the integrator uses,
please see the [charm docs][openstack-integrator-readme].

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Resources allocated by Kubernetes or the integrator are usually cleaned up automatically when no
    longer needed. However, it is recommended to periodically, and particularly after tearing down a
    cluster, use the OpenStack administration tools to make sure all unused resources have been
    successfully released.</p>
  </div>
</div>

### Using Octavia Load Balancers

There are two ways in which Octavia load balancers can be used with **Charmed Kubernetes**:
load balancers automatically created by Kubernetes for `Services` which sit in front of `Pods` and
are defined with `type=LoadBalancer`, and as a replacement for the load balancer in front of the
API server itself.

In either case, the load balancers can optionally have floating IPs (FIPs) attached to them to
allow for external access.

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">For security reasons, the security groups automatically managed by Juju will not by default allow
    traffic into the nodes from external networks which can otherwise reach the FIPs. The easiest way to
    allow this is to add a rule to the model security group (named `juju-<model UUID>`) to allow ingress traffic
    from the FIP network, according to your security and network traffic policy and needs.
    Alternatively, you could create a separate security group to manage the rule(s) across multiple models or
    controllers.<br/>
    <br/>
    Configuring or creating a security group will also be necessary if you wish to have the Amphora instances in a
    different subnet from the node instances, since you will need to allow at least traffic on the
    NodePort range (30000-32767) from the Amphorae into the nodes.</p>
  </div>
</div>

#### LoadBalancer-type Pod Services

To use Octavia for `LoadBalancer` type services in the cluster, you will also need to set the
`subnet-id` config to the appropriate tenant subnet where your nodes reside, and if desired, the
`floating-network-id` config to whatever network you want FIPs created in.  See the 
[Charm config docs][charm-config] for more details.

As an example of this usage, this will create a simple application, scale it to five pods,
and expose it with a `LoadBalancer`-type `Service`:

```bash
kubectl create deployment hello-world --image=gcr.io/google-samples/node-hello:1.0
kubectl scale deployment hello-world --replicas=5
kubectl expose deployment hello-world --type=LoadBalancer --name=hello --port 8080
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


#### API Server Load Balancer

If desired, the openstack-integrator can also replace kubeapi-load-balancer and create a native
OpenStack load balancer for the Kubernetes API server, which simplifies the model and is properly
HA, which kubeapi-load-balancer on its own is not. To enable this, use this overlay instead
([download it here][asset-openstack-lb-overlay]):

```yaml
applications:
  kubeapi-load-balancer: null
  openstack-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: openstack-integrator
    num_units: 1
    trust: true
relations:
  - ['openstack-integrator', 'kubernetes-control-plane:loadbalancer']
  - ['openstack-integrator', 'kubernetes-control-plane:openstack']
  - ['openstack-integrator', 'kubernetes-worker:openstack']
```

You will also need to set the `lb-subnet` config to the appropriate tenant subnet where your nodes
reside, and if desired, the `lb-floating-network` config to whatever network you want the FIP created
in.  See the [Charm config docs][charm-config] for more details.

### Using Cinder Volumes

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

### Using Keystone Authentication / Authorisation

The `openstack-integrator` also provides an interface for authentication and authorisation using
Keystone. This is covered in detail in the [Keystone and LDAP documentation][ldap].

### Upgrading the integrator charm

The openstack-integrator is not specifically tied to the version of Charmed Kubernetes installed and may
generally be upgraded at any time with the following command:

```bash
juju refresh openstack-integrator
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

[octavia]: https://docs.openstack.org/octavia/latest/reference/introduction.html
[asset-openstack-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/openstack-overlay.yaml
[asset-openstack-lb-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/openstack-lb-overlay.yaml
[storage]: /kubernetes/docs/storage
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[openstack-integrator-readme]: https://charmhub.io/containers-openstack-integrator/
[install]: /kubernetes/docs/install-manual
[ldap]: /kubernetes/docs/ldap
[charm-config]: https://ubuntu.com/kubernetes/docs/charm-openstack-integrator#configuration

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/openstack-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

