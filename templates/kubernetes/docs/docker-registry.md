---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Private Docker Registry"
  description: How to use a private Docker registry to serve Docker images to your Kubernetes cluster components.
keywords: juju, docker, registry
tags: [operating, registry]
sidebar: k8smain-sidebar
permalink: docker-registry.html
layout: [base, ubuntu-com]
toc: False
---

The [docker-registry][registry-charm] charm deploys a local image registry 
for your cluster, taking care of the storage and distribution of 
container images. There are a few reasons why this may be a useful option
for your cluster:

-  Providing the images required by Charmed Kubernetes without requiring
   access to a public registry (e.g. in environments where network access
   is controlled, expensive or otherwise problematic).
-  Providing images required by workloads running on the cluster.

When deployed and related to the cluster as described below, this 
registry will be checked first for any image requests, so it can be used
in addition to public registries. For more details of the mechanics of 
the Docker Registry, see the
[upstream documentation at https://docs.docker.com/registry][upstream-registry].

## Deploying

The registry is deployed as a stand-alone application. Many deployment
scenarios are described in the [charm readme][registry-charm]. The most common
scenario for **Kubernetes** integration is to configure a registry with TLS
and basic (htpasswd) authentication enabled.

If needed, consult the [quickstart guide][quickstart] to install
**Charmed Kubernetes**. Then deploy and configure `docker-registry` as
follows.

```bash
juju deploy docker-registry
juju integrate docker-registry easyrsa:client
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
the network information of the proxy will be shared with the container runtime
units when the registry is related.

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">SSL pass-thru is supported between 'docker-registry' and 'haproxy', though manual configuration is required. The recommended approach for a proxied
    registry is to disable SSL on 'docker-registry' prior to relating it to
    'haproxy'. Consult the 'docker-registry' charm readme if SSL is required in a
    proxied environment.</p>
  </div>
</div>

The environment described in the `Deploy` section above can be adjusted to
create a highly available registry as follows:

```bash
juju deploy haproxy
juju add-unit docker-registry
juju remove-relation docker-registry easyrsa:client
juju integrate docker-registry haproxy:reverseproxy
```

<div class="p-notification--information is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">With multiple registry units deployed, the proxy relation allows for a highly available deployment. Load balancing across multiple registry units is not supported.</p>
  </div>
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

## Connecting to a Charmed Kubernetes cluster

Relate the deployed registry to the appropriate
[container runtime][container-runtime] for your cluster. This configures
the runtime with authentication, proxy, and/or TLS data from the registry,
and allows your registry to be used by the cluster to pull images for pods.

### Containerd

```bash
juju integrate docker-registry containerd
```

### Docker

```bash
juju integrate docker-registry docker
```

## Kubernetes images

A list of images that may be used by **Charmed Kubernetes** can be found in
the [container-images.txt][container-images-txt] document. This is a
comprehensive list sorted by release; not all images are required for all
deployments. Take note of the images required by your deployment that will
need to be hosted in your private registry. A list of images required by
a specific release is also included on the 'components' page in the 
documentation, for example, the list for the 1.24 release is located on the
[1.24 components page][1.24]

## Hosting images

To make an image available in the deployed registry, it must be tagged and
pushed. As an example, push the `defaultbackend-amd64` image to
`docker-registry`:

```bash
juju run docker-registry/0 \
  push \
  image=k8s.gcr.io/defaultbackend-amd64:1.5 \
  tag=$REGISTRY/defaultbackend-amd64:1.5 \
...
  results:
    outcome: success
    raw: pushed 172.31.28.74:5000/k8s.gcr.io/defaultbackend-amd64:1.5
  status: completed
...
```

The above procedure should be repeated for all required images.

## Using the registry for cluster components

The image registry used by **Charmed Kubernetes** for images used in managing
or supporting components of the cluster itself is controlled by a `kubernetes-control-plane`
config option. Configure `kubernetes-control-plane` to use your private registry as follows:

```bash
juju config kubernetes-control-plane image-registry=$REGISTRY
```

<!-- LINKS -->

[registry-charm]: https://charmhub.io/docker-registry
[upstream-registry]: https://docs.docker.com/registry/
[quickstart]: /kubernetes/docs/quickstart
[container-runtime]: /kubernetes/docs/container-runtime
[container-images-txt]: https://github.com/charmed-kubernetes/bundle/blob/master/container-images.txt
[1.24]: /kubernetes/docs/1.24/components#images

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/docker-registry.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

