import { Button } from "@canonical/react-components";
import React from "react";
import usePortal from "react-useportal";

import SubscriptionCancel from "../SubscriptionCancel";

const SubscriptionEdit = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  return (
    <>
      <Button appearance="link" data-test="cancel-button" onClick={openPortal}>
        You can cancel this subscription online or contact us.
      </Button>
      {isOpen && (
        <Portal>
          <SubscriptionCancel onClose={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default SubscriptionEdit;
