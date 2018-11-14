---
wrapper_template: base_docs.html
context:
    title: Quick start
markdown_includes:
    nav: shared/_side-navigation.md
---

<style>
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  height: auto;
}
</style>

<div class="p-content__row">
    <div class="u-equal-height">
        <div class="col-6">

<p>The Canonical Distribution of Kubernetes<sup>&reg;</sup> delivers a ‘pure K8s’
experience, tested across a wide range of clouds and integrated with modern
metrics and monitoring. It works across all major public clouds and private
infrastructure, enabling your teams to operate Kubernetes clusters on demand,
anywhere.</p>

<p>With this quick start guide and some tools from Canonical, you'll have a Kubernetes cluster running on the cloud of your choice in minutes!</p>

</div>
<div class="col-6 u-align--right">
    <img style="border: 0" src="https://assets.ubuntu.com/v1/b3b65bb0-k8s-bundle.png" width="350" height="350">
</div>
</div></div>

<hr class="is-deep">

## What you'll need

  *  An Ubuntu 18.04 LTS or 16.04 LTS environment to run the commands (or another operating system which supports `snapd` - see the [snapd documentation][snapd-docs])
  * Account credentials for one of the following public clouds:
      -  [Amazon Web Services][cloud-aws], including AWS-China and AWS-gov
      -  [CloudSigma][cloud-cloudsigma]
      - [ Google Cloud platform ][cloud-google] (See additional [notes for Google cloud][google-credentials])
      - [Joyent][cloud-joyent]
      - [Microsoft Azure][cloud-azure], including Azure-China
      - [Oracle Cloud][cloud-oracle]
      - [Rackspace][cloud-rackspace]


<div class="p-notification--positive"><p class="p-notification__response">
<span class="p-notification__status">Note:</span> If you don't meet these
requirements, there are additional ways of installing the <emphasis>Canonical
Distribution of Kubernetes<sup>&reg;</sup></emphasis>, inluding additional OS
support and an entirely local deploy. Please see the more general
<a href="./install"> Installing CDK</a> page for details. </p></div>

## Install the tools

The recommended way to install the **Canonical Distribution of
Kubernetes&reg;** is with the tools <a href="https://jujucharms.com"> Juju</a>,
an application modelling tool, and <a href="https://conjure-up.io">
conjure-up</a>, a guided installer for complex applications.

From the command line, run the following:

```bash
sudo snap install conjure-up --classic
```
<sub>(Note: the use of 'sudo' may not be required on some versions of Linux)</sub>

This command will install both **conjure-up** and **Juju** via snap packages.

## Run **conjure-up**

To start deploying Kubernetes, simply run:

```bash
conjure-up
```

This will start an interactive, guided deployment of the components of the
**Canonical Distribution of Kubernetes**&nbsp;<sup>&reg;</sup>.

**conjure-up** can be used to deploy many different applications, with a set of
processing scripts known as _spells_. Use the arrow keys to select
"**Canonical Distribution of Kubernetes**" and press `Enter`

![conjure-up menu](https://assets.ubuntu.com/v1/37d476e5-CDK-choose.png)

The next screen shows a selection of add-ons which can be installed at the same time as
Kubernetes.

![conjure-up menu][img-add-ons]

You may want to come back and give some of these a try, but for now, just
use the `Tab` key to move down the list and select the `Continue`  button on the
interface, and press `Enter`.

### Choose a cloud

The next step is to choose the cloud you wish to deploy to.

![conjure-up menu][img-clouds]

Select the public cloud you wish to use and continue.

Depending on your cloud, you will also likely see a screen to select the region to use. This
maps to the known regions of the cloud you chose. Select an appropriate region and
continue.

### Add credentials

If you have run through this install previously or you have already set up credentials with
**Juju**, you will be given the option of using these previously stored credentials or
adding new ones.

If you haven't previously stored credentials, you will instead be prompted to enter them
now:

![conjure-up menu][img-credential]

Simply paste in the required fields and use `Tab`, `cursor keys` and `Enter` to navigate.

<div class="p-notification--positive"><p class="p-notification__response">
  <span class="p-notification__status">Note:</span>
There are many different types of credentials, and copying and pasting them accurately
can be tricky. If you have any authentication difficulty, it may be easier to add credentials
using Juju, (<a href="https://docs.jujucharms.com/stable/en/credentials" > follow this link for documentation</a>)
</p></div>

### Create a controller

Juju uses a central _controller_ instance to manage the applications it deploys in separate
_models_. You always need at least one controller, but if you have already created one for
previous installs in this cloud (even if they weren't for Kubernetes), you can reuse that
controller.

![conjure-up controller menu][img-controller]

Assuming that this is your first time with **conjure-up** and **Juju**, select
`Deploy New Self-Hosted Controller` and continue.

### Configure your deployment

The next few **conjure-up** screens  deal with configuring and customising your
install. These are usually additional steps which **conjure-up** can perform
before, during or after the actual deployment to set up Kubernetes for quick
and easy use.

Depending on your chosen cloud, the first choice is which network plugin to use:

![conjure-up controller menu][img-network]

Use the cursor keys to navigate and `space` to select either **flannel** _or_
**calico**. If you don't have an opinion about which style of networking
you need, just leave the default choice and select `next`. Some clouds do not
currently support Calico, in which case this option will not appear.

You will now be asked for your **sudo** password.  This is so **conjure-up**
can download and install the latest version of `kubectl` (the command line tool
for managing Kubernetes) and configure it to work with your new cluster.

The next screen will show the applications to be deployed.  See the [overview][overview]
if you need a better understanding of what these components do.

![conjure-up controller menu][img-applications]

By default, this setup will deploy two Kubernetes master nodes and three
workers, which can be changed by entering the configuration screen for these
components and selecting new values. Note that it will also be possible to
increase the number of nodes later, so it isn't necessary to determine how many
workers you'll need in advance -- you can just select `Continue`.

### Deploying

Now **conjure-up** will start the set up by creating a Juju controller, and you
will see the following screen:

![conjure-up controller menu][img-juju]

As mentioned previously, a Juju controller is a cloud instance which Juju
uses to monitor and manage any other nodes and applications it deploys across
any number of different models. You will typically only need one Juju
controller per cloud, and you will be able to deploy multiple separate models
containing additional Kubernetes clusters or other big software applications.

Once the controller has been created, Juju will then create a model and
instances within that model to contain the applications which make up the
**Canonical Distribution of Kubernetes**.  For a few minutes, **conjure-up**
will display  a status screen, reporting on the progress of the install. You
will see the individual status messages change as the instances are created,
software is installed on them, and then this software is configured to work
with the other elements of the deployment.

![conjure-up controller menu][img-waiting]

The actual time this takes will depend on a number of factors, including which
cloud you are using, but it should be complete in around five minutes. When the
installed software is up an running, **conjure-up** will display a final screen
indicating that the cluster is up and running and giving details of the running
services and their addresses. It should also indicate that the `kubectl`
software has been installed on your local machine.

![conjure-up status][img-final]

Congratulations! You now have a cluster up and running with the **Canonical
Distribution of Kubernetes**&nbsp;<sup>&reg;</sup>

You can now check the status of the cluster yourself by running the command:

```bash
kubectl cluster-info
```
The output should look similar to this:

![cli output][img-cli-output]

This shows the relevant IP addresses for operating your cluster.

### Access the dashboard

To check that everything is actually working, you may want to log in to the
Kubernetes Dashboard at the IP address given in the above output. The default
username is 'admin' and the password can be retrieved using the command:

```bash
kubectl config view | grep password
 ```

<div class="p-notification--positive"><p class="p-notification__response">
<span class="p-notification__status">Note:</span> If you have set up more than
one cluster, each will have a different password and you will need to look at
the full output from `kubectl config view` to determine which one to use.
</p></div>

Open a browser at the address for the Dashboard and log in. You will see an
additional authentication screen:

![dashboard image][img-dash-login]

For now you can just choose 'Skip' to get to the Dashboard, but for future
administration, you should set up _role based access control_([RBAC][RBAC]).

![dashboard image][img-dashboard]

## Next steps

Now that you have your cluster, you can put it to work! Here are
a few recommended starting points:

* [Add persistent storage&nbsp;&rsaquo;][storage]
* [Install an application with Helm&nbsp;&rsaquo;][how-helm]
* [Manage your cluster with **Juju**&nbsp;&rsaquo;][how-juju]

<sub>Kubernetes<sup>&reg;</sup> is a registered trademark of The Linux Foundation in the United States and other countries, and is used pursuant to a license from The Linux Foundation. </sub>



<!--IMAGES-->
[img-cli-output]: https://assets.ubuntu.com/v1/d5519ed3-CDK-clusterinfo.png
[img-add-ons]: https://assets.ubuntu.com/v1/a3e45c9d-CDK-add-on.png
[img-applications]: https://assets.ubuntu.com/v1/421cf437-CDK-applications.png
[img-choose]: https://assets.ubuntu.com/v1/b992cb94-CDK-choose.png
[img-clouds]: https://assets.ubuntu.com/v1/a4efde88-CDK-cloud.png
[img-controller]: https://assets.ubuntu.com/v1/f65cdeb8-CDK-controller.png
[img-final]: https://assets.ubuntu.com/v1/bbe1b9f4-CDK-final.png
[img-juju]: https://assets.ubuntu.com/v1/112fa567-CDK-juju.png
[img-network]: https://assets.ubuntu.com/v1/cd3e83d6-CDK-network.png
[img-waiting]: https://assets.ubuntu.com/v1/92511391-CDK-waiting.png
[img-credential]: https://assets.ubuntu.com/v1/f915816f-CDK-credential.png
[img-dash-login]: https://assets.ubuntu.com/v1/d89b1290-CDK-007.png
[img-dashboard]: https://assets.ubuntu.com/v1/37ee63d6-CDK-008.png

<!-- LINKS -->

[install]: ./install
[overview]: ./overview.html
[snapd-docs]: https://docs.snapcraft.io/core/install
[cloud-aws]: https://aws.amazon.com
[cloud-cloudsigma]: https://www.cloudsigma.com
[cloud-google]: https://cloud.google.com/
[cloud-oracle]: https://cloud.oracle.com/home
[cloud-rackspace]: https://www.rackspace.com/cloud/
[cloud-azure]: https://azure.microsoft.com/
[cloud-joyent]: https://www.joyent.com/
[how-login]: ./howto-login.html
[how-helm]: ./howto-helm.html
[how-juju]: ./howto-juju.html
[google-credentials]: ./googlecloud.html
[storage]: ./storage.html
[RBAC]:./rbac.html
