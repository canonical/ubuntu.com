---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "CNI with Canal"
  description: How to manage and deploy Kubernetes with Canal
keywords: CNI, networking
tags: [operating]
sidebar: k8smain-sidebar
permalink: cni-canal.html
layout: [base, ubuntu-com]
toc: False
---

"Canal" is a shorthand for saying "Calico and Flannel", a common practise which sets
up Calico to handle policy management and Flannel to manage the network itself. This
combination brings in Calico's support for the NetworkPolicy feature of Kubernetes,
while utilizing Flannel's UDP-based network traffic to provide for an easier setup
experience that works in a wider variety of host network environments without
special configuration.


## Deploying Charmed Kubernetes with Canal

To deploy a cluster with Canal, deploy the `charmed-kubernetes` bundle with the
[canal overlay][canal-overlay]:

```bash
juju deploy charmed-kubernetes --overlay canal-overlay.yaml
```

You can apply any additional customisation overlays that would apply to
`charmed-kubernetes` to this deployment as well.

## Canal configuration options

|Name                  | Type    | Default   | Description                      |
|----------------------|---------|-----------|----------------------------------|
| calico-node-image    | string  | docker.io/calico/node:v3.6.1|The image id to use for calico/node. |
| calico-policy-image  | string  | docker.io/calico/kube-controllers:v3.6.1|The image id to use for calico/kube-controllers. |
| cidr                 | string  | 10.1.0.0/16|Network CIDR to assign to Flannel |
| iface                | string  |           |The interface to bind flannel overlay networking. The default value is the interface bound to the cni endpoint. |
| nagios_context       | string  | juju      |Used by the nrpe subordinate charms. A string that will be prepended to instance name to set the host name in nagios. So for instance the hostname would be something like:     juju-myservice-0 If you're running multiple environments with the same services in them this allows you to differentiate between them. |
| nagios_servicegroups | string  |           |A comma-separated list of nagios servicegroups. If left empty, the nagios_context will be used as the servicegroup |
                                |

### Checking the current configuration

To check the current configuration settings for Canal, run the command:

```bash
juju config canal
```

### Setting a config option

To set an option, simply run the config command with an additional `<key>=<value>` argument. For example, to set a specific network CIDR:

```bash
juju config canal cidr="10.5.0.0/16"
```

## Troubleshooting

If there is an issue with connectivity, it can be useful to inspect the Juju logs. To
see a complete set of logs for canal:

```bash
juju debug-log --replay --include=canal
```

For additional troubleshooting pointers, please see the
[dedicated troubleshooting page][troubleshooting].

<!-- LINKS -->

[canal]: https://docs.projectcalico.org/v3.7/getting-started/kubernetes/installation/flannel
[canal-overlay]: https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/overlays/canal-overlay.yaml
[troubleshooting]: /kubernetes/docs/troubleshooting

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/cni-canal.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

