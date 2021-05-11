---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Juju Architecture"
  description: "Juju Architecture"
  auto_paginate: True
---

Juju reduces operational overhead because it uses operation
and integration code that can be reused, regardless of whether it is run on
different hardware, different architectures, or at different scales.

The main components of Juju's architecture are:

* **Clouds** are environments made of virtual instances like VMs or LXC/LXD
  containers. These resources can be hosted in private or public clouds.
* **Controllers** are the management nodes for the Juju clouds. They
  keep the state of all the machines, models, and applications running, in
  a database. Controllers run the API server and interface with the
  Juju CLI and web UI.
* **Machines** are instances hosted in private or public
  clouds. Machines can be physical hardware, VMs or LXC/LXD containers. Juju installs
  the operating system and software applications to machines.
* **Models** are environments used to manage applications. The model
  configuration influences the applications linked to it. If the
  Juju model defines the `apt-mirror` to be `de.archive.ubuntu.com`,
  all the machines and applications linked to that model will use
  the `apt-mirror` defined by the model.
* **Charms** are structured sets of scripts and YAML files that simplify both the
  deployment and management of the charm’s application within Juju.
* **Bundles** are collections of charms that help deploy and
  start a service in one go.
* **Relations** are mappings between applications that define which
  application endpoints should talk to each other.

Juju can be accessed using its CLI or the Juju web UI.
