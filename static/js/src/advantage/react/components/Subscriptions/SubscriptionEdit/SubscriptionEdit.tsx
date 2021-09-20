import {
  ActionButton,
  Button,
  NotificationProps,
} from "@canonical/react-components";
import React, { useCallback } from "react";
import usePortal from "react-useportal";
import { Formik } from "formik";

import SubscriptionCancel from "../SubscriptionCancel";
import FormikField from "../../FormikField";
import { SelectedId } from "../Content/types";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";

type Props = {
  onClose: () => void;
  selectedId?: SelectedId;
  setNotification: (props: NotificationProps | null) => void;
  setShowingCancel: (showingCancel: boolean) => void;
};

const SubscriptionEdit = ({
  onClose,
  selectedId,
  setNotification,
  setShowingCancel,
}: Props) => {
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
  const { data: subscription } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });

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
          <form className="p-subscription__edit" onSubmit={handleSubmit}>
            <div className="u-sv2">
              <div className="u-sv3 u-hide--small">
                <hr />
              </div>
              <h5>Resize subscription</h5>
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
                wrapperClassName="u-sv3"
              />
            </div>
            <div className="p-subscription__resize-actions u-align--right u-sv3">
              <Button
                appearance="base"
                className="p-subscription__resize-action"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <ActionButton
                appearance="positive"
                className="p-subscription__resize-action"
              >
                Resize
              </ActionButton>
            </div>
            {subscription?.statuses?.is_cancellable ? (
              <div>
                <hr />
                <Button
                  appearance="link"
                  className="u-align-text--left"
                  data-test="cancel-button"
                  onClick={() => showPortal(true)}
                  type="button"
                >
                  You can cancel this subscription online or contact us.
                </Button>
              </div>
            ) : null}
          </form>
        )}
      </Formik>
      {isOpen && (
        <Portal>
          <SubscriptionCancel
            selectedId={selectedId}
            onClose={() => showPortal(false)}
            onCancelSuccess={() => {
              onClose();
              setNotification({
                severity: "positive",
                children: "This subscription was cancelled.",
                onDismiss: () => setNotification(null),
              });
            }}
          />
        </Portal>
      )}
    </>
  );
};

export default SubscriptionEdit;
