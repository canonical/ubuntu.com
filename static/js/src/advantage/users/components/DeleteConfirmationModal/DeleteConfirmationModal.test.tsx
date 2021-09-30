import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getByTextContent, renderWithQueryClient } from "../../../tests/utils";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { mockUser, mockAccountId } from "../../mockData";
import { requestDeleteUser } from "../../api";

jest.mock("../../api");

it("displays confirmation message correctly", () => {
  const onAfterDeleteSuccess = jest.fn();
  const mockHandleClose = jest.fn();

  renderWithQueryClient(
    <DeleteConfirmationModal
      accountId={mockAccountId}
      user={mockUser}
      onAfterDeleteSuccess={onAfterDeleteSuccess}
      handleClose={mockHandleClose}
    />
  );

  expect(
    getByTextContent(
      "Are you sure you want to remove philip.p@ecorp.com from your organisation?"
    )
  ).toBeVisible();
});

it("makes a correct call to requestDeleteUser", async () => {
  const onAfterDeleteSuccess = jest.fn();
  const mockHandleClose = jest.fn();

  renderWithQueryClient(
    <DeleteConfirmationModal
      accountId={mockAccountId}
      user={mockUser}
      onAfterDeleteSuccess={onAfterDeleteSuccess}
      handleClose={mockHandleClose}
    />
  );

  userEvent.click(screen.getByText("Yes, remove user"));

  await waitFor(() =>
    expect(requestDeleteUser).toHaveBeenCalledWith({
      accountId: mockAccountId,
      email: mockUser.email,
    })
  );
});
