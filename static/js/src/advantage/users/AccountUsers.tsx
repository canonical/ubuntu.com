import React, { useState } from "react";
import { useQueryClient, useMutation } from "react-query";
import {
  User,
  Users,
  OrganisationName,
  NewUserValues,
  UserRole,
} from "./types";
import Organisation from "./components/Organisation";
import AddNewUser from "./components/AddNewUser/AddNewUser";
import TableView from "./components/TableView/TableView";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal/DeleteConfirmationModal";
import { requestAddUser, requestDeleteUser, requestUpdateUser } from "./api";
import { getErrorMessage } from "./utils";

export type AccountUsersProps = {
  organisationName: OrganisationName;
  accountId: string;
  users: Users;
};

const AccountUsers = ({
  accountId,
  organisationName,
  users,
}: AccountUsersProps) => {
  const [notification, setNotification] = useState<{
    severity: string;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const userAddMutation = useMutation(
    (user: NewUserValues) => requestAddUser({ accountId, ...user }),
    { onSuccess: () => queryClient.invalidateQueries("accountUsers") }
  );

  const userDeleteMutation = useMutation(
    (email: string) => requestDeleteUser({ accountId, email }),
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

  const handleUpdateUser = ({
    email,
    newUserRole,
  }: {
    email: string;
    newUserRole: UserRole;
  }): Promise<any> =>
    userUpdateMutation
      .mutateAsync({ email, role: newUserRole })
      .then(() => {
        dismissEditMode();
        setNotification({ severity: "positive", message: "User updated" });
      })
      .catch((error) => {
        setNotification({
          severity: "negative",
          message: getErrorMessage((error as any)?.message),
        });
      });

  const handleAddNewUser = (user: NewUserValues) =>
    userAddMutation.mutateAsync(user).then(() => {
      setNotification({
        severity: "positive",
        message: "User added successfully",
      });
    });

  const [
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
  ] = useState(false);
  const handleDeleteUser = (userId: string) =>
    userDeleteMutation.mutateAsync(userId).then(() => {
      dismissEditMode();
      setNotification({ severity: "positive", message: "User deleted" });
    });

  const [userInEditModeById, setUserInEditModeById] = useState<string | null>(
    null
  );
  const userInEditMode: User | undefined =
    typeof userInEditModeById === "string"
      ? users.find((user) => user.id === userInEditModeById)
      : undefined;

  const dismissEditMode = () => setUserInEditModeById(null);
  const handleDeleteConfirmationModalClose = () => {
    setIsDeleteConfirmationModalOpen(false);
  };
  const handleDeleteConfirmationModalOpen = () =>
    setIsDeleteConfirmationModalOpen(true);

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
            user={userInEditMode}
            handleConfirmDelete={handleDeleteUser}
            handleClose={handleDeleteConfirmationModalClose}
          />
        ) : null}
        <div className="row">
          <div className="col-12">
            <TableView
              users={users}
              userInEditModeById={userInEditModeById}
              setUserInEditModeById={setUserInEditModeById}
              dismissEditMode={dismissEditMode}
              handleEditSubmit={handleUpdateUser}
              handleDeleteConfirmationModalOpen={
                handleDeleteConfirmationModalOpen
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountUsers;
