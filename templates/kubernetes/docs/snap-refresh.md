---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Snap refresh"
  description: How to manage and refresh snaps
keywords: snaps, upgrading
tags: [operating]
sidebar: k8smain-sidebar
permalink: snap-refresh.html
layout: [base, ubuntu-com]
toc: False
---

Charms that comprise **Charmed Kubernetes** install required software such
as `etcd`, `kubelet`, and `kube-apiserver` using snap packages. The `snapd`
daemon periodically scans installed snaps for updates and will automatically
refresh upgradeable packages to ensure the software is current.

All charms built from [layer-snap][] include a `snapd_refresh` configuration
option that can be used to adjust the `snapd` refresh interval. By default,
**Charmed Kubernetes** charms set this option to the maximum amount of time
that `snapd` will allow between scans.

## Refresh interval configuration

Display the currently configured `snapd_refresh` option for a given charm:

```bash
juju config <charm> snapd_refresh
```

Change the `snapd_refresh` option with the following:

```bash
juju config <charm> snapd_refresh=<value>
```

The value returned or set above should be an explicit timer, an empty string,
or the special keyword *max*.

- Explicit timer

    An explicit timer may be a simple `mon` (scan every Monday) or a more
    complex `mon3,23:00` (scan on the third Monday of the month at 23:00). See
    possible values for explicit timers in the the *refresh.timer* section of
    the [system options][system-snap-opts] documentation.

- Empty string

    An empty string instructs `snapd` to refresh snap packages according to the
    default system policy. This is currently 4 times per day.

- *max*

    When set to `max`, refresh scans will be delayed for the maximum amount of
    time allowed by `snapd`. This is currently once per month based on the
    date this option was set.

### Determine the actual *max* value

Use `snap get` on a deployed system to determine the value that `snapd` uses
when a charm is configured with `snapd_refresh=max`. An example with `etcd`
shows that the `max` option used when `etcd/0` was deployed has mapped to the
last Sunday of every month (`sun5`):

```bash
juju config etcd snapd_refresh
max
juju exec --unit etcd/0 'snap get system refresh.timer'
sun5
```

## Refresh interval among peers

**Charmed Kubernetes** applications that support peering will use **Juju**
leadership to configure a consistent refresh interval among peers. The lead
unit for `etcd`, `kubernetes-control-plane`, and `kubernetes-worker` applications
will set an initial refresh value. Subsequent units that join as followers
will use the leader value as their snap refresh interval. This ensures all
units in a peer group will refresh at approximately the same time.

## Force snapd to refresh installed snaps

If an immediate snap refresh is desired, invoke `snap refresh` on the
applicable cluster components. For example, refresh all snaps on all `etcd`
units with:

```bash
juju exec --application etcd 'snap refresh'
```

As another example, only refresh the `cdk-addons` snap on the
`kubernetes-control-plane/0` unit with:

```bash
juju exec --unit kubernetes-control-plane/0 'snap refresh cdk-addons'
```

<!-- LINKS -->

[layer-snap]: https://git.launchpad.net/layer-snap
[system-snap-opts]: https://forum.snapcraft.io/t/system-options/87

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/snap-refresh.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
