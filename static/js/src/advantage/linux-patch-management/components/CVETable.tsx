import { MainTable, Spinner } from "@canonical/react-components";
import { useFetchCVEData } from "../utils/fetchCVEData";
import { useState } from "react";
import useCVETable from "./useCVETable";
import CVESelector from "./CVESelector";
import { createPortal } from "react-dom";

const CVETable = () => {
  const [selectedRelease, changeSelectedRelease] = useState("jammy");
  const [packageFilter, setPackageFilter] = useState("");
  const { data: cveData, isLoading } = useFetchCVEData(selectedRelease);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState("");

  const tableData = useCVETable(
    cveData?.packages || [],
    packageFilter,
    selectedPackage,
    setSelectedPackage,
    selectedSeverity,
    setSelectedSeverity,
  );
  const headers = [
    {
      content: "Packages",
    },
    {
      content: "Severity",
    },
    {
      content: null,
    },
    {
      content: "Coverage Needed",
    },
  ];

  if (isLoading) {
    return <>
      <Spinner text="Loading..." />
      {createPortal(<Spinner text="Loading..." />, document.getElementById("cve-selector-root") || document.body)}
    </>;
  }

  return (
    <>
      <CVESelector
        cveData={cveData}
        packageFilter={packageFilter}
        setPackageFilter={setPackageFilter}
        selectedRelease={selectedRelease}
        changeSelectedRelease={changeSelectedRelease}
      />

      <MainTable
        headers={headers}
        rows={tableData}
        expanding={true}
        paginate={10}
        emptyStateMsg="No packages found for this release and filter."
      />

      {createPortal(<CVESelector
        cveData={cveData}
        packageFilter={packageFilter}
        setPackageFilter={setPackageFilter} 
        selectedRelease={selectedRelease}
        changeSelectedRelease={changeSelectedRelease}
      />, document.getElementById("cve-selector-root") || document.body)}
    </>
  );
};
export default CVETable;
