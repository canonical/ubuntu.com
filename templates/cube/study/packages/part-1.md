---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Installation and Package Management"
  description: "Installation and Package Management"
  auto_paginate: True
---

In Ubuntu, there are two primary means of installing, upgrading, and
removing software:

1. [Debian packages](https://packages.debian.org) are binary packages
   using a management framework that Ubuntu inherits from the
   [Debian Project](https://www.debian.org/), a free GNU/Linux operating
   system distribution.

2. [Snaps](https://snapcraft.io/) are a packaging format that is
   specific to Ubuntu.

In this section, we will explore both package types, starting with the
Debian package format.


## What is a Debian Package?

A Debian package is a `.deb` file that contains the packaged
application, and a machine-readable set of instructions to install it.

A `.deb` file contains two compressed `tar` archives:

* One that contains the control information (the installation
  instruction set).
* One that contains the data to be installed.

The two archives are wrapped in *another* archive, using the
`ar` archive format. As such, you can unpack the contents of any `.deb` file with the `ar` utility.
Consider the following example (from the
[`cmatrix`](https://packages.ubuntu.com/bionic/cmatrix) package):

```
$ ar xv cmatrix_2.0-2_amd64.deb
x - debian-binary
x - control.tar.xz
x - data.tar.xz
```

The control information is used by the `dpkg` utility (and its
higher-level companion, `apt`) to manage the package.

The information in the control file describes the source package,
supported architecture, the maintainer of the package, and the
dependencies needed to install the package, among other critical
information.

It can look like this:

```
$ cat control
Package: cmatrix
Version: 2.0-2
Architecture: amd64
Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>
Original-Maintainer: Boyuan Yang <byang@debian.org>
Installed-Size: 51
Depends: libc6 (>= 2.4), libncurses6 (>= 6), libtinfo6 (>= 6)
Recommends: kbd
Suggests: cmatrix-xfont
Section: misc
Priority: optional
Homepage: https://github.com/abishekvashok/cmatrix
Description: simulates the display from "The Matrix"
 Screen saver for the terminal based in the movie "The Matrix". It works in
 terminals of all dimensions and have the following features:
  * Support terminal resize.
  * Screen saver mode: any key closes it.
  * Selectable color.
  * Change text scroll rate.
```

Unless you are a developer looking to create your own Debian packages
(for either Debian, or Ubuntu), chances are that you will never create
or even modify a **control** file. But it is important to understand
that this file contains everything that the package needs to tell the
system about which other packages it depends on (`Depends:`), which it
recommends you install alongside it (`Recommends:`), what system
architecture it depends on (`Architecture:`), and so on.

Most of the time, you will not even need to *look* at the **control** file
directly, because there are plenty of low-level and high-level package
management tools that parse and index the package’s information, so
that you can query and search it.

## What is a Snap Package?

A snap package is a `.snap` file. Unlike a `.deb` package, which is
a bunch of files in an archive, a `.snap` is a containerized software
package with bundled dependencies for all major Linux systems.  Rather
than having to work with one `.deb` *per* system architecture, we
have one `.snap` for *all* system architectures.  The `.snap` file
format, and its deployment tool `snappy`, were developed by Canonical.

The `.snap` file is a compressed file system, based on
`Squashfs`, as shown in the following example.

```
$ snap download certbot
Fetching snap "certbot"
Fetching assertions for "certbot"
Install the snap with:
   snap ack certbot_652.assert
   snap install certbot_652.snap
ubuntu@deploy:~$ file certbot_652.snap 
certbot_652.snap: Squashfs filesystem, little endian, version 1024.0, compressed, 4026208179854508032 bytes, -1978007552 inodes, blocksize: 512 bytes, created: Mon Oct 26 23:16:47 1992
```

When you install a `.snap` file to a system, the `snappy` daemon
mounts its Squashfs filesystem, read-only, to `/snap/<snap
name>/<revision>/`.

```
$ df -h | grep -i certbot
/dev/loop4            48M   48M     0 100% /snap/certbot/652
```

The snap system then interprets the metadata associated with the snap
in order to set up a secure sandbox or container for the application.
