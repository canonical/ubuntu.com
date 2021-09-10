import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { User } from "../../types";
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

  expect(screen.getByText("user@ecorp.com")).toBeInTheDocument();
  expect(screen.getByText("Admin", { ignore: "option" })).toBeInTheDocument();
  expect(screen.getByText("Admin", { selector: "option" })).not.toBeVisible();
  expect(screen.getByText("10/01/2020")).toBeInTheDocument();
  expect(screen.getByText("15/02/2021")).toBeInTheDocument();
});

it("allows to edit only a single user at a time", async () => {
  const mockUserBase = {
    createdAt: "2020-01-10T12:00:00Z",
    lastLoginAt: "2021-06-10T09:05:00Z",
  };
  const users: User[] = [
    { ...mockUserBase, id: "1", email: "karen@ecorp.com", role: "Billing" },
    { ...mockUserBase, id: "3", email: "angela@ecorp.com", role: "Technical" },
  ];

  render(<TableView users={users} />);

  const EDIT_KAREN = "Edit user karen@ecorp.com";
  const EDIT_ANGELA = "Edit user angela@ecorp.com";

  screen
    .getAllByRole("button", { name: /Edit/ })
    .forEach((button) => expect(button).toBeEnabled());

  screen.getByLabelText(EDIT_KAREN).click();
  expect(screen.getByLabelText(EDIT_ANGELA)).toBeDisabled();

  screen.getByRole("button", { name: "Cancel" }).click();

  await waitFor(() => expect(screen.getByLabelText(EDIT_ANGELA)).toBeEnabled());
  expect(screen.getByLabelText(EDIT_KAREN)).toBeEnabled();
});
