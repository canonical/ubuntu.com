---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Rocks registry affected charms"
  description: Charms affected by the rocks.canonical.com registry decommission
keywords: rocks.canonical.com, registry, charm
tags: [reference]
sidebar: k8smain-sidebar
permalink: rocks-registry-affected-charms.html
layout: [base, ubuntu-com]
toc: False
---

Canonical is decommissioning the `rocks.canonical.com` container image registry. This affects Charmed Kubernetes releases 1.35 and earlier. Existing deployments must migrate to the new `ghcr.io/canonical/cdk` registry by updating the `image-registry` configuration for every deployed charm and component listed below.

- [ceph-csi-operator](https://github.com/charmed-kubernetes/ceph-csi-operator)
- [charm-aws-cloud-provider](https://github.com/charmed-kubernetes/charm-aws-cloud-provider)
- [charm-calico](https://github.com/charmed-kubernetes/charm-calico)
- [charm-cilium](https://github.com/charmed-kubernetes/charm-cilium)
- [charm-containerd](https://github.com/charmed-kubernetes/charm-containerd)
- [charm-coredns](https://github.com/charmed-kubernetes/charm-coredns)
- [charm-flannel](https://github.com/charmed-kubernetes/charm-flannel)
- [charm-kube-ovn](https://github.com/charmed-kubernetes/charm-kube-ovn)
- [charm-kubernetes-control-plane](https://github.com/charmed-kubernetes/charm-kubernetes-control-plane)
- [charm-multus](https://github.com/charmed-kubernetes/charm-multus)
- [charm-sriov-cni](https://github.com/charmed-kubernetes/charm-sriov-cni)
- [charm-sriov-network-device-plugin](https://github.com/charmed-kubernetes/charm-sriov-network-device-plugin)
- [cinder-csi-operator](https://github.com/canonical/cinder-csi-operator)
- [k8s-operator](https://github.com/canonical/k8s-operator)
- [keystone-k8s-auth-operator](https://github.com/canonical/keystone-k8s-auth-operator)
- [kubernetes-metrics-server-operator](https://github.com/charmed-kubernetes/kubernetes-metrics-server-operator)
- [layer-canal](https://github.com/charmed-kubernetes/layer-canal)
- [metallb-operator](https://github.com/charmed-kubernetes/metallb-operator)
- [openstack-cloud-controller-operator](https://github.com/charmed-kubernetes/openstack-cloud-controller-operator)
- [vsphere-cloud-provider](https://github.com/charmed-kubernetes/vsphere-cloud-provider)
