import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FeatureSwitch from "./FeatureSwitch";

it("renders unchecked state correctly", () => {
  render(
    <FeatureSwitch isChecked={false} handleOnChange={jest.fn()}>
      ESM Infra
    </FeatureSwitch>
  );

  const checkbox = screen.getByRole("checkbox", {
    name: "ESM Infra",
  }) as HTMLInputElement;

  expect(checkbox).toBeInTheDocument();
  expect(checkbox.checked).toEqual(false);
});

it("renders checked state correctly", () => {
  render(
    <FeatureSwitch isChecked={true} handleOnChange={jest.fn()}>
      ESM Infra
    </FeatureSwitch>
  );

  const checkbox = screen.getByRole("checkbox", {
    name: "ESM Infra",
  }) as HTMLInputElement;

  expect(checkbox).toBeInTheDocument();
  expect(checkbox.checked).toEqual(true);
});

it("renders disabled variant correctly", () => {
  render(
    <FeatureSwitch
      isChecked={true}
      isDisabled={true}
      handleOnChange={jest.fn()}
    >
      ESM Infra
    </FeatureSwitch>
  );

  const checkbox = screen.getByRole("checkbox", {
    name: "ESM Infra",
  }) as HTMLInputElement;

  expect(checkbox).toBeInTheDocument();
  expect(checkbox.disabled).toEqual(true);
});

it("calls handleOnChange on click", () => {
  const mockFn = jest.fn();
  render(
    <FeatureSwitch isChecked={false} handleOnChange={mockFn}>
      ESM Infra
    </FeatureSwitch>
  );

  userEvent.click(screen.getByRole("checkbox", { name: "ESM Infra" }));
  expect(mockFn).toHaveBeenCalled();
});
