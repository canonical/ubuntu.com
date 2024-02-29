---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "AWS-IAM on Charmed Kubernetes"
  description: Using AWS credentials to authenticate and authorise on Charmed Kubernetes
keywords: aws, auth, iam
tags: [install]
sidebar: k8smain-sidebar
permalink: aws-iam-auth.html
layout: [base, ubuntu-com]
toc: False
---

## AWS IAM

[AWS IAM](https://aws.amazon.com/iam/) credentials can be used for
authentication and authorisation on your **Charmed Kubernetes** cluster without
regard to where it is hosted. The only requirement is that both the client
machine running `kubectl` and the nodes running the webhook pod(s) are able to
reach AWS in order to get and validate tokens.


### Installing

The [aws-iam][aws-iam-charm] subordinate charm
and some relations are all that are required. These can be added with the
following overlay([download it here][asset-aws-iam-overlay]):

```yaml
applications:
  aws-iam:
    charm: aws-iam
relations:
  - ['aws-iam', 'kubernetes-control-plane']
  - ['aws-iam', 'vault']
```

or if using easyrsa:

```yaml
applications:
  aws-iam:
    charm: aws-iam
relations:
  - ['aws-iam', 'kubernetes-control-plane']
  - ['aws-iam', 'easyrsa']
```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes  --overlay ~/path/aws-iam-overlay.yaml
```

### User Configuration

The [aws-iam-authenticator][aws-iam-authenticator-github] is configured via
[Custom Resource Definition or CRD][k8s-crd-docs]s. These resource definitions
map an AWS IAM role or user to a [Kubernetes RBAC][k8s-rbac-docs] user
or group. This means that authentication happens via AWS IAM credentials,
but authorisation depends on standard Kubernetes RBAC rules. The CRD for
this mapping is called an IAMIdentityMapping and looks something like this:

```yaml
apiVersion: iamauthenticator.k8s.aws/v1alpha1
kind: IAMIdentityMapping
metadata:
  name: kubernetes-admin
spec:
  # Arn of the User or Role to be allowed to authenticate
  arn: arn:aws:iam::xxxxx:role/k8s-view-role
  # Username that Kubernetes will see the user as, this is useful for setting
  # up allowed specific permissions for different users
  username: john
  # Groups to be attached to your users/roles. For example `system:masters` to
  # create cluster admin, or `view` for view only,
  groups:
  - view
```

### Using AWS-IAM with kubectl

#### Download aws-iam-authenticator

The `aws-iam-authenticator` binary needs to be installed on the machine that is
running kubectl. This is executed by kubectl in order to log in and get a token,
which is then passed to the Kubernetes API server. You can find the binary
on the [aws-iam-authenticator releases page][aws-iam-authenticator-releases].

#### Setting up AWS Role

The aws-iam-authenticator is able to use any ARN for authentication. The easiest
way to get started is to use an empty role as described in the
[aws-iam documentation][aws-iam-role-creation].
 * Log into AWS console and navigate to [the IAM page][aws-iam-page].
 * Click "create new role".
 * Choose the "Role for cross-account access" / "Provide access between AWS accounts you own" option.
 * Paste in your AWS account ID number (available in the top right in the console).
 * Your role does not need any additional policies attached.

#### Updating kubectl config

In order to use the [aws-iam-authenticator][aws-iam-authenticator-github] with
kubectl, an updated config file is needed. The config file written to the
kubernetes-control-plane unit will have a user named `aws-iam-user` that uses the
`aws-iam-authenticator` client binary and a context named aws-iam-authenticator.
First, copy the config:

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

The config file will need to be edited in order to add the desired
Amazon Resource Name(ARN) for authentication. Information about this can
be found on the
[aws-iam-authenticator documentation][aws-iam-authenticator-config].
It is necessary to replace <<insert_arn_here>> with the ARN of the
aws user or role desired. It may also be necessary to adjust the
command to fully-qualify the path to `aws-iam-authenticator` if
it is not located in your path.

Before switching context to the aws-iam context, be sure to deploy the CRD
above to give your user access to the cluster.

The context that uses aws-iam-authenticator can be selected with:

```bash
kubectl config use-context aws-iam-authenticator
```

Note that the `aws-iam-authenticator` binary behaves like the
`aws` command line interface in that it will read environment
variables like AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. See
[aws-iam-authenticator credentials docs][aws-iam-creds] for more
information.

### A note about authorisation

The AWS-IAM charm can be used for authentication only or can be used in an
RBAC-enabled cluster to authorise users as well. If the charm is related to
a Charmed Kubernetes cluster without RBAC enabled, any valid AWS IAM
credential that can assume a role specified in the IAMIdentityMapping
CRD will be able to run commands against the cluster. If RBAC is enabled,
the user will have the permissions of the user defined in the
IAMIdentityMapping CRD.

### Enabling RBAC

In order to get authorisation with AWS-IAM, you will need to use RBAC.
Refer to the Charmed Kubernetes [RBAC documentation][k8s-rbac-docs] for
complete options, but at a minimum you will need to enable RBAC with
`juju config kubernetes-control-plane authorization-mode="RBAC,Node"`. At
this point, valid AWS credentials will fail unless connected to a default
account.

```bash
kubectl get po -A
```
... will result in an error:

```
Error from server (Forbidden): pods is forbidden: User "knobby" cannot list resource "pods" in API group "" at the cluster scope
```

The username is pulled from the matching CRD. In this case, the following CRD was used:

```yaml
apiVersion: iamauthenticator.k8s.aws/v1alpha1
kind: IAMIdentityMapping
metadata:
  name: kubernetes-admin
spec:
  # Arn of the User or Role to be allowed to authenticate
  arn: arn:aws:iam::xxxxxxxxxx:role/k8s-view-role
  # Username that Kubernetes will see the user as, this is useful for setting
  # up allowed specific permissions for different users
  username: knobby
  # Groups to be attached to your users/roles. For example `system:masters` to
  # create cluster admin, or `system:nodes`, `system:bootstrappers` for nodes to
  # access the API server.
  groups:
  - view
```
Logging in with the k8s-view-role matched against the RBAC user 'knobby', but this user has
no permissions so the command failed. Create an RBAC Role and RoleBinding to grant permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources:
  - pods
  verbs:
  - get
  - list
  - watch

---
apiVersion: rbac.authorization.k8s.io/v1
# This role binding allows "knobby" to read pods in the "default" namespace.
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: knobby
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Now the command will succeed.

```bash
kubectl get po
```

```no-highlight
No resources found.
```

Note that the permissions in this example are limited to the 'default' namespace. For example:

```bash
kubectl get po --all-namespaces
```
...will result in an error:

```no-highlight
Error from server (Forbidden): pods is forbidden: User "knobby" cannot list resource "pods" in API group "" at the cluster scope
```

### Upgrading the AWS-IAM charm

The AWS IAM charm is not specifically tied to the version of
Charmed Kubernetes installed and may generally be upgraded at any
time with the following command:

```bash
juju refresh aws-iam
```

### Troubleshooting

If you have any specific problems with aws-iam, you
can report bugs on [Launchpad][bugs].

Since aws-iam charm makes use of IAM accounts in AWS to
perform actions, activity logs can be obtained from
[Amazon's CloudTrail][cloudtrail].

The flow of operations that occur when using kubectl with aws-iam is as follows:
1. kubectl execs `aws-iam-authenticator` to get a token.
2. `aws-iam-authenticator` contacts AWS from the user's machine
to get the token.
3. kubectl passes token to the Kubernetes API server.
4. The API server passes the token to the webhook pod for verification.
5. The webhook pod contacts AWS to verify the token.
6. The webhook pod returns RBAC user information to the API server.
7. The API server uses RBAC rules to authorise the user.

One can troubleshoot these steps to figure out where things are going wrong.
 * Run `aws-iam-authenticator token -i <cluster id> -r <aws arn>` to see if a
token is returned. Note that `aws-iam-authenticator` will cache credentials
between calls.
 * Check verbose output of `kubectl` command by adding `--v=9` such as
`kubectl get po --v=9`
 * Check the logs of the `aws-iam-authenticator` deployment with
`juju exec --unit kubernetes-control-plane/0 -- /snap/bin/kubectl --kubeconfig /root/.kube/config -n kube-system logs deploy/aws-iam-authenticator`
 * Check the logs of the API server with `juju exec --unit kubernetes-control-plane/0 -- journalctl -u snap.kube-apiserver.daemon.service`

<!-- LINKS -->

[asset-aws-iam-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/aws-overlay.yaml
[aws-iam-charm]: https://jaas.ai/u/containers/aws-iam
[aws-iam-authenticator-github]: https://github.com/kubernetes-sigs/aws-iam-authenticator
[k8s-crd-docs]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
[k8s-rbac-docs]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[cloudtrail]: https://console.aws.amazon.com/cloudtrail/
[quickstart]: /kubernetes/docs/quickstart
[bugs]: https://bugs.launchpad.net/charm-aws-iam
[aws-iam-authenticator-config]: https://github.com/kubernetes-sigs/aws-iam-authenticator#4-set-up-kubectl-to-use-authentication-tokens-provided-by-aws-iam-authenticator-for-kubernetes
[aws-iam-creds]: https://github.com/kubernetes-sigs/aws-iam-authenticator#specifying-credentials--using-aws-profiles
[aws-iam-role-creation]: https://github.com/kubernetes-sigs/aws-iam-authenticator#1-create-an-iam-role
[aws-iam-authenticator-releases]: https://github.com/kubernetes-sigs/aws-iam-authenticator/releases
[aws-iam-page]: https://console.aws.amazon.com/iam/home

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">
      We appreciate your feedback on the documentation. You can
      <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/aws-iam-auth.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>