const livepatch = "Kernel Livepatch to avoid unscheduled reboots";
const landscape = "Ubuntu systems management with Landscape";
const knowledgeBase = "Knowledge base access";
const KVMDrivers = "Certified Windows drivers for KVM guests";
const CISBenchmark = "CIS benchmark";
const CISBenchmarkAndAutomation = "CIS benchmark and automation tooling";
const FIPS =
  "Certified compliance with FIPS 140-2 Level 1 certified crypto modules validated by NIST";
const DISA = "DISA STIG";
const CommonCriteria = "Common Criteria EAL2";
const ESMEndDate = "Extended Security Maintenance (ESM) until ";
const MicrosoftActiveDirectory =
  "Advanced Group Policy Object support for Microsoft Active Directory on Ubuntu Desktops";

const versionDetails = {
  22.04: [
    `${ESMEndDate} 2032`,
    livepatch,
    KVMDrivers,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
    MicrosoftActiveDirectory,
  ],
  20.04: [
    `${ESMEndDate} 2030`,
    livepatch,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
    MicrosoftActiveDirectory,
  ],
  18.04: [
    `${ESMEndDate} 2028`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    DISA,
  ],
  16.04: [
    `${ESMEndDate} 2026`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CommonCriteria,
    CISBenchmarkAndAutomation,
    DISA,
  ],
  14.04: [
    `${ESMEndDate} 2024`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    CISBenchmark,
  ],
};

export default versionDetails;
