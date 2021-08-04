import {
  Notification,
  NotificationSeverity,
} from "@canonical/react-components";
import React from "react";

import { useURLs } from "../../../hooks";

const Notifications = () => {
  const urls = useURLs();
  const notifications = [
    {
      children: (
        <>
          You need to{" "}
          <a href={urls.account.paymentMethods}>update your payment methods</a>{" "}
          to ensure there is no interruption to your Ubuntu Advantage
          subscriptions
        </>
      ),
      title: "Payment method:",
      severity: NotificationSeverity.CAUTION,
    },
    {
      children:
        'Select a subscripton, then "Renew subscription..." to renew it.',
      title: "Your subscription is about to expire.",
      severity: NotificationSeverity.CAUTION,
    },
  ];

  return (
    <>
      {notifications.map((props, i) => (
        <Notification inline {...props} key={`notification-${i}`} />
      ))}
    </>
  );
};

export default Notifications;
