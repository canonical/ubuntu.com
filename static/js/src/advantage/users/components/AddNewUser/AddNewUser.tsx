import React, { useState } from "react";
import { Button, Modal } from "@canonical/react-components";

import AddNewUserForm from "./AddNewUserForm";

const AddNewUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNewUserSuccessMessage, setHasNewUserSuccessMessage] = useState(
    false
  );
  const handleClose = () => setIsModalOpen(false);
  const handleSubmit = (value: string) => {
    setHasNewUserSuccessMessage(true);
    return Promise.resolve(value);
  };

  return (
    <>
      <Button
        hasIcon
        onClick={() => {
          setIsModalOpen(true);
          setHasNewUserSuccessMessage(false);
        }}
        aria-label="Add new user..."
      >
        <i className="p-icon--plus"></i>
        <span>Add new user</span>
      </Button>
      {isModalOpen ? (
        <Modal close={handleClose} title="Add a new user to this organisation">
          <AddNewUserForm
            handleClose={() => setIsModalOpen(false)}
            handleSubmit={handleSubmit}
          />
        </Modal>
      ) : null}
      {hasNewUserSuccessMessage ? (
        <div className="p-notification--positive">
          <div className="p-notification__content" aria-atomic="true">
            <h5 className="p-notification__title">Success</h5>
            <p className="p-notification__message" role="alert">
              User added successfully
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AddNewUser;
