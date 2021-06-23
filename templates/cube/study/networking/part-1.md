---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Networking"
  description: "Networking"
  auto_paginate: True
---

Networking links many servers together and facilitates communication between them.
Ubuntu provides several network configuration tools, some with a
graphical interface and some with a command-line interface.

## NetworkManager

Network Manager is a software utility used to configure Linux kernel
network interfaces.

The NetworkManager architecture has two components:

* The NetworkManager daemon, which configures the network interfaces.
* The graphical front-ends for GNOME, KDE, and other graphical
  desktop environments.

NetworkManager has a built-in command-line interface called `nmcli`
and a text-based user interface called `nmtui`.

NetworkManager is often used on Ubuntu Desktop installations.

## Systemd-Networkd

By default, Ubuntu Server comes with `systemd-networkd` and `netplan`
installed.

`systemd-networkd` is a service used to configure Linux kernel network
interfaces. It is what we need if we want to set up complex
networking.

## Netplan

Netplan is a backend-agnostic network configuration tool. The network
configuration is placed in an YAML file. Netplan then reads the YAML
configuration file, and it generates the network configuration appropriate
for the specified backend.

Netplan supports the following backends:

* NetworkManager
* systemd-networkd

The next section discusses Netplan in greater detail.

For more information on new networking features in Ubuntu 20.04 LTS,
see the [Release Notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes#Network_configuration).
