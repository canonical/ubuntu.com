---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Netplan"
  description: "Netplan"
  auto_paginate: True
---

[Netplan](https://github.com/CanonicalLtd/netplan) is an open-source
network configuration tool developed and maintained by Canonical.
Netplan is the default network configuration tool for Ubuntu. It can
render one kind of input configuration into control files for the two
primary backends (`systemd-networkd` and `NetworkManager`). It replaces
the `ifupdown` way of configuring networks. Ubuntu Server comes with
Netplan and the `systemd-networkd` backend by default.

Netplan uses YAML configuration files, which it then employs to create
backend configurations. If Netplan is configured to use `networkd`,
then `systemd` configures the network interfaces.

The Netplan configuration files are located in the **/etc/netplan**
directory.

Here is an example of a Netplan configuration file:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens4:
      dhcp4: false
      dhcp6: false
  bridges:
    br0:
      interfaces: [ens4]
      addresses: [10.10.10.10/24]
      mtu: 1500
      nameservers:
        addresses: [8.8.8.8]
      parameters:
        stp: true
        forward-delay: 4
      dhcp4: no
      dhcp6: no
```

Let's consider what the preceding network configuration means.

This is a YAML file, which means indentation is important, and
the number of spaces used throughout the configuration file must be
consistent.

The `renderer: networkd` line means that Netplan uses the
`systemd-networkd` backend. If this is an Ubuntu Server installation,
we do not need to specify the renderer, as `systemd-networkd` is the default
setting.

Both DHCPv4 and DHCPv6 are disabled for the `ens4` interface because
we do not want an automatic IPv4 or IPv6 address assigned on this
interface.

The `bridges` block defines a Linux bridge interface called `br0` and
connects the `ens4` interface to it. `br0` is configured with a
static IPv4 address. The bridge interface configuration defines
the MTU size to 1500 bytes and that Spanning Tree Protocol is enabled
with forward delay timer setting of 4 seconds.

Instead of using commands like `brctl addbr`, `brctl addif`,
`brctl set stp`, and `brctl setfd` to create and configure a bridge
interface, we tell `netplan` to do so with a few lines of configuration
in a YAML file.

To apply the configuration above, we just need to run the following:

```
$ netplan apply
```

This will trigger `netplan` to read the YAML configuration files,
generate configuration files that `systemd` can understand under the
**/run/systemd/network** directory, and apply the new configuration.

```
ubuntu@deploy:/run/systemd/network$ ls -l
total 24
-rw-r--r-- 1 root root  81 Nov  5 11:40 10-netplan-br0.netdev
-rw-r--r-- 1 root root 161 Nov  5 11:40 10-netplan-br0.network
-rw-r--r-- 1 root root  83 Nov  5 11:40 10-netplan-ens3.link
-rw-r--r-- 1 root root 151 Nov  5 11:40 10-netplan-ens3.network
-rw-r--r-- 1 root root 106 Nov  5 11:40 10-netplan-ens4.link
-rw-r--r-- 1 root root 137 Nov  5 11:40 10-netplan-ens4.network
```

In this case, `netplan` generated a file named **10-netplan-br0.netdev** in the
**/run/systemd/network** directory for the `br0`
interface, with STP enabled and a forward delay of 4 seconds.

```
[NetDev]
Name=br0
MTUBytes=1500
Kind=bridge

[Bridge]
ForwardDelaySec=4
STP=true
```

`netplan` also created a **10-netplan-br0.network** file with the IP
configuration we specified in the YAML configuration file.

```
ubuntu@deploy:/run/systemd/network$ cat 10-netplan-br0.network
[Match]
Name=br0

[Link]
MTUBytes=1500

[Network]
LinkLocalAddressing=ipv6
Address=10.10.10.10/24
Address=10.10.10.18/24
DNS=8.8.8.8
ConfigureWithoutCarrier=yes
```

Once we run `netplan apply`, the configuration is persistent and
survives reboots.

If we want to test a configuration before we apply it, `netplan`
provides some useful commands for this purpose.

`netplan generate` will only generate the backend-specific
configuration without applying it.

`netplan try` will apply a new `netplan` configuration, and it will
automatically roll back after two minutes unless the user accepts
the new configuration. 

```
ubuntu@alice:~$ sudo netplan try
Warning: Stopping systemd-networkd.service, but it can still be activated by:
  systemd-networkd.socket
Do you want to keep these settings?


Press ENTER before the timeout to accept the new configuration

Changes will revert in 118 seconds
```

This is useful when working remotely on a Linux server, and we
want to change IP addresses without risking a loss of connectivity
to the server.
Note that reverting some parameters for bridge and bond
interfaces is not supported.

Here is what a `bond` interface configuration looks like:

```
  bonds:
    bond0:
      addresses: [ 10.0.10.10/24 ]
      nameservers:
        addresses: [8.8.8.8]
      interfaces:
        - ens2
        - ens3
      parameters:
        mode: active-backup
        primary: ens2
```

In the `bond` block, we:

* Define the name of the bond interface, `bond0`.
* Specify the two physical interfaces to be bonded, `ens2` and `ens3`.
* Indicate that this is an `active-backup` bond with `ens2` being the primary interface.

For more network configuration examples, see [netplan.io](https://netplan.io/).
