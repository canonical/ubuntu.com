import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ActionButton,
  ButtonAppearance,
  CheckboxInput,
  Modal,
  Notification,
} from "@canonical/react-components";
import type { ModalProps } from "@canonical/react-components";
import { UserSubscription } from "advantage/api/types";
import { useAcceptAccountTOS } from "advantage/react/hooks";

type Props = {
  accountId: UserSubscription["account_id"];
  onClose: NonNullable<ModalProps["close"]>;
};

const AcceptTermsModal = ({ accountId, onClose }: Props) => {
  const [termsChecked, setTermsChecked] = useState(false);
  const [descriptionChecked, setDescriptionChecked] = useState(false);
  const acceptTOS = useAcceptAccountTOS();

  // Render into the body so the modal isn't trapped in the stacking context of
  // the sticky subscription details panel or affected by its modal styles.
  return createPortal(
    <Modal
      title="Accept terms"
      close={onClose}
      buttonRow={
        <ActionButton
          appearance={ButtonAppearance.POSITIVE}
          className="u-no-margin--bottom"
          disabled={!termsChecked || !descriptionChecked}
          loading={acceptTOS.isPending}
          onClick={() => acceptTOS.mutate(accountId)}
          type="button"
        >
          Continue
        </ActionButton>
      }
    >
      {acceptTOS.isError ? (
        <Notification severity="negative" title="Could not accept the terms:">
          Please try again. If the problem persists, contact{" "}
          <a href="mailto:customersuccess@canonical.com">customer success</a>.
        </Notification>
      ) : null}
      <p>
        Accept the service terms to get started with Ubuntu Pro and access your
        token.
      </p>
      <CheckboxInput
        checked={termsChecked}
        onChange={() => setTermsChecked(!termsChecked)}
        required
        label={
          <>
            I agree to the{" "}
            <a
              href="https://canonical.com/legal/ubuntu-pro-service-terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ubuntu Pro service terms
            </a>
          </>
        }
      />
      <CheckboxInput
        checked={descriptionChecked}
        onChange={() => setDescriptionChecked(!descriptionChecked)}
        required
        label={
          <>
            I agree to the{" "}
            <a
              href="https://canonical.com/legal/ubuntu-pro-description"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ubuntu Pro description
            </a>
          </>
        }
      />
    </Modal>,
    document.body,
  );
};

export default AcceptTermsModal;
