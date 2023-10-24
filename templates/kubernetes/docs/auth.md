---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Configuring authorisation and authentication"
  description: Controlling access with RBAC and other authorisation modes.
keywords: users, access, rbac, abac, webhook, config
tags: [operating]
sidebar: k8smain-sidebar
permalink: auth.html
layout: [base, ubuntu-com]
toc: False
---

## Authorisation

**Charmed Kubernetes** implements access
control based on the Kubernetes model. A complete overview of the Kubernetes
authorisation  system is given in the [Kubernetes Documentation][upstream-auth].
This page provides summary information on the available modes and how to configure
**Charmed Kubernetes** to use them.

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The default authorisation mode in <strong>Charmed Kubernetes</strong> 1.19 has changed from "AlwaysAllow" to "Node,RBAC".</p>
  </div>
</div>

The following modes are supported:

 - **Node** (default): Grants permissions to kubelets based on the pods they are scheduled to run.
    When using this mode, **Charmed Kubernetes** will enable `NodeRestriction` and will issue (and
    decommission) tokens for kubernetes-workers as you scale your infrastructure.
    More detailed information can be found in the [Kubernetes documentation][node].
 - **RBAC** (default):  Using role-based access control, access is granted to users based on the
   roles assigned to them. This mode expects respective roles and bindings to be available
   for any running services. **Charmed Kubernetes** already has roles and bindings ready for use
   ([see below][roles]).
 - **AlwaysAllow**: All calls to the API server are allowed.
 - **AlwaysDeny**: This mode denies all API requests - it is only really useful for testing.
 - **ABAC**: Using attribute-based access control, access rights are granted to users
    through the use of policies which combine attributes together. The policies can use any
    type of attributes (user attributes, resource attributes, object attributes, environment
    attributes, etc). For more information on ABAC mode, see the
    [Kubernetes ABAC documentation][abac].
 - **Webhook**:  With this mode set, Kubernetes will query an outside REST service
   when determining user privileges. This mode requires additional configuration to
   specify the service being queried. A full explanation of this can be found in the
   [Kubernetes Webhook mode documentation][webhook].

### Determining the current configuration

Juju can be used to query the current configuration setting:

```bash
juju config kubernetes-control-plane authorization-mode
```

The default value is:
```bash
Node,RBAC
```

For further verification, the runtime arguments for the `kube-apiserver` can be determined:

```bash
juju exec --unit kubernetes-control-plane/0 "ps -ef | grep apiserver"
```

... from which we can see the `--authorization-mode=Node,RBAC` argument:

```
root      6244     1 22 17:10 ?        00:00:12 /snap/kube-apiserver/1720/kube-apiserver --allow-privileged=false --service-cluster-ip-range=10.152.183.0/24 --min-request-timeout=300 --v=4 --tls-cert-file=/root/cdk/server.crt --tls-private-key-file=/root/cdk/server.key --kubelet-certificate-authority=/root/cdk/ca.crt --kubelet-client-certificate=/root/cdk/client.crt --kubelet-client-key=/root/cdk/client.key --kubelet-https=true --logtostderr=true --storage-backend=etcd3 --insecure-port=0 --profiling=false --anonymous-auth=false --authentication-token-webhook-cache-ttl=1m0s --authentication-token-webhook-config-file=/root/cdk/auth-webhook/auth-webhook-conf.yaml --service-account-key-file=/root/cdk/serviceaccount.key --kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS,ExternalDNS,ExternalIP --encryption-provider-config=/var/snap/kube-apiserver/common/encryption/encryption_config.yaml --advertise-address=172.31.17.53 --etcd-cafile=/root/cdk/etcd/client-ca.pem --etcd-keyfile=/root/cdk/etcd/client-key.pem --etcd-certfile=/root/cdk/etcd/client-cert.pem --etcd-servers=https://172.31.13.233:2379,https://172.31.30.137:2379,https://172.31.9.235:2379 --authorization-mode=Node,RBAC --enable-admission-plugins=PersistentVolumeLabel,PodSecurityPolicy,NodeRestriction --requestheader-client-ca-file=/root/cdk/ca.crt --requestheader-allowed-names=system:kube-apiserver,client --requestheader-extra-headers-prefix=X-Remote-Extra- --requestheader-group-headers=X-Remote-Group --requestheader-username-headers=X-Remote-User --proxy-client-cert-file=/root/cdk/client.crt --proxy-client-key-file=/root/cdk/client.key --enable-aggregator-routing=true --client-ca-file=/root/cdk/ca.crt --audit-log-path=/root/cdk/audit/audit.log --audit-log-maxage=30 --audit-log-maxsize=100 --audit-log-maxbackup=10 --audit-policy-file=/root/cdk/audit/audit-policy.yaml
```

### Setting a configuration

The authorisation mode can be set using the same **Juju** command as above, but this
time specifying a value:

```bash
juju config kubernetes-control-plane authorization-mode="Node"
```

It is possible to set more than one mode using a comma-separated list:

```bash
juju config kubernetes-control-plane authorization-mode="Node,RBAC"
```

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Using "Node,RBAC" for authorisation is the recommended configuration.</p>
  </div>
</div>

The order matters. Kubernetes will process each API request with each module in
sequence. If the current authorising module either allows or denies the
request, that decision is made and no further modules are consulted. If the
current module has no opinion on the request, then the decision is passed to
the next module in the list. If no decision has been returned by the last
module in the list, then the request is denied.


<a id='rbac'> </a>

### Further information on RBAC

Many of the defined roles (those prefixed by `system:`) for RBAC are really intended for
managing access to Kubernetes components themselves.

The main cluster roles for additional users are: `admin`, `cluster-admin`, `edit` and `view`.

You can view the available roles, cluster roles and bindings with the following commands:

```bash
kubectl get roles --all-namespaces
kubectl get clusterroles --all-namespaces
kubectl get rolebindings --all-namespaces
kubectl get clusterrolebindings --all-namespaces
```

For more detail on roles and bindings, please see the
[Kubernetes RBAC documentation][rbac].


<a id='authn'> </a>

## Authentication

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">The default authentication mechanism in <strong>Charmed Kubernetes</strong> 1.19 has changed from file-based authentication to a webhook token service.</p>
  </div>
</div>

**Charmed Kubernetes** manages a webhook authentication service that compares API
requests to Kubernetes secrets. If needed, any existing entries in previous
authentication files (`basic_auth.csv` and `known_tokens.csv`) are migrated to secrets
during the `kubernetes-control-plane` charm upgrade.

The webhook authenticator is distributed with the `kubernetes-control-plane` charm and runs
on port `5000` of each control-plane unit. Source code for the [application][auth-webhook-app]
as well as the associated [systemd service][auth-webhook-svc] can be found in the
`kubernetes-control-plane` source repository.

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Only one webhook authenticator can be configured on the Kubernetes apiserver. To use a custom webhook, see the <strong>Managing users with an external service</strong> section below.</p>
  </div>
</div>

Read about the Kubernetes approach to authentication in this page of the
[Kubernetes documentation][upstream-authentication].

### Managing users with charm actions

The recommended method for managing Kubernetes users is with `kubernetes-control-plane`
charm actions.

#### user-create

Creates a Kubernetes secret with username and optional group information. This
action also creates a kubeconfig file that can be retrieved and used to
authenticate with the cluster. For example:

```bash
juju run kubernetes-control-plane/0 user-create name='alice'
```

Example output:
```bash
unit-kubernetes-control-plane-0:
  UnitId: kubernetes-control-plane/0
  id: "2"
  results:
    kubeconfig: juju scp kubernetes-control-plane/0:/home/ubuntu/alice-kubeconfig .
    msg: User "alice" created.
    users: admin, system:kube-controller-manager, system:kube-proxy, system:node:ip-172-31-0-215,
      system:node:ip-172-31-6-184, system:node:ip-172-31-23-177, system:kube-scheduler,
      system:monitoring, alice
  status: completed
```

If specified, the `groups` parameter should be a comma-separated list of Kubernetes
`Groups` that this user should belong to. For example:

```bash
juju run kubernetes-control-plane/0 user-create name='bob' groups='system:masters,devs'
```

Example output:
```bash
unit-kubernetes-control-plane-0:
  UnitId: kubernetes-control-plane/0
  id: "3"
  results:
    kubeconfig: juju scp kubernetes-control-plane/0:/home/ubuntu/bob-kubeconfig .
    msg: User "bob" created.
    users: admin, alice, system:kube-controller-manager, system:kube-proxy, system:node:ip-172-31-0-215,
      system:node:ip-172-31-6-184, system:node:ip-172-31-23-177, system:kube-scheduler,
      system:monitoring, bob
  status: completed
```

#### user-list

Lists usernames from all secrets created by **Charmed Kubernetes**. For example:

```bash
juju run kubernetes-control-plane/0 user-list
```

Example output:
```bash
unit-kubernetes-control-plane-0:
  UnitId: kubernetes-control-plane/0
  id: "4"
  results:
    users: admin, alice, bob, system:kube-controller-manager, system:kube-proxy, system:node:ip-172-31-0-215,
      system:node:ip-172-31-6-184, system:node:ip-172-31-23-177, system:kube-scheduler,
      system:monitoring
  status: completed
```

#### user-delete

Deletes the secret associated with an existing user. For example:

```bash
juju run kubernetes-control-plane/0 user-delete name=bob
```

Example output:
```bash
unit-kubernetes-control-plane-0:
  UnitId: kubernetes-control-plane/0
  id: "5"
  results:
    msg: User "bob" deleted.
    users: admin, alice, system:kube-controller-manager, system:kube-proxy, system:node:ip-172-31-0-215,
      system:node:ip-172-31-6-184, system:node:ip-172-31-23-177, system:kube-scheduler,
      system:monitoring
  status: completed
```

### Managing users with an external service

The **Charmed Kubernetes** webhook authenticator will first check local tokens followed
by Kubernetes secrets to authenticate a request. When present, the following external
services may also be used to process requests:

- **AWS IAM**: IAM credentials can be used for authentication and authorisation
on your Charmed Kubernetes cluster, even if the cluster is not hosted on AWS.
For further details, see the documentation on
[AWS IAM with Charmed Kubernetes][aws-iam].
- **LDAP**: See the documentation on using
[LDAP and Keystone with Charmed Kubernetes][docs-ldap].

Additionally, a custom endpoint can be configured to authenticate requests. This
must be an https url accessible by the `kubernetes-control-plane` units. When a
JSON-serialized TokenReview object is POSTed to this endpoint, it must respond with
appropriate authentication details. Set this option as follows:

```bash
juju config kubernetes-control-plane authn-webhook-endpoint='https://your.server:8443/authenticate'
```

More information about webhook authentication service requirements can be found
in the [upstream documentation][upstream-webhook].


 <!-- LINKS -->

[upstream-auth]: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
[upstream-authentication]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/
[upstream-webhook]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#webhook-token-authentication
[node]: https://kubernetes.io/docs/reference/access-authn-authz/node/
[abac]: https://kubernetes.io/docs/reference/access-authn-authz/abac/
[rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[webhook]: https://kubernetes.io/docs/reference/access-authn-authz/webhook/
[docs-ldap]: /kubernetes/docs/ldap
[roles]: #rbac
[aws-iam]: /kubernetes/docs/aws-iam-auth
[auth-webhook-app]: https://github.com/charmed-kubernetes/charm-kubernetes-control-plane/blob/master/templates/cdk.master.auth-webhook.py
[auth-webhook-svc]: https://github.com/charmed-kubernetes/charm-kubernetes-control-plane/blob/master/templates/cdk.master.auth-webhook.service

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/auth.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

