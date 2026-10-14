import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import CustomSelect from "./CustomSelect";

const options = [
  { value: "", disabled: "disabled", label: "Select..." },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "JP", label: "Japan" },
];

function ControlledSelect({
  initialValue = "",
  onChange = () => {},
  ...props
}: Partial<Parameters<typeof CustomSelect>[0]> & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <CustomSelect
      name="country"
      label="Country/Region"
      options={options}
      searchable="always"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      {...props}
    />
  );
}

describe("CustomSelect", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the selected option label and opens a searchable listbox", async () => {
    render(<ControlledSelect initialValue="DE" />);
    const toggle = screen.getByRole("button", { name: "Country/Region" });
    expect(toggle.textContent).toBe("Germany");

    await userEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("searchbox", { name: "Search for country" }),
    );
  });

  it("filters options by search text and selects with the keyboard", async () => {
    const onChange = jest.fn();
    render(<ControlledSelect onChange={onChange} />);
    const toggle = screen.getByRole("button", { name: "Country/Region" });

    await userEvent.click(toggle);
    await userEvent.type(screen.getByRole("searchbox"), "jap");

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Select...", "Japan"]);

    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("JP");
    expect(toggle.textContent).toBe("Japan");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it("skips disabled options when navigating with arrow keys", async () => {
    const onChange = jest.fn();
    render(<ControlledSelect initialValue="FR" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.keyboard("{ArrowUp}{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("DE");
  });

  it("does not select disabled options on click", async () => {
    const onChange = jest.fn();
    render(<ControlledSelect onChange={onChange} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("option", { name: "Select..." }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("closes on Escape without propagating to parent handlers", async () => {
    const onParentKeyDown = jest.fn();
    render(
      <div onKeyDown={onParentKeyDown}>
        <ControlledSelect />
      </div>,
    );
    const toggle = screen.getByRole("button");

    await userEvent.click(toggle);
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(toggle);
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it("closes when clicking outside", async () => {
    render(
      <>
        <ControlledSelect />
        <p>Outside</p>
      </>,
    );

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("Outside"));

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("cannot be opened when disabled", async () => {
    render(<ControlledSelect disabled />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the toggle invalid and shows the error", () => {
    render(<ControlledSelect error="Country is required" required />);
    const toggle = screen.getByRole("button");

    expect(toggle.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(toggle.getAttribute("aria-errormessage")!)
        ?.textContent,
    ).toContain("Country is required");
  });
});
