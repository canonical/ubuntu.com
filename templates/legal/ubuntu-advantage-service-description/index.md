---
wrapper_template: "legal/ubuntu-advantage-service-description/_base_legal_markdown.html"
context:
  title: "Ubuntu Advantage service description"
  description: "Detailed description and explanation of the benefits and services you receive as an Ubuntu Advantage customer."
markdown_includes:
  pricing_table: "shared/_ubuntu-advantage-service-description.html"
---

# Ubuntu Advantage service description

**Valid since 28 March 2022**

As an **Ubuntu Advantage** (**UA**) customer, you are entitled to the following coverage, depending on the appropriate package (**Essential**, **Standard**, or **Advanced**) on a per-machine basis. Each subscription can cover either Infrastructure-only (**UA Infra**), Applications-only (**UA Apps**), or both Infrastructure and Applications (**Ubuntu Pro**) for:

1. **Physical server**: A subscription attached to a physical host running Ubuntu or a Covered Hypervisor. If all physical hosts in the Environment are attached, then UA subscription also covers all Ubuntu guests on those hosts
2. **Virtual** (**VM**): A subscription attached to a Virtual Machine running on a Covered Hypervisor or [Ubuntu Certified Public Cloud](https://www.ubuntu.com/public-cloud)
3. **Desktop**: A subscription limited to Desktop use-cases. It covers packages in the base Ubuntu desktop image as well as packages necessary for basic network authentication and connectivity using sssd, winbind, network-manager, and network-manager plugin. It also covers support (Standard or Advanced) for Ubuntu distribution for [Windows Subsystem for Linux](https://ubuntu.com/wsl) (WSL) and developer tools such as MicroK8s and Multipass

Each subscription can be purchased at one of three levels - **Essential, Standard or Advanced**. Unless otherwise stated, a subscription will be Essential. Detailed pricing can be found at: https://ubuntu.com/pricing

{{ pricing_table | safe }}

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-essential">Essential</h2>

As an Essential customer, you are entitled to the following:

1. <span id="uasd-esm">Extended Security Maintenance (ESM)<span>
    1. ESM provides available High and Critical CVE fixes for a number of packages, as specified below
    2. ESM is only included for 64-bit x86 AMD/Intel installations
    3. Both UA Infra and UA Apps cover packages in the Ubuntu Main repository between [End of Standard Support and End of Life](https://wiki.ubuntu.com/Releases)
    4. UA Apps also covers packages in the Ubuntu Universe repository between the [Release date and End of Life](https://wiki.ubuntu.com/Releases)
    5. ESM does not provide:
        1. Bug fixes, unless a bug was created by an ESM security fix
        2. Security fixes for CVEs that are not High or Critical
        3. A guarantee to fix all High or Critical CVEs
2. <span id="other-security-fixes">Other security fixes</span>
    6. For  UA Infra only: security fixes for OpenStack, Ceph, MAAS
    7. The scope of security fixes for each of those products is described in their respective sections below
3. <a id="uasd-certified" href="/security/certifications">Certified components for compliance, hardening and audit</a>
    8. FIPS 140-2 Level 1 certified modules for Ubuntu 20.04 LTS, 18.04 LTS and 16.04 LTS
    9. Common Criteria EAL2 for Ubuntu 18.04 LTS and 16.04 LTS
    10. Access to certified CIS Benchmark tooling Level 1 and 2 for Ubuntu 18.04 LTS and 16.04 LTS 
    11. Ubuntu Security Guide (USG) for Ubuntu 20.04 LTS which includes certified DISA-STIG profiles and CIS benchmark tooling Level 1 and 2
4. <a id="uasd-landscape" href="https://landscape.canonical.com/">Landscape</a>[]() and knowledge base access
    12. Access to Canonical's Landscape systems management and the knowledge base
5. <a id="uasd-livepatch" href="/livepatch">Kernel Livepatch</a>
    13. Access to Canonical's kernel livepatch client and security livepatches for selected High and Critical kernel CVEs
    14. Kernel Livepatch may provide non-security bug fixes as kernel livepatches
    15. Only the [default LTS kernel](https://ubuntu.com/about/release-cycle) is available for livepatching. This includes its backport as the last HWE kernel to the previous LTS release
    16. Access to Canonical's Livepatch on-prem server

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-standard-and-advanced">Standard and Advanced</h2>

As a Standard or Advanced customer, you are entitled to all of the benefits of the Essential customer plus:

1. <span id="uasd-support-levels">Support levels</span>:
    1. Standard: 24x5 phone and ticket support
    2. Advanced: 24x7 phone and ticket support
2. <span id="uasd-infra-and-apps">Support &mdash; UA Infra and UA Apps</span>:
    3. <span id="uasd-ubuntu-releases">Ubuntu releases</span>
        1. Break-fix support for standard installation, configuration, maintenance, and troubleshooting and usage of any Ubuntu LTS release when installed using official sources and within [Ubuntu lifecycle](https://www.ubuntu.com/about/release-cycle). Bug-fix support is not offered after the [End of Standard Support](https://wiki.ubuntu.com/Releases)
    4. <span id="uasd-certified-hardware">Certified hardware</span>
        2. Ubuntu Certified hardware has passed Canonical's extensive testing and review process. More information about the Ubuntu certification process and a list of certified hardware can be found on the Ubuntu Certification page: [http://www.ubuntu.com/certification](http://www.ubuntu.com/certification)
        3. Full support applies only with respect to customer's hardware that has been certified. In the event a customer requests the services with respect to hardware, which is not certified, Canonical will use reasonable efforts to provide support services, but may not adhere to the obligations described in this service description
    5. <span id="uasd-packages-and-kernels">Supported services</span>
        4. The following packages, kernels and services are within the scope of support:
            1. Canonical maintained packages in Ubuntu Main repository including the "proposed" and "backports" repository pockets
            2. Packages in the Ubuntu Cloud Archive
            3. Canonical maintained Snap packages, Charms and OCI images
            4. [Supported Kernels](https://ubuntu.com/about/release-cycle#Ubuntu%20kernel%20release%20cycle)
            5. Landscape
            6. Kernel Livepatch
        5. Support is not provided for any packages that have been modified
    6. <span id="uasd-kubernetes">Kubernetes</span>
        6. <span id="uasd-kubernetes-cluster">Kubernetes cluster Full-Stack Support requirements</span>:
            7. Kubernetes installations deployed via:
                1. Charmed Kubernetes in at least the minimum deployment configuration
                2. A kubeadm-deployed cluster of unmodified upstream Kubernetes binaries as published by the CNCF deployed on Ubuntu as base OS validated by Canonical
                3. [MicroK8s](https://microk8s.io/)
            8. Highly-Available control plane either deployed using Charms in the Charmed Kubernetes reference architecture or in a similar fashion using kubeadm
            9. Support must be purchased for all Nodes in the supported Kubernetes cluster
            10. Supported versions of Kubernetes include:
                4. Standard or Advanced Support for N-2 (the latest and previous two) releases in the stable release channel
                5. ESM security patching for N-4 (the latest and previous four) releases in the stable release channel
            11. For any deployment of Charmed Kubernetes carried out by Canonical while under contract for a deployment, which results in the customisation of any Charms, the customisation will be supported for 90 days after completion of the deployment
        7. <span id="uasd-kubernetes-support">Limited Kubernetes Support</span>
            12. Unless the Full-Stack Support requirements set out above are met, support is limited to Bug-fix Support for:
                6. The software packages and Charms necessary for running Charmed Kubernetes
                7. Kubernetes clusters deployed using kubeadm utilising the software packages available from apt.kubernetes.io
3. <span id="uasd-infra-only">Support &mdash; UA Infra only</span>:
    7. <span id="uasd-openstack">OpenStack</span>
        8. OpenStack software support depends on the Ubuntu release deployed on the underlying Nodes:
            13. The [version of OpenStack provided initially in the release of a LTS version of Ubuntu ](https://www.ubuntu.com/about/release-cycle )is supported for the entire lifecycle of that Ubuntu version
            14. Releases of OpenStack released after an LTS version of Ubuntu are available in the Ubuntu Cloud Archive. Each OpenStack release in the Ubuntu Cloud Archive is supported on an Ubuntu LTS version for a minimum of 18 months from the release date of the Ubuntu version that included the applicable OpenStack version
        9. OpenStack support requires all Nodes that participate in the OpenStack Cloud to be covered under an active support agreement
        10. OpenStack support includes access to use available Canonical provided Microsoft-certified drivers in Windows Guest instances
        11. <span id="uasd-full-openstack-support">Full OpenStack support</span>
            15. Requirements:
                8. In addition to the requirements set out above, hardware must meet the [minimum criteria](https://assets.ubuntu.com/v1/193373c7-canonical-foundation-cloud-requirements-2018-07-18.pdf) for Charmed OpenStack
                9. The OpenStack Cloud was deployed via a Private Cloud Build or was validated through a Cloud Validation engagement
            16. Scope:
                10. Support for the Charms deployed
                11. For any deployments under contract with Canonical, which result in customisation of any Charms, customisation will be valid for 90 days after the official release of the Charm which includes the customisations
                12. Support is included for all packages required to run OpenStack as deployed
                13. Upgrades of OpenStack components as part of the regular Ubuntu LTS maintenance cycle
                14. Upgrades between versions of OpenStack or LTS versions of Ubuntu, Juju and MAAS are supported as long as the upgrade is performed following a documented process as specified by Canonical as part of the Private Cloud Build or Cloud Validation Package
                15. Addition of new cloud Nodes and replacement of existing Nodes with new Nodes of equivalent capacity are both supported
        12. <span id="uasd-limited-openstack-support">Limited OpenStack support</span>
            17. OpenStack clouds not deployed through a [Private Cloud Build](https://ubuntu.com/pricing/consulting) or validated using the Cloud Validation Package are limited to Bug-fix Support
            18. OpenStack support does not include support beyond Bug-fix Support during the deployment or configuration of an OpenStack cloud
        13. <span id="uasd-exclusions">Exclusions</span>
            19. Full Stack Support excludes customisations which are not considered Valid Customisations
            20. Support for workloads other than those required to run an OpenStack deployment
            21. Support for Guest Instances other than Cloud Guests
    8. <span id="uasd-charms-support">Charms support</span>
        14. Each Charm version is supported for one year from the release date
        15. Canonical will not provide support for any Charms that have been modified from the [supported version](https://docs.openstack.org/charm-guide/latest/reference/openstack-charms.html)
    9. <span id="uasd-storage-support">Storage support</span>
        16. Canonical will provide support for 72TB of raw storage per storage node with Ceph or Swift storage exposed to the OpenStack cluster. This allowance can be used for Ceph, Swift, or a combination of these. Please note that only storage Nodes count towards the 72TB free tier of raw storage per node
        17. If the Node allowance is exceeded, [additional Storage Support](https://ubuntu.com/pricing/infra) needs to be acquired
        18. Customers who have purchased Storage Support for an unlimited amount of storage are limited to support in a single Ceph Cluster or Swift Cluster
    10. <span id="uasd-maas-support">MAAS support</span>
        19. In order to be eligible for MAAS support, all machines connected to a MAAS deployment need to be covered under a MAAS support agreement or UA Infra or Ubuntu Pro
        20. To be eligible for MAAS support, MAAS support must be purchased for all machines not covered by UA Infra or Ubuntu Pro
        21. Versions of MAAS are supported on a corresponding LTS version of Ubuntu for a period of two years from the date that the MAAS version is released
        22. <span id="uasd-maas-support-scope">MAAS support scope</span>:
            22. Support for the ability to boot machines using operating system images provided by Canonical
            23. Support for the tooling required to convert certified operating system images not provided by Canonical into MAAS images
        23. <span id="uasd-out-of-scope">Out of scope</span>. MAAS support does not provide:
            24. Support for workloads, packages and service components other than those required to run a MAAS deployment
            25. Support for the servers that the MAAS service runs on
            26. Support for the Nodes deployed using MAAS but not covered under UA Infra
            27. Support for design and implementation details of a MAAS deployment
            28. Access to Landscape and Canonical Livepatch Service for machines deployed with MAAS
    11. <span id="uasd-ubuntu-assurance-program">Ubuntu Assurance Program</span>
        24. UA Standard and Advanced customers are entitled to the [Ubuntu Assurance Programme](http://www.ubuntu.com/legal/ubuntu-advantage/assurance). Canonical may update the Assurance Programme and its terms periodically
4. <span id="uasd-apps-only">Support &mdash; UA Apps only</span>
    12. Canonical will provide phone and ticket support to the Applications as listed at: https://ubuntu.com/support


<h2 id="uasd-support-exclusions">Support exclusions</h2>

1. The "UA Infra Virtual (VM)" and "UA Apps" services do not include support for Hypervisor, OpenStack, MAAS, Ceph or Swift storage. They also do not include providing native images for a chosen hypervisor
2. Ubuntu Pro Desktop support does not provide:
    1. Dual-booting (cohabitating with other operating systems)
    2. Peripherals which are not certified to work with Ubuntu
    3. Community flavours of Ubuntu
    4. Support for architectures other than x86_64

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-add-ons">Add Ons</h2>

<h3 id="uasd-managed-services">Managed Services</h3>

1. Managed Services are an add-on to UA Infra Advanced, UA Apps Advanced or Ubuntu Pro + Advanced support. When added on, Canonical will manage the Environment as described below. Guests Instance running in the Environment receive the Ubuntu Advantage subscriptions and support
2. Following Canonical's building and initialising of the Environment (subject to separate service engagement), the Managed Service will re-deploy the Environment to reset credentials and validate the deployment process. The Managed Service will also provide documentation providing further detail on the working relationship with Canonical. Additional services can be offered subject to purchasing Professional Support Services (as listed in the section below)
3. The Managed Service will remotely operate, monitor, and manage the Environment. Concrete examples include:
    1. backing up and restoring of the management infrastructure suite
    2. hardware and software failure monitoring and alerting
    3. capacity and performance reporting
    4. security patching and bug fixing
    5. scaling to deal with changes in demand
    6. version upgrades and data migration
    7. administrator credential management
    8. operational monitoring and addressing issues of performance, capacity and alerting
    9. patching and updates. The Managed Service will install applicable (e.g., security) patches and updates from the Ubuntu Cloud Archive to:
        1. The Ubuntu operating system
        2. OpenStack or Kubernetes and its dependencies
        3. OpenStack or Kubernetes Charms
        4. Other software deployed as part of the Environment
    10. Administrative access. The Managed Service will provide the customer with access to the following applications and/or services:
        5. The OpenStack or Kubernetes dashboard, API and CLI
        6. Landscape (restricted to read only access)
        7. Monitoring and logging system (restricted to read only access)
        8. Only Canonical will have login access to Environment Nodes
    11. Environment size. The Managed Service will add or remove Nodes from the Environment as requested by the customer through a support ticket, provided that the Environment does not go under the Minimum Size Requirement. All Environment Nodes must be covered under the service, so additional fees may apply
    12. Ubuntu, OpenStack and Kubernetes upgrades. The Managed Service will ensure the customer's Environment remains on a supported LTS version of Ubuntu and OpenStack and/or Kubernetes
    13. Project work. The Managed Service will provide planned upgrades and maintenance Monday to Friday during Canonical working days
    14. Managed Apps. Canonical will manage Applications from its [managed applications portfolio](https://ubuntu.com/managed/apps). Canonical will expose only API and other user-level interfaces of the Applications
4. Out of scope. The Managed Service does not provide:
    15. For managed OpenStack and managed Kubernetes:
        9. Managing, monitoring, backup or recovery of the operating system, customer generated data and any applications running within Guest Instances or Container Instances
        10. Support for the ability to run Guest Instances using images other than those provided by Canonical
    16. Architectural changes to the Environment
    17. Alternative scheduling of updates or upgrades
    18. Installation of packages or software other than those in the applicable Ubuntu Main Repository or updates to those packages delivered in the Ubuntu Cloud Archive
    19. Unsupported versions of Ubuntu, OpenStack, Kubernetes or applications.
    20. Installation of additional components (e.g. LBaaS, VPNaaS, SDN or SDS) beyond the software installed as part of the building of the Environment
    21. Adherence to the Customer's Change Management requirements/regulations without a DSE
    22. Integration with Customer's ticketing system without a TAM
5. Service conclusion. At the end of the service term, the Managed Service will initiate an operational transfer. Operational transfer includes:
    23. Hand over of all credentials of the hosts, management software, Landscape and Applications to the customer. The continued operation of Landscape is subject to purchase and agreement of appropriate license terms
    24. Coordination of any applicable training (if purchased)
6. Customer dependencies. The Managed Service requires:
    25. Credentials to the Infrastructure being used for the Applications in the case in which such infrastructure is not managed by Canonical, i.e. Managed OpenStack
    26. Continuous VPN access for Canonical support personnel to the Environment
    27. Utilisation parameters per Node to be kept below the maximum specified in the design document provided by Canonical when the Environment is delivered to the customer
    28. The facility where the Environment is hosted to comply with the minimum required measures to function, including but not limited to, connectivity, sufficient power supply, sufficient cooling system, and physical access control to the Environment
    29. The Minimum Size Requirement for the Cloud or Kubernetes cluster maintained at all times
7. Uptime Service Level
    30. The Managed Service includes the following uptime service levels:
      <table class="p-table" style="width: auto;">
        <thead>
          <tr>
            <th></th>
            <th class="u-align--center">Data plane for customer workloads that are distributed across two Regions</th>
            <th class="u-align--center">Data plane for customer workloads that are in a single Region</th>
            <th class="u-align--center">Control plane (OpenStack/ Kubernetes API, Web UI and CLI)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Uptime</td>
            <td class="u-align--center">99.9%</td>
            <td class="u-align--center">99.5%</td>
            <td class="u-align--center">99%</td>
          </tr>
        </tbody>
      </table>
    31. Data plane includes:
        11. Virtualisation (for workloads that are architected to not depend on a single compute node)
        12. Storage (block & object)
        13. Network for instances
    32. Downtime must be directly attributable to Canonical in order for it to count against the service level and is measured across a 12 month period. Planned maintenance windows and any requests by the customer are not taken into account when calculating uptime. Planned maintenance is carried out as required by Canonical, Monday to Friday during Canonical working days

<h3 id="uasd-support-services">Professional Support Services</h3>

1. Technical Account Manager (TAM) is an add-on service to enhance support
    1. Canonical will provide a TAM, who will perform the following services for up to 10 hours per week during local Business Hours during the term of service:
        1. Provide support and best-practice advice on platform and configurations covered by the applicable UA services
        2. Participate in review calls every other week at mutually agreed times addressing the customer's operational issues
        3. Organise multi-vendor issue coordination through TSANet or Canonical's direct partnerships where applicable. When the root cause is identified, the TAM will work with the vendor for that sub-system, working to resolve the case through their normal support process
    2. Canonical will hold a quarterly service review meeting with the customer to assess service performance and determine areas of improvement
    3. If required, the TAM may facilitate integration of the Customer's ticketing system with Canonical's
    4. The TAM will visit the customer's site annually for on-site technical review
    5. The TAM is available to respond to support cases during the TAM's working hours. Outside of such hours, support will be provided per the Ubuntu Advantage Support Process
2. Dedicated Technical Account Manager (DTAM) is an add-on service to enhance support
    6. Canonical will provide a DTAM, who will perform all services provided by TAM and the services listed below during local Business Hours for up to 40 hours per week (subject to Canonical leave policies) during local Business Hours during the term of service:
        4. Act as the primary point of contact for all support requests originating from the customer department for which the DTAM is responsible
        5. Manage support escalations and prioritisation in accordance with Canonical's standard support response definitions and customer needs
        6. Attend applicable Canonical internal training and development activities (in-person and remote)
    7. The DTAM is available to respond to support cases during the DTAM's working hours. Outside of Business Hours, support will be provided per the Ubuntu Advantage Support Process
    8. If a DTAM is on leave for longer than five consecutive days, Canonical will assign a temporary remote resource to cover the leave period. Canonical will coordinate with the customer with respect to foreseeable DTAM leave
3. Dedicated Support Engineer (DSE) is an add-on service to enhance support
    9. Canonical will provide a DSE, who will perform the following services during local Business Hours for up to 40 hours per week (subject to Canonical leave policies) during the term of service:
        7. Be available onsite as required to meet the customer's requirements
        8. Understand the products utilised in the customer's Environment that need to be integrated with Canonical's offerings and assist with those products, to the extent reasonable based on the DSE's expertise, to ensure the successful usage of offerings from Canonical
        9. Provide support and best-practice advice on platform and configurations covered by the applicable UA services
        10. Act as the primary point of contact for all support requests originating from the customer department for which the DSE is responsible
        11. Act as a Canonical representative for Change Management protocols, in turn defending, coordinating and executing required Changes by Managed Services
        12. Manage support escalations and prioritization in accordance with Canonical's standard support response definitions and customer needs
        13. Participate in regular review calls addressing the customer's operational issues
        14. Organise multi-vendor issue coordination through TSANet or Canonical's direct partnerships where applicable. When the root cause is identified, the DSE will work with the vendor for that sub-system, working to resolve the case through their normal support process
        15. Attend applicable Canonical internal training and development activities
    10. Canonical will hold a quarterly service review meeting with the customer to assess service performance and determine areas of improvement
    11. The DSE is available to respond to support cases during the DSE's working hours. Outside of Business Hours, support will be provided per the UA Support Process
    12. If a DSE is on leave for longer than five consecutive business days, Canonical will assign a temporary remote resource to cover the leave period. Canonical will coordinate with the customer with respect to foreseeable DSE leave

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-support-services-process">UA Support Services Process</h2>

1. Service initiation
    1. Upon commencement of the services, Canonical will provide access for a single technical representative to Landscape, the support portal, and the online knowledge base
    2. The customer, through their initial technical representative, may select their chosen technical representatives who act as primary points of contact for support requests. The customer will receive up to 5 dedicated, personalised credentials for technical representatives per every 500 Nodes under UA support, but not more than a total of 15 credentials
    3. The customer may change their specified technical representatives at any time by submitting a support request via the support portal
2. Submitting support requests
    4. The customer may open a support request once the customer account has been provisioned within the support portal
    5. The customer may submit support cases through the support portal or by contacting the support team by telephone, unless otherwise noted
    6. A support case should consist of a single discrete problem, issue, or request
    7. Cases are assigned a ticket number and responded to automatically. All correspondence not entered directly into the case, including emails and telephone calls, will be logged into the case with a timestamp for quality assurance
    8. When reporting a case, the customer should provide an impact statement to help Canonical determine the appropriate severity level. Customers with multiple concurrent support cases may be asked to prioritize cases according to severity of business impact
    9. The customer is expected to provide all information requested by Canonical as we work to resolve the case
    10. Canonical will keep a record of each case within the support portal enabling the customer to track and respond to all current cases and allowing for review of historical cases
3. Support severity levels
    11. Once a support request is opened, a Canonical support engineer will validate the case information and determine the severity level, working with the customer to assess the urgency of the case
    12. Canonical will work 24/7 or during the applicable Business Hours as described below to provide the customer with a work-around or permanent solution following the severity levels as described below.  As soon as core functionality is available, the severity level will be lowered to the new appropriate severity level.
    13. Canonical will use reasonable efforts to respond to support requests made by the customer within the initial response times set forth below, based on the applicable service and severity level, but cannot guarantee a work-around, resolution or resolution time:
      <table class="p-table" style="width: auto;">
        <thead>
          <tr>
            <th>Severity Level</th>
            <th>Description</th>
            <th>Standard initial response time</th>
            <th>Advanced initial response time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Core functionality critical impact/Service down</td>
            <td>4 hours, excluding weekends and holidays</td>
            <td>1 hour</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Core functionality severely degraded</td>
            <td>8 Business Hours</td>
            <td>2 hours</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Standard support request</td>
            <td>12 Business Hours</td>
            <td>6 hours</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Non-urgent requests, including cosmetic, informational and feature requests.</td>
            <td>24 Business Hours</td>
            <td>12 hours</td>
          </tr>
        </tbody>
      </table>
4. Customer assistance. Continuous effort support is dependent on the customer being available at all times to assist Canonical, otherwise Canonical may need to reduce the severity level and its ability to respond
5. Hotfixes. To temporarily resolve critical support cases, Canonical may provide a version of the affected software (e.g. package) that applies a patch. Such versions are referred to as “hotfixes”. Hotfixes provided by Canonical are supported for 90 days after the corresponding patch has been incorporated into a release of the software in the Ubuntu Archives. However, if a patch is rejected by the applicable upstream project, the hotfix will no longer be supported and the case will remain open
6. Support language. Canonical will provide the support in English, unless specified otherwise
7. Remote sessions. At the discretion of a Canonical engineer, a remote access service might be offered to access a supported system. In such a case, Canonical will determine which remote access service to use. Canonical engineers do not perform any remote actions on a supported system
8. Ask for a Peer Review. As a normal business practice, Canonical performs peer reviews on a percentage of all cases. Customers can specifically request a peer review on a case within the case comments or by calling the phone number listed in the support portal. An impartial engineer will be assigned to review the case and provide feedback
9. Management escalation. The customer may escalate support issues following the escalation process:
    14. Non-urgent needs. Request a management escalation within the case itself. A manager will be contacted to review the case and post a response within 1 business day
    15. Urgent needs can be escalated to Canonical's Support & Technical Services Manager by emailing [support-manager@canonical.com](mailto:support-manager@canonical.com). If you require further escalation, email Canonical's Support & Technical Services Director at [operations-director@canonical.com](mailto:operations-director@canonical.com)

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="embedded-services">Embedded Services</h2>

Where services are denoted to be “Embedded” the following applies: 

1. <u>Introduction</u>. You will receive the engineering support and access to Extended Security Maintenance. Canonical will provide such technical support to unmodified Ubuntu LTS release images when installed using official sources and within its [product life cycle](https://www.ubuntu.com/about/release-cycle)
2. <u>Scope</u>. The scope of the service is limited to the appropriate level: UA Infra, UA Apps or Ubuntu Pro offerings, as listed above
3. <u>Engineering Support-only: scope and process</u>.
    You will provide the following:
    1. You are responsible for resolving all end user issues. Canonical will not be supporting end-users directly. You should utilise the Knowledge Base, Launchpad, and other resources in addition to your own resolution systems to find workarounds or resolutions for any issue prior to opening a support case with Canonical
    2. You will search Launchpad, to ensure that the issue is not already known and being resolved and, if it is, provide suspected bug number to Canonical support as reference. Canonical reserves the right to redirect low-level and untriaged issues to you
    3. You are responsible for specifying how an issue arises and in what sub-system it is taking place. You must provide a repeatable test case that Canonical can recreate on the hardware systems to which Canonical has access
    4. You will work with Canonical to provide any debugging or further testing required. You will provide any technical information as requested to resolve the problem. Failure to provide required information or assistance in gathering such information may result in closure of the case. When the final solution has been provided by Canonical, you are responsible for verifying that it solves the issue

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-definitions">Definitions</h2>

**Applications:** the supported Applications as set out at [https://ubuntu.com/support](/support) which are built by Canonical or as otherwise agreed with Canonical. Or Managed Applications as described in the Add-ons section, under Managed Services, and at [https://ubuntu.com/managed](https://ubuntu.com/managed). The list of Applications are subject to change without notice

**Break-fix Support**: assistance in the event of an error or bug and answering basic questions about Supported Packages and Standard Releases of Ubuntu

**Bug-fix Support**: support for valid code bugs in supported packages only. This does not include troubleshooting of issues to determine if a bug is present

**Business Hours:** 08:00&ndash;18:00, Monday&ndash;Friday, local to the customer's headquarters unless another location is agreed. All times exclude public holidays

**Ceph Cluster**: a single Ceph installation in a single physical data center and specified by a unique identifier

**Charm:** a set of scripts compatible with Juju application modelling for the purpose of deploying and configuring relationships between software packages

**Charmed Kubernetes:** Kubernetes deployed using Juju and the official Canonical-Kubernetes bundle on bare metal, Cloud Guests, or virtual machines

**Cloud Guest**: a Guest Instance or Container Instance of Ubuntu Server

**Container Instance: **a container instance running in the cluster

**Covered Hypervisor:** any of: KVM | Qemu | Boch, VMWare ESXi, LXD | LXC, Xen, Hyper-V, VirtualBox, z/VM, Docker, WSL. All Nodes in the cluster have to be subscribed to the service in order to benefit from the unlimited VM support

**CVEs (High and Critical):** High and Critical Common Vulnerabilities and Exposures as assessed by the Ubuntu Security Team. More details can be found at https://ubuntu.com/security/cves

**DSE:** a Canonical dedicated support engineer assigned to work full-time for a single customer acting as an extension of the customer's support organisation with a primary focus on integrating and supporting Canonicals offerings within the customer's Environment

**DTAM:** a Canonical support engineer dedicated to work full-time remotely for a single customer

**Environment**: a cloud or cluster, as applicable to the particular service offering

**End of Life: **a date (10 years after the Release Date) on which the Extended Security Maintenance service for an Ubuntu LTS expires

**End of Standard Support: **a date (5 years after the Release Date) on which free standard security maintenance service for the Ubuntu Main repository of an Ubuntu LTS expires

**Extended Security Maintenance (ESM): **an additional scope of security patching service delivered by the Ubuntu Security Team as found at https://ubuntu.com/security/esm. It covers fixes to High and Critical CVE vulnerabilities for 10 years

**Full Stack Support**: addressing problems pertaining to user and operations-level functionality, performance and availability

**Guest Instance**: a virtual machine instance

**Kubernetes**: the container orchestration software known as “Kubernetes” as distributed by Canonical

**Minimum Size Requirement**: at least 12 host Nodes continuously available for the Cloud or 10 host Nodes continuously available for the Cluster or such other size requirement as agreed with Canonical in writing

**Node**: a Physical Node or Virtual Machine provided to Canonical (or paid for) by the Customer for the purposes of running the Environment.  Any further machines (whether virtual (VM) or container) created on top of a Node are not themselves considered to be Nodes

**OpenStack:** the cloud computing software known as “OpenStack” as distributed by Canonical with Ubuntu

**Physical Node:** a single named/managed unit of physical compute infrastructure, essentially the shelf or rack unit. May contain multiple CPU sockets, cores, NICs, Storage controllers/devices

**Region:** a discrete OpenStack Environment with dedicated API endpoints, which typically shares only the Identity (Keystone) service with other Regions. An OpenStack Region must be contained within a single datacenter.

**Release date: **the general availability release date of an Ubuntu version as found at [https://ubuntu.com/about/release-cycle](https://ubuntu.com/about/release-cycle)

**Swift Cluster:** a single Swift installation in a single physical data center and specified by a unique identifier

**TAM:** a Canonical support engineer who works remotely to personally collaborate with the customer's staff and management

**Ubuntu Main: **the deb package repository of an Ubuntu identified by Canonical as Ubuntu Main

**Ubuntu Universe:**  the deb package repository of an Ubuntu identified by Canonical as Ubuntu Universe

**Valid Customisations:** configurations made through Horizon or the OpenStack API of the OpenStack Packages. For the avoidance of doubt, valid customisations do not include architectural changes that are not expressly executed or authorised by Canonical. Configuration options set during a Private Cloud Build should be considered critical to the health of the Cloud. Any changes to these may render the cloud unsupported. Requests for changes should be validated by Canonical to ensure continued support

**Virtual Machine (VM):** a virtualised compute instance instantiated on a recognised hypervisor technology (KVM, VMWare ESXi, OpenStack or public cloud)

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>
