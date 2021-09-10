import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddNewUser from "./AddNewUser";

it("opens 'Add new user' modal on click", () => {
  render(<AddNewUser />);
  userEvent.click(screen.getByText("Add new user"));

  const modal = screen.getByLabelText("Add a new user to this organisation");

  expect(within(modal).getByLabelText("Users’ email address")).toBeVisible();
  expect(within(modal).getByLabelText("Role")).toBeVisible();
  expect(within(modal).getByLabelText("Send invite email")).toBeVisible();
  expect(
    within(modal).getByRole("button", { name: "Add new user" })
  ).toBeVisible();
  expect(within(modal).getByRole("button", { name: "Cancel" })).toBeVisible();
});
