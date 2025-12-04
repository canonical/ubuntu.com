---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Integrating COS Lite with Charmed Kubernetes"
  description: Integrating COS Lite with Charmed Kubernetes
keywords: Cloud, cluster, observability
tags: [observability, operating]
sidebar: k8smain-sidebar
permalink: how-to-cos-lite.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** includes the standard Kubernetes dashboard for
monitoring your cluster. However, it is often advisable to have a monitoring
solution which will run whether the cluster itself is running or not. It may
also be useful to integrate monitoring into existing setups.

To make monitoring your cluster a delightful experience, Canonical provides
first-class integration between Charmed Kubernetes and COS Lite (Canonical
Observability Stack). This guide will help you integrate a COS Lite
deployment with a Charmed Kubernetes deployment.

This document assumes you have a controller with an installation of
Charmed Kubernetes. If this is not your case, refer to
["Installing Charmed Kubernetes"][how-to-install].

## Preparing a platform for COS Lite

First, create a Microk8s model to act as a deployment cloud for COS Lite:

```
juju add-model --config logging-config='<root>=DEBUG' microk8s-ubuntu aws
```

We also set the logging level to DEBUG so that helpful debug information is
shown when you use `juju debug-log` (see [juju debug-log][juju-debug-log]).

Note: If you are unfamiliar with Juju models, the documentation can be found [here][juju-models].

Use the Ubuntu charm to deploy an application named “microk8s”:

```
juju deploy ubuntu microk8s --series=focal --constraints="mem=8G cores=4 root-disk=30G"
```

Deploy MicroK8s on Ubuntu by accessing the unit you created at the last step
with `juju ssh microk8s/0` and following the [Install Microk8s][how-to-install-microk8s]
guide for configuration.

Export the MicroK8s kubeconfig file to your current directory after configuration:

```
juju ssh microk8s/0 -- microk8s config > microk8s-config.yaml
```

Register MicroK8s as a Juju cloud using add-k8s (see ["juju
add-k8s"][add-k8s] for details on the add-k8s
command):

```
KUBECONFIG=microk8s-config.yaml juju add-k8s microk8s
```

## Deploying COS Lite on the MicroK8s cloud

On the MicroK8s cloud, create a new model and deploy the cos-lite charm:

```
juju add-model cos-lite microk8s
juju deploy cos-lite
```

Make cos-lite’s endpoints available for [cross-model integration][cross-model-integration]:

```
juju offer grafana:grafana-dashboard
juju offer prometheus:receive-remote-write
```

Use juju status --relations to verify that both grafana and prometheus
offerings are listed.

At this point, you’ve established a MicroK8s model on Ubuntu and incorporated
it into Juju as a Kubernetes cloud. You then used this cloud as a substrate for
the COS Lite deployment. You therefore have 2 models on the same controller.

## Integrating COS Lite with Charmed Kubernetes

Switch to your charmed-kubernetes model (if you forgot the name of your model,
you can run `juju models` to see a list of available models):

```
juju switch <charmed-kubernetes-model>
```

Ensure `tokens` relation between `kubernetes-worker` and
`kubernetes-control-plane` applications exist. This grants the `grafana-agent`
on the worker nodes access to metrics from the node's `kubelet`. Repeat the
following command for every application of the charm type `kubernetes-worker`.

```
juju integrate kubernetes-control-plane:tokens kubernetes-worker
```

Consume the COS Lite endpoints:

```
juju consume cos-lite.grafana
juju consume cos-lite.prometheus
```

Deploy the grafana-agent:

```
Juju deploy grafana-agent
```

Relate `grafana-agent` to the Charmed Kubernetes applications:

```
juju integrate grafana-agent:cos-agent kubernetes-control-plane:cos-agent
juju integrate grafana-agent:cos-agent kubernetes-worker:cos-agent
juju integrate grafana-agent:cos-agent kubeapi-load-balancer:cos-agent
```

Relate `grafana-agent` to the COS Lite offered interfaces:

```
juju integrate grafana-agent grafana
juju integrate grafana-agent prometheus
```

Get the credentials and login URL for Grafana:

```
juju run grafana/0 get-admin-password -m cos-lite
```

The above command will output credential information:

```
admin-password: b9OhxF5ndUDO
url: http://10.246.154.87/cos-lite-grafana
```

The username for this credential is `admin`.

You’ve successfully gained access to a comprehensive observability stack. Visit
the URL and use the credentials to log in.

Once you feel ready to dive deeper into your shiny new observability platform,
you can head over to the [COS Lite documentation][cos-lite-docs].

<!-- LINKS -->

[how-to-install]: /kubernetes/charmed-k8s/docs/how-to-install
[how-to-install-microk8s]: https://microk8s.io/docs/getting-started
[add-k8s]: https://documentation.ubuntu.com/juju/3.6/reference/juju-cli/list-of-juju-cli-commands/add-k8s/
[cos-lite-docs]: https://charmhub.io/topics/canonical-observability-stack
[juju-models]: https://documentation.ubuntu.com/juju/3.6/reference/model
[juju-debug-log]: https://documentation.ubuntu.com/juju/3.6/reference/juju-cli/list-of-juju-cli-commands/debug-log/
[cross-model-integration]: https://documentation.ubuntu.com/juju/3.6/reference/relation

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-cos-lite.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://kubernetes.slack.com/archives/CG1V2CAMB"> public Slack  channel</a>.</p>
  </div>
</div>
