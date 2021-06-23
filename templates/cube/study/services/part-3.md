---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Investigating the Status of Services"
  description: "Investigating the Status of Services"
  auto_paginate: True
---

Systemd comes with a faculty called the *journal*, which replaces the
conventional Unix concept of *system logs.* In contrast to system
logs, which are pure text files, the journal keeps logging information
in a structured, indexed format that greatly facilitates searches and
queries.

You normally interact with the system journal from the terminal
command line, using the `journalctl` utility.


### Retrieving Logs for a Single System Service

Frequently, you want to retrieve the system logs for just a single
system service. To investigate the information logged by `apache2`,
for example, you would run:

```bash
sudo journalctl -u apache2
```

Note that `-u` in this case stands for 'unit', an umbrella
concept in systemd of which services are one incarnation. 

You can narrow the output of the logs down further. For example, you
might only want to retrieve the log entries between two points in
time. You can do this with the `--since` and `--until` (or `-S` and
`-U`) options, which both take any arguments parseable by the
`strptime()` C library function. This function is remarkably
versatile, so if you want only the journal entries created
since midnight, you could use:

```bash
sudo journalctl -u apache2 --since today
```


### Retrieving Kernel Logs

You can also retrieve only the kernel logs issued since the last
system boot. You do so with either:

```bash
sudo journalctl -k
```

or:

```bash
sudo journalctl --dmesg
```

This provides the same information as the legacy `dmesg` command.
