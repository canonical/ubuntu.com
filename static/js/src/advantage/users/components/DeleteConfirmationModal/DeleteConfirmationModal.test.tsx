import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";

import { getByTextContent } from "../../../tests/utils";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { mockUser, mockAccountId } from "../../mockData";
import { requestDeleteUser } from "../../api";

jest.mock("../../api");

const renderWithQueryClient = (Component: React.ReactNode) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{Component}</QueryClientProvider>
  );
};

it("displays confirmation message correctly", () => {
  const onAfterDeleteSuccess = jest.fn();
  const mockHandleClose = jest.fn();

  render(
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

it("makes a correct call to requestDeleteUser", () => {
  const onAfterDeleteSuccess = jest.fn();
  const mockHandleClose = jest.fn();

  const { container } = renderWithQueryClient(
    <DeleteConfirmationModal
      accountId={mockAccountId}
      user={mockUser}
      onAfterDeleteSuccess={onAfterDeleteSuccess}
      handleClose={mockHandleClose}
    />
  );
  userEvent.click(screen.getByText("Yes, remove user"));
  expect(container.firstChild).toMatchInlineSnapshot();
  expect(requestDeleteUser).toHaveBeenCalledTimes(1);
});
