import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { User } from "../types";
import AccountUsers from "../AccountUsers";
import { mockUser } from "../mockData";

it("allows to edit only a single user at a time", async () => {
  const users: User[] = [
    { ...mockUser, id: "1", email: "karen@ecorp.com", role: "Billing" },
    { ...mockUser, id: "3", email: "angela@ecorp.com", role: "Technical" },
  ];

  render(<AccountUsers organisationName="Canonical" users={users} />);
  screen.getByLabelText("Edit user karen@ecorp.com").click();
  expect(screen.getByLabelText("Edit user angela@ecorp.com")).toBeDisabled();

  screen.getByRole("button", { name: "Cancel" }).click();

  await waitFor(() =>
    expect(screen.findByLabelText("Edit user angela@ecorp.com")).toBeEnabled()
  );
  expect(screen.getByLabelText("Edit user karen@ecorp.com")).toBeEnabled();
});
