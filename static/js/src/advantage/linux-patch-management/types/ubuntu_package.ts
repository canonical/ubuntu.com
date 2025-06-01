export type UbuntuPackage = {
  package_name: string;
  section: string;
  pocket: string;
  version: string;
  high_cves: {
    name: string;
    published_at: string;
    fixed_at: string;
    related_usns: string[];
  }[];
  critical_cves: {
    name: string;
    cvss_severity: string;
    published_at: string;
    fixed_at: string;
    related_usns: string[];
  }[];
};

export type CVEDataType = {
  sections: string[];
  packages: UbuntuPackage[];
};
