import React, { useState } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import { Users } from "../../types";
import { getUserRow } from "./components";

export type UserRowVariant = "regular" | "editing" | "disabled";

type UserInEditMode = string | null;
type UserId = string;

const getVariant = (userId: UserId, userInEditMode: UserInEditMode) => {
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
};

const TableView = ({ users }: Props) => {
  const [userInEditMode, setUserInEditMode] = useState<string | null>(null);
  const dismissEditMode = () => setUserInEditMode(null);

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
          variant: getVariant(user.id, userInEditMode),
          setUserInEditMode,
          dismissEditMode,
        })
      )}
    />
  );
};

export default TableView;
