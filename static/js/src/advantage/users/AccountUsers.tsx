import React, { useState } from "react";

import { User, Users, OrganisationName } from "./types";
import Organisation from "./components/Organisation";
import AddNewUser from "./components/AddNewUser/AddNewUser";
import TableView from "./components/TableView/TableView";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal/DeleteConfirmationModal";

type Props = {
  organisationName: OrganisationName;
  users: Users;
};

const AccountUsers = ({ organisationName, users }: Props) => {
  const [hasNewUserSuccessMessage, setHasNewUserSuccessMessage] = useState(
    false
  );
  const handleAddNewUser = (value: string) => {
    return Promise.resolve(value).then(() => {
      setHasNewUserSuccessMessage(true);
    });
  };
  const [
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
  ] = useState(false);
  const handleDelete = (userId: string) =>
    Promise.resolve(userId).then(() => {
      handleDeleteConfirmationModalClose();
      dismissEditMode();
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
      <div className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </div>
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
              onAfterModalOpen={() => setHasNewUserSuccessMessage(false)}
            />
          </div>
        </div>
        {hasNewUserSuccessMessage ? (
          <div className="row">
            <div className="col-12">
              <div className="p-notification--positive">
                <div className="p-notification__content" aria-atomic="true">
                  <h5 className="p-notification__title">Success</h5>
                  <p className="p-notification__message" role="alert">
                    User added successfully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isDeleteConfirmationModalOpen && userInEditMode ? (
          <DeleteConfirmationModal
            user={userInEditMode}
            handleConfirmDelete={handleDelete}
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
