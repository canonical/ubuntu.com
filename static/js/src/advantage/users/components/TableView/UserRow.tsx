import React from "react";
import { format } from "date-fns";
import CSS from "csstype";
import { Formik, Field } from "formik";

import { Button, Select, TableRow } from "@canonical/react-components";
import {
  default as TableCellComponent,
  TableCellProps,
} from "@canonical/react-components/dist/components/TableCell";

import { User, UserRole as UserRoleType } from "../../types";
import { UserHeaderText, UserRowVariant } from "./TableView";
import { userRoleOptions } from "../../constants";

const DATE_FORMAT = "dd/MM/yyyy";

type UserVariantProps = {
  user: User;
  variant: UserRowVariant;
};

type UserEmailProps = {
  handleDeleteConfirmationModalOpen: () => void;
} & UserVariantProps;

const UserEmail = ({
  user,
  variant,
  handleDeleteConfirmationModalOpen,
}: UserEmailProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {user.email}
      </span>
      {variant === "editing" ? (
        <button
          aria-label="delete"
          className="p-button--base u-no-margin--bottom"
          style={{
            marginLeft: "0.1rem",
          }}
          onClick={handleDeleteConfirmationModalOpen}
        >
          <i className="p-icon--delete"></i>
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
        {variant === "editing" ? (
          <Field
            as={Select}
            name="newUserRole"
            aria-label="role"
            className="u-no-margin--bottom"
            options={userRoleOptions}
          />
        ) : (
          <Select
            className="u-no-margin--bottom"
            data-testid="hidden-select-to-prevent-layout-shifting"
          />
        )}
      </div>
    </div>
  );
};

const FormattedDate = ({ dateISO }: { dateISO: string | null }) =>
  dateISO ? (
    <time dateTime={format(new Date(dateISO), "yyyy-MM-dd")}>
      {format(new Date(dateISO), DATE_FORMAT)}
    </time>
  ) : (
    <>Never</>
  );

type UserRowProps = {
  setUserInEditModeById: (email: string) => void;
  dismissEditMode: () => void;
  handleEditSubmit: ({
    email,
    newUserRole,
  }: {
    email: string;
    newUserRole: UserRoleType;
  }) => void;
  handleDeleteConfirmationModalOpen: () => void;
} & UserVariantProps;

const tdStyle = {
  verticalAlign: "middle",
};

const UserCell = ({
  label,
  children,
  ...props
}: TableCellProps & {
  label: UserHeaderText;
}) => (
  <TableCellComponent aria-label={label} {...props}>
    {children}
  </TableCellComponent>
);

const UserRowEditable = ({
  user,
  dismissEditMode,
  handleEditSubmit,
  handleDeleteConfirmationModalOpen,
}: UserRowProps) => {
  return (
    <Formik
      initialValues={{ newUserRole: user?.role }}
      onSubmit={async (values) => {
        await handleEditSubmit({
          email: user.email,
          newUserRole: values.newUserRole,
        });
      }}
    >
      {({ handleSubmit, isSubmitting }) => (
        <TableRow>
          <UserCell role="rowheader" style={tdStyle} label="email">
            <UserEmail
              user={user}
              variant="editing"
              handleDeleteConfirmationModalOpen={
                handleDeleteConfirmationModalOpen
              }
            />
          </UserCell>
          <UserCell style={tdStyle} label="role">
            <UserRole user={user} variant="editing" />
          </UserCell>
          <UserCell style={tdStyle} label="last sign in">
            <FormattedDate dateISO={user.lastLoginAt} />
          </UserCell>
          <UserCell style={tdStyle} label="actions">
            <Button small dense onClick={dismissEditMode}>
              Cancel
            </Button>
            <Button
              small
              dense
              appearance="positive"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
            >
              Save
            </Button>
          </UserCell>
        </TableRow>
      )}
    </Formik>
  );
};

const UserRowNonEditable = ({
  user,
  variant,
  setUserInEditModeById,
  handleDeleteConfirmationModalOpen,
}: UserRowProps) => {
  return (
    <TableRow
      aria-hidden={variant === "disabled"}
      style={{
        transition: "opacity 250ms",
        opacity: variant === "disabled" ? 0.5 : 1,
      }}
    >
      <UserCell role="rowheader" style={tdStyle} label="email">
        <UserEmail
          user={user}
          variant={variant}
          handleDeleteConfirmationModalOpen={handleDeleteConfirmationModalOpen}
        />
      </UserCell>
      <UserCell style={tdStyle} label="role">
        <UserRole user={user} variant={variant} />
      </UserCell>
      <UserCell style={tdStyle} label="last sign in">
        <FormattedDate dateISO={user.lastLoginAt} />
      </UserCell>
      <UserCell style={tdStyle} label="actions">
        <Button
          small
          dense
          onClick={() => setUserInEditModeById(user.email)}
          disabled={variant === "disabled"}
          aria-label={`Edit user ${user.email}`}
        >
          Edit
        </Button>
      </UserCell>
    </TableRow>
  );
};

const UserRow = (props: UserRowProps) =>
  props.variant === "editing" ? (
    <UserRowEditable {...props} />
  ) : (
    <UserRowNonEditable {...props} />
  );

export default UserRow;
