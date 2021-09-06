import { Button, Spinner } from "@canonical/react-components";
import React, { forwardRef, useState } from "react";
import classNames from "classnames";

import DetailsContent from "./DetailsContent";
import SubscriptionEdit from "../SubscriptionEdit";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectFreeSubscription } from "advantage/react/hooks/useUserSubscriptions";
import { isFreeSubscription } from "advantage/react/utils";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";

type Props = {
  modalActive?: boolean;
  onCloseModal: () => void;
};

const SubscriptionDetails = forwardRef<HTMLDivElement, Props>(
  ({ modalActive, onCloseModal }: Props, ref) => {
    const [editing, setEditing] = useState(false);
    const [showingCancel, setShowingCancel] = useState(false);
    const { data: subscription, isLoading } = useUserSubscriptions({
      // TODO: Get the selected subscription once the subscription token is
      // available.
      // https://github.com/canonical-web-and-design/commercial-squad/issues/210
      select: selectFreeSubscription,
    });
    const isFree = isFreeSubscription(subscription);
    if (isLoading || !subscription) {
      return <Spinner />;
    }
    return (
      <div
        className={classNames("p-modal p-subscriptions__details", {
          // Don't show the modal as active when the cancel modal is visible so
          // that we don't have two modals on top of each other.
          "is-active": modalActive && !showingCancel,
        })}
        ref={ref}
      >
        <section className="p-modal__dialog">
          <div className="u-sv1">
            <header className="p-modal__header p-subscriptions__details-header">
              <h2 className="p-modal__title p-subscriptions__details-title">
                {isFree ? "Free Personal Token" : subscription.product_name}
              </h2>
              <button className="p-modal__close" onClick={() => onCloseModal()}>
                Close
              </button>
            </header>
            <ExpiryNotification
              className="p-subscriptions__details-notification"
              size={ExpiryNotificationSize.Medium}
              statuses={subscription.statuses}
            />
            {isFree ? null : (
              <>
                <Button
                  appearance="positive"
                  className="p-subscriptions__details-action"
                  data-test="support-button"
                  disabled={editing}
                  element="a"
                  href="https://support.canonical.com/"
                >
                  Support portal
                </Button>
                <Button
                  appearance="neutral"
                  className="p-subscriptions__details-action"
                  data-test="edit-button"
                  disabled={editing}
                  onClick={() => setEditing(true)}
                >
                  Edit subscription&hellip;
                </Button>
              </>
            )}
          </div>
          {editing ? (
            <SubscriptionEdit
              setShowingCancel={setShowingCancel}
              onClose={() => setEditing(false)}
            />
          ) : (
            <DetailsContent />
          )}
        </section>
      </div>
    );
  }
);

SubscriptionDetails.displayName = "SubscriptionDetails";

export default SubscriptionDetails;
