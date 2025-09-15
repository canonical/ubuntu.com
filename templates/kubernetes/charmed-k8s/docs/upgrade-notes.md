---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Upgrade notes"
  description: How to deal with specific, special circumstances you may encounter when upgrading between versions of Kubernetes.
keywords: juju, upgrading, track, version
tags: [operating]
sidebar: k8smain-sidebar
permalink: upgrade-notes.html
layout: [base, ubuntu-com]
toc: False
---

This page is intended to deal with specific, special circumstances you may
encounter when upgrading between versions of **Charmed Kubernetes**. The notes
are organised according to the upgrade path below, but also be aware that any
upgrade that spans more than one minor version may need to beware of notes in
any of the intervening steps.

## Upgrades to all versions deployed to Juju's `localhost` LXD based cloud

There is a known issue
([https://bugs.launchpad.net/juju/+bug/1904619](https://bugs.launchpad.net/juju/+bug/1904619))
with container profiles not surviving an upgrade in clouds running on LXD. If
your container-based applications fail to work properly after an upgrade,
please see this [topic on the troubleshooting
page](/kubernetes/charmed-k8s/docs/troubleshooting#charms-deployed-to-lxd-containers-fail-after-upgradereboot)

<a  id="1.29"> </a>

## Upgrading to 1.29

There are several important changes starting in 1.29 that will affect all
users:

- `kubeapi-load-balancer`, `kubernetes-control-plane`, and `kubernetes-worker`
    charms can be observed using the COS rather than LMA.
- Dropped specific relations and features which are outsourced to other charms

### Observability Relations

These represent relations which were removed in favour of observability with
the Canonical Observability Stack(COS).

LMA Relations:

- `nrpe-external-master` (provides: `nrpe-external-master` on KCP and KW)
- `prometheus` (provides: `prometheus-manual` on KCP)
- `scrape` (provides: `prometheus` on KW)
- `grafana` (provides: `grafana-dashboard` )

In order to prepare for observability, see the
[Integration with COS Lite docs][cos] which can be performed following an
upgrade of the charms but prior to an upgrade of the Kubernetes cluster.

### kube-api-endpoint relation dropped

The `kubernetes-control-plane:kube-api-endpoint` and
`kubernetes-worker:kube-api-endpoint` relations have been removed since these
APIs are provided by the `kube-control` relation. Ensure these two apps are
linked by `kube-control` relation before removing this relation.

```
juju integrate kubernetes-control-plane:kube-control kubernetes-worker:kube-control
juju remove-relation kubernetes-control-plane:kube-api-endpoint kubernetes-worker:kube-api-endpoint
```

### loadbalancer relation dropped

The `kubernetes-control-plane:loadbalancer` relation has been removed in favour
of using the `loadbalancer-internal` and `loadbalancer-external` relations.

```
juju integrate kubernetes-control-plane:loadbalancer-internal kubeapi-loadbalancer
juju integrate kubernetes-control-plane:loadbalancer-external kubeapi-loadbalancer
juju remove-relation kubernetes-control-plane:loadbalancer kubeapi-loadbalancer
```

### openstack relation deprecated

The `kubernetes-control-plane:openstack` relation is being deprecated.

Integration with openstack is still important with Charmed Kubernetes, but
continues that integration through the charms `openstack-cloud-controller` and
`cinder-csi`. These two charms better manage versions of those deployment
integrations with Kubernetes. See [openstack-integration][] for more details on
using these charms.

After upgrading the `kubernetes-control-plane` charm, the unit may enter
`blocked` status with the message: `openstack relation is no longer managed`. 

If you see this message, you can resolve it by removing the `openstack`
relation:

```
juju deploy openstack-cloud-controller --channel=1.29/stable
juju deploy cinder-csi --channel=1.29/stable
juju integrate openstack-cloud-controller openstack-integrator
juju integrate cinder-csi openstack-integrator
juju integrate openstack-cloud-controller:kube-control             kubernetes-control-plane:kube-control
juju integrate openstack-cloud-controller:external-cloud-provider  kubernetes-control-plane:external-cloud-provider
juju integrate openstack-cloud-controller:openstack                openstack-integrator:clients
juju integrate kubernetes-control-plane:kube-control               cinder-csi:kube-control
juju integrate openstack-integrator:clients                        cinder-csi:openstack
#   The following could be vault:certificates instead of easyrsa:client
#   Check what supplies the certificates for the kubernetes-control-plane
juju status kubernetes-control-plane --relations | grep ':certificates'
juju integrate openstack-cloud-controller:certificates             easyrsa:client   
juju integrate cinder-csi:certificates                             easyrsa:client

# Wait for the units to be active/idle, then
juju remove-relation kubernetes-control-plane:openstack            openstack:clients
```

### nvidia gpu operator deprecated

The `kubernetes-control-plane` has allowed the configuration of
`enable-nvidia-plugin=auto` where it would automatically detect a worker node
ready for GPU workloads and deploy the nvidia-plugin operator into the cluster.

After upgrading the `kubernetes-control-plane` charm, the unit may enter
`blocked` status with the message: `nvidia-plugin is no longer managed`.

If you see this message, you can resolve it by following the
[nvidia-gpu-operator][] docs to deploy a new charm. Once deployed, correcting
the config `enable-nvidia-plugin`

```
juju config kubernetes-control-plane enable-nvidia-plugin=false
```


### ceph-client relation deprecated

The `kubernetes-control-plane:ceph-client` relation is being deprecated
starting in the 1.29 release of charmed-kubernetes

Ceph integration is still a priority, but continues with the `ceph-csi` charm
which integrates Ceph with Kubernetes.

After upgrading the `kubernetes-control-plane` charm, the unit may enter
`blocked` status with the message: `ceph-client relation deprecated, use
ceph-csi charm instead`.

If you see this message, you can resolve it by removing the `ceph-client`
relation and deploying the ceph-csi charm to mimic the previous behaviour.

```
juju deploy ceph-csi --channel=1.29/stable --config release="v3.8.1"
juju integrate ceph-csi:ceph-client ceph-mon
juju remove-relation kubernetes-control-plane:ceph-client ceph-mon
juju integrate ceph-csi:kubernetes kubernetes-control-plane
```

### Keystone/K8s Authentication management

Charmed Kubernetes was installing and managing an older version of
keystone-auth which manages authentication and authorisation through Keystone.

This service is better suited to be managed externally from the
`kubernetes-control-plane` charm. However, the charm provides the following
upgrade method to maintain the deployment of this service beyond 1.28.

One can determine if Keystone management is applicable with:

```
juju status --relations | grep kubernetes-control-plane:keystone-credentials
```

If this is empty, no steps regarding Keystone management are required.

If this states:

```
keystone:identity-credentials  kubernetes-control-plane:keystone-credentials   keystone-credentials    regular
```

...then you'll need to prepare a bit before the upgrade.

#### Resources

The [upstream Keystone docs][keystone-auth] cover keystone-auth in detail and
should be the main reference for implementation details.

Keystone has two "Auth" options:

1. Authentication of users only called [keystone-authentication][]
2. Authentication and authorisation of users, called [keystone-authorization][]

Both options require the deployment and management of the
[k8s-keystone-auth webhook service][keystone-auth-webhook], a deployment which
provides a service endpoint for the `kubernetes-api-server` to use as an
intermediate to interact with an external Keystone service.

#### Preparation

Starting from version 1.29, the `kubernetes-control-plane` charm will drop the
following:

- `kubernetes-control-plane:keystone-credentials` relation
- `keystone-policy` config
- `enable-keystone-authorization` config
- `keystone-ssl-ca` config

Before upgrading, it is important to capture the state of these config options:

```
mkdir keystone-upgrade
juju config kubernetes-control-plane keystone-policy > keystone-upgrade/keystone-policy.yaml
juju config kubernetes-control-plane enable-keystone-authorization > keystone-upgrade/keystone-authorization
juju config kubernetes-control-plane keystone-ssl-ca | base64 -d > keystone-upgrade/keystone-webhook-ca.crt
juju exec -u kubernetes-control-plane/leader -- 'cat /root/cdk/keystone/webhook.yaml' > keystone-upgrade/webhook.yaml
```

#### Migration

After upgrading, the charm will enter a `blocked` state with the status
message: `Keystone credential relation is no longer managed`. This indicates
that the `k8s-keystone-auth` webhook service is still running, but is no longer
managed.

If `keystone-upgrade/keystone-authorization` contains `true`, then the webhook
should be enabled. This command adds the Keystone authorisation webhook config
and the `Webhook` authorisation mode:

``` 
juju config kubernetes-control-plane \
    authorization-webhook-config-file="$(cat keystone-upgrade/webhook.yaml)" \
    authorization-mode="Node,RBAC,Webhook"
```

Finally, acknowledge the charm no longer manages Keystone by removing the relation:

```
juju remove-relation kubernetes-control-plane:keystone-credentials keystone
```

#### Day 2 Operations Manually

After migration, the deployment, service, secrets, and policies associated with
`keystone-auth` are no longer handled by the `kubernetes-control-plane` charm.

The following components remain in the cluster, unmanaged by the charm, and
should be considered managed by the cluster administrators.

- `Deployment/kube-system/k8s-keystone-auth`
- `Service/kube-system/k8s-keystone-auth-service`
- `Secret/kube-system/keystone-auth-certs`
- `ConfigMap/kube-system/k8s-auth-policy`
- `ClusterRole/k8s-keystone-auth`

#### Day 2 Operations via Charm

The `keystone-k8s-auth` charm also provides management of these above resources.
The charm can be installed after the 1.29 upgrade, and used to manage these resource.

See [keystone-k8s-auth][] for more details


### Administrative Actions missing

The `kubernetes-control-plane` and `kubernetes-worker` actions list was
substantially reduced during development of 1.29.  The following are no longer
present, but are slated to be reintroduced:

- `restart`
- `namespace-list`
- `namespace-create`
- `namespace-delete`
- `user-create`
- `user-delete`
- `user-list`
- `apply-manifest`

### CIS-Benchmark Action missing

The `kubernetes-control-plane` and `kubernetes-worker` action for cis-benchmark
were removed during the development of the 1.29 charms and an engineering
decision to reintroduce these actions are on-going, but development and testing
incomplete. Details in [LP#2044219][]

### Automatic labelling of GPU nodes

While current worker nodes would remain unaffected as they would already be
labelled, the worker charm in 1.29 no longer labels the nodes with `gpu=true`
and `cuda=true`.

Parity with this feature has been attained by using the [nvidia-gpu-operator][]


<a  id="1.24"> </a>

## Upgrading to 1.24

There are several important changes to 1.24 that will affect all users:

 - Charms have migrated to the [Charmhub.io](https://charmhub.io) store.
 - Control-plane units will switch to a new charm named
   `kubernetes-control-plane`.The application in the juju model and all
   relations to it will remain under the same name `kubernetes-master`, only the
   charm supporting the application will switch. See [inclusive-naming] for an
   explanation about this.

Due to these and other changes, it is recommended to follow the specific upgrade
procedure described in the [upgrading to 1.24 docs](/kubernetes/charmed-k8s/docs/1.24/upgrading).

### ceph-storage relation deprecated

The `kubernetes-control-plane:ceph-storage` relation has been deprecated. After
upgrading the kubernetes-control-plane charm, the charm may enter `blocked`
status with the message:
`ceph-storage relation deprecated, use ceph-client instead`.

If you see this message, you can resolve it by removing the ceph-storage
relation:

```
juju remove-relation kubernetes-control-plane:ceph-storage ceph-mon
```

<a  id="1.19"> </a>

## Upgrading to 1.19

New in 1.19, master units rely on Kubernetes secrets for authentication. Entries
in the previously used "basic_auth.csv" and "known_tokens.csv" will be migrated to
secrets and new kubeconfig files will be created during the upgrade. Administrators
should update any existing kubeconfig files that are used outside of the cluster.

There is a [known issue](https://bugs.launchpad.net/charm-etcd/+bug/1913227)
with etcd 3.2 and Kubernetes 1.19. If you are still running etcd 3.2, upgrade
to etcd 3.4 prior to upgrading Kubernetes.

As of Kubernetes 1.19, kube-proxy's userspace proxier no longer works. Before you
upgrade, check the proxy-extra-args configs to make sure that the userspace proxy
mode is not being used in your cluster:

```bash
juju config kubernetes-master proxy-extra-args
juju config kubernetes-worker proxy-extra-args
```

If you see `proxy-mode=userspace` in the charm configs, remove it, then proceed
with the upgrade.

Please follow the [upgrade instructions for 1.19](/kubernetes/charmed-k8s/docs/1.19/upgrading).


<a  id="1.18"> </a>

## Upgrading to 1.18

### CDK Addons

As stated in the release notes, from 1.18, the `cluster-monitoring` addons (Heapster, InfluxDB, and Grafana)
have been removed from the Kubernetes source tree and therefore removed from the `cdk-addons` snap as well.

Customers relying on these addons should migrate to a `metrics-server` solution prior to upgrading.

**Note:** these removals do not affect the Kubernetes Dashboard nor the methods described in
[Monitoring Charmed Kubernetes](/kubernetes/charmed-k8s/docs/monitoring).

<a  id="1.16"> </a>

## Upgrading to 1.16

### Docker Registry with Containerd

Prior to 1.16, some fixes were required to support using the
Docker Registry charm with Containerd.

This charm, if used, is now supported through standard relations. Before upgrading,
remove any reference of the registry in the `custom_registries`
[containerd charm configuration](/kubernetes/charmed-k8s/docs/container-runtime).

After upgrading, see the [docker registry](/kubernetes/charmed-k8s/docs/docker-registry)
instructions for details of how to configure a registry.

### Admission control plugins

In **Charmed Kubernetes 1.16**, the API server parameter by which additional,
non-default admission control plugins is specified has changed. The old
parameter was `--admission-control`; the new parameter is `--enable-admission-plugins`.

For example, prior to 1.16, The 'PodSecurityPolicy' admission plugin could be
applied like this:
```bash
juju config kubernetes-master api-extra-args="admission-control=PodSecurityPolicy"
```

As of 1.16, this changes to:
```bash
juju config kubernetes-master api-extra-args="enable-admission-plugins=PodSecurityPolicy"
```

If using non-default admission plugins, be sure to upgrade your charm config
accordingly after upgrading to 1.16.

<a  id="1.15"> </a>

## Upgrading to 1.15

This upgrade switches the container runtime to make use of containerd, rather
than Docker. You have the option of keeping Docker as the container runtime,
but even in that case you ***must*** perform the upgrade steps. To facilitate
different container runtimes, the architecture of **Charmed Kubernetes** has
changed slightly, and the container runtime is now part of a separate,
subordinate charm rather than being included in the `kubernetes-master` and
`kubernetes-worker` charms.

### To keep Docker as the container runtime

Docker is currently installed on your kubernetes-worker units. The Docker subordinate
charm includes clean-up code to manage the transition to the new pluggable architecture.
To upgrade whilst retaining Docker as the runtime, you need to additionally deploy the new charm
and add relations to the master and worker components:

```bash
juju deploy docker
juju add-relation docker kubernetes-master
juju add-relation docker kubernetes-worker
```

The upgrade is complete, and your worker nodes will continue to use the Docker runtime.
For information on configuring the Docker charm, see the [Docker configuration page][docker-page].

### To migrate to containerd

If you intend to switch to containerd, it's recommended that you first add some
temporary extra worker units. While not strictly necessary, skipping this step will result
in some cluster down time. Adding temporary additional workers provides a place for keeping pods running while new workers are brought online. The temporary workers can then be removed as the pods are migrated to the new workers. The rest of these instructions assume that you have deployed temporary workers.

#### Deploy temporary workers
```bash
CURRENT_WORKER_REV=$(juju status | grep '^kubernetes-worker\s' | awk '{print $7}')
CURRENT_WORKER_COUNT=$(juju status | grep '^kubernetes-worker/' | wc -l | sed -e 's/^[ \t]*//')

juju deploy kubernetes-worker-$CURRENT_WORKER_REV  kubernetes-worker-temp -n $CURRENT_WORKER_COUNT
```

#### Add necessary relations
```bash
juju status --relations | grep worker: | awk '{print $1,$2}' | sed 's/worker:/worker-temp:/g' | xargs -n2 juju relate
```
Wait for the temporary workers to become active before continuing.
Upgrade the master and worker charms:
```bash
juju upgrade-charm kubernetes-master
juju upgrade-charm kubernetes-worker
```

The kubernetes-worker units will enter a blocked state, with status message
"Connect a container runtime."

#### Deploy and relate the new Docker charm

This step is needed even if you do not intend to use Docker following the
upgrade. Docker is already installed on your `kubernetes-worker` units, and
the Docker subordinate includes clean-up code to uninstall Docker when the
Docker charm is replaced with the containerd charm.

```bash
juju deploy docker
juju add-relation docker kubernetes-master
juju add-relation docker kubernetes-worker
```

### Switching to Containerd

Now, pause the existing workers, which will move pods to the temporary workers.

```bash
juju run-action [unit] pause
```

For example:
```bash
juju run-action kubernetes-worker/0 pause --wait
juju run-action kubernetes-worker/1 pause --wait
juju run-action kubernetes-worker/2 pause --wait
```

One-liner:
```bash
juju status | grep ^kubernetes-worker/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} pause --wait
```

#### Remove Docker

This will uninstall Docker from the workers.

```bash
juju remove-relation docker kubernetes-master
juju remove-relation docker kubernetes-worker
juju remove-application docker
```

#### Deploy Containerd

```bash
juju deploy containerd
juju add-relation containerd kubernetes-master
juju add-relation containerd kubernetes-worker
```

#### Resume workers
Now we can allow pods to be rescheduled to our original workers.

```bash
juju run-action [unit] resume --wait
```

E.g.
```bash
juju run-action kubernetes-worker/0 resume --wait
juju run-action kubernetes-worker/1 resume --wait
juju run-action kubernetes-worker/2 resume --wait
```

One-liner:
```bash
juju status | grep ^kubernetes-worker/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} resume --wait
```

#### Cleanup

You can now pause the temporary workers to force all pods to migrate back
to your "real" workers, then remove the temporary workers.

```bash
juju status | grep ^kubernetes-worker-temp/ | awk '{print $1}' | tr -d '*' | xargs -n1 -I '{}' juju run-action {} pause --wait

juju remove-application kubernetes-worker-temp
```


#### Mixing Containerd and Docker


Once you have a Containerd backed Charmed Kubernetes running, you can add Docker backed
workers like so:

```bash
juju deploy kubernetes-worker kubernetes-worker-docker
juju deploy docker
juju relate docker kubernetes-worker-docker
```

### Clusters which previously ran etcd 2.3

If your cluster has run etcd 2.3 at any point in the past, then it is
strongly recommended not to upgrade the etcd charm to revision 449. Doing so
will cause etcd to lose all of its data. For details, see
https://bugs.launchpad.net/charm-etcd/+bug/1843497

We recommend upgrading etcd directly to charm revision 460 instead.

<a  id="1.14"> </a>

## Upgrading to 1.14

This upgrade includes support for **CoreDNS 1.4.0**. All new deployments of
**Charmed Kubernetes** will install **CoreDNS** by default instead of **KubeDNS**.

Existing deployments which are upgraded to **Charmed Kubernetes 1.14** will continue to use
**KubeDNS** until the operator chooses to upgrade to **CoreDNS**. To upgrade,
set the new dns-provider config:


```bash
juju config kubernetes-master dns-provider=core-dns
```

Please be aware that changing DNS providers will momentarily interrupt DNS
availability within the cluster. It is not necessary to recreate pods after the
upgrade completes.

The `enable-kube-dns` option has been removed to avoid confusion. The new
`dns-provider` option allows you to enable or disable **KubeDNS** as needed.

For more information on the new `dns-provider config`, see the
[dns-provider config description][dns-provider-config].

<a  id="1.10"> </a>

## Upgrading from 1.9.x to 1.10.x

This upgrade includes a transistion between major versions of **etcd**, from 2.3 to 3.x. Between these releases, **etcd** changed the way it accesses storage, so it is necessary to reconfigure this. There is more detailed information on the change and the upgrade proceedure in the [upstream **etcd** documentation][etcd-upgrade].


<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">This upgrade <strong>must</strong> be completed before attempting to upgrade the running cluster.</p>
  </div>
</div>

To make this upgrade more convenient for users of **Charmed Kubernetes**, a script has been prepared to manage the transition. The script can be [examined here][script].

To use the script to update **etcd**, follow these steps:

### 1. Download the script with the command:

```bash
curl -O https://raw.githubusercontent.com/juju-solutions/cdk-etcd-2to3/master/migrate
```
### 2. Make the script executable:

```bash
chmod +x migrate
```
### 3. Execute the script:

```bash
./migrate
```
### 4. etcd OutputSed

The script should update **etcd** and you will see output similar to the following:
```no-highlight
· Waiting for etcd units to be active and idle...
· Acquiring configured version of etcd...
· Upgrading etcd to version 3.0/stable from 2.3/stable.
· Waiting for etcd upgrade to 3.0/stable............................................................
· Waiting for etcd units to be active and idle....................................................
· Waiting for etcd cluster convergence...
· Stopping all Kubernetes api servers...
· Waiting for etcd cluster convergence...
· Stopping etcd...
· Migrating etcd/0...
· Migrating etcd/1...
· Migrating etcd/2...
· Starting etcd...
· Configuring storage-backend to etcd3...
· Waiting for all Kubernetes api servers to restart.......
· Done.
```


You can now proceed with the rest of the upgrade.

<!--LINKS-->

[etcd-upgrade]: https://etcd.io/docs/v3.5/upgrades/upgrade_3_0/
[script]: https://raw.githubusercontent.com/juju-solutions/cdk-etcd-2to3/master/migrate
[dns-provider-config]: https://github.com/juju-solutions/kubernetes/blob/5f4868af82705a0636680a38d7f3ea760d35dadb/cluster/juju/layers/kubernetes-master/config.yaml#L58-L67
[docker-page]: https://charmhub.io/containers-docker#configuration
[inclusive-naming]: /kubernetes/charmed-k8s/docs/inclusive-naming
[LP#2044219]: https://bugs.launchpad.net/charm-kubernetes-master/+bug/2044219
[cos]: kubernetes/charmed-k8s/docs/how-to-cos-lite
[nvidia-gpu-operator]: kubernetes/charmed-k8s/docs/gpu-workers
[openstack-integration]: /kubernetes/charmed-k8s/docs/openstack-integration
[keystone-auth]: https://github.com/kubernetes/cloud-provider-openstack/tree/master/docs/keystone-auth
[keystone-auth-webhook]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-keystone-webhook-authenticator-and-authorizer.md#k8s-keystone-auth
[keystone-authentication]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-auth-data-synchronization.md#full-example-using-keystone-for-authentication-and-kubernetes-rbac-for-authorization
[keystone-authorization]: https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/keystone-auth/using-keystone-webhook-authenticator-and-authorizer.md#authorization-policy-definitionversion-2
[keystone-k8s-auth]: https://charmhub.io/keystone-k8s-auth

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/upgrade-notes.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/charmed-k8s/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
