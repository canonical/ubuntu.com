import { MainTable, Notification, Spinner } from "@canonical/react-components";
import { LTSReleasesFromName, useFetchCVEData } from "../utils/helpers";
import { useMemo, useState } from "react";
import useCVETable from "./useCVETable";
import CVESelector from "./CVESelector";
import { createPortal } from "react-dom";
import ProContent from "./ProContent";
import { UbuntuPackage } from "../types/ubuntu_package";

const CVETable = () => {
  const [selectedRelease, changeSelectedRelease] = useState("focal");
  const [packageFilter, setPackageFilter] = useState("");
  const { data: cveData, isLoading } = useFetchCVEData(selectedRelease);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
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

  const cveFixCount = useMemo(() => {
    if (!cveData || !cveData.packages) {
      return [0, 0];
    }
    const high_cves_count = cveData.packages.reduce(
      (count: number, pkg: UbuntuPackage) => {
        return count + pkg.high_cves.length;
      },
      0,
    );
    const critical_cves_count = cveData.packages.reduce(
      (count: number, pkg: UbuntuPackage) => {
        return count + pkg.critical_cves.length;
      },
      0,
    );
    return [high_cves_count, critical_cves_count];
  }, [cveData]);

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
          We have made available{" "}
          {(cveFixCount[0] + cveFixCount[1]).toLocaleString()} fixes for
          vulnerabilities rated High ({cveFixCount[0].toLocaleString()}) /
          Critical ({cveFixCount[1].toLocaleString()}) for{" "}
          {LTSReleasesFromName(selectedRelease)}
        </>
      </Notification>
      <MainTable
        headers={headers}
        rows={[
          {
            columns: [
              {
                content: null,
                role: "columnheader",
              },
              {
                content: <p>Critical</p>,
                role: "columnheader",
              },
              {
                content: <p>High</p>,
                role: "columnheader",
              },
              {
                content: null,
                role: "columnheader",
              },
            ],
          },
        ]}
        className="u-no-margin--bottom"
      />
      <hr className="p-rule is-muted" />
      <MainTable
        rows={tableData}
        expanding={true}
        paginate={10}
        id="cve-table"
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
export default CVETable;
