---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "System Services"
  description: "System Services"
  auto_paginate: True
---

On an Ubuntu system, a *service* is a process that runs,
permanently, in the background. It normally does not rely on user
interaction from the command line or graphical user
interface. However, it may provide a user-facing endpoint, such as a
website, or an application programming interface (API) that other
services (running on the same server or another) can programmatically
interact with.

## init

On any operating system that traces its lineage to Unix, there is a
single process that is responsible for managing all other
services. This is the 'initial' process that is first started by the
kernel on system boot, and as such is called `init`. Throughout the
history of Unix and similar operating systems (including Linux), there
have been several implementations of `init`:

* **SysV init** (pronounced 'sys-five init') is named after AT&T Unix
  System V (although it was originally introduced in its predecessor, System
  III). Since its introduction in 1982, variants of this init system dominated
  Unix-like systems (including Linux) for over 25 years.

* **BSD init** is named after the Berkeley Software Distribution
  (BSD). It continues to be used by BSD’s descendants, such as
  FreeBSD, but has no relevance for Linux systems.

* **[Upstart](http://upstart.ubuntu.com/)** was a project to modernise
  Linux process and service management, first introduced in the Ubuntu
  6.04 release in 2006. It is no longer used in Ubuntu, and its final
  release was in 2014.

* **[systemd](https://www.freedesktop.org/wiki/Software/systemd/)** is
  the contemporary default `init` on most Linux platforms, including
  Ubuntu. Its principal creators are Lennart Poettering and Kay
  Sievers, but systemd is a large community project with over 1,000
  contributors in total. It is geared towards supporting Linux
  alone, and considers other Unix-like platforms to be out of its
  project scope.
  
* **[OpenRC](https://wiki.gentoo.org/wiki/OpenRC)** is an init system
  that, unlike systemd, aims to be portable between Linux and several
  BSD-type Unix flavours. It is currently used as the default init
  system on Gentoo and Alpine Linux, among others.

* **[Busybox](https://busybox.net/)** is a small, statically linked
  binary that can provide a minimal `init` process and some system
  utilities, and is widely used in resource-constrained embedded
  systems.

What all these init systems have in common is that they are the root
of the process hierarchy on a system. `init` is the parent of all
other processes running on the system, and usually runs with a process
ID (PID) of 1. (This is why we often refer to the `init` process as
'PID one'.) As such, we are able to manage services through
interaction with the facilities that the `init` process provides.

In the remainder of this section, we will focus exclusively on
**systemd** as a service management facility. For additional
information on the background and architecture behind systemd,
refer to its [official
documentation](https://www.freedesktop.org/wiki/Software/systemd/),
particularly its extensive
[manpages](https://www.freedesktop.org/software/systemd/man/). The
latter are also available on any Ubuntu system, and you may access
them from your terminal with a command like:

```bash
man init
```
