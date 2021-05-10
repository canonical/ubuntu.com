---
wrapper_template: "core/smartstart/_markdown.html"
markdown_includes:
  nav: "core/smartstart/shared/_side-navigation.md"
context:
  title: "Advanced options"
  description: The following advanced security, integrity and resilience options harden smart devices exposed to challenging environments. All are available as add-ons to SMART START.
  copydoc: "https://docs.google.com/document/d/1xM193QY8qVq57_C_By28pGHDJKZleN49JwelrZzZJWw/edit"
---

The following advanced security, integrity and resilience options harden smart devices exposed to challenging environments. All are available as add-ons to SMART START.

## Secure boot

Ensures the integrity of both the boot mechanism and the operating system environment it bootstraps.

* Guarantees a device can only run a certified workload
* Secures a device against both physical and remote attacks
* Verifies boot binaries, and kernel, against known keys held in the device firmware

## Full disk encryption

Essential for devices with personal information in regulated industries:

* Hardware key management
* Optional key escrow
* Choice of ciphers and hardware acceleration
* Minimal performance impact
* TPM integration with the current CA (x86 only)

## FIPS certification

Allows your devices to meet Federal information processing requirements:

* FIPS-certified kernel and cryptographic libraries
* FIPS certification takes place every six months
* Fully compliant devices must restrict updates to certified versions
(x86 only)

## Kernel Livepatch

Reduce the number of reboots by live patching the running kernel against critical vulnerabilities. Requires specific certified kernel and x86 architecture.

* Maximise service availability
* Fixes are applied automatically, without restarting your system
* Reduces downtime, keeping systems both secure and compliant

## High availability Kubernetes

With [Canonical MicroK8s](https://microk8s.io/) and [Charmed Kubernetes](/kubernetes), you gain a fully CNCF conformance cloud-native Kubernetes for device application operations, including clustering for high availability, service mesh support and automatic security updates.

### Helpful resources

* [Security certifications](/security/certifications)
* [Canonical Livepatch](/livepatch)
* [High availability Kubernetes](/kubernetes)
* [Ubuntu IoT pricing](/pricing/devices)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/smartstart/guide/training-workshops">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Training workshops</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/smartstart/guide/device-enablement">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Device enablement</span>
  </a>
</footer>
