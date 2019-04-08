---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Installing CDK manually"
  description: How to install and customise the Charmed Distribution of Kubernetes using Juju bundles.
keywords: lxd, conjure-up, requirements,developer
tags: [install]
sidebar: k8smain-sidebar
permalink: install-manual.html
layout: [base, ubuntu-com]
toc: False
---

The recommended way to install the
**Charmed Distribution of Kubernetes <sup>&reg;</sup>** is using the
**conjure-up** install tool as described in the
['Quick start' documentation][quickstart]. However, in some cases it may be useful to
customise the install in ways not possible with **conjure-up**:

  - Adding additional components
  - Configuring storage or networking  
  - Copying an existing configuration
  - Testing a pre-release version
  - ...and many more

In many cases, using the bundle install method outlined here will be faster and more
repeatable than customising a deployment post-install.

This documentation first presents the method for installing from the official release
bundles, then explains how the bundle can be customised.


## Install CDK from the official bundle

The following sections outline a standard installation of **CDK** using the stable release
**Juju** bundles. The standard bundle includes all the components of Kubernetes, but you
should also follow the [additional configuration](#config) steps at the end for
Kubernetes  to be able to interact with the cloud it is deployed on.

###  Install Juju

If Juju has not already been installed on your system, you need to install it first. For
Ubuntu 16.04 and later, and other operating systems which support [snaps][snaps], run
the command:

```bash
sudo snap install juju --classic
```

For other install options, please see the [Juju documentation][juju-docs].

### Create a controller

**Juju** requires a *controller*  instance to manage models and deployed applications.
You can make use of a hosted controller ([JAAS][jaas]) or create one in a cloud of
your choice. For public clouds, you will need to have added a credential first:

```bash
juju add-credential
```

...will step through adding your credential for a specific cloud.


The Juju documentation has more information on [adding credentials][credentials] and
[configuring a controller][controller-config].


<!-- COMMENTED OUT UNTIL PAGE REFERRED TO IS ADDED
<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
To manually install CDK locally using LXD, it is necessary to use a specific container profile before deploying.  See the <a href="/kubernetes/clouds-lxd">notes on LXD</a> before deployment.
  </p>
</div>
-->


### Create a model

The controller automatically creates a model named 'default'. It is useful to
have a different model for each deployment of **CDK**, and for the models to have
useful names. You can create a new model with the `add-model` command like
this:

```bash
juju add-model cdk-test
```

...susbstituting the desired name.

### Deploy the CDK bundle

The **Juju Charm Store** hosts the **CDK** bundles as well as individual charms.  To
deploy the latest, stable bundle, run the command:

```bash
juju deploy canonical-kubernetes
```

To get the status of the deployment, run `juju status`. For constant updates,
combine it with the `watch` command:

```
watch -c juju status --color
```

It is also possible to deploy a specific version of the bundle by including the
revision number. For example, to deploy the **CDK** bundle for the Kubernetes 1.13
release, you could run:

```bash
juju deploy cs:~containers/canonical-kubernetes-435
```

The revision numbers for bundles are generated automatically when the bundle is
updated, including for testing and beta versions, so it isn't always the case
that a higher revision number is 'better'. The revision numbers for the release
versions of the **CDK** bundle are shown in the table below:

<a  id="table"></a>

| Kubernetes version | CDK bundle |
| --- | --- |
| 1.14.x         | [canonical-kubernetes-471](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-471/archive/bundle.yaml?channel=stable) |
| 1.13.x         | [canonical-kubernetes-435](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-435/archive/bundle.yaml?channel=stable) |
| 1.12.x         | [canonical-kubernetes-357](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-357/archive/bundle.yaml?channel=stable) |
| 1.11.x         | [canonical-kubernetes-254](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-254/archive/bundle.yaml?channel=stable) |
| 1.10.x         | [canonical-kubernetes-211](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-211/archive/bundle.yaml?channel=stable)  |
| 1.9.x        | [canonical-kubernetes-179](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-179/archive/bundle.yaml?channel=stable) |
| 1.8.x | [canonical-kubernetes-132](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-132/archive/bundle.yaml?channel=stable) |
| 1.7.x | [canonical-kubernetes-101](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-101/archive/bundle.yaml?channel=stable) |
| 1.6.x | [canonical-kubernetes-38](https://api.jujucharms.com/charmstore/v5/~containers/bundle/canonical-kubernetes-38/archive/bundle.yaml?channel=stable) |

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
Only the latest three versions of CDK are supported at any time.
  </p>
</div>

<a id="config" ></a>

### Configure kubectl

You will need **kubectl** to be able to use your Kubernetes cluster. If it is not already
installed, it is easy to add via a snap package:

```bash
sudo snap install kubectl --classic
```

For other platforms and install methods, please see the
[Kubernetes documentation][kubectl].

The config file for accessing the newly deployed cluster is stored in the cluster itself. You
should use the following command to retrieve it:

```bash
juju scp kubernetes-master/0:config ~/.kube/config
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Caution:</span>
If you have multiple clusters you will need to manage the config file rather than just
replacing it. See the <a href="https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/">
Kubernetes documentation</a> for more information on managing multiple clusters.
  </p>
</div>


You can verify that kubectl is configured correctly and can see the cluster by running:

```bash
kubectl cluster-info
```

You can now continue to operate your cluster. If you are new to CDK or Kubernetes, you
should check out the [Basic operations documentation][operations], which will explain
how to get familiar with your cluster. For further customisation options, including cloud
integration, continue reading below first.


### Additional configuration

To allow Kubernetes to access resources and functionality of the underlying
cloud upon which it is deployed, additional integrator charms are available. When
installing with **conjure-up**, these charms are automatically added to the
deployment and configured appropriately.

Adding the integrator charms directly with **Juju** is not recommended - it is more
reliable (and easier) to include these charms at deployment time, using the "overlay"
method as [described below](#overlay). The manual deployment steps shown here are
only for reference to give a better understanding of how these charms work in relation to
**CDK**.

This table explains which charms are
used:

| Cloud     | Integrator charm   |  Juju deploy command  | Notes/docs  |
|------------|----------------------|-------------------------------------------------|-----------------------------------------------------------|
| AWS        | aws-integrator       | juju deploy cs:~containers/aws-integrator       | [docs][aws-docs]      |
| Azure      | azure-integrator     | juju deploy cs:~containers/azure-integrator     | [docs](https://jujucharms.com/u/containers/azure-integrator/)     |
| Google     | gcp-integrator       | juju deploy cs:~containers/gcp-integrator       | [docs][gcp-docs]      |
| Local      | N/A                  | N/A                                             |                                                           |
| OpenStack  | openstack-integrator | juju deploy cs:~containers/openstack-integrator | [docs](https://jujucharms.com/u/containers/openstack-integrator/) |
| Rackspace  | openstack-integrator | juju deploy cs:~containers/openstack-integrator | [docs](https://jujucharms.com/u/containers/openstack-integrator/) |
| vSphere    | vsphere-integrator   | juju deploy cs:~containers/vsphere-integrator   | [docs](https://jujucharms.com/u/containers/vsphere-integrator/ )  |

The charm should be deployed and relationships established with both the
`kubernetes-worker` and `kubernetes-master` charms. For example, in the case of
AWS:

```bash
juju deploy cs:~containers/aws-integrator
juju trust aws-integrator
juju add-relation aws-integrator kubernetes-master
juju add-relation aws-integrator kubernetes-worker
```

The `juju trust` command allows the aws-integrator to make use of the
credentials stored by **Juju**.

This demonstrates how the charm relates to the rest of the **CDK** bundle, but it is
recommended to use the [overlay](#overlay) method for installing in practice.

## Customising the bundle install

A number of the scenarios outlined at the start of this document involved
customising  the **CDK** install. There are two main ways to do this, using
overlays or editing the bundle file itself.

Using an overlay means you can easily apply your customisation to different
versions of the **CDK** bundle, with the possible downside that changes in the
structure of  new versions of **CDK** may render your overlay obsolete or
non-functional (depending on what exactly your overlay does).

Saving a copy of the **CDK** bundle file and editing that means that your
customisation will always work, but of course, requires that you create a new
file for each version of **CDK**.

Both methods are described below.

<a id="overlay"></a>
### Using overlays

A _bundle overlay_ is a fragment of valid YAML which is dynamically merged on
top of a bundle before deployment, rather like a patch file. The fragment can
contain any additional or alternative YAML which is intelligible to **Juju**. For
example, to replicate the steps used above to deploy and connect the
`aws-integrator` charm, the following fragment could be used:

```yaml
applications:
  aws-integrator:
    charm: cs:~containers/aws-integrator
    num_units: 1
relations:
  - ['aws-integrator', 'kubernetes-master']
  - ['aws-integrator', 'kubernetes-worker']
  ```

You can also [download the fragment here][asset-aws-overlay].

**Juju**'s bundle format, and valid YAML are discussed more fully in the
[Juju documentation][juju-bundle]. In this example it merely adds a new application,
specifying the charm to use, and further specifies the relationships to add.

To use this overlay with the **CDK** bundle, it is specified during deploy like this:

```bash
juju deploy canonical-kubernetes  --overlay ~/path/aws-overlay.yaml
```

Substitute in the local path and filename to point to your YAML fragment.

Note that you will still need to run the command to share credentials with this charm:

```bash
juju trust aws-integrator
```


#### Adding or changing constraints

After adding additional components, the most common use of overlays is to change
constraints (the resources requested for the application). Although these are specified
already in the **CDK** bundle, they can be overridden by an overlay. It isn't necessary
to replicate the entirety of an entry, just the parts you wish to change. For example:

```yaml
kubernetes-worker:
  constraints: cores=4 mem=8G root-disk=100G
  num_units: 6
```
Changes the machine constraints for Kubernetes workers to add more root disk space,
and also deploys six units instead of the three specified in the original bundle.

More information on the constraints you can use is available in the
[Juju documentation][juju-constraints].

#### Changing configuration values

Configuration settings are mapped to "options" under the charm entries in the bundle
YAML. Usually these are only expressed when they differ from the default value in the
charm. For example, if you look at the fragment for the `kubernetes-worker` in the
**CDK** bundle:

```yaml
kubernetes-worker:
  annotations:
    gui-x: '100'
    gui-y: '850'
  charm: cs:~containers/kubernetes-worker-398
  constraints: cores=4 mem=4G root-disk=16G
  expose: true
  num_units: 3
  options:
    channel: 1.13/stable
  resources:
    cni-amd64: 12
    cni-arm64: 10
    cni-s390x: 11
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
juju config kubernetes-worker https_proxy=https://proxy.example.com
juju config kubernetes-worker snap_proxy:=https://snap-proxy.example.com
```
... we can instead use the following YAML fragment as an overlay:

```yaml
kubernetes-worker:
  options:
    https_proxy: https://proxy.example.com
    snap_proxy: https://snap-proxy.example.com
```


### Editing a bundle

Another way to change or customise an install is to store the YAML bundle file locally and
edit it with a standard text editor.

The latest version of the **CDK** bundle can always be retrieved by
[fetching the current stable version from the Juju Charm Store][latest-bundle-file]. For
other versions, see the [table above](#table).

Care should be taken when editing the YAML file as the format is very strict. For more
details on the format used by Juju, see the [Juju bundle documentation][juju-bundle].

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

<!-- IMAGES -->

[image-gui]: https://assets.ubuntu.com/v1/19f13565-bundle-export.png

<!-- LINKS -->

[jaas]: https://jaas.ai/
[juju-docs]: https://docs.jujucharms.com/reference-install
[controller-config]: https://docs.jujucharms.com/controllers-config
[credentials]: https://docs.jujucharms.com/
[quickstart]: /kubernetes/docs/quickstart
[juju-bundle]: https://docs.jujucharms.com/stable/en/charms-bundles
[juju-gui]: https://docs.jujucharms.com/stable/en/controllers-gui
[juju-constraints]: https://docs.jujucharms.com/stable/en/reference-constraints
[asset-aws-overlay]: https://raw.githubusercontent.com/juju-solutions/kubernetes-docs/master/assets/aws-overlay.yaml
[latest-bundle-file]: https://api.jujucharms.com/charmstore/v5/~containers/canonical-kubernetes/archive/bundle.yaml
[charm-kworker]: https://jujucharms.com/u/containers/kubernetes-worker/#configuration
[snaps]: https://docs.snapcraft.io/snap-documentation
[kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[aws-docs]: /kubernetes/docs/aws-integration
[gcp-docs]: /kubernetes/docs/gcp-integration
[operations]: /kubernetes/docs/operations
