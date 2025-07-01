import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useMemo } from "react";
import { UbuntuPackage } from "../types/ubuntu_package";
import { Button, Col, Icon, Row } from "@canonical/react-components";
import { mapOriginToCoverage } from "../utils/helpers";

export default function useCVETable(
  cveData: UbuntuPackage[] = [],
  packageFilter: string = "",
  selectedRelease: string = "focal",
  selectedPackage: string = "",
  setSelectedPackage: (pkg: string) => void = () => {},
  selectedSeverity: string = "",
  setSelectedSeverity: (severity: string) => void = () => {},
) {
  const toggleButton = (pkg: UbuntuPackage, severity: string) => {
    if (selectedPackage === pkg.package_name && selectedSeverity === severity) {
      setSelectedPackage("");
      setSelectedSeverity("");
      return;
    }
    setSelectedPackage(pkg.package_name);
    setSelectedSeverity(severity);
  };

  const rows = useMemo<MainTableRow[]>((): MainTableRow[] => {
    if (!cveData || cveData.length === 0) {
      return [
        { columns: [{ content: "No data available" }] },
      ] as MainTableRow[];
    }
    const cveDataFiltered = cveData.filter((pkg: UbuntuPackage) => {
      return packageFilter === "" || pkg.section === packageFilter;
    });

    const tableData: MainTableRow[] = cveDataFiltered.map(
      (pkg: UbuntuPackage) => {
        const tableRow: MainTableRow = {
          columns: [
            {
              content: pkg.package_name,
              role: "rowheader",
            },
            {
              content: (
                <Button
                  hasIcon
                  appearance="base"
                  element={"a"}
                  disabled={pkg.high_cves.length === 0}
                  onClick={() => {
                    toggleButton(pkg, "high");
                  }}
                >
                  <Icon
                    name={
                      selectedPackage == pkg.package_name &&
                      selectedSeverity === "high"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                  />
                  <span>{pkg.high_cves.length.toString()}</span>
                </Button>
              ),
            },
            {
              content: (
                <Button
                  hasIcon
                  appearance="base"
                  element={"a"}
                  onClick={() => {
                    toggleButton(pkg, "critical");
                  }}
                  disabled={pkg.critical_cves.length === 0}
                >
                  <Icon
                    name={
                      selectedPackage === pkg.package_name &&
                      selectedSeverity === "critical"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                  />
                  <span>{pkg.critical_cves.length.toString()}</span>
                </Button>
              ),
            },
            {
              content: (
                <p>{mapOriginToCoverage(selectedRelease, pkg.pocket)}</p>
              ),
            },
          ],
          expanded: selectedPackage === pkg.package_name,
          expandedContent: (
            <Row>
              <Col size={6} emptyMedium={4} emptyLarge={4}>
                <table>
                  <thead>
                    <tr>
                      <th>CVE Name</th>
                      <th>Related USNs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSeverity === "high" &&
                      pkg.high_cves.map((cve) => (
                        <tr key={cve.name}>
                          <td>
                            <a
                              target="_blank"
                              href={"/security/" + cve.name}
                              rel="noreferrer"
                            >
                              {cve.name}
                            </a>
                          </td>
                          <td>
                            {cve.related_usns.map((usn: string) => (
                              <p key={usn}>
                                <a
                                  target="_blank"
                                  href={"/security/notices/" + usn}
                                  rel="noreferrer"
                                >
                                  {usn}
                                </a>
                              </p>
                            ))}
                          </td>
                        </tr>
                      ))}
                    {selectedSeverity === "critical" &&
                      pkg.critical_cves.map((cve) => (
                        <tr key={cve.name}>
                          <td>
                            <a
                              target="_blank"
                              href={"/security/" + cve.name}
                              rel="noreferrer"
                            >
                              {cve.name}
                            </a>
                          </td>
                          <td>
                            {cve.related_usns.map((usn: string) => (
                              <p key={usn}>
                                <a
                                  target="_blank"
                                  href={"/security/notices/" + usn}
                                  rel="noreferrer"
                                >
                                  {usn}
                                </a>
                              </p>
                            ))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Col>
            </Row>
          ),
        };
        return tableRow;
      },
    );
    return tableData;
  }, [cveData, packageFilter, selectedPackage, selectedSeverity]);
  return rows;
}
