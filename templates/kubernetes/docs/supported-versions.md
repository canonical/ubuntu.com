---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Supported versions"
  description: The Charmed Kubernetes release cycle and current supported versions.
keywords: juju, upgrading, track, version
tags: [operating]
sidebar: k8smain-sidebar
permalink: supported-versions.html
layout: [base, ubuntu-com]
toc: False
---

Charmed Kubernetes officially supports the most recent three (3) minor releases
of Kubernetes.

Current Release: **1.24**

Supported releases: **1.24.x,1.23.x, 1.22.x**

## Charmed Kubernetes bundle versions

**Charmhub.io** hosts the **Charmed Kubernetes** bundles as well as
individual charms. To deploy the latest, stable bundle, run the command:

```bash
juju deploy charmed-kubernetes
```

It is also possible to deploy a specific version of the bundle by including the
revision number. For example, to deploy the **Charmed Kubernetes** bundle for the Kubernetes 1.23
release, you could run:

```bash
juju deploy cs:charmed-kubernetes-862
```

The revision numbers for bundles are generated automatically when the bundle is
updated, including for testing and beta versions, so it isn't always the case
that a higher revision number is 'better'. The revision numbers for the release
versions of the **Charmed Kubernetes** bundle are shown in the table below:

<a  id="table"></a>

| Kubernetes version | Charmed Kubernetes bundle |
| --- | --- |
| 1.23.x    | [charmed-kubernetes-862](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.23/bundle.yaml) |
| 1.22.x    | [charmed-kubernetes-814](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.22/bundle.yaml) |
| 1.21.x    | [charmed-kubernetes-733](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.21/bundle.yaml) |
| 1.20.x    | [charmed-kubernetes-596](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.20/bundle.yaml) |
| 1.19.x    | [charmed-kubernetes-545](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.19/bundle.yaml) |
| 1.18.x    | [charmed-kubernetes-485](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.18/bundle.yaml) |
| 1.17.x    | [charmed-kubernetes-410](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.17/bundle.yaml) |
| 1.16.x    | [charmed-kubernetes-316](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.16/bundle.yaml) |
| 1.15.x    | [charmed-kubernetes-209](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.15/bundle.yaml) |
| 1.14.x    | [charmed-kubernetes-124](https://raw.githubusercontent.com/charmed-kubernetes/bundle/main/releases/1.14/bundle.yaml) |

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Note:</span>
Only the latest three versions of Charmed Kubernetes are supported at any time.
  </p>
</div>


## Finding version info

To check which versions of Kubernetes are available, use the `snap info` command:

```bash
snap info kube-apiserver
```

Keep in mind that although snap info enumerates all available versions, only
the latest three stable versions are officially supported:

```no-highlight
name:      kube-apiserver
summary:   Kubernetes master component that exposes the Kubernetes API.
publisher: Canonical✓
store-url: https://snapcraft.io/kube-apiserver
contact:   https://www.ubuntu.com/kubernetes
license:   Apache-2.0
description: |
  Kube-apiserver is the front-end for the Kubernetes control plane. It validates and configures data
  for the api objects which include pods, services, replicationcontrollers, and others. The API
  Server services REST operations and provides the frontend to the cluster’s shared state through
  which all other components interact.
  
  For more information, consult the [reference
  documentation](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/).
snap-id: KMZLusdClmUyLXAjjcI4sVnpjk1kM653
channels:
  latest/stable:    1.24.0         2022-05-07 (2764) 24MB -
  latest/candidate: 1.24.0         2022-05-07 (2764) 24MB -
  latest/beta:      1.24.0         2022-05-07 (2764) 24MB -
  latest/edge:      1.24.0         2022-05-07 (2764) 24MB -
  1.24/stable:      1.24.0         2022-05-04 (2764) 24MB -
  1.24/candidate:   1.24.0         2022-05-04 (2764) 24MB -
  1.24/beta:        1.24.0         2022-05-04 (2764) 24MB -
  1.24/edge:        1.24.0         2022-05-04 (2764) 24MB -
  1.23/stable:      1.23.6         2022-04-21 (2746) 23MB -
  1.23/candidate:   1.23.6         2022-04-21 (2746) 23MB -
  1.23/beta:        1.23.6         2022-04-21 (2746) 23MB -
  1.23/edge:        1.23.6         2022-04-21 (2746) 23MB -
  1.22/stable:      1.22.9         2022-04-21 (2745) 22MB -
  1.22/candidate:   1.22.9         2022-04-21 (2745) 22MB -
  1.22/beta:        1.22.9         2022-04-21 (2745) 22MB -
  1.22/edge:        1.22.9         2022-04-21 (2745) 22MB -
  1.21/stable:      1.21.7         2021-11-18 (2433) 22MB -
  1.21/candidate:   1.21.7         2021-11-18 (2433) 22MB -
  1.21/beta:        1.21.7         2021-11-18 (2433) 22MB -
  1.21/edge:        1.21.7         2021-11-18 (2433) 22MB -
  1.20/stable:      1.20.14        2021-12-16 (2519) 22MB -
  1.20/candidate:   1.20.14        2021-12-16 (2519) 22MB -
  1.20/beta:        1.20.14        2021-12-16 (2519) 22MB -
  1.20/edge:        1.20.14        2021-12-16 (2519) 22MB -
  1.19/stable:      1.19.16        2021-10-29 (2419) 22MB -
  1.19/candidate:   1.19.16        2021-10-29 (2419) 22MB -
  1.19/beta:        1.19.16        2021-10-29 (2419) 22MB -
  1.19/edge:        1.19.16        2021-10-29 (2419) 22MB -
  1.18/stable:      1.18.20        2021-08-09 (2219) 23MB -
  1.18/candidate:   1.18.20        2021-08-09 (2219) 23MB -
  1.18/beta:        1.18.20        2021-08-09 (2219) 23MB -
  1.18/edge:        1.18.20        2021-08-09 (2219) 23MB -
  1.17/stable:      1.17.17        2021-01-15 (1962) 23MB -
  1.17/candidate:   1.17.17        2021-01-15 (1962) 23MB -
  1.17/beta:        1.17.17        2021-01-15 (1962) 23MB -
  1.17/edge:        1.17.17        2021-01-15 (1962) 23MB -
  1.16/stable:      1.16.15        2020-10-20 (1789) 22MB -
  1.16/candidate:   1.16.15        2020-10-20 (1789) 22MB -
  1.16/beta:        1.16.15        2020-10-20 (1789) 22MB -
  1.16/edge:        1.16.15        2020-10-20 (1789) 22MB -
  1.15/stable:      1.15.12        2020-05-20 (1663) 24MB -
  1.15/candidate:   1.15.12        2020-05-20 (1663) 24MB -
  1.15/beta:        1.15.12        2020-05-20 (1663) 24MB -
  1.15/edge:        1.15.12        2020-05-20 (1663) 24MB -
  1.14/stable:      1.14.10        2019-12-16 (1505) 24MB -
  1.14/candidate:   1.14.10        2019-12-16 (1505) 24MB -
  1.14/beta:        1.14.10        2019-12-16 (1505) 24MB -
  1.14/edge:        1.14.10        2019-12-16 (1505) 24MB -
  1.13/stable:      1.13.12        2019-10-17 (1434) 23MB -
  1.13/candidate:   1.13.12        2019-10-17 (1434) 23MB -
  1.13/beta:        1.13.12        2019-10-17 (1434) 23MB -
  1.13/edge:        1.13.13-beta.0 2019-10-16 (1371) 23MB -
  1.12/stable:      1.12.9         2019-06-05 (1004) 27MB -
  1.12/candidate:   1.12.9         2019-05-29 (1004) 27MB -
  1.12/beta:        1.12.9         2019-05-29 (1004) 27MB -
  1.12/edge:        1.12.9         2019-05-29 (1004) 27MB -
  1.11/stable:      1.11.9         2019-03-29  (866) 26MB -
  1.11/candidate:   1.11.9         2019-03-26  (866) 26MB -
  1.11/beta:        1.11.9         2019-03-26  (866) 26MB -
  1.11/edge:        1.11.9         2019-03-26  (866) 26MB -
  1.10/stable:      1.10.13        2019-02-27  (744) 25MB -
  1.10/candidate:   1.10.13        2019-03-21  (838) 25MB -
  1.10/beta:        1.10.13        2019-03-21  (838) 25MB -
  1.10/edge:        1.10.13        2019-03-21  (838) 25MB -
  1.9/stable:       1.9.11         2018-10-08  (454) 24MB -
  1.9/candidate:    1.9.11         2018-10-17  (466) 24MB -
  1.9/beta:         1.9.11         2018-10-17  (466) 24MB -
  1.9/edge:         1.9.11         2018-10-17  (466) 24MB -
  1.8/stable:       1.8.15         2018-07-11  (435) 23MB -
  1.8/candidate:    1.8.15         2018-10-17  (465) 23MB -
  1.8/beta:         1.8.15         2018-10-17  (465) 23MB -
  1.8/edge:         1.8.15         2018-10-17  (465) 23MB -
  1.7/stable:       1.7.16         2018-06-06  (395) 24MB -
  1.7/candidate:    1.7.16         2018-10-17  (464) 24MB -
  1.7/beta:         1.7.16         2018-10-17  (464) 24MB -
  1.7/edge:         1.7.16         2018-10-17  (464) 24MB -
  1.6/stable:       1.6.13         2017-11-30  (233) 21MB -
  1.6/candidate:    1.6.13         2018-10-17  (463) 21MB -
  1.6/beta:         1.6.13         2018-10-17  (463) 21MB -
  1.6/edge:         1.6.13         2018-10-17  (463) 21MB -
  1.5/stable:       1.5.5          2017-05-17    (3) 17MB -
  1.5/candidate:    1.5.5          2017-05-17    (3) 17MB -
  1.5/beta:         1.5.5          2017-05-17    (3) 17MB -
  1.5/edge:         1.5.5          2017-05-17    (3) 17MB -
```

In the above output, the stable release is identified as 1.24, and so 1.23 and
1.22 are also currently supported.

## Professional support

If you are looking for additional support, find out about [Ubuntu Advantage][support].

Canonical can also provide [managed solutions][managed] for Kubernetes.

<!-- LINKS -->
[support]: /support
[managed]: /kubernetes/managed

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__content">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/supported-versions.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>
