---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Kubernetes autoscaler charm"
  description: Deploy, configure and manage the cluster autoscaler
keywords: charms, operators
tags: [operating]
sidebar: k8smain-sidebar
permalink: autoscaler.html
layout: [base, ubuntu-com]
toc: False
---

The Kubernetes autoscaler charm is an operator charm designed to be run on top
of a **Charmed Kubernetes** cluster. The charm automatically adjusts
the size of the Kubernetes cluster when one of the following conditions is true:

 - there are pods that failed to be scheduled in the cluster due to insufficient resources
 - there are nodes in the cluster that have been underutilized for an extended
   period of time and their pods can be placed on other existing nodes

This work is based on the upstream autoscaler code - see the [FAQ][] for more details.

## Deploying the autoscaler

The autoscaler charm must be deployed in a Kubernetes model on your cluster, not
a machine model (i.e., it runs on Kubernetes). These instructions assume you 
have read and followed the instructions for 
[adding your Charmed Kubernetes cluster to your Juju controller][kubernetes-operators]. 
These instructions assume you have a cluster registered with Juju and named `ck8s`. Please 
adjust the commands given appropriately if you have used a different name.

It is also recommended to schedule the autoscaler charm pods on
control-plane nodes, not worker nodes. In order to schedule pods on
control-plane nodes, ensure the control-plane nodes do not have the taint
`juju.is/kubernetes-control-plane=true:NoSchedule` applied:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints --no-headers
```

In order to remove the taint, for each tainted control-plane node run:

```bash
kubectl taint node $NODE node-role.kubernetes.io/control-plane=true:NoSchedule-
```

Assuming you have a Charmed-Kubernetes deployment running and have copied the kube config file from your control-plane:


If necessary, add a new model to deploy the autoscaler charm into. Adding a model creates a Kubernetes namespace behind the scenes:

```bash
juju add-model autoscaler-model ck8s
```

Next, deploy the autoscaler charm. Note that it must be deployed with trust:

```
juju deploy kubernetes-autoscaler --trust --constraints "tags=node.juju-application=kubernetes-control-plane"
```

The `--trust` switch means that the autoscaler will have access to the Juju credentials required to add and remove nodes.

Also note that the node constraints do not currently work as intended (see [LP1970991](https://bugs.launchpad.net/juju/+bug/1970991)). The following workaround can be used to patch the autoscaler pods onto control-plane nodes:

```
kubectl patch statefulset kubernetes-autoscaler -p '{"spec": {"template": {"spec": {"nodeSelector": {"juju-application": "kubernetes-control-plane"}}}}}' -n autoscaler-model
```

## Configuration

Once deployed, the charm must be configured in order to communicate with the Juju controller.
You will need to retrieve some information about your Juju controller first. Note that the controller of interest is the Juju controller which contains the Charmed Kubernetes model:

```bash
KUBE_CONTROLLER=ck8s
API_ENDPOINTS=$(juju show-controller $KUBE_CONTROLLER --format json | jq -rc '.[].details["api-endpoints"] | join(",")' )
CA_CERT=$(juju show-controller $KUBE_CONTROLLER --format json | jq -rc '.[].details["ca-cert"]' | base64 -w0)
USERNAME=$(juju show-controller $KUBE_CONTROLLER --format json | jq -rc '.[].account.user')
PASSWORD=$(juju show-controller $KUBE_CONTROLLER --show-password --format json | jq -rc '.[].account.password')
```

Next configure the charm:

```
juju config kubernetes-autoscaler \
	juju_api_endpoints="${API_ENDPOINTS}" \
	juju_ca_cert="${CA_CERT}"\
	juju_username="${USERNAME}"\
	juju_password="${PASSWORD}"
```

The charm also needs to know the UUID of your Charmed Kubernetes model. You can obtain a list of the available models using the command below:

```
juju models -c $KUBE_CONTROLLER --format json | jq -cr '.models[]|{name,"model-uuid"}'
```

Obtain the UUID of the Charmed Kubernetes model from the list, then configure
the default model UUID (replace `<CHARMED_K8s_MODEL_UUID>` with the UUID of your
Charmed Kubernetes model):

```bash
juju config kubernetes-autoscaler juju_default_model_uuid="<CHARMED_K8s_MODEL_UUID>"
```

Finally, configure the scaling. You will need to provide a minimum number of
nodes, maximum number of nodes, and also the name of your kubernetes-worker
application (typically this is `kubernetes-worker`). Note that currently the
autoscaler charm does not support scaling to/from 0 nodes, so the minimum must
be greater than 0:

```
juju config kubernetes-autoscaler juju_scale="- {min: 1, max: 3, application: kubernetes-worker}"
```

Additional configuration of autoscaler behaviour can be made via the `autoscaler_extra_args` configuration option, which allows [additional parameters](https://github.com/charmed-kubernetes/autoscaler/blob/juju/cluster-autoscaler/FAQ.md#what-are-the-parameters-to-ca). An example of this configuration is shown below:

```
juju config kubernetes-autoscaler autoscaler_extra_args="{v: 5, scale-down-delay-after-add: 1m0s, scale-down-unneeded-time: 1m0s, unremovable-node-recheck-timeout: 1m0s}"
```


<!-- LINKS -->
[Kubernetes-operators]: /kubernetes/docs/operator-charms
[FAQ]: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md
[Multus]: /kubernetes/docs/cni-multus

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/autoscaler.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
