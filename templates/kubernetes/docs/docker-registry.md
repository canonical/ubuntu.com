---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Private Docker Registry"
  description: How to use a private Docker registry to serve Docker images to your Kubernetes cluster components.
keywords: juju, docker, registry
tags: [operating]
sidebar: k8smain-sidebar
permalink: docker-registry.html
layout: [base, ubuntu-com]
toc: False
---

The [docker-registry][registry-charm] charm facilitates the storage and
distribution of **Docker** images. Include this in a **Kubernetes**
deployment to provide images to cluster components without requiring
access to public registries.
See [https://docs.docker.com/registry/][upstream-registry] for
details.

## Deploy

The registry is deployed as a stand-alone application. Many deployment
scenarios are described in the charm readme. The most common scenario for
**Kubernetes** integration is to configure a registry with TLS and basic
(htpasswd) authentication enabled.

If needed, consult the [quickstart guide][quickstart] to install
the **Charmed Distribution of Kubernetes**<sup>&reg;</sup>. Then deploy
and configure `docker-registry` as follows:

```bash
juju deploy ~containers/docker-registry
juju relate docker-registry easyrsa:client
juju relate docker-registry kubernetes-worker:docker-registry
juju config docker-registry \
  auth-basic-user='admin' \
  auth-basic-password='password'
```

## Verify

Make note of the registry address. By default, this address is only accessible
within the deployment model. See the [charm readme][registry-charm] for host
and proxy configuration options if desired.

```bash
export IP=`juju run --unit docker-registry/0 'network-get website --ingress-address'`
export PORT=`juju config docker-registry registry-port`
export REGISTRY=$IP:$PORT
```

Verify basic authentication is working:

```bash
juju run --unit docker-registry/0 "docker login -u admin -p password $REGISTRY"
Login Succeeded
...
```

## Docker on Kubernetes workers

**Docker** on the Kubernetes workers needs to talk to the registry securely. By
relating `docker-registry` and `kubernetes-worker`, appropriate certificates
are added to `/etc/docker/certs.d` on all workers.

Verify basic authentication is working from a Kubernetes worker:

```bash
juju run --unit kubernetes-worker/0 "docker login -u admin -p password $REGISTRY"
Login Succeeded
...
```

## Kubernetes images

Make a note of the Docker images that the registry will need to provide.
Minimally, Kubernetes 1.1x requires the following:

- k8s.gcr.io/pause-amd64:3.1
- quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.16.1
- k8s.gcr.io/defaultbackend-amd64:1.5

**CDK** supports optional add-ons that include the **Kubernetes** dashboard, 
**Heapster**, **kube-dns**, etc. Enabling these add-ons will require the
following additional images:

- cdkbot/addon-resizer-amd64:1.8.1
- k8s.gcr.io/heapster-amd64:v1.5.3
- k8s.gcr.io/heapster-influxdb-amd64:v1.3.3
- k8s.gcr.io/heapster-grafana-amd64:v4.4.3
- k8s.gcr.io/k8s-dns-kube-dns-amd64:1.14.10
- k8s.gcr.io/k8s-dns-dnsmasq-nanny-amd64:1.14.10
- k8s.gcr.io/k8s-dns-sidecar-amd64:1.14.10
- k8s.gcr.io/kubernetes-dashboard-amd64:v1.8.3
- k8s.gcr.io/metrics-server-amd64:v0.2.1

For **Calico**/**Canal** support, the following images are used:

- quay.io/calico/node:v2.6.10
- quay.io/calico/kube-controllers:v1.0.4

And finally, **Sonatype Nexus** and **Rancher** use the following
images:

- sonatype/nexus3:latest
- rancher/rancher:latest

## Hosting images

To make an image available in the deployed registry, it must be tagged and
pushed. As an example, push the `defaultbackend-amd64` image to
`docker-registry`:

```bash
juju run-action docker-registry/0 \
  push \
  image=k8s.gcr.io/defaultbackend-amd64:1.5 \
  tag=$REGISTRY/defaultbackend-amd64:1.5 \
  --wait
...
  results:
    outcome: success
    raw: pushed 172.31.28.74:5000/k8s.gcr.io/defaultbackend-amd64:1.5
  status: completed
...
```

The above procedure should be repeated for any additional required images.

## Using hosted images

Kubernetes workers must be configured to use the hosted images as follows:

```bash
juju config kubernetes-worker \
  default-backend-image=$REGISTRY/defaultbackend-amd64:1.5
juju config kubernetes-worker \
  nginx-image=$REGISTRY/nginx-ingress-controller:0.16.1
```

Unlike individual configurable images on `kubernetes-worker` units, images
used by **CDK** add-ons are controlled by a `kubernetes-master` config option. Push
the desired addon images listed above (`kubernetes-dashboard`, `heapster`, etc)
and configure `kubernetes-master` to use the registry for installation:

```bash
juju config kubernetes-master addons-registry=$REGISTRY
```

<!-- LINKS -->

[registry-charm]: http://jujucharms.com/u/containers/docker-registry
[upstream-registry]: https://docs.docker.com/registry/
[quickstart]: /kubernetes/docs/quickstart
