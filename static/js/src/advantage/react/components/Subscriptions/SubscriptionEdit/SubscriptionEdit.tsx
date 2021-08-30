import { ActionButton, Button } from "@canonical/react-components";
import React, { useCallback } from "react";
import usePortal from "react-useportal";
import { Formik } from "formik";

import SubscriptionCancel from "../SubscriptionCancel";
import FormikField from "../../FormikField";

type Props = {
  setShowingCancel: (showingCancel: boolean) => void;
  onClose: () => void;
};

const SubscriptionEdit = ({ setShowingCancel, onClose }: Props) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const showPortal = useCallback(
    (show: boolean) => {
      // Programatically opening portals currently has an unresolved issue so we
      // need to provide a fake event:
      // https://github.com/alex-cory/react-useportal/issues/36
      const NULL_EVENT = { currentTarget: { contains: () => false } };
      if (show) {
        openPortal(NULL_EVENT);
      } else {
        closePortal(NULL_EVENT);
      }
      setShowingCancel(show);
    },
    [setShowingCancel]
  );

  return (
    <>
      <Formik
        initialValues={{
          // TODO: use the initial value from the edited subscription.
          size: 0,
        }}
        onSubmit={() => {
          // TODO: Implement updating the subscription:
          // https://github.com/canonical-web-and-design/commercial-squad/issues/113
        }}
      >
        {({ handleSubmit }) => (
          <>
            <div className="u-sv3">
              <hr />
            </div>
            <form className="u-sv2" onSubmit={handleSubmit}>
              <h5>Resize subscription</h5>
              <div className="u-sv3">
                <FormikField
                  className="p-subscription__resize"
                  help={
                    <>
                      You can resize your subscriptions to as many machines as
                      needed.
                      <br />
                      Your next billing period will reflect the changes
                      accordingly.
                    </>
                  }
                  label="Number of machines"
                  name="size"
                  type="number"
                />
              </div>
              <div className="u-align--right">
                <Button appearance="base" onClick={onClose} type="button">
                  Cancel
                </Button>
                <ActionButton appearance="positive">Resize</ActionButton>
              </div>
            </form>
            <hr />
            <Button
              appearance="link"
              data-test="cancel-button"
              onClick={() => showPortal(true)}
            >
              You can cancel this subscription online or contact us.
            </Button>
            {isOpen && (
              <Portal>
                <SubscriptionCancel onClose={() => showPortal(false)} />
              </Portal>
            )}
          </>
        )}
      </Formik>
    </>
  );
};

export default SubscriptionEdit;
