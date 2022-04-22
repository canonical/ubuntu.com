---
wrapper_template: "core/services/_markdown.html"
markdown_includes:
  nav: "core/services/shared/_side-navigation.md"
context:
  title: "Secure device onboarding"
  description: Ubuntu Core devices are onboarded to their owner's IoT app store in a secure manner. Secure onboarding prevents unauthorised access to private software and services. It also establishes a secure communication link between devices and their cloud backend.
  copydoc: "https://docs.google.com/document/d/1hozMj8tjtvdM40jAesmK3_IctGvLwYsry88GECvfM0s/edit"
---

Ubuntu Core devices are onboarded to their owner's IoT app store in a secure manner. Secure onboarding prevents unauthorised access to private software and services. It also establishes a secure communication link between devices and their cloud backend.

Secure device onboarding is a four stage process that starts with a request for serial keys, proceeds with device initiation from the cloud, and ends with device authentication and authorisation. The first two stages are handled by the [serial vault](https://github.com/CanonicalLtd/serial-vault) which is a service that issues credential to devices.

<figure>
  <img src="https://assets.ubuntu.com/v1/29944474-19c88fc1e15e2058793f9d8be18ba042603eb2c7_2_690x419.png" alt="" style="margin: 0" />
  <figcaption>Secure device onboarding four stage process Illustration</figcaption>
</figure>

## Device initialisation

The secure onboarding process starts at first boot. When turned on for the first time, an Ubuntu Core device extracts its private key, its serial number, and its owner's ID from metadata stored in its model assertion. Based on this data, the device will send a request for a serial assertion to its vault, which is hosted either by Canonical or on premise. The vault service processes the request. Had the device's public key been stored in the vault, a serial assertion is issued as response to the request. The serial assertion issued by the serial vault is then stored on the device.

## Authentication and authorisation

Both the serial and the model assertions will be used by devices to access your app store. Devices will use these secure documents to initiate a handshake with your app store. The app store authenticates the keys and authorises the device for a fixed period of time.

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/services/guide/custom-image-creation">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Custom image creation</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/services/guide/operating-an-app-store">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Operating an app store</span>
  </a>
</footer>
