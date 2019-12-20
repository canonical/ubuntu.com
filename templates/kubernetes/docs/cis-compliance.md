---
wrapper_template: "kubernetes/docs/base_docs.html"
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
[Kubernetes benchmark][cis-benchmark] that is helpful to ensure clusters are
deployed in accordance with security best practices. **Charmed Kubernetes**
includes support for the [kube-bench][] utility, which reports how well a
cluster complies with this benchmark. This page details how to run these
tests.

## Run kube-bench

The `kubernetes-master`, `kubernetes-worker`, and `etcd` charms used by
**Charmed Kubernetes** include a `cis-benchmark` action that will install,
configure, and run the benchmark on the respective components. Run this
action on the units you wish to test with the following:

```bash
juju run-action --wait etcd/0 cis-benchmark
```

By default, the action will display a summary of any issues found as well as
the command that was executed on the unit. A `report` command is included
to facilitate transferring the full benchmark report to a local machine for
analysis.

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg --version
    1.13-snap-etcd --noremediations --noresults master
  report: juju scp etcd/0:/home/ubuntu/kube-bench-results/results-text-49681_7h .
  summary: |
    == Summary ==
    7 checks PASS
    0 checks FAIL
    0 checks WARN
    4 checks INFO
status: completed
```

## Configure kube-bench

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
snap-based components.

### release

Specify the `kube-bench` release to install and run. The default value of
`upstream` will compile and use a local kube-bench binary built from the master
branch of the [upstream repository][kube-bench].

## Example use case

Run the CIS benchmark on the `kubernetes-worker` charm using a custom
configuration archive:

```bash
juju run-action --wait kubernetes-worker/0 cis-benchmark \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/master.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg --version
    1.13-snap-k8s --noremediations --noresults node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-text-8c71ktcn .
  summary: |
    == Summary ==
    16 checks PASS
    5 checks FAIL
    2 checks WARN
    1 checks INFO
status: completed
```

Attempt to apply all known fixes to the failing benchmark tests using the same
configuration archive:

```bash
juju run-action --wait kubernetes-worker/0 cis-benchmark \
  apply='dangerous' \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/master.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg --version
    1.13-snap-k8s --noremediations --noresults node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-json-7b3g6jdg .
  summary: Applied 5 remediations. Re-run with "apply=none" to generate a new report.
status: completed
```

Re-run the initial action to see if previous failures have been fixed:

```bash
juju run-action --wait kubernetes-worker/0 cis-benchmark \
  config='https://github.com/charmed-kubernetes/kube-bench-config/archive/master.zip'
```

```yaml
results:
  cmd: /home/ubuntu/kube-bench/kube-bench -D /home/ubuntu/kube-bench/cfg --version
    1.13-snap-k8s --noremediations --noresults node
  report: juju scp kubernetes-worker/0:/home/ubuntu/kube-bench-results/results-text-m72vicwe .
  summary: |
    == Summary ==
    21 checks PASS
    0 checks FAIL
    2 checks WARN
    1 checks INFO
status: completed
```

## Remove applied remediations

The `cis-benchmark` action does not track individual remediations that it
applies. However, it does support removing all configuration that it may have
set on a unit. To clear this data, set the `apply` parameter to `reset`:

```bash
juju run-action --wait kubernetes-worker/0 cis-benchmark \
  apply='reset'
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

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/cis-compliance.md" class="p-notification__action">edit this page</a> 
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
