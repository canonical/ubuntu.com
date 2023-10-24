---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Backing up Kubernetes"
  description: Explanation of backup/restore strategies
keywords: equinix, integrator, ebs, elb
tags: [install]
sidebar: k8smain-sidebar
permalink: explain-backups.html
layout: [base, ubuntu-com]
toc: False
---

As with any other component of IT architecture, it is recommended to have a plan for backing up and restoring key elements of your Kubernetes cluster.

Although many believe that Kubernetes can be considered more or less stateless, that isn't really true beyond the use case of running a few ephemeral services. Unlike legacy systems running on distinct machines though, backing up a Kubernetes cluster requires some additional thought as to what components need to be backed up and how they might be restored. 

## The etcd distributed key-value store

Kubernetes relies on the distributed key-value store `etcd` to keep information such as state, configuration and metadata in a central location where it can be accessed by any pods in the cluster. The name is derived from the idea that it is an '/etc' directory for destributed systems ('d'), though it is not used purely for configuration. 
The etcd store is essential to the operation of Kubernetes and should be considered worthy of a backup strategy.
Etcd itself includes the ability to save and restore snapshots of the stored data, which in the case of **Charmed Kubernetes** is exposed to the cluster operator through a Juju action. The procedure for using the action to create snapshots, store the snapshots and subsequently restore them is covered in [this How To guide to backing up etcd][backup-etcd]. 

## Persistent storage

Depending on your use case for Kubernetes, a significant amount of important data may reside in persistent storage attached to the cluster. The importance of this data depends on the nature of what it is storing and how difficult it would be to recreate, but starting from the point of view that it is important enough to be persistent, it is likely that it is also important enough to back up.
The most effective way to back up storage depends mainly on where the storage is. E.g. a public cloud will have its own snapshot/restore methods, though these may need to be triggered by the operator. Alternatively, many of the third party solutions below handle backups across a variety of cluster environments.

## Backup solutions

Understandably, there are a number of third party backup solutions for Kubernetes. It is beyond the scope of our documentation to make recommendations on which may be suitable as this will largely be determined by the purpose of the cluster, its requirements and to a large extent where it is operating. We can offer some links to solutions which are widely used though.

- [Velero][]
- [Trilio][]
- [Kasten][]
- [Cohesity][]

## Further reading

- [etcd disaster recovery][etcd-recovery], from the etcd documentation site.
- [An overview of the components of Kubernetes][k8s-overview], from the Kubernetes documentation.
- [How persistent volumes work][k8s-pv], from the Kubernetes documentation.


<!-- LINKS -->
[Velero]: https://velero.io/
[Cohesity]: https://www.cohesity.com
[Kasten]: https://www.kasten.io
[Trilio]: https://trilio.io/products/kubernetes-backup-and-recovery/
[k8s-overview]: https://kubernetes.io/docs/concepts/overview/components/
[k8s-pv]: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
[backup-etcd]: /kubernetes/docs/backups
[etcd-recovery]: https://etcd.io/docs/v3.5/op-guide/recovery/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/explain-backups.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

