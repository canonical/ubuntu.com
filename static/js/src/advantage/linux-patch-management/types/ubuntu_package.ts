export type UbuntuPackage = {
  package_name: string;
  section: string;
  origin: string;
  pocket: string;
  version: string;
  high_cves: {
    name: string;
    related_usns: string[];
  }[];
  critical_cves: {
    name: string;
    related_usns: string[];
  }[];
};

export type CVEDataType = {
  sections: string[];
  packages: UbuntuPackage[];
};
