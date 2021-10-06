import React, { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "react-query";
import * as Sentry from "@sentry/react";
import { User, AccountUsersData, NewUserValues, UserRole } from "./types";
import Organisation from "./components/Organisation";
import AddNewUser from "./components/AddNewUser/AddNewUser";
import TableView from "./components/TableView/TableView";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal/DeleteConfirmationModal";
import UserSearch from "./components/UserSearch/UserSearch";

import { requestAddUser, requestUpdateUser } from "./api";
import { getErrorMessage, errorMessages } from "./utils";

export type AccountUsersProps = AccountUsersData;

const AccountUsersContainer = ({
  accountId,
  organisationName,
  users,
}: AccountUsersData) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [userInEditModeByEmail, setUserInEditModeByEmail] = useState<
    string | null
  >(null);

  const setUserInEditMode = (user: User) =>
    setUserInEditModeByEmail(user?.email);

  const dismissEditMode = () => setUserInEditModeByEmail(null);

  const handleSearch = (value: string) => {
    dismissEditMode();
    setSearchQuery(value);
  };

  const userInEditMode: User | undefined = React.useMemo(
    () =>
      typeof userInEditModeByEmail === "string"
        ? filteredUsers.find((user) => user.email === userInEditModeByEmail)
        : undefined,
    [userInEditModeByEmail, filteredUsers]
  );

  useEffect(() => {
    const filteredUsers = users.filter((user) =>
      user.email.includes(searchQuery)
    );

    setFilteredUsers(filteredUsers);
  }, [searchQuery, users]);

  return (
    <AccountUsers
      accountId={accountId}
      organisationName={organisationName}
      users={filteredUsers}
      userInEditMode={userInEditMode}
      dismissEditMode={dismissEditMode}
      setUserInEditMode={setUserInEditMode}
      handleSearch={handleSearch}
    />
  );
};

const AccountUsers = ({
  accountId,
  organisationName,
  users,
  userInEditMode,
  setUserInEditMode,
  dismissEditMode,
  handleSearch,
}: AccountUsersData & {
  handleSearch: (value: string) => void;
  userInEditMode?: User;
  setUserInEditMode: (user: User) => void;
  dismissEditMode: () => void;
}) => {
  const [notification, setNotification] = useState<{
    severity: string;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const userAddMutation = useMutation(
    (user: NewUserValues) => requestAddUser({ accountId, ...user }),
    { onSuccess: () => queryClient.invalidateQueries("accountUsers") }
  );

  const userUpdateMutation = useMutation(
    ({ email, role }: { email: string; role: UserRole }) =>
      requestUpdateUser({
        accountId,
        email,
        role,
      }),
    {
      onSuccess: () => queryClient.invalidateQueries("accountUsers"),
    }
  );

  const handleMutationError = (error: unknown) => {
    const errorMessage = getErrorMessage(error);
    if (errorMessage === errorMessages.unknown) {
      Sentry.captureException(error);
    }

    setNotification({
      severity: "negative",
      message: errorMessage,
    });
  };

  const handleUpdateUser = ({
    email,
    newUserRole,
  }: {
    email: string;
    newUserRole: UserRole;
  }) =>
    userUpdateMutation
      .mutateAsync({ email, role: newUserRole })
      .then(() => {
        dismissEditMode();
        setNotification({ severity: "positive", message: "User updated" });
      })
      .catch(handleMutationError);

  const handleAddNewUser = (user: NewUserValues) =>
    userAddMutation
      .mutateAsync(user)
      .then(() => {
        setNotification({
          severity: "positive",
          message: "User added successfully",
        });
      })
      .catch(handleMutationError);

  const [
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
  ] = useState(false);

  const handleOnAfterDeleteSuccess = () => {
    dismissEditMode();
    setNotification({ severity: "positive", message: "User deleted" });
  };

  return (
    <div>
      <section className="p-strip u-no-padding--top">
        <div className="row">
          <div className="col-6">
            <Organisation name={organisationName} />
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <AddNewUser
              handleSubmit={handleAddNewUser}
              onAfterModalOpen={() => setNotification(null)}
            />
          </div>
          <div className="col-6">
            <UserSearch handleSearch={handleSearch} />
          </div>
        </div>
        {notification ? (
          <div className="row">
            <div className="col-12">
              <div className={`p-notification--${notification.severity}`}>
                <div className="p-notification__content" aria-atomic="true">
                  <h5 className="p-notification__title">
                    {notification.severity === "positive" ? "Success" : "Error"}
                  </h5>
                  <p className="p-notification__message" role="alert">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {isDeleteConfirmationModalOpen && userInEditMode ? (
          <DeleteConfirmationModal
            accountId={accountId}
            user={userInEditMode}
            onAfterDeleteSuccess={handleOnAfterDeleteSuccess}
            handleClose={() => setIsDeleteConfirmationModalOpen(false)}
          />
        ) : null}
        <div className="row">
          <div className="col-12">
            <TableView
              users={users}
              userInEditMode={userInEditMode}
              setUserInEditMode={setUserInEditMode}
              dismissEditMode={dismissEditMode}
              handleEditSubmit={handleUpdateUser}
              handleDeleteConfirmationModalOpen={() =>
                setIsDeleteConfirmationModalOpen(true)
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountUsersContainer;
