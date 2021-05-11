---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Administrative Tasks"
  description: "Administrative Tasks"
  auto_paginate: True
---

Administrative tasks can be considered the sysadmin's chores. They are routine but
necessary duties to ensure the continuous functioning of hardware
and software assets that services run on.

Ideally, sysadmins should automate most of the administrative tasks
they are responsible for. Automation saves time, ensures consistency
of changes, and prevents downtime caused by human error. In addition,
automation enables you to rapidly deploy important security patches.

The time it takes to log in to each of a hundred servers and run manually
a command to apply a security patch, compared to running one shell
script to apply the same patch to a hundred servers, differs significantly.

Many automation tools like Juju, Ansible, SaltStack, Puppet, or Chef
can easily automate running administrative tasks.

Failure to perform administrative tasks can have severe consequences
like service downtime, data loss if backups are not available,
or customer data compromise if the systems are not updated with security
patches.

Linux administrative tasks include the following:

* Installation and configuration of Linux systems
* Update and upgrade of Linux systems
* User management
* Backup management
* System monitoring
* Certificate renewal
* Log audits
* Documentation

In the next sections, we will dive deeper into what each of these
duties mean.
