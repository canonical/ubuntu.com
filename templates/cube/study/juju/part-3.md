---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Juju Charms"
  description: "Juju Charms"
  auto_paginate: True
---

Juju uses charms to deploy, scale, integrate, and upgrade applications.

Charms are the software that encapsulates the installation and management of applications. 
Charms are what fuel the Juju engine.
Juju charms are maintained by application experts. They are
consistently reviewed and updated. This way, you can
quickly benefit from bug fixes and new features.

Now let's take a closer look at a charm.

We can take, for example, the PostgreSQL charm, download it
locally to the filesystem, and locate the YAML configuration file
and scripts:

```
ubuntu@daisy:~$ charm pull postgresql  ~/charms/postgresql

ubuntu@daisy:~/charms/postgresql$ ls
LICENSE              copyright.layer-basic        icon.svg          scripts
Makefile             copyright.layer-coordinator  layer.yaml        templates
README.md            copyright.layer-leadership   lib               testing
actions              copyright.layer-nagios       make_docs         tests
actions.yaml         copyright.layer-options      metadata.yaml     tox.ini
bin                  copyright.layer-snap         pydocmd.yml       unit_tests
charm-helpers.yaml   copyright.layer-status       pyproject.toml    version
config.yaml          docs                         reactive          wheelhouse
copyright            files                        requirements.txt  wheelhouse.txt
copyright.layer-apt  hooks                        revision
```

Inside this directory, we find a **config.yaml** file that contains
the configuration for everything that needs to be deployed and configured
to run PostgreSQL. This includes packages and package dependencies,
configuration parameters like backup schedule, manual replications,
integration with services like Nagios, and authentication and
authorization related configuration.

Take a look at the [**config.yaml** for Postgresql](https://github.com/stub42/postgresql-charm/blob/master/config.yaml) yourself.

We can also see a directory called **scripts**, where we can find Python
scripts that can be used during the deployment when hanging transaction
connections need to be cleared, or a database backup is required:

```
ubuntu@daisy:~/charms/postgresql/scripts$ ls
check_latest_ready_wal.py  pgbackup.py
find_latest_ready_wal.py   pgkillidle.py
```

Juju charms can be installed online or offline:

* Online means that we can run a command to install a Juju Charm that
  resides in the online [Juju Store](https://jaas.ai/store).
* Offline means that we can download a charm locally, store it on
  the filesystem, and use Juju to deploy the charm.

For detailed documentation and tutorials on Juju, consult
[https://juju.is/docs](https://juju.is/docs).
