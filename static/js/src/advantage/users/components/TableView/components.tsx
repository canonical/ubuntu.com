import React from "react";
import { format } from "date-fns";

import Button from "@canonical/react-components/dist/components/Button";
import Select from "@canonical/react-components/dist/components/Select";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

import { User } from "../../types";
import { UserRowVariant } from "./TableView";

const DATE_FORMAT = "dd/MM/yyyy";

const UserActions: React.FC<{
  variant: UserRowVariant;
  user: User;
  handleEditOpen: (id: string) => void;
  handleEditSubmit: (id: string) => void;
  handleCancel: () => void;
}> = ({ user, variant, handleEditOpen, handleEditSubmit, handleCancel }) => {
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

const UserEmail: React.FC<{ user: User; variant: UserRowVariant }> = ({
  user,
  variant,
}) => {
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

const UserRole: React.FC<{
  user: User;
  variant: UserRowVariant;
}> = ({ user, variant }) => {
  return (
    <>
      {variant !== "editing" ? (
        user.role
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

const FormattedDate = ({ dateISO }: { dateISO: string }) => (
  <time dateTime={format(new Date(dateISO), "yyyy-MM-dd")}>
    {format(new Date(dateISO), DATE_FORMAT)}
  </time>
);

interface UserRowProps {
  variant: UserRowVariant;
  user: User;
  setUserInEditMode: (id: string) => void;
  dismissEditMode: () => void;
}

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
        content: <FormattedDate dateISO={user.createdAt} />,
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
