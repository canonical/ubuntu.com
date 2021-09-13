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
    title="Confirm"
    buttonRow={
      <>
        <Button className="u-no-margin--bottom" onClick={handleClose}>
          No, cancel
        </Button>
        <Button
          className="u-no-margin--bottom"
          appearance="negative"
          onClick={() => handleConfirmDelete(user?.id)}
        >
          Yes, remove user
        </Button>
      </>
    }
  >
    <p>
      Are you sure you want to remove <strong>{user?.email}</strong> from your
      organisation?
    </p>
  </Modal>
);

export default DeleteConfirmationModal;
