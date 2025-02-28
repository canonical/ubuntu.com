---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/charmed-k8s/docs/shared/_side-navigation.md"
context:
  title: "Uninstalling Charmed Kubernetes"
  description: uninstall the charmed kubernetes from the substrate
keywords: uninstall
tags: [operating]
sidebar: k8smain-sidebar
permalink: how-to-uninstall.html
layout: [base, ubuntu-com]
toc: False
---

This guide describes how to uninstall **Charmed Kubernetes**.

## Uninstall the Charmed Kubernetes applications one by one
If you have other resources inside the model other than Charmed Kubernetes that you would like to preserve, you can proceed with removing the Charmed Kubernetes applications one by one. For detailed information you can see how to [Remove an Application][remove-an-application].

## Remove the model
Alternatively, you can destroy the model and the resources residing in it, including Charmed Kubernetes. 
```bash
juju destroy-model charmed-kubernetes --destroy-storage
```
If your model has a different name other than `charmed-kubernetes`, substitute it in the command above. By default the removal will not proceed if there are errors throughout the process. If you are willing to force the removal you can use the following command:
```bash
juju destroy-model charmed-kubernetes --yes --destroy-storage --force
```
Be cautiuos about using these options. See [Removing Things][removing-things] for more information on force removal.

If you want to retain the persistent storage maintained by your model you can use the following flag in the command:
```bash
juju destroy-model charmed-kubernetes --release-storage
```
See [Destroy a Model][destroy-a-model] for more details.

<!-- LINKS -->
[remove-an-application]: https://canonical-juju.readthedocs-hosted.com/en/latest/user/howto/manage-applications/#remove-an-application
[removing-things]: https://canonical-juju.readthedocs-hosted.com/en/latest/user/reference/removing-things/
[destroy-a-model]: https://canonical-juju.readthedocs-hosted.com/en/latest/user/howto/manage-models/#destroy-a-model


<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-install.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
