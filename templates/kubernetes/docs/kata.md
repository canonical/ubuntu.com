---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Kata Containers"
  description: Configure and use Kata Containers as an untrusted container runtime
keywords: kata, untrusted runtime, image
tags: [architecture]
sidebar: k8smain-sidebar
permalink: kata.html
layout: [base, ubuntu-com]
toc: False
---

Beginning with **Charmed Kubernetes** 1.16, the
[Kata Containers][kata] runtime can be used with
containerd to safely run insecure or untrusted pods. When enabled, Kata
provides hypervisor isolation for pods that request it, while trusted pods can
continue to run on a shared kernel via runc. The instructions below
demonstrate how to configure and use Kata containers.

## Requirements

Due to their reliance on the KVM kernel module, Kata Containers can only be used
on hosts that support virtualisation. Attempting to use Kata on a host that
doesn't support virtualisation may result in an error similar to this one:

```no-highlight
Failed create pod sandbox: rpc error: code = Unknown desc = failed to start sandbox container: failed to create containerd task: Could not access KVM kernel module: No such file or directory
qemu-vanilla-system-x86_64: failed to initialize KVM: No such file or directory
```

To fulfill this requirement, using Kata Containers on a public cloud may require a
special instance type be used for the worker nodes. See the "Deploying to AWS" section
below for an example.

## Deploying Kata Containers

Kata Containers can be deployed to any **Charmed Kubernetes** cluster that's
running with [containerd][].

### Deploying with a new cluster

After bootstrapping a Juju controller, you can deploy Kata with **Charmed Kubernetes** by using
the following YAML overlay:

```yaml
applications:
  kata:
    charm: kata
relations:
- - kata:untrusted
  - containerd:untrusted
- - kata
  - kubernetes-control-plane
- - kata
  - kubernetes-worker

```

Save this YAML and then deploy:

```bash
juju deploy charmed-kubernetes --overlay kata.yaml
```

### Deploying to an existing cluster

Deploy the Kata charm and add the necessary relations using the following commands:

```bash
juju deploy kata
juju integrate kata kubernetes-control-plane
juju integrate kata kubernetes-worker
juju integrate kata:untrusted containerd:untrusted
```

### Deploying to AWS

A convenient way to try Charmed Kubernetes with Kata Containers is to deploy it to AWS.
A special AWS instance type is required to provide the necessary virtualisation support.
To deploy Charmed Kubernetes with Kata Containers on AWS, write the following overlay
to a file or [download it here][kata-aws-overlay.yaml]:

```yaml
applications:
  kubernetes-worker:
    constraints: instance-type=i3.metal
    num_units: 1
  kata:
    charm: kata
relations:
- - kata:untrusted
  - containerd:untrusted
- - kata
  - kubernetes-control-plane
- - kata
  - kubernetes-worker
```

Once written, deploy it with:

```bash
juju deploy charmed-kubernetes --overlay kata-aws-overlay.yaml
```

Due to the high costs of `i3.metal` instance types, the example above deploys only one
worker node. Feel free to edit the `num_units` field to suit your needs, or add more
workers later with the `juju add-unit kubernetes-worker` command.

## Deploying pods to Kata

### Untrusted annotation

The simplest way to run your pods with Kata is to annotate them with
`io.kubernetes.cri.untrusted-workload: "true"`.  For example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-untrusted
  annotations:
    io.kubernetes.cri.untrusted-workload: "true"
spec:
  containers:
  - name: nginx
    image: nginx
```

### RuntimeClass

If you don't want to taint your workloads as `untrusted`, you can also create
the following `RuntimeClass`:

```yaml
apiVersion: node.k8s.io/v1beta1
kind: RuntimeClass
metadata:
  name: kata
handler: kata
```

After this `RuntimeClass` is created, workloads can be run which are pinned to
the class.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-kata
spec:
  runtimeClassName: kata
  containers:
  - name: nginx
    image: nginx
```

<!-- LINKS -->

[containerd]: /kubernetes/docs/container-runtime
[kata]: https://katacontainers.io
[kata-aws-overlay.yaml]: https://raw.githubusercontent.com/charmed-kubernetes/kubernetes-docs/master/assets/kata-aws-overlay.yaml

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/kata.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>


