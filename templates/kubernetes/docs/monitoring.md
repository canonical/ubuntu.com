---
wrapper_template: "kubernetes/docs/base_docs.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Monitoring"
  description: How to create monitoring solution that runs whether the cluster itself is running or not. It may also be useful to integrate monitoring into existing setups.
keywords: juju, monitor, grafana, prometheus
tags: [operating]
sidebar: k8smain-sidebar
permalink: monitoring.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** includes the standard
**Kubernetes** dashboard for monitoring your cluster. However, it is often advisable to
have a monitoring solution which will run whether the cluster itself is running or not. It
may also be useful to integrate monitoring into existing setups.

**Prometheus** is the recommended way to monitor your deployment - instructions are
provided below. There are also instructions for setting up other monitoring
solutions, or connecting to existing monitoring setups.

## Monitoring with Prometheus, Grafana, and Telegraf

The recommended way to monitor your cluster is to use a combination of
**Prometheus**, **Grafana** and **Telegraf**. These provide a dashboard
from which you can monitor both machine-level and cluster-level metrics.
See the [quickstart guide][quickstart] for more details on installing **Charmed Kubernetes**.

### Installation

You can install **Charmed Kubernetes** with monitoring using the Juju bundle
along with the following overlay file ([download it here][monitoring-pgt-overlay]):

```yaml
applications:
  prometheus:
    charm: cs:prometheus2
    constraints: "mem=4G root-disk=16G"
    num_units: 1
  grafana:
    charm: cs:grafana
    expose: true
    num_units: 1
  telegraf:
    charm: cs:telegraf
relations:
  - [prometheus:grafana-source, grafana:grafana-source]
  - [telegraf:prometheus-client, prometheus:target]
  - [kubernetes-master:juju-info, telegraf:juju-info]
  - [kubernetes-worker:juju-info, telegraf:juju-info]
  - [kubernetes-master:prometheus, prometheus:manual-jobs]
  - [kubernetes-master:grafana, grafana:dashboards]
```

To use this overlay with the **Charmed Kubernetes** bundle, specify it 
during deploy like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/monitoring-pgt-overlay.yaml
```

If you wish to add monitoring to an existing deployment, you can export a
bundle of your current environment and then redeploy it on top of itself with
the overlay:

```bash
juju export-bundle --filename mybundle.yaml
juju deploy ./mybundle.yaml --overlay ~/path/monitoring-pgt-overlay.yaml
```

### Retrieve credentials and login

To open the dashboard in your browser you will need to know the URL and login
credentials for Grafana. These can be retrieved with the following command:

```bash
juju run-action --wait grafana/0 get-login-info
```

This will return the connection and login information, like the following:

```yaml
unit-grafana-0:
  id: a74acea6-8be9-43c1-8f1c-b1bebe9f5153
  results:
    url: http://10.4.23.162:3000
    username: admin
    password: NYZVkNb3jbMMhWhx
  status: completed
  timing:
    completed: 2019-07-29 22:00:29 +0000 UTC
    enqueued: 2019-07-29 22:00:27 +0000 UTC
    started: 2019-07-29 22:00:28 +0000 UTC
  unit: grafana/0
```

With that, you can visit the URL and log in using the username and password.

Once logged in, check out the cluster metric dashboard by clicking the `Home`
drop-down box and selecting `Kubernetes Metrics (via Prometheus)`:

![grafana dashboard image](https://assets.ubuntu.com/v1/e6934269-grafana-1.png)

You can also check out the system metrics of the cluster by switching the
drop-down box to `Node Metrics (via Telegraf):

![grafana dashboard image](https://assets.ubuntu.com/v1/45b87639-grafana-2.png)

## Monitoring with Nagios

**Nagios** ([https://www.nagios.org/][nagios]) is widely used for monitoring
networks, servers and applications. Using the Nagios Remote Plugin Executor
(NRPE) on each node, it can monitor your cluster with machine-level detail.

To start, deploy the latest version of the Nagios and NRPE Juju charms:

```bash
juju deploy nagios --series=bionic
juju deploy nrpe --series=bionic
juju expose nagios
```

Connect **Nagios** to NRPE:

```bash
juju add-relation nagios nrpe
```

Now add relations to NRPE for all the applications you wish to monitor, for
example kubernetes-master, kubernetes-worker, etcd, easyrsa, and
kubeapi-load-balancer.

```bash
juju add-relation nrpe kubernetes-master
juju add-relation nrpe kubernetes-worker
juju add-relation nrpe etcd
juju add-relation nrpe easyrsa
juju add-relation nrpe kubeapi-load-balancer
```

To connect to the Nagios server, you will need its IP address:

```bash
juju status --format yaml nagios/0 | grep public-address
```

The default username is `nagiosadmin`. The password is randomly generated at
install time, and can be retrieved by running:

```bash
juju ssh nagios/0 sudo cat /var/lib/juju/nagios.passwd
```

![nagios dashboard image][https://assets.ubuntu.com/v1/4b109895-cdk-nagios.png]

### Using an existing Nagios service

If you already have an existing **Nagios** installation, the `nrpe` charm can
be configured to work with it.

```bash
juju config nrpe export_nagios_definitions=true
juju config nrpe nagios_master=<ip-address-of-nagios>
```

See the [External Nagios][external-nagios] section of the NRPE charm readme for more information.

## Monitoring with **Elasticsearch**

Elasticsearch ([https://www.elastic.co/][elastic]) is a popular monitoring application which
can be used in conjunction with **Charmed Kubernetes**.

### Deploy the required applications

Use Juju to deploy the required applications:

```bash
juju deploy elasticsearch --series=bionic --constraints "mem=4G root-disk=16G"
juju deploy filebeat --series=bionic
juju deploy kibana --series=xenial
juju expose kibana
```

### Add relations

You now need to relate the elasticsearch applications together, and connect the `filebeat` application to the applications you want to monitor:

```bash
juju add-relation elasticsearch kibana
juju add-relation elasticsearch filebeat

juju add-relation filebeat kubernetes-master
juju add-relation filebeat kubernetes-worker
juju add-relation filebeat kubeapi-load-balancer
juju add-relation filebeat etcd
```

### Initialise the dashboard

A sample dashboard is included in kibana for monitoring the beat services. You can deploy it by running the following:

```
juju run-action --wait kibana/0 load-dashboard dashboard=beats
```

You can find the dashboard at the public IP address of your **kibana** application

```
juju status kibana --format yaml| grep public-address
```

<!-- LINKS -->

[monitoring-pgt-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/master/overlays/monitoring-pgt-overlay.yaml
[quickstart]: /kubernetes/docs/quickstart
[nagios]: https://www.nagios.org/
[elastic]: https://www.elastic.co/
[external-nagios]: https://jujucharms.com/nrpe/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/master/pages/k8s/monitoring.md" class="p-notification__action">edit this page</a> 
    or 
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" class="p-notification__action">file a bug here</a>.
  </p>
</div>
