---
wrapper_template: "kubernetes/docs/base_docs.html"
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

**Charmed Kubernetes** implements access
control based on the Kubernetes model. A complete overview of the Kubernetes
authorisation  system is given in the [Kubernetes Documentation][upstream-auth].
This page provides summary information on the available modes and how to configure
**Charmed Kubernetes** to use them.

 The following modes are supported:

 -  **AlwaysAllow**: This is the default mode. All calls to the API server are allowed.
 - **Node**: Grants permissions to kubelets based on the pods they are scheduled to run.
    When using this mode, **Charmed Kubernetes** will enable `NodeRestriction` and will issue (and
    decommission) tokens for kubernetes-workers as you scale your infrastructure.
    More detailed information can be found in the [Kubernetes documentation][node].
 - **ABAC**: Using attribute-based access control, access rights are granted to users
    through the use of policies which combine attributes together. The policies can use any
    type of attributes (user attributes, resource attributes, object attributes, environment
    attributes, etc). For more information on ABAC mode, see the
    [Kubernetes ABAC documentation][abac].
 - **RBAC**:  Using role-based access control, access is granted to users based on the
   roles assigned to them. This mode expects respective roles and bindings to be available
   for any running services. **Charmed Kubernetes** already has roles and bindings ready for use
   ([see below][roles]).
 - **Webhook**:  With this mode set, Kubernetes will query an outside REST service
   when determining user privileges. This mode requires additional configuration to
   specify the service being queried. A full explanation of this can be found in the
   [Kubernetes Webhook mode documentation][webhook].
 -  **AlwaysDeny**: This mode denies all API requests - it is only really useful for testing.

## Determining the current configuration

Juju can be used to query the current configuration setting:

```bash
juju config kubernetes-master authorization-mode
```

The default value is:
```bash
AlwaysAllow
```

For further verification, the runtime arguments for the `kube-apiserver` can be determined:

```bash
juju run --unit kubernetes-master/0 "ps -ef | grep apiserver"
```

... from which we can see the `--authorization-mode=AlwaysAllow` argument:

```
root      2013     1  2 11:18 ?        00:01:25 /snap/kube-apiserver/917/kube-apiserver --advertise-address=10.153.234.96 --min-request-timeout=300 --etcd-cafile=/root/cdk/etcd/client-ca.pem --etcd-certfile=/root/cdk/etcd/client-cert.pem --etcd-keyfile=/root/cdk/etcd/client-key.pem --etcd-servers=https://10.154.124.144:2379,https://10.165.213.59:2379,https://10.167.80.201:2379 --storage-backend=etcd3 --tls-cert-file=/root/cdk/server.crt --tls-private-key-file=/root/cdk/server.key --insecure-bind-address=127.0.0.1 --insecure-port=8080 --audit-log-maxbackup=9 --audit-log-maxsize=100 --audit-log-path=/root/cdk/audit/audit.log --audit-policy-file=/root/cdk/audit/audit-policy.yaml --basic-auth-file=/root/cdk/basic_auth.csv --client-ca-file=/root/cdk/ca.crt --requestheader-allowed-names=system:kube-apiserver --requestheader-client-ca-file=/root/cdk/ca.crt --requestheader-extra-headers-prefix=X-Remote-Extra- --requestheader-group-headers=X-Remote-Group --requestheader-username-headers=X-Remote-User --service-account-key-file=/root/cdk/serviceaccount.key --token-auth-file=/root/cdk/known_tokens.csv --authorization-mode=AlwaysAllow --admission-control=NamespaceLifecycle,LimitRanger,ServiceAccount,PersistentVolumeLabel,DefaultStorageClass,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,ResourceQuota --allow-privileged=false --enable-aggregator-routing --kubelet-certificate-authority=/root/cdk/ca.crt --kubelet-client-certificate=/root/cdk/client.crt --kubelet-client-key=/root/cdk/client.key --kubelet-preferred-address-types=[InternalIP,Hostname,InternalDNS,ExternalDNS,ExternalIP] --proxy-client-cert-file=/root/cdk/client.crt --proxy-client-key-file=/root/cdk/client.key --service-cluster-ip-range=10.152.183.0/24 --logtostderr --v=4
root     18966 18964  0 12:11 ?        00:00:00 grep apiserver
```

## Setting a configuration

The authorisation mode can be set using the same **Juju** command as above, but this
time specifying a value:

```bash
juju config kubernetes-master authorization-mode="Node"
```

It is possible to set more than one mode using a comma-separated list:

```bash
juju config kubernetes-master authorization-mode="RBAC,Node"
```

<div class="p-notification--positive"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
Using "RBAC,Node" for authorisation is the recommended configuration.
</p></div>

The order matters. Kubernetes will process each API request with each module in
sequence. If the current authorising module either allows or denies the
request, that decision is made and no further modules are consulted. If the
current module has no opinion on the request, then the decision is passed to
the next module in the list. If no decision has been returned by the last
module in the list, then the request is denied.



<a id='rbac'> </a>

## Further information on RBAC

Many of the defined roles (those prefixed by 'system:' ) for RBAC are really intended for
managing access to Kubernetes componenets themselves.

The main  cluster roles for additional users are:`admin`, `cluster-admin`, `edit` and `view` .

You can view the available roles,  cluster roles and bindings with the following commands:

```bash
kubectl get roles --all-namespaces
kubectl get clusterroles --all-namespaces
kubectl get rolebindings --all-namespaces
kubectl get clusterrolebindings  --all-namespaces
```

### Adding or removing users and editing roles

The recommended method for managing Kubernetes users is through an external
authentication service such as LDAP (see the documentation on
[using LDAP with CDK][docs-ldap]). You can read more about the Kubernetes
approach to authentication in this page of the
[Kubernetes documentation][upstream-authentication].

For simple systems, and for the purposes of testing, it can be useful to use the basic
file-based system. The instructions below demonstrate how to edit the `basic_auth.csv`
files on the `kubernetes-master` nodes.

#### Using `basic_auth` files

To add a user you will need to edit the /root/cdk/basic_auth.csv. Note that the
format for this file is password,user,uid,"group1,group2,group3".

First establish an SSH connection to the main kubernetes-master:

```bash
juju ssh kubernetes-master/0
```

Then edit the file:

```bash
sudo nano /root/cdk/basic_auth.csv
exit
```
...adding the appropriate details. You can then restart the master for the changes to take
effect:

```bash
juju run-action kubernetes-master/0 restart
```

For more detail on the roles and bindings, please see the
[Kubernetes RBAC documentation][rbac].

### Using AWS IAM with RBAC

AWS IAM credentials can be used for authentication and authorisation on your Charmed Kubernetes cluster, even if the cluster is not hosted on AWS. For further details see the documentation on [AWS IAM auth][aws-iam].

 <!-- LINKS -->


[upstream-auth]: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
[upstream-authentication]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/
[node]: https://kubernetes.io/docs/reference/access-authn-authz/node/
[abac]: https://kubernetes.io/docs/reference/access-authn-authz/abac/
[rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[webhook]: https://kubernetes.io/docs/reference/access-authn-authz/webhook/
[docs-ldap]: /kubernetes/docs/ldap
[roles]: #rbac
[aws-iam]: /kubernetes/docs/aws-iam-auth

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/auth.md" class="p-notification__action">edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
