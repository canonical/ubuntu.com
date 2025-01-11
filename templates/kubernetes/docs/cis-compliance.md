---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CIS compliance"
  description: Running the CIS benchmark on a Charmed Kubernetes cluster
keywords: compliance, testing
tags: [operating]
sidebar: k8smain-sidebar
permalink: cis-compliance.html
layout: [base, ubuntu-com]
toc: False
---

The **Center for Internet Security (CIS)** maintains a
[Kubernetes benchmark][cis-benchmark] which helps ensure clusters are
deployed in accordance with security best practices. **Charmed Kubernetes**
includes support for the [kube-bench][] utility, which reports how well a
cluster complies with this benchmark. This page highlights compliance
requirements as well as details on running the benchmark and analysing test
results.

## Compliance Requirements

**Charmed Kubernetes** is compliant by default. Key configuration changes
from releases prior to 1.19 include the following:

### [kubernetes-control-plane][kubernetes-control-plane]

#### Set `authorization.mode = Node,RBAC`

`kube-apiserver` must not include `AlwaysAllow` as an authorization mode.
This is set by the `authorization-mode` config option on the `kubernetes-control-plane`
charm (`Node,RBAC` by default).

#### Set `encryption-provider-config`

`kube-apiserver` must set `encryption-provider-config` to the path of a valid
`EncryptionConfig` manifest
(`/var/snap/kube-apiserver/common/encryption/encryption_config.yaml` by
default).

#### Disable `insecure-bind-address` and `insecure-port`

`kube-apiserver` must not respond to requests over an insecure address.

#### Enable `NodeRestriction` and `PodSecurityPolicy` plugins

`kube-apiserver` must enable the `NodeRestriction` and `PodSecurityPolicy`
admission control plugins.

#### Disable `profiling`

`kube-apiserver`, `kube-controller-manager`, and `kube-scheduler` must set
`profiling=False`.

#### Set `terminated-pod-gc-threshold`

`kube-controller-manager` must set a value for `terminated-pod-gc-threshold`
(12500 by default).

#### Disable `token-auth-file`

`kube-apiserver` must not use file-based authentication. **Charmed Kubernetes**
now deploys a webhook authentication service that compares API requests to
Kubernetes secrets. If needed, any existing entries in `known_tokens.csv` are
migrated to secrets on charm upgrade.

### [kubernetes-worker][k8s-worker]

#### Set `authorization.mode = Webhook`

`kubelet` must ask the API server whether a given request is authorized.

#### Enable `protect-kernel-defaults`

`kubelet` must not start if any of the kernel tunables are different from the
[kubelet defaults][protect-kernel-defaults].

#### Disable `read-only-port`

`kubelet` must not serve data to an unauthenticated request. Typically, these
requests come from a metrics collecting service. If needed, adjust any services
that access the kubelet `read-only-port` (10255 by default) to instead use
the secure `port` (10250 by default).

## Run the benchmark

The `kubernetes-control-plane`, `kubernetes-worker`, and `etcd` charms used by
**Charmed Kubernetes** include a `cis-benchmark` action that will install,
configure, and run the benchmark on the respective components. Run this
action on the units you wish to test with the following:

```bash
juju run etcd/0 cis-benchmark
```

By default, the action will display a summary of any issues found as well as
the command that was executed on the unit. A `report` command is included
to facilitate transferring the full benchmark report to a local machine for
analysis.

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg-ck
    --benchmark cis-1.5 --noremediations --noresults run --targets etcd
  report: juju scp etcd/0:/home/ubuntu/kube-bench-results/results-text-49681_7h .
  summary: |
    == Summary ==
    7 checks PASS
    0 checks FAIL
    0 checks WARN
    4 checks INFO
status: completed
```

## Configure the benchmark

The following parameters can be adjusted to change the default action behavior.
See the descriptions in the [actions.yaml][layer-cis-benchmark-config] file for
additional supported values beyond the defaults.

### apply

When a failure is detected, this action can attempt to automatically fix it.
This parameter is `none` by default, meaning the action will not attempt to
apply any automatic remediations.

### config

Specify an archive of custom configuration scripts to use during the benchmark.
This parameter is set by default to an archive that is known to work with
snap-related components.

### release

Specify the `kube-bench` release to install and run. This parameter is set by
default to a release that is known to work with snap-related components.

## Example use case

Run the CIS benchmark on the `kubernetes-worker` charm using a custom
configuration archive:

```bash
juju run kubernetes-worker/0 cis-benchmark \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/cis-1.5.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg-ck
    --benchmark cis-1.5 --noremediations --noresults run --targets node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-text-nmmlsvy3 .
  summary: |
    == Summary ==
    16 checks PASS
    4 checks FAIL
    3 checks WARN
    0 checks INFO
status: completed
```

Attempt to apply all known fixes to the failing benchmark tests using the same
configuration archive:

```bash
juju run kubernetes-worker/0 cis-benchmark \
  apply='dangerous' \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/cis-1.5.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg-ck
    --benchmark cis-1.5 --noremediations --noresults run --targets node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-json-dozp8j3z .
  summary: Applied 4 remediations. Re-run with "apply=none" to generate a new report.
status: completed
```

Re-run the earlier action to verify previous failures have been fixed:

```bash
juju run kubernetes-worker/0 cis-benchmark \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/cis-1.5.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg-ck
    --benchmark cis-1.5 --noremediations --noresults run --targets node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-text-4agbktbf .
  summary: |
    == Summary ==
    20 checks PASS
    0 checks FAIL
    3 checks WARN
    0 checks INFO
status: completed
```

## Remove applied remediations

The `cis-benchmark` action does not track individual remediations that it
applies. However, it does support removing all configuration that it may have
set on a unit. To clear this data, set the `apply` parameter to `reset`:

```bash
juju run kubernetes-worker/0 cis-benchmark apply='reset'
```

```yaml
results:
  summary: Reset is complete. Re-run with "apply=none" to generate a new report.
status: completed
```

<!-- LINKS -->

[cis-benchmark]: https://www.cisecurity.org/benchmark/kubernetes/
[kube-bench]: https://github.com/aquasecurity/kube-bench
[layer-cis-benchmark-config]: https://raw.githubusercontent.com/charmed-kubernetes/layer-cis-benchmark/master/actions.yaml
[protect-kernel-defaults]: https://github.com/kubernetes/kubernetes/blob/release-1.19/pkg/util/sysctl/sysctl.go#L49-L56
[kubernetes-control-plane]: https://charmhub.io/kubernetes-control-plane/docs
[k8s-worker]: /kubernetes/docs/charm-kubernetes-worker

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cis-compliance.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

