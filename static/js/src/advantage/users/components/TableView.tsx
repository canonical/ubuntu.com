import React, { useState } from "react";
import { format } from "date-fns";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import Button from "@canonical/react-components/dist/components/Button";
import Select from "@canonical/react-components/dist/components/Select";

import { User, Users } from "../types";

const DATE_FORMAT = "dd/MM/yyyy";

const UserActions: React.FC<{
  user: User;
  isEditing: boolean;
  handleEditOpen: (id: string) => void;
  handleEditSubmit: (id: string) => void;
  handleCancel: () => void;
  isDisabled: boolean;
}> = ({
  user,
  isEditing,
  handleEditOpen,
  handleEditSubmit,
  handleCancel,
  isDisabled,
}) => {
  return !isEditing ? (
    <Button
      small
      dense
      onClick={() => handleEditOpen(user.id)}
      disabled={isDisabled}
      aria-label={`Edit user ${user.email}`}
    >
      Edit
    </Button>
  ) : (
    <>
      <Button small dense onClick={handleCancel}>
        Cancel
      </Button>
      <Button
        small
        dense
        appearance="positive"
        onClick={() => handleEditSubmit(user.id)}
      >
        Save
      </Button>
    </>
  );
};

const UserDelete = ({ isEditing, handleDelete, isDisabled }: any) => {
  return isEditing ? (
    <button className="p-button--base u-no-margin--bottom">
      <i className="p-icon--delete" aria-label="delete"></i>
    </button>
  ) : null;
};

const UserRole: React.FC<{
  user: User;
  isDisabled: boolean;
  isEditing: boolean;
  handleEditOpen: (id: string) => void;
  handleEditSubmit: (id: string) => void;
  handleCancel: () => void;
}> = ({ user, isEditing, isDisabled }) => {
  return (
    <>
      {!isEditing ? (
        <span className={isDisabled ? "u-text--muted" : undefined}>
          {user.role}
        </span>
      ) : (
        <Select
          defaultValue={user.role}
          name="user-role"
          className="u-no-margin--bottom"
          options={[
            {
              label: "Admin",
              value: "admin",
            },
            {
              label: "Technical",
              value: "technical",
            },
            {
              label: "Billing",
              value: "billing",
            },
          ]}
        />
      )}
    </>
  );
};

const TableView: React.FC<{ users: Users }> = ({ users }) => {
  const [userInEditMode, setUserInEditMode] = useState<string | null>(null);
  const dismissEditMode = () => setUserInEditMode(null);
  const getIsEditing = (userId: string) => userId === userInEditMode;
  const getIsDisabled = (userId: string) =>
    userInEditMode ? userId !== userInEditMode : false;

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
          content: "date added",
        },
        {
          content: "last sign in",
        },
        {
          content: "actions",
        },
      ]}
      rows={users.map((user, index) => ({
        key: index,
        columns: [
          {
            content: (
              <div style={{ display: "flex", alignItems: "center" }}>
                {user.email}
                <UserDelete isEditing={getIsEditing(user.id)} user={user} />
              </div>
            ),
            role: "rowheader",
            className: getIsDisabled(user.id) ? "u-text--muted" : undefined,
            style: { verticalAlign: "middle" },
          },
          {
            content: (
              <UserRole
                user={user}
                isDisabled={getIsDisabled(user.id)}
                isEditing={getIsEditing(user.id)}
                handleEditSubmit={dismissEditMode}
                handleEditOpen={setUserInEditMode}
                handleCancel={dismissEditMode}
              />
            ),
            style: { verticalAlign: "middle" },
          },
          {
            content: format(new Date(user.createdAt), DATE_FORMAT),
            className: getIsDisabled(user.id) ? "u-text--muted" : undefined,
            style: { verticalAlign: "middle" },
          },
          {
            content: format(new Date(user.lastLoginAt), DATE_FORMAT),
            className: getIsDisabled(user.id) ? "u-text--muted" : undefined,
            style: { verticalAlign: "middle" },
          },
          {
            content: (
              <UserActions
                isDisabled={getIsDisabled(user.id)}
                user={user}
                isEditing={getIsEditing(user.id)}
                handleEditOpen={setUserInEditMode}
                handleCancel={dismissEditMode}
                handleEditSubmit={dismissEditMode}
              />
            ),
            style: { verticalAlign: "middle" },
          },
        ],
      }))}
    />
  );
};

export default TableView;
