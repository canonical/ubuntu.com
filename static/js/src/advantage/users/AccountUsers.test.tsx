import React from "react";
import { render, screen } from "@testing-library/react";

import AccountUsers from "./AccountUsers";

it("displays organisation name", () => {
  render(<AccountUsers organisationName="Canonical" />);
  screen.getByText("Canonical");
});
