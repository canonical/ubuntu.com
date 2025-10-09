// Helper function to process raw data arrays, converting date strings to Date objects
const processDates = (releases) =>
  releases.map((release) => ({
    ...release,
    startDate: new Date(release.startDate),
    endDate: new Date(release.endDate),
  }));

// Helper function to get ordered, unique task names from a data source
const getUniqueTaskNames = (releases) => [
  ...new Set(releases.map((release) => release.taskName)),
];

// --- RAW DATA DEFINITIONS ---
// Data is defined here with simple strings for better readability.

const rawServerAndDesktopReleases = [
  {
    startDate: "2014-04-01T00:00:00",
    endDate: "2019-04-02T00:00:00",
    taskName: "14.04 LTS (Trusty Tahr)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2019-04-02T00:00:00",
    endDate: "2024-04-02T00:00:00",
    taskName: "14.04 LTS (Trusty Tahr)",
    status: "ESM",
  },
  {
    startDate: "2024-04-02T00:00:00",
    endDate: "2026-04-02T00:00:00",
    taskName: "14.04 LTS (Trusty Tahr)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2016-04-01T00:00:00",
    endDate: "2021-04-02T00:00:00",
    taskName: "16.04 LTS (Xenial Xerus)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2021-04-02T00:00:00",
    endDate: "2026-04-02T00:00:00",
    taskName: "16.04 LTS (Xenial Xerus)",
    status: "ESM",
  },
  {
    startDate: "2016-04-01T00:00:00",
    endDate: "2026-04-02T00:00:00",
    taskName: "16.04 LTS (Xenial Xerus)",
    status: "MAIN_UNIVERSE",
  },
  {
    startDate: "2026-04-01T00:00:00",
    endDate: "2028-04-02T00:00:00",
    taskName: "16.04 LTS (Xenial Xerus)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2018-04-01T00:00:00",
    endDate: "2023-05-02T00:00:00",
    taskName: "18.04 LTS (Bionic Beaver)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2023-05-02T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "18.04 LTS (Bionic Beaver)",
    status: "ESM",
  },
  {
    startDate: "2018-04-01T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "18.04 LTS (Bionic Beaver)",
    status: "MAIN_UNIVERSE",
  },
  {
    startDate: "2028-04-01T00:00:00",
    endDate: "2030-04-01T00:00:00",
    taskName: "18.04 LTS (Bionic Beaver)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2025-05-02T00:00:00",
    taskName: "20.04 LTS (Focal Fossa)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2025-05-02T00:00:00",
    endDate: "2030-04-02T00:00:00",
    taskName: "20.04 LTS (Focal Fossa)",
    status: "ESM",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2030-04-02T00:00:00",
    taskName: "20.04 LTS (Focal Fossa)",
    status: "MAIN_UNIVERSE",
  },
  {
    startDate: "2030-04-01T00:00:00",
    endDate: "2032-04-02T00:00:00",
    taskName: "20.04 LTS (Focal Fossa)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "22.04 LTS (Jammy Jellyfish)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2032-04-01T00:00:00",
    taskName: "22.04 LTS (Jammy Jellyfish)",
    status: "MAIN_UNIVERSE",
  },
  {
    startDate: "2027-04-01T00:00:00",
    endDate: "2032-04-01T00:00:00",
    taskName: "22.04 LTS (Jammy Jellyfish)",
    status: "ESM",
  },
  {
    startDate: "2032-04-01T00:00:00",
    endDate: "2034-04-01T00:00:00",
    taskName: "22.04 LTS (Jammy Jellyfish)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2024-04-25T00:00:00",
    endDate: "2034-04-25T00:00:00",
    taskName: "24.04 LTS (Noble Numbat)",
    status: "MAIN_UNIVERSE",
  },
  {
    startDate: "2024-04-25T00:00:00",
    endDate: "2029-04-25T00:00:00",
    taskName: "24.04 LTS (Noble Numbat)",
    status: "HARDWARE_AND_MAINTENANCE_UPDATES",
  },
  {
    startDate: "2029-04-25T00:00:00",
    endDate: "2034-04-25T00:00:00",
    taskName: "24.04 LTS (Noble Numbat)",
    status: "ESM",
  },
  {
    startDate: "2034-04-25T00:00:00",
    endDate: "2036-04-25T00:00:00",
    taskName: "24.04 LTS (Noble Numbat)",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2024-10-01T00:00:00",
    endDate: "2025-07-01T00:00:00",
    taskName: "24.10 (Oracular Oriole)",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2026-01-05T00:00:00",
    taskName: "25.04 (Plucky Puffin)",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2025-10-01T00:00:00",
    endDate: "2026-07-07T00:00:00",
    taskName: "25.10 (Questing Quokka)",
    status: "INTERIM_RELEASE",
  },
];
const rawKernelReleases = [
  {
    startDate: "2025-10-01T00:00:00",
    endDate: "2026-07-01T00:00:00",
    taskName: "25.10",
    taskVersion: "6.17 kernel",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2025-08-01T00:00:00",
    endDate: "2026-01-01T00:00:00",
    taskName: "24.04.3 LTS (HWE)",
    taskVersion: "6.14 kernel",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2026-01-01T00:00:00",
    taskName: "25.04",
    taskVersion: "6.14 kernel",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2024-08-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "22.04.5 LTS (HWE)",
    taskVersion: "6.8 kernel",
    status: "LTS",
  },
  {
    startDate: "2027-04-01T00:00:00",
    endDate: "2032-03-31T00:00:00",
    taskName: "22.04.5 LTS (HWE)",
    taskVersion: "6.8 kernel",
    status: "ESM",
  },
  {
    startDate: "2032-03-31T00:00:00",
    endDate: "2034-04-29T00:00:00",
    taskName: "22.04.5 LTS (HWE)",
    taskVersion: "6.8 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2029-04-01T00:00:00",
    taskName: "24.04.[0 or 1] LTS",
    taskVersion: "6.8 kernel",
    status: "LTS",
  },
  {
    startDate: "2029-04-01T00:00:00",
    endDate: "2034-03-31T00:00:00",
    taskName: "24.04.[0 or 1] LTS",
    taskVersion: "6.8 kernel",
    status: "ESM",
  },
  {
    startDate: "2034-03-31T00:00:00",
    endDate: "2036-04-29T00:00:00",
    taskName: "24.04.[0 or 1] LTS",
    taskVersion: "6.8 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "22.04.[0 or 1] LTS",
    taskVersion: "5.15 kernel",
    status: "LTS",
  },
  {
    startDate: "2027-04-01T00:00:00",
    endDate: "2032-03-01T00:00:00",
    taskName: "22.04.[0 or 1] LTS",
    taskVersion: "5.15 kernel",
    status: "ESM",
  },
  {
    startDate: "2032-03-01T00:00:00",
    endDate: "2034-04-29T00:00:00",
    taskName: "22.04.[0 or 1] LTS",
    taskVersion: "5.15 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2022-08-01T00:00:00",
    endDate: "2025-04-30T00:00:00",
    taskName: "20.04.5 LTS (HWE)",
    taskVersion: "",
    status: "LTS",
  },
  {
    startDate: "2025-04-30T00:00:00",
    endDate: "2030-04-29T00:00:00",
    taskName: "20.04.5 LTS (HWE)",
    taskVersion: "",
    status: "ESM",
  },
  {
    startDate: "2030-04-29T00:00:00",
    endDate: "2032-04-29T00:00:00",
    taskName: "20.04.5 LTS (HWE)",
    taskVersion: "",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2020-08-13T00:00:00",
    endDate: "2023-04-30T00:00:00",
    taskName: "18.04.5 LTS (HWE)",
    taskVersion: "5.4 kernel",
    status: "LTS",
  },
  {
    startDate: "2023-04-30T00:00:00",
    endDate: "2028-04-28T00:00:00",
    taskName: "18.04.5 LTS (HWE)",
    taskVersion: "5.4 kernel",
    status: "ESM",
  },
  {
    startDate: "2028-04-28T00:00:00",
    endDate: "2030-04-28T00:00:00",
    taskName: "18.04.5 LTS (HWE)",
    taskVersion: "5.4 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2020-04-06T00:00:00",
    endDate: "2025-04-30T00:00:00",
    taskName: "20.04.[0 or 1] LTS",
    taskVersion: "",
    status: "LTS",
  },
  {
    startDate: "2025-04-30T00:00:00",
    endDate: "2030-04-29T00:00:00",
    taskName: "20.04.[0 or 1] LTS",
    taskVersion: "",
    status: "ESM",
  },
  {
    startDate: "2030-04-29T00:00:00",
    endDate: "2032-04-29T00:00:00",
    taskName: "20.04.[0 or 1] LTS",
    taskVersion: "",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2018-08-02T00:00:00",
    endDate: "2021-04-30T00:00:00",
    taskName: "16.04.5 LTS (HWE)",
    taskVersion: "4.15 kernel",
    status: "LTS",
  },
  {
    startDate: "2021-04-30T00:00:00",
    endDate: "2026-04-29T00:00:00",
    taskName: "16.04.5 LTS (HWE)",
    taskVersion: "4.15 kernel",
    status: "ESM",
  },
  {
    startDate: "2026-04-29T00:00:00",
    endDate: "2028-04-29T00:00:00",
    taskName: "16.04.5 LTS (HWE)",
    taskVersion: "4.15 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2018-04-26T00:00:00",
    endDate: "2023-04-30T00:00:00",
    taskName: "18.04.[0 or 1] LTS",
    taskVersion: "",
    status: "LTS",
  },
  {
    startDate: "2023-04-30T00:00:00",
    endDate: "2028-04-28T00:00:00",
    taskName: "18.04.[0 or 1] LTS",
    taskVersion: "",
    status: "ESM",
  },
  {
    startDate: "2028-04-28T00:00:00",
    endDate: "2030-04-28T00:00:00",
    taskName: "18.04.[0 or 1] LTS",
    taskVersion: "",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2016-08-04T00:00:00",
    endDate: "2019-04-30T00:00:00",
    taskName: "14.04.5 LTS (HWE)",
    taskVersion: "4.4 kernel",
    status: "LTS",
  },
  {
    startDate: "2019-04-30T00:00:00",
    endDate: "2024-04-29T00:00:00",
    taskName: "14.04.5 LTS (HWE)",
    taskVersion: "4.4 kernel",
    status: "ESM",
  },
  {
    startDate: "2024-04-29T00:00:00",
    endDate: "2026-04-29T00:00:00",
    taskName: "14.04.5 LTS (HWE)",
    taskVersion: "4.4 kernel",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2016-04-21T00:00:00",
    endDate: "2021-04-30T00:00:00",
    taskName: "16.04.[0 or 1] LTS",
    taskVersion: "",
    status: "LTS",
  },
  {
    startDate: "2021-04-30T00:00:00",
    endDate: "2026-04-29T00:00:00",
    taskName: "16.04.[0 or 1] LTS",
    taskVersion: "4.4 kernel",
    status: "ESM",
  },
  {
    startDate: "2026-04-29T00:00:00",
    endDate: "2028-04-29T00:00:00",
    taskName: "16.04.[0 or 1] LTS",
    taskVersion: "",
    status: "PRO_LEGACY_SUPPORT",
  },
  {
    startDate: "2014-04-25T00:00:00",
    endDate: "2019-04-30T00:00:00",
    taskName: "14.04.[0 or 1] LTS",
    taskVersion: "",
    status: "LTS",
  },
  {
    startDate: "2019-04-30T00:00:00",
    endDate: "2024-04-30T00:00:00",
    taskName: "14.04.[0 or 1] LTS",
    taskVersion: "",
    status: "ESM",
  },
  {
    startDate: "2024-04-30T00:00:00",
    endDate: "2026-04-30T00:00:00",
    taskName: "14.04.[0 or 1] LTS",
    taskVersion: "",
    status: "PRO_LEGACY_SUPPORT",
  },
];
const rawKernelReleases2204 = [
  {
    startDate: "2022-04-23T00:00:00",
    endDate: "2027-04-22T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2027-04-22T00:00:00",
    endDate: "2032-04-20T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "ESM",
  },
  {
    startDate: "2022-08-21T00:00:00",
    endDate: "2027-04-22T00:00:00",
    taskName: "Ubuntu 22.04.1 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2024-02-01T00:00:00",
    endDate: "2024-08-01T00:00:00",
    taskName: "Ubuntu 22.04.4 LTS (v6.5)",
    status: "LTS",
  },
];
const rawKernelReleases2004 = [
  {
    startDate: "2022-08-11T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2025-04-22T00:00:00",
    endDate: "2030-04-21T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "ESM",
  },
  {
    startDate: "2020-08-22T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2025-04-22T00:00:00",
    endDate: "2030-04-21T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "ESM",
  },
  {
    startDate: "2020-04-23T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2025-04-22T00:00:00",
    endDate: "2030-04-21T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "ESM",
  },
];
const rawKernelReleases1804 = [
  {
    startDate: "2020-08-01T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2023-04-20T00:00:00",
    endDate: "2028-04-18T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "ESM",
  },
  {
    startDate: "2018-07-26T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2023-04-20T00:00:00",
    endDate: "2028-04-18T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "ESM",
  },
  {
    startDate: "2018-04-26T00:00:00",
    endDate: "2023-04-25T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2023-04-25T00:00:00",
    endDate: "2028-04-23T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "ESM",
  },
];
const rawKernelReleases1604 = [
  {
    startDate: "2018-08-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2021-04-20T00:00:00",
    endDate: "2026-04-19T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "ESM",
  },
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2021-04-20T00:00:00",
    endDate: "2026-04-19T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "ESM",
  },
  {
    startDate: "2016-04-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2021-04-20T00:00:00",
    endDate: "2026-04-19T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "ESM",
  },
];
const rawKernelReleases1404 = [
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2019-04-20T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2019-04-20T00:00:00",
    endDate: "2024-04-19T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "ESM",
  },
];
const rawKernelReleasesALL = [
  {
    startDate: "2016-01-01T00:00:00",
    endDate: "2016-04-21T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "EARLY",
  },
  {
    startDate: "2016-04-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2016-05-01T00:00:00",
    endDate: "2016-08-21T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "EARLY",
  },
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2016-05-01T00:00:00",
    endDate: "2016-08-21T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "EARLY",
  },
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2019-04-20T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2018-01-03T00:00:00",
    endDate: "2018-04-21T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "EARLY",
  },
  {
    startDate: "2018-04-21T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2018-04-04T00:00:00",
    endDate: "2018-07-01T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "EARLY",
  },
  {
    startDate: "2018-07-01T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2018-05-04T00:00:00",
    endDate: "2018-08-21T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "EARLY",
  },
  {
    startDate: "2018-08-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2020-01-24T00:00:00",
    endDate: "2020-04-23T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "EARLY",
  },
  {
    startDate: "2020-04-23T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2020-04-23T00:00:00",
    endDate: "2020-07-22T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "EARLY",
  },
  {
    startDate: "2020-07-22T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2020-05-01T00:00:00",
    endDate: "2020-08-01T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "EARLY",
  },
  {
    startDate: "2020-08-01T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2022-01-01T00:00:00",
    endDate: "2022-04-01T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "EARLY",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2022-05-13T00:00:00",
    endDate: "2022-08-11T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "EARLY",
  },
  {
    startDate: "2022-08-11T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2022-08-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "Ubuntu 22.04.1 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2023-10-01T00:00:00",
    endDate: "2024-07-01T00:00:00",
    taskName: "Ubuntu 23.10 (v6.5)",
    status: "INTERIM_RELEASE",
  },
  {
    startDate: "2024-02-01T00:00:00",
    endDate: "2024-08-01T00:00:00",
    taskName: "Ubuntu 22.04.4 LTS (v6.5)",
    status: "LTS",
  },
];
const rawKernelReleasesLTS = [
  {
    startDate: "2016-04-21T00:00:00",
    endDate: "2018-04-01T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2018-04-01T00:00:00",
    endDate: "2023-03-31T00:00:00",
    taskName: "Ubuntu 16.04.0 LTS (v4.4)",
    status: "CVE",
  },
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2018-04-01T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2018-04-01T00:00:00",
    endDate: "2019-04-20T00:00:00",
    taskName: "Ubuntu 14.04.5 LTS (v4.4)",
    status: "CVE",
  },
  {
    startDate: "2016-08-21T00:00:00",
    endDate: "2018-04-01T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2018-04-01T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.1 LTS (v4.4)",
    status: "CVE",
  },
  {
    startDate: "2018-04-26T00:00:00",
    endDate: "2020-04-01T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2025-03-31T00:00:00",
    taskName: "Ubuntu 18.04.0 LTS (v4.15)",
    status: "CVE",
  },
  {
    startDate: "2018-07-26T00:00:00",
    endDate: "2020-04-01T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.1 LTS (v4.15)",
    status: "CVE",
  },
  {
    startDate: "2018-08-21T00:00:00",
    endDate: "2020-04-01T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04.5 LTS (v4.15)",
    status: "CVE",
  },
  {
    startDate: "2020-04-23T00:00:00",
    endDate: "2022-04-23T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2022-04-23T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.0 LTS (v5.4)",
    status: "CVE",
  },
  {
    startDate: "2020-07-22T00:00:00",
    endDate: "2022-04-13T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2022-04-13T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.1 LTS (v5.4)",
    status: "CVE",
  },
  {
    startDate: "2020-08-01T00:00:00",
    endDate: "2022-04-23T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "LTS",
  },
  {
    startDate: "2022-04-23T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04.5 LTS (v5.4)",
    status: "CVE",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2024-04-01T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "Ubuntu 22.04.0 LTS (v5.15)",
    status: "CVE",
  },
  {
    startDate: "2022-08-11T00:00:00",
    endDate: "2024-08-10T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2024-08-10T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04.5 LTS (v5.15)",
    status: "CVE",
  },
  {
    startDate: "2022-08-01T00:00:00",
    endDate: "2024-04-01T00:00:00",
    taskName: "Ubuntu 22.04.1 LTS (v5.15)",
    status: "LTS",
  },
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "Ubuntu 22.04.1 LTS (v5.15)",
    status: "CVE",
  },
  {
    startDate: "2024-02-01T00:00:00",
    endDate: "2024-08-01T00:00:00",
    taskName: "Ubuntu 22.04.4 LTS (v6.5)",
    status: "LTS",
  },
];
const rawKernelReleaseSchedule = [
  {
    startDate: "2014-04-21T00:00:00",
    endDate: "2019-04-20T00:00:00",
    taskName: "Ubuntu 14.04 LTS (v3.13)",
    status: "LTS",
  },
  {
    startDate: "2016-04-21T00:00:00",
    endDate: "2021-04-20T00:00:00",
    taskName: "Ubuntu 16.04 LTS (v4.4)",
    status: "LTS",
  },
  {
    startDate: "2018-04-21T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04 LTS (v4.15)",
    status: "LTS",
  },
  {
    startDate: "2020-04-23T00:00:00",
    endDate: "2025-04-22T00:00:00",
    taskName: "Ubuntu 20.04 LTS (v5.4)",
    status: "LTS",
  },
];
const rawOpenStackReleases = [
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2032-04-01T00:00:00",
    taskName: "OpenStack 2024.1",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2023-10-01T00:00:00",
    endDate: "2024-07-01T00:00:00",
    taskName: "OpenStack 2023.2",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2023-04-01T00:00:00",
    endDate: "2024-10-01T00:00:00",
    taskName: "OpenStack 2023.1",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2024-10-01T00:00:00",
    endDate: "2026-04-01T00:00:00",
    taskName: "OpenStack 2023.1",
    status: "EXTENDED_SUPPORT_FOR_CUSTOMERS",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "OpenStack Yoga LTS",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2027-04-01T00:00:00",
    endDate: "2032-04-01T00:00:00",
    taskName: "OpenStack Yoga LTS",
    status: "ESM",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2027-04-01T00:00:00",
    taskName: "Ubuntu 22.04 LTS",
    status: "LTS",
  },
  {
    startDate: "2027-04-01T00:00:00",
    endDate: "2032-04-01T00:00:00",
    taskName: "Ubuntu 22.04 LTS",
    status: "ESM",
  },
  {
    startDate: "2022-04-01T00:00:00",
    endDate: "2025-04-01T00:00:00",
    taskName: "OpenStack Yoga",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2020-05-15T00:00:00",
    endDate: "2025-04-01T00:00:00",
    taskName: "OpenStack Ussuri LTS",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2030-04-01T00:00:00",
    taskName: "OpenStack Ussuri LTS",
    status: "EXTENDED_SUPPORT_MAINTENANCE",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2030-04-01T00:00:00",
    taskName: "OpenStack Ussuri LTS",
    status: "ESM",
  },
  {
    startDate: "2020-04-01T00:00:00",
    endDate: "2025-04-01T00:00:00",
    taskName: "Ubuntu 20.04 LTS",
    status: "LTS",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2030-04-01T00:00:00",
    taskName: "Ubuntu 20.04 LTS",
    status: "ESM",
  },
  {
    startDate: "2018-04-20T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "OpenStack Queens LTS",
    status: "MATCHING_OPENSTACK_RELEASE_SUPPORT",
  },
  {
    startDate: "2023-04-20T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "OpenStack Queens LTS",
    status: "ESM",
  },
  {
    startDate: "2018-04-20T00:00:00",
    endDate: "2023-04-20T00:00:00",
    taskName: "Ubuntu 18.04 LTS",
    status: "LTS",
  },
  {
    startDate: "2023-04-20T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "Ubuntu 18.04 LTS",
    status: "ESM",
  },
];
const rawKubernetesReleases = [
  {
    startDate: "2023-04-21T00:00:00",
    endDate: "2024-04-28T00:00:00",
    taskName: "Kubernetes 1.27",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2024-04-28T00:00:00",
    endDate: "2024-12-28T00:00:00",
    taskName: "Kubernetes 1.27",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2023-08-18T00:00:00",
    endDate: "2024-08-28T00:00:00",
    taskName: "Kubernetes 1.28",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2024-08-28T00:00:00",
    endDate: "2025-04-28T00:00:00",
    taskName: "Kubernetes 1.28",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2023-12-15T00:00:00",
    endDate: "2024-12-28T00:00:00",
    taskName: "Kubernetes 1.29",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2024-12-28T00:00:00",
    endDate: "2025-08-28T00:00:00",
    taskName: "Kubernetes 1.29",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2024-04-15T00:00:00",
    endDate: "2025-04-28T00:00:00",
    taskName: "Kubernetes 1.30",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2025-04-28T00:00:00",
    endDate: "2025-12-28T00:00:00",
    taskName: "Kubernetes 1.30",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2024-08-01T00:00:00",
    endDate: "2025-08-28T00:00:00",
    taskName: "Kubernetes 1.31",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2025-08-28T00:00:00",
    endDate: "2026-04-28T00:00:00",
    taskName: "Kubernetes 1.31",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2024-12-01T00:00:00",
    endDate: "2025-12-28T00:00:00",
    taskName: "Kubernetes 1.32",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2025-12-28T00:00:00",
    endDate: "2026-08-28T00:00:00",
    taskName: "Kubernetes 1.32",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
];
const rawKubernetesReleasesLTS = [
  {
    startDate: "2024-12-01T00:00:00",
    endDate: "2025-12-01T00:00:00",
    taskName: "Kubernetes 1.32.x LTS",
    status: "CANONICAL_KUBERNETES_SUPPORT",
  },
  {
    startDate: "2025-12-01T00:00:00",
    endDate: "2034-12-01T00:00:00",
    taskName: "Kubernetes 1.32.x LTS",
    status: "CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2034-12-01T00:00:00",
    endDate: "2036-12-01T00:00:00",
    taskName: "Kubernetes 1.32.x LTS",
    status: "CANONICAL_KUBERNETES_LEGACY_SUPPORT",
  },
];
const rawMicroStackReleases = [
  {
    startDate: "2026-04-01T00:00:00",
    endDate: "2031-04-01T00:00:00",
    taskName: "OpenStack 2026.1 LTS",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2031-04-01T00:00:00",
    endDate: "2036-04-01T00:00:00",
    taskName: "OpenStack 2026.1 LTS",
    status: "MICROSTACK_ESM",
  },
  {
    startDate: "2026-04-01T00:00:00",
    endDate: "2036-04-01T00:00:00",
    taskName: "OpenStack 2026.1 LTS",
    status: "PRO_SUPPORT",
  },
  {
    startDate: "2025-10-01T00:00:00",
    endDate: "2026-07-01T00:00:00",
    taskName: "OpenStack 2025.2",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2026-01-01T00:00:00",
    taskName: "OpenStack 2025.1",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2026-01-01T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "OpenStack 2025.1",
    status: "MICROSTACK_ESM",
  },
  {
    startDate: "2025-04-01T00:00:00",
    endDate: "2028-04-01T00:00:00",
    taskName: "OpenStack 2025.1",
    status: "PRO_SUPPORT",
  },
  {
    startDate: "2024-10-01T00:00:00",
    endDate: "2025-07-01T00:00:00",
    taskName: "OpenStack 2024.2",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2029-04-01T00:00:00",
    taskName: "OpenStack 2024.1 LTS",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2029-04-01T00:00:00",
    endDate: "2034-04-01T00:00:00",
    taskName: "OpenStack 2024.1 LTS",
    status: "MICROSTACK_ESM",
  },
  {
    startDate: "2024-04-01T00:00:00",
    endDate: "2034-04-01T00:00:00",
    taskName: "OpenStack 2024.1 LTS",
    status: "PRO_SUPPORT",
  },
  {
    startDate: "2023-10-01T00:00:00",
    endDate: "2024-07-01T00:00:00",
    taskName: "OpenStack 2023.2",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2023-06-01T00:00:00",
    endDate: "2024-01-01T00:00:00",
    taskName: "OpenStack 2023.1",
    status: "STANDARD_SECURITY_MAINTENANCE",
  },
  {
    startDate: "2024-01-01T00:00:00",
    endDate: "2026-04-01T00:00:00",
    taskName: "OpenStack 2023.1",
    status: "MICROSTACK_ESM",
  },
  {
    startDate: "2023-06-01T00:00:00",
    endDate: "2026-04-01T00:00:00",
    taskName: "OpenStack 2023.1",
    status: "PRO_SUPPORT",
  },
];

// --- PROCESSED & EXPORTED DATA ---
// The raw data is processed here to create the final exported variables.
// The structure and types match the original exactly.

export const serverAndDesktopReleases = processDates(rawServerAndDesktopReleases);
export const kernelReleases = processDates(rawKernelReleases);
export const kernelReleases2204 = processDates(rawKernelReleases2204);
export const kernelReleases2004 = processDates(rawKernelReleases2004);
export const kernelReleases1804 = processDates(rawKernelReleases1804);
export const kernelReleases1604 = processDates(rawKernelReleases1604);
export const kernelReleases1404 = processDates(rawKernelReleases1404);
export const kernelReleasesALL = processDates(rawKernelReleasesALL);
export const kernelReleasesLTS = processDates(rawKernelReleasesLTS);
export const kernelReleaseSchedule = processDates(rawKernelReleaseSchedule);
export const openStackReleases = processDates(rawOpenStackReleases);
export const kubernetesReleases = processDates(rawKubernetesReleases);
export const kubernetesReleasesLTS = processDates(rawKubernetesReleasesLTS);
export const microStackReleases = processDates(rawMicroStackReleases);

// --- STATUS MAPPINGS ---
// These remain unchanged, but use `const` for best practice.

export const desktopServerStatus = {
  HARDWARE_AND_MAINTENANCE_UPDATES: "chart__bar--orange",
  MAINTENANCE_UPDATES: "chart__bar--orange-light",
  ESM: "chart__bar--aubergine-light",
  MAIN_UNIVERSE: "chart__bar--aubergine-mid-light",
  INTERIM_RELEASE: "chart__bar--grey",
  PRO_LEGACY_SUPPORT: "chart__bar--black",
};
export const kernelStatus = {
  LTS: "chart__bar--orange",
  ESM: "chart__bar--aubergine-light",
  INTERIM_RELEASE: "chart__bar--grey",
  PRO_LEGACY_SUPPORT: "chart__bar--black",
};
export const kernelReleaseScheduleStatus = {
  LTS: "chart__bar--black",
  INTERIM_RELEASE: "chart__bar--grey",
};
export const kernelStatusLTS = {
  LTS: "chart__bar--black",
  CVE: "chart__bar--grey",
};
export const kernelStatusALL = {
  LTS: "chart__bar--black",
  INTERIM_RELEASE: "chart__bar--grey",
  EARLY: "chart__bar--aubergine-light",
};
export const openStackStatus = {
  LTS: "chart__bar--black",
  MATCHING_OPENSTACK_RELEASE_SUPPORT: "chart__bar--mid-dark",
  ESM: "chart__bar--aubergine",
  EXTENDED_SUPPORT_FOR_CUSTOMERS: "chart__bar--aubergine-light",
};
export const kubernetesStatus = {
  CANONICAL_KUBERNETES_SUPPORT: "chart__bar--black",
  CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE: "chart__bar--aubergine",
};
export const kubernetesStatusLTS = {
  CANONICAL_KUBERNETES_SUPPORT: "chart__bar--black",
  CANONICAL_KUBERNETES_EXPANDED_SECURITY_MAINTENANCE: "chart__bar--aubergine",
  CANONICAL_KUBERNETES_LEGACY_SUPPORT: "chart__bar--orange",
};
export const microStackStatus = {
  STANDARD_SECURITY_MAINTENANCE: "chart__bar--orange",
  MICROSTACK_ESM: "chart__bar--aubergine",
  PRO_SUPPORT: "chart_bar--charcoal",
};

// --- DYNAMICALLY GENERATED RELEASE NAMES ---
// These are now generated directly from the data sources to avoid manual updates.
// The `.reverse()` method is used to match the original descending order.

export const desktopServerReleaseNames = getUniqueTaskNames(
  serverAndDesktopReleases
).reverse();
export const kernelReleaseNames = getUniqueTaskNames(kernelReleases).reverse();
export const kernelVersionNames = [
  // This list appears to be manually curated and not directly derivable from the data,
  // so it is left as is.
  "6.17",
  "6.14",
  "",
  "6.8",
  "",
  "5.15",
  "",
  "5.4",
  "",
  "4.15",
  "",
  "4.4",
  "",
  "3.13",
];
export const kernelReleaseNames2204 = getUniqueTaskNames(kernelReleases2204);
export const kernelReleaseNames2004 = getUniqueTaskNames(kernelReleases2004).reverse();
export const kernelReleaseNames1804 = getUniqueTaskNames(kernelReleases1804).reverse();
export const kernelReleaseNames1604 = getUniqueTaskNames(kernelReleases1604).reverse();
export const kernelReleaseNames1404 = getUniqueTaskNames(kernelReleases1404);
export const kernelReleaseNamesALL = getUniqueTaskNames(kernelReleasesALL);
export const kernelReleaseNamesLTS = getUniqueTaskNames(kernelReleasesLTS);
export const openStackReleaseNames = getUniqueTaskNames(
  openStackReleases
).reverse();
export const microStackReleaseNames = getUniqueTaskNames(
  microStackReleases
).reverse();
export const kubernetesReleaseNames = getUniqueTaskNames(
  kubernetesReleases
).reverse();
export const kubernetesReleaseNamesLTS = getUniqueTaskNames(kubernetesReleasesLTS);
export const kernelReleaseScheduleNames =
  getUniqueTaskNames(kernelReleaseSchedule);
