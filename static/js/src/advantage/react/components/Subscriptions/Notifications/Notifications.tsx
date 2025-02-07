import { Notification } from "@canonical/react-components";
import React, { useEffect } from "react";

import { useURLs } from "../../../hooks";
import {
  useUserSubscriptions,
  useHasPaymentMethod,
} from "advantage/react/hooks";
import { selectStatusesSummary } from "advantage/react/hooks/useUserSubscriptions";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";
import useGetOffersList from "advantage/offers/hooks/useGetOffersList";
import useRequestAccountUsers from "advantage/users/hooks/useRequestAccountUsers";

const Notifications = () => {
  const urls = useURLs();
  const { data: statusesSummary } = useUserSubscriptions({
    select: selectStatusesSummary,
  });
  const { data: offers } = useGetOffersList();
  const { data: accountUsers, isSuccess: isAccountUsersSuccess } =
    useRequestAccountUsers();
  const { data: hasPaymentMethod, isSuccess: isHasPaymentMethodSuccess } = useHasPaymentMethod(
    accountUsers?.accountId ?? null,
  );

  const [isShowingOnboardingNotification, setIsShowingOnboardingNotification] =
    React.useState(
      localStorage.getItem("dismissedOnboardingNotification") !== "true",
    );

  const dismissOnboardingNotification = () => {
    localStorage.setItem("dismissedOnboardingNotification", "true");
    setIsShowingOnboardingNotification(false);
  };
  useEffect(() => {
    if ((accountUsers?.users.length ?? 1) > 1) {
      dismissOnboardingNotification();
    }
  }, [accountUsers]);

  return (
    <>
      {isHasPaymentMethodSuccess && !hasPaymentMethod ? (
        <Notification
          data-test="no-payment-method"
          severity="caution"
          title="No payment method saved"
        >
          To auto-renew or resize your subscription, add one in{" "}
          <a href={urls.account.paymentMethods}>Payment method</a>.
        </Notification>
      ) : null}
      {statusesSummary?.has_pending_purchases ? (
        <Notification
          data-test="pendingPurchase"
          inline
          title="Payment method:"
          severity="caution"
        >
          You need to{" "}
          <a href={urls.account.paymentMethods}>update your payment method</a>{" "}
          to ensure there is no interruption to your Ubuntu Pro subscriptions
        </Notification>
      ) : null}
      {isAccountUsersSuccess && isShowingOnboardingNotification ? (
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
          You have one or more Ubuntu Pro offers to view.
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
