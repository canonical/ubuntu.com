import {
  Button,
  Notification,
  NotificationProps,
  Spinner,
} from "@canonical/react-components";
import React, { useCallback, forwardRef, useEffect, useState } from "react";
import classNames from "classnames";
import usePortal from "react-useportal";

import SubscriptionCancel from "../SubscriptionCancel";
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
import { UserSubscriptionType } from "advantage/api/enum";

type Props = {
  modalActive?: boolean;
  onCloseModal: () => void;
  selectedId?: SelectedId;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubscriptionDetails = forwardRef<HTMLDivElement, Props>(
  (
    { modalActive, onCloseModal, selectedId, setHasUnsavedChanges }: Props,
    ref
  ) => {
    const { openPortal, closePortal, isOpen, Portal } = usePortal();
    const showPortal = useCallback((show: boolean) => {
      // Programatically opening portals currently has an unresolved issue so we
      // need to provide a fake event:
      // https://github.com/alex-cory/react-useportal/issues/36
      const NULL_EVENT = { currentTarget: { contains: () => false } };
      if (show) {
        openPortal(NULL_EVENT);
      } else {
        closePortal(NULL_EVENT);
      }
    }, []);
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
        style={{ position: "sticky", top: 0, alignSelf: "start" }}
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
              {subscription.statuses.is_expired ? (
                <button className="p-chip--negative">
                  <span className="p-chip__value">Expired</span>
                </button>
              ) : (
                <>
                  {subscription.type == "legacy" && subscription.renewal_id ? (
                    <>
                      {subscription.statuses.is_renewed ? (
                        <button className="p-chip--positive">
                          <span className="p-chip__value">Renewed</span>
                        </button>
                      ) : (
                        <>
                          {subscription.statuses.is_renewal_actionable ? (
                            <button className="p-chip--caution">
                              <span className="p-chip__value">Not renewed</span>
                            </button>
                          ) : null}
                        </>
                      )}
                    </>
                  ) : null}
                  {subscription.type == "monthly" ||
                    subscription.type == "yearly" ? (
                    <>
                      {subscription.statuses.is_renewed ? (
                        <button className="p-chip--positive">
                          <span className="p-chip__value">Auto-renewal on</span>
                        </button>
                      ) : (
                        <button className="p-chip--caution">
                          <span className="p-chip__value">
                            Auto-renewal off
                          </span>
                        </button>
                      )}
                    </>
                  ) : null}
                </>
              )}
            </header>
            <ExpiryNotification
              borderless
              className="p-subscriptions__details-notification"
              size={ExpiryNotificationSize.Large}
              subscriptionType={subscription.type}
              statuses={subscription.statuses}
            />
            {notification ? <Notification {...notification} /> : null}
            {isFree ? null : (
              <>
                {subscription.statuses.has_access_to_support &&
                  subscription.type !== UserSubscriptionType.Trial ? (
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
                {subscription.marketplace == "canonical-ua" ? (
                  <Button
                    appearance="positive"
                    className="p-subscriptions__details-action"
                    data-test="support-button"
                    disabled={editing}
                    element="a"
                    href={
                      "/pro/attach?subscription=" + subscription.contract_id
                    }
                  >
                    Attach a machine
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
                {subscription.statuses.is_trialled ? (
                  <Button
                    appearance="neutral"
                    className="p-subscriptions__details-action"
                    data-test="cancel-trial-button"
                    disabled={editing}
                    onClick={() => {
                      showPortal(true);
                      sendAnalyticsEvent({
                        eventCategory: "Advantage",
                        eventAction: "subscription-cancel-trial",
                        eventLabel: "cancel trial button clicked",
                      });
                    }}
                  >
                    Cancel trial
                  </Button>
                ) : null}
                {isOpen && (
                  <Portal>
                    <SubscriptionCancel
                      isTrial
                      selectedId={selectedId}
                      onClose={() => showPortal(false)}
                      onCancelSuccess={() => {
                        showPortal(false);
                        setNotification({
                          severity: "positive",
                          children: "Trial was cancelled.",
                          onDismiss: () => setNotification(null),
                        });
                      }}
                    />
                  </Portal>
                )}
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
            <DetailsContent
              selectedId={selectedId}
              setHasUnsavedChanges={setHasUnsavedChanges}
            />
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
