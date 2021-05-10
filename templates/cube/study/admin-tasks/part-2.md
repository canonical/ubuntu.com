---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Administrative Tasks"
  description: "Administrative Tasks"
  auto_paginate: True
---

## Installation and Upgrade

The Ubuntu Linux distribution is based on Debian, and it is free and
open-source software. Canonical releases Ubuntu on a regular cadence.
Every Ubuntu release has a version number that reflects the year and
the month of the release, along with a development codename.
In the name 'Ubuntu 20.04 LTS Focal Fossa', 20.04 means that it was released
in April 2020, and Focal Fossa is the codename. LTS stands for Long Term
Support, meaning this release will be supported for five years,
until 2025.


## Install and Configure Linux Systems

The installation of the Ubuntu operating system is an administrative
task.

When it comes to installing Ubuntu, we can choose from the following
flavours, based on our needs:

* Ubuntu Server – A configuration to run on a server.
* Ubuntu Desktop – A configuration to run on a laptop PC.
* Ubuntu Cloud – A configuration to run in an OpenStack,
  LXC, AWS, or Azure cloud platform.
* Ubuntu Minimal – A configuration with a small runtime footprint.
* Ubuntu Kylin – The Ubuntu desktop server for Chinese users.

We can install Ubuntu Server in many ways. Some of them are:

* Using a bootable USB stick preloaded with the standard live ISO image.
* Using the Network Installer ISO image, provided internet access
  is available.
* Using cloud images.
* Using a PXE server, via PXE boot.

The text menu-based installer will prompt for language and keyboard
settings, network configuration, disk layout, and creating initial
users and passwords.

For an overview of the Ubuntu Server Installation, refer to the
[online guide](https://ubuntu.com/tutorials/install-ubuntu-server#1-overview).

If we intend to run Ubuntu on a VM, we can download a pre-installed
disk image of Ubuntu Cloud and boot a VM from it.

The Ubuntu cloud image comes with
[cloud-init](https://cloudinit.readthedocs.io/en/latest/) installed,
which parses and runs `cloud-config` configuration files. With
`cloud-config`, you can bootstrap a newly booted VM to a
remarkably complex degree using a YAML configuration file.

Here are some examples of what you can configure with `cloud-config`:

* You can trigger package update and package upgrade on the first boot
  with only two lines in a YAML file:

```yaml
  cloud_config:
    ...
    package_update: true
    package_upgrade: true
    ...
```

* You can define users and groups:

```yaml
  cloud_config:
    ...
    users:
      - default
      - name: sysadmin
        groups: users,adm
        lock-passwd: false
        shell: /bin/false
        sudo: "ALL=(ALL) NOPASSWD:ALL"
        ssh_authorized_keys:
          - { get_attr: [ user_keypair, public_key ] }
    ...
```

* You can write files, and define their path, permissions, and
  ownership:

```yaml
  cloud_config:
    ...
    write_files:
      - path: /etc/hosts
        permissions: '0644'
        content: |
          127.0.0.1 localhost
          ::1       ip6-localhost ip6-loopback
          fe00::0   ip6-localnet
          ff00::0   ip6-mcastprefix
          ff02::1   ip6-allnodes
          ff02::2   ip6-allrouters
          192.168.122.100 deploy.example.com deploy
          192.168.122.111 alice.example.com alice
          192.168.122.112 bob.example.com bob
          192.168.122.113 charlie.example.com charlie
          192.168.122.114 daisy.example.com daisy
          192.168.122.115 eric.example.com eric
          192.168.122.116 frank.example.com frank
    ...
```

* You can install packages:

```yaml
  cloud_config:
    ...
    packages:
      - qemu
      - qemu-kvm
      - libvirt-clients
      - libvirt-daemon-system
      - bridge-utils
      - virtinst
      - libguestfs-tools
      - apache2
    ...
```

* You can run commands:

```yaml
  cloud_config:
    ...
    runcmd:
      - systemctl enable qemu-guest-agent
      - systemctl start qemu-guest-agent
    ...
```

## Upgrade Linux Systems

Once we have installed Linux, the first mandatory step is to upgrade the
system and bring it up to date with all the security patches and
updates available.

If you boot a VM from an image stored in a cloud, there is a considerable
chance that the image you are using is a few days to weeks or months
old. You do not want to risk running a VM that might be several
security patches behind.

This reasoning applies when installing Ubuntu from an image using
a bootable USB, as well.

As soon as Ubuntu is installed, run the following commands:

```
$ sudo apt update
$ sudo apt upgrade
```

The `update` command updates the package list with the latest available
versions without installing or updating anything.
The `upgrade` command does the real work of upgrading every package
installed to the latest version available.

It is not enough that we upgrade the system after we install it.
We need to run upgrades periodically, ideally in an automated way,
to ensure the system is up to date all the time.

Ubuntu provides a great solution for keeping your system up to date
by means of installing and configuring the `unattended-upgrades`
package to run automatic upgrades.

The configuration for `unattended-upgrades` is in
**/etc/apt/apt.conf.d/50unattended-upgrades**.

We have many configuration options, among them:

* Remove unused kernel packages or not.
* Remove unused dependencies or not.
* Configure an email address to receive notifications when the
  upgrade returns errors.
* Schedule the automatic reboot time.
* Limit the download speed.
* Log update activity to `syslog`.

`unattended-upgrades` uses `systemd` to schedule the updates:

```
$ cat /lib/systemd/system/apt-daily.timer
[Unit]
Description=Daily apt download activities

[Timer]
OnCalendar=*-*-* 6,18:00
RandomizedDelaySec=12h
Persistent=true

[Install]
WantedBy=timers.target
```

This configuration means that the updates will run every day at
6:00 and 18:00, with a delay of 0 to 12 hours, randomly chosen.
Updating at random times is deliberate. It is a measure taken
so that Ubuntu mirrors are not overwhelmed with requests for
package downloads.
