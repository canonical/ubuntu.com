---
wrapper_template: "core/services/_markdown.html"
markdown_includes:
  nav: "core/services/shared/_side-navigation.md"
context:
  title: "Device enablement"
  description: Device enablement is a service available for OEMs who want to bring up a board to run Ubuntu. Embedded applications depend on the kernel, drivers, libraries, filesystems and runtimes.
  copydoc: "https://docs.google.com/document/d/1_sIGC0lTNqP2cmyEcelo5BeW25fkxxnKVjzsvK1bLdM/edit"
---

Device enablement is a service available for OEMs who want to bring up a board to run Ubuntu. Embedded applications depend on the kernel, drivers, libraries, filesystems and runtimes. Canonical builds these primitives for you. Canonical delivers a custom kernel matching a standard Ubuntu LTS release.

## Scope and capabilities

Canonical creates a production image and a development image for your device. These images are built on a custom kernel, based on the build support package (BSP) provided by the OEM/ODM. All hardware interfaces are enabled in the production image.

We require several units of the target device, along with the associated peripherals, for testing. You ensure that software delivered to Canonical, including all drivers and firmware in the BSP, is licensed under the necessary rights for Canonical to redistribute and publish the software.

## Bug reporting

Canonical has established standard QA processes and procedures for device enablement. These cover bug tracking, triage, and resolution through [Launchpad](https://launchpad.net/). A private area of Launchpad is dedicated to bugs related to device enablement. Both the customer and Canonical have access to this area.

## Hardware testing

Canonical provides Checkbox a software tool for automated hardware testing. Checkbox runs test cases that certify that target devices fully work with Ubuntu.

<figure>
  <img src="https://assets.ubuntu.com/v1/5af96a42-744120dff6348094db7a850513d5e6b81d0ff54a_2_690x402.png" alt="" style="margin: 0;" />
  <figcaption>Result screen of a Checkbox test run focused on Audio tests</figcaption>
</figure>

We carry out automated hardware tests on customer provided hardware in house. We then provide you with a summary validation report including test cases, a list of issues found that remain open, and severity of open issues.

## Maintenance and security

We monitor software continuously and rigorously to quickly identify and fix any issues that may arise. Monitoring is achieved by continuously performing automated tests on customer hardware. This ensures that the custom OS images we deliver to the customer continue to perform as expected.

Should a high or critical security CVE threat emerge, we provide maintenance updates. Canonical systematically runs automated Checkbox tests to verify updates do not introduce any software regressions.

- Maintenance follows the Ubuntu stable release update process as currently defined at https://wiki.ubuntu.com/StableReleaseUpdates.
- Maintenance updates follow the kernel SRU cadence. Specific kernel SRU cadence dates and schedule is posted to the [kernel-sru-announce mailing list](https://lists.ubuntu.com/mailman/listinfo/kernel-sru-announce), as well as on the front page of https://kernel.ubuntu.com/.
- Operating system updates and driver updates follow the above noted kernel SRU cadence; generally on a cadence of once per month.

### Helpful resources

- [Ubuntu stable release process](https://wiki.ubuntu.com/StableReleaseUpdates)

<footer class="p-article-pagination">
  <a class="p-article-pagination__link--previous" href="/core/services/guide/advanced-options">
    <span class="p-article-pagination__label">Previous</span>
    <span class="p-article-pagination__title">Advanced options</span>
  </a>
  <a class="p-article-pagination__link--next" href="/core/services/guide/certification-and-validation">
    <span class="p-article-pagination__label">Next</span>
    <span class="p-article-pagination__title">Certification and validation</span>
  </a>
</footer>
