---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Contributing to Charmed Kubernetes"
  description: How to contribute to this project
keywords: community, contribute
tags: [install]
sidebar: k8smain-sidebar
permalink: how-to-contribute.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** is entirely open source, including all elements of the code and its documentation. We welcome any contributions to either - this page gives some guidance on making those contributions more effective.

## Contributing to the code

All the code which makes up Charmed Kubernetes is located in repositories on GitHub. Each charm has its own repository where you can find more specifics about that project.
For an overview of the Charmed Kubernetes project, visit the respective [organisation on GitHub](https://github.com/charmed-kubernetes). 

A charmed operator (‘charm’) is software which wraps an application and contains all of the instructions necessary for deploying, configuring, scaling, integrating, etc., the application on any cloud using Juju.

You can find more information on Juju at the [https://juju.is](https://juju.is) website.
There is more specific documentation on the SDK used to create a charm in the [Juju SDK documentation](https://juju.is/docs/sdk).

## Contributing to the documentation

We welcome additions to the docs, whether that is just a simple link update or a more detailed and complete how-to guide.
Every page of the documentation (including this one) has a footer with a direct link to the GitHub repository file for that specific page, so it really couldn't be easier. Make your changes and submit a pull-request and the Charmed Kubernetes team will take things from there.
For larger amendments or work that will require a new page, it will be useful to create an issue (again, the link for this is at the bottom of every page) explaining what is needed and why, just so we can avoid duplication of effort.
If you want to help but don't know where to start, try looking for issues which have the ['help-wanted' label](https://github.com/charmed-kubernetes/kubernetes-docs/labels/help%20wanted) - these are issues we have particularly identified as being ones we would like community help with!

### Editing tips

The documentation uses fairly standard Markdown for the text. Here is a quick 'cheat-sheet':

| Element  | Markdown | Example  |
|--|-|--|
| Heading | `#### H4 header` | <h4>H4 header </h4> |
| Link | `[Link text](http://ubuntu.com)` | [Link text](http://ubuntu.com)|
| Image | `![alt](https://assets.ubuntu.com/v1/be7e4cc6-COF-favicon-32x32.png)` | ![alt](https://assets.ubuntu.com/v1/be7e4cc6-COF-favicon-32x32.png) |
| Bold | `**Bold**`| **Bold** |
| Italic | `_Italic words_`| _Italic words_|

The documentation follows the Canonical [Documentation Style Guide](https://docs.ubuntu.com/styleguide/en) - it's a fairly brief read!

### Previewing changes

If you make a pull request, we have an automated task that will generate a preview of the docs site so you can check everything looks as it should. Look out for a link being added as a comment to your PR.
To check the changes locally, you can also easily build this site (it runs a local Jekyll server with just the Charmed Kubernetes docs). Instructions for this are in the README of the repository.


### Review process

The documentation process follows a standard procedure for reviewing contributions. Once a PR has been raised, we will aim to provide feedback within two working days.
We aren't expecting all contributions to be absolutely perfect and the team will happily give you guidance on matters of style and language as well as any technical input. The point is, do not let your lack of familiarity with our documentation hold you back from providing extra detail or context which may be useful to others.


## Charm documentation

Note that the individual charms which make up **Charmed Kubernetes** also have their own documentation. This is limited to the specific operation of that charm (not all are exclusive to use within the Charmed Kubernetes bundle), its configuration and integration with other charms.
This documentation, in accordance with the guidelines of the [Charmhub.io](https://charmhub.io) website, is generated from Wiki topics in Discourse. Further guidance on this process is available on the CharmHub site - just click on the 'Help improve this documentation' link at the bottom of any page.
The charm specific documentation follows the same diataxis principles. See the [MetalLb charm for a good example](https://charmhub.io/metallb).


<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/how-to-contribute.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.</p>
  </div>
</div>