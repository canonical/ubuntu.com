import React from "react";
import { Formik } from "formik";

import MainTable from "@canonical/react-components/dist/components/MainTable";

import { User, UserRole, Users } from "../../types";
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
  userInEditMode?: User;
  userInEditModeById: UserId | null;
  setUserInEditModeById: (userId: UserId | null) => void;
  dismissEditMode: () => void;
  handleEditSubmit: ({ newUserRole }: { newUserRole: UserRole }) => void;
  handleDeleteConfirmationModalOpen: () => void;
};

const TableView = ({
  users,
  userInEditMode,
  userInEditModeById,
  setUserInEditModeById,
  dismissEditMode,
  handleEditSubmit,
  handleDeleteConfirmationModalOpen,
}: Props) => {
  return (
    <Formik
      initialValues={{ newUserRole: userInEditMode?.role }}
      onSubmit={(values) => {
        handleEditSubmit(values);
      }}
    >
      {({ handleSubmit }) => (
        <MainTable
          responsive
          headers={[
            {
              content: "email",
            },
            {
              content: "role",
              width: "20%",
            },
            {
              content: "last sign in",
              width: "15%",
            },
            {
              content: "actions",
              width: "20%",
            },
          ]}
          rows={users.map((user) =>
            getUserRow({
              user,
              variant: getVariant(user.id, userInEditModeById),
              setUserInEditModeById,
              dismissEditMode,
              handleEditSubmit: handleSubmit,
              handleDeleteConfirmationModalOpen,
            })
          )}
        />
      )}
    </Formik>
  );
};

export default TableView;
