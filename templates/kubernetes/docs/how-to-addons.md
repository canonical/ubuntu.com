---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "How to use Charmed Kubernetes addon Operator Charms"
  description: Explaining how to install and configure addon operator charms with Charmed Kubernetes.
keywords: operating, add-ons, addons, config
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-addons.html
layout: [base, ubuntu-com]
toc: False
---

This page gives step by step guides for deploying the Operator Charm
versions of the **Charmed Kubernetes** addons. For an explanation
of these addons, please see the [addons page][].

##  Steps for all addons

In order for Juju to deploy Kubernetes applications, it will need to fetch
information and be configured to work with your Kubernetes cluster. 
These steps assume:
 * You have administrative access to the Charmed Kubernetes cluster.
 * Your Charmed Kubernetes is running in a model called 'ck-model'. Replace this term in the commands listed for a different model name.
 * Your Juju controller is running on version 2.9.30+. See instructions for upgrading a controller below.

#### 1. Confirm your Juju controller is up to date

Before creating and using a Kubernetes model, it is recommended to upgrade the 
controller model to the lastest version:

```bash
juju upgrade-model -m controller
```

#### 2. Install kubectl 

You will need **kubectl** to be able to use your Kubernetes cluster. If it is not already
installed, it is easy to add via a snap package:

```bash
sudo snap install kubectl --classic
```

For other platforms and install methods, please see the
[Kubernetes documentation][kubectl].

#### 3. Retrieve the required configuration

Juju makes use of the **kubectl** config file to access the Kubernetes cluster.
For Linux-based systems, this file is usually located at `~/.kube/config`

If you are already using `kubectl` to access other clusters you may wish to merge
the configurations rather than replacing it. The following command fetches the 
config file for `kubectl` from the Kubernetes cluster and saves it to the default location:

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

#### 4. Add the Kubernetes cluster to Juju

Next, add your Kubernetes cluster as a cloud to your current Juju controller:

```bash
juju add-k8s ck8s --controller $(juju switch | cut -d: -f1)
```

You may replace `ck8s` with whatever name you want to use to refer to this cloud, but
remember to substitute in the correct name in the remaining examples in this page.

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message"> Some operator charms may require access to storage. Please make sure your Kubernetes cluster has access to a storage class accessible to 
    the deployed applications.</p>
  </div>
</div>

#### 5. Add a model

To be able to deploy operators you will also need to create a Juju model in the cloud:

```
juju add-model k8s-model ck8s
```

Again, you should replace `k8s-model` with a name you want to use to refer to
this Juju model. As well as creating a Juju model, this action will also
create a Kubernetes namespace of the same name which you can use to easily
monitor or manage operators you install on the cluster.

#### 6. Switching between models

Juju will automatically "switch" to the new Kubernetes model you just created. 

Most of the instructions for the add-on components here require commands to be run 
in the model where Charmed Kubernetes is running and also in the model created on the Kubernetes cloud (which we have called `ck8s` in this page). Use the Juju `switch` command to see the currently available models:

```bash
juju switch
```
If you followed the example naming scheme, you should see something like this:


```bash
juju models
Controller: vs-bos

Model       Cloud/Region           Type        Status     Machines  Cores  Units  Access  Last connection

ck-model         vsphere-boston/Boston  vsphere     available        11     18  21     admin   29 minutes ago
controller  vsphere-boston/Boston  vsphere     available         1      -  -      admin   just now
k8s-model*   ck8s/default          kubernetes  available         0      -  -      admin   never connected
```

In the above case, there are three models available to the current controller. One is the model created
by the controller itself ("controller"), one is the model where Charmed Kubernetes is installed 
(in this case, it was called "ck-model") and the final one, which has an asterisk to indicate it is the current
model, is the one we just created. If you chose poor names or get confused between many different models, it is helpful to note that the "Type" field shows the underlying cloud type, so your kubernetes clouds are easier to spot.

To switch to the model which contains the CK cluster, we can run:

```bash
juju switch ck-model
```

...and to switch back to the model in the Kubernetes cloud:

```bash
juju switch k8s-model
```


## CoreDNS
CoreDNS is sourced from: <https://github.com/coredns/deployment.git>

CoreDNS has been the default DNS provider for **Charmed Kubernetes** clusters
since 1.14.

For additional control over CoreDNS, you can also deploy it into the cluster
using the [CoreDNS Kubernetes operator charm][coredns-charm], as described below.

#### 1. Disable in-tree CoreDNS

You will need access to the Juju model running Charmed Kubernetes (NOT the kubernetes cloud) and turn off the built-in DNS provider

```bash
juju switch ck-model
```

(replace "ck-model" with the model contianing Charmed Kubernetes)

With the Charmed Kubernetes model selected from Juju, run:

```bash
juju config kubernetes-control-plane dns-provider=none
```

#### 2. Deploy the CoreDNS operator 

Switch back to the Kubernetes cloud:

```bash
juju switch k8s-model
```

...and deploy the operator charm:

```bash
juju deploy coredns --channel=latest/stable --trust
```

You can check on the status of this deployment using the command:

```
kubectl get -n 'k8s-model' po
```

#### 3. Configure Charmed Kubernetes to use this DNS

Although the 'k8s-model' is running on top of the components installed in 'ck-model',
they are considered to be separate entities. To use an application running in one
model from a different model, Juju supports 'cross-model relations'. There are a few 
extra commands to enable this.

```bash
juju switch k8s-model
juju offer coredns:dns-provider
```

The offer command exposes the Juju relation for use in a different model. In the above, we
expose the `dns-provider` relation endpoint.  

To connect to that, switch models and use the `consume` command:

```bash
juju switch ck-model
juju consume k8s-model.coredns
```

The `consume` command is the counterpart to `offer`. It establishes a connection to the specified model and application, and adds that resource to the current model. A running
application in the model can then be related to it as thought it were a local model 
resource. In this case you want to connect it to the kubernetes-control-plane:

```bash
juju integrate -m ck-model coredns kubernetes-control-plane
```

Once everything settles, new or restarted pods will use the CoreDNS
charm as their DNS provider. The CoreDNS charm config allows you to change
the cluster domain, the IP address or config file to forward unhandled
queries to, add additional DNS servers, or even override the Corefile entirely.

For more details, see the [CoreDNS charm documentation][coredns-docs]

## Kubernetes Dashboard

Sourced from: <https://github.com/kubernetes/dashboard.git>

The Kubernetes Dashboard is a standard and easy way to inspect and
interact with your Kubernetes cluster. The dashboard operator charm 

#### 1. Disable the in-tree dashboard

Targeting the underlying cluster model ('ck-model' as used in these examples):

```bash
juju config kubernetes-control-plane enable-dashboard-addons=false
```

#### 2. Deploy the Dashboard charm

For additional control over the Kubernetes Dashboard, you can also deploy it into
the cluster using the [Kubernetes Dashboard operator charm][kubernetes-dashboard-charm].
To do so, set the `enable-dashboard-addons` [kubernetes-control-plane configuration][]
option to `false` and deploy the charm into a Kubernetes model on your cluster:

```bash
juju switch k8s-model
juju deploy kubernetes-dashboard --channel=latest/stable --trust
```

#### 3. Accessing the Dashboard

Allow the new dashboard time to settle - it needs to fetch and install various images and could take a few minutes depending on the underlying cloud.

Access to the Kubernetes Dashboard works as before. Please use the instructions in the [Operations page][].


## Metrics

The metrics addon consists of two services, Kube State Metrics and Kubernetes Metrics Server.
Both of these can be replaced by charm operators as detailed below. 

Before deploying the new charms, you should turn off the built-in metrics features:

```bash
juju switch ck-model
juju config kubernetes-control-plane enable-metrics=false
```

####  1. Kube-State Metrics

Sourced from: <https://github.com/kubernetes/kube-state-metrics.git>

Kube-State-Metrics is a service which listens to the Kubernetes API server and generates metrics about the state of the objects. It is focused on the health of the various objects running inside kubernetes, such as deployments, nodes and pods.

Deploy the [kube-state-metrics-operator][] charm into this kubernetes model with:

```bash
juju deploy kube-state-metrics --trust
```

If you have a prometheus application running in the same model, it can also be related to this:

```bash
juju integrate kube-state-metrics prometheus 
```


#### 2. Kubernetes Metrics Server

The Kubernetes Metrics Server collects resource metrics from Kubelets and exposes them in the Kubernetes apiserver through Metrics API for use by the Horizontal Pod Autoscaler and Vertical Pod Autoscaler. The  Metrics API can also be accessed by `kubectl top`, making it easier to debug autoscaling pipelines.

Since version 1.24, the `metrics-server` can be deployed into the cluster just like any other kubernetes application.

Firstly, ensure that the API aggregation is turned on

```
juju switch ck-model
juju config kubernetes-control-plane api-aggregation-extension=true
```

Then deploy the Kubernetes Metrics Server charm:

```bash
juju switch k8s-model
juju deploy kubernetes-metrics-server
```

Some of the new configuration options available through this charm are:

- upgrade the release of the `metrics-server` via config
  ```bash
  juju config kubernetes-metrics-server release="v0.6.0"
  ```
- adjust the base image registry if the cluster demands a private registry
  ```bash
  juju config kubernetes-metrics-server image-registry="my.registry.server:5000"
  ```
- adjust the arguments of the running service
  ```bash
  juju config kubernetes-metrics-server extra-args="--kubelet-insecure-tls"
  ```


<!-- LINKS -->
[addons page]: /kubernetes/docs/cdk-addons
[Operations page]: /kubernetes/docs/operations
[kubernetes-control-plane configuration]: https://charmhub.io/kubernetes-control-plane/configure
[Storage documentation]: /kubernetes/docs/storage
[GPU workers page]: /kubernetes/docs/gpu-workers
[LDAP and Keystone page]: /kubernetes/docs/ldap
[monitoring docs]: /kubernetes/docs/monitoring
[coredns-charm]: https://charmhub.io/coredns
[kubernetes-dashboard-charm]: https://charmhub.io/kubernetes-dashboard
[kube-state-metrics example]: https://github.com/kubernetes/kube-state-metrics/tree/master/examples/standard
[metrics-server releases]: https://github.com/kubernetes-sigs/metrics-server/releases
[add a k8s cloud]: https://juju.is/docs/juju/get-started-on-kubernetes#heading--register-the-cluster-with-juju
[kubernetes-metrics-server]: https://charmhub.io/kubernetes-metrics-server
[aggregation-extentions]: https://kubernetes.io/docs/tasks/extend-kubernetes/configure-aggregation-layer/
[coredns-docs]: https://charmhub.io/coredns/docs