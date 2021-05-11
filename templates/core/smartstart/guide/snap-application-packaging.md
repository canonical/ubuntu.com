---
wrapper_template: "core/smartstart/_markdown.html"
markdown_includes:
  nav: "core/smartstart/shared/_side-navigation.md"
context:
  title: "Snap application packaging"
  description: Canonical offers to package your IoT applications in snap containers within the scope of SMART START.
  copydoc: "https://docs.google.com/document/d/1bRMirFfLZcp1JRSpod0nsBo7OJNtEBj3OdmnnAXFSvs/edit"
---

Canonical offers to package your IoT applications in snap containers within the scope of SMART START. Canonical packages up to 3 applications as snaps and [train your engineers](/smart-start/guide/training-workshops) to do so on their own.

## What is a snap?

Snaps are a secure and scalable way to embed applications on Linux devices. Applications containerised in snaps are installed with all dependencies in a single command on any device running Linux. What's more, with snaps, software updates are automatic and resilient. Applications run fully isolated in their own sandbox, thus minimising security risks.

Packaging IoT applications as snaps bring the flowing benefits:

| | |
|-|-|
| Security | Snaps are tamper-proof and run isolated in their own sandbox |
| Modularity | Snaps are reusable, they enable a loosely-coupled software architecture for embedded software
| Efficiency | Software updates are automatic and differential with snaps
| Robustness | Snaps roll back automatically in case of a failed update

## Building snaps

[Snapcraft](https://snapcraft.io/snapcraft) is the developer tool available for creating, building, releasing and updating snaps on any Linux workstation. A detailed [training](/smart-start/guide/training-workshops) is offered to engineering teams within the scope of SMART START.

Snaps are built in 3 simple steps:


<ol class="p-stepped-list--detailed">
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Model
    </h3>
    <p class="p-stepped-list__content">Identify the software modules, libraries and dependencies that make up your application in a yaml file.</p>
  </li>

  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Build
    </h3>
    <p class="p-stepped-list__content">Use the Snapcraft build tool to package your application in a snap in a virtual machine on your host computer.</p>
  </li>

  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Release
    </h3>
    <p class="p-stepped-list__content">Publish your snap to the public (snap store) or private repository for snaps (<a href="/internet-of-things/appstore">IoT app store</a>). Alternatively, the snap can be used locally on the host machine.</p>
  </li>
</ol>

## Maintaining snaps

Snapcraft integrates with CI/CD tools to build and release apps automatically upon software commits.

When released, snaps are published to a [track](https://snapcraft.io/docs/channels) in the public or private repository they are hosted in. There are fours [channels](https://snapcraft.io/docs/channels) in each track, each reflects a level of software maturity:

* **stable**: production-ready
* **candidate**: for testing purposes prior to production deployment
* **beta**: for testing of the latest development features
* **edge**: closely tracks development, often auto built and released

### Helpful resources

- [Snaps in Ubuntu Core](https://core.docs.ubuntu.com/en/coresnaps)
- [Snapcraft docs: how to create a snap](https://snapcraft.io/docs/snapcraft-overview)
- [Smart Start training](/smart-start/guide/training-workshops)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/smartstart/guide/hardware-setup">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Hardware Setup</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/smartstart/guide/snap-publishing">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Snap publishing</span>
  </a>
</footer>
