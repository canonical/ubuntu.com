import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddNewUserForm from "./AddNewUserForm";

it("displays validation for e-mail", async () => {
  render(<AddNewUserForm handleClose={jest.fn()} handleSubmit={jest.fn()} />);
  userEvent.click(screen.getByLabelText("Users’ email address"));
  userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() =>
    expect(screen.getByText(/This field is required./)).toBeVisible()
  );

  userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "invalid-email"
  );
  await waitFor(() =>
    userEvent.click(screen.getByRole("button", { name: "Add new user" }))
  );
  await waitFor(() =>
    expect(screen.getByText(/Must be a valid email./)).toBeVisible()
  );
});

it("calls handleClose modal handler after successful submission", async () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  render(
    <AddNewUserForm
      handleClose={mockHandleClose}
      handleSubmit={mockHandleSubmit}
    />
  );

  userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "angela@ecorp.com"
  );
  userEvent.selectOptions(screen.getByLabelText("Role"), "technical");
  userEvent.click(screen.getByLabelText("Send invite email"));
  userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() =>
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      JSON.stringify({
        email: "angela@ecorp.com",
        role: "technical",
        shouldSendInvite: true,
      })
    )
  );
  expect(mockHandleClose).toHaveBeenCalled();
});

it("displays an error message on submission failure", async () => {
  const mockHandleSubmit = () =>
    Promise.reject(new Error("Failed to add user"));
  const mockHandleClose = jest.fn();

  render(
    <AddNewUserForm
      handleClose={mockHandleClose}
      handleSubmit={mockHandleSubmit}
    />
  );

  userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "angela@ecorp.com"
  );
  userEvent.selectOptions(screen.getByLabelText("Role"), "technical");
  userEvent.click(screen.getByLabelText("Send invite email"));
  userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() =>
    expect(screen.getByText(/An unknown error has occurred./)).toBeVisible()
  );
  expect(mockHandleClose).not.toHaveBeenCalled();
});
