---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Installing Charmed Kubernetes"
  description: How to install and customise Charmed Kubernetes using Juju bundles.
keywords: lxd, requirements, developer
tags: [install]
sidebar: k8smain-sidebar
permalink: install-manual.html
layout: [base, ubuntu-com]
toc: False
---

The ['Quick start' documentation][quickstart] explains how to perform
a quick and easy general install of **Charmed Kubernetes**.
However, in some cases it may be useful to
customise the install:

  - Adding additional components
  - Configuring storage or networking
  - Copying an existing configuration
  - Testing a pre-release version
  - ...and many more

## What you will need

The rest of this page assumes you already have Juju installed and  have added
credentials for a cloud and bootstrapped a controller.

If you still need to do this, please take a look at the [quickstart
instructions][quickstart], or, for custom clouds (OpenStack, MAAS), please
consult the [Juju documentation][juju-docs].

To install **Charmed Kubernetes** entirely on your local machine (using
containers to create a cluster), please see the separate
[Localhost instructions][localhost].


## Quick custom installs

Bundle overlays facilitate common, quick customisations for components such as
networking and cloud integration.

Overlay files can be applied when deploying Charmed Kubernetes by specifying them along with the deploy command:

```bash
juju deploy charmed-kubernetes --overlay your-overlay.yaml
```

Sample overlay files are available to download directly from
the links shown here. Be advised that you should use only **one** overlay from
each category!


#### Networking

---


<div class="CNI">
 <div class="row">
 <div class="col-2 ">
   <span>Flannel</span>
 </div>
  <div class="col-4 ">
   <span>Flannel is a simple, lightweight layer 3 fabric for Kubernetes.
   It manages an IPv4 network between multiple nodes in a cluster.
   <a href="/kubernetes/docs/cni-flannel"> Read more...</a></span>
  </div>
  <div class="col-3 ">
    <span><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/flannel-overlay.yaml" class="p-button--positive">Download flannel-overlay.yaml</a></span>
  </div>
</div>
<br>
<div class="row">
<div class="col-2">
  <span>Canal</span>
</div>
 <div class="col-4">
  <span>Shorthand for "Calico and Flannel", this combination brings in Calico's support for the NetworkPolicy feature of Kubernetes, while utilizing Flannel's UDP-based network traffic.<a href="/kubernetes/docs/cni-canal"> Read more...</a></span>
 </div>
 <div class="col-3">
   <span class="u-vertically-center"><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/canal-overlay.yaml" class="p-button--positive">Download canal-overlay.yaml</a></span>
 </div>
</div>
<br>

<div class="row">
<div class="col-2">
  <span>Kube-OVN</span>
</div>
 <div class="col-4">
  <span>Kube-OVN is a CNI implementation based on OVN that provides a rich set of networking features for advanced enterprise applications.<a href="/kubernetes/docs/cni-kube-ovn"> Read more...</a></span>
 </div>
 <div class="col-3">
   <span class="u-vertically-center"><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/kube-ovn-overlay.yaml" class="p-button--positive">Download kube-ovn-overlay.yaml</a></span>
 </div>
</div>
<br>

<div class="row">
<div class="col-2">
  <span>Tigera Secure EE</span>
</div>
 <div class="col-4">
  <span>Tigera Secure EE is a commercial version of
  Calico with additional enterprise features. As well as deploying the software, you will need to configure
  it with the relevant licence. <a href="/kubernetes/docs/tigera-secure-ee"> Read more...</a></span>
 </div>
 <div class="col-3">
   <span class="u-vertically-center"><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/tigera-overlay.yaml" class="p-button--positive">Download tigera-overlay.yaml</a></span>
 </div>
</div>
</div>
<br>
<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">By default, Charmed Kubernetes uses <em>Calico</em> for networking. You can read more about CNI support <a href="/kubernetes/docs/cni-overview"> here </a>.</p>
  </div>
</div>

#### Cloud integration

---

<div class="integration">
 <div class="row">
 <div class="col-2 ">
   <span>AWS integrator</span>
 </div>
  <div class="col-4 ">
   <span>Enables support for EBS storage and ELB load balancers. <a href="/kubernetes/docs/aws-integration"> Read more...</a></span>
  </div>
  <div class="col-3 ">
    <span><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/aws-overlay.yaml" class="p-button--positive">Download aws-overlay.yaml</a></span>
  </div>
</div>
<br>
<div class="row">
<div class="col-2 u-vertically-center">
  <span>Azure integrator</span>
</div>
 <div class="col-4 u-vertically-center">
  <span>Enables support for Azure's native Disk Storage and load balancers.</span>
 </div>
 <div class="col-3 u-vertically-center">
   <span class="u-vertically-center"><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/azure-overlay.yaml" class="p-button--positive">Download azure-overlay.yaml</a></span>
 </div>
</div>
<br>
<div class="row">
<div class="col-2">
  <span>GCP integrator</span>
</div>
 <div class="col-4">
  <span>Integrates with GCP for storage and loadbalancing. <a href="/kubernetes/docs/gcp-integration"> Read more...</a></span>
 </div>
 <div class="col-3">
   <span class="u-vertically-center"><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/gcp-overlay.yaml" class="p-button--positive">Download gcp-overlay.yaml</a></span>
 </div>
</div>
<br>
 <div class="row">
  <div class="col-2">
   <span>OpenStack integrator</span>
 </div>
  <div class="col-4">
   <span>Provides support for OpenStack native features such as Cinder volumes and LBaaS. <a href="/kubernetes/docs/openstack-integration"> Read more...</a></span>
  </div>
  <div class="col-3">
    <span><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/openstack-overlay.yaml" class="p-button--positive u-no-margin--right">Download openstack-overlay.yaml</a></span>
  </div>
</div>
<br>
 <div class="row">
  <div class="col-2">
   <span>vSphere integrator</span>
 </div>
  <div class="col-4">
   <span>Provides support for native storage in vSphere. </span>
  </div>
  <div class="col-3">
    <span><a href="https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/vsphere-overlay.yaml" class="p-button--positive u-no-margin--right u-no-margin--left">Download vsphere-overlay.yaml</a></span>
  </div>
</div>
</div>






You can use multiple overlays (of different types) if required.  Note that all
the 'integrator' charms require the use of the `--trust` option. For example,
to deploy with Canal networking and AWS integration:

```bash
juju deploy charmed-kubernetes --overlay aws-overlay.yaml --trust --overlay canal-overlay.yaml
```

For more detail on overlays and how they work, see the section [below](#overlay).

<a href="/kubernetes/docs/operations">Get started with your new cluster&nbsp;›</a>

## Deploying a specific Charmed Kubernetes bundle

**Charmhub.io** hosts the **Charmed Kubernetes** bundles as well as
individual charms. To deploy the latest, stable bundle, run the command:

```bash
juju deploy charmed-kubernetes
```

It is also possible to deploy a specific version of the bundle by including the
revision number. For example, to deploy the **Charmed Kubernetes** bundle for the Kubernetes 1.24
release, you could run:

```bash
juju deploy cs:charmed-kubernetes-1154
```

The revision numbers for bundles are generated automatically when the bundle is
updated, including for testing and beta versions, so it isn't always the case
that a higher revision number is 'better'. The revision numbers for the release
versions of the **Charmed Kubernetes** bundle are shown in the table below:

<a  id="table"></a>

<!-- AUTOGENERATED BUNDLE TABLE BEGIN  -->
| Kubernetes version | Charmed Kubernetes bundle |
| --- | --- |
| 1.25.x    | [charmed-kubernetes-1185](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.25/bundle.yaml) |
| 1.24.x    | [charmed-kubernetes-1154](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.24/bundle.yaml) |
| 1.23.x    | [charmed-kubernetes-862](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.23/bundle.yaml) |
| 1.22.x    | [charmed-kubernetes-814](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.22/bundle.yaml) |
| 1.21.x    | [charmed-kubernetes-733](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.21/bundle.yaml) |
| 1.20.x    | [charmed-kubernetes-596](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.20/bundle.yaml) |
| 1.19.x    | [charmed-kubernetes-545](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.19/bundle.yaml) |
| 1.18.x    | [charmed-kubernetes-485](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.18/bundle.yaml) |
| 1.17.x    | [charmed-kubernetes-410](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.17/bundle.yaml) |
| 1.16.x    | [charmed-kubernetes-316](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.16/bundle.yaml) |
| 1.15.x    | [charmed-kubernetes-209](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.15/bundle.yaml) |
| 1.14.x    | [charmed-kubernetes-124](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.14/bundle.yaml) |
<!-- AUTOGENERATED BUNDLE TABLE END  -->

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
Only the latest three versions of Charmed Kubernetes are supported at any time.
  </p>
</div>


## Customising the bundle install

A number of the scenarios outlined at the start of this document involved
customising the **Charmed Kubernetes** install. There are two main ways to
do this:

 1.  Using [overlays](#overlay) in conjunction with the published Charmed Kubernetes bundle.
 2.  [Editing the bundle file itself](#edit).

Using an overlay means you can easily apply your customisation to different
versions of the bundle, with the possible downside that changes in the
structure of new versions of **Charmed Kubernetes** may render your overlay
obsolete or non-functional (depending on what exactly your overlay does).

Saving a copy of the bundle file and editing that means that your
customisation will always work, but of course, requires that you create a new
file for each version of **Charmed Kubernetes**.

Both methods are described below.

<a id="overlay"></a>
### Using overlays

A _bundle overlay_ is a fragment of valid YAML which is dynamically merged on
top of a bundle before deployment, rather like a patch file. The fragment can
contain any additional or alternative YAML which is intelligible to **Juju**. For
example, to replicate the steps to deploy and connect the
`aws-integrator` charm, the following fragment could be used:

```yaml
applications:
  aws-integrator:
    charm: aws-integrator
    num_units: 1
    trust: true
relations:
  - ['aws-integrator', 'kubernetes-control-plane']
  - ['aws-integrator', 'kubernetes-worker']
  ```

You can also [download the fragment here][asset-aws-overlay].

**Juju**'s bundle format, and valid YAML are discussed more fully in the
[Juju documentation][juju-bundle]. In this example it merely adds a new application,
specifying the charm to use, and further specifies the relationships to add.

To use this overlay with the **Charmed Kubernetes** bundle, it is specified
during deploy like this:

```bash
juju deploy charmed-kubernetes  --overlay ~/path/aws-overlay.yaml --trust
```

Substitute in the local path and filename to point to your YAML fragment. Note
that this overlay contains charms which require credential access, so you must
use the `--trust` option to deploy it.

#### Adding or changing constraints

After adding additional components, the most common use of overlays is to
change constraints (the resources requested for the application). Although
these are specified already in the **Charmed Kubernetes** bundle, they can be
overridden by an overlay. It isn't necessary to replicate the entirety of an
entry, just the parts you wish to change. For example:

```yaml
kubernetes-worker:
  constraints: cores=4 mem=8G root-disk=100G
  num_units: 6
```

Changes the machine constraints for Kubernetes workers to add more root disk
space, and also deploys six units instead of the three specified in the
original bundle.

More information on the constraints you can use is available in the
[Juju documentation][juju-constraints].

#### Changing configuration values

Configuration settings are mapped to "options" under the charm entries in the bundle
YAML. Usually these are only expressed when they differ from the default value in the
charm. For example, if you look at the fragment for the `kubernetes-worker` in the
**Charmed Kubernetes** bundle:

```yaml
kubernetes-worker:
  annotations:
    gui-x: '100'
    gui-y: '850'
  charm: kubernetes-worker
  constraints: cores=2 mem=8G root-disk=16G
  expose: true
  num_units: 3
  options:
    channel: 1.25/stable
  resources:
    cni-amd64: 0
    cni-arm64: 0
    cni-s390x: 0
    kube-proxy: 0
    kubectl: 0
    kubelet: 0
```

...there is only one entry under 'options', in this case for the snap channel to use. There
are however, a number of configuration options available
([more details are in the charm documentation][charm-kworker]).
We can add additional configuration by supplying the desired settings under options. So,
for example, where we might do the following through **Juju** to set some proxy
values:

```bash
juju config containerd https_proxy=https://proxy.example.com
juju config kubernetes-worker snap_proxy=https://snap-proxy.example.com
```
... we can instead use the following YAML fragment as an overlay:

```yaml
containerd:
  options:
    https_proxy: https://proxy.example.com
kubernetes-worker:
  options:
    snap_proxy: https://snap-proxy.example.com
```

<a id="edit"></a>

### Editing a bundle

Another way to change or customise an install is to store the YAML bundle file
locally and edit it with a standard text editor.

The latest version of the **Charmed Kubernetes** bundle can always be retrieved
by
[fetching the current stable version from Charmhub][latest-bundle-file]. For other versions, see the [table above](#table).

Care should be taken when editing the YAML file as the format is very strict.
For more details on the format used by Juju, see the
[Juju bundle documentation][juju-bundle].

#### Retrieving a bundle from a running model

Sometimes a more convenient way of getting a local bundle file which matches
exactly the deployment you want is simply to save a running model as a bundle.
This will preserve configuration, relations and the charms used in the
deployment so a structural replica can be recreated.

This can be done simply by running the command:

```bash
juju export-bundle --filename mybundle.yaml
```

The resulting YAML file will be downloaded to the current working directory.

It is also possible to view, edit and export bundles from the Juju GUI:

```bash
juju gui
```

Running this command will output some login information and a URL for the GUI
interface (the GUI actually runs on the Juju controller instance). On visiting
the URL given and logging in, a graphical representation of the current model
will be shown. To export the model as a YAML bundle, click on the `Export`
button near the top left of the screen.

![][image-gui]

For more information on the Juju GUI, see the [Juju documentation][juju-gui].

### Next Steps

Now you have a cluster up and running, check out the
[Operations guide][operations] for how to use it!


<!-- IMAGES -->

[image-gui]: https://assets.ubuntu.com/v1/19f13565-bundle-export.png

<!-- LINKS -->

[latest-bundle-file]: https://charmhub.io/charmed-kubernetes
[jaas]: https://jaas.ai/
[juju-docs]: https://juju.is/docs/olm/installing-juju
[controller-config]: https://juju.is/docs/olm/create-controllers
[credentials]: https://juju.is/docs/olm/credentials
[quickstart]: /kubernetes/docs/quickstart
[juju-bundle]: https://juju.is/docs/sdk/bundles
[juju-gui]: https://juju.is/docs/olm/manage-the-juju-dashboard
[juju-constraints]: https://juju.is/docs/olm/constraints
[asset-aws-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/aws-overlay.yaml
[charm-kworker]: https://charmhub.io/containers-kubernetes-worker
[snaps]: https://docs.snapcraft.io/snap-documentation
[kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[aws-docs]: /kubernetes/docs/aws-integration
[gcp-docs]: /kubernetes/docs/gcp-integration
[operations]: /kubernetes/docs/operations
[localhost]: /kubernetes/docs/install-local

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/install-manual.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
