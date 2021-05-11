---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Introduction to MicroK8s"
  description: "Introduction to MicroK8s"
  auto_paginate: True
---

Micro Kubernetes (MicroK8s) is an enterprise-grade Kubernetes
distribution developed by Canonical.

Today, more and more applications run in containers, and Kubernetes is
the de-facto choice for container orchestration, application
deployment, scaling, and application management.

Kubernetes itself is complex. It offers many abstractions, and
learning this new technology can feel quite overwhelming. A developer
or an operations engineer must dedicate a significant amount of time to
setting up and understanding how to operate Kubernetes.

MicroK8s is the fastest way to set up Kubernetes and get it
up and running, without having to struggle with its complexity.
Many times a developer needs just that – to quickly set up Kubernetes – making
MicroK8s the obvious choice.

You can run MicroK8s on your laptop without having to dedicate a lot
of computing resources to Kubernetes. It does not take long to set it up
and get it up and running.

MicroK8s security updates are available, and they can be applied
immediately or scheduled to be run at a predefined time.

MicroK8s keeps a close relationship with Kubernetes. It tracks
upstream and beta releases, as well as RC and final bits the same day as upstream
Kubernetes. You can opt to use the latest Kubernetes release available, or
use any other Kubernetes release newer than 1.10.

MicroK8s includes a selection of manifests for common Kubernetes
services and capabilities:

* Service Mesh: Istio, Linkerd
* Serverless: Knative
* Monitoring: Fluentd, Prometheus, Grafana, Metrics
* Ingress, DNS, Dashboard, Clustering
* Automatic updates to the latest Kubernetes version
* GPGPU bindings for AI/ML
* Cilium, Helm, and Kubeflow

MicroK8s has thorough documentation and tutorials available at
[microk8s.io](https://microk8s.io/). The documentation comes with examples
of commands you need to run to set up MicroK8s, to deploy and
configure applications running on Kubernetes, to scale applications and set up
high-availability, how to use public and private registries, and
how to troubleshoot Kubernetes.
