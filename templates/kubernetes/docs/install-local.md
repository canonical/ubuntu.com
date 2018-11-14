---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "Installing to a local machine"
  description: How to install the Canonical Distribution of Kubernetes on a single machine for easy testing and development.
---

Installing the **Canonical Distribution of Kubernetes<sup>&reg;</sup> (CDK)**
on a single machine is possible for the purposes of testing and development.

Be aware that the full deployment of **CDK** has system requirements which may exceed a standard laptop or desktop machine. It is only recommended for a machine with 32GB RAM and 250GB of SSD storage.

<div class="p-notification--positive"><p markdown="1" class="p-notification__response">
<span class="p-notification__status">Note:</span>
If you don't meet these requirements or want a lightweight way to develop on pure Kubernetes, we recommend  <a href="https://microk8s.io/">microk8s</a>
</p></div>

The main requirement for a local install is a local cloud to run **CDK** on. This is achieved by using lightweight containers managed by [LXD][lxd-home]. **LXD** version 3.0 or better is required for the default installer, and there are some specific profile requirements as detailed below.

## If **LXD** is already installed

The **conjure-up** installer requires a specific LXD version, profile and storage options which may conflict with any existing version of LXD.
To avoid problems, migrate from the _deb_ LXD packaging after installing the snap version:

```bash
sudo snap install lxd
/snap/bin/lxd.migrate
```

This will move all container specific data to the snap version and clean up the unused Debian packages. You should also check out the [notes for using LXD with conjure-up][conjure-lxd].

You can now proceed using the main installer. Follow the [install instructions][quickstart] and choose `localhost` in the `CHOOSE A CLOUD` step.

## Ubuntu Server

### 1. Install **LXD**

```bash
sudo snap install lxd
```

### 2. Run the **LXD** init script

```bash
/snap/bin/lxd init
```

### 3. Configure the installer

The init script itself can vary depending on the version of LXD. The important configuration options for the installer are:

- Networking: Do **NOT** enable ipv6 networking on the bridge interface
- Storage Pool: Use the 'dir' storage type

You can now proceed using the main installer. Follow the [install instructions][quickstart] and choose `localhost` in the `CHOOSE A CLOUD` step.

## Ubuntu Desktop

### 1. Install **LXD**

```bash
sudo snap install lxd
```

### 2. Create users

In order to access the **LXD** service your user will need to be apart of the `lxd` group. Run the following:

```bash
sudo usermod -a -G lxd $USER
newgrp lxd
```

### 3. Run the **LXD** init script

```bash
/snap/bin/lxd init
```

### 4. Configure

The init script itself can vary depending on the version of LXD. The important configuration options for the installer are:

- Networking: Do **NOT** enable ipv6 networking on the bridge interface
- Storage Pool: Use the 'dir' storage type

You can now proceed using the main installer. Follow the [install instructions][quickstart] and choose `localhost` in the `CHOOSE A CLOUD` step.

## Other platforms (ArchLinux, Debian, Fedora, OpenSUSE )

1.  Install **LXD** using the [instructions for your OS][lxd-install]
2.  Install Conjure up using the [instructions for your OS][conjure-up-install]
3.  Proceed with the relevant steps from the [install instructions][quickstart] and choose `localhost` in the `CHOOSE A CLOUD` step.

<!-- LINKS -->

[lxd-home]: https://linuxcontainers.org/
[lxd-install]: https://linuxcontainers.org/lxd/getting-started-cli/
[conjure-up-install]: https://docs.conjure-up.io/devel/en/user-manual#installing-conjure-up
[conjure-lxd]: https://docs.conjure-up.io/stable/en/user-manual#users-of-lxd
[quickstart]: /kubernetes/docs/quickstart
