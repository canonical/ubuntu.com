---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Managing Services with `systemctl`"
  description: "Managing Services with `systemctl`"
  auto_paginate: True
---

`systemctl` is the central command-line utility you use to modify the
behaviour of system services. You can use `systemctl` to start, stop,
restart, enable, disable, investigate, and even reconfigure services.

In managing systemd services with `systemctl`, you may encounter two
different kinds of services:

* *System* services run in the context of `init` and as such, at
  least initially, also in the account of the `root` user – although
  they may eventually take on the identity of another user account, a
  process known as *dropping root privileges.* You manage these
  services with just `systemctl`, run as `root`. Thus, when logged
  into a system as a normal user, you would usually invoke this binary
  as `sudo systemctl`.
  
* *User* services run in the context of an individual user. You
  manage these services (for your own account) with `systemctl -u`;
  this command does not require the `sudo` prefix.


### Starting, Stopping, and Restarting Services

You can use `systemctl` to stop a currently-running service (in this
example, `apache2`) with the following command:

```bash
sudo systemctl stop apache2
```

You can then start the service again by running:

```bash
sudo systemctl start apache2
```

Sometimes you want to combine these two actions into a restart of the
service, which you can also achieve with the following shortcut:

```bash
sudo systemctl restart apache2
```

Some services also support merely rereading their configuration, and
then changing their behaviour, *without* an actual restart. For such a
service, you can also run:

```bash
sudo systemctl reload apache2
```

### Enabling and Disabling Services

You may also use `systemctl` to *enable* a service, that is, configure
it to automatically start on system boot:

```bash
sudo systemctl enable apache2
```

Conversely, you can also *disable* the service, meaning configure it
such that it does not automatically start on system boot:

```bash
sudo systemctl disable apache2
```

Behind the curtain, this means that systemd adds or removes the
service from the list of dependencies of a *target,* which is a
declarative desired state of the system. You can read more about
targets by invoking the following:

```bash
man systemd.target
```

Alternatively, you can [peruse the online
version](https://www.freedesktop.org/software/systemd/man/systemd.target.html)
of that documentation.

You can also use `systemctl -u` to enable or disable user services,
though the semantics are slightly different: whereas an enabled system
service starts on system boot and stops as part of the system shutdown
sequence, an enabled user service starts when its owner logs on, and
stops when that user logs off. That is, unless the user is allowed to
start *lingering* services, which are beyond the scope of this
chapter.


### Investigating and Configuring Services

You can always interrogate the current configuration with `systemctl
cat`:

```bash
sudo systemctl cat apache2
```

For example, the `apache2` service is configured, on Ubuntu
20.04, like so:

```
# /lib/systemd/system/apache2.service
[Unit]
Description=The Apache HTTP Server
After=network.target remote-fs.target nss-lookup.target
Documentation=https://httpd.apache.org/docs/2.4/

[Service]
Type=forking
Environment=APACHE_STARTED_BY_SYSTEMD=true
ExecStart=/usr/sbin/apachectl start
ExecStop=/usr/sbin/apachectl stop
ExecReload=/usr/sbin/apachectl graceful
PrivateTmp=true
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

Suppose you are unhappy with the fact that the Apache web server only
restarts in case of an unclean signal (`Restart=on-abort`), and you
instead want it on any termination that results in a non-zero exit
code (`Restart=on-failure`). In this case, you should **not**
manipulate the service definition directly, but instead configure an
*override.*

You can do this with:

```bash
sudo systemctl edit apache2
```

This opens up an editor with a file that is initially blank, but
which you can now populate with *only* the settings that you wish to
override.

To change just the `Restart` policy and leave everything else
unchanged, you would enter:

```
[Service]
Restart=on-failure
```

You can then use he tfollowing command to verify that the `Restart` configuration option has indeed been set to `on-failure`:

```bash
sudo systemctl show apache2
```
