---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Charmed Kubernetes on Equinix Metal"
  description: Running Charmed Kubernetes on Equinix.
keywords: equinix, integrator, ebs, elb
tags: [install]
sidebar: k8smain-sidebar
permalink: equinix.html
layout: [base, ubuntu-com]
toc: False
---

As with any cloud supported by Juju, **Charmed Kubernetes** can be deployed and used on
[Equinix Metal][]. This document provides some extra information and an overlay to
help get the most out of this cloud. For instructions on installing Juju itself, please
see the latest [Juju documentation][].


## Before installing

Equinix Metal has been added to the clouds Juju automatically knows about. To check, you can
run the command:

```bash
juju list-clouds --all
```

If `equinix` does not appear in the list, your local Juju install probably just needs to 
refresh its list of clouds. Run:

```bash
juju update-public-clouds
```

You should also add your credentials for this cloud. Use the interactive command:

```bash
juju add-credential equinix
```

...and follow the prompts to enter the information required (including the project id, and 
your auth token).


## Bootstrapping

Bootstrap a Juju controller within one of the equinix regions.

For example, to select  Dallas 'da' from the list of [equinix-facilities][]

```bash
juju bootstrap equinix/da equinix-da \
    --bootstrap-series focal\
    --bootstrap-constraints arch=amd64\
    --model-default image-stream=daily\
    --model-default automatically-retry-hooks=true\
    --model-default 'logging-config=<root>=DEBUG'\
    --debug --verbose -vv
```


## Installing

To deploy **Charmed Kubernetes** on Equinix Metal, it is also recommended to deploy
some storage and to use Calico for networking. You can deploy and configure
Charmed Kubernetes any way you like, but this example overlay will help you get started.

You can [download the ceph-radosgw overlay here][asset-ceph-radosgw-overlay]
And [download the equinix overlay here][asset-equinix-overlay]

It can then be installed with the command:

```bash
juju deploy charmed-kubernetes --overlay ./ceph-radosgw.yaml --overlay ./equinix-overlay.yaml
```

<!-- COMMENTED OUT UNTIL OVERLAYS WORK
It adjusts the default bundle to use Calico networking, deploys Ceph for storage and 
co-locates some services to make more efficient use of the available instances.

You can copy this example or ([download it here][asset-equinix-overlay]):

```yaml
machines:
  '0':
    constraints: mem=32G
  '1':
    constraints: mem=32G
  '2':
    constraints: mem=32G
applications:
  calico:
    charm: calico
    annotations:
      gui-x: '450'
      gui-y: '750'
    options:
      ignore-loose-rpf: true
    resources:
      calico: 922
      calico-arm64: 921
      calico-node-image: 604
      calico-upgrade: 749
      calico-upgrade-arm64: 749
  easyrsa:
    to:
    - lxd:2
    bindings:
      "": alpha
  flannel:
  etcd:
    num_units: 3
    bindings:
      "": alpha
    options:
      channel: 3.4/stable
    to:
    - lxd:0
    - lxd:1
    - lxd:2
  ceph-fs:
    charm: ceph-fs
    num_units: 1
    bindings:
      "": alpha
    annotations:
      gui-x: '300'
      gui-y: '300'
    to:
    - lxd:0
  ceph-mon:
    charm: ceph-mon
    num_units: 3
    options:
      expected-osd-count: 3
    annotations:
      gui-x: '600'
      gui-y: '300'
    bindings:
      "": alpha
    to:
     - lxd:0
     - lxd:1
     - lxd:2
  ceph-osd:
    charm: ceph-osd
    num_units: 3
    options:
      osd-devices: /dev/sda /dev/sdb
    bindings:
      "": alpha
    annotations:
      gui-x: '300'
      gui-y: '300'
    to:
    - 0
    - 1
    - 2
  ceph-radosgw:
    annotations:
      gui-x: '1000'
      gui-y: '250'
    charm: ceph-radosgw
    num_units: 1
    bindings:
      "": alpha
    to:
    - lxd:1
  kubernetes-control-plane:
    options:
      authorization-mode: "RBAC,Node"
      channel: 1.22/stable
    bindings:
      "": alpha
    constraints:
    to:
    - lxd:0
    - lxd:1
  kubernetes-worker:
    num_units: 3
    expose: true
    bindings:
      "": alpha
    options:
      kubelet-extra-config: "{failSwapOn: false}"
      kubelet-extra-args: "cloud-provider=external"
      channel: 1.22/stable
    constraints:
    to:
    - 0
    - 1
    - 2  
  kubeapi-load-balancer:
    num_units: 3
    expose: true
    options:
      port: 6443
    bindings:
      "": alpha
    to:
    - 0
    - 1
    - 2

relations:
- - 'ceph-mon:osd'
  - 'ceph-osd:mon'
- - 'calico:etcd'
  - 'etcd:db'
- - 'calico:cni'
  - 'kubernetes-control-plane:cni'
- - 'calico:cni'
  - 'kubernetes-worker:cni'
- - 'kubernetes-control-plane:ceph-storage'
  - 'ceph-mon:admin'
- - 'kubernetes-control-plane:ceph-client'
  - 'ceph-mon:client'
- - 'ceph-mon:radosgw'
  - 'ceph-radosgw:mon'
- - 'ceph-fs:ceph-mds'
  - 'ceph-mon:mds'
```

To use this overlay with the **Charmed Kubernetes** bundle, it is specified during deploy like this:

```bash
juju deploy charmed-kubernetes  --overlay ./equinix-overlay.yaml 
```
-->


When the deployment has settled, remember to fetch the configuration file!

```bash
juju ssh kubernetes-control-plane/leader -- cat config > ~/.kube/config
```

You can check the status by running:

```
juju status
```

At this point, there will be error messages on the workers as the pods will not run until
the Cloud Controller Manager has been run.

## Post install

To use Kubernetes on Equinix Metal, you should now set up the [Equinix Cloud Controller Manager][].

While the deployment is in progress no pods will be able to spun up on the Kubernetes due to 
taints being set on each node. The taints will be removed once the Cloud Controller Manager (CCM) 
is enabled and the nodes are registered with the cloud control plane.

First, a Kubernetes secret has to be created, defining the variables for the CCM:
Configuration of the CCM can be applied via the secret, See [equinix-configuration][] for detalis.

```bash
cat <<EOY > secret.yaml 
apiVersion: v1
kind: Secret
metadata:
  name: metal-cloud-config
  namespace: kube-system
stringData:
  cloud-sa.json: |
    {
    "apiKey": "<Metal API key>",
    "projectID": "<Metal Project ID>",
    "loadbalancer": "kube-vip://",
    "metro": "da"
    }
EOY
vim secret.yaml
kubectl create -f secret.yaml
```

The next steps are to confirm the version of the CCM to use:

```bash
export CCM_VERSION=3.5.0
kubectl apply -f https://github.com/equinix/cloud-provider-equinix-metal/releases/download/v${CCM_VERSION}/deployment.yaml
```

...enable premissions for the `kube-vip` loadbalancer:

```bash
kubectl apply -f https://kube-vip.io/manifests/rbac.yaml
```

... and deploy:

```bash
kubectl apply -f - <<EOY
apiVersion: apps/v1
kind: DaemonSet
metadata:
  creationTimestamp: null
  name: kube-vip-ds
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: kube-vip-ds
  template:
    metadata:
      creationTimestamp: null
      labels:
        name: kube-vip-ds
    spec:
      containers:
      - args:
        - manager
        env:
        - name: vip_arp
          value: "false"
        - name: vip_interface
          value: lo
        - name: port
          value: "6443"
        - name: vip_cidr
          value: "32"
        - name: svc_enable
          value: "true"
        - name: vip_startleader
          value: "false"
        - name: vip_addpeerstolb
          value: "true"
        - name: annotation
          value: metal.equinix.com
        - name: bgp_enable
          value: "true"
        - name: bgp_routerid
        - name: bgp_as
          value: "65000"
        - name: bgp_peeraddress
        - name: bgp_peerpass
        - name: bgp_peeras
          value: "65000"
        - name: vip_address
        image: plndr/kube-vip:v0.3.6
        imagePullPolicy: Always
        name: kube-vip
        resources: {}
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
            - NET_RAW
            - SYS_TIME
      hostNetwork: true
      serviceAccountName: kube-vip
  updateStrategy: {}
status:
  currentNumberScheduled: 0
  desiredNumberScheduled: 0
  numberMisscheduled: 0
  numberReady: 0
EOY
```

Note: in some Equinix Metal facilities it is required to define a static route on each Kubernetes Worker node to allow the traffic to the workloads exposed via the Load Balancer to go via proper gateway:

```bash
juju exec --application kubernetes-worker,kubernetes-control-plane '
  apt install jq -y
  GATEWAY_IP=$(curl https://metadata.platformequinix.com/metadata | jq -r ".network.addresses[] | select(.public == false) | .gateway")
  PEERS=$(curl https://metadata.platformequinix.com/metadata | jq -r ".bgp_neighbors[0].peer_ips[]")
  for i in ${PEERS}; do
    ip route add ${i} via $GATEWAY_IP
  done
```

## Using load balancers

With the cloud load balancer capabilities enabled, actions which invoke a loadbalancer
in Kubernetes will automatically trigger creation of the ElasticIP in the Metal cloud
and associate it with the KubeVIP service, simultaneously adjusting BGP tables in the
cloud and forward the traffic to Kubernetes nodes. This can be demonstrated with a
simple application. Here we will create a simple application and scale it to five pods:

```bash
kubectl create deployment hello-world --image=gcr.io/google-samples/node-hello:1.0
kubectl scale deployment hello-world --replicas=5
```
 
You can verify that the application and replicas have been created with:

```bash
kubectl get deployments hello-world
```
Which should return output similar to:

```text
NAME              READY   UP-TO-DATE   AVAILABLE   AGE
hello-world      5/5               5                            5             2m38s
```

To create a LoadBalancer, the application should now be exposed as a service:

```bash
kubectl expose deployment hello-world --type=LoadBalancer --name=hello --port 8080
```

To check that the service is running correctly:

```bash
kubectl get service hello
```

...which should return output similar to:

```text
NAME    TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
hello   LoadBalancer   10.152.183.136   202.49.242.3  8080:32662/TCP   2m
```

You can see that the External IP is now in front of the five endpoints of the example deployment. You can test the ingress address:

```bash
curl  http://202.49.242.3:8080
```
```text 
Hello Kubernetes!
```

<!-- LINKS -->


[asset-ceph-radosgw-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/ceph-radosgw.yaml
[asset-equinix-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/equinix-overlay.yaml
[equinix-facilities]: https://metal.equinix.com/developers/docs/locations/facilities/
[equinix-configuration]: https://github.com/equinix/cloud-provider-equinix-metal#configuration
[quickstart]: /kubernetes/docs/quickstart
[storage]: /kubernetes/docs/storage
[bugs]: https://bugs.launchpad.net/charmed-kubernetes
[install]: /kubernetes/docs/install-manual
[Equinix Cloud Controller Manager]: https://github.com/equinix/cloud-provider-equinix-metal/
[Juju documentation]: https://juju.is/docs/juju/installing-juju
[Equinix Metal]: https://metal.equinix.com/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/equinix.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

