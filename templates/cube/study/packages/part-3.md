---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Package Management with APT"
  description: "Package Management with APT"
  auto_paginate: True
---

Ubuntu is based on Debian, and Debian uses a set of tools called APT
(Advanced Package Tool) to manage packages.

APT front-ends interact with APT to search, install, upgrade, and
remove packages. Examples of APT front-ends are:

* Command-line tools: `apt`, `apt-get`, `apt-cache`
* GUI tools: Ubuntu Software Center, GDebi, Synaptic

## What is `apt`?

APT uses `dpkg` to install, upgrade, and remove packages. As a
practice, Linux users do not manage packages by interacting directly
with the `dpkg` tool, at least not anymore. Instead, they use
command line tools like `apt`.

`apt` abstracts complicated details away from the user by automating the
retrieval, configuration, and installation of Debian packages. The
`apt` command-line tool targets the Linux user who needs to run
recurrent package management operations, without going too
low-level. Such recurrent operations are to install, upgrade, remove,
and search packages.

Before `apt` existed, `apt-get` and `apt-cache` were the command-line
tools used to manage Debian packages via the APT interface. `apt-get`
and `apt-cache` are rich in functionality, and have many options
available. They are considered too advanced for the average Linux
user. The need for yet another APT command-line tool came from
wanting to give the users a more structured command. `apt` brings
together the most significant functionalities of `apt-get` and `apt-cache`.

Examples of `apt-get` and `apt-cache` options incorporated in `apt`
are:

* `apt-get install` is available in `apt install`.
* `apt-get remove` is available in `apt remove`.
* `apt-get purge` is available in `apt purge`.
* `apt-get update` is available in `apt update`.
* `apt-get upgrade` is available in `apt upgrade`.
* `apt-cache search` is available in `apt search`.
* `apt-cache show` is available in `apt show`.

`apt` comes with its own options, too, such as:

* `apt list`
* `apt edit-sources`

Note that there is currently no intention for `apt` to displace
`apt-get` and `apt-cache`. The latter two commands will still be
available for the users that need to perform low-level operations.

## How Does `apt` Work?

`apt` uses the software repositories listed in the
**/etc/apt/sources.list** configuration file (and `.list` files in its
companion directory, **/etc/apt/sources.list.d**) to download packages.
A software repository can be an online storage location from which
packages are retrieved, but it can also be a local directory or a
CD/DVD.

Once the Ubuntu operating system is installed, the first thing to do
is to run `sudo apt update` to update the packages list to the newest
versions.

Once this command has updated the package database located in
**/var/lib/apt/lists/**, as a consequence of running the update command,
the next step is to upgrade using the `sudo apt upgrade` command.

The following printout shows which packages are going to be upgraded:

```
$ sudo apt upgrade
Reading package lists... Done
Building dependency tree
Reading state information... Done
Calculating upgrade... Done
The following packages will be upgraded:
  apache2 apache2-bin apache2-data apache2-utils apport apt apt-utils bind9-host bsdutils dnsutils e2fsprogs fdisk grub-common grub-pc grub-pc-bin
  grub2-common irqbalance kmod landscape-common libapt-inst2.0 libapt-pkg5.0 libbind9-160 libblkid1 libcom-err2 libcups2 libcupsimage2
  libdns-export1100 libdns1100 libdrm-common libdrm2 libext2fs2 libfdisk1 libglib2.0-0 libglib2.0-data libirs160 libisc-export169 libisc169
  libisccc160 libisccfg160 libkmod2 libldap-2.4-2 libldap-common liblwres160 liblxc-common liblxc1 libmount1 libnss-systemd libpam-systemd
  libparted2 libpython3-stdlib libpython3.6 libpython3.6-minimal libpython3.6-stdlib libsmartcols1 libss2 libsystemd0 libudev1 libuuid1
  linux-firmware lxcfs lxd lxd-client mount open-iscsi open-vm-tools parted psmisc python-apt-common python3 python3-apport python3-apt
  python3-distupgrade python3-gdbm python3-minimal python3-problem-report python3-software-properties python3-update-manager python3.6
  python3.6-minimal snapd software-properties-common sosreport systemd systemd-sysv tar tmux ubuntu-keyring ubuntu-release-upgrader-core udev
  unattended-upgrades update-manager-core update-notifier-common util-linux uuid-runtime
94 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
Need to get 115 MB of archives.
After this operation, 14.1 MB of additional disk space will be used.
Do you want to continue? [Y/n]
```

Alternatively, you may use the command `sudo apt full-upgrade`. This
will upgrade all the packages, but it will also remove currently
installed packages if this is needed to upgrade the system as a whole.

**Note**: Running `sudo apt update` does not update or upgrade any
*packages.* It only updates the database (file) containing
information about available packages. `sudo apt upgrade` upgrades
the actual packages.

To install a new package using `apt` is as easy as running `sudo apt
install package_name`. Autocompletion is available, so we only need to
partially specify the name of the package.

```
$ sudo apt install cmatrix
Reading package lists... Done
Building dependency tree       
Reading state information... Done
Suggested packages:
  cmatrix-xfont
The following NEW packages will be installed:
  cmatrix
0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
Need to get 17.2 kB of archives.
After this operation, 52.2 kB of additional disk space will be used.
Get:1 http://de.archive.ubuntu.com/ubuntu focal/universe amd64 cmatrix amd64 2.0-2 [17.2 kB]
Fetched 17.2 kB in 9s (1836 B/s)
Selecting previously unselected package cmatrix.
(Reading database ... 123007 files and directories currently installed.)
Preparing to unpack .../cmatrix_2.0-2_amd64.deb ...
Unpacking cmatrix (2.0-2) ...
Setting up cmatrix (2.0-2) ...
Processing triggers for mime-support (3.64ubuntu1) ...
Processing triggers for man-db (2.9.1-1) ...
```

To install more than one package at a time, we can enumerate several
packages in one command:

```
$ sudo apt install cmatrix tree curl certbot
```

To install a specific version of a package, we can run:

```
$ sudo apt install curl=7.68.0-1ubuntu2.2
```

To remove a package, we use `sudo apt remove package_name`:

```
$ sudo apt remove cmatrix
```

We can add the `-y` option to answer `Yes` automatically when
installing or removing a package.

We can use `sudo apt purge package_name` to remove the package
together with its configuration files:

```
$ sudo apt purge cmatrix
```

The `sudo apt search` and `sudo apt show` commands are useful when we
need to search for a package and see its content:

```
$ sudo apt search cmatrix
Sorting... Done
Full Text Search... Done
cmatrix/bionic,now 1.2a-5build3 amd64 [installed]
  simulates the display from "The Matrix"

cmatrix-xfont/bionic,bionic 1.2a-5build3 all
  X11 font for cmatrix

libnewmat10-dev/bionic 1.10.4-6 amd64
  matrix manipulations library (C++ headers files)

libnewmat10ldbl/bionic 1.10.4-6 amd64
  matrix manipulations library (C++)

$ sudo apt show cmatrix
Package: cmatrix
Version: 1.2a-5build3
Priority: optional
Section: universe/misc
Origin: Ubuntu
Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>
Original-Maintainer: Diego Fernández Durán <diego@goedi.net>
Bugs: https://bugs.launchpad.net/ubuntu/+filebug
Installed-Size: 49,2 kB
Depends: libc6 (>= 2.4), libncurses5 (>= 6), libtinfo5 (>= 6)
Recommends: kbd
Suggests: cmatrix-xfont
Homepage: http://www.asty.org/cmatrix/
Download-Size: 16,1 kB
APT-Manual-Installed: yes
APT-Sources: http://se.archive.ubuntu.com/ubuntu bionic/universe amd64 Packages
Description: simulates the display from "The Matrix"
 Screen saver for the terminal based in the movie "The Matrix". It works in
 terminals of all dimensions and have the following features:
  * Support terminal resize.
  * Screen saver mode: any key closes it.
  * Selectable color.
  * Change text scroll rate.
```

To list all the installed packages, we can run `apt list --installed`:

```
$ apt list --installed
Listing...
accountsservice/focal-updates,focal-security,now 0.6.55-0ubuntu12~20.04.4 amd64 [installed,automatic]
acl/focal,now 2.2.53-6 amd64 [installed,automatic]
adduser/focal,now 3.118ubuntu2 all [installed,automatic]
adwaita-icon-theme/focal-updates,now 3.36.1-2ubuntu0.20.04.2 all [installed,automatic]
alsa-topology-conf/focal,now 1.2.2-1 all [installed,automatic]
alsa-ucm-conf/focal-updates,now 1.2.2-1ubuntu0.5 all [installed,automatic]
apache2-bin/focal-updates,focal-security,now 2.4.41-4ubuntu3.1 amd64 [installed,automatic]
apache2-data/focal-updates,focal-security,now 2.4.41-4ubuntu3.1 all [installed,automatic]
apache2-utils/focal-updates,focal-security,now 2.4.41-4ubuntu3.1 amd64 [installed,automatic]
[...]
xauth/focal,now 1:1.1-0ubuntu1 amd64 [installed,automatic]
xdg-user-dirs/focal,now 0.17-2ubuntu1 amd64 [installed,automatic]
xfsprogs/focal,now 5.3.0-1ubuntu2 amd64 [installed]
xkb-data/focal,now 2.29-2 all [installed,automatic]
xxd/focal,now 2:8.1.2269-1ubuntu5 amd64 [installed,automatic]
xz-utils/focal-updates,now 5.2.4-1ubuntu1 amd64 [installed,automatic]
zerofree/focal,now 1.1.1-1 amd64 [installed,automatic]
zfs-zed/focal-updates,now 0.8.3-1ubuntu12.5 amd64 [installed,automatic]
zfsutils-linux/focal-updates,now 0.8.3-1ubuntu12.5 amd64 [installed]
zlib1g/focal-updates,now 1:1.2.11.dfsg-2ubuntu1.2 amd64 [installed,automatic]
```
