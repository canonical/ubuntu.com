<h1 id="appendix-support-scope">Appendix {{number}} - Support scope</h1>

<h2 id="appendix-support-scope-openstack">Ubuntu Advantage OpenStack</h2>

Definitions:

- "OpenStack" means the cloud computing software known as "OpenStack" as distributed by Canonical with Ubuntu.
- "OpenStack Packages" means packages relative to OpenStack present in the Ubuntu Main repository of the Ubuntu Archive, including updates to those packages delivered in the Ubuntu Cloud Archive. This includes Charms listed at [https://wiki.ubuntu.com/OpenStack/OpenStackCharms](https://wiki.ubuntu.com/OpenStack/OpenStackCharms)
- "Region" means a discrete OpenStack environment with dedicated API endpoints that typically shares only the Identity (Keystone) service with other Regions. An OpenStack Region must be contained within a single datacenter.
- "Public Cloud" means a cloud environment in which third parties are able to create and manage guest instances.
- "Cloud Guest" means an instance of Ubuntu Server not running in a Public Cloud.
- "Full Stack Support" means addressing problems pertaining to user and operations-level OpenStack functionality, performance and availability.
- "Bug-fix Support" means support for valid code bugs in OpenStack Packages only. This does not include troubleshooting of issues to determine if a bug is present.
- "Valid Customizations" means configurations made through Horizon or the OpenStack API of the OpenStack Packages. For the avoidance of doubt, valid customizations do not include architectural changes that are not expressly executed or authorized by Canonical. Configuration options set during a Foundation OpenStack Build should be considered critical to the health of the Cloud. Any changes to these may render the cloud unsupported. Request for changes should be validated by Canonical to ensure continued support.

Supported versions of OpenStack:

- The version of OpenStack provided initially in the release of a Long Term Support (LTS) version of Ubuntu is supported for the entire lifecycle of that Ubuntu version.
- Releases of OpenStack released after an LTS version of Ubuntu are available in the Ubuntu Cloud Archive. Each OpenStack release in the Ubuntu Cloud Archive is supported on an Ubuntu LTS version for a minimum of 18 months from the release date of the Ubuntu version that included the applicable OpenStack version.
- The OpenStack release support schedule is available here [https://www.ubuntu.com/about/release-cycle](/about/release-cycle).

Support of OpenStack

- OpenStack support is provided at the Advanced response times.
- OpenStack support requires each Region to consist of 12 or more supported nodes. All nodes that participate in the OpenStack environment must be covered under an active support agreement.
- In addition to the hardware requirements laid out in [Section 2.2](#support-scope-hardware), hardware must meet the [minimum criteria for Ubuntu OpenStack.](https://assets.ubuntu.com/v1/193373c7-canonical-foundation-cloud-requirements-2018-07-18.pdf)
- Full Stack Support of an OpenStack Cloud is only available when deployed via a Foundation OpenStack Build engagement.
  - Canonical will provide support for the charms deployed via a Foundation OpenStack Build.
  - For any deployments done under contract with Canonical, which results in customization of any Charms, customization will be valid for 90 days after the official release of the Charm which includes the customizations.
  - Support is included for all packages required to run OpenStack as deployed via the Foundation OpenStack Build engagement.
  - Upgrades of OpenStack components as part of the regular Ubuntu LTS maintenance cycle are supported.
  - Upgrades between versions of OpenStack (for instance, from OpenStack Mitaka to Newton) or versions of Ubuntu (for instance, from Ubuntu 14.04 LTS to Ubuntu 16.04 LTS), Juju and MAAS are supported as long as the upgrade is performed following a documented process as specified by Canonical as part of the Foundation OpenStack Build.
  - Addition of new cloud nodes and replacement of existing nodes with new nodes of equivalent capacity are both supported.
  - Full Stack Support excludes customizations which are not considered Valid Customizations.
  - Ubuntu Advantage Virtual Guest Advanced and Ubuntu Advantage Kubernetes Advanced services for Cloud Guests.
- OpenStack clouds not deployed through a Foundation OpenStack Build are limited to Bug-fix Support.

OpenStack support does not include support beyond Bug-fix Support during the deployment or configuration of an OpenStack cloud.

Charms

- Each charm version is supported for one year from the release date.
- Canonical will not provide support for any charms that have been modified from the supported version found in in the page at [https://wiki.ubuntu.com/OpenStack/OpenStackCharms](https://wiki.ubuntu.com/OpenStack/OpenStackCharms).

Support for 12 TB of usable storage per node with Ceph or Swift storage exposed to the OpenStack cluster. This allowance can be used for Ubuntu Advantage Ceph, Ubuntu Advantage Swift or a combination of these. The number of these nodes cannot exceed the number of compute nodes covered in the OpenStack cluster.

Licence to use available Canonical provided Microsoft-certified drivers in Windows Guest instances.

Service excludes:

- Support for workloads other than those required to run an OpenStack deployment.
- Support for guest instances other than Cloud Guests.

<h2 id="appendix-support-scope-server">Ubuntu Advantage Server</h2>

The scope of each particular offering (Essential, Standard, or Advanced) is defined below. The following items are not covered under any Ubuntu Advantage Server offerings.

- Ceph
- Swift
- OpenStack
- Kubernetes

### Summary of service offerings

| Features                                                                                                                                                                                                              |                           Essential                           |                           Standard                            |                           Advanced                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------------------: | :-----------------------------------------------------------: | :-----------------------------------------------------------: |
| 24x7 self-service customer care portal and knowledge base (see [Section 2](#ua-support-scope))                                                                                                                        | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Landscape Management (see [Section 2.5](#support-scope-landscape))                                                                                                                                                    | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Kernel livepatching (per Section [2.4.4](#2-4-4) of this Service Description)                                                                                                                                         | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Extended Security Maintenance ([as defined in this section](#service-offering-definitions))                                                                                                                           | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Ubuntu Legal Assurance programme (see [Section 5](#assurance))                                                                                                                                                        |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| 10x5 phone and ticket support for all packages in Ubuntu main (see [Section 3](#response-times)), except as defined in [this section](#lxd-guest-support)                                                             |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Unlimited [Ubuntu LXD guest support](#lxd-guest-support)                                                                                                                                                              |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| 24x7 phone and ticket support for all packages in Ubuntu main (see [Section 3](#response-times)) and Canonical-maintained packages in backports and universe, except as defined in [this section](#kvm-guest-support) |                                                               |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| Unlimited [Ubuntu guest support](#kvm-guest-support)                                                                                                                                                                  |                                                               |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| [FIPS - certified cryptographic modules](#kvm-guest-support)                                                                                                                                                          |                                                               |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |
| [Common Criteria](#kvm-guest-support)                                                                                                                                                                                 |                                                               |                                                               | ![Yes](https://assets.ubuntu.com/v1/c4b02d61-tick-orange.svg) |

### Essential

Service additionally includes:

- Extended Security Maintenance for Ubuntu.

Service excludes:

- Support beyond that of Canonical’s Knowledge Base.
- Ubuntu Assurance programme.

### Standard

Service additionally includes:

- Ubuntu Advantage Virtual Guest Standard support for an unlimited number of Ubuntu LXD guests.
- Extended Security Maintenance for Ubuntu

Service excludes:

- Support for KVM-related packages and KVM guests.
- Access to the Landscape systems management tool for Ubuntu LXD guests, except where covered by Landscape seats or Landscape on-premises.

### Advanced

Service additionally includes:

- Ubuntu Advantage Virtual Guest Advanced support for an unlimited number of Ubuntu LXD, Ubuntu KVM, and Ubuntu ESXi guests
- Common Criteria for Ubuntu
- FIPS for Ubuntu
- Extended Security Maintenance for Ubuntu

Service excludes:

- Access to the Landscape systems management tool for Ubuntu guests, except where covered by Landscape seats or Landscape on-premises.

<h2 id="appendix-support-scope-virtual-guest">Ubuntu Advantage Virtual Guest</h2>

Virtual Guest services match that of the applicable Ubuntu Advantage Server support offering, subject to the exceptions listed below.

Services are provided for Ubuntu Server when installed and running as a guest in a virtualized environment (1) in an Ubuntu Certified Public Cloud partner’s environment or (2) on a physical host, provided the guest is running on one of the following hypervisors (Only underlying technology is listed. These can be provided via a cloud like OpenStack. If hypervisor vendor provides a specific list of supported Ubuntu versions only those will be eligible for the Ubuntu Advantage Virtual Guest service.):

- KVM | Qemu | Bochs
- VMWare
- LXD | LXC
- Xen
- Hyper-V
- VirtualBox
- z/VM
- Docker

Certified Public Cloud partners can be found in the Ubuntu partner listing: [partners.ubuntu.com/find-a-partner](https://partners.ubuntu.com/find-a-partner)

Service excludes:

- Hypervisor support
- Providing native images for a chosen hypervisor
- Additional exclusions match those of the applicable Ubuntu Advantage Server service offering.

<h2 id="appendix-support-scope-ceph-storage">Ubuntu Advantage Ceph Storage</h2>

Definitions:

- "Cluster" means a single Ceph installation in a single physical data center and specified by a unique identifier.

Support is measured by the total amount of data stored in Ceph across all storage pools, measured in gigabytes. This excludes free space and all replication and erasure coding overhead.

Customers who have purchased Ubuntu Advantage Ceph Storage for an unlimited amount of storage are limited to support in a single Cluster.

Ceph support is provided at the Advanced response times.

Service additionally includes:

- Support for all packages required to run a Ceph deployment.
- Support for all servers necessary to meet the storage and replication requirements. This includes auxiliary (non-storage) nodes such as Ceph monitors.

Service excludes:

- Support for workloads other than those required to run a Ceph deployment.

<h2 id="appendix-support-scope-swift-storage">Ubuntu Advantage Swift Storage</h2>

Definitions:

- "Cluster" means a single Swift installation in a single physical data center and specified by a unique identifier.

Support is measured by the total amount of data stored in Swift across all storage pools, measured in gigabytes. This excludes free space and all replication and erasure coding overhead.

Customers who have purchased Ubuntu Advantage Swift Storage for an unlimited amount of storage are limited to support in a single Cluster.

Swift support is provided at the Advanced response times.

Service additionally includes:

- Support for all packages required to run a Swift deployment.
- Support for all servers necessary to meet the storage and replication requirements. This includes auxiliary (non-storage) nodes such as Swift monitors.

Service excludes:

- Support for workloads other than those required to run a Swift deployment.

<h2 id="appendix-support-scope-maas">Ubuntu Advantage MAAS</h2>

Service includes:

- Support for all servers required to host the MAAS environment following a documented MAAS deployment architecture.
- Support for all packages required to run MAAS.
- Support for the ability to boot machines using operating system images provided by Canonical.
- Support for the tooling required to convert certified operating system images not provided by Canonical into MAAS images.
- Licence to use MAAS Custom Imaging tools.

Service excludes:

- Support for workloads, packages and service components other than those required to run a MAAS deployment.
- Support for the nodes deployed using MAAS.
- Support for design and implementation details of a MAAS deployment.
- Access to Landscape and Canonical Livepatch Service for machines deployed with MAAS.

Supported versions of MAAS:

- Versions of MAAS are supported on an LTS version of Ubuntu for a period of one year from the date it is released in the Ubuntu archives.

<h2 id="appendix-support-scope-switch">Ubuntu Advantage Switch</h2>

Definitions:

- "Whitebox Switch" means an x86 Broadcom ASIC-based switch made by an ODM manufacturer for vendors to label and sell.
- "BCOS" - An Ubuntu optimized version of a full featured Layer 2 and Layer 3 networking software from a Whitebox Switch.

Services include:

- Support for the specific version of Ubuntu required to run BCOS.
- Support for the BCOS software.

Services exclude:

- Support for workloads other than those required to run BCOS.
- Support for versions of the kernel other than those that are provided with the BCOS software.
- Support for the physical hardware. Hardware support is provided by the vendor.
- Landscape SaaS and Landscape on-premises
- Access to Canonical Livepatch Service.

<h2 id="appendix-support-scope-desktop">Ubuntu Advantage Desktop</h2>

Services exclude:

- Virtual machines
- Machine containers
- Application containers
- Dual-booting (cohabitating with other operating systems)
- Peripherals which are not certified to work with Ubuntu
- Support for non-desktop packages
- Community flavours of Ubuntu
- Support for architectures other than x86_64

### Standard

Service additionally includes:

- Basic network authentication and connectivity using sssd, winbind, network-manager, and network-manager related plugins in the Ubuntu Main repository

Service additionally excludes:

- Developer tools
- Support for packages not in the base Ubuntu desktop image

<h2 id="appendix-support-scope-kubernetes">Ubuntu Advantage Kubernetes</h2>

Definitions:

- "Canonical Distribution of Kubernetes" means Kubernetes deployed using Juju and the official Canonical-Kubernetes bundle on bare metal, cloud guests, or virtual machines.
- "Deployment" means the process of deploying the Canonical Distribution of Kubernetes. A deployment is considered successful once Juju reports all applications in a "started" state.
- "Upgrade" means the process of upgrading Kubernetes between versions. An upgrade is considered successful once Juju reports all applications in a "started" state. Canonical will provide support for valid bugs encountered during the Upgrade process.
- "Support" means break-fix support and answering basic questions about Kubernetes. Deployment and Upgrade assistance, as well as configuration and optimization of Kubernetes fall outside the scope of support.

Minimum deployment of the Canonical Distribution of Kubernetes includes a highly-available Juju control plane plus the base configuration of the Canonical-Kubernetes bundle, as documented in [https://jujucharms.com/canonical-kubernetes/](https://jujucharms.com/canonical-kubernetes/). Support must be purchased for all nodes in the supported Kubernetes environment.

Supported versions of Kubernetes include the current stable minor release and the two most recent minor releases in the stable release channel. Additional information can be found at:

- [https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions](https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions)

Support is limited to:

- the software packages and Charms necessary for running the Canonical Distribution of Kubernetes.
- the software packages available from [apt.kubernetes.io](https://apt.kubernetes.io) and Kubernetes clusters deployed using kubeadm.

For any deployment of the Canonical Distribution of Kubernetes carried out by Canonical while under contract for this deployment, which result in the customization of any Charms, the customization will be supported for 90 days after the official release of the Charm which includes the customizations.

<h2 id="appendix-support-scope-esm">Extended Security Maintenance</h2>

Extended Security Maintenance includes available High and Critical CVE fixes for a number of server packages in the Ubuntu Main Repository through 28 April 2020. A complete list of packages included in Extended Security Maintenance can be found at: [https://wiki.ubuntu.com/SecurityTeam/ESM/12.04#Maintained_Packages](https://wiki.ubuntu.com/SecurityTeam/ESM/12.04#Maintained_Packages)

Extended Security Maintenance is included for 64-bit x86 AMD/Intel installations.

Service excludes:

- Bug fixes for packages in the end of life release, unless a bug was created by an Extended Security Maintenance security update.
- Security fixes for packages not found in the Maintained Packages list.
- Security fixes for CVEs that are not High or Critical

Extended Security Maintenance does not guarantee secure software or fixes to all High or Critical CVEs.

<h2 id="appendix-support-scope-livepatch">Canonical Livepatch Service</h2>

Canonical Livepatch Service includes a licence to use Canonical’s kernel livepatch daemon, access to available kernel livepatches, and support for livepatches on all systems covered by Livepatch for which the livepatching features are available.

Canonical provides livepatches for High and Critical kernel CVEs. Note that some CVEs may be ineligible for livepatching due to technical limitations within the livepatching system.

Canonical cannot provide kernel support bug fixes as kernel livepatches.

Kernel livepatching is available for generic and low latency 64-bit Intel/AMD kernels starting with the 4.4 kernel.

Only the default LTS kernel is available for livepatching. This includes its backport as the latest HWE kernel to the previous LTS release.

<h2 id="appendix-support-scope-fips">FIPS for Ubuntu</h2>

Access to packages (when available) sufficient for compliance with the FIPS 140-2 Level 1 standard when used with Ubuntu on certain Supermicro AMD64, IBM POWER8, and IBM Z hardware.

Licences to such packages, to the extent not already licensed under open source software licences.

<h2 id="appendix-support-scope-common-criteria">Common Criteria for Ubuntu</h2>

Access to packages and scripts (when available) sufficient for compliance with the Common Criteria EAL2 standard when used with Ubuntu on certain Supermicro AMD64, IBM POWER8, and IBM Z hardware.

Licences to such packages, to the extent not already licensed under open source software licences.

<h2 id="appendix-support-scope-landscape-seats">Landscape Seats</h2>

Service includes:

- The ability to register physical machines, virtual machines, or containers (based on the purchase) in Landscape SaaS or Landscape on-premises. The quantity of “Seats” purchased is the quantity of machines which can be registered.

Service excludes:

- Support beyond that of the packages required to install and run the Landscape Client.

<h2 id="appendix-support-scope-tam">Technical Account Manager</h2>

Definitions:

- "TAM" means a Canonical support engineer who works remotely to personally collaborate with the customer's staff and management.

Canonical will enhance its support offering by providing a TAM, who will perform the following services for up to 10 hours per week during the term of service:

- Provide support and best-practice advice on platform and configurations covered by the applicable Ubuntu Advantage services.
- Participate in review calls every other week at mutually agreed times addressing the customer's operational issues.
- Organise multi-vendor issue coordination through TSANet or Canonical's direct partnerships where applicable. When the root cause is identified, the TAM will work with the vendor for that sub-system, working to resolve the case through their normal support process.

Canonical will hold a quarterly service review meeting with the customer to assess service performance and determine areas of improvement.

The TAM will visit the customer's site annually for on-site technical review.

The TAM is available to respond to support cases during the TAM's working hours. Outside of such hours, support will be provided per the Ubuntu Advantage Support Process.

<h2 id="appendix-support-scope-dedicated-tam">Dedicated Technical Account Manager</h2>

Definitions:

- "DTAM" means a Canonical support engineer dedicated to work full-time remotely for a single customer.

Canonical will enhance its support offering by providing a DTAM, who will perform the following services during local business hours for up to 40 hours per week (subject to Canonical leave policies) during the term of service:

- Provide support and best-practice advice on platform and configurations covered by the applicable Ubuntu Advantage services.
- Act as the primary point of contact for all support requests originating from the customer department for which the DTAM is responsible.
- Manage support escalations and prioritization in accordance with Canonical's standard support response definitions and customer needs.
- Participate in regular review calls addressing the customer's operational issues.
- Organise multi-vendor issue coordination through TSANet or Canonical's direct partnerships where applicable. When the root cause is identified, the DTAM will work with the vendor for that sub-system, working to resolve the case through their normal support process.
- Attend applicable Canonical internal training and development activities (in-person and remote).

Canonical will hold a quarterly service review meeting with the customer to assess service performance and determine areas of improvement.

The DTAM is available to respond to support cases during the DTAM's working hours. Outside of business hours, support will be provided per the Ubuntu Advantage Support Process.

If a DTAM is on leave for longer than five consecutive business days, Canonical will assign a temporary remote resource to cover the leave period. Canonical will coordinate with the customer with respect to foreseeable DTAM leave.

<h2 id="appendix-support-scope-dedicated-support-engineer">Dedicated Support Engineer</h2>

Definitions:

- “DSE” means a Canonical support engineer dedicated to work full-time for a single customer acting as an extension of the customers support organization with a primary focus on integrating and supporting Canonical's offerings within the customer's environment.

Canonical will enhance its support offering by providing a DSE, who will perform the following services during local business hours for up to 40 hours per week (subject to Canonical leave policies) during the term of service:

- Be available on site as required to meet the customer's requirements.
- Understand the products utilized in the customer's environment that need to be integrated with Canonical's offerings and provide best effort assistance on those products to ensure the successful usage of offerings from Canonical.
- Provide support and best-practice advice on platform and configurations covered by the applicable Ubuntu Advantage services.
- Act as the primary point of contact for all support requests originating from the customer department for which the DSE is responsible.
- Manage support escalations and prioritization in accordance with Canonical's standard support response definitions and customer needs.
- Participate in regular review calls addressing the customer's operational issues.
- Organise multi-vendor issue coordination through TSANet or Canonical's direct partnerships where applicable. When the root cause is identified, the DSE will work with the vendor for that sub-system, working to resolve the case through their normal support process.
- Attend applicable Canonical internal training and development activities (in-person and remote).

Canonical will hold a quarterly service review meeting with the customer to assess service performance and determine areas of improvement.

The DSE is available to respond to support cases during the DSE's working hours. Outside of business hours, support will be provided per the Ubuntu Advantage Support Process.

If a DSE is on leave for longer than five consecutive business days, Canonical will assign a temporary remote resource to cover the leave period. Canonical will coordinate with the customer with respect to foreseeable DSE leave.

<h2 id="appendix-support-scope-landscape-on-premises">Landscape on Premises</h2>

Definitions:

- "Landscape on Premises" means Canonical's Landscape system management software installed on the customer's hardware.

Landscape on Premises support is provided at the Advanced response times.

Service includes:

- Licence to download and install a single instance of Landscape on Premises.
- Ability to use Landscape on Premises management and monitoring services for machines (whether physical or virtual) for which the customer has purchased Ubuntu Advantage services.

Deployment methods:

- When installed using the "Quickstart" install method, support is included for the machine on which Landscape on Premises is installed.
- When installed using a manual install method, support is included for up to two servers on which Landscape on Premises is installed.
- When deployed using Juju, the "dense deployment" method will be supported.

Service excludes:

- Support beyond that of the Landscape on Premises packages.

Supported versions of Landscape on Premises:

- Each release of Landscape on Premises will be supported for 1 year from its release date.

<h2 id="appendix-support-scope-livepatch-on-premises">Livepatch on Premises</h2>

Definitions:

- "Livepatch on Premises" means Canonical's livepatch repository software installed on the customer's hardware.

Livepatch on Premises support is provided at the Advanced response times.

Service includes:

- Licence to download and install a single instance of Livepatch on Premises.

Service excludes:

- Support beyond that of the Livepatch on Premises packages.
- Licenses to register machines to consume livepatches.

Supported versions of Livepatch on Premises:

- Each release of Livepatch on Premises will be supported for 1 year from its release date.

<h2 id="appendix-support-scope-rancher">Ubuntu Advantage Rancher</h2>

Definitions:

- "Rancher" means the software known as Rancher as published by Rancher Labs.

Service includes:

- Break-fix support for, and answering basic questions about, using Rancher 2.x in accordance with the compatibility matrix and support lifecycle published by Rancher Labs at [https://rancher.com/support-maintenance-terms/](https://rancher.com/support-maintenance-terms/) when managing the Canonical Distribution of Kubernetes.

Service excludes:

- Migration of workloads from Rancher 1.x to Rancher 2.x
- Support for, or answering basic questions about 3rd party add-ons to Rancher
- Installation of Rancher
