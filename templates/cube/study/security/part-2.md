---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Securing a Server – Basic Steps"
  description: "Securing a Server – Basic Steps"
  auto_paginate: True
---

Ubuntu 20.4 LTS Focal Fossa comes with several security enhancements.
For example, it uses the 5.4 Linux kernel that supports kernel
lockdown mode, which restricts root access to parts of the kernel
or built-in support for WireGuard VPN client. For more
details, see the [Ubuntu 20.04 LTS Release Notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes).

We will now look into some basic steps we can take to secure
an Ubuntu server installation. These assume that you have freshly
installed an Ubuntu server on a bare-metal machine, or that you
spun up a VM running Ubuntu Server.

The first step is to update and upgrade all the packages installed
on the server. This can be done easily with the following command:

```bash
sudo apt update && sudo apt upgrade -y
```

Then, if we want to install the latest security patches automatically,
we can re-configure the `unattended-upgrades` service, which comes
pre-installed on Ubuntu Server 20.04 LTS.

Have a look at the **/etc/apt/apt.conf.d/50unattended-upgrades** file and
search for the word 'security'.

The `unattended-upgrades` service is enabled by default. Security
updates are enabled, as well:

```bash
ubuntu@deploy:~$ systemctl status unattended-upgrades.service 
● unattended-upgrades.service - Unattended Upgrades Shutdown
     Loaded: loaded (/lib/systemd/system/unattended-upgrades.service; enabled; vendor preset:>
     Active: active (running) since Mon 2020-11-02 21:43:01 UTC; 8min ago
       Docs: man:unattended-upgrade(8)
   Main PID: 833 (unattended-upgr)
      Tasks: 2 (limit: 19175)
     Memory: 11.9M
     CGroup: /system.slice/unattended-upgrades.service
             └─833 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown>
```

We assume that we will need to connect to this newly installed Ubuntu
server using the SSH protocol.
The good news is that the `ssh` service comes with some hardened
default configuration settings. For example, password authentication is disabled
in favor of using SSH keys.
A good practice is to change the default port the `ssh` service runs on
(22) to something of your choice (for example, 11122).

We probably want to restrict the access to the server we newly
installed.

Ubuntu 20.04 LTS comes with a default firewall installed:
`ufw`, or 'uncomplicated firewall'.
If we want to add a firewall rule to allow SSH access to port
11122, we need to edit **/etc/ufw/applications.d/openssh-server**
and change port 22 to 11122.

```
[OpenSSH]
title=Secure shell server, an rshd replacement
description=OpenSSH is a free implementation of the Secure Shell protocol.
ports=11122/tcp
```

Then, we can add the following rules:

```
$ sudo ufw default deny incoming
$ sudo ufw allow from 80.80.80.80 to any app OpenSSH
```

We deny all incoming traffic by default and allow access to the
port we configured for the `ssh` service from the `80.80.80.80` IP
address.

As a final basic security step, we might want to list all the
ports open on our server and make sure that we did not forget services
exposed unintentionally.

```bash
ubuntu@deploy:~$ sudo lsof -i -P -n | grep LISTEN
systemd-r  647 systemd-resolve   13u  IPv4  18877      0t0  TCP 127.0.0.53:53 (LISTEN)
sshd       772            root    3u  IPv4  21262      0t0  TCP *:22 (LISTEN)
sshd       772            root    4u  IPv6  21264      0t0  TCP *:22 (LISTEN)
apache2    818            root    4u  IPv6  21405      0t0  TCP *:80 (LISTEN)
apache2    819        www-data    4u  IPv6  21405      0t0  TCP *:80 (LISTEN)
apache2    820        www-data    4u  IPv6  21405      0t0  TCP *:80 (LISTEN)
dnsmasq   1040 libvirt-dnsmasq    6u  IPv4  26810      0t0  TCP 192.168.123.1:53 (LISTEN)
```
