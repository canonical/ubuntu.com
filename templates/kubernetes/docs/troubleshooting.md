---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Troubleshooting"
  description: How to troubleshoot the deployment of a Kubernetes cluster.
---

This document covers how to troubleshoot the deployment of a Kubernetes cluster, it will not cover debugging of workloads inside Kubernetes.

## Understanding Cluster Status

Using `juju status` can give you some insight as to what's happening in a cluster:

```no-highlight
Model                         Controller          Cloud/Region   Version  SLA          Timestamp
conjure-canonical-kubern-ade  conjure-up-aws-91c  aws/eu-west-1  2.4.5    unsupported  08:38:09+01:00

App                    Version  Status  Scale  Charm                  Store       Rev  OS      Notes
aws-integrator         1.15.71  active      1  aws-integrator         jujucharms    5  ubuntu  
easyrsa                3.0.1    active      1  easyrsa                jujucharms  117  ubuntu  
etcd                   3.2.10   active      3  etcd                   jujucharms  209  ubuntu  
flannel                0.10.0   active      5  flannel                jujucharms  146  ubuntu  
kubeapi-load-balancer  1.14.0   active      1  kubeapi-load-balancer  jujucharms  162  ubuntu  exposed
kubernetes-master      1.12.1   active      2  kubernetes-master      jujucharms  219  ubuntu  
kubernetes-worker      1.12.1   active      3  kubernetes-worker      jujucharms  239  ubuntu  exposed

Unit                      Workload  Agent  Machine  Public address  Ports           Message
aws-integrator/0*         active    idle   0        54.171.121.229                  ready
easyrsa/0*                active    idle   1        34.251.192.5                    Certificate Authority connected.
etcd/0*                   active    idle   2        52.18.186.65    2379/tcp        Healthy with 3 known peers
etcd/1                    active    idle   3        54.194.35.197   2379/tcp        Healthy with 3 known peers
etcd/2                    active    idle   4        34.240.14.183   2379/tcp        Healthy with 3 known peers
kubeapi-load-balancer/0*  active    idle   5        34.244.110.15   443/tcp         Loadbalancer ready.
kubernetes-master/0*      active    idle   6        34.254.175.71   6443/tcp        Kubernetes master running.
  flannel/0*              active    idle            34.254.175.71                   Flannel subnet 10.1.16.1/24
kubernetes-master/1       active    idle   7        52.210.61.51    6443/tcp        Kubernetes master running.
  flannel/3               active    idle            52.210.61.51                    Flannel subnet 10.1.38.1/24
kubernetes-worker/0*      active    idle   8        34.246.168.241  80/tcp,443/tcp  Kubernetes worker running.
  flannel/1               active    idle            34.246.168.241                  Flannel subnet 10.1.79.1/24
kubernetes-worker/1       active    idle   9        54.229.236.169  80/tcp,443/tcp  Kubernetes worker running.
  flannel/4               active    idle            54.229.236.169                  Flannel subnet 10.1.10.1/24
kubernetes-worker/2       active    idle   10       34.253.203.147  80/tcp,443/tcp  Kubernetes worker running.
  flannel/2               active    idle            34.253.203.147                  Flannel subnet 10.1.95.1/24

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

Sometimes it is useful to collect all the information from a cluster to share with a developer to identify problems. This is best accomplished with [CDK Field Agent](https://github.com/juju-solutions/cdk-field-agent).

Download and execute the collect.py script from [CDK Field Agent](https://github.com/juju-solutions/cdk-field-agent) on a box that has a Juju client configured with the current controller and model pointing at the CDK deployment of interest.

Running the script will generate a tarball of system information and includes basic information such as systemctl status, Juju logs, charm unit data, etc. Additional application-specific information may be included as well.

## Common Problems

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

### 1. Expose the Kubernetes Master service

```bash
juju expose kubernetes-master
```

### 2. Identify the public IP address of one of your masters

```bash
 juju status kubernetes-master
```

```no-highlight
Model                         Controller          Cloud/Region   Version  SLA          Timestamp
conjure-canonical-kubern-ade  conjure-up-aws-91c  aws/eu-west-1  2.4.5    unsupported  08:39:23+01:00

App                Version  Status  Scale  Charm              Store       Rev  OS      Notes
flannel            0.10.0   active      2  flannel            jujucharms  146  ubuntu  
kubernetes-master  1.12.1   active      2  kubernetes-master  jujucharms  219  ubuntu  

Unit                  Workload  Agent  Machine  Public address  Ports     Message
kubernetes-master/0*  active    idle   6        34.254.175.71   6443/tcp  Kubernetes master running.
  flannel/0*          active    idle            34.254.175.71             Flannel subnet 10.1.16.1/24
kubernetes-master/1   active    idle   7        52.210.61.51    6443/tcp  Kubernetes master running.
  flannel/3           active    idle            52.210.61.51              Flannel subnet 10.1.38.1/24

Entity  Meter status  Message
model   amber         user verification pending  

Machine  State    DNS            Inst id              Series  AZ          Message
6        started  34.254.175.71  i-0f18d3f7377ba406f  bionic  eu-west-1a  running
7        started  52.210.61.51   i-08ec1daf25fb18fa3  bionic  eu-west-1b  running
```

In this context the public IP address is 54.210.100.102.

If you want to access this data programmatically you can use the JSON output:

```bash
juju show-status kubernetes-master --format json | jq --raw-output '.applications."kubernetes-master".units | keys[]'
54.210.100.102
```

### 3. Update the kubeconfig file

Identify the kubeconfig file or section used for this cluster, and edit the server configuration.

By default, it will look like `https://54.213.123.123:443`. Replace it with the Kubernetes Master endpoint `https://54.210.100.102:6443` and save.

Note that the default port used by CDK for the Kubernetes Master API is 6443 while the port exposed by the load balancer is 443.

### 4. Start helm again!

```bash
helm install <chart> --debug
```

```
Created tunnel using local port: '36749'
SERVER: "localhost:36749"
CHART PATH: /home/ubuntu/.helm/<chart>
NAME:   <chart>
...
...
```

## Logging and monitoring

By default there is no log aggregation of the Kubernetes nodes, each node logs locally. Please read over the [logging](/kubernetes/docs/logging) page for more information.
