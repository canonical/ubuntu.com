---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "System Architecture"
  description: "System Architecture"
  auto_paginate: True
---

System architecture defines the structure of a system, comprising its
components and subcomponents.

The Linux system architecture's main components are:

* User applications.
* System services.
* Hardware abstraction layer.
* Linux kernel.

*User applications* are computer programs that carry out user
needs.

*System services* are services that initialize a system and manage
other services. For example, `dbus` is a system service.

The *hardware abstraction layer* allows the operating system to
interact with physical or virtual hardware devices.

The *Linux kernel* is the main component of the Linux operating system. It is the engine that makes hardware and software  work together.

In this chapter, we will review ways to determine the hardware and
software components of a system.

We have separate, dedicated chapters for the Linux kernel and
system services later in this course.
