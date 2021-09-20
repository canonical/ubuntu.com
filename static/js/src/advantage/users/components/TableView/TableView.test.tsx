import React from "react";
import { render, screen } from "@testing-library/react";

import { User } from "../../types";
import TableView from "./TableView";

it("displays user details in a correct format", () => {
  const testUser: User = {
    id: "1",
    name: "User",
    email: "user@ecorp.com",
    role: "admin",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };

  render(
    <TableView
      users={[testUser]}
      userInEditModeById={null}
      setUserInEditModeById={jest.fn()}
      dismissEditMode={jest.fn()}
      handleDeleteConfirmationModalOpen={jest.fn()}
    />
  );

  expect(screen.getByText("user@ecorp.com")).toBeInTheDocument();
  expect(screen.getByText("Admin", { ignore: "option" })).toBeInTheDocument();
  expect(screen.getByText("Admin", { selector: "option" })).not.toBeVisible();
  expect(screen.getByText("15/02/2021")).toBeInTheDocument();
});
