---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Kubernetes Inclusive Naming"
  description: Kubernetes commitment to inclusivity 
keywords: inclusive, requirements, developer 
tags: [install]
sidebar: k8smain-sidebar 
permalink: inclusive-naming.html 
layout: [base, ubuntu-com]
toc: False
---

The software industry has historically used words and terms which evoke
unintended meanings that they weren’t intended to have to have. Canonical and
the Charmed Kubernetes team are proud to be part of an industry-wide initiative
which aims to remove problematic language from our code and docs.

Generally, inclusive language means using precise technical terms that do not
leave out marginalised groups or carry needless emotional or historical baggage.

In practice, this means reviewing terms that’re commonly used in tech, and
deciding whether it could be improved with less harmful, more welcoming, and
ultimately clearer wording. It doesn’t mean that these words should be banned
from our language entirely, or that they should never be used in any context.
Rather, it’s simply admitting that these words are counterproductive for our
goal and that we are all better off if we do things differently moving forward.

Canonical Kubernetes strives to improve the language used in its products to
better reflect its components, relations, status messages, and source code
repositories. We also realise that software is built on a trust that renaming
some component doesn't break existing working deployments. We will document all
inclusive-naming changes, and take care to make non-breaking adjustments.



## [Kubernetes Control Plane][kubernetes-control-plane] charm

Ending with the charms release 1.23, Charmed Kubernetes is replacing the charm
`kubernetes-master` with `kubernetes-control-plane`. This charm has always
hosted applications such as the api-server, controller-manager, proxy, and
scheduler. Aside from [`etcd`][etcd], which is provided by a separate charm,
these services are considered the central kubernetes control plane services and
are better represented under this charm name.

See [Upgrading](upgrading) for more details about how to switch to this charm.

## Repository default branch names

Charmed Kubernetes charms have a legacy position of working from a default
branch which doesn't accurately reflect that it is the `main` branch of code.
Many charms build also on charm layers and interfaces which are reusable source
components for these charms. As a part of this progress, the project will
transition the names of the default branches to `main`.


<!-- IMAGES -->



<!-- LINKS -->

[LXD-image]: https://documentation.ubuntu.com/lxd/en/latest/image-handling
[kubernetes-control-plane]: https://charmhub.io/kubernetes-control-plane/docs
[etcd]: /kubernetes/docs/charm-etcd
[upgrading]: /kubernetes/docs/upgrading

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">
      We appreciate your feedback on the documentation. You can
      <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/inclusive-naming.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
