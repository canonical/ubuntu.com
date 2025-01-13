---
wrapper_template: templates/docs/markdown.html
markdown_includes:
  nav: kubernetes/docs/shared/_side-navigation.md
context:
  title: 'Etcd charm '
  description: Deploy a TLS terminated ETCD Cluster
keywords: component, charms, versions, release
tags:
    - reference
sidebar: k8smain-sidebar
permalink: 1.22/charm-etcd.html
layout:
    - base
    - ubuntu-com
toc: false
charm_revision: '620'
bundle_release: '1.22'
---

Etcd is a highly available distributed key value store that provides a reliable
way to store data across a cluster of machines. Etcd gracefully handles master
elections during network partitions and will tolerate machine failure,
including the master.

Your applications can read and write data into etcd. A simple use-case is to
store database connection details or feature flags in etcd as key value pairs.
These values can be watched, allowing your app to reconfigure itself when they
change.

Advanced uses take advantage of the consistency guarantees to implement
database master elections or do distributed locking across a cluster of
workers.

Etcd allows storing data in a distributed hierarchical database with
observation.

# Usage

We can deploy a single node with the following commands:

```shell
juju deploy cs:~containers/easyrsa
juju deploy cs:~containers/etcd
juju add-relation etcd easyrsa
```
And add capacity with:

```shell
juju add-unit -n 2 etcd
```

It's recommended to run an odd number of machines as it has greater redundancy
than an even number (i.e. with 4, you can lose 1 before quorum is lost, whereas
with 5, you can lose 2).

### Notes about cluster turn-up

The etcd charm initializes a cluster using the Static configuration: which
is the most "flexible" of all the installation options, considering it allows
etcd to be self-discovering using the peering relationships provided by
Juju.

# Health
Health of the cluster can be checked by running a juju action.

```shell
juju run-action --wait etcd/0 health
```

The health is also reported continuously via `juju status`. During initial
cluster turn-up, it's entirely reasonable for the health checks to fail; this
is not a situation to cause you alarm. The health-checks are being executed
before the cluster has stabilized, and it should even out once the members
start to come online and the update-status hook is run again.

This will give you some insight into the cluster on a 5 minute interval, and
will report healthy nodes vs unhealthy nodes.

For example:

```shell
Unit        Workload  Agent  Machine  Public address  Ports     Message
etcd/0*     active    idle   1        54.227.0.225    2379/tcp  Healthy with 3 known peers
etcd/1      active    idle   2        184.72.191.212  2379/tcp  Healthy with 3 known peers
etcd/2      active    idle   3        34.207.195.139  2379/tcp  Healthy with 3 known peers
```

# TLS

The ETCD charm supports TLS terminated endpoints by default. All efforts have
been made to ensure the PKI is as robust as possible.

Client certificates can be obtained by running an action on any of the cluster
members:

```shell
juju run-action --wait etcd/0 package-client-credentials
juju scp etcd/0:etcd_credentials.tar.gz etcd_credentials.tar.gz
```

This will place the client certificates in `pwd`. If you're keen on using
etcdctl outside of the cluster machines,  you'll need to expose the charm,
and export some environment variables to consume the client credentials.

If you are using etcd <=3.2.x:

```shell
juju expose etcd
export ETCDCTL_KEY_FILE=$(pwd)/client.key
export ETCDCTL_CERT_FILE=$(pwd)/client.crt
export ETCDCTL_CA_FILE=$(pwd)/ca.crt
export ETCDCTL_ENDPOINT=https://{ip of etcd host}:2379
etcdctl member list
```

Or if you're using etcd >=3.3.x:

```shell
juju expose etcd
export ETCDCTL_KEY=$(pwd)/client.key
export ETCDCTL_CERT=$(pwd)/client.crt
export ETCDCTL_CACERT=$(pwd)/ca.crt
export ETCDCTL_ENDPOINT=https://{ip of etcd host}:2379
etcdctl member list
```

If in doubt, you can always export all the env vars from both.

# Persistent Storage

Many cloud providers use ephemeral storage. When using cloud provider
infrastructures is recommended to place any data-stores on persistent volumes
that exist outside of the ephemeral storage on the unit.

Juju abstracts this with the [storage provider](https://juju.is/docs/olm/defining-and-using-persistent-storage).


To add a unit of storage we'll first need to discover what storage types the
cloud provides to us, which can be listed:
```
juju list-storage-pools
```

### AWS Storage example

To add SSD backed EBS storage from AWS, the following example provisions a
single 10GB SSD EBS instance and attaches it to the etcd/0 unit.

```
juju add-storage etcd/0 data=ebs-ssd,10G
```

### GCE Storage example

To add Persistent Disk storage from GCE, the following example
provisions a single 10GB PD instance and attaches it to the etcd/0 unit.

```
juju add-storage etcd/0 data=gce,10G
```

### Cinder Storage example

To add Persistent Disk storage from Open Stack Cinder, the following example
provisions a single 10GB PD instance and attaches it to the etcd/0 unit.

```
juju add-storage etcd/0 data=cinder,10G
```

# Operational Actions

### Restore

Allows the operator to restore the data from a cluster-data snapshot. This
action is supported on both single member and cluster deployments. However
it must be always executed on the leader unit.

```
juju attach etcd snapshot=/path/to/etcd-backup
juju run-action --wait etcd/leader restore
```

- **param** target: destination directory to save the existing data.

- **param** skip-backup: Don't backup any existing data. (defaults to True)

### Snapshot

Allows the operator to snapshot a running clusters data for use in cloning,
backing up, or migrating etcd clusters.

```
juju run-action --wait etcd/0 snapshot target=/mnt/etcd-backups keys-version=v3
```

- **param** target: destination directory to save the resulting snapshot archive.
- **param** keys-version: etcd keys-version to snapshot: `v3` and `v2` are valid options here

*NOTE:* etcd supports multiple key versions (presently v2 and v3) and data for each
version is separate, so you must specify which set of data you wish to snapshot.
If your etcd is deployed for Kubernetes versions post 1.10, data will be stored in
v3 format, if you are snapshotting 1.09 or older, you may want `keys-version=v2`

# Migrating etcd

Migrating the etcd data is a fairly easy task. Use the following steps:

Step 1: Snapshot your existing cluster. This is encapsulated in the `snapshot`
action.

```
$ juju run-action --wait etcd/0 snapshot keys-version=v3

Action queued with id: b46d5d6f-5625-4320-8cda-b611c6ae580c
```

Step 2: Check the status of the action so you can verify the hash sum of the
resulting file. The output will contain results.copy.cmd the value can be
copied and used to download the snapshot that you just created.

Download the snapshot tar archive from the unit that created the snapshot and
verify the sha256 hash sum.

```
$ juju show-action-output b46d5d6f-5625-4320-8cda-b611c6ae580c
results:
  copy:
    cmd: juju scp etcd/0:/home/ubuntu/etcd-snapshots/etcd-snapshot-2016-11-09-02.41.47.tar.gz
      .
  snapshot:
    path: /home/ubuntu/etcd-snapshots/etcd-snapshot-2016-11-09-02.41.47.tar.gz
    sha256: 1dea04627812397c51ee87e313433f3102f617a9cab1d1b79698323f6459953d
    size: 68K
status: completed

$ juju scp etcd/0:/home/ubuntu/etcd-snapshots/etcd-snapshot-2016-11-09-02.41.47.tar.gz .

$ sha256sum etcd-snapshot-2016-11-09-02.41.47.tar.gz
```

Step 3: Deploy the new cluster leader, and attach the snapshot as a resource.

```
juju deploy etcd new-etcd --resource snapshot=./etcd-snapshot-2016-11-09-02.41.47.tar.gz
```

Step 4: Re-Initialize the etcd leader with the data by running the `restore`
action which uses the resource that was attached in step 3.

```
juju run-action --wait new-etcd/0 restore
```

Step 5: Scale and operate as required, verify the data was restored.

# Limited egress operations

The etcd charm installs the etcd application as a snap package. You can supply
an etcd.snap resource to make this charm easily installable behind a firewall.

```
juju deploy /path/to/etcd
juju attach etcd etcd=/path/to/etcd.snap
```

### Post Deployment Snap Upgrades (if using the resource)

The charm if installed from a locally supplied resource will be locked into
that resource version until another is supplied and explicitly installed.

```
juju attach etcd etcd=/path/to/new/etcd.snap
juju run-action etcd/0 install
juju run-action etcd/1 install
```

# Migrate from Deb to Snap

> This section only applies if you are upgrading an existing etcd charm
> deployments. This migration should only be needed once because new
> deployments of etcd will default to snap delivery.

Revision 24 and prior the etcd charm installed the etcd application from Debian
packages. Revisions 25+ install from the snap store (or resource).
During the migration process, you will be notified that a classic installation
exists and a manual migration action must be run.

Before a migration is your opportunity to ensure state has been captured, and
to plan for downtime, as this migration process will stop and resume the etcd
application. This service disruption can cause disruptions with other dependent
applications.

### Starting the migration

The deb to snap migration process has been as automated as possible. Despite
the automatic backup mechanism during the migration process, you are still
encouraged to run a [snapshot](#Snapshot) before executing the upgrade.

Once the snapshot is completed, begin the migration process. You first need to
upgrade the charm to revision 25 or later.

```
juju upgrade-charm etcd
```

For your convenience there is the `snap-upgrade` action that removes the Debian
package and installs the snap package. Each etcd unit will need to be upgraded
individually. Best practice would be to migrate an individual unit at a time
to ensure the cluster upgrades completely.

```
juju run-action etcd/0 snap-upgrade
# Repeat this command for other etcd units in your cluster.
```

Once the unit has completed upgrade, the unit's status message will return to
its normal health check messaging.

```
Unit        Workload  Agent  Machine  Public address  Ports     Message
etcd/0*     active    idle   1        54.89.190.93    2379/tcp  Healthy with 3 known peers
```

Once you have the snap package you can upgrade to different versions of etcd by
configuring the snap `channel` configuration option on the charm.

```
juju config etcd channel=3.0/stable
```

# Known Limitations

### Moving from 2.x to 3.x and beyond

The etcd charm relies heavily on the snap package for etcd. In order to properly
migrate a 2.x series etcd deployment into 3.1 and beyond you will need to follow
a proper channel migration path. The initial deb to snap upgrade process will
place you in a 2.3 deployment.

You can migrate from 2.3 to 3.0

```
juju config etcd channel=3.0/stable
```

From the 3.0 channel you can migrate to 3.1 (current latest at time of writing)

```
juju config etcd channel=3.1/stable
```

You **MUST** perform the 2.3 => 3.0 before moving from 3.0 => 3.1  A migration
from 2.3 => 3.1 is not supported at this time.

### Multiple snapd refresh timers

The etcd charm exposes a `snapd_refresh` config option that is used to control
how often snapd checks for updates to installed snaps. By default, this is set
to `max` which scans for refreshes once per month. If a subordinate charm based
on layer-snap is related to an etcd principal unit, the refresh timer may be
inadvertantly changed.

The best practice for deploying multiple layer-snap charms onto a single
machine is to ensure `snapd_refresh` is consistent among those charms. As an
example, set an explicit refresh timer for the last Friday of the month with:

```
juju config etcd snapd_refresh='fri5'
```

### TLS Defaults Warning (for Trusty etcd charm users)

Additionally, this charm breaks with no backwards compatible/upgrade path at
the Trusty/Xenial series boundary. Xenial forward will enable TLS by default.
This is an incompatible break due to the nature of peer relationships, and how
the certificates are generated/passed off.

To migrate from Trusty to Xenial, the operator will be responsible for deploying
the Xenial etcd cluster, then issuing an etcd data dump on the trusty series,
and importing that data into the new cluster. This can be only be performed on
a single node due to the nature of how replicas work in etcd.

Any issues with the above process should be filed against the charm layer in
[github](https://github.com/juju-solutions/layer-etcd).

### Restoring from snapshot on a scaled cluster

Restoring from a snapshot on a scaled cluster will result in a broken cluster.
Etcd performs clustering during unit turn-up, and state is stored in etcd itself.
During the snapshot restore phase, a new cluster ID is initialized, and peers
are dropped from the snapshot state to enable snapshot restoration. Please
follow the migration instructions above in the restore action description.

## Configuration

<!-- CONFIG STARTS -->
<!--AUTOGENERATED CONFIG TEXT - DO NOT EDIT -->


| name | type   | Default      | Description                               |
|------|--------|--------------|-------------------------------------------|
| <a id="table-bind_to_all_interfaces"> </a> bind_to_all_interfaces | boolean | True | The service binds to all network interfaces if true. The service binds only to the first found bind address of each relation if false  |
| <a id="table-channel"> </a> channel | string | auto | [See notes](#channel-description)  |
| <a id="table-management_port"> </a> management_port | int | 2380 | Port to run the ETCD Management service  |
| <a id="table-nagios_context"> </a> nagios_context | string | juju | [See notes](#nagios_context-description)  |
| <a id="table-nagios_servicegroups"> </a> nagios_servicegroups | string |  | A comma-separated list of nagios servicegroups. If left empty, the nagios_context will be used as the servicegroup  |
| <a id="table-port"> </a> port | int | 2379 | Port to run the public ETCD service on  |
| <a id="table-snap_proxy"> </a> snap_proxy | string |  | DEPRECATED. Use snap-http-proxy and snap-https-proxy model configuration settings. HTTP/HTTPS web proxy for Snappy to use when accessing the snap store.  |
| <a id="table-snap_proxy_url"> </a> snap_proxy_url | string |  | DEPRECATED. Use snap-store-proxy model configuration setting. The address of a Snap Store Proxy to use for snaps e.g. http://snap-proxy.example.com  |
| <a id="table-snapd_refresh"> </a> snapd_refresh | string | max | [See notes](#snapd_refresh-description)  |

---

### channel


<a id="channel-description"> </a>
**Description:**

The snap channel from which to install etcd (e.g. '3.3/stable'), or 'auto'
to accept the charm default. Choosing 'auto' will install the latest
supported version of etcd at deploy time, but will not automatically upgrade
to a newer version thereafter.

[Back to table](#table-channel)


### nagios_context


<a id="nagios_context-description"> </a>
**Description:**

Used by the nrpe subordinate charms.
A string that will be prepended to instance name to set the host name
in nagios. So for instance the hostname would be something like:

```
    juju-myservice-0
```

If you're running multiple environments with the same services in them
this allows you to differentiate between them.

[Back to table](#table-nagios_context)


### snapd_refresh


<a id="snapd_refresh-description"> </a>
**Description:**

How often snapd handles updates for installed snaps. Set to an empty
string to check 4x per day. Set to "max" (the default) to check once per
month based on the charm deployment date. You may also set a custom
string as described in the 'refresh.timer' section here:
  https://forum.snapcraft.io/t/system-options/87

[Back to table](#table-snapd_refresh)



<!-- CONFIG ENDS -->


## Actions

<!-- ACTIONS STARTS -->
<!-- AUTOGENERATED TEXT - DO NOT EDIT -->

You can run an action with the following

```bash
juju run-action etcd ACTION [parameters] [--wait]
```
<div class="row">
  <div class="col-2">
    <h5>
      alarm-disarm
    </h5>
  </div>
  <div class="col-5">
    <p>
      Disarm all alarms.
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      alarm-list
    </h5>
  </div>
  <div class="col-5">
    <p>
      List all alarms.
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      cis-benchmark
    </h5>
  </div>
  <div class="col-5">
    <p>
      Run the CIS Kubernetes Benchmark against snap-based components.
    </p>
  </div>
</div>
<div class="row">
  <div class="col-2"></div>
  <div class="col-5">
    <p>
      This action has the following parameters:
    </p>
    <hr>
    <pre>apply</pre>
    <p>
      Apply remediations to address benchmark failures. The default, 'none', will not attempt to fix any reported failures. Set to 'conservative' to resolve simple failures. Set to 'dangerous' to attempt to resolve all failures. Note: Applying any remediation may result in an unusable cluster.
    </p>
    <p>
      <strong>Default:</strong> none
    </p><br>
    <pre>config</pre>
    <p>
      Archive containing configuration files to use when running kube-bench. The default value is known to be compatible with snap components. When using a custom URL, append '#&lt;hash_type&gt;=&lt;checksum&gt;' to verify the archive integrity when downloaded.
    </p>
    <p>
      <strong>Default:</strong> https://github.com/charmed-kubernetes/kube-bench-c onfig/archive/cis-1.5.zip#sha1=cb8e78712ee5bfeab87 d0ed7c139a83e88915530
    </p><br>
    <pre>release</pre>
    <p>
      Set the kube-bench release to run. If set to 'upstream', the action will compile and use a local kube-bench binary built from the master branch of the upstream repository: https://github.com/aquasecurity/kube-bench This value may also be set to an accessible archive containing a pre-built kube-bench binary, for example: https://github.com/aquasecurity/kube- bench/releases/download/v0.0.34/kube-bench_0.0.34_ linux_amd64.tar.gz#sha256=f96d1fcfb84b18324f1299db 074d41ef324a25be5b944e79619ad1a079fca077
    </p>
    <p>
      <strong>Default:</strong> https://github.com/aquasecurity/kube- bench/releases/download/v0.2.3/kube-bench_0.2.3_li nux_amd64.tar.gz#sha256=429a1db271689aafec009434de d1dea07a6685fee85a1deea638097c8512d548
    </p><br>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      compact
    </h5>
  </div>
  <div class="col-5">
    <p>
      Compact etcd event history.
    </p>
  </div>
</div>
<div class="row">
  <div class="col-2"></div>
  <div class="col-5">
    <p>
      This action has the following parameters:
    </p>
    <hr>
    <pre>physical</pre>
    <p>
      Setting to True will cause the compaction process to exit only after all revisions have been physically removed from the database.
    </p>
    <p>
      <strong>Default:</strong> False
    </p><br>
    <pre>revision</pre>
    <p>
      Revision to compact to. Leave blank to compact to the latest revision.
    </p>
    <p>
      <strong>Default:</strong>
    </p><br>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      debug
    </h5>
  </div>
  <div class="col-5">
    <p>
      Collect debug data
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      defrag
    </h5>
  </div>
  <div class="col-5">
    <p>
      Defragment the storage of the local etcd member.
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      health
    </h5>
  </div>
  <div class="col-5">
    <p>
      Report the health of the cluster.
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      package-client-credentials
    </h5>
  </div>
  <div class="col-5">
    <p>
      Generate a tarball of the client certificates to connect to the cluster remotely.
    </p>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      restore
    </h5>
  </div>
  <div class="col-5">
    <p>
      Restore an etcd cluster's data from a snapshot tarball.
    </p>
  </div>
</div>
<div class="row">
  <div class="col-2"></div>
  <div class="col-5">
    <p>
      This action has the following parameters:
    </p>
    <hr>
    <pre>skip-backup</pre>
    <p>
      Dont backup any existing data, and skip directly to data restoration.
    </p>
    <p>
      <strong>Default:</strong> True
    </p><br>
    <pre>target</pre>
    <p>
      Path on disk to save any pre-existing data.
    </p>
    <p>
      <strong>Default:</strong> /home/ubuntu
    </p><br>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      snap-upgrade
    </h5>
  </div>
  <div class="col-5">
    <p>
      Execute a migration from the apt package to a snap package format.
    </p>
  </div>
</div>
<div class="row">
  <div class="col-2"></div>
  <div class="col-5">
    <p>
      This action has the following parameters:
    </p>
    <hr>
    <pre>use-resource</pre>
    <p>
      Default to using the resource (offline environments)
    </p>
    <p>
      <strong>Default:</strong> False
    </p><br>
  </div>
</div>
<hr>
<div class="row">
  <div class="col-2">
    <h5>
      snapshot
    </h5>
  </div>
  <div class="col-5">
    <p>
      Export and compress a backup of the data in the Etcd cluster.
    </p>
  </div>
</div>
<div class="row">
  <div class="col-2"></div>
  <div class="col-5">
    <p>
      This action has the following parameters:
    </p>
    <hr>
    <pre>keys-version</pre>
    <p>
      Version of keys to snapshoot. Allowed values 'v3' or 'v2'.
    </p>
    <p>
      <strong>Default:</strong> v2
    </p><br>
    <pre>target</pre>
    <p>
      Location to save the etcd snapshot.
    </p>
    <p>
      <strong>Default:</strong> /home/ubuntu/etcd-snapshots
    </p><br>
  </div>
</div>
<hr>

<!-- ACTIONS ENDS -->
