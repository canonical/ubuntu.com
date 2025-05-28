import { Row } from "@canonical/react-components";
import { useFetchCVEData } from "../utils/fetchCVEData";
import { useMemo, useState } from "react";

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
  const { data: cveData, error, isLoading } = useFetchCVEData(selectedRelease);

  const tableData = useMemo(() => {
    if (packageFilter === "") {
      return cveData?.packages || [];
    }
    return (
      cveData?.packages.filter((pkg: any) => pkg.section === packageFilter) ||
      []
    );
  }, [cveData, packageFilter]);

  return (
    <>
      <Row>
        <div className="select-group">
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
            <option value="">All Packages</option>
            {cveData?.sections &&
              cveData.sections.map((section: string) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
          </select>
        </div>
      </Row>
      <table className="cve-table">
        <thead>
          <tr>
            <th>Package</th>
            <th colSpan={2}>Severity</th>
            <th>Coverage Needed</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5}>Loading...</td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan={5}>Error loading data</td>
            </tr>
          )}
          {tableData.map((pkg: any) => (
            <tr key={pkg.name}>
              <td>{pkg.package_name}</td>
              <td>{pkg.high_cves.length}</td>
              <td>{pkg.critical_cves.length}</td>
              <td>{pkg.pocket}</td>
              {pkg.high_cves.length > 0 && pkg.high_cves.map(
                (cve: any)=>{return <td key={cve.name}>{cve.published_at}</td>;}
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
export default CVETable;
