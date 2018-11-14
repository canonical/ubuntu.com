---
wrapper_template: base_docs.html
context:
    title: Logging
markdown_includes:
    nav: shared/_side-navigation.md
---

<div class="p-notification--information">
  <p class="p-notification__response">
    <span class="p-notification__status">Note:</span>
This documentation assumes you are using version 2.4.0 or later of
<strong>Juju</strong> . If you are using an earlier version you should
check the  <a href="https://docs.jujucharms.com/stable/en/troubleshooting-logs">
 relevant <emphasis>Juju</emphasis> documentation </a> as some of the associated
 commands have changed.
  </p>
</div>

Broadly, there are two types of logs you may be interested in. On cluster or
node level; for the applications you are running inside your cluster, and at an
infrastructure level, the applications which are responsible for running the
cluster itself. As the **Canonical Distribution of Kubernetes<sup>&reg;</sup>**
is pure Kubernetes, you can use any of the tools and techniques  to examine cluster
logs as [described in the Kubernetes documentation][k8-logs].

For the infrastructure, your **CDK** deployment has centralised logging set up
as default. Each unit in your cluster automatically sends logging information
to the controller based on the current logging level.  You can use the **Juju**
command line to easily inspect these logs and to change the logging level, as
explained below.

## Viewing logs

To view the logs from the current controller and model, simply run:

```
juju debug-log
```

The default behaviour is to show the last 10 entries and to tail the log (so
you will need to terminate the command with `Ctrl-C`).

The output is in the form:

`<entity> <timestamp> <log-level> <module>[:<line-no>] <message>`

For example, a typical line of output might read:

```
unit-kubernetes-master-0: 18:04:11 INFO juju.cmd running jujud [2.4.2 gc go1.10]
```

The entity is the unit, machine or application the message originates from (in
this case _kubernetes-master/0_). It can be very useful to filter the output
based on the entity or log level, and the `debug-log` command has many options.
For a full description, run the command `juju help debug-log` or see the
[**Juju** documentation][juju-logging]. Some useful examples are outlined below.

### Useful examples

View the last 100 entries and tail the log:

```bash
juju debug-log -n 100
```

Show the last 20 entries and exit:

```bash
juju debug-log -n 20 --no-tail
```

Replay the log from the very beginning, but filter to logs from kubernetes-worker/0:

```bash
juju debug-log --replay --include=kubernetes-worker/0
```


## Viewing logs on a machine

If it becomes necessary for any reason, it is also possible to view logs
directly on the running machine. A user with SSH access can connect to the
relevant machine and find the logs for all the units running on that machine in
the directory `/var/logs/juju`.  The `juju ssh` command can be used for this,
and you can connect to the relevant machine using a unit identifier. So for
example, to look at the logs on the machine running the first unit of
`kubernetes-worker` you can run the following:

```bash
juju ssh kubernetes-worker/0
ls /var/logs/juju/
```
Which should show something similar to:

```
machine-1.log  machine-lock.log  unit-flannel-1.log  unit-kubernetes-worker-0.log
```

Note that the logs from other units (in this case 'flannel') running on this
machine can also be found here.

## Logging level

You can check the current logging level by running the command:

```bash
juju model-config logging-config
```
This will result in output similar to:

```no-highlight
<root>=WARNING;unit=DEBUG
```
...which is the default for any Juju model. This indicates that the _machine_ log level is set to 'WARNING', and the _unit_ logging level is set to 'DEBUG'.  As all the software components of your kubernetes cluster run in units, these logs are likely to be useful for diagnosing issues with software.

The logging levels, from most verbose to least verbose, are as follows:

 * TRACE
 * DEBUG
 * INFO
 * WARNING
 * ERROR

 The logging level can be set like this:

```bash
 juju model-config logging-config="<root>=WARNING;unit=TRACE"
```
...which in this case sets the logging level for all units to TRACE

<div class="p-notification--warning">
  <p class="p-notification__response">
    <span class="p-notification__status">Caution! :</span>
It isn't a good idea to leave the logging level at 'TRACE' for any
longer than you actually need to. Verbose logging not only consumes network
bandwidth but also fills up the database on the controller.
  </p>
</div>

## Additional information

As previously mentioned, you can see more detailed information on accessing the logs from your cluster in the [**Juju** documentation][juju-logging], including the following:

 - Altering the agent logging setup
 - Setting up remote logging
 - More advanced filtering and additional examples

<!--LINKS -->
[juju-logging]: https://docs.jujucharms.com/stable/en/troubleshooting-logs
[k8-logs]: https://kubernetes.io/docs/concepts/cluster-administration/logging/
