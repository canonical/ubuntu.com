---
wrapper_template: "appliance/shared/_base_appliance_index.html"
context:
  name: "LXD"
  short_name: "lxd"
  appliance_name: "LXD"
  company_name: "Canonical"
  logo: "https://assets.ubuntu.com/v1/3a24a2f9-lxd.png"
  category: "Developer"
  meta_description: "With LXD you can run hundreds of containers of a variety of Linux distributions, apply resource limits, pass in directories, USB devices or GPUs and setup any network and storage you want."
  downloads:
    raspberrypi: True
    pc: False
    intelnuc: True
  pi:
    2: False
    3: False
    4: True
  screenshots:
    1: https://dashboard.snapcraft.io/site_media/appmedia/2018/10/Screenshot_from_2018-10-26_12-57-24.png
    2: https://dashboard.snapcraft.io/site_media/appmedia/2018/10/Screenshot_from_2018-10-26_14-20-14.png
    3: https://dashboard.snapcraft.io/site_media/appmedia/2018/10/Screenshot_from_2018-10-26_14-21-43.png
  links:
    1:
      title: "Documentation"
      url: "https://lxd.readthedocs.io"
    2:
      title: "LXD website"
      url: "https://ubuntu.com/lxd"
    3:
      title: "License - Apache-2.0"
      url: "https://www.apache.org/licenses/LICENSE-2.0"
  compliance:
    1: "EU GDPR"
    2: "California law"
  base: "core18"
  published_date: "2020-09-18"
  maintenance_date: "2030-09-18"
  snaps:
    1:
      name: "LXD"
      icon: "https://assets.ubuntu.com/v1/3a24a2f9-lxd.png"
      link: "https://snapcraft.io/lxd"
      publisher: "Canonical"
      channel: "latest/stable"
      version: "4.5"
      published_date: "18 September 2020"
---

### System container manager and API

#### LXD is a system container manager

With LXD you can run hundreds of containers of a variety of Linux distributions, apply resource limits, pass in directories, USB devices or GPUs and setup any network and storage you want.

LXD containers are lightweight, secure by default and a great alternative to running Linux virtual machines.

#### Run any Linux distribution you want

Pre-made images are available for Ubuntu, Alpine Linux, ArchLinux, CentOS, Debian, Fedora, Gentoo, OpenSUSE and more.

A full list of available images can be found here: https://images.linuxcontainers.org

Can't find the distribution you want? It's easy to make your own images too, either using our distrobuilder tool or by assembling your own image tarball by hand.

#### Containers at scale

LXD is network aware and all interactions go through a simple REST API, making it possible to remotely interact with containers on remote systems, copying and moving them as you wish.

Want to go big? LXD also has built-in clustering support, letting you turn dozens of servers into one big LXD server.

#### Configuration options

Supported options for the LXD snap (`snap set lxd KEY=VALUE`):

- `ceph.builtin`: Use snap-specific ceph configuration [default=false]
- `criu.enable`: Enable experimental live-migration support [default=false]
- `daemon.debug`: Increases logging to debug level [default=false]
- `daemon.group`: Group of users that can interact with LXD [default=lxd]
- `daemon.preseed`: A YAML configuration to feed `lxd init` on initial start
- `lxcfs.pidfd`: Start per-container process tracking [default=false]
- `lxcfs.loadavg`: Start tracking per-container load average [default=false]
- `lxcfs.cfs`: Consider CPU shares for CPU usage [default=false]
- `openvswitch.builtin`: Run a snap-specific OVS daemon [default=false]
- `shiftfs.enable`: Enable shiftfs support [default=auto]
