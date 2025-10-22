---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Authentication with LDAP and Keystone"
  description: Using LDAP authentication via Keystone
keywords: LDAP, Keystone, authorisation
tags: [operating]
sidebar: k8smain-sidebar
permalink: ldap.html
layout: [base, ubuntu-com]
toc: False
---

There is a distinction between authentication and authorisation:

  * Authentication verifies who a user is.
  * Authorisation deals with what a user is allowed to do.

**Charmed Kubernetes** can be configured to use Keystone and LDAP for authentication only
or both authentication and authorisation.


## Requirements

* This document assumes you have already [installed][install] **Charmed Kubernetes**
  * Support for direct LDAP integration via Keystone is dropped beginning in
    **Charmed Kubernetes** 1.29, while, upgrades from 1.28 are partially supported.
    See [upgrading to 1.29][upgrading] for more detail.
* For LDAP authentication, this documentation assumes you already have a suitable LDAP
   server running.
* You will need to install the Keystone client. This can be done by running:
   ```bash
   sudo snap install client-keystone-auth
   ```


## Install Keystone

Note: These instructions assume you are working with the `Yoga` release of
**OpenStack**, the default supported version for Ubuntu 22.04 LTS (Jammy)

Keystone should be deployed using **Juju**. This is easily achieved by using a bundle,
which will deploy and relate, Keystone, the OpenStack dashboard and a suitable
database. An example bundle is [available for download][keystone-bundle].

Deploy the bundle with the following command:

```bash
juju deploy ./keystone.yaml
```

You can check that the new applications have deployed and are running with:

```bash
juju status
```

The Keystone application will need to be accessible by `kubectl` running on your desktop.
You will also need to access the dashboard for the following steps. This can be achieved
with Juju by running:

```bash
juju expose keystone
juju expose openstack-dashboard
```

Note that, if security is a concern, this access can subsequently be reversed with:

```bash
juju unexpose keystone
juju unexpose openstack-dashboard
```

## Using existing Keystone from an OpenStack model

If you have an existing Keystone application deployed as part of OpenStack in a separate Juju model,
it is possible to re-use it for authenticating and authorising users in Kubernetes.

No extra steps are needed, other than the credentials to access that OpenStack deployment

## Access the OpenStack dashboard

You can determine the web address for the OpenStack dashboard by running:

```bash
juju status openstack-dashboard
```

Open the address in a web browser and log in with the token obtained previously.

```bash
https://<openstack_dashboard_ip>/horizon
```

If you just deployed Keystone and do not have any credentials set, it is useful
to note that Keystone creates the domain `admin_domain` by default and has a user
named `admin` with a randomly-generated password. You can find the admin password
with:

```bash
juju exec --unit keystone/0 leader-get admin_passwd
```

### Create the domain for Kubernetes
You should now create a new domain for Kubernetes.

![dashboard image](https://assets.ubuntu.com/v1/00468cda-ldap1.png)

After creating, be sure to set the domain context so users and roles are added to the
proper domain.

![dashboard image](https://assets.ubuntu.com/v1/f6913d43-ldap2.png)

### Create a role for Kubernetes

Create an appropriate role for Kubernetes:

![dashboard image](https://assets.ubuntu.com/v1/f65d9f1f-ldap3.png)

Repeat the process for `k8s-viewers` and `k8s-users` if desired. These values
match with the `keystone-policy` configuration option on the kubernetes-control-plane
charm.

### Create a project for Kubernetes

As with the roles, the project name must match the value in the
`keystone-policy` configuration option on the kubernetes-control-plane charm.

![dashboard image](https://assets.ubuntu.com/v1/442f2a24-ldap4.png)

### Create a user for Kubernetes

Now ensure the user is added to the project created above.

![dashboard image](https://assets.ubuntu.com/v1/d6149d7c-ldap5.png)

## Deploying the Keystone-Auth Webhook for Kubernetes

### Understanding the Resources

Following the upstream docs for [keystone-auth][], the admin should deploy `keystone-auth`.
The following components are key for authentication and authorisation.

* `Secret/keystone-auth-certs`
  * provides the TLS cert/key pair for serving the `keystone-auth` webhook service
  * provides the TLS ca cert for contacting keystone (if necessary)
* `ConfigMap/k8s-auth-policy` or `ConfigMap/keystone-sync-policy`
  * Configuration for the deployment which translates Keystone users/roles into Kubernetes users/roles
* `Deployment/k8s-keystone-auth`
  * defines the PODs backing this service
  * defines the image used in the service
  * defines the secrets for the service
  * defines the configuration for the service
    * the `sync-configmap-name` for `keystone-auth`, and `kubernetes-rbac` for authorisation
    * the `policy-configmap-name` for `keystone-auth` and Keystone roles
* `ServiceAccount/k8s-keystone`, `ClusterRole/k8s-keystone-auth` and `ClusterRoleBinding/k8s-keystone-auth`
  * RBAC rules applied to the deployment to access the cluster `ConfigMap`
* `Service/k8s-keystone-auth-service`
  * Service mapping for the above `Deployment/k8s-keystone-auth`.

### Setting up the Resources

The following adjustments are required to deploy the service:

* `Secret/keystone-auth-certs`
  * requires the admin to generate a server cert/key pair for the service
  * requires the admin to provide the ca cert for the Keystone TLS endpoint (if required)
* `ConfigMap/k8s-auth-policy` (Optional)
  * Definitions for mapping keystone user/project/domain/roles to Kubernetes endpoints
  * See [keystone-authz-policy][] for details
* `ConfigMap/keystone-sync-policy` (Optional)
  * Definitions for mapping keystone user/project/domain/roles to Kubernetes endpoints
  * See [keystone-authn-policy][] for details
* `Deployment/k8s-keystone-auth`
  * Requires arg `keystone-ca-file` if `keystone-url` is `https`
  * Requires arg `policy-configmap-name` or `sync-configmap-name`
  * Requires secret volume mapping for the `tls.crt` and `tls.key`

The following adjustments are required to prepare the API server to use the
authentication endpoint (for both authentication and authorisation) and the
authorisation webhook endpoint.

* `authn-webhook-endpoint`
  **Required** for Authentication and Authorisation

  The API server requires the service endpoint to use as a custom
  authentication endpoint. Once applied to the cluster, the
  `Service/k8s-keystone-auth-service` should have a `ClusterIP` which will be
  used as the `authn-webhook-endpoint`.

  ```
  SVC_IP=$(kubectl get svc -n kube-system k8s-keystone-auth-service -o json | jq -r '.spec.clusterIP')
  juju config kubernetes-control-plane authn-webhook-endpoint="https://${SVC_IP}:8443/webhook"
  ```
* `authz-webhook-endpoint`
  **Required** only for Authorisation

  The API server requires the service endpoint in the `authorization-webhook-config-file`.
  Also, to use this config, the `authorization-mode` must add the `Webhook` mode.

  The crafting of this `webhook-config.yaml` is defined at in the [Keystone examples][keystone-webhook-config]
  based on the format defined in the [Kubernetes reference docs][webhook-config]

  First prepare `webhook-config.yaml` using the SVC_IP from above. Then:
  ```
  juju config kubernetes-control-plane authorization-webhook-config-file=$(cat webhook-config.yaml)
  juju config kubernetes-control-plane authorization-mode="Node,RBAC,Webhook"
  ```

## Using kubectl with Keystone

At this point, Keystone is set up and we have a domain, project, and user
created in Keystone.

The authenticating user will need an updated kubeconfig in order to
authenticate with the cluster. One can use `kubectl` to authenticate
with the api server via a token from Keystone. The `client-keystone-auth`
snap automates retrieving a token.

See the [Client configuration][keystone-client-config] to in order to create
the kubeconfig to use against the Keystone server.

The client will require the `client-keystone-auth` binary to use this config,
which can be installed using

```
snap install client-keystone-auth
```

The following variables will need to be set:

- `OS_USERNAME`
- `OS_PASSWORD`
- `OS_PROJECT_NAME`
- `OS_DOMAIN_NAME`
- `keystone-url`
- `keystone-ca-file` if `keystone-url` is `https`

## LDAP via Keystone

Keystone has the ability to use LDAP for authentication.
The Keystone charm is related to the Keystone-LDAP subordinate charm in order to
support LDAP.

```bash
juju deploy keystone-ldap
juju integrate keystone-ldap keystone
```

Now you need to add configuration to point to the LDAP server. For example:

```bash
juju config keystone-ldap ldap-server="ldap://10.10.10.10/" \
            ldap-user="cn=admin,dc=test,dc=com" \
            ldap-password="password" \
            ldap-suffix="dc=test,dc=com"

```

By default, the name of the application ('keystone-ldap') is the name of
the domain for which a domain specific configuration will be configured;
you can change this using the domain-name option:

```bash
juju config keystone-ldap domain-name="myorganisationname"
```

The Keystone charm will automatically create a domain to support the backend
once deployed.

For a more detailed explanation of the configuration and other options, please see the
[documentation for the ldap-keystone charm][docs-ldap-keystone]

## Authorisation

By default, **Charmed Kubernetes** will setup only authentication with Keystone. This allows the use of
other methods such as RBAC for authorisation but using Keystone for authentication:
usernames will come from Keystone, but what they can do in the cluster
is controlled by another system.

In order to enable authorisation feature in **Charmed Kubernetes** , change the default config
of the charm and switch to **RBAC** authorization mode as follows:

```bash
juju config kubernetes-control-plane authorization-mode="Node,RBAC"
```

**Charmed Kubernetes** can  also use Keystone for authorisation as follows:

```bash
juju config kubernetes-control-plane enable-keystone-authorization=true
```

 When authorisation is enabled, the [default policy defined in the configuration][policy] will be used.
 Optionally, A custom policy can be applied by running:

```bash
juju config kubernetes-control-plane keystone-policy="$(cat policy.yaml)"
```


## Custom Certificate Authority

When using a custom certificate authority attached to Keystone, some additional configuration is
required.

 * Add CA to client machines that will run `kubectl`.

```
sudo cp custom_ca.crt /usr/local/share/ca-certificates
sudo update-ca-certificates
```
 * Add CA to the kubernetes-control-plane configuration

```bash
juju config kubernetes-control-plane keystone-ssl-ca="$(base64 custom_ca.crt)"
```

## Troubleshooting

As with any application configuration, it is easy to make simple mistakes when entering
different values or editing config files. If you are having problems, please
[read the troubleshooting guide][trouble] for specific tips and information on
configuring Keystone/LDAP.


<!--LINKS-->
[install]: /kubernetes/charmed-k8s/docs/quickstart
[policy]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/policy.yaml
[keystone-bundle]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/keystone.yaml
[docs-ldap-keystone]: https://charmhub.io/keystone-ldap
[trouble]: /kubernetes/charmed-k8s/docs/troubleshooting/#troubleshooting-keystoneldap-issues
[upgrading]: /kubernetes/charmed-k8s/docs/upgrade-notes
[keystone-auth]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-client-keystone-auth.md
[keystone-authz-policy]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-keystone-webhook-authenticator-and-authorizer.md#prepare-the-authorization-policy-optional
[keystone-authn-policy]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-auth-data-synchronization.md
[keystone-client-config]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-keystone-webhook-authenticator-and-authorizer.md#clientkubectl-configuration
[keystone-webhook-config]: https://github.com/kubernetes/cloud-provider-openstack/blob/release-1.30/examples/webhook/keystone-apiserver-webhook.yaml
[webhook-config]: https://kubernetes.io/docs/reference/access-authn-authz/webhook/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/ldap.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://kubernetes.slack.com/archives/CG1V2CAMB"> public Slack  channel</a>.</p>
  </div>
</div>
