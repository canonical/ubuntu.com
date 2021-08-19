import {
  Notification,
  NotificationSeverity,
} from "@canonical/react-components";
import React from "react";

import { usePendingPurchaseId, useURLs } from "../../../hooks";

const Notifications = () => {
  const urls = useURLs();
  const { pendingPurchaseId } = usePendingPurchaseId();
  const notifications = [
    {
      children:
        'Select a subscription, then "Renew subscription..." to renew it.',
      title: "Your subscription is about to expire.",
      severity: NotificationSeverity.CAUTION,
    },
  ];

  return (
    <>
      {pendingPurchaseId ? (
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
      {notifications.map((props, i) => (
        <Notification inline {...props} key={`notification-${i}`} />
      ))}
    </>
  );
};

export default Notifications;
