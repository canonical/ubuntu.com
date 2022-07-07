import React from "react";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "./types";
import AccountUsers from "./AccountUsers";
import { mockData, mockUser } from "./mockData";
import { renderWithQueryClient } from "../tests/utils";
import * as api from "./api";

jest.mock("./api");

it("displays organisation name", () => {
  renderWithQueryClient(
    <AccountUsers {...mockData} organisationName="Canonical" />
  );
  screen.getByText("Canonical");
});

const submitNewUserForm = (
  newUser = {
    email: "angela@ecorp.com",
    name: "Angela",
    role: "technical",
  }
) => {
  userEvent.click(screen.getByText("Add new user"));
  const modal = screen.getByLabelText("Add a new user to this organisation");

  userEvent.type(within(modal).getByLabelText("Name"), newUser.name);
  userEvent.type(
    within(modal).getByLabelText("Users’ email address"),
    newUser.email
  );
  userEvent.selectOptions(within(modal).getByLabelText("Role"), newUser.role);
  userEvent.click(within(modal).getByRole("button", { name: "Add new user" }));
};

it("displays an error message on failure to add a new user", async () => {
  (api.requestAddUser as jest.Mock).mockImplementationOnce(
    jest.fn(() => Promise.reject(new Error("Failed")))
  );

  renderWithQueryClient(<AccountUsers {...mockData} />);

  submitNewUserForm();

  await waitFor(() =>
    expect(
      within(screen.getByRole("dialog")).getByText(/error/)
    ).toBeInTheDocument()
  );
});

it("displays a success message after adding a user", async () => {
  renderWithQueryClient(<AccountUsers {...mockData} />);

  const newUser = {
    email: "ethan@ecorp.com",
    name: "Ethan",
    role: "admin",
  };
  submitNewUserForm(newUser);

  await waitFor(() =>
    expect(api.requestAddUser).toHaveBeenCalledWith({
      accountId: mockData.accountId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    /User added successfully/
  );
});

it("allows to edit only a single user at a time", async () => {
  const users: User[] = [
    {
      ...mockUser,
      name: "Karen",
      email: "karen@ecorp.com",
      role: "billing",
    },
    {
      ...mockUser,
      name: "Angela",
      email: "angela@ecorp.com",
      role: "technical",
    },
  ];

  renderWithQueryClient(
    <AccountUsers {...mockData} organisationName="ECorp" users={users} />
  );

  const EDIT_KAREN = "Edit user karen@ecorp.com";
  const EDIT_ANGELA = "Edit user angela@ecorp.com";

  screen
    .getAllByRole("button", { name: /Edit/ })
    .forEach((button) => expect(button).toBeEnabled());

  userEvent.click(screen.getByLabelText(EDIT_KAREN));
  expect(screen.getByLabelText(EDIT_ANGELA)).toBeDisabled();

  userEvent.click(screen.getByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.getByLabelText(EDIT_ANGELA)).toBeEnabled());
  expect(screen.getByLabelText(EDIT_KAREN)).toBeEnabled();
});

it("displays an error message on failure to update user", async () => {
  (api.requestUpdateUser as jest.Mock).mockImplementationOnce(
    jest.fn(() => Promise.reject(new Error("Failed")))
  );

  renderWithQueryClient(
    <AccountUsers
      {...mockData}
      users={[
        {
          ...mockUser,
          name: "Peter",
          email: "peter@ecorp.com",
          role: "billing",
        },
      ]}
    />
  );

  userEvent.click(screen.getByLabelText(`Edit user peter@ecorp.com`));
  await waitFor(() =>
    expect(
      screen.getByRole("combobox", {
        name: "role",
      })
    ).toBeInTheDocument()
  );

  userEvent.selectOptions(
    screen.getByRole("combobox", {
      name: "role",
    }),
    "technical"
  );

  userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(/error/)
  );
});

it("displays a success message after updating a user", async () => {
  const user: User = {
    ...mockUser,
    name: "Peter",
    email: "peter@ecorp.com",
    role: "billing",
  };

  renderWithQueryClient(<AccountUsers {...mockData} users={[user]} />);

  userEvent.click(screen.getByLabelText(`Edit user peter@ecorp.com`));

  userEvent.selectOptions(
    screen.getByRole("combobox", {
      name: "role",
    }),
    "technical"
  );

  userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() =>
    expect(api.requestUpdateUser).toHaveBeenCalledWith({
      accountId: mockData.accountId,
      email: user.email,
      role: "technical",
    })
  );

  expect(screen.getByRole("alert")).toHaveTextContent(/User updated/);
});

it("displays 'No results' when there are no search results", () => {
  const testUser: User = {
    name: "User",
    email: "user@ecorp.com",
    role: "admin",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };

  renderWithQueryClient(
    <AccountUsers
      {...mockData}
      organisationName="ECorp"
      users={[...mockData.users, testUser]}
    />
  );

  expect(screen.queryByText("No results")).not.toBeInTheDocument();
  userEvent.type(
    screen.getByRole("searchbox", { name: "Search for users" }),
    "Lorem ipsum"
  );
  expect(screen.getByText("No results")).toBeInTheDocument();
});

it("displays correct search results", () => {
  const testUser: User = {
    name: "User",
    email: "user@ecorp.com",
    role: "admin",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };

  const mockUsers = [...mockData.users, testUser];

  renderWithQueryClient(<AccountUsers {...mockData} users={mockUsers} />);

  expect(screen.getAllByLabelText("email")).toHaveLength(mockUsers.length);
  userEvent.type(
    screen.getByRole("searchbox", { name: "Search for users" }),
    "user@ecorp.com"
  );
  expect(screen.getAllByLabelText("email")).toHaveLength(1);

  userEvent.click(screen.getByRole("button", { name: "clear" }));
  expect(screen.getAllByLabelText("email")).toHaveLength(mockUsers.length);
});
