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
  meta_copydoc: https://docs.google.com/document/d/1i8gWYTZdJbh8OKm_OO9pVCx1o4_JVaEtr4XN5F4eWNU/edit?tab=t.0
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

<h2> System container manager and API</h2>

<h3 class="p-heading--4">LXD is a system container manager</h3>

With LXD you can run hundreds of containers of a variety of Linux distributions, apply resource limits, pass in directories, USB devices or GPUs and setup any network and storage you want.

LXD containers are lightweight, secure by default and a great alternative to running Linux virtual machines.

<h3 class="p-heading--4">Run any Linux distribution you want</h3>

Pre-made images are available for Ubuntu, Alpine Linux, ArchLinux, CentOS, Debian, Fedora, Gentoo, OpenSUSE and more.

<hr class="p-rule--muted" />
<a href="https://images.linuxcontainers.org">View a full list of available images&nbsp;&rsaquo;</a>

<br />
Can't find the distribution you want? It's easy to make your own images too, either using our distrobuilder tool or by assembling your own image tarball by hand.

<h3 class="p-heading--4">Containers at scale</h3>

LXD is network aware and all interactions go through a simple REST API, making it possible to remotely interact with containers on remote systems, copying and moving them as you wish.

Want to go big? LXD also has built-in clustering support, letting you turn dozens of servers into one big LXD server.

<h3 class="p-heading--4">Configuration options</h3>

Supported options for the LXD snap (`snap set lxd KEY=VALUE`):

<ul class="p-list--divided">
  <li class="p-list__item has-bullet"><code>ceph.builtin</code>: Use snap-specific ceph configuration [default=false]</li>
  <li class="p-list__item has-bullet"><code>criu.enable</code>: Enable experimental live-migration support [default=false]</li>
  <li class="p-list__item has-bullet"><code>daemon.debug</code>: Increases logging to debug level [default=false]</li>
  <li class="p-list__item has-bullet"><code>daemon.group</code>: Group of users that can interact with LXD [default=lxd]</li>
  <li class="p-list__item has-bullet"><code>daemon.preseed</code>: A YAML configuration to feed `lxd init` on initial start</li>
  <li class="p-list__item has-bullet"><code>lxcfs.pidfd</code>: Start per-container process tracking [default=false]</li>
  <li class="p-list__item has-bullet"><code>lxcfs.loadavg</code>: Start tracking per-container load average [default=false]</li>
  <li class="p-list__item has-bullet"><code>lxcfs.cfs</code>: Consider CPU shares for CPU usage [default=false]</li>
  <li class="p-list__item has-bullet"><code>openvswitch.builtin</code>: Run a snap-specific OVS daemon [default=false]</li>
  <li class="p-list__item has-bullet"><code>shiftfs.enable</code>: Enable shiftfs support [default=auto]</li>
</ul>
