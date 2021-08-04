import { Notification, notificationTypes } from "@canonical/react-components";
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
      status: "Payment method:",
      type: notificationTypes.CAUTION,
    },
    {
      children:
        'Select a subscripton, then "Renew subscription..." to renew it.',
      status: "Your subscription is about to expire.",
      type: notificationTypes.CAUTION,
    },
  ];

  return (
    <>
      {notifications.map((props, i) => (
        <Notification {...props} key={`notification-${i}`} />
      ))}
    </>
  );
};

export default Notifications;
