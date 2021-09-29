import React, { useState } from "react";
import { Modal, Button } from "@canonical/react-components";
import { useQueryClient, useMutation } from "react-query";
import * as Sentry from "@sentry/react";

import { requestDeleteUser } from "../../api";
import { User } from "../../types";
import {
  getErrorMessage,
  errorMessages,
  SubmissionErrorMessage,
} from "../../utils";

type DeleteConfirmationModalProps = {
  accountId: string;
  user: User;
  onAfterDeleteSuccess: () => void;
  handleClose: () => void;
};

const DeleteConfirmationModal = ({
  accountId,
  user,
  onAfterDeleteSuccess,
  handleClose,
}: DeleteConfirmationModalProps) => {
  const queryClient = useQueryClient();

  const userDeleteMutation = useMutation(
    (email: string) => requestDeleteUser({ accountId, email }),
    { onSuccess: () => queryClient.invalidateQueries("accountUsers") }
  );

  const handleDeleteUser = (userEmail: string) =>
    userDeleteMutation.mutateAsync(userEmail).then(() => {
      onAfterDeleteSuccess();
    });

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<SubmissionErrorMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await handleDeleteUser(user?.email);
      handleClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (errorMessage === errorMessages.unknown) {
        Sentry.captureException(error);
      }
      setErrorMessage(errorMessage);
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
