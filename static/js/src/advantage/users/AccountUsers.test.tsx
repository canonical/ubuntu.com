import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";

import { User } from "./types";
import {
  default as AccountUsersComponent,
  AccountUsersProps,
} from "./AccountUsers";
import { mockData } from "./mockData";

jest.mock("./api");
const queryClient = new QueryClient();

const AccountUsers = (
  props: { accountId?: string } & Omit<AccountUsersProps, "accountId">
) => (
  <QueryClientProvider client={queryClient}>
    <AccountUsersComponent accountId="account-id" {...props} />
  </QueryClientProvider>
);

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

it("allows to edit only a single user at a time", async () => {
  const mockUserBase = {
    lastLoginAt: "2021-06-10T09:05:00Z",
  };
  const users: User[] = [
    {
      ...mockUserBase,
      id: "1",
      name: "Karen",
      email: "karen@ecorp.com",
      role: "billing",
    },
    {
      ...mockUserBase,
      id: "3",
      name: "Angela",
      email: "angela@ecorp.com",
      role: "technical",
    },
  ];

  render(<AccountUsers organisationName="ECorp" users={users} />);

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
