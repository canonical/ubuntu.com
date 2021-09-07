import React from "react";
import { render, screen } from "@testing-library/react";

import { User } from "./types";
import AccountUsers from "./AccountUsers";
import { mockData } from "./mockData";

it("displays organisation name", () => {
  render(<AccountUsers organisationName="Canonical" users={mockData.users} />);
  screen.getByText("Canonical");
});

it("displays user details in a correct format", () => {
  const testUser: User = {
    email: "user@ecorp.com",
    role: "Admin",
    createdAt: "2020-01-10T10:00:00Z",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };

  render(<AccountUsers organisationName="Canonical" users={[testUser]} />);

  screen.getByText("user@ecorp.com");
  screen.getByText("Admin");
  screen.getByText("10/01/2020");
  screen.getByText("15/02/2021");
});
