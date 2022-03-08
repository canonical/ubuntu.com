import { Notification } from "@canonical/react-components";
import React from "react";

import { useURLs } from "../../../hooks";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectStatusesSummary } from "advantage/react/hooks/useUserSubscriptions";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";
import useGetOffersList from "advantage/offers/hooks/useGetOffersList";

const Notifications = () => {
  const urls = useURLs();
  const { data: statusesSummary } = useUserSubscriptions({
    select: selectStatusesSummary,
  });
  const { data: offers } = useGetOffersList();

  const [
    isShowingOnboardingNotification,
    setIsShowingOnboardingNotification,
  ] = React.useState(
    localStorage.getItem("dismissedOnboardingNotification") !== "true"
  );

  const dismissOnboardingNotification = () => {
    localStorage.setItem("dismissedOnboardingNotification", "true");
    setIsShowingOnboardingNotification(false);
  };

  return (
    <>
      {statusesSummary?.has_pending_purchases ? (
        <Notification
          data-test="pendingPurchase"
          inline
          title="Payment method:"
          severity="caution"
        >
          You need to{" "}
          <a href={urls.account.paymentMethods}>update your payment methods</a>{" "}
          to ensure there is no interruption to your Ubuntu Advantage
          subscriptions
        </Notification>
      ) : null}
      {isShowingOnboardingNotification ? (
        <Notification
          data-test="onboarding"
          severity="information"
          actions={[
            {
              label: "Dismiss this message",
              onClick: dismissOnboardingNotification,
            },
            {
              label: "Manage account users",
              onClick: () => {
                location.href = urls.advantage.users;
              },
            },
          ]}
          onDismiss={dismissOnboardingNotification}
        >
          Tip: You can add additional Technical & Billing contacts in
          &quot;Account users&quot; to ensure service continuity and allow the
          right people access to your Subscriptions
        </Notification>
      ) : null}
      {offers?.length > 0 ? (
        <Notification
          data-test="offers"
          severity="information"
          actions={[
            {
              label: "View your offers",
              onClick: () => {
                location.href = urls.advantage.offers;
              },
            },
          ]}
        >
          You have one or more Ubuntu Advantage offers to view.
        </Notification>
      ) : null}
      {statusesSummary ? (
        <ExpiryNotification
          multiple
          size={ExpiryNotificationSize.Large}
          statuses={statusesSummary}
        />
      ) : null}
    </>
  );
};

export default Notifications;
