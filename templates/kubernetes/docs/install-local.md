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
recommended on a machine running at least Ubuntu 20.04 with 32GB RAM and 128GB of
SSD storage.

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you don't meet these requirements or want a lightweight way to develop on pure Kubernetes, we recommend  <a href="https://microk8s.io/">MicroK8s</a>.</p>
  </div>
</div>

## Configure the host environment

Some default kernel settings are not suitable for running numerous containers.
Adjust these on the host machine by running:

```bash
sudo sysctl fs.inotify.max_queued_events=1048576 | sudo tee -a /etc/sysctl.conf
sudo sysctl fs.inotify.max_user_instances=1048576 | sudo tee -a /etc/sysctl.conf
sudo sysctl fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf
```

## Set up LXD

In order to run **Charmed Kubernetes** locally, you will need a local cloud. This can
be achieved by using lightweight containers managed by [LXD][lxd-home]. **LXD** version
5.0 or better is required.

### Install LXD

If `lxd` is not present, install the [snap][] package as follows:

```bash
sudo snap install lxd --channel 5.0/stable
```

If the `lxd` snap is already installed, ensure it is at version 5.0 or better:

```bash
sudo snap refresh lxd --channel 5.0/stable
```

Add your user to the `lxd` group if needed:

```bash
sudo usermod -a -G lxd $USER
```

You may need to logout and login again for the new group membership to take effect.

### Initialise LXD

For new LXD installations or cases where LXD was installed, but never used,
there will be no data in the default profile. You should now initialise LXD:

```bash
lxd init
```

The init script itself may vary depending on the version of LXD. The important
configuration options are:

- Storage backend: `dir`
- IPv6 address: `none`

Currently, **Charmed Kubernetes** only supports `dir` as a storage backend and
does not support IPv6 on the LXD bridge interface. Additional profiles will be
added automatically to LXD to support the requirements of **Charmed Kubernetes**.

## Install Juju

[Juju][] version 3 or better should be installed from a snap. Because it is strictly
confined, you will need to manually create a Juju data directory prior to installing:

```bash
mkdir -p ~/.local/share/juju
sudo snap install juju --channel 3/stable
```

Juju comes preconfigured to work with LXD. A cloud created by using LXD
containers on the local machine is known as `localhost` to Juju. To begin, you
need to create a Juju controller for this cloud:

```bash
juju bootstrap localhost
```

Once complete, create a new model for **Charmed Kubernetes**:

```bash
export MODEL=ck8s
juju add-model $MODEL
```

In addition to creating a Juju model, this will also create a LXC profile that will
be applied to all future units deployed to the model. **Charmed Kubernetes** requires
privileged access to resources on the host machine. Create a profile that allows the
necessary access to these resources:

```bash
cat <<EOF > $HOME/profile.yaml
name: juju-$MODEL
config:
  boot.autostart: "true"
  linux.kernel_modules: ip_vs,ip_vs_rr,ip_vs_wrr,ip_vs_sh,ip_tables,ip6_tables,netlink_diag,nf_nat,overlay,br_netfilter
  raw.lxc: |
    lxc.apparmor.profile=unconfined
    lxc.mount.auto=proc:rw sys:rw cgroup:rw
    lxc.cgroup.devices.allow=a
    lxc.cap.drop=
  security.nesting: "true"
  security.privileged: "true"
description: "Juju profile modified for Charmed Kubernetes"
devices:
  aadisable:
    path: /sys/module/nf_conntrack/parameters/hashsize
    source: /sys/module/nf_conntrack/parameters/hashsize
    type: disk
  aadisable2:
    path: /dev/kmsg
    source: /dev/kmsg
    type: unix-char
  aadisable3:
    path: /sys/fs/bpf
    source: /sys/fs/bpf
    type: disk
  aadisable4:
    path: /proc/sys/net/netfilter/nf_conntrack_max
    source: /proc/sys/net/netfilter/nf_conntrack_max
    type: disk
EOF
```

Update the Juju model profile with this new configuration:

```bash
cat $HOME/profile.yaml | lxc profile edit juju-$MODEL
```

## Deploy Charmed Kubernetes

Deploy **Charmed Kubernetes** with the following command:

```bash
juju deploy charmed-kubernetes
```

The latest stable version of **Charmed Kubernetes** will now be installed with default
components.

### Additional charm requirements

Some charms in the default deployment require additional configuration for installation
in containers. This can be performed before the deployment is complete or at any time
after:

- Calico, the default CNI, may complain about an `rp_filter` parameter that cannot be
set within a container (see the [troubleshooting section](#rp_filter) for details).
Configure `calico` to ignore this parameter with the following:

  ```bash
  juju config calico ignore-loose-rpf=true
  ```

- Containerd, the default CRI, includes a binary resource in the charm that will not
work within a container. Attach an empty resource to the `containerd` application to
instruct the charm to use default system binaries instead:

  ```bash
  touch $HOME/empty.tgz
  juju attach-resource containerd containerd=$HOME/empty.tgz
  ```

### Additional profile requirements

Some versions of **Charmed Kubernetes** embed a LXC profile in the Kubernetes
control-plane and worker charms. Update these to match the `juju-$MODEL` profile created
in the the last section:

```bash
for p in $(lxc profile ls -f compact | grep juju-$MODEL-kubernetes | awk '{print $1}')
do
  cat $HOME/profile.yaml | lxc profile edit $p
done
```

### Monitor the deployment

It may take a while for the deployment to complete. You can watch the progress from the
command line:

```bash
watch --color juju status --color
```

When all applications report `active` status, the deployment is complete.
If you wish to customise this install
(which may be helpful if you are close to the system requirements), please see
the [main install page][install].

## Next Steps

Now that you have a **Charmed Kubernetes** cluster up and running, check out the
[Operations guide][operations] for how to use it!

## Troubleshooting

### I get an error message when running lxc or lxd init

The most common cause of this message:

```no-highlight
Error: Get http://unix.socket/1.0: dial unix /var/snap/lxd/common/lxd/unix.socket: connect: permission denied
```

...is that either you have not run `lxd init`, or you are logged in as a user
who is not part of the `lxd` group. To add the current user to the group:

```bash
sudo usermod -a -G lxd $USER
```

You may need to start a new shell (or logout and login) for this to take effect.

### Services fail to start or are constantly restarting

Symptoms include:

- `kubernetes-control-plane` status stuck: *Restarting snap.kubelet.daemon service*
- `kubernetes-worker` status stuck: *Waiting for kubelet to start*
- `systemctl status snap.kube-proxy.daemon` on a control-plane or worker unit reports:
  ```bash
  Error: open /proc/sys/net/netfilter/nf_conntrack_max: no such file or directory
  ```
- `journalctl -u snap.kubelet.daemon` on a control-plane or worker unit reports:
  ```bash
  failed to create kubelet: open /dev/kmsg: no such file or directory
  ```

This is most commonly caused when the [lxd-profile.yaml][lxd-profile] embedded in the
charms is in conflict with the Juju model profile. Verify the profiles in use by the
control-plane and worker applications match the `$HOME/profile.yaml` created in the
**Install Juju** section above:

```bash
lxc profile list
lxc profile show juju-[model]-kubernetes-[control-plane|worker]-[revision]
```

Refresh the application profile(s) as follows:

```bash
cat $HOME/profile.yaml | lxc profile edit juju-[model]-kubernetes-[control-plane|worker]-[revision]
```

Reboot affected units to force the profile to be reapplied:

```bash
juju ssh kubernetes-control-plane/[n] -- sudo reboot
juju ssh kubernetes-worker/[m] -- sudo reboot
```

### Kubelet fails to start with errors related to inotify_add_watch

For example, `systemctl status snap.kubelet.daemon.service` may report the
following error:

```bash
kubelet.go:1414] "Failed to start cAdvisor" err="inotify_add_watch /sys/fs/cgroup/cpu,cpuacct: no space left on device"
```

This problem is usually related to the kernel parameters,
`fs.inotify.max_user_instances` and `fs.inotify.max_user_watches`.

Increase their values on the machine that is hosting
the **Charmed Kubernetes** installation:

```bash
sudo sysctl fs.inotify.max_user_instances=1048576
sudo sysctl fs.inotify.max_user_watches=1048576
```

### My CNI needs kernel parameters that are not supported in the charm lxd-profile

If the CNI pods fail to start, see notes on the specific CNI page.

CNIs like [Cilium][cilium] and [Calico][calico] need access to `/sys/fs/bpf`, but that
mountpoint is not supported by the Juju [validation check][juju-validation-check]
for the charm-specific `lxd-profile.yaml`. See [CNI Overview][cni-overview] for more
details.

### Calico is blocked with warning about ignore-loose-rpf

<a id="rp_filter"></a>

Calico may be blocked with status: `ignore-loose-rpf config is in conflict with rp_filter value`.

If the kernel `net.ipv4.conf.all.rp_filter` value is set to 2, Calico will complain,
because it expects the kernel to have strict reverse path forwarding set (ie. value be 0 or 1) for security.
In LXD containers, it's not possible to manipulate the value; it's dependent on the host.
In this situation we can set the charm config `ignore-loose-rpf=true`.

```bash
juju config calico ignore-loose-rpf=true
```

<!-- LINKS -->

[lxd-home]: https://ubuntu.com/lxd
[lxd-profile]: https://juju.is/docs/sdk/lxd-profile-yaml
[calico]: /kubernetes/docs/cni-calico
[cilium]: /kubernetes/docs/cni-cilium
[cni-overview]: /kubernetes/docs/cni-overview
[juju-validation-check]: https://juju.is/docs/juju/use-lxd-profiles
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
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

