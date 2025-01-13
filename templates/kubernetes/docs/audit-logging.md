---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Audit logging"
  description: Accessing and configuring the Kubernetes audit logs with Charmed Kubernetes
keywords: log, audit, config
tags: [operating]
sidebar: k8smain-sidebar
permalink: audit-logging.html
layout: [base, ubuntu-com]
toc: False
---

Kubernetes auditing provides a security-relevant chronological set of records
documenting the sequence of activities that have affected the system by
individual users, administrators or other components of the system. This
documentation covers the configuration and usage of these audit logs in
**Charmed Kubernetes**. For a more detailed description of the motives and
methodology behind audit logging in Kubernetes, see the
[Kubernetes Auditing documentation][k8s-audit].


## Viewing the log

By default, **Charmed Kubernetes** enables audit logging to files on the
`kubernetes-control-plane` units. The log file is located at
`/root/cdk/audit/audit.log` and is owned by the nominal `root` user. You can
view the log directly by using Juju's credentials to make an SSH connection:

```bash
juju ssh kubernetes-control-plane/0 sudo cat /root/cdk/audit/audit.log
```

Note that this log is replicated on all kubernetes-control-plane units.

## Audit policy configuration

Audit policy defines rules about what events should be recorded and what data
they should include.  For **Charmed Kubernetes** this is configurable on the kubernetes-control-plane charm
using the `audit-policy` setting.

To view the current policy:

```bash
juju config kubernetes-control-plane audit-policy
```

To set a new audit policy, it is easiest to write the policy to a file. Assuming you have a file
named `audit-policy.yaml` with the following contents:

```yaml
# Log all requests at the Metadata level.
apiVersion: audit.k8s.io/v1beta1
kind: Policy
rules:
- level: Metadata
```

You can set the new audit policy like so:

```bash
juju config kubernetes-control-plane audit-policy="$(cat audit-policy.yaml)"
```

For more information about audit policy definitions, please refer to the
upstream [Kubernetes Audit Policy documentation][k8s-audit-policy].

## Audit log backend configuration

The audit log backend writes audit events to a file in JSON format. It is
configurable in **Charmed Kubernetes**  through the use of the `api-extra-args`
config on kubernetes-control-plane.

By default, the log backend is enabled in Charmed Kubernetes with the following
configuration:

| kube-apiserver config | value |
| --------------------------------- | ----- |
| audit-log-path                | /root/cdk/audit/audit.log |
| audit-log-maxsize          | 100 |
| audit-log-maxbackup   | 9 |

You can override the defaults by using `api-extra-args`. For example:

```bash
juju config kubernetes-control-plane api-extra-args="audit-log-path=/root/cdk/my-audit-location audit-log-maxage=30 audit-log-maxsize=200 audit-log-maxbackup=5"
```

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The <code>audit-log-path</code> must be a directory that is writeable by the kube-apiserver snap. Any non-hidden folders in <code>/root</code>, <code>/var/snap/kube-apiserver/current</code>, or <code>/var/snap/kube-apiserver/common</code> should work.</p>
  </div>
</div>


Please refer to the upstream
[Kubernetes Audit Log Backend documentation][k8s-audit-log]
for more information about the available options.

## Audit webhook backend configuration

The audit webhook backend sends audit events to a remote API, which is assumed
to be the same API that the kube-apiserver exposes. This backend is disabled by
default in **Charmed Kubernetes**, and is configurable on the kubernetes-control-plane
charm via the `audit-webhook-config` option.

To view the current audit webhook configuration:

```bash
juju config kubernetes-control-plane audit-webhook-config
```

To set a new audit webhook config, it is easiest to write the config to a file.
Assuming you have a file named `audit-webhook-config.yaml` with the following
contents:

```yaml
apiVersion: v1
kind: Config
preferences: {}
clusters:
- name: example-cluster
  cluster:
    server: http://10.1.35.4
users:
- name: example-user
  user:
    username: some-user
    password: some-password
contexts:
- name: example-context
  context:
    cluster: example-cluster
    user: example-user
current-context: example-context
```

You can set the new audit webhook config with:

```bash
juju config kubernetes-control-plane audit-webhook-config="$(cat audit-webhook-config.yaml)"
```

Additional options for the webhook backend can be set by using `api-extra-args`.
For example:

```bash
juju config kubernetes-control-plane api-extra-args="audit-webhook-initial-backoff=20s"
```

Please refer to the upstream
[Kubernetes Audit Webhook Backend documentation][k8s-audit-backend] for more
information about the audit webhook config format and related options.

<!-- LINKS -->
[k8s-audit]: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/
[k8s-audit-policy]: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/#policy
[k8s-audit-log]: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/#log-backend
[k8s-audit-backend]: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/#webhook-backend

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/audit-logging.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.
    </p>
  </div>
</div>
