import {
  Chip,
  Col,
  List,
  Row,
  SearchAndFilter,
} from "@canonical/react-components";
import { CVEDataType, UbuntuPackage } from "../types/ubuntu_package";
import { useMemo, useState } from "react";
import {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { LTSReleases } from "../utils/constants";

type Props = {
  cveData: CVEDataType;
  packageFilter: string;
  selectedRelease: string;
  changeSelectedRelease: (release: string) => void;
};
const ProContent = ({
  cveData,
  selectedRelease,
  changeSelectedRelease,
  packageFilter,
}: Props) => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const items = useMemo(() => {
    let sections = cveData.sections;
    if (!sections || sections.length === 0) {
      return [];
    }
    if (packageFilter) {
      sections = [packageFilter];
    }
    sections.sort();
    const items: SearchAndFilterData[] = sections.map((section, index) => ({
      heading: section,
      chips: cveData.packages
        .filter((pkg: UbuntuPackage) => pkg.section === section)
        .map((pkg: UbuntuPackage) => ({
          value: pkg.package_name,
          id: index,
        })),
      id: index,
    }));
    return items.filter((item) => item.chips?.length || 0 > 0);
  }, [cveData, packageFilter]);

  const packagePocketMap = useMemo(() => {
    const map = new Map<string, string>();
    cveData.packages.forEach((pkg) => {
      if (pkg.pocket) {
        map.set(pkg.package_name, pkg.pocket);
      }
    });
    return map;
  }, [cveData.packages]);

  const handleUpdate = (searchData: SearchAndFilterChip[]) => {
    console.log("Search data:", searchData);
    if (searchData.length === 0) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(searchData.map((chip) => chip.value));
    }
  };
  return (
    <>
      <div className="p-section--shallow">
        <form className="p-form p-form--inline u-align--right">
          <div className="p-form__group">
            <SearchAndFilter
              filterPanelData={items}
              returnSearchData={handleUpdate}
            />
          </div>
          <div className="p-form__group">
            <label className="p-form__label" htmlFor="statusFilter">
              Release
            </label>
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
        </form>
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
              <p>Package covered with Ubuntu Pro</p>
              {selectedPackages.map((pkg) => (
                <Chip
                  key={pkg}
                  lead={undefined}
                  quoteValue={false}
                  value={pkg}
                  appearance="positive"
                />
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
            <div className="p-cta-block">
              <a className="p-button--positive" href="/pro/subscribe">Start a 30-day free trial</a>
              <a href="/pro/free-trial">Learn more about the free trial for enterprises &rsaquo;</a>
            </div>
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
              <p>Package covered with LTS</p>
              {selectedPackages.filter((pkg)=>!packagePocketMap.get(pkg)?.startsWith("esm")).map((pkg) => (
                <Chip
                key={pkg}
                value={pkg}
                appearance="positive"
                />
              ))}
              <p>Package needing ESM to receive security fixes</p>
              {selectedPackages.filter((pkg)=>packagePocketMap.get(pkg)?.startsWith("esm")).map((pkg) => (
                <Chip
                  key={pkg}
                  value={pkg}
                  appearance="negative"
                />
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
                    {selectedPackages
                      .filter((pkg) =>
                        packagePocketMap.get(pkg)?.startsWith("esm"),
                      )
                      .map((pkg) => (
                        <p key={pkg}>{pkg}</p>
                      ))}
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
