import React from "react";
import { format } from "date-fns";
import CSS from "csstype";

import { Button, Select } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

import { User } from "../../types";
import { UserRowVariant } from "./TableView";
import { userRoleOptions } from "../../constants";

const DATE_FORMAT = "dd/MM/yyyy";

type UserVariantProps = {
  user: User;
  variant: UserRowVariant;
};

type UserActionsProps = {
  handleEditOpen: (id: string) => void;
  handleEditSubmit: (id: string) => void;
  handleCancel: () => void;
} & UserVariantProps;

const UserActions = ({
  user,
  variant,
  handleEditOpen,
  handleEditSubmit,
  handleCancel,
}: UserActionsProps) => {
  return variant !== "editing" ? (
    <Button
      small
      dense
      onClick={() => handleEditOpen(user.id)}
      disabled={variant === "disabled"}
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

type UserEmailProps = UserVariantProps;

const UserEmail = ({ user, variant }: UserEmailProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {user.email}
      {variant === "editing" ? (
        <button
          className="p-button--base u-no-margin--bottom"
          style={{
            marginLeft: "0.1rem",
          }}
        >
          <i className="p-icon--delete" aria-label="delete"></i>
        </button>
      ) : null}
    </div>
  );
};

type UserRoleProps = UserVariantProps;

const getVisibilityStyles = (isVisible: boolean): CSS.Properties => ({
  display: "flex",
  alignItems: "center",
  height: "100%",
  visibility: isVisible ? "visible" : "hidden",
  opacity: isVisible ? 1 : 0,
});

const UserRole = ({ user, variant }: UserRoleProps) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          ...getVisibilityStyles(variant !== "editing"),
          position: "absolute",
        }}
      >
        <span>
          {userRoleOptions.find((option) => option.value === user.role)?.label}
        </span>
      </div>
      <div
        style={{
          ...getVisibilityStyles(variant === "editing"),
          position: "static",
        }}
      >
        <Select
          defaultValue={user.role}
          name="user-role"
          className="u-no-margin--bottom"
          options={userRoleOptions}
        />
      </div>
    </div>
  );
};

const FormattedDate = ({ dateISO }: { dateISO: string }) => (
  <time dateTime={format(new Date(dateISO), "yyyy-MM-dd")}>
    {format(new Date(dateISO), DATE_FORMAT)}
  </time>
);

type UserRowProps = {
  setUserInEditMode: (id: string) => void;
  dismissEditMode: () => void;
} & UserVariantProps;

const tdStyle = {
  verticalAlign: "middle",
};

const getUserRow = ({
  user,
  variant,
  setUserInEditMode,
  dismissEditMode,
}: UserRowProps): MainTableRow => {
  return {
    key: user.id,
    ["aria-hidden"]: variant === "disabled",
    style: {
      transition: "opacity 250ms",
      opacity: variant === "disabled" ? 0.5 : 1,
    },
    columns: [
      {
        content: <UserEmail user={user} variant={variant} />,
        role: "rowheader",
        style: tdStyle,
      },
      {
        content: <UserRole user={user} variant={variant} />,
        style: tdStyle,
      },
      {
        content: <FormattedDate dateISO={user.lastLoginAt} />,
        style: tdStyle,
      },
      {
        content: (
          <UserActions
            variant={variant}
            user={user}
            handleEditOpen={setUserInEditMode}
            handleCancel={dismissEditMode}
            handleEditSubmit={dismissEditMode}
          />
        ),
        style: tdStyle,
      },
    ],
  };
};

export { getUserRow };
