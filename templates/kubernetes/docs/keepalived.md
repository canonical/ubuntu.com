---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
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

The standard deployment of **Charmed Kubernetes** includes a single instance
of the kube-api-loadbalancer. For many use cases this is perfectly adequate,
but in a production environment you should be keen to eliminate any single
point of failure.

The recommended way to provide a failover for the kube-api-loadbalancer on bare
metal or MAAS is by using [keepalived][keepalived-home]. This is available as a
**Juju** charm and can be deployed into your **Charmed Kubernetes** model and
configured as follows:

1. Deploy the `keepalived` charm:
    ```bash
    juju deploy keepalived
    ```

1. Relate `keepalived` to `kubeapi-load-balancer`:
    ```bash
    juju integrate keepalived:juju-info kubeapi-load-balancer:juju-info
    ```

1. Configure the keepalived application. You should substitute a suitable IP address and
     FQDN in the example below:
    ```bash
    export VIP=10.10.74.250
    export VIP_HOSTNAME=test.example.com
    juju config keepalived virtual_ip=$VIP
    juju config keepalived vip_hostname=$VIP_HOSTNAME
    ```
    Allocating a VIP and ensuring that it can route to all of the instances is a manual
    process which depends on your infrastructure.  It does require that the VIP be able
    to route to each instance, and that the VRRP protocol is allowed on the network.
    While this should be the case on bare metal and MAAS, and can be made to
    work on [OpenStack][openstack-vip], it will generally not be possible on
    public clouds. Thus, it is generally better to in those cases to replace
    kubeapi-load-balancer with a cloud-provided load balancer with health
    checks, such as Octavia or ELB.

1.  Add both the new hostname and VIP to the API server certificate. This is done by specifying
    additional [SANs][]:
    ```bash
    juju config kubeapi-load-balancer extra_sans="$VIP $VIP_HOSTNAME"
    juju config kubernetes-control-plane extra_sans="$VIP $VIP_HOSTNAME"
    ```

1. Configure kubernetes-control-plane to use the VIP as the advertised Kubernetes API endpoint:
    ```bash
    juju config kubernetes-control-plane loadbalancer-ips="$VIP"
    ```

1. Wait for the new service to settle. You can check the status of the `keepalived`
    application by running:
    ```bash
    juju status keepalived
    ```
    Once the application reports a 'ready' status, continue to the next step.

1. Scale up the `kubeapi-load-balancer`. You can specify as many units as your situation requires.
    In this example, we add two additional units for a total of three:
    ```bash
    juju add-unit kubeapi-load-balancer -n 2
    ```

1. Check for correct functionality by using kubectl and verifying it returns results. You can also check the SANs listed in the certificate returned by the VIP.
    ```bash
    kubectl get pods --all-namespaces
    openssl s_client -connect $VIP:443 | openssl x509 -noout -text
    ```

Note that the `keepalived` application is a
[_subordinate charm_][subordinate-charm] - it does not require a machine of its
own to run on, but rather runs alongside the `kubeapi-load-balancer` charm. If
for any reason you need to [view logs][logging-doc] or troubleshoot this
application, it will be found co-located on the machines running the load
balancer.

<!--LINKS-->
[keepalived-home]: http://www.keepalived.org/
[SANs]: https://www.openssl.org/docs/manmaster/man5/x509v3_config.html#Subject-Alternative-Name
[logging-doc]: /kubernetes/docs/logging
[subordinate-charm]: https://juju.is/docs/sdk#heading--subordinate-charms
[openstack-vip]: https://medium.com/jexia/virtual-ip-with-openstack-neutron-dd9378a48bdf

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/keepalived.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

