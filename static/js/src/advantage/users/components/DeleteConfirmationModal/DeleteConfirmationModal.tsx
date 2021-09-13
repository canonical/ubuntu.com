import React, { useState } from "react";
import { Modal, Button } from "@canonical/react-components";

import { User } from "../../types";

type DeleteConfirmationModalProps = {
  user: User;
  handleConfirmDelete: (userId: string) => Promise<any>;
  handleClose: () => void;
};

const DeleteConfirmationModal = ({
  user,
  handleConfirmDelete,
  handleClose,
}: DeleteConfirmationModalProps) => {
  const [hasError, setHasError] = useState(false);

  const onSubmit = async () => {
    try {
      await handleConfirmDelete(user?.id);
      handleClose();
    } catch (error) {
      setHasError(true);
    }
  };

  return (
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
            onClick={onSubmit}
          >
            Yes, remove user
          </Button>
        </>
      }
    >
      {hasError ? (
        <div className="p-notification--negative">
          <div className="p-notification__content" aria-atomic="true">
            <h5 className="p-notification__title">Error</h5>
            <p className="p-notification__message" role="alert">
              An unknown error has occurred. Please try again later.
            </p>
          </div>
        </div>
      ) : null}
      <p>
        Are you sure you want to remove <strong>{user?.email}</strong> from your
        organisation?
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
