import { getAllByRole, render } from "@testing-library/react";
import CVETable from "./CVETable";
import { useFetchCVEData } from "../utils/helpers";

jest.mock("../utils/helpers", () => ({
  ...jest.requireActual("../utils/helpers"),
  useFetchCVEData: jest.fn(),
}));

describe("CVETable", () => {
  beforeEach(() => {
    (useFetchCVEData as jest.Mock).mockReturnValue({
      data: {
        packages: [
          {
            package_name: "Package 1",
            section: "section-1",
            pocket: "main",
            version: "1",
            critical_cves: [],
            high_cves: [
              {
                name: "CVE-1",
                related_usns: ["USN-1", "USN-2"],
              },
            ],
          },
          {
            package_name: "Package 2",
            section: "section-2",
            pocket: "main",
            version: "2",
            critical_cves: [
              {
                name: "CVE-3",
                related_usns: [],
              },
              {
                name: "CVE-4",
                related_usns: ["USN-3"],
              },
            ],
            high_cves: [
              {
                name: "CVE-2",
                related_usns: [],
              },
            ],
          },
        ],
        sections: ["section-1", "section-2"],
        critical_cves: 2,
        high_cves: 2,
      },
      isLoading: false,
    });
  });

  it("renders without crashing", () => {
    const { container } = render(<CVETable />);
    expect(container).toBeInTheDocument();
  });

  it("shows loading spinner when data is loading", () => {
    (useFetchCVEData as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    const { getAllByText } = render(<CVETable />);
    expect(getAllByText("Loading...")).toHaveLength(2); // loading spinner in the component and portal
  });

  it("renders CVESelector with correct props", () => {
    const { getByTestId, getByText, getByRole, getAllByRole } = render(
      <CVETable />,
    );
    expect(getByTestId("table-status-filter")).toHaveValue("focal");
    const options = getByTestId("table-status-filter").querySelectorAll(
      "option",
    );
    expect(options).toHaveLength(6); // Only one option for the test data
    expect(options[0].textContent).toBe("24.04 LTS");
    expect(getByTestId("table-package-filter")).toHaveValue("");
    const packageOptions = getByTestId("table-package-filter").querySelectorAll(
      "option",
    );
    expect(packageOptions).toHaveLength(3); // "All Packages" + 2 packages from test data
    expect(
      getByText(
        "Our experts patched 4 vulnerabilities rated High (2) / Critical (2) for 20.04",
      ),
    ).toBeInTheDocument();
    expect(getByRole("grid", { name: "cve-table" })).toBeInTheDocument();
    expect(getByRole("rowheader", { name: "Package 1" })).toBeInTheDocument();
    expect(getByRole("rowheader", { name: "Package 2" })).toBeInTheDocument();
    console.log(getAllByRole("row"));
    expect(
      getByRole("row", { name: "Package 1 1 0 Ubuntu Pro" }),
    ).toBeInTheDocument();
    expect(
      getByRole("row", { name: "Package 2 1 2 Ubuntu Pro" }),
    ).toBeInTheDocument();
  });
});
