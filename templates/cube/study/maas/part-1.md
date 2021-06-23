---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Introduction"
  description: "Introduction"
  auto_paginate: True
---

Metal As A Service (MAAS) is an open-source provisioning tool
developed by Canonical. MAAS provisions bare-metal servers and VMs
if they are set up to PXE-boot from the network.

MAAS can build a data center in one go. It can discover, commission,
deploy, and reconfigure a large number of physical machines, all at
once.

MAAS can be configured as a PXE boot server. It then uses images to
deploy the operating system to physical machines, thus making
deployment very fast. You can use MAAS to do all sorts of hardware-related
configurations. It can configure the disk layout, network
interface bonding, and VLAN tagging. Instead of configuring each machine
by accessing its BIOS settings, you can use MAAS to set up
LVMs, software RAID, or the partitioning schemas.

MAAS is easy to manage via its CLI and web UI.

MAAS can be installed from a snap, and it uses a PostgreSQL database to
store all state information. The PostgreSQL database HA configuration is
outside of MAAS's scope, but for a smaller setup, we can install a
PostgreSQL database from a snap called `maas-test-db`.

MAAS documentation and tutorials are available at
[https://maas.io](https://maas.io).
