---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Package Management with Snap"
  description: "Package Management with Snap"
  auto_paginate: True
---

Snap is a package manager developed by Canonical that consists of
packages, called `snaps`, and the tool that deploys and manages them,
`snapd`.

We can install applications from `snaps` on all major Linux
distributions, like Ubuntu, Debian, Fedora, and Linux Mint.

Starting with Ubuntu 20.04 LTS Focal Fossa, Snap is the default package
manager.


## What is a `snap` ?

`snaps` are containerized applications that include required libraries
and a strict control to the host system. In Linux, libraries are shared
and used by many applications. If a library is not supported anymore,
we need to manually install it for an application to work. Snaps
solve problems that derive from building applications for
different Linux distributions and different system setups that use different
versions of shared libraries. This means we can install the same
Snap package on different Linux distributions.

When we install a Snap package, `snapd` downloads an immutable
`squashfs` file system, and mounts it on a loop device.

```
$ df -hT | grep snap | grep snap
/dev/loop0          squashfs   55M   55M     0 100% /snap/core18/1705
/dev/loop1          squashfs   28M   28M     0 100% /snap/snapd/7264
/dev/loop2          squashfs   69M   69M     0 100% /snap/lxd/14804
/dev/loop3          squashfs   61M   61M     0 100% /snap/core20/634
/dev/loop4          squashfs   56M   56M     0 100% /snap/core18/1932
/dev/loop5          squashfs   31M   31M     0 100% /snap/snapd/9721
/dev/loop6          squashfs   70M   70M     0 100% /snap/lxd/18402
/dev/loop7          squashfs   48M   48M     0 100% /snap/certbot/652

```

The `snap install` command download snaps from
[https://snapcraft.io](https://snapcraft.io).

Snaps can be installed either using the command line or GUI tools like
Snap Store.


## `snap` Commands

The `snap` command provides means of listing, installing, updating,
and removing snaps:

```
$ sudo snap install certbot --classic 
certbot 1.9.0 from Certbot Project (certbot-eff✓) installed
```

```
$ sudo snap refresh certbot
snap "certbot" has no updates available
```

```
$ sudo snap remove certbot
certbot removed
```

If we need to install a snap offline, we can download it from the
Snap Store, transfer it to the target server, and install it:

```
$ sudo snap download chuck-norris-webserver
Fetching snap "chuck-norris-webserver"
Fetching assertions for "chuck-norris-webserver"
Install the snap with:
   snap ack chuck-norris-webserver_16.assert
   snap install chuck-norris-webserver_16.snap
```

```
$ sudo snap install chuck-norris-webserver_16.snap
chuck-norris-webserver 1.0.0 from Didier Roche (didrocks) installed

```


We can use the `snap find` command to search for applications. The
command does a text search through snap names and descriptions
that match the provided string:

```
$ snap find certificate
Name                            Version            Publisher      Notes    Summary
stunnel5                        5.50               lizhengyong    -        stunnel is an open-source multi-platform application used to provide a universal TLS/SSL tunneling service.
ora                             2.5.7              ora-pm✓        -        Ora - your team's command center! (project management & task management software)
certbot                         1.9.0              certbot-eff✓   classic  Automatically configure HTTPS using Let's Encrypt
axeman                          0+git.37e444b      kz6fittycent   -        Axeman is a utility for downloading, parsing, and storing CTL's
certstream                      1.9                kz6fittycent   -        Certstream-Python
etcd-manager                    1.2.0              jozsefszalai   -        Free, multi-platform ETCD client with a modern UI
awsiot                          0.1                mectors        -        Automatically register your device with AWS IoT.
nebula                          v1.3.0             jocke-wallden  -        A scalable overlay networking tool.
h2static                        2.2.1              ack            -        Tiny static web server with TLS and HTTP/2 support
smithproxy                      0.9.6-3            astibal        -        Fast and featured transparent TCP/UDP/TLS proxy
jimbodicomviewer                2.0                axel           -        Visualization of DICOM images - 2D and 3D tools
creativecoin                    master             creativechain  -        Distributed content ledger. The blockchain of media content.
ausweisapp2-ce                  1.20.2             glasen         -        AusweisApp2-CE - Tool for the german nPA (Community Edition)
thelounge                       4.2.0              snapcrafters   -        The Lounge — Self-hosted web IRC client
canonical-certification-server  0.1.3dev           bladernr       -        Server Hardware Certification Suite Snap
acme-sh                         2.8.7              joachimmg      -        An ACME Shell script: acme.sh
submission-service              1.1                codersquid     -        Submission Service for accepting Checkbox results
quickcerts                      1.0.0              snawoot        -        Quick and easy X.509 certificate generator for SSL/TLS utilizing local PKI.
https-forward                   0+git.4f96195      samthor        -        A forwarding HTTPS server using Let's Encrypt
tomcat-with-ssl                 0.1                bsuttton       -        Apache Tomcat with SSL activated and managed by Certbot.
monolith                        v2.2.6             popey          -        Monolith - Save HTML pages with ease
demo-curl                       7.47.0-1ubuntu2.1  woodrow        -        command line tool for transferring data with URL syntax
ols-arcus                       0.1                suligap        -        A lightweight caching proxy for the Snap Store
step-stephenmuss                0.13.3             stephenmuss    -        A zero trust swiss army knife for working with X509, OAuth, JWT, OATH OTP, etc
passprox                        2.0.1              nsg            -        The proxy HAProxy inside a snap
```

The `snap info` command provides detailed information about snaps.
This command looks for information both in the snap store and among
the already installed snaps.

```
$ snap info  chuck-norris-webserver
name:      chuck-norris-webserver
summary:   Chuck Norris quotation nodejs server
publisher: Didier Roche (didrocks)
store-url: https://snapcraft.io/chuck-norris-webserver
contact:   didrocks@ubuntu.com
license:   MIT
description: |
  This example shows how to build a nodejs web server. This enables us to
  demonstrate how service works, basic confinement rules to access and listen
  on the network, as well as the nodejs snapcraft plugin.
snap-id: RSkUCyMddodcbSBQxZdYQJmqfG3aPlpC
channels:
  latest/stable:    1.0.0 2017-05-17 (16) 10MB -
  latest/candidate: ↑
  latest/beta:      ↑
  latest/edge:      1.0.0 2017-05-17 (10) 10MB -
```

## Configuration

`snapd` uses `systemd` in its internal workings.

If a service is installed from a snap, we can check its configuration
the same way we do for any `systemd` managed service:

```
$ systemctl cat snap.certbot.renew.service 
# /etc/systemd/system/snap.certbot.renew.service
[Unit]
# Auto-generated, DO NOT EDIT
Description=Service for snap application certbot.renew
Requires=snap-certbot-652.mount
Wants=network.target
After=snap-certbot-652.mount network.target snapd.apparmor.service
X-Snappy=yes

[Service]
EnvironmentFile=-/etc/environment
ExecStart=/usr/bin/snap run --timer="00:00~24:00/2" certbot.renew
SyslogIdentifier=certbot.renew
Restart=no
WorkingDirectory=/var/snap/certbot/652
TimeoutStopSec=30
Type=oneshot

[Install]
WantedBy=multi-user.target
```

If we want to restart a service that was installed from a snap, we can
do it from `systemd` by specifying its name:

```
$ systemctl status  snap.certbot.renew.service 
● snap.certbot.renew.service - Service for snap application certbot.renew
     Loaded: loaded (/etc/systemd/system/snap.certbot.renew.service; disabled; vendor preset: enable>
     Active: inactive (dead) since Thu 2020-11-26 14:28:45 UTC; 17min ago
TriggeredBy: ● snap.certbot.renew.timer
   Main PID: 52499 (code=exited, status=0/SUCCESS)
```

We can restart services installed from snaps with a `snap` command as well:

```
$ sudo snap restart chuck-norris-webserver.node-service 
Restarted.
```
