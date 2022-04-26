---
wrapper_template: "core/services/_markdown.html"
markdown_includes:
  nav: "core/services/shared/_side-navigation.md"
context:
  title: "Operating an app store"
  description: Once connected to an app store, devices access a catalog of snaps curated by the owner. Connected devices check for updates of these apps regularly.
  copydoc: "https://docs.google.com/document/d/18-ZuGhxjVIOMocWxBzJOi-joHNSuD-zDxCT9ytcR1jM/edit"
---

Once connected to an app store, devices access a catalog of snaps curated by the owner. Connected devices check for updates of these apps regularly. Store owners determine software update policies for devices connected to their store, and can monitor devices connected to their store through a dashboard for live analytics.

## Curating a catalog of snaps

<figure>
  <img src="https://assets.ubuntu.com/v1/ed56703e-17408ec8532971e81758606615e2f00440c74198_2_690x291.png" alt="" style="margin: 0" />
  <figcaption>Illustration of snap source for a app store</figcaption>
</figure>

Snaps offered to fleets of authenticated and authorised devices can be curated from three content sources. The first source is the proprietary snaps published by the owner of the store. The second source is publicly available snaps from the global snap store. And the third source is snaps published by third parties, that the owner is allowed to distribute. Single snaps can be selected from these different sources to assemble a catalog for a particular fleet of devices. Owners have full control over the versions of the public or third party snaps included in their catalogs.

## Managing updates

By default, devices connected to an app store check for updates every six hours. Should a software update be available within this interval, connected devices update automatically.

However, this update frequency can be modified to schedule updates in a manner more suitable to the user of the device (for instance, updating during scheduled downtime periods for devices in a factory).

Software updates are not necessarily applied to devices when they are fetched automatically. You can determine what specific software revisions get applied to your fleet. Decoupling software updates from installation allows time for testing and validating new revisions before they are applied.

## Release management

<figure>
  <img src="https://assets.ubuntu.com/v1/cd144400-cd1444003e77879515eaf0b4bacc0eca97e3abab.png" alt="" style="margin: 0" />
  <figcaption>The releases screen from snapcraft.io</figcaption>
</figure>

Channels define which release of a snap is installed and tracked for updates. A channel consists of, and is subdivided into, tracks, risk-levels and branches:

- [Tracks](https://snapcraft.io/docs/channels#heading--tracks) enable snap developers to publish multiple supported releases of their application.
- [Risk-levels](https://snapcraft.io/docs/channels#heading--risk-levels) reflect the stability of a snap.
- [Branches](https://snapcraft.io/docs/channels#heading--branches) help with bug-fixing.

After a snap has been [created](https://snapcraft.io/docs/creating-a-snap) and [released](https://snapcraft.io/docs/releasing-your-app) to the [snap store](https://snapcraft.io/store), its published revisions can be moved between [channels](https://snapcraft.io/docs/channels) from both the command line and from the [snap store web UI](https://snapcraft.io/docs/using-the-snap-store).

## Monitoring and analytics

<figure>
  <img src="https://assets.ubuntu.com/v1/e2a6f31e-138aaa31f7468a5812970068ff7994f636e7873e_2_690x374.png" alt="" style="margin: 0;" />
  <figcaption>Usage charts are available in stores</figcaption>
</figure>

User engagement, adoption, retention and churn can be actively tracked from the analytics dashboard available in each app store. Usage analytics can be fine grained to specific app versions and / or revisions.

Monitoring capabilities embedded in app stores enable detailed usage metering. As a consequence, store usage can be billed with precision.

### Helpful resources

- [Keeping snaps up to date](https://snapcraft.io/docs/keeping-snaps-up-to-date)
- [Release management](https://snapcraft.io/docs/release-management)
- [Channels](https://snapcraft.io/docs/channels)
- [Refresh control](https://core.docs.ubuntu.com/en/build-store/refresh-control)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/services/guide/secure-device-onboarding">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Secure device onboarding</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/services/guide/technical-support">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Technical support</span>
  </a>
</footer>
