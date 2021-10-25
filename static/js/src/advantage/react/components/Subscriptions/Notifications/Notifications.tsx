import { Notification } from "@canonical/react-components";
import React from "react";

import { useURLs } from "../../../hooks";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectStatusesSummary } from "advantage/react/hooks/useUserSubscriptions";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";

const Notifications = () => {
  const urls = useURLs();
  const { data: statusesSummary } = useUserSubscriptions({
    select: selectStatusesSummary,
  });

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
