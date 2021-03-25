const livepatch = "Kernel Livepatch to avoid unscheduled reboots";
const landscape = "Ubuntu systems management with Landscape";
const knowledgeBase = "Knowledge base access";
const KVMDrivers = "Certified Windows drivers for KVM guests";
const CISBenchmark = "CIS benchmark";
const CISBenchmarkAndAutomation = "CIS benchmark and automation tooling";
const FIPS = "FIPS 140-2 Level 1 certified crypto modules";
const DISA = "DISA STIG";
const CommonCriteria = "Common Criteria EAL2";
const ESMEndDate = "Extended Security Maintenance (ESM) until ";

const versionDetails = {
  20.04: [
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    CISBenchmark,
    `${ESMEndDate} 2030`,
  ],
  18.04: [
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    DISA,
    `${ESMEndDate} 2028`,
  ],
  16.04: [
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CommonCriteria,
    CISBenchmarkAndAutomation,
    DISA,
    `${ESMEndDate} 2024`,
  ],
  14.04: [
    `${ESMEndDate} 2022`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    CISBenchmark,
  ],
};

export default versionDetails;
