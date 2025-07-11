import { Row } from "@canonical/react-components";
import { CVEDataType } from "../types/ubuntu_package";
import { LTSReleases } from "../utils/constants";

type Props = {
  cveData: CVEDataType;
  packageFilter: string;
  setPackageFilter: (filter: string) => void;
  selectedRelease: string;
  changeSelectedRelease: (release: string) => void;
};

const CVESelector = ({
  cveData,
  packageFilter,
  setPackageFilter,
  selectedRelease,
  changeSelectedRelease,
}: Props) => {
  return (
    <Row>
      <form className="p-form p-form--inline u-align--right">
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
            data-testid="table-status-filter"
          >
            {LTSReleases.map((release) => (
              <option key={release.value} value={release.value}>
                {release.label}
              </option>
            ))}
          </select>
        </div>
        <div className="p-form__group">
          <label className="p-form__label" htmlFor="packageFilter">
            Package category
          </label>
          <select
            aria-label="Filter by package"
            name="packageFilter"
            id="packageFilter"
            defaultValue={packageFilter}
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            data-testid="table-package-filter"
          >
            <option value="">All Packages</option>
            {cveData?.sections &&
              cveData.sections.sort().map((section: string) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
          </select>
        </div>
      </form>
    </Row>
  );
};
export default CVESelector;
