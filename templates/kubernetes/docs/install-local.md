---
wrapper_template: "templates/docs/markdown.html"
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

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you don't meet these requirements or want a lightweight way to develop on pure Kubernetes, we recommend  <a href="https://microk8s.io/">MicroK8s</a></p>
  </div>
</div>

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

If you installed LXD from a snap, you can skip this step (but if necessary, you
may need to alter the [default profile](#profile)). If your system
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

### Services fail to start with errors related to missing files in the /proc filesystem

For example, `systemctl status snap.kube-proxy.daemon` may report the following:

```bash
Error: open /proc/sys/net/netfilter/nf_conntrack_max: no such file or directory
```

This is most commonly caused when [lxd-profile.yaml][lxd-profile] is not applied.
Verify the profile in use by the `kubernetes-worker` charm:

```bash
lxc profile list
lxc profile show juju-[model]-kubernetes-worker-[revision]
```

Identify any missing fields from the above `lxd-profile.yaml` file and add them
as needed with:

```bash
lxc profile edit juju-[model]-kubernetes-worker-[revision]
```

You may need to remove and re-add the affected unit for the changes to take
effect:

```bash
juju remove-unit kubernetes-worker/[n]
juju add-unit kubernetes-worker
```

### Kubelet fails to start with errors related to inotify_add_watch

For example, `systemctl status snap.kubelet.daemon.service` may report the
following error:

```bash
kubelet.go:1414] "Failed to start cAdvisor" err="inotify_add_watch /sys/fs/cgroup/cpu,cpuacct: no space left on device"
```

This problem usually is related to the kernel parameters,
`fs.inotify.max_user_instances` and `fs.inotify.max_user_watches`.

At first, you should increase their values on the machine that is hosting
the **Charmed Kubernetes** installation:

```bash
sysctl -w fs.inotify.max_user_instances=8192
sysctl -w fs.inotify.max_user_watches=1048576
```

Then the new values should be applied to the worker units:

```bash
juju config kubernetes-worker sysctl="{ fs.inotify.max_user_instances=8192 }"
juju config kubernetes-worker sysctl="{ fs.inotify.max_user_watches=1048576 }"
```

### Calico is blocked with warning about ignore-loose-rpf

Calico may be blocked with status: `ignore-loose-rpf config is in conflict with rp_filter value`.

If the kernel `net.ipv4.conf.all.rp_filter` value is set to 2, Calico will complain,
because it expects the kernel to have strict reverse path forwarding set (ie. value be 0 or 1) for security.
In LXD containers, it's not possible to manipulate the value; it's dependent on the host.
In this situation we can set the charm config `ignore-loose-rpf=true`.

```
juju config calico ignore-loose-rpf=true
```

<!-- LINKS -->

[lxd-home]: https://ubuntu.com/lxd
[lxd-profile]: https://github.com/charmed-kubernetes/charm-kubernetes-worker/blob/main/lxd-profile.yaml
[Juju]: https://jaas.ai
[snap]: https://snapcraft.io/docs/installing-snapd
[install]: /kubernetes/docs/install-manual
[operations]: /kubernetes/docs/operations

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/install-local.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>

