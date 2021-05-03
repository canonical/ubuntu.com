---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Virtualisation"
  description: "Virtualisation"
  auto_paginate: True
---

Virtualisation means creating and using virtual computing resources
that imitate physical resources.
For example, we can imitate a physical Network Interface Card (NIC) using
a software virtual network interface that appears and acts as a
physical NIC.

*Hardware virtualisation* means creating Virtual Machines (VMs) that
run on top of physical machines.

*Container virtualisation* means creating virtual runtime environments
on top of an operating system that runs on a physical machine or a VM.

Virtualisation allows better utilization of
resources like CPU, memory, disk, and networking. Virtualisation comes
with flexibility too. We can create and configure VMs and containers
much more quickly than we can install and configure physical machines.

In this chapter, we will cover KVM and the LXD container manager.

* Kernel-Based Virtual Machine (KVM) is a Linux kernel module that enables the Linux kernel to act like
  a hypervisor.
* LXD is a container manager for LXC containers.
