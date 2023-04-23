---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "OPA gatekeeper"
  description: Configure and deploy the OPA gatekeeper policy engine
keywords: opa, gatekeeper, policy,
tags: [operating, security]
sidebar: k8smain-sidebar
permalink: gatekeeper.html
layout: [base, ubuntu-com]
toc: False
---


[OPA gatekeeper][gatekeeper-docs] is an open source, general-purpose policy engine that enables unified,
context-aware policy enforcement.

Gatekeeper is a validating webhook that enforces CRD-based policies executed by [Open Policy Agent][opa].
[Policies][constraint-templates] are defined in a language called [rego][rego]. Incoming requests that try
to create or alter a resource that violates any of these policies will be rejected.

In addition to admission, Gatekeeper offers audit functionality, which allows administrators to see
which resources are currently violating any given policy.

##  Deployment

The gatekeeper webhook and audit services exist in separate charms, you should deploy both of them.
First you need to make sure that you have a **Charmed Kubernetes** environment set up and running.
See the [quickstart][quickstart] if you haven't. The `gatekeeper-audit` charm requires storage so
make sure your Juju model has a registered [storage-pool][storage-pools].

Next, create a new Kubernetes model:

```console
juju add-model gatekeeper-system k8s-cloud
```

Then you can deploy the Gatekeeper charms:

```console
juju deploy ch:gatekeeper-controller-manager
juju deploy ch:gatekeeper-audit
```

### Using RBAC

If using RBAC, you must deploy the charms using the `--trust` flag as the charm needs permissions
in order to create the necessary resources:

```console
juju deploy --trust ch:gatekeeper-controller-manager
juju deploy --trust ch:gatekeeper-audit
```

## Policies

[Policies][constraint-templates] are defined as `ConstraintTemplate` CRDs in a language called
[rego][rego]. Constraints are then used to inform Gatekeeper that the admin wants a ConstraintTemplate
to be enforced, and how.

To get a list of the constraints run:

```console
kubectl get constraints
```

Or with the juju command:
```console
juju run {unit_name} -m {model_name} list-violations
```

And then to get the violations for a specific constraint run:
```console
juju run {unit_name} -m {model_name} get-violation constraint-template={constraint_template} constraint={constraint}
```

## Configuration

Not much needs to be configured when running OPA gatekeeper. All configurations available are related to optimising the auditting:
```yaml
audit-chunk-size:
  default: 500
  description: |
    Lower chunk size can reduce memory consumption of the auditing Pod but
    can increase the number requests to the Kubernetes API server.
audit-interval:
  default: 60
  description: Interval between the audits, to disable the interval set `audit-interval=0`
constraint-violations-limit:
  default: 20
  description: |
    The number of violations that will be reported, If the number of current violations
    is greater than this cap, the excess violations will not be reported but they
    will be included in the totalViolations count
```

# Metrics
Both charms provide out of the box integration with the [prometheus-k8s][prometheus-k8s] and
the [grafana-agent-k8s][grafana-agent-k8s] charms.

If you have those two charms deployed, you can integrate them with gatekeeper simply by running:

```bash
juju integrate grafana-agent-k8s gatekeeper-controller-manager
juju integrate grafana-agent-k8s:send-remote-write prometheus-k8s:receive-remote-write
```

This will provide you with metrics such as how many requests were denied, how many were processed,
how many violations exist in the cluster, etc.

## Reconciliation

The gatekeeper charms manage the same Kubernetes resources(roles, crds, etc.). If for some reason
you wish to delete one of the two charms while keeping the other you should be very careful, as
it will cause all of the resources to be deleted.

In that scenario you will need to reconcile (recreate) the resources by running:

```console
juju run {unit_name} -m {model_name} reconcile-resources
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Warning:</span>
This will cause all the policies to be deleted as well, which means you will have to
reapply them.
  </p>
</div>


## Test the Gatekeeper charm

To test the gatekeeper charms you can try applying the test policy available on the charms' repository:

```console
kubectl apply -f https://raw.githubusercontent.com/charmed-kubernetes/opa-gatekeeper-operators/main/docs/policy-example.yaml
kubectl apply -f https://raw.githubusercontent.com/charmed-kubernetes/opa-gatekeeper-operators/main/docs/policy-spec-example.yaml
```

This policy will require all namespaces to have the label `gatekeeper=True`, creating a new ns
without that should fail:

```console
kubectl create ns test
```
...should return...

```bash
Error from server (Forbidden): admission webhook "validation.gatekeeper.sh" denied the request: [ns-must-have-gk] you must provide labels: {"gatekeeper"}
```

After a while you should also be able to see violations of the policy from the
existing resources. For example:

```console
kubectl get constraints
```
... will return something similar to:

```
NAME              ENFORCEMENT-ACTION   TOTAL-VIOLATIONS
ns-must-have-gk                                6
```

## Useful links
- [Gatekeeper Documentation][gatekeeper-docs]
- [OPA Documentation][opa]
- [Rego Documentation][rego]
- [Gatekeeper Audit Charm][gatekeeper-audit]
- [Gatekeeper Webhook Charm][gatekeeper-controller-manager]

<!-- LINKS -->
[gatekeeper-docs]: https://open-policy-agent.github.io/gatekeeper/website/docs/
[constraint-templates]: https://open-policy-agent.github.io/gatekeeper/website/docs/howto#constraint-templates
[opa]: https://www.openpolicyagent.org/docs/latest/
[rego]: https://www.openpolicyagent.org/docs/latest/policy-language/
[gatekeeper-audit]: https://charmhub.io/gatekeeper-audit
[gatekeeper-controller-manager]: https://charmhub.io/gatekeeper-controller-manager
[prometheus-k8s]: https://charmhub.io/prometheus-k8s
[grafana-agent-k8s]: https://charmhub.io/grafana-agent-k8s
[storage-pools]: https://juju.is/docs/olm/defining-and-using-persistent-storage
[quickstart]: https://ubuntu.com/kubernetes/docs/quickstart

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/gatekeeper.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>