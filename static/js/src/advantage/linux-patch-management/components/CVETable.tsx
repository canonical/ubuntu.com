import { Col, MainTable, Row, Spinner } from "@canonical/react-components";
import { useFetchCVEData } from "../utils/fetchCVEData";
import { useState } from "react";
import useCVETable from "./useCVETable";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

const LTSReleases = [
  { value: "noble", label: "Noble Narwhal (24.04 LTS)" },
  { value: "jammy", label: "Jammy Jellyfish (22.04 LTS)" },
  { value: "focal", label: "Focal Fossa (20.04 LTS)" },
  { value: "bionic", label: "Bionic Beaver (18.04 LTS)" },
  { value: "xenial", label: "Xenial Xerus (16.04 LTS)" },
  { value: "trusty", label: "Trusty Tahr (14.04 LTS)" },
];

const CVETable = () => {
  const [selectedRelease, changeSelectedRelease] = useState("jammy");
  const [packageFilter, setPackageFilter] = useState("");
  const { data: cveData, isLoading } = useFetchCVEData(selectedRelease);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState("");

  const tableData = useCVETable(cveData?.packages || [], packageFilter, selectedPackage, setSelectedPackage, selectedSeverity, setSelectedSeverity);
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

  const firstRow: MainTableRow[] = [{
    columns: [
      {
        content: "",
      },
      {
        content: "Critical",
      },
      {
        content: "High",
      },
      {
        content: "",
      }
    ],  
  }];

  if ( isLoading ) {
    return <Spinner text="Loading..." />;
  }

  return (
    <>
      <Row>
        <Col size={3} emptyMedium={7} emptyLarge={7}>
          <div className="select-group">
            <label htmlFor="statusFilter">Release</label>
            <select
              aria-label="Filter by status"
              name="statusFilter"
              id="statusFilter"
              defaultValue={selectedRelease}
              onChange={(e) => changeSelectedRelease(e.target.value)}
              data-testid="quote-status-filter"
            >
              {LTSReleases.map((release) => (
                <option key={release.value} value={release.value}>
                  {release.label}
                </option>
              ))}
            </select>
          </div>
        </Col>
        <Col size={3}>
          <div className="select-group">
            <label htmlFor="packageFilter">Package</label>
            <select
              aria-label="Filter by package"
              name="packageFilter"
              id="packageFilter"
              defaultValue={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              data-testid="quote-package-filter"
            >
              <option value="gnome">All Packages</option>
              {cveData?.sections &&
                cveData.sections.sort().map((section: string) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
            </select>
          </div>
        </Col>
      </Row>

      <MainTable
        headers={headers}
        rows={[...firstRow, ...tableData]}
        expanding={true}
        paginate={10}
        emptyStateMsg="No packages found for this release and filter."
      />

    </>
  );
};
export default CVETable;
