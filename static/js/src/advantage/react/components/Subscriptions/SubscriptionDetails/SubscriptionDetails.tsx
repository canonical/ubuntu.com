import {
  Button,
  Notification,
  NotificationProps,
  Spinner,
} from "@canonical/react-components";
import React, { forwardRef, useEffect, useState } from "react";
import classNames from "classnames";

import DetailsContent from "./DetailsContent";
import SubscriptionEdit from "../SubscriptionEdit";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  isFreeSubscription,
  getNextCycleStart,
  isBlenderSubscription,
  formatDate,
} from "advantage/react/utils";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";
import { SelectedId } from "../Content/types";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import RenewalModal from "../RenewalModal";

type Props = {
  modalActive?: boolean;
  onCloseModal: () => void;
  selectedId?: SelectedId;
};

export const SubscriptionDetails = forwardRef<HTMLDivElement, Props>(
  ({ modalActive, onCloseModal, selectedId }: Props, ref) => {
    const [editing, setEditing] = useState(false);
    const [showingCancel, setShowingCancel] = useState(false);
    const [showingRenewalModal, setShowingRenewalModal] = useState(false);
    const [notification, setNotification] = useState<NotificationProps | null>(
      null
    );
    const { data: subscription, isLoading } = useUserSubscriptions({
      select: selectSubscriptionById(selectedId),
    });
    const isFree = isFreeSubscription(subscription);
    const isBlender = isBlenderSubscription(subscription);
    const nextCycleStart = getNextCycleStart(subscription);
    const unitName = isBlender ? "user" : "machine";

    const isResizable =
      subscription?.statuses.is_upsizeable ||
      subscription?.statuses.is_downsizeable;

    useEffect(() => {
      if (!modalActive) {
        // Close the edit form when the modal is closed so that if the modal for
        //the same subscription is opened then the edit form won't remain open.
        setEditing(false);
      }
    }, [modalActive]);

    useEffect(() => {
      if (!notification) {
        if (
          subscription?.current_number_of_machines &&
          (subscription?.current_number_of_machines ?? 0) <
            (subscription?.number_of_machines ?? 0)
        ) {
          setNotification({
            severity: "caution",
            children: (
              <>
                The {unitName} entitlement below will update to{" "}
                <b>{subscription?.current_number_of_machines}</b> at the next
                billing cycle on <b>{formatDate(nextCycleStart ?? "")}</b>.
              </>
            ),
          });
        }
      }
    }, [subscription?.current_number_of_machines]);

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
              <button
                className="p-modal__close"
                onClick={() => {
                  onCloseModal();
                  sendAnalyticsEvent({
                    eventCategory: "Advantage",
                    eventAction: "subscription-modal-toggle",
                    eventLabel: "subscription details modal closed",
                  });
                }}
              >
                Close
              </button>
            </header>
            <ExpiryNotification
              borderless
              className="p-subscriptions__details-notification"
              size={ExpiryNotificationSize.Large}
              statuses={subscription.statuses}
            />
            {notification ? <Notification {...notification} /> : null}
            {isFree ? null : (
              <>
                {subscription.statuses.has_access_to_support ? (
                  <Button
                    appearance="positive"
                    className="p-subscriptions__details-action"
                    data-test="support-button"
                    disabled={editing}
                    element="a"
                    href="https://portal.support.canonical.com/"
                  >
                    Support portal
                  </Button>
                ) : null}
                {subscription.statuses.is_renewable ? (
                  <Button
                    appearance="neutral"
                    className="p-subscriptions__details-action"
                    data-test="renew-button"
                    disabled={editing}
                    onClick={() => {
                      setShowingRenewalModal(true);
                      sendAnalyticsEvent({
                        eventCategory: "Advantage",
                        eventAction: "subscription-renewal-modal",
                        eventLabel: "subscription renewal modal opened",
                      });
                    }}
                  >
                    Renew subscription&hellip;
                  </Button>
                ) : null}
                {isResizable ? (
                  <Button
                    appearance="neutral"
                    className="p-subscriptions__details-action"
                    data-test="edit-button"
                    disabled={editing}
                    onClick={() => {
                      setEditing(true);
                      sendAnalyticsEvent({
                        eventCategory: "Advantage",
                        eventAction: "subscription-resize-form",
                        eventLabel: "resize form opened",
                      });
                    }}
                  >
                    Edit subscription&hellip;
                  </Button>
                ) : (
                  <h5 className="u-no-padding--top p-subscriptions__details-small-title">
                    <span style={{ fontWeight: 300 }} className="u-text--muted">
                      {" "}
                      This subscription cannot be edited online.
                    </span>
                  </h5>
                )}
              </>
            )}
          </div>
          {editing ? (
            <SubscriptionEdit
              onClose={() => {
                setEditing(false);
                sendAnalyticsEvent({
                  eventCategory: "Advantage",
                  eventAction: "subscription-resize-form",
                  eventLabel: "resize form closed",
                });
              }}
              setNotification={setNotification}
              selectedId={selectedId}
              setShowingCancel={setShowingCancel}
            />
          ) : (
            <DetailsContent selectedId={selectedId} />
          )}
        </section>
        {showingRenewalModal ? (
          <RenewalModal
            subscription={subscription}
            closeModal={() => {
              setShowingRenewalModal(false);
            }}
          />
        ) : null}
      </div>
    );
  }
);

SubscriptionDetails.displayName = "SubscriptionDetails";

export default SubscriptionDetails;
