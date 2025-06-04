import { Chip, Col, List, Row } from "@canonical/react-components";
import { CVEDataType } from "../types/ubuntu_package";
import CVESelector from "./CVESelector";

type Props = {
  cveData: CVEDataType;
  packageFilter: string;
  setPackageFilter: (filter: string) => void;
  selectedRelease: string;
  changeSelectedRelease: (release: string) => void;
};
const ProContent = ({
  cveData,
  packageFilter,
  setPackageFilter,
  selectedRelease,
  changeSelectedRelease,
}: Props) => {
  return (
    <>
      <div className="p-section--shallow">
        <CVESelector
          cveData={cveData}
          packageFilter={packageFilter}
          setPackageFilter={setPackageFilter}
          selectedRelease={selectedRelease}
          changeSelectedRelease={changeSelectedRelease}
        />
        <hr className="p-rule is-muted" />
      </div>
      <div className="p-section--shallow">
        <Row>
          <Col size={2}>
            <h4>Ubuntu Pro</h4>
            <h5>(Recommended)</h5>
          </Col>
          <Col size={7}>
            <div className="p-section--shallow">
              {packageFilter === ""
                ? null
                : cveData.packages
                    .filter((pkg) => pkg.section === packageFilter)
                    .map((pkg) => (
                      <Chip key={pkg.package_name} value={pkg.package_name} />
                    ))}
            </div>
            <p>
              A subscription layer on top of your Ubuntu LTS that expands your
              baseline security coverage.
            </p>
            <hr className="p-rule is-muted" />
            <List
              divided
              ticked
              items={[
                <>
                  Expanded security maintenance until XXXX
                  <br />{" "}
                  <span className="u-text--muted">
                    CVE fixes availablefor all packages
                  </span>
                </>,
                <>
                  Livepatch
                  <br />{" "}
                  <span className="u-text--muted">
                    Kernel updates without unplanned rebooting
                  </span>
                </>,
                <>
                  Compliance and hardening tools
                  <br />{" "}
                  <span className="u-text--muted">
                    CIS, DISA-STIG, FIPS 140, and Common Criteria
                  </span>
                </>,
                <>
                  Break and bug-fix support optional
                  <br />{" "}
                  <span className="u-text--muted">
                    Canonical engineers at your side, always on Not included in
                    the 30-day free trial
                  </span>
                </>,
                <>
                  Landscape
                  <br />{" "}
                  <span className="u-text--muted">
                    Automation and machine management at scale
                  </span>
                </>,
              ]}
            />
          </Col>
        </Row>
      </div>
      <hr className="p-rule is-muted" />
      <div className="p-section--shallow">
        <Row>
          <Col size={2}>
            <h4>Ubuntu LTS</h4>
            <h5>(No additional setup needed in your LTS)</h5>
          </Col>
          <Col size={7}>
            <div className="p-section--shallow">
              {packageFilter === ""
                ? null
                : cveData.packages
                    .filter((pkg) => pkg.section === packageFilter)
                    .map((pkg) => (
                      <Chip key={pkg.package_name} value={pkg.package_name} />
                    ))}
            </div>
            <p>
              Out-the-box security coverage that comes standard with
              enterprise-grade Ubuntu releases.
            </p>
            <hr className="p-rule is-muted" />
            <List
              divided
              ticked
              items={[
                <>
                  Standard security maintenance until XXXX
                  <br />{" "}
                  <span className="u-text--muted">
                    CVE fixes available for some packages
                  </span>
                </>,
                <>
                  Packages needing ESM to receive security fixes
                  <br />{" "}
                  <span className="u-text--muted">
                    {cveData.packages
                      .filter((pkg) => pkg.section === packageFilter && pkg.pocket.startsWith("esm"))
                      .map((pkg) => <p key={pkg.package_name}>{pkg.package_name}</p>)}
                  </span>
                </>,
              ]}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};
export default ProContent;
