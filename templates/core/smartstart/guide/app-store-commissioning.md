---
wrapper_template: "core/smartstart/_markdown.html"
markdown_includes:
  nav: "core/smartstart/shared/_side-navigation.md"
context:
  title: "App store commissioning"
  description: SMART START customers benefit from their own IoT app store. While app stores are hosted by Canonical, they are entirely operated by customers. This section describes the first steps a customer takes when commissioning their app store.
  copydoc: "https://docs.google.com/document/d/15WmVD7i1nZ8ntQjDKhEcBymaEAdTyqH4yrM62r0VIsM/edit"
---

SMART START customers benefit from their own IoT app store. While app stores are hosted by Canonical, they are entirely operated by customers. This section describes the first steps a customer takes when commissioning their app store.

<p><a href="https://assets.ubuntu.com/v1/d6d1d3fc-IoT+App+Store+Datasheet+v3.pdf" class="p-link--external">Read the IoT app store datasheet</a></p>

## IoT app store overview

<figure>
  <img src="https://assets.ubuntu.com/v1/4c643824-6b54614448e024073b3defc6976c28b7e4fd03dd_2_690x437.png" alt="" style="margin: 0;" />
  <figcaption>An illustraion of a brand store architecture</figcaption>
</figure>

Owners curate content to include in their IoT app stores. This content can comprise private snaps and third party snaps (from the community or ecosystem partners). Apps can only be accessed by authenticated and authorised devices. The serial vault is the private device provisioning service (for authentication) associated with an IoT app store.

Commissioning an IoT app store occurs in four simple steps:

### 1. Create a IoT app store

The first step is to create a brand account. A brand account has extensive permissions. It can be used for certain functions including to:

- Generate, register and hold the signing keys for all associated IoT app stores.
- Sign configuration files used to build device images with access to the IoT app store.
- Register key software components hosted in the app store (kernels and bootloaders).

### 2. Create SSO accounts and assign roles

IoT app stores are administered via a dashboard. [Ubuntu SSO](https://login.ubuntu.com/) is the identity provider for the IoT app store. Each account requires an email address. .

The app store administrators can assign the following roles to accounts:

| Role                | Description                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Store Administrator | Assign roles to other accounts<br>Curate snaps hosted in the store<br>Manage keys stored in the serial vault                       |
| Publisher           | Publisher Register snap names in the store<br>Configure a team of collaborators for such snaps.<br>Publish specific snap revisions |
| Collaborator        | Upload snap revisions to the store<br>Release snap revisions onto store channels                                                   |
| Reviewer            | Accept uploaded snap revisions before the revision can be published                                                                |
| Viewer              | Download snaps from IoT app stores<br>Build images that include snaps published in IoT app stores                                  |

### 3. Configure the serial vault

A serial vault stores various keys and also provides signed configuration files to devices. These keys allow devices to authenticate against IoT app stores. At first boot, a device running Ubuntu Core will perform a provisioning step to retrieve a signed configuration file from the serial vault and establish a session with the IoT app store.

The main configuration files that are stored and served by the serial vault are:

| Resource         | Description                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account key      | Cryptographic key used to sign assertions                                                                                                                     |
| Model assertion  | The model assertion is a statement by a brand about the properties of a device model. It should contain all information needed to create an Ubuntu Core image |
| Serial assertion | A statement binding a device identity with the device public key.                                                                                             |

All of these are used by the device, serial vault and IoT app store to verify and manage the access to a device.

### 4. Create sub-stores

Store Administrators can create derivative IoT app stores hierarchically tied to their account. Sub stores can be created for the following use cases:

- Product sub stores: enterprises with a product portfolio can create sub stores associated with different product lines or to specific product models.
- Ecosystem sub stores: enterprises can create stores on behalf of their ecosystem partners. These could be resellers, subsidiaries or business partners.

### Helpful resources

- [Read more about IoT app stores](/internet-of-things/appstore)
- [IoT app store datasheet](https://assets.ubuntu.com/v1/d6d1d3fc-IoT+App+Store+Datasheet+v3.pdf)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/smartstart/guide/snap-publishing">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Snap publishing</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/smartstart/guide/custom-image-creation">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Custom image creation</span>
  </a>
</footer>
