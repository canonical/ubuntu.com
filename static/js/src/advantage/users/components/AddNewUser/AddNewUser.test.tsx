import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddNewUser from "./AddNewUser";

it("opens 'Add new user' modal on click", () => {
  render(<AddNewUser />);
  userEvent.click(screen.getByText("Add new user"));

  const modal = screen.getByLabelText("Add a new user to this organisation");

  expect(within(modal).getByLabelText("Name")).toBeVisible();
  expect(within(modal).getByLabelText("Users’ email address")).toBeVisible();
  expect(within(modal).getByLabelText("Role")).toBeVisible();
  expect(
    within(modal).getByRole("button", { name: "Add new user" })
  ).toBeVisible();
  expect(within(modal).getByRole("button", { name: "Cancel" })).toBeVisible();
});

it("displays a success message after adding a user", async () => {
  render(<AddNewUser />);

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
