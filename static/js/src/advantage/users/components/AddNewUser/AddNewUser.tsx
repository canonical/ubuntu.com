import React, { useState } from "react";
import { Button, Modal } from "@canonical/react-components";

import AddNewUserForm from "./AddNewUserForm";
import { HandleNewUserSubmit } from "../../types";

type AddNewUserProps = {
  handleSubmit: HandleNewUserSubmit;
  onAfterModalOpen?: () => void;
};

const AddNewUser = ({ handleSubmit, onAfterModalOpen }: AddNewUserProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = () => setIsModalOpen(false);

  return (
    <>
      <Button
        hasIcon
        onClick={() => {
          setIsModalOpen(true);
          onAfterModalOpen?.();
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
    </>
  );
};

export default AddNewUser;
