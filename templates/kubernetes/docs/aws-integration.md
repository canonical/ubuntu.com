---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on AWS"
  description: Running Charmed Kubernetes on AWS using the aws-integrator.
keywords: aws, integrator, ebs, elb
tags: [install]
sidebar: k8smain-sidebar
permalink: aws-integration.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** will run seamlessly on AWS.  With the addition of the
`aws-integrator`, your cluster will also be able to directly use AWS native
features.


## AWS integrator

The `aws-integrator` charm simplifies working with **Charmed Kubernetes** on
AWS. Using the credentials provided to **Juju**, it acts as a proxy between
Charmed Kubernetes and the underlying cloud, granting permissions to
dynamically create, for example, EBS volumes.

### Installing

If you install **Charmed Kubernetes** [using the Juju bundle][install], you can add the
aws-integrator at the same time by using the following overlay file ([download
it here][asset-aws-overlay]):

```yaml
description: Charmed Kubernetes overlay to add native AWS support.
applications:
  aws-integrator:
    annotations:
      gui-x: "600"
      gui-y: "300"
    charm: cs:~containers/aws-integrator
    num_units: 1
    trust: true
relations:
  - ['aws-integrator', 'kubernetes-master']
  - ['aws-integrator', 'kubernetes-worker']
  ```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified during deploy like this:

```bash
juju deploy charmed-kubernetes  --overlay ~/path/aws-overlay.yaml --trust
```

... and remember to fetch the configuration file!

```bash
juju scp kubernetes-master/0:config ~/.kube/config
```

For more configuration options and details of the permissions which the integrator uses,
please see the [charm readme][aws-integrator-readme].

### Using EBS volumes

Many  pods you may wish to deploy will require storage. Although you can use
any type of storage supported by Kubernetes (see the
[storage documentation][storage]), you also have the option to use the native
AWS storage, Elastic Block Store (EBS).

First we need to create a storage class which can be used by Kubernetes.
To start with, we will create one for the 'General Purpose SSD' type of EBS
storage:

```bash
kubectl create -f - <<EOY
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp2
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
EOY
```

You can confirm this has been added by running:

```bash
kubectl get sc
```

which should return:
```bash
NAME      PROVISIONER             AGE
ebs-gp2   kubernetes.io/aws-ebs   39s
```

You can create additional storage classes for the other types of EBS storage if
needed, simply give them a different name and replace the 'type: gp2' with a
different type (See the [AWS website][ebs-info] for more information on the
available types).

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
  storageClassName: ebs-gp2
EOY
```

This should finish with a confirmation. You can check the current PVCs with:

```bash
kubectl get pvc
```

...which should return something similar to:

```bash
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
testclaim   Bound    pvc-54a94dfa-3128-11e9-9c54-028fdae42a8c   1Gi        RWO            ebs-gp2        9s
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
If you create EBS volumes and subsequently tear down the cluster, check
with the AWS console to make sure all the associated resources have also been released.
  </p>
</div>

### Using ELB Loadbalancers

With the aws-integrator charm in place, actions which invoke a loadbalancer in
Kubernetes  will automatically generate an AWS Elastic Load Balancer.  This can
be demonstrated with a simple application. Here we will create a simple
application and scale it to five pods:

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

To create a LoadBalancer, the application should now be exposed as a service:

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
IP:                       10.152.183.134
LoadBalancer Ingress:     ad5fc7750350611e99768068a686bb67-239702253.eu-west-1.elb.amazonaws.com
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
NodePort:                 <unset>  31203/TCP
Endpoints:                10.1.13.4:8080,10.1.13.5:8080,10.1.35.8:8080 + 2 more...
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
```

You can see that the LoadBalancer Ingress is now associated with an ELB address in front
of the five endpoints of the  example deployment. Leaving a while for DNS propagation, you
can test the ingress address:

```bash
curl  http://ad5fc7750350611e99768068a686bb67-239702253.eu-west-1.elb.amazonaws.com:8080
```
```
Hello Kubernetes!
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
If you create ELBs and subsequently tear down the cluster, check with the AWS console
to make sure all the associated resources have also been released.
  </p>
</div>

### Upgrading the integrator-charm

The aws-integrator is not specifically tied to the version of Charmed Kubernetes installed and may
generally be upgraded at any time with the following command:

```bash
juju upgrade-charm aws-integrator
```

### Troubleshooting

If you have any specific problems with the aws-integrator, you can report bugs on
[Launchpad][bugs].

The aws-integrator charm makes use of IAM accounts in AWS to perform actions, so
useful information can be obtained from [Amazon's CloudTrail][cloudtrail],
which logs such activity.

For logs of what the charm itself believes the world to look like, you can use
Juju to replay the log history for that specific unit:

```bash
juju debug-log --replay --include aws-integrator/0
```

## See also:

If you are an AWS user, you may also be interested in how to
[use AWS IAM for authorisation and authentication][aws-iam].

<!-- LINKS -->

[asset-aws-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/aws-overlay.yaml
[quickstart]: /kubernetes/docs/quickstart
[storage]: /kubernetes/docs/storage
[ebs-info]: https://aws.amazon.com/ebs/features/
[cloudtrail]: https://console.aws.amazon.com/cloudtrail/
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[aws-integrator-readme]: https://charmhub.io/containers-aws-integrator
[aws-iam]: /kubernetes/docs/aws-iam-auth
[install]: /kubernetes/docs/install-manual

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/aws-integration.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.
  </p>
</div>
