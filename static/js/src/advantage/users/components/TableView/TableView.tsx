import React from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import { Users } from "../../types";
import { getUserRow } from "./components";

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
  handleDeleteConfirmationModalOpen: () => void;
};

const TableView = ({
  users,
  userInEditModeById,
  setUserInEditModeById,
  dismissEditMode,
  handleDeleteConfirmationModalOpen,
}: Props) => {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "email",
        },
        {
          content: "role",
        },
        {
          content: "last sign in",
        },
        {
          content: "actions",
        },
      ]}
      rows={users.map((user) =>
        getUserRow({
          user,
          variant: getVariant(user.id, userInEditModeById),
          setUserInEditModeById,
          dismissEditMode,
          handleDeleteConfirmationModalOpen,
        })
      )}
    />
  );
};

export default TableView;
