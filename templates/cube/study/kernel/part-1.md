---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Linux Kernels"
  description: "Linux Kernels"
  auto_paginate: True
---

The Linux kernel is a free and open-source, monolithic, modular,
Unix-like operating system kernel. The Linux kernel is a piece of
software that interacts with hardware and manages concurrent
access to hardware resources like CPU, memory, and disk.

**Open-source:** Linus Torvalds created the [Linux kernel](https://github.com/torvalds/linux) in 1991
and since then, Linus and thousands of other people have been contributing
code to one of the largest collaborative open-source projects to date.

**Monolithic:** The Linux kernel is monolithic and consists of over 20
million lines of code. Kernels can be monolithic or microkernels.
A monolithic kernel means that the whole operating system
works in the same address space as the kernel. By contrast,
microkernels use a plugin architecture where the kernel runs in one
address space, and things like device drivers, protocol stacks, or
filesystems run in separate user-space.

**Modular:** The Linux kernel is modular, meaning that users can load
kernel modules at runtime without recompiling the kernel or
rebooting the server. This speeds up the booting time because the
kernel does not load drivers for hardware that is not in use.
A modular kernel is still a monolithic kernel. Modules are loaded into
the kernel when we need them, and use the kernel address space.
For microkernels, various services are running in the user space, and
performance suffers from increased system function overhead due to
messaging between different address spaces.

## Who Uses Linux Kernels

The Linux kernel runs on more than 90% of the world's top 1 million
servers. Without a doubt, the Linux kernel rules the world of public
internet servers.

What is perhaps less known is that the Linux kernel runs on a wide
range of devices and powers some of the most interesting services:

The Linux kernel runs on:

* Smartphones running the Android operating system
* Smart TVs
* Smart watches
* Self-driving cars
* Submarines
* Airplanes
* Medical devices like vital sign monitors and imaging equipment
* Game consoles
* Smart refrigerators
* Washing machines

The Linux kernel is used by:

* Supercomputers
* The Large Hadron Collider
* NASA, SpaceX, and the International Space Station
* Air traffic controls 
* Train traffic controls like the Japanese Shinkansen 'Bullet Train'
* The New York Stock Exchange
* Google, Twitter, Reddit, Facebook, Instagram, and all major internet services

## Linux Kernel in Ubuntu 20.04

Ubuntu 20.04 LTS runs the 5.4 'Nesting Opossum' Linux kernel.

```
$ uname  -a
Linux deploy 5.4.0-52-generic #57-Ubuntu SMP Thu Oct 15 10:57:00 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```

The Linux kernel 5.4 in Ubuntu 20.04 brings support for:

* New CPUs, GPUs, and other new hardware.
* Significant power-saving improvements.
* New ZFS features.
* A shorter booting time by changing compression algorithms for the kernel and initramfs.

To see a complete list of kernel-related features in Ubuntu 20.04,
refer to the [Release Notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes#Linux_Kernel).
