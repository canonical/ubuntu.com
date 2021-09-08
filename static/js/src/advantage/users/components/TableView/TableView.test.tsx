import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { User } from "../../types";
import { mockUser } from "../../mockData";
import TableView from "./TableView";

it("displays user details in a correct format", () => {
  const testUser: User = {
    id: "1",
    email: "user@ecorp.com",
    role: "Admin",
    createdAt: "2020-01-10T10:00:00Z",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };

  render(<TableView users={[testUser]} />);

  screen.getByText("user@ecorp.com");
  screen.getByText("Admin");
  screen.getByText("10/01/2020");
  screen.getByText("15/02/2021");
});

it("allows to edit only a single user at a time", async () => {
  const users: User[] = [
    { ...mockUser, id: "1", email: "karen@ecorp.com", role: "Billing" },
    { ...mockUser, id: "3", email: "angela@ecorp.com", role: "Technical" },
  ];

  render(<TableView users={users} />);
  screen.getByLabelText("Edit user karen@ecorp.com").click();
  expect(screen.getByLabelText("Edit user angela@ecorp.com")).toBeDisabled();

  screen.getByRole("button", { name: "Cancel" }).click();

  await waitFor(() =>
    expect(screen.getByLabelText("Edit user angela@ecorp.com")).toBeEnabled()
  );
  expect(screen.getByLabelText("Edit user karen@ecorp.com")).toBeEnabled();
});
