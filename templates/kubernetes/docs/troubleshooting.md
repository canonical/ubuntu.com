---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Troubleshooting"
  description: How to troubleshoot the deployment of a Kubernetes cluster.
keywords: juju, troubleshooting, helm
tags: [operating]
sidebar: k8smain-sidebar
permalink: troubleshooting.html
layout: [base, ubuntu-com]
toc: False
---

This document covers how to troubleshoot the deployment of a Kubernetes cluster, it will not cover debugging of workloads inside Kubernetes.

## Understanding Cluster Status

Using `juju status` can give you some insight as to what's happening in a cluster:

```no-highlight
Model                         Controller          Cloud/Region   Version  SLA          Timestamp
charmed-kubernetes            aws-91c             aws/eu-west-1  2.4.5    unsupported  08:38:09+01:00

App                           Version  Status  Scale  Charm                  Store       Rev  OS      Notes
aws-integrator                1.15.71  active      1  aws-integrator                jujucharms    5  ubuntu
easyrsa                       3.0.1    active      1  easyrsa                       jujucharms  117  ubuntu
etcd                          3.2.10   active      3  etcd                          jujucharms  209  ubuntu
flannel                       0.10.0   active      5  flannel                       jujucharms  146  ubuntu
kubeapi-load-balancer         1.14.0   active      1  kubeapi-load-balancer         jujucharms  162  ubuntu  exposed
kubernetes-control-plane      1.12.1   active      2  kubernetes-control-plane      jujucharms  219  ubuntu
kubernetes-worker             1.12.1   active      3  kubernetes-worker             jujucharms  239  ubuntu  exposed

Unit                             Workload  Agent  Machine  Public address  Ports           Message
aws-integrator/0*                active    idle   0        54.171.121.229                  ready
easyrsa/0*                       active    idle   1        34.251.192.5                    Certificate Authority connected.
etcd/0*                          active    idle   2        52.18.186.65    2379/tcp        Healthy with 3 known peers
etcd/1                           active    idle   3        54.194.35.197   2379/tcp        Healthy with 3 known peers
etcd/2                           active    idle   4        34.240.14.183   2379/tcp        Healthy with 3 known peers
kubeapi-load-balancer/0*         active    idle   5        34.244.110.15   443/tcp         Loadbalancer ready.
kubernetes-control-plane/0*      active    idle   6        34.254.175.71   6443/tcp        Kubernetes master running.
  flannel/0*                     active    idle            34.254.175.71                   Flannel subnet 10.1.16.1/24
kubernetes-control-plane/1       active    idle   7        52.210.61.51    6443/tcp        Kubernetes master running.
  flannel/3                      active    idle            52.210.61.51                    Flannel subnet 10.1.38.1/24
kubernetes-worker/0*             active    idle   8        34.246.168.241  80/tcp,443/tcp  Kubernetes worker running.
  flannel/1                      active    idle            34.246.168.241                  Flannel subnet 10.1.79.1/24
kubernetes-worker/1              active    idle   9        54.229.236.169  80/tcp,443/tcp  Kubernetes worker running.
  flannel/4                      active    idle            54.229.236.169                  Flannel subnet 10.1.10.1/24
kubernetes-worker/2              active    idle   10       34.253.203.147  80/tcp,443/tcp  Kubernetes worker running.
  flannel/2                      active    idle            34.253.203.147                  Flannel subnet 10.1.95.1/24

Entity  Meter status  Message
model   amber         user verification pending

Machine  State    DNS             Inst id              Series  AZ          Message
0        started  54.171.121.229  i-0f47fcfb452fa8fab  bionic  eu-west-1a  running
1        started  34.251.192.5    i-011007983db6d2736  bionic  eu-west-1b  running
2        started  52.18.186.65    i-0b411be2a3909ae32  bionic  eu-west-1a  running
3        started  54.194.35.197   i-0fccba854c6d59ffe  bionic  eu-west-1b  running
4        started  34.240.14.183   i-02148162336e08864  bionic  eu-west-1c  running
5        started  34.244.110.15   i-08833b743ebcd0d9c  bionic  eu-west-1c  running
6        started  34.254.175.71   i-0f18d3f7377ba406f  bionic  eu-west-1a  running
7        started  52.210.61.51    i-08ec1daf25fb18fa3  bionic  eu-west-1b  running
8        started  34.246.168.241  i-0934f74bfdfba2a3f  bionic  eu-west-1b  running
9        started  54.229.236.169  i-0a4129c834c713a5e  bionic  eu-west-1a  running
10       started  34.253.203.147  i-053492139b1080ce0  bionic  eu-west-1c  running
```

In this example we can glean some information. The `Workload` column will show the status of a given service. The `Message` section will show you the health of a given service in the cluster. During deployment and maintenance these workload statuses will update to reflect what a given node is doing. For example the workload may say `maintenance` while message will describe this maintenance as `Installing docker`.

During normal operation the Workload should read `active`, the Agent column (which reflects what the Juju agent is doing) should read `idle`, and the messages will either say `Ready` or another descriptive term. `juju status --color` will also return all green results when a cluster's deployment is healthy.

Status can become unwieldy for large clusters, it is then recommended to check status on individual services, for example to check the status on the workers only:

```bash
juju status kubernetes-worker
```

or just on the etcd cluster:

```bash
juju status etcd
```

Errors will have an obvious message, and will return a red result when used with `juju status --color`. Nodes that come up in this manner should be investigated.

## SSHing to units

You can ssh to individual units easily with the following convention, `juju ssh <servicename>/<unit#>`:

```bash
juju ssh kubernetes-worker/3
```

Will automatically ssh you to the 3rd worker unit.

```bash
juju ssh easyrsa/0
```

This will automatically ssh you to the easyrsa unit.

## Collecting debug information

To collect comprehensive debug output from your Charmed Kubernetes cluster, install and run
[juju-crashdump](https://github.com/juju/juju-crashdump) on a computer that has the Juju client installed, with the current controller and model pointing at your Charmed Kubernetes deployment.

```bash
sudo snap install juju-crashdump --classic --channel edge
juju-crashdump -a debug-layer -a config
```

Running the `juju-crashdump` script will generate a tarball of debug information that includes systemd unit status and logs, Juju logs, charm unit data, and Kubernetes cluster information. It is recommended that you include this tarball when [filing a bug](https://bugs.launchpad.net/charmed-kubernetes).

## Common Problems

### Charms deployed to LXD containers fail after upgrade/reboot

For deployments using Juju's `localhost` cloud, which deploys charms to LXD/LXC containers, or other 
cases where applications are deployed to LXD, there is a known issue
([https://bugs.launchpad.net/juju/+bug/1904619](https://bugs.launchpad.net/juju/+bug/1904619))
with the profiles applied by Juju. The LXD profile used by Juju is named after the charm, including
the revision number. Upgrading the charm causes Juju to create a new profile for LXD which does not
necessarily contain the same settings which were originally supplied. If services based on LXD
containers fail to resume after an upgrade, this is a potential cause of that failure.

To check what the profiles should contain, the YAML output from `juju status` or `juju machines` can be used:

```bash
juju machines --format=yaml
```
... will detail the profiles in the output, e.g.:

```
model:
  name: default
machines:
  "0":
...
    instance-id: juju-4ac678-1
...
lxd-profiles:
      juju-default-kubernetes-worker-718:
        config:
          linux.kernel_modules: ip_tables,ip6_tables,netlink_diag,nf_nat,overlay
          raw.lxc: |
            lxc.apparmor.profile=unconfined
            lxc.mount.auto=proc:rw sys:rw
            lxc.cgroup.devices.allow=a
            lxc.cap.drop=
          security.nesting: "true"
          security.privileged: "true"
        description: ""
        devices:
          aadisable:
            path: /dev/kmsg
            source: /dev/kmsg
            type: unix-char

...
```

To check this matches with the actually applied profile, you can run `lxc` (this needs to be run on the machine where the containers are running).

```bash
lxc profile show juju-default-kubernetes-worker-718
```
This should give the appropriate corresponding output:

```yaml
config:
  linux.kernel_modules: ip_tables,ip6_tables,netlink_diag,nf_nat,overlay
  raw.lxc: |
    lxc.apparmor.profile=unconfined
    lxc.mount.auto=proc:rw sys:rw
    lxc.cgroup.devices.allow=a
    lxc.cap.drop=
  security.nesting: "true"
  security.privileged: "true"
description: ""
devices:
  aadisable:
    path: /dev/kmsg
    source: /dev/kmsg
    type: unix-char
name: juju-default-kubernetes-worker-718
used_by:
- /1.0/instances/juju-4ac678-1
```

If this differs from what is expected, the profile can be manually edited. E.g., for the above profile:

```bash
lxc profile edit juju-default-kubernetes-worker-718
```


### Load Balancer interfering with Helm

This section assumes you have a working deployment of Kubernetes via Juju using a Load Balancer for the API, and that you are using Helm to deploy charts.

To deploy Helm you will have run:

```bash
helm init
$HELM_HOME has been configured at /home/ubuntu/.helm
Tiller (the helm server side component) has been installed into your Kubernetes Cluster.
Happy Helming!
```

Then when using helm you may see one of the following errors:

- Helm doesn't get the version from the Tiller server

```bash
helm version
Client: &version.Version{SemVer:"v2.1.3", GitCommit:"5cbc48fb305ca4bf68c26eb8d2a7eb363227e973", GitTreeState:"clean"}
Error: cannot connect to Tiller
```

- Helm cannot install your chart

```bash
helm install <chart> --debug
Error: forwarding ports: error upgrading connection: Upgrade request required
```

This is caused by the API load balancer not forwarding ports in the context of the helm client-server relationship. To deploy using helm, you will need to follow these steps:

1.  Expose the Kubernetes Master service

    ```bash
    juju expose kubernetes-control-plane
    ```

1.  Identify the public IP address of one of your masters

    ```bash
     juju status kubernetes-control-plane
    ```

    ```no-highlight
    Model                         Controller          Cloud/Region   Version  SLA          Timestamp
    charmed-kubernetes            aws-91c  aws/eu-west-1  2.4.5    unsupported  08:39:23+01:00

    App                       Version  Status  Scale  Charm                     Store       Rev  OS      Notes
    flannel                   0.10.0   active      2  flannel                   jujucharms  146  ubuntu
    kubernetes-control-plane  1.12.1   active      2  kubernetes-control-plane  jujucharms  219  ubuntu

    Unit                         Workload  Agent  Machine  Public address  Ports     Message
    kubernetes-control-plane/0*  active    idle   6        34.254.175.71   6443/tcp  Kubernetes master running.
      flannel/0*                 active    idle            34.254.175.71             Flannel subnet 10.1.16.1/24
    kubernetes-control-plane/1   active    idle   7        52.210.61.51    6443/tcp  Kubernetes master running.
      flannel/3                  active    idle            52.210.61.51              Flannel subnet 10.1.38.1/24

    Entity  Meter status  Message
    model   amber         user verification pending

    Machine  State    DNS            Inst id              Series  AZ          Message
    6        started  34.254.175.71  i-0f18d3f7377ba406f  bionic  eu-west-1a  running
    7        started  52.210.61.51   i-08ec1daf25fb18fa3  bionic  eu-west-1b  running
    ```

    In this context the public IP address is 54.210.100.102.

    If you want to access this data programmatically you can use the JSON output:

    ```bash
    juju status --format json | jq -r '.applications."kubernetes-control-plane".units | to_entries[] | [.value."public-address"] | @tsv'
    54.210.100.102
    ```

1.  Update the kubeconfig file

    Identify the kubeconfig file or section used for this cluster, and edit the server configuration.

    By default, it will look like `https://54.213.123.123:443`. Replace it with the Kubernetes Master endpoint `https://54.210.100.102:6443` and save.

    Note that the default port used by Charmed Kubernetes for the Kubernetes Master API is 6443 while the port exposed by the load balancer is 443.

1.  Start helm again!

    ```
    helm install <chart> --debug
    Created tunnel using local port: '36749'
    SERVER: "localhost:36749"
    CHART PATH: /home/ubuntu/.helm/<chart>
    NAME:   <chart>
    ...
    ...
    ```

## Logging and monitoring

By default there is no log aggregation of the Kubernetes nodes, each node logs locally. Please read over the [logging](/kubernetes/docs/logging) page for more information.

## Troubleshooting Keystone/LDAP issues

The following section offers some notes to help determine issues with using Keystone
for authentication/authorisation.

Testing the steps is important to determine the cause of the problem.

### Can you communicate with Keystone and get an authorization token?

First is to verify that Keystone communication works from both your client and
the kubernetes-worker machines. The easiest thing to do here is to copy the
kube-keystone.sh script to the machines of interest from kubernetes-control-plane with
`juju scp kubernetes-control-plane/0:kube-keystone.sh .`, edit the script to include
your credentials, `source kube-keystone.sh` and then run `get_keystone_token`.
This will produce a token from the Keystone server. If that isn't working,
check firewall settings on your Keystone server. Note that the
kube-keystone.sh script could be overwritten, so it is a best practice to make
a copy somewhere and use that.

### Are the pods for Keystone authentication up and running properly?

The Keystone pods live in the kube-system namespace and read a configmap from
Kubernetes for the policy. Check to make sure they are running:

```bash
kubectl -n kube-system get po
```
```bash
NAME                                              READY   STATUS    RESTARTS   AGE
k8s-keystone-auth-5c6b7f9b7c-mvvkx                1/1     Running   0          21m
k8s-keystone-auth-5c6b7f9b7c-q2jfq                1/1     Running   0          21m
```

Check the logs of the pods for errors:

```bash
kubectl -n kube-system logs k8s-keystone-auth-5c6b7f9b7c-mvvkx
```
```bash
W1121 05:02:02.878988       1 config.go:73] Argument --sync-config-file or --sync-configmap-name missing. Data synchronization between Keystone and Kubernetes is disabled.
I1121 05:02:02.879139       1 keystone.go:527] Creating kubernetes API client.
W1121 05:02:02.879151       1 client_config.go:548] Neither --kubeconfig nor --master was specified.  Using the inClusterConfig.  This might not work.
I1121 05:02:02.893499       1 keystone.go:544] Kubernetes API client created, server version v1.12
I1121 05:02:02.998944       1 keystone.go:93] ConfigMaps synced and ready
I1121 05:02:02.999045       1 keystone.go:101] Starting webhook server...
I1121 05:02:02.999262       1 keystone.go:155] ConfigMap created or updated, will update the authorization policy.
I1121 05:02:02.999459       1 keystone.go:171] Authorization policy updated.
```

### Is the configmap with the policy correct?

Check the configmap contents. The pod logs above would complain if the YAML
isn't valid, but make sure it matches what you expect.

```bash
kubectl -n kube-system get configmap k8s-auth-policy -o=yaml
```
```yaml
apiVersion: v1
data:
  policies: |
    [
      {
        "resource": {
          "verbs": ["get", "list", "watch"],
          "resources": ["pods"],
          "version": "*",
          "namespace": "default"
        },
        "match": [
          {
            "type": "user",
            "values": ["admin"]
          },
        ]
      }
    ]
kind: ConfigMap
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","data":{"policies":"[\n  {\n    \"resource\": {\n      \"verbs\": [\"get\", \"list\", \"watch\"],\n      \"resources\": [\"pods\"],\n      \"version\": \"*\",\n      \"namespace\": \"default\"\n    },\n    \"match\": [\n      {\n        \"type\": \"user\",\n        \"values\": [\"admin\"]\n      },\n    ]\n  }\n]\n"},"kind":"ConfigMap","metadata":{"annotations":{},"labels":{"k8s-app":"k8s-keystone-auth"},"name":"k8s-auth-policy","namespace":"kube-system"}}
  creationTimestamp: 2018-11-21T02:38:12Z
  labels:
    k8s-app: k8s-keystone-auth
  name: k8s-auth-policy
  namespace: kube-system
  resourceVersion: "16736"
  selfLink: /api/v1/namespaces/kube-system/configmaps/k8s-auth-policy
  uid: 7dc0842b-ed36-11e8-82e1-06d4a9ac9e06
```

### Check the service and endpoints

Verify the service exists and has endpoints

```bash
kubectl get svc -n kube-system
```
```bash
NAME                        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
heapster                    ClusterIP   10.152.183.49    <none>        80/TCP              136m
**k8s-keystone-auth-service   ClusterIP   10.152.183.200   <none>        8443/TCP            105m**
kube-dns                    ClusterIP   10.152.183.218   <none>        53/UDP,53/TCP       137m
kubernetes-dashboard        ClusterIP   10.152.183.142   <none>        443/TCP             136m
metrics-server              ClusterIP   10.152.183.245   <none>        443/TCP             136m
monitoring-grafana          ClusterIP   10.152.183.2     <none>        80/TCP              136m
monitoring-influxdb         ClusterIP   10.152.183.172   <none>        8083/TCP,8086/TCP   136m
$ kubectl -n kube-system get ep
NAME                        ENDPOINTS                       AGE
heapster                    10.1.20.4:8082                  136m
**k8s-keystone-auth-service   10.1.20.5:8443,10.1.32.4:8443   105m**
kube-controller-manager     <none>                          136m
kube-dns                    10.1.31.6:53,10.1.31.6:53       136m
kube-scheduler              <none>                          136m
kubernetes-dashboard        10.1.31.3:8443                  136m
metrics-server              10.1.32.2:443                   136m
monitoring-grafana          10.1.31.2:3000                  136m
monitoring-influxdb         10.1.31.2:8086,10.1.31.2:8083   136m
```

### Attempt to authenticate directly to the service

Use a token to auth with the Keystone service directly:

```bash
cat <<EOF | curl -ks -XPOST -d @- https://10.152.183.200:8443/webhook | python -mjson.tool
{
  "apiVersion": "authentication.k8s.io/v1beta1",
  "kind": "TokenReview",
  "metadata": {
    "creationTimestamp": null
  },
  "spec": {
    "token": "$(get_keystone_token)"
  }
}
EOF

{
    "apiVersion": "authentication.k8s.io/v1beta1",
    "kind": "TokenReview",
    "metadata": {
        "creationTimestamp": null
    },
    "spec": {
        "token": "gAAAAABb9Yeel_62KoSb_fAL6RPMpGZ4-4y5RLqXq5YdY3PcIKpuIcZ8PoVPhQtHOR7fiPYpFQX_pAUZJ4yngSE_WbJeuX8c-pl5WgStNImmkH3sEvQ5nSfimGhQSH-k5ydCBhcor87AeN7dOS-X6zHMRrcyvnZffQ"
    },
    "status": {
        "authenticated": true,
        "user": {
            "extra": {
                "alpha.kubernetes.io/identity/project/id": [
                    ""
                ],
                "alpha.kubernetes.io/identity/project/name": [
                    ""
                ],
                "alpha.kubernetes.io/identity/roles": [],
                "alpha.kubernetes.io/identity/user/domain/id": [
                    "e1cbddf1b75340499109f0b88b28d472"
                ],
                "alpha.kubernetes.io/identity/user/domain/name": [
                    "admin_domain"
                ]
            },
            "groups": [
                ""
            ],
            "uid": "432f311e7eb94689b10aee03293ab030",
            "username": "admin"
        }
    }
}
```

Note that you need to change the IP address above to the address of your
`k8s-keystone-auth-service`. This will talk to the webhook and verify that the token is
valid and return information about the user.

### API server

Finally, communication between the API server and the Keystone service is verified. The
easiest thing to do here is to look at the log for the API server for interesting information
such as timeouts or errors with the webhook.

```bash
juju exec --unit kubernetes-control-plane/0 -- journalctl -u snap.kube-apiserver.daemon.service
```

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/troubleshooting.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
