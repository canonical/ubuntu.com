import React, { useState } from "react";
import { Modal, Button } from "@canonical/react-components";

import { User } from "../../types";
import { getErrorMessage, SubmissionErrorMessage } from "../../utils";

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
  const [
    errorMessage,
    setErrorMessage,
  ] = useState<SubmissionErrorMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await handleConfirmDelete(user?.email);
      handleClose();
    } catch (error) {
      setErrorMessage(getErrorMessage((error as any)?.message));
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            onClick={onSubmit}
          >
            Yes, remove user
          </Button>
        </>
      }
    >
      {errorMessage ? (
        <div className="p-notification--negative">
          <div className="p-notification__content" aria-atomic="true">
            <h5 className="p-notification__title">Error</h5>
            <p className="p-notification__message" role="alert">
              {errorMessage}
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
