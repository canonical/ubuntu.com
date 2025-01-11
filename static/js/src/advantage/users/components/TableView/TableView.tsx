import React from "react";

import {
  default as TableHeaderComponent,
  TableHeaderProps,
} from "@canonical/react-components/dist/components/TableHeader";
import { Table, TableRow, Pagination } from "@canonical/react-components";

import { UserRole, Users, User } from "../../types";
import UserRow from "./UserRow";

export type UserRowVariant = "regular" | "editing" | "disabled";

const getVariant = (userEmail: string, userInEditMode?: User | null) => {
  if (userInEditMode == null) {
    return "regular";
  } else if (userEmail !== userInEditMode?.email) {
    return "disabled";
  } else {
    return "editing";
  }
};

type Props = {
  users: Users;
  userInEditMode?: User | null;
  setUserInEditMode: (User: User) => void;
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
  userInEditMode,
  setUserInEditMode,
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

  React.useEffect(() => {
    const totalPages = Math.ceil(users.length / pageSize);

    // reset pagination to last available page if exceeded the limit
    if (pageNumber > totalPages) {
      setPageNumber(totalPages > 0 ? totalPages : 1);
    }
  }, [pageNumber, users.length]);

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
              key={user.email}
              user={user}
              variant={getVariant(user.email, userInEditMode)}
              setUserInEditMode={setUserInEditMode}
              dismissEditMode={dismissEditMode}
              handleEditSubmit={handleEditSubmit}
              handleDeleteConfirmationModalOpen={
                handleDeleteConfirmationModalOpen
              }
            />
          ))}
        </tbody>
      </Table>
      {usersPage.length < 1 ? (
        <p className="u-align--center">No results</p>
      ) : null}
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
