---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Release notes"
  description: Release notes for version 1.12
---

## 1.12 Release Notes

### Added support for Ubuntu 18.04 (Bionic)

New deployments will get Ubuntu 18.04 machines by default. We will also continue to support CDK on Ubuntu 16.04 (Xenial) machines for existing deployments.

### Added kube-proxy to kubernetes-master

The kubernetes-master charm now installs and runs kube-proxy along with the other master services. This makes it possible for the master services to reach Service IPs within the cluster, making it easier to enable certain integrations that depend on this functionality (e.g. Keystone).

For operators of offline deployments, please note that this change may require you to attach a kube-proxy resource to kubernetes-master.

### New kubernetes-worker charm config: kubelet-extra-config

In Kubernetes 1.10, a new KubeletConfiguration file was introduced, and many of Kubelet's command line options were moved there and marked as deprecated. In order to accomodate this change, we've introduced a new charm config to kubernetes-worker: `kubelet-extra-config`.

This config can be used to override KubeletConfiguration values provided by the charm, and is usable on any Canonical cluster running Kubernetes 1.10+.

The value for this config must be a YAML mapping that can be safely merged with a KubeletConfiguration file. For example:

```bash
juju config kubernetes-worker kubelet-extra-config="{evictionHard: {memory.available: 200Mi}}"
```

For more information about KubeletConfiguration, see upstream docs:
https://kubernetes.io/docs/tasks/administer-cluster/kubelet-config-file/

### Added support for Dynamic Kubelet Configuration

While we recommend `kubelet-extra-config` as a more robust and approachable way to configure Kubelet, we've also made it possible to configure kubelet using the Dynamic Kubelet Configuration feature that comes with Kubernetes 1.11+. You can read about that here:
https://kubernetes.io/docs/tasks/administer-cluster/reconfigure-kubelet/

### New etcd charm config

bind_to_all_interfaces ([PR](https://github.com/juju-solutions/layer-etcd/pull/137))

Default `true`, which retains the old behavior of binding to 0.0.0.0. Setting this to `false` makes etcd bind only to the addresses it expects traffic on, as determined by the configuration of [Juju endpoint bindings](https://docs.jujucharms.com/2.4/en/charms-deploying-advanced#deploying-to-network-spaces).

Special thanks to [@rmescandon](https://github.com/rmescandon) for this contribution!

### Updated proxy configuration

For operators who currently use the `http-proxy`, `https-proxy` and `no-proxy` Juju model configs, we recommend using the newer `juju-http-proxy`, `juju-https-proxy` and `juju-no-proxy` model configs instead. See the [Proxy configuration](https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Proxy-configuration) page for details.

## Fixes

- Fixed kube-dns constantly restarting on 18.04 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/655))
- Fixed LXD machines not working on 18.04 ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/654))
- Fixed kubernetes-worker unable to restart services after kubernetes-master leader is removed ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/627))
- Fixed kubeapi-load-balancer default timeout might be too low ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/650))
- Fixed unable to deploy on NVidia hardware ([Issue](https://github.com/juju-solutions/bundle-canonical-kubernetes/issues/664))

## Contact Us

- Issues: <https://github.com/juju-solutions/bundle-canonical-kubernetes/issues>

- IRC: #juju on freenode.net
