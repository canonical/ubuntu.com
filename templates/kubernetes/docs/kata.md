---
wrapper_template: "kubernetes/docs/base_docs.html"
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

## Deploying Kata Containers

Kata Containers can be deployed to any **Charmed Kubernetes** cluster that's
running with [containerd][].

### Deploying with a new cluster

After bootstrapping a Juju controller, you can deploy Kata with **Charmed Kubernetes** by using
the following YAML overlay:

```yaml
applications:
  kata:
    charm: cs:~containers/kata
relations:
- - kata:untrusted
  - containerd:untrusted
- - kata
  - kubernetes-master
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
juju deploy cs:~containers/kata
juju add-relation kata kubernetes-master
juju add-relation kata kubernetes-worker
juju add-relation kata:untrusted containerd:untrusted
```

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
