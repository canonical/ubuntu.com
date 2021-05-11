---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Security"
  description: "Security"
  auto_paginate: True
---

Computer security means protecting computer systems and networks from theft or damage
to their hardware, software, and the data they handle.
A security administrator specializes in system and network security,
and is the person who designs and implements a security plan.

## Hardware

A security administrator must ensure that persons with unauthorized
access cannot tamper with hardware resources. Physical access
to hardware resources like servers, switches, and routers must be
restricted and monitored.
A security admin must limit the number of ways people can
access a physical perimeter where servers and network resources are
located. This means limiting the number of doors and windows to the
server room.
A security admin must control and limit the number of individuals
that have physical access to the servers' enclosures. This
means limiting the number of issued access cards, making sure that
access cards cannot be borrowed, and having procedures in place to
quickly remove access for people that are no longer employees or
contracted consultants.

A monitoring system with video cameras that record access to the
physical resources helps, as one can rewind and check who
accessed the hardware days after it occurred.

We can use tamper seals with serial numbers to lock the back and front
doors on server racks, so that when someone needs to replace a hard
disk, for example, the seal is broken and later replaced with one
with a new serial number. This way, we can track access per server
rack.

One important aspect that we need to consider is decommissioning
hardware. When a disk or a server is removed from a data center, we
must ensure that all data residing on that piece of hardware has
been wiped or destroyed. Failure to do so might result in breaking
data protection laws should an unauthorized person gain access to
data stored on the decommissioned device.

## Software

A security admin must make sure that the software running on servers
and other networking resources is patched with the latest security
patches. To quickly roll out security patches, an
automated system must be in place that quickly and reliably patches systems
as soon as a new security update is available.

Automatic updates should be enabled within reasonable grounds. It
might not be acceptable to restart systems whenever an update requires
it without thorough planning; otherwise, it risks traffic
downtime or other unwanted outcomes.

Access to servers, if allowed, should use encrypted protocols
like SSH, and users should log in using SSH keys instead of passwords.

A security admin should define a firewall, which is a set of rules
used to filter and control network traffic to the servers and network
resources they manage.

If some services use passwords, a security admin should define and
enforce password policies. A security admin might have to evaluate whether
they need to change a database root password, for example.

## Data

A security admin must take special measures to protect data in transit,
which is data moving from one server to another, as well as data
at rest, which is data stored in a fixed location, like a database,
filesystem, or physical disk.

If we want to protect data in transit, communication between servers should be
encrypted, primarily if the communication occurs between API endpoints
hosted on a server that we control and the public internet.
A security admin must evaluate and decide which communication must be
encrypted.

Data at rest should be encrypted using strong encryption algorithms
like AES or RSA. Multiple levels of encryption can be used. We can
encrypt that data stored in a database, as well as the storage
blocks where the database is stored.

The following section provides some examples on how to secure a server running
an Ubuntu Linux distribution.
