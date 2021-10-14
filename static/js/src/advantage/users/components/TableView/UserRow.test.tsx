import React from "react";
import { render, screen } from "@testing-library/react";

import { User } from "../../types";
import UserRow from "./UserRow";

const testUser: User = {
  name: "User",
  email: "user@ecorp.com",
  role: "admin",
  lastLoginAt: "2021-02-15T13:45:00Z",
};

it("regular variant renders correctly", () => {
  render(
    <table>
      <tbody>
        <UserRow
          user={testUser}
          variant="regular"
          setUserInEditMode={jest.fn()}
          dismissEditMode={jest.fn()}
          handleEditSubmit={jest.fn()}
          handleDeleteConfirmationModalOpen={jest.fn()}
        />
      </tbody>
    </table>
  );

  expect(screen.getByText("user@ecorp.com")).toBeInTheDocument();
  expect(screen.getByText("Admin")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Edit/ })).toBeInTheDocument();

  // check that 'editing' buttons are not visible
  expect(
    screen.getByTestId("hidden-select-to-prevent-layout-shifting")
  ).not.toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Cancel" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save" })
  ).not.toBeInTheDocument();
});

it("editing variant renders correctly", () => {
  render(
    <table>
      <tbody>
        <UserRow
          user={testUser}
          variant="editing"
          setUserInEditMode={jest.fn()}
          dismissEditMode={jest.fn()}
          handleEditSubmit={jest.fn()}
          handleDeleteConfirmationModalOpen={jest.fn()}
        />
      </tbody>
    </table>
  );

  expect(screen.getByText("user@ecorp.com")).toBeInTheDocument();
  expect(screen.getByLabelText(/delete/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();

  // check that elements from 'regular' variant are not visible
  expect(screen.getByText("Admin", { ignore: "option" })).not.toBeVisible();
  expect(
    screen.queryByTestId("hidden-select-to-prevent-layout-shifting")
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Edit/ })
  ).not.toBeInTheDocument();
});
