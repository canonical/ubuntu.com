---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
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
and configure `docker-registry` as follows.  This example relates to a
containerd charm; this can be replaced with any
[container runtime][container-runtime].

```bash
juju deploy ~containers/docker-registry
juju add-relation docker-registry easyrsa:client
juju add-relation docker-registry containerd
juju config docker-registry \
  auth-basic-user='admin' \
  auth-basic-password='password'
```

### Custom Certificates

Relating `docker-registry` to `easyrsa` above will generate new TLS data
to support secure communication with the registry. Alternatively, custom
TLS data may be provided as base64-encoded config options to the charm:

```bash
juju config docker-registry \
  tls-ca-blob=$(base64 /path/to/ca) \
  tls-cert-blob=$(base64 /path/to/cert) \
  tls-key-blob=$(base64 /path/to/key)
```

### Proxied Registry

Advanced networking or highly available deployment scenarios may require
multiple `docker-registry` units to be deployed behind a proxy. In this case,
the network information of the proxy will be shared with `kubernetes-worker`
units when the registry is related.

<div class="p-notification--information">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
SSL pass-thru is not supported between `docker-registry` and `haproxy`.
Any registry SSL configuration must be removed before creating the proxy
relation. If SSL is desired in a proxied environment, the administrator must
ensure certificates used by the proxy are configured on `kubernetes-worker`
units.
  </p>
</div>

The environment described in the `Deploy` section above can be adjusted to
create a highly available registry as follows:

```bash
juju deploy haproxy
juju add-unit docker-registry
juju remove-relation docker-registry easyrsa:client
juju add-relation docker-registry haproxy:reverseproxy
```

<div class="p-notification--information">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
With multiple registry units deployed, the proxy relation allows for a
highly available deployment. Load balancing across multiple registry units is
not supported.
  </p>
</div>

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

**Charmed Kubernetes** supports optional add-ons that include the
**Kubernetes** dashboard, **Heapster**, **kube-dns**, etc. Enabling these
add-ons will require the following additional images:

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
used by **Charmed Kubernetes** add-ons are controlled by a `kubernetes-master` config option. Push
the desired add-on images listed above (`kubernetes-dashboard`, `heapster`, etc)
and configure `kubernetes-master` to use the registry for installation:

```bash
juju config kubernetes-master addons-registry=$REGISTRY
```

<!-- LINKS -->

[registry-charm]: http://jujucharms.com/u/containers/docker-registry
[upstream-registry]: https://docs.docker.com/registry/
[quickstart]: /kubernetes/docs/quickstart

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/docker-registry.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
