---
wrapper_template: "core/services/_markdown.html"
markdown_includes:
  nav: "core/services/shared/_side-navigation.md"
context:
  title: "Publishing snaps"
  description: The Snap store is a global application repository hosted and managed by Canonical. It is accessible to any developer who wants to leverage snaps to distribute software across any Linux distribution.
  copydoc: "https://docs.google.com/document/d/1o3IUaCCPcog6fBxQFYkUAFdFXsceM_6qoyjHWNn727w/edit"
---

The [Snap store](http://snapcraft.io/store) is a global application repository hosted and managed by Canonical. It is accessible to any developer who wants to leverage snaps to distribute software across any Linux distribution.

This section describes how to publish a snap in the global repository (snap store) or your own private repository (IoT app store). Applications published benefit from Canonical's content delivery network (CDN) for global software delivery.

IoT app stores are private application repositories hosted and managed by Canonical. Access to IoT app stores is restricted to the repository owner's team, customers, users and business partners.

|          | Snap store                       | IoT app store                    |
| -------- | -------------------------------- | -------------------------------- |
| Access   | Public                           | Restricted                       |
| Content  | Curated by Canonical             | Curated by owner                 |
| Hosting  | Hosted and managed by Canonical  | Hosted and managed by Canonical  |
| Security | Security monitoring by Canonical | Security monitoring by Canonical |

## Publishing to the snap store

Snaps are published to the global snap store in 3 simple steps:

<ol class="p-stepped-list">
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Upload
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Global community of snap developers</dd>
        <dt>How</dt>
        <dd>After building and testing, developers use <a href="https://snapcraft.io/docs/releasing-your-app">Snapcraft</a> to upload snaps to the global snap store. Developers choose the adequate <a href="https://snapcraft.io/docs/release-management">channel</a> for the release.</dd>
      </dl>
    </div>
  </li>
  <hr />
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Review
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Canonical</dd>
        <dt>How</dt>
        <dd>Uploaded snaps go through automated and <a href="https://forum.snapcraft.io/t/process-for-reviewing-classic-confinement-snaps/1460">manual review</a> processes, depending on the security profile of the snap.</dd>
      </dl>
    </div>
  </li>
  <hr />
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Release
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Snap developer</dd>
        <dt>How</dt>
        <dd>Once approved the snap becomes publicly available to any user running a compatible Linux distribution.</dd>
      </dl>
    </div>
  </li>
</ol>

## Publishing to your IoT app store

Snaps are published to a private IoT app store in 3 simple steps:

<ol class="p-stepped-list">
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Upload
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Your development team</dd>
        <dt>How</dt>
        <dd>After building and testing, developers use <a href="https://snapcraft.io/docs/releasing-your-app">Snapcraft</a> to upload snaps to a private IoT app store. Developers choose the adequate <a href="https://snapcraft.io/docs/release-management">channel</a> for the release.</dd>
      </dl>
    </div>
  </li>
  <hr />
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Review
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Your designated reviewers</dd>
        <dt>How</dt>
        <dd>Uploaded snaps go through an automated or manual review process. Administrators will define the checks involved in the review process.</dd>
      </dl>
    </div>
  </li>
  <hr />
  <li class="p-stepped-list__item">
    <h3 class="p-stepped-list__title">
      Release
    </h3>
    <div class="p-stepped-list__content">
      <dl>
        <dt>Who</dt>
        <dd>Your designated admin</dd>
        <dt>How</dt>
        <dd>Once approved the snap becomes available to the fleet of devices authorised to connect to your IoT app store.</dd>
      </dl>
    </div>
  </li>
</ol>

### Useful resources

- [Snapcraft documentation: releasing a snap](https://snapcraft.io/docs/releasing-your-app)
- [Process for manually reviewing security-sensitive snaps](https://forum.snapcraft.io/t/process-for-reviewing-classic-confinement-snaps/1460)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/services/guide/snap-application-packaging">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Snap application packaging</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/services/guide/app-store-commissioning">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">App Store commissioning</span>
  </a>
</footer>
