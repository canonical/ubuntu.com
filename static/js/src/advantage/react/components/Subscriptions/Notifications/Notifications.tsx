import { Notification } from "@canonical/react-components";
import React from "react";

import { usePendingPurchaseId, useURLs } from "../../../hooks";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectStatusesSummary } from "advantage/react/hooks/useUserSubscriptions";
import ExpiryNotification from "../ExpiryNotification";
import { ExpiryNotificationSize } from "../ExpiryNotification/ExpiryNotification";

const Notifications = () => {
  const urls = useURLs();
  const { pendingPurchaseId } = usePendingPurchaseId();
  const { data: statusesSummary } = useUserSubscriptions({
    // TODO: Get the selected subscription once the subscription token is
    // available.
    // https://github.com/canonical-web-and-design/commercial-squad/issues/210
    select: selectStatusesSummary,
  });

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
