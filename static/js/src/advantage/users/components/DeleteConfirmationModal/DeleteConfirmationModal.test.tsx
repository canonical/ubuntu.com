import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getByTextContent } from "../../../tests/utils";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { mockUser } from "../../mockData";

it("displays confirmation message correctly", () => {
  const mockHandleConfirmDelete = jest.fn();
  const mockHandleClose = jest.fn();

  render(
    <DeleteConfirmationModal
      user={mockUser}
      handleConfirmDelete={mockHandleConfirmDelete}
      handleClose={mockHandleClose}
    />
  );

  expect(
    getByTextContent(
      "Are you sure you want to remove philip.p@ecorp.com from your organisation?"
    )
  ).toBeVisible();
});

it("makes a correct call to handleConfirmDelete", () => {
  const mockHandleConfirmDelete = jest.fn(Promise.resolve);
  const mockHandleClose = jest.fn();

  render(
    <DeleteConfirmationModal
      user={mockUser}
      handleConfirmDelete={mockHandleConfirmDelete}
      handleClose={mockHandleClose}
    />
  );
  userEvent.click(screen.getByText("Yes, remove user"));
  expect(mockHandleConfirmDelete).toHaveBeenCalledWith(mockUser.email);
});
