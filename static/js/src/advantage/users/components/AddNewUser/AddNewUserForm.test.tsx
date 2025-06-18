import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddNewUserForm from "./AddNewUserForm";

it("displays validation for e-mail", async () => {
  render(<AddNewUserForm handleClose={jest.fn()} handleSubmit={jest.fn()} />);
  userEvent.click(screen.getByLabelText("Users’ email address"));
  userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() =>
    expect(screen.getByText(/This field is required./)).toBeVisible(),
  );

  userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "invalid-email",
  );
  await waitFor(() =>
    userEvent.click(screen.getByRole("button", { name: "Add new user" })),
  );
  await waitFor(() =>
    expect(screen.getByText(/Must be a valid email./)).toBeVisible(),
  );
});

it("calls handleClose modal handler after successful submission", async () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  render(
    <AddNewUserForm
      handleClose={mockHandleClose}
      handleSubmit={mockHandleSubmit}
    />,
  );
  await userEvent.type(screen.getByLabelText("Name"), "Angela");
  await userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "angela@ecorp.com",
  );
  await userEvent.selectOptions(screen.getByLabelText("Role"), "technical");
  await userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() =>
    expect(mockHandleSubmit).toHaveBeenCalledWith({
      name: "Angela",
      email: "angela@ecorp.com",
      role: "technical",
    }),
  );
  expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  waitFor(() => expect(mockHandleClose).toHaveBeenCalled());
});

it("submits the form on pressing the Enter key", async () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  render(
    <AddNewUserForm
      handleClose={mockHandleClose}
      handleSubmit={mockHandleSubmit}
    />,
  );
  await userEvent.type(screen.getByLabelText("Name"), "Angela");
  await userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "angela@ecorp.com",
  );
  (await screen.findByLabelText("Name")).focus(); // Focus on the name field
  await userEvent.keyboard("{enter}"); // Press the Enter key
  await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalledTimes(1));
});

it("displays an alert message on submission failure", async () => {
  const mockHandleSubmit = () =>
    Promise.reject(new Error("Failed to add user"));
  const mockHandleClose = jest.fn();

  render(
    <AddNewUserForm
      handleClose={mockHandleClose}
      handleSubmit={mockHandleSubmit}
    />,
  );

  await userEvent.type(screen.getByLabelText("Name"), "Angela");
  await userEvent.type(
    screen.getByLabelText("Users’ email address"),
    "angela@ecorp.com",
  );
  await userEvent.selectOptions(screen.getByLabelText("Role"), "technical");
  await userEvent.click(screen.getByRole("button", { name: "Add new user" }));

  await waitFor(() => screen.getByRole("alert"));

  expect(screen.getByRole("alert")).toHaveTextContent(
    /An unknown error has occurred./,
  );
  expect(mockHandleClose).not.toHaveBeenCalled();
});
