import React from "react";
import { render, screen } from "@testing-library/react";

import Summary from "./Summary";

it("renders correctly", () => {
  render(
    <Summary
      productName="Apples"
      quantity={15}
      startDate={new Date("2020-02-15T13:45:00Z")}
      endDate={new Date("2025-02-15T13:45:00Z")}
      total={15000}
    />
  );

  expect(screen.getByText("Apples")).toBeInTheDocument();
  expect(screen.getByText("15 x $10.00")).toBeInTheDocument();
  expect(screen.getByText("15 February 2020")).toBeInTheDocument();
  expect(screen.getByText("15 February 2025")).toBeInTheDocument();
  expect(screen.getByText("$150.00")).toBeInTheDocument();
});
