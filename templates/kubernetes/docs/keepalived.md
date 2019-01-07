---
wrapper_template: "base_docs.html"
markdown_includes:
  nav: "shared/_side-navigation.md"
context:
  title: "HA for kubeapi-load-balancer"
  description: Using keepalived to provide failover for the kube-api-loadbalancer .
keywords: failover, ha, kube-api-loadbalancer, loadbalancer, keepalived
tags: [operating]
sidebar: k8smain-sidebar
permalink: keepalived.html
layout: [base, ubuntu-com]
toc: False
---

The standard deployment of the
**Charmed Distribution of Kubernetes<sup>&reg;</sup> (CDK)** includes a single
instance of the kube-api-loadbalancer.  For many use cases this is perfectly adequate,
but in a production environment, you should be keen to eliminate any single point of
failure.

The recommended way to provide a failover for the kube-api-loadbalancer is by using
[keepalived][keepalived-home]. This is available as a **Juju** charm and can be deployed
into your **CDK** model and configured as follows:

1. Deploy the `keepalived` charm:
    ```bash
    juju deploy cs:~containers/keepalived
    ```

1. Add the required relations :   
    ```bash
    juju add-relation keepalived:juju-info kubeapi-load-balancer:juju-info
    juju add-relation keepalived:lb-sink kubeapi-load-balancer:website
    juju add-relation keepalived:loadbalancer kubernetes-master:loadbalancer
    juju add-relation keepalived:website kubernetes-worker:kube-api-endpoint
    ```
    This redirects both the Kubernetes master and worker units to point at the keepalived
    service rather than the api-endpoint directly.

1. Configure the keepalived application. You should substitute a suitable IP address and
     FQDN in the example below:
    ```bash
    export VIP_HOSTNAME=test.example.com
    juju config keepalived virtual_ip=10.10.74.250
    juju config keepalived port=443
    juju config keepalived vip_hostname=$VIP_HOSTNAME
    ```

1.  Add the new hostname to the API server certificate. This is done by specifying an
    additional [SAN][]:
    ```bash
    juju config kubeapi-load-balancer extra_sans=$VIP_HOSTNAME
    juju config kubernetes-master extra_sans=$VIP_HOSTNAME
    ```

1. Wait for the new service to settle. You can check the status of the `keepalived`
    application by running:
    ```bash
    juju status keepalived
    ```
    Once the application reports a 'ready' status, continue to the next step.

1. Remove unneeded relations:
    ```bash
    juju remove-relation kubernetes-worker:kube-api-endpoint kubeapi-load-balancer:website
    ```

1. Scale up the `kubeapi-load-balancer`. You can specify as many units as your situation requires.
    In this example, we add two additional units for a total of three:
    ```bash
    juju add-unit kubeapi-load-balancer -n 2
    ```

Note that the `keepalived` application is a [_subordinate charm_][subordinate-charm] -
it does not require a machine of its own to run on, but rather runs alongside the
`kubeapi-load-balancer` charm. If for any reason you need to [view logs][logging-doc] or
troubleshoot this application, it will be found co-located on the machines running the
load balancer.

<!--LINKS-->
[keepalived-home]: http://www.keepalived.org/
[SAN]: https://www.openssl.org/docs/manmaster/man5/x509v3_config.html#Subject-Alternative-Name
[logging-doc]: /kubernetes/docs/logging
[subordinate-charm]: https://docs.jujucharms.com/stable/en/authors-subordinate-applications
