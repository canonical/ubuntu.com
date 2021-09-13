import React from "react";
import { Modal, Button } from "@canonical/react-components";

import { User } from "../../types";

type DeleteConfirmationModalProps = {
  user: User;
  handleConfirmDelete: (userId: string) => void;
  handleClose: () => void;
};

const DeleteConfirmationModal = ({
  user,
  handleConfirmDelete,
  handleClose,
}: DeleteConfirmationModalProps) => (
  <Modal
    close={handleClose}
    title="Add a new user to this organisation"
    buttonRow={
      <>
        <Button className="u-no-margin--bottom" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="u-no-margin--bottom"
          appearance="positive"
          onClick={() => handleConfirmDelete(user?.id)}
        >
          Delete
        </Button>
      </>
    }
  >
    Are you sure you want to remove <strong>{user?.name}</strong> from your
    organisation?
  </Modal>
);

export default DeleteConfirmationModal;
