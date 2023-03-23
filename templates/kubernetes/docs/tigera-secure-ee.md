---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Using Tigera Secure EE"
  description: Using Tigera Secure EE with Charmed Kubernetes
keywords: network, cni, tigera
tags: [operating]
sidebar: k8smain-sidebar
permalink: tigera-secure-ee.html
layout: [base, ubuntu-com]
toc: False
---

Tigera Secure EE is a software-defined network solution that can be used with
Kubernetes. For those familiar with Calico, Tigera Secure EE is essentially
Calico with enterprise features on top.

Support for Tigera Secure EE in **Charmed Kubernetes** is provided in the form of a
`tigera-secure-ee` subordinate charm, which can be used instead of `flannel` or
`calico`.

## Deploying Charmed Kubernetes with Tigera Secure EE

Before you start, you will need:

* Tigera Secure EE licence key
* Tigera private Docker registry credentials (provided as a Docker config.json)

<div class="p-notification--information is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">Tigera Secure EE's network traffic, much like Calico's, is filtered on
    many clouds. It will work on MAAS, and can work on AWS if you manually
    configure instances to disable source/destination checking.</p>
  </div>
</div>

Deploy the `charmed-kubernetes` bundle with the [tigera overlay][tigera-overlay]:

```bash
juju deploy charmed-kubernetes --overlay tigera-overlay.yaml
```

Configure the `tigera-secure-ee` charm with your licence key and registry
credentials:

```bash
juju config tigera-secure-ee \
  license-key=$(base64 -w0 license.yaml) \
  registry-credentials=$(base64 -w0 config.json)
```

Wait for the deployment to settle before continuing on.

## Using the built-in elasticsearch-operator

<div class="p-notification--caution is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">The built-in elasticsearch-operator is only recommended for testing or demonstrative
    purposes. For production deployments, please skip down to the next section.</p>
  </div>
</div>

For testing and quick start purposes, the `tigera-secure-ee` charm deploys
[elasticsearch-operator][] into your Kubernetes cluster by default. For it to
properly work, you will need to create a StorageClass.

The easiest way to do this is with the hostpath provisioner. Create a file named
`elasticsearch-storage.yaml` containing the following:

```yaml
# This manifest implements elasticsearch-storage using local host-path volumes.
# It is not suitable for production use; and only works on single node clusters.

kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: elasticsearch-storage
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/host-path

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: tigera-elasticsearch-1
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /var/tigera/elastic-data/1
  persistentVolumeReclaimPolicy: Recycle
  storageClassName: elasticsearch-storage

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: tigera-elasticsearch-2
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /var/tigera/elastic-data/2
  persistentVolumeReclaimPolicy: Recycle
  storageClassName: elasticsearch-storage
```

Apply elasticsearch-storage.yaml:

```bash
kubectl apply -f elasticsearch-storage.yaml
```

Once you have a StorageClass available, delete the existing PVC and pods so
Kubernetes will recreate them using the new StorageClass:
```bash
kubectl delete pvc -n calico-monitoring es-data-es-data-tigera-elasticsearch-default-0
kubectl delete pvc -n calico-monitoring es-data-es-master-tigera-elasticsearch-default-0
kubectl delete po -n calico-monitoring es-data-tigera-elasticsearch-default-0
kubectl delete po -n calico-monitoring es-master-tigera-elasticsearch-default-0
```

For a more robust storage solution, consider deploying Ceph with **Charmed Kubernetes**, as
documented in the [Storage][] section. This will create a default StorageClass
that elasticsearch-operator will use automatically.

## Using your own ElasticSearch

Disable the built-in elasticsearch operator:

```bash
juju config tigera-secure-ee enable-elasticsearch-operator=false
```

## Accessing cnx-manager

The cnx-manager service is exposed as a NodePort on port 30003. Run the
following command to open port 30003 on the workers:

```bash
juju run --application kubernetes-worker open-port 30003
```

Then connect to `https://<kubernetes-worker-ip>:30003` in your web browser. Use
the Kubernetes admin credentials to log in (you can find these in the kubeconfig
file created on kubernetes-control-plane units at `/home/ubuntu/config`).

## Accessing kibana

The kibana service is exposed as a NodePort on port 30601. Run the following
command to open port 30601 on the workers:

```bash
juju run --application kubernetes-worker open-port 30601
```

<div class="p-notification--caution is-inline">
  <div class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">Do not open this port if your kubernetes-worker units are exposed on a
    network you do not trust. Kibana does not require credentials to use</p>
  </div>
</div>

Then connect to `http://<kubernetes-worker-ip>:30601` in your web browser.

## Using a private Docker registry

For a general introduction to using a private Docker registry with
**Charmed Kubernetes**, please refer to the [Private Docker Registry][] page.

In addition to the steps documented there, you will need to upload the
following images to the registry:

```no-highlight
docker.elastic.co/elasticsearch/elasticsearch-oss:6.4.3
docker.elastic.co/kibana/kibana-oss:6.4.3
quay.io/tigera/calicoctl:v2.3.0
quay.io/tigera/calicoq:v2.3.0
quay.io/tigera/cnx-apiserver:v2.3.0
quay.io/tigera/cnx-manager:v2.3.0
quay.io/tigera/cnx-manager-proxy:v2.3.0
quay.io/tigera/cnx-node:v2.3.0
quay.io/tigera/cnx-queryserver:v2.3.0
quay.io/tigera/es-proxy:v2.3.0
quay.io/tigera/fluentd:v2.3.0
quay.io/tigera/kube-controllers:v2.3.0
quay.io/tigera/cloud-controllers:v2.3.0
quay.io/tigera/typha:v2.3.0
quay.io/tigera/intrusion-detection-job-installer:v2.3.0
quay.io/tigera/es-curator:v2.3.0
quay.io/coreos/configmap-reload:v0.0.1
quay.io/coreos/prometheus-config-reloader:v0.0.3
quay.io/coreos/prometheus-operator:v0.18.1
quay.io/prometheus/alertmanager:v0.14.0
quay.io/prometheus/prometheus:v2.2.1
docker.io/upmcenterprises/elasticsearch-operator:0.2.0
docker.io/busybox:latest
docker.io/alpine:3.7
```

And configure Tigera Secure EE to use the registry with this shell script:

```bash
export IP=`juju run --unit docker-registry/0 'network-get website --ingress-address'`
export PORT=`juju config docker-registry registry-port`
export REGISTRY=$IP:$PORT
juju config tigera-secure-ee registry=$REGISTRY
```

<!-- LINKS -->

[tigera-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/tigera-overlay.yaml
[elasticsearch-operator]: https://github.com/upmc-enterprises/elasticsearch-operator
[storage]: /kubernetes/docs/storage
[private docker registry]: /kubernetes/docs/docker-registry

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/tigera-secure-ee.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
