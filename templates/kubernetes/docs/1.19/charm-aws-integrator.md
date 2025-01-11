---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: kubernetes/docs/shared/_side-navigation.md
context:
  title: "Aws-integrator charm "
  description: "Charm to enable AWS integrations via Juju relations.\n"
keywords: component, charms, versions, release
tags:
  - reference
sidebar: k8smain-sidebar
permalink: 1.19/charm-aws-integrator.html
layout:
  - base
  - ubuntu-com
toc: false
charm_revision: "69"
charm_name: aws-integrator
bundle_release: "1.19"
---

This charm acts as a proxy to AWS and provides an [interface][] to apply a
certain set of changes via IAM roles, profiles, and tags to the instances of
the applications that are related to this charm.

## Usage

When on AWS, this charm can be deployed, granted trust via Juju to access AWS,
and then related to an application that supports the [interface][]. The set
of permissions that the related application could request is documented in the
interface's [Requires API documentation][api-doc].

For example, [Charmed Kubernetes][] has support for this, and can be deployed with the
following bundle overlay:

```yaml
applications:
  aws-integrator:
    charm: cs:~containers/aws-integrator
    num_units: 1
    trust: true
relations:
  - ["aws-integrator", "kubernetes-master"]
  - ["aws-integrator", "kubernetes-worker"]
```

Then deploy Charmed Kubernetes using this overlay:

```
juju deploy cs:charmed-kubernetes --overlay ./k8s-aws-overlay.yaml --trust
```

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">This trusts the AWS Integrator charm with the credentials used by Juju.  You
    could instead provide alternate credentials via the `credentials` charm config
    option.</p>
  </div>
</div>

## RDS

In addition to the integrator relation, this charm also provides a proxy to the
AWS Relational Database Service (RDS) for charms using the `mysql` interface.
Charms attached to the `rds-mysql` relation endpoint will have an RDS MySQL
database instance created for them and access information provided via the relation.

For example, if this was deployed alongside the Mediawiki charm, it could provide
the database for backing the wiki:

```yaml
applications:
  aws-integrator:
    charm: cs:~containers/aws-integrator
    num_units: 1
    trust: true
  mediawiki:
    charm: cs:mediawiki
    num_units; 1
relations:
  - ['aws-integrator:rds-mysql', 'mediawiki:db']
```

# Permissions Requirements

The credentials given to the charm must include the following access rights:

| EC2                         |
| --------------------------- |
| AssociateIamInstanceProfile |
| CreateTags                  |
| DescribeInstances           |

| IAM                           |
| ----------------------------- |
| AddRoleToInstanceProfile      |
| AttachRolePolicy              |
| CreateInstanceProfile         |
| CreatePolicy                  |
| CreateRole                    |
| DeleteInstanceProfile         |
| DeletePolicy                  |
| DeleteRole                    |
| DetachRolePolicy              |
| ListAttachedRolePolicies      |
| ListInstanceProfiles          |
| ListPolicies                  |
| ListRoles                     |
| RemoveRoleFromInstanceProfile |
| CreatePolicyVersion           |
| ListPolicyVersions            |
| GetPolicyVersion              |
| DeletePolicyVersion           |
| SetDefaultPolicyVersion       |
| GetPolicy                     |

| STS               |
| ----------------- |
| GetCallerIdentity |

| RDS                             |
| ------------------------------- |
| DescribeDBInstances             |
| CreateDBInstance                |
| DeleteDBInstance                |
| DeleteDBInstanceAutomatedBackup |

Note that these may be different from the permissions that Juju requires to operate.

# Resource Usage Note

By relating to this charm, other charms can directly allocate resources, such
as EBS volumes and ELBs, which could lead to cloud charges and count against
quotas. Because these resources are not managed by Juju, they will not be
automatically deleted when the models or applications are destroyed, nor will
they show up in Juju's status or GUI. It is therefore up to the operator to
manually delete these resources when they are no longer needed, using the
AWS console or API.

# Examples

Following are some examples using AWS integration with Charmed Kubernetes.

## Creating a pod with an EBS-backed volume

This script creates a busybox pod with a persistent volume claim backed by
AWS's Elastic Block Storage.

```sh
#!/bin/bash

# create a storage class using the `kubernetes.io/aws-ebs` provisioner
kubectl create -f - <<EOY
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-1
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
EOY

# create a persistent volume claim using that storage class
kubectl create -f - <<EOY
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: testclaim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
  storageClassName: ebs-1
EOY

# create the busybox pod with a volume using that PVC:
kubectl create -f - <<EOY
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  namespace: default
spec:
  containers:
    - image: busybox
      command:
        - sleep
        - "3600"
      imagePullPolicy: IfNotPresent
      name: busybox
      volumeMounts:
        - mountPath: "/pv"
          name: testvolume
  restartPolicy: Always
  volumes:
    - name: testvolume
      persistentVolumeClaim:
        claimName: testclaim
EOY
```

## Creating a service with an AWS load-balancer

The following script starts the hello-world pod behind an AWS Elastic Load Balancer.

```bash
kubectl create deployment hello-world --image=gcr.io/google-samples/node-hello:1.0
kubectl scale deployment hello-world --replicas=5
kubectl expose deployment hello-world --type=LoadBalancer --name=hello --port=8080
watch kubectl get svc hello -o wide
```

## Configuration

<!-- CONFIG STARTS -->
<!--AUTOGENERATED CONFIG TEXT - DO NOT EDIT -->

| name                                              | type   | Default | Description                                                                                                                                              |
| ------------------------------------------------- | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="table-access-key"> </a> access-key         | string |         | An IAM access key. It is strongly recommended that you use 'juju trust' instead, if available.                                                           |
| <a id="table-credentials"> </a> credentials       | string |         | [See notes](#credentials-description)                                                                                                                    |
| <a id="table-secret-key"> </a> secret-key         | string |         | An IAM secret key. It is strongly recommended that you use 'juju trust' instead, if available.                                                           |
| <a id="table-snap_proxy"> </a> snap_proxy         | string |         | DEPRECATED. Use snap-http-proxy and snap-https-proxy model configuration settings. HTTP/HTTPS web proxy for Snappy to use when accessing the snap store. |
| <a id="table-snap_proxy_url"> </a> snap_proxy_url | string |         | DEPRECATED. Use snap-store-proxy model configuration setting. The address of a Snap Store Proxy to use for snaps e.g. http://snap-proxy.example.com      |
| <a id="table-snapd_refresh"> </a> snapd_refresh   | string |         | [See notes](#snapd_refresh-description)                                                                                                                  |

---

### credentials

<a id="credentials-description"> </a>
**Description:**

The base64-encoded contents of an AWS credentials file, which must include
both 'aws_access_key_id' and 'aws_secret_access_key' fields.

This can be used from bundles with 'include-base64://' (see
https://discourse.charmhub.io/t/bundle-reference/1158),
or from the command-line with 'juju config aws credentials="$(base64 /path/to/file)"'.

It is strongly recommended that you use 'juju trust' instead, if available.
This will take precedence over the 'access-key' / 'secret-key' config options.

[Back to table](#table-credentials)

### snapd_refresh

<a id="snapd_refresh-description"> </a>
**Description:**

How often snapd handles updates for installed snaps. The default (an empty string) is 4x per day. Set to "max" to check once per month based on the charm deployment date. You may also set a custom string as described in the 'refresh.timer' section here:
https://forum.snapcraft.io/t/system-options/87

[Back to table](#table-snapd_refresh)

<!-- CONFIG ENDS -->

[interface]: https://github.com/juju-solutions/interface-aws-integration
[api-doc]: https://github.com/juju-solutions/interface-aws-integration/blob/master/docs/requires.md
[charmed kubernetes]: https://jaas.ai/charmed-kubernetes
