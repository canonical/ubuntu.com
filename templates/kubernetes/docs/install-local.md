---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Installing to a local machine"
  description: How to install Charmed Kubernetes on a single machine for easy testing and development.
keywords: lxd, localhost, juju, requirements, developer
tags: [install]
sidebar: k8smain-sidebar
permalink: install-local.html
layout: [base, ubuntu-com]
toc: False
---

Installing **Charmed Kubernetes** on a single machine is possible for the
purposes of testing and development.

However, be aware that the full deployment of **Charmed Kubernetes** has system
requirements which may exceed a standard laptop or desktop machine. It is only
recommended for a machine with 32GB RAM and 250GB of SSD storage.

<div class="p-notification--positive"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
If you don't meet these requirements or want a lightweight way to develop on
pure Kubernetes, we recommend  <a href="https://microk8s.io/">microk8s</a>
</p></div>

In order to run locally, you will need a local cloud. This can be achieved by
using lightweight containers managed by [LXD][lxd-home]. **LXD** version 3.0
or better is required.

## 1. Set up LXD

### If LXD has not previously been installed

LXD 3.0 or above should be installed from a [snap][] and configured
for **Charmed Kubernetes**

#### Install LXD

```bash
sudo snap install lxd
```

#### Run the LXD init script

```bash
/snap/bin/lxd init
```

The init script itself may vary depending on the version of LXD. The important
configuration options for the installer are:

- Networking: Do **NOT** enable ipv6 networking on the bridge interface
- Storage Pool: Use the 'dir' storage type

You can now move on to the [next step](#step2)

### If **LXD** is already installed

If you installed LXD from a snap, you can skip this step (but if necessary, you may need to alter the [default profile](#profile)). If your system
had LXD pre-installed, or you have installed it from the archive (i.e. with
`apt install`), you will need to migrate to the snap version.

If you aren't sure whether LXD is installed, you can check
installed snaps with:

```bash
snap list | grep lxd
```

and installed deb packages with:

```bash
dpkg -s lxd |  grep Status
```

If you do have the deb version of LXD installed, you should migrate to the
snap version after it has been installed. The snap includes a script to do this
for you:

```bash
sudo snap install lxd
sudo /snap/bin/lxd.migrate
```

This will move all container specific data to the snap version and clean up
the unused Debian packages, which may take a few minutes.

If LXD was installed, but never used, there will be no data in the default
profile, so you should now initialise LXD:

```bash
sudo lxd init
```

<a id="profile"></a>

Currently, **Charmed Kubernetes** only supports `dir` as a storage option and
does not support ipv6, which should be set to `none` from the init script.
Additional profiles will be added automatically to LXD to support the
requirements of **Charmed Kubernetes**.

<a id="step2"></a>

## 2. Install **Juju**

[Juju][] should be installed from a snap:

```bash
sudo snap install juju --classic
```

Juju comes preconfigured to work with LXD. A cloud created by using LXD
containers on the local machine is known as `localhost` to Juju. To begin, you
need to create a Juju controller for this cloud:

```bash
juju bootstrap localhost
```

Juju creates a default model, but it is useful to create a new model for each
project:

```bash
juju add-model k8s
```

## 3. Deploy **Charmed Kubernetes**

All that remains is to deploy **Charmed Kubernetes**. A simple install can be achieved with one command:

```bash
juju deploy charmed-kubernetes
```

This will install the latest stable version of **Charmed Kubernetes** with
the default components and configuration. If you wish to customise this install
(which may be helpful if you are close to the system requirements), please see
the [main install page][install].


## Next Steps

Now you have a cluster up and running, check out the
[Operations guide][operations] for how to use it!

## Troubleshooting

### I get an error message when running lxc or lxd init

The most common cause of this message:

```no-highlight
Error: Get http://unix.socket/1.0: dial unix /var/snap/lxd/common/lxd/unix.socket: connect: permission denied
```

...is that either you have not run `lxd init`, or you are logged in as a user
who is not part of the `lxd` group (the user installing the snap is
automatically added).

To add the current user to the relevant group:

```bash
sudo usermod -a -G lxd $USER
```

You may need to start a new shell (or logout and login) for this to take effect:

```bash
newgrp lxd
```

<!-- LINKS -->

[lxd-home]: https://linuxcontainers.org/
[Juju]: https://jaas.ai
[snap]: https://snapcraft.io/docs/installing-snapd
[install]: /kubernetes/docs/install-manual
[operations]: /kubernetes/docs/operations
