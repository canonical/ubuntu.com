import {
  Notification,
  NotificationSeverity,
} from "@canonical/react-components";
import React from "react";

import { usePendingPurchaseId, useURLs } from "../../../hooks";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectStatusesSummary } from "advantage/react/hooks/useUserSubscriptions";

const Notifications = () => {
  const urls = useURLs();
  const { pendingPurchaseId } = usePendingPurchaseId();
  const { data: statusesSummary } = useUserSubscriptions({
    // TODO: Get the selected subscription once the subscription token is
    // available.
    // https://github.com/canonical-web-and-design/commercial-squad/issues/210
    select: selectStatusesSummary,
  });

  const notifications = [];
  if (statusesSummary?.is_expiring) {
    notifications.push({
      children:
        'Select a subscription, then "Renew subscription..." to renew it.',
      "data-test": "is-expiring",
      title: "Your subscription is about to expire.",
      severity: NotificationSeverity.CAUTION,
    });
  }
  if (statusesSummary?.is_expired || statusesSummary?.is_in_grace_period) {
    notifications.push({
      children: "It will be removed within 14 days if it's not renewed.",
      "data-test": "is-expired",
      title: "Your subscription has expired. ",
      severity: NotificationSeverity.CAUTION,
    });
  }

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
