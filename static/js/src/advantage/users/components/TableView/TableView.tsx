import React from "react";

import { Table, TableHeader, TableRow } from "@canonical/react-components";

import { UserRole, Users } from "../../types";
import UserRow from "./UserRow";

export type UserRowVariant = "regular" | "editing" | "disabled";

type UserId = string;

const getVariant = (userId: UserId, userInEditMode: UserId | null) => {
  if (userInEditMode === null) {
    return "regular";
  } else if (userId !== userInEditMode) {
    return "disabled";
  } else {
    return "editing";
  }
};

type Props = {
  users: Users;
  userInEditModeById: UserId | null;
  setUserInEditModeById: (userId: UserId | null) => void;
  dismissEditMode: () => void;
  handleEditSubmit: ({
    email,
    newUserRole,
  }: {
    email: string;
    newUserRole: UserRole;
  }) => void;
  handleDeleteConfirmationModalOpen: () => void;
};

const TableView = ({
  users,
  userInEditModeById,
  setUserInEditModeById,
  dismissEditMode,
  handleEditSubmit,
  handleDeleteConfirmationModalOpen,
}: Props) => {
  return (
    <Table responsive={true}>
      <thead>
        <TableRow>
          <TableHeader>email</TableHeader>
          <TableHeader width="20%">role</TableHeader>
          <TableHeader width="15%">last sign in</TableHeader>
          <TableHeader width="20%">actions</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            variant={getVariant(user.id, userInEditModeById)}
            setUserInEditModeById={setUserInEditModeById}
            dismissEditMode={dismissEditMode}
            handleEditSubmit={handleEditSubmit}
            handleDeleteConfirmationModalOpen={
              handleDeleteConfirmationModalOpen
            }
          />
        ))}
      </tbody>
    </Table>
  );
};

export default TableView;
