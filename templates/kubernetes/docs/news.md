---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "News"
  description: The latest news on the Canonical Distribution of Kubernetes.
---

## 1.12 Release Notes

- Added support for Ubuntu 18.04 (Bionic)

New deployments will get Ubuntu 18.04 machines by default. We will also continue to support CDK on Ubuntu 16.04 (Xenial) machines for existing deployments.

- Added kube-proxy to kubernetes-master

The kubernetes-master charm now installs and runs kube-proxy along with the other master services. This makes it possible for the master services to reach Service IPs within the cluster, making it easier to enable certain integrations that depend on this functionality (e.g. Keystone).

For operators of offline deployments, please note that this change may require you to attach a kube-proxy resource to kubernetes-master.

[More details&nbsp;&rsaquo;](/kubernetes/docs/release-notes)
