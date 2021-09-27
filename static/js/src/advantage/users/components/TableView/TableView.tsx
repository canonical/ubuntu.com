import React from "react";

import {
  default as TableHeaderComponent,
  TableHeaderProps,
} from "@canonical/react-components/dist/components/TableHeader";
import { Table, TableRow, Pagination } from "@canonical/react-components";

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

export type UserHeaderText = "email" | "role" | "last sign in" | "actions";

const UsersTableHeader = ({
  label,
  ...props
}: TableHeaderProps & {
  label: UserHeaderText;
}) => <TableHeaderComponent {...props}>{label}</TableHeaderComponent>;

const TableView = ({
  users,
  userInEditModeById,
  setUserInEditModeById,
  dismissEditMode,
  handleEditSubmit,
  handleDeleteConfirmationModalOpen,
}: Props) => {
  const pageSize = 10;
  const [pageNumber, setPageNumber] = React.useState(1);
  const handlePaginate = (pageNumber: number) => {
    setPageNumber(pageNumber);
    dismissEditMode();
  };

  const usersPage = React.useMemo(() => {
    const pageStart = pageSize * (pageNumber - 1);
    const pageEnd = pageStart + pageSize;

    return users.slice(pageStart, pageEnd);
  }, [pageNumber, users, pageSize]);

  return (
    <>
      <Table responsive={true}>
        <thead>
          <TableRow>
            <UsersTableHeader label="email" />
            <UsersTableHeader label="role" width="20%" />
            <UsersTableHeader label="last sign in" width="15%" />
            <UsersTableHeader label="actions" width="20%" />
          </TableRow>
        </thead>
        <tbody>
          {usersPage.map((user) => (
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
      <Pagination
        currentPage={pageNumber}
        itemsPerPage={pageSize}
        paginate={handlePaginate}
        totalItems={users.length}
      />
    </>
  );
};

export default TableView;
