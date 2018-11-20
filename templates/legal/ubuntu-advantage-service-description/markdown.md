---
wrapper_template: "../_base_legal_markdown.html"
context:
  title: "UASD with Markdown"
  description: How to get Ceph deployed and related to Kubernetes in order to have a default storage class. This allows for easy storage allocation.
---

# Ubuntu Advantage service description

Valid since 16 November 2018

1.  <h2><a name="uasd-overview">Overview</a></h2>

    1.  This document defines the following service offerings. Canonical will provide only those services, as defined in this document, which are covered by the customer's contract.
    2.  Primary service offerings:
        - Ubuntu Advantage OpenStack
        - Ubuntu Advantage Server (Essential/Standard/Advanced)
        - Ubuntu Advantage Virtual Guest (Essential/Standard/Advanced)
        - Ubuntu Advantage Ceph Storage
        - Ubuntu Advantage Swift Storage
        - Ubuntu Advantage MAAS (Standard/Advanced)
        - Ubuntu Advantage Switch (Standard/Advanced)
        - Ubuntu Advantage Desktop (Standard/Advanced)
        - Ubuntu Advantage Kubernetes (Standard/Advanced)
        - Extended Security Maintenance
        - Canonical Livepatch Service
        - FIPS for Ubuntu
    3.  Add on service offerings:
        - Landscape Seats
        - Technical Account Manager
        - Dedicated Technical Account Manager
        - Dedicated Support Engineer
        - Landscape on Premises
        - Livepatch on Premises
        - Ubuntu Advantage Rancher

2.  <h2><a name="uasd-support-scope">Support scope</a></h2>

    Each service offering includes access to Canonical's knowledge base and the support described below within the scope and subject to the exceptions detailed in the [support scope documentation](#appendix-support-scope).

    1.  <h4><a name="uasd-support-scope-releases">Releases</a></h4>
        - Canonical will provide support for installation, configuration, maintenance, and management of any standard release of Ubuntu when installed using official sources and within its product life cycle. The life cycle for each version of Ubuntu are specified here: [www.ubuntu.com/about/release-cycle](/about/release-cycle).
    2.  <h4><a name="uasd-support-scope-hardware">Hardware</a></h4>
        - Ubuntu Certified hardware has passed our extensive testing and review process. More information about the Ubuntu certification process and a list of certified hardware can be found on the Ubuntu Certification page: [certification.ubuntu.com](https://certification.ubuntu.com). The services apply only with respect to the customer's hardware which has been certified. In the event the customer requests the services with respect to hardware which is not certified, Canonical will use reasonable efforts to provide support services, but may not adhere to the obligations described in this service description.
    3.  <h4><a name="uasd-support-scope-packages">Packages</a></h4>
        1.  The services apply only to packages found in the Ubuntu Main Repository and Canonical-owned packages in the Universe Repository except (i) the "proposed" and "backports" repository pockets, and (ii) the exclusions noted in the applicable support scope documentation.  
            The supported packages from the Universe Repository include, but may not be limited to, Juju packages, MAAS packages, the nova-conductor package, and their dependencies to the extent used in connection with those packages.
        2.  Canonical will not provide support for any packages that have been modified from the version in the Ubuntu archives.
    4.  <h4><a name="uasd-support-scope-kernels">Kernels</a></h4>
        1.  The kernel provided initially in the release of a long-term support (LTS) version of Ubuntu is supported for the entire lifecycle of the LTS.
        2.  Hardware enablement (HWE) kernels provide support for newer hardware in an LTS release and are released in conjunction with the non-LTS Ubuntu releases. HWE kernels are supported until the next LTS point release.
        3.  More information about kernel support can be found at [www.ubuntu.com/about/release-cycle](/about/release-cycle)
        4.  Access to Canonical Livepatch Service is included with all support offerings, unless otherwise noted.
    5.  <h4><a name="uasd-support-scope-landscape">Landscape</a></h4>
        1.  All Landscape products, including Landscape on-premises (when purchased) are fully supported.
        2.  Access to the Landscape SaaS systems management tool is included with all support offerings, unless otherwise noted.

3.  <h2><a name="uasd-severity-levels">Severity levels and target response times</a></h2>

    - Once a support request is opened, a Canonical Support Engineer will validate the case information and determine the severity level, working with the customer to assess the urgency of the case.
    - Response times will be as set forth in the Service Description for the applicable service offering.
    - When setting the severity level, Canonical's Support Team will use the definitions as stated below:

    <h4>Severity Level 1 — Core functionality not available</h4>

    Canonical will use continuous effort according to the service level purchased, through appropriate support engineer(s) and/or development engineer(s), to provide a work-around or permanent solution. As soon as core functionality is available, the severity level will be lowered to the new appropriate severity level.

    <h4>Severity Level 2 — Core functionality severely degraded</h4>

    Canonical will provide concerted efforts during the applicable business hours to provide the customer with a work-around or permanent solution. As soon as core functionality is no longer severely degraded, the severity level will be lowered to level 3.

    <h4>Severity Level 3 — Standard support request</h4>

    Canonical will use reasonable efforts during the applicable business hours to provide the customer with a work-around or permanent solution as soon as possible, balanced against higher severity level cases. If a work-around is provided, Canonical's support engineers will continue to work on developing a permanent resolution to the case.

    <h4>Severity Level 4 — Non-urgent request</h4>

    Level 4 requests include cosmetic issues, informational requests, feature requests, and similar matters. Canonical does not provide a timeline or guarantee for inclusion of any feature requests. Canonical will review each level 4 case and determine whether it is a product enhancement to be considered for a future release, an issue to be fixed in the current release or an issue to be fixed in a future release. Canonical will review and respond to information requests with a reasonable level of effort during coverage hours. Canonical may close cases representing level 4 issues after responding if Canonical believes it is appropriate to do so.

    <h3>Response times</h3>

    - Canonical will use reasonable efforts to respond to support requests made by the customer within the response times set forth below, based on the applicable service and severity level.
    - “Business hours” are defined as 08:00 - 18:00 Monday - Friday local to the customer’s headquarters unless another location is agreed. All times exclude public holidays.

    Table of target initial response times

    |                  | Standard          | Advanced/Managed Services |
    | ---------------- | ----------------- | ------------------------- |
    | Severity Level 1 | 2 business hours  | 1 hour                    |
    | Severity Level 2 | 4 business hours  | 4 business hours          |
    | Severity Level 3 | 10 business hours | 6 business hours          |
    | Severity Level 4 | 20 business hours | 10 business hours         |

4.  <h2><a name="uasd-support-process">Support process</a></h2>

    Canonical will use reasonable efforts to resolve support cases, but Canonical does not guarantee a work-around, resolution or resolution time.

    1.  Canonical will provide the services [following the support process](#appendix-support-process).
    2.  The customer may escalate support issues [following the escalation process](#appendix-management-escalation).

5.  <h2><a name="uasd-assurance">Assurance</a></h2>

    1.  The customer is entitled to participate in the Ubuntu Assurance Programme, subject to its terms and conditions. Canonical may update the Assurance Programme and its terms periodically. The current Ubuntu Assurance Programme and its IP indemnification terms are available at our Ubuntu Assurance page: [www.ubuntu.com/legal/ubuntu-advantage-assurance](/legal/ubuntu-advantage-assurance).

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

{% include "legal/shared/_appendix-support-scope.md" with number="1" %}

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

{% include "legal/shared/_appendix-support-process.md" with number="2" %}

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

{% include "legal/shared/_appendix-management-escalation.md" with number="3" %}

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>
