import React from "react";
import { render, screen } from "@testing-library/react";

import AccountUsers from "./AccountUsers";
import { mockData } from "./mockData";

it("displays organisation name", () => {
  render(<AccountUsers organisationName="Canonical" users={mockData.users} />);
  screen.getByText("Canonical");
});
