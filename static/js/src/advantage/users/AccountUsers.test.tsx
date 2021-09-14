import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AccountUsers from "./AccountUsers";
import { mockData } from "./mockData";

it("displays organisation name", () => {
  render(<AccountUsers organisationName="Canonical" users={mockData.users} />);
  screen.getByText("Canonical");
});

it("displays a success message after adding a user", async () => {
  render(<AccountUsers organisationName="Canonical" users={mockData.users} />);

  userEvent.click(screen.getByText("Add new user"));
  const modal = screen.getByLabelText("Add a new user to this organisation");

  userEvent.type(within(modal).getByLabelText("Name"), "Angela");
  userEvent.type(
    within(modal).getByLabelText("Users’ email address"),
    "angela@ecorp.com"
  );
  userEvent.selectOptions(within(modal).getByLabelText("Role"), "technical");
  userEvent.click(within(modal).getByRole("button", { name: "Add new user" }));

  await waitFor(() => screen.getByRole("alert"));

  expect(screen.getByRole("alert")).toHaveTextContent(
    /User added successfully/
  );
});
