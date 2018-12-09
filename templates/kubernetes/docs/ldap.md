---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
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

**CDK** can be configured to use Keystone and LDAP for authentication only
or both authentication and authorisation.


## Requirements

* This document assumes you have already [installed][install] **CDK**.
* For LDAP authentication, this documentation assumes you already have a suitable LDAP
   server running.
* You will need to install the Keystone client. This can be done by running:
   ```bash
   sudo snap install client-keystone-auth
   ```

## Install Keystone

Note: These instructions assume you are working with the `Queens` release of
**OpenStack**, the default supported version for Ubuntu 18.04 (Bionic)

Keystone should be deployed using **Juju**. This is easily achieved by using a bundle,
which will deploy and relate, Keystone, the OpenStack dashboard and a suitable
database. An example bundle is available for [download here][keystone-bundle].

Deploy the bundle with the following command:

```bash
juju deploy ./keystone.yaml
```

You should now add a relation for the kubernetes-master nodes to accept Keystone
credentials:

```bash
juju add-relation keystone:identity-credentials kubernetes-master:keystone-credentials
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

## Fetch the Keystone script

When related to Keystone, the Kubernetes master application will generate a utility
script. This should be copied to the local client with:

```bash
juju scp kubernetes-master/0:kube-keystone.sh ~/kube-keystone.sh
```

The file will need to be edited to replace the value for `OS_AUTH_URL`, which should
point at the public address for Keystone, and the username if different. At this point the
file should be sourced:

```bash
source ~/kube-keystone.sh
```

The script should prompt you to enter an additional command to retrieve the token to
login to the OpenStack Dashboard. If this step fails, check that the details in the
`kube-keystone.sh` file are correct.

## Access the dashboard

You can determine the web address for the OpenStack dashboard by running:

```bash
juju status openstack-dashboard
```

Open the address in a webbrowser and login with the token obtained previously.

## Create the domain for Kubernetes
You should now be able to access the OpenStack Dashboard and create a new domain.

![dashboard image](https://assets.ubuntu.com/v1/00468cda-ldap1.png)

After creating, be sure to set the domain context so users and roles are added to the
proper domain.

![dashboard image](https://assets.ubuntu.com/v1/f6913d43-ldap2.png)

## Create a role for Kubernetes

Create an appropriate role for Kubernetes:

![dashboard image](https://assets.ubuntu.com/v1/f65d9f1f-ldap3.png)

Repeat the process for `k8s-viewers` and `k8s-users` if desired. These values
match with the `keystone-policy` configuration option on the kubernetes-master
charm.

## Create a project for Kubernetes

As with the roles, the project name must match the value in the
`keystone-policy` configuration option on the kubernetes-master charm.

![dashboard image](https://assets.ubuntu.com/v1/442f2a24-ldap4.png)

## Create a user for Kubernetes

Now ensure the user is added to the project created above.

![dashboard image](https://assets.ubuntu.com/v1/d6149d7c-ldap5.png)

##  LDAP via Keystone

Keystone has the ability to use LDAP for authentication.
The Keystone charm is related to the Keystone-LDAP subordinate charm in order to
support LDAP.  

```bash
juju deploy keystone-ldap
juju add-relation keystone-ldap keystone
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

By default, **CDK** will setup only authentication with Keystone. This allows the use of
other methods such as RBAC for authorisation but using Keystone for authentication:
usernames will come from Keystone, but what they can do in the cluster
is controlled by another system.

**CDK** can  also use Keystone for authorisation as follows:

```bash
juju config kubernetes-master enable-keystone-authorization=true
```

 When authorisation is enabled, the policy is defined in the configuration. A new
 policy can be applied by running:

```bash
juju config kubernetes-master keystone-policy=$(cat policy.yaml)
```

The [default policy may be downloaded][policy] for easy editing.

## Troubleshooting

As with any application configuration, it is easy to make simple mistakes when entering
different values or editing config files. If you are having problems, please [read the troubleshooting guide][trouble] for specific tips and information on configuring Keystone/LDAP.

<!--LINKS-->
[install]: /kubernetes/docs/quickstart
[policy]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/policy.yaml
[keystone-bundle]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/keystone.yaml
[docs-ldap-keystone]: https://jujucharms.com/keystone-ldap
[trouble]: /kubernetes/docs/troubleshooting/#troubleshooting-keystoneldap-issues
