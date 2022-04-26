---
wrapper_template: "core/services/_markdown.html"
markdown_includes:
  nav: "core/services/shared/_side-navigation.md"
context:
  title: "Custom image creation"
  description: With a private IoT app store to host your snaps, it becomes very easy for you to create custom Ubuntu system images for your certified devices. This section shows how.
  copydoc: "https://docs.google.com/document/d/1yW_0gL8Tr1P2fAw74HVbrL2eB51eusLk_lSeEeVqJW4/edit"
---

With a private [IoT app store](/internet-of-things/appstore) to host your snaps, it becomes very easy for you to create custom Ubuntu system images for your certified devices. This section shows how.

## Image creation process

Creating a custom Ubuntu Core image is a three-stage process. Inputs to this process are a model and a private key, which a build tool uses to create the image.

<figure>
  <img src="https://assets.ubuntu.com/v1/65f355f3-ec829b897aa4e0855e08bc1a025ba74421954352_2_690x349.png" alt="" style="margin: 0;" />
  <figcaption>Illustrated three-stage process to create a custom image</figcaption>
</figure>

## Model-driven image creation

A custom Ubuntu Core image is built from a model specified in a signed configuration file called a [model assertion](https://core.docs.ubuntu.com/en/reference/assertions/model). The declarative approach to image composition makes image building repeatable and easy to automate. Build recipes for custom images can be reused and shared.

Model assertions are json files in which OS components and additional metadata are specified following a simple declarative syntax. Since all OS components are packaged in snaps, model assertions list snaps for key components like the kernel, the bootloader, the root file system, services, and applications that live in the user space.

```json
{
  "type": "model",
  "authority-id": "ACCOUNT_ID",
  "brand-id": "ACCOUNT_ID",
  "store": "STORE_ID",
  "base": "core18",
  "architecture": "armhf",
  "series": "16",
  "model": "mypi3",
  "kernel": "pi-kernel=18-pi3",
  "gadget": "pi=18-pi3",
  "required-snaps": ["network-manager"],
  "timestamp": "2019-01-11T15:55:59+00:00"
}
```

## Private key

Model assertions are signed by a private key. This signature attests user or business (brand) ownership of an image. The signature links the model assertion, and therefore a custom image, to a single sign on (SSO) account. Private keys are generated and registered to an SSO account using [Snapcraft](https://snapcraft.io/), the tool for creating snaps.

## Build tool

Ubuntu-image is the build tool for creating Ubuntu Core images. It is freely available for [download in the snapstore](https://snapcraft.io/ubuntu-image). Ubuntu-image takes a model assertion as input. The tool parses the metadata into model assertions, fetches the required snaps and assembles the output image.

### Helpful resources

- [Tutorial: Build a Ubuntu Core image](https://snapcraft.io/tutorials/create-your-own-core-image#1-overview)
- [Download Ubuntu-image](https://snapcraft.io/ubuntu-image)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/services/guide/app-store-commissioning">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">App store commissioning</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/services/guide/secure-device-onboarding">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Secure device onboarding</span>
  </a>
</footer>
