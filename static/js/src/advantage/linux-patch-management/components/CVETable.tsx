import { MainTable, Notification, Spinner } from "@canonical/react-components";
import { LTSReleasesFromName, useFetchCVEData } from "../utils/helpers";
import { useState } from "react";
import useCVETable from "./useCVETable";
import CVESelector from "./CVESelector";
import { createPortal } from "react-dom";
import ProContent from "./ProContent";

const CVETable = () => {
  const [selectedRelease, changeSelectedRelease] = useState("focal");
  const [packageFilter, setPackageFilter] = useState("");
  const { data: cveData, isLoading } = useFetchCVEData(selectedRelease);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");

  const tableData = useCVETable(
    cveData?.packages || [],
    packageFilter,
    selectedRelease,
    selectedPackage,
    setSelectedPackage,
    selectedSeverity,
    setSelectedSeverity,
  );

  if (isLoading) {
    return (
      <>
        <Spinner text="Loading..." />
        {createPortal(
          <Spinner text="Loading..." />,
          document.getElementById("cve-selector-root") || document.body,
        )}
      </>
    );
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
      <Notification severity="information">
        <>
          Our experts patched{" "}
          {(cveData["critical_cves"] + cveData["high_cves"]).toLocaleString()}{" "}
          vulnerabilities rated High ({cveData["high_cves"].toLocaleString()}) /
          Critical ({cveData["critical_cves"].toLocaleString()}) for{" "}
          {LTSReleasesFromName(selectedRelease)}
        </>
      </Notification>
      <MainTable
        headers={headers}
        rows={rows}
        className="u-no-margin--bottom"
      />
      <hr className="p-rule is-muted" />
      <MainTable
        rows={tableData}
        expanding={true}
        paginate={10}
        title="cve-table"
        emptyStateMsg="No packages found for this release and filter."
      />

      {createPortal(
        <ProContent
          cveData={cveData}
          packageFilter={packageFilter}
          selectedRelease={selectedRelease}
          changeSelectedRelease={changeSelectedRelease}
        />,
        document.getElementById("cve-selector-root") || document.body,
      )}
    </>
  );
};

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

const rows = [
  {
    columns: [
      {
        content: null,
        role: "columnheader",
      },
      {
        content: <p>High</p>,
        role: "columnheader",
      },
      {
        content: <p>Critical</p>,
        role: "columnheader",
      },
      {
        content: null,
        role: "columnheader",
      },
    ],
  },
];
export default CVETable;
