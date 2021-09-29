import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getRandomUser } from "../../../tests/utils";
import TableView from "./TableView";

it("displays user details in a correct format", () => {
  const testUser = getRandomUser();

  render(
    <TableView
      users={[testUser]}
      userInEditMode={null}
      setUserInEditModeById={jest.fn()}
      handleEditSubmit={jest.fn()}
      dismissEditMode={jest.fn()}
      handleDeleteConfirmationModalOpen={jest.fn()}
    />
  );

  expect(screen.getByText("user@ecorp.com")).toBeInTheDocument();
  expect(screen.getByText("Admin", { ignore: "option" })).toBeInTheDocument();
  expect(screen.getByText("15/02/2021")).toBeInTheDocument();
});

it("doesn't display pagination when there is less than 11 users", () => {
  const users = [...new Array(10)].map(getRandomUser);

  render(
    <TableView
      users={users}
      userInEditMode={null}
      setUserInEditModeById={jest.fn()}
      handleEditSubmit={jest.fn()}
      dismissEditMode={jest.fn()}
      handleDeleteConfirmationModalOpen={jest.fn()}
    />
  );

  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

it("paginates the results when there is 11 users or more", () => {
  const usersPage1 = [...new Array(10)].map(getRandomUser);
  const usersPage2 = [...new Array(2)].map(getRandomUser);

  render(
    <TableView
      users={[...usersPage1, ...usersPage2]}
      userInEditMode={null}
      setUserInEditModeById={jest.fn()}
      handleEditSubmit={jest.fn()}
      dismissEditMode={jest.fn()}
      handleDeleteConfirmationModalOpen={jest.fn()}
    />
  );

  expect(screen.getAllByLabelText("email")).toHaveLength(10);
  screen.getAllByLabelText("email").forEach((item, index) => {
    expect(item).toHaveTextContent(`${usersPage1[index].email}`);
  });
  userEvent.click(
    within(screen.getByRole("navigation")).getByRole("button", { name: "2" })
  );
  expect(screen.getAllByLabelText("email")).toHaveLength(2);
  screen.getAllByLabelText("email").forEach((item, index) => {
    expect(item).toHaveTextContent(`${usersPage2[index].email}`);
  });
});
