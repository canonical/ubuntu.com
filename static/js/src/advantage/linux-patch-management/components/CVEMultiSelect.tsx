import { useMemo } from "react";
import { CVEDataType, UbuntuPackage } from "../types/ubuntu_package";
import { SearchAndFilter } from "@canonical/react-components";

export default function CVEMultiSelect({
  cveData = { sections: [], packages: [] },
}: {
  cveData: CVEDataType;
}) {
    const handleUpdate = () => {};
  const items = useMemo(() => {
    const sections = cveData.sections;
    console.log(cveData);   
    console.log("CVEMultiSelect sections", sections);
    if (!sections || sections.length === 0) {
      return [];
    }
    sections.sort();
    const items = sections.map((section, index) => ({
        heading: section,
        chips: cveData.packages
          .filter((pkg: UbuntuPackage) => pkg.section === section)
          .map((pkg: UbuntuPackage) => ({
            value: pkg.package_name,
          })),
        id: index
    }));
    return items;
  }, [cveData, packageFilter]);
  return <SearchAndFilter filterPanelData={items}  returnSearchData={handleUpdate} />;
}
