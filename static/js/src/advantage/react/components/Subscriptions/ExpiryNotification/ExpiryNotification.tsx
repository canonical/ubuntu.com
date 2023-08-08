import React, { ReactNode } from "react";
import type { NotificationProps } from "@canonical/react-components";
import {
  Notification,
  NotificationSeverity,
  PropsWithSpread,
} from "@canonical/react-components";
import { UserSubscriptionType } from "advantage/api/enum";
import { UserSubscriptionStatuses } from "advantage/api/types";

export enum ExpiryNotificationSize {
  Small = "small",
  Large = "large",
}

export enum StatusKey {
  IsExpired = "is_expired",
  IsInGracePeriod = "is_in_grace_period",
  IsExpiring = "is_expiring",
}

type Props = PropsWithSpread<
  {
    showMultiple?: boolean;
    subscriptionType?: UserSubscriptionType | "default";
    size: ExpiryNotificationSize;
    statuses: UserSubscriptionStatuses;
  },
  NotificationProps
>;

type Messages = Record<
  StatusKey,
  {
    [K in ExpiryNotificationSize]?: {
      message: { [K in UserSubscriptionType | "default"]?: ReactNode };
      title?: ReactNode;
    };
  }
>;

// The expiry status keys in priority order.
export const ORDERED_STATUS_KEYS = [
  StatusKey.IsExpired,
  StatusKey.IsInGracePeriod,
  StatusKey.IsExpiring,
];

/**
 * A definition of the expiry notification messages.
 * Large is displayed in the subscriptions header and details panel.
 * Small is used in the subscription list.
 */
const MESSAGES: Messages = {
  [StatusKey.IsExpiring]: {
    [ExpiryNotificationSize.Large]: {
      message: {
        default: "Check the subscription errors below for more information.",
        [UserSubscriptionType.Legacy]:
          "Click on Renew subscription to to ensure service continuity.",
        [UserSubscriptionType.Monthly]:
          "Enable auto-renewals via the renewal settings menu to ensure service continuity.",
        [UserSubscriptionType.Yearly]:
          "Enable auto-renewals via the renewal settings menu to ensure service continuity.",
        [UserSubscriptionType.Trial]:
          "You have cancelled your Ubuntu Pro trial. " +
          "At the end of the trial period, this subscription " +
          "will disappear and you will no longer have access to Pro services.",
        [UserSubscriptionType.KeyActivated]:
          "Contact the OEM to renew and ensure service continuity.",
      },
      title: "Your subscription is about to expire.",
    },
    [ExpiryNotificationSize.Small]: {
      message: {
        default: "Your subscription is about to expire.",
      },
    },
  },
  [StatusKey.IsExpired]: {
    [ExpiryNotificationSize.Large]: {
      message: {
        default: "Check the subscription errors below for more information.",
        [UserSubscriptionType.Legacy]:
          "Click on Renew subscription to to ensure service continuity.",
        [UserSubscriptionType.Monthly]: (
          <>
            If you don&apos;t renew it, it will disappear from your dashboard in
            90 days. To renew your expired subscription, purchase it again by
            clicking the <strong>Renew Subscription</strong> button. Your token
            will remain the same.
          </>
        ),
        [UserSubscriptionType.Yearly]: (
          <>
            If you don&apos;t renew it, it will disappear from your dashboard in
            90 days. To renew your expired subscription, purchase it again by
            clicking the <strong>Renew Subscription</strong> button. Your token
            will remain the same.
          </>
        ),
        [UserSubscriptionType.Trial]:
          "Your trial has expired. " +
          "This subscription will disappear from your dashboard soon.",
      },
      title: "Your subscription has expired.",
    },
    [ExpiryNotificationSize.Small]: {
      message: {
        default: "Subscription expired",
      },
    },
  },
  [StatusKey.IsInGracePeriod]: {
    [ExpiryNotificationSize.Large]: {
      message: {
        default: "Check the subscription errors below for more information.",
        [UserSubscriptionType.Legacy]:
          "Click on Renew subscription to to ensure service continuity.",
        [UserSubscriptionType.Monthly]: (
          <>
            If you don&apos;t renew it, it will disappear from your dashboard in
            90 days. To renew your expired subscription, purchase it again by
            clicking the <strong>Renew Subscription</strong> button. Your token
            will remain the same.
          </>
        ),
        [UserSubscriptionType.Yearly]: (
          <>
            If you don&apos;t renew it, it will disappear from your dashboard in
            90 days. To renew your expired subscription, purchase it again by
            clicking the <strong>Renew Subscription</strong> button. Your token
            will remain the same.
          </>
        ),
        [UserSubscriptionType.Trial]:
          "Your trial has expired. " +
          "This subscription will disappear from your dashboard soon.",
      },
      title: "Your subscription has expired.",
    },
    [ExpiryNotificationSize.Small]: {
      message: {
        default: "Subscription expired",
      },
    },
  },
};

const ExpiryNotification = ({
  showMultiple = false,
  subscriptionType,
  size,
  statuses,
  ...notificationProps
}: Props) => {
  let statusesToShow: StatusKey[] = [];
  const highestStatus = ORDERED_STATUS_KEYS.find((status) => statuses[status]);
  if (showMultiple) {
    // When displaying multiple notifications then find all the statuses that
    // are true.
    statusesToShow = ORDERED_STATUS_KEYS.filter((status) => statuses[status]);
  } else if (highestStatus) {
    // When displaying a single status then just show the highest priority
    // status.
    statusesToShow = [highestStatus];
  }

  const notifications = statusesToShow.map((statusKey) => {
    const notification = MESSAGES[statusKey][size];
    let children = notification?.message["default"];

    if (subscriptionType && notification?.message[subscriptionType]) {
      children = notification?.message[subscriptionType];
    }

    if (
      subscriptionType &&
      subscriptionType == "legacy" &&
      !statuses["is_renewal_actionable"]
    ) {
      children = "";
    }

    return {
      children: children,
      key: `${statusKey}-${size}`,
      // Display a title for large notifications.
      title: size === ExpiryNotificationSize.Large ? notification?.title : null,
      borderless: size === ExpiryNotificationSize.Small,
    };
  });

  return (
    <>
      {notifications.map(({ key, ...props }) => (
        <Notification
          data-test={key}
          inline
          severity={NotificationSeverity.CAUTION}
          {...props}
          {...notificationProps}
          key={key}
        />
      ))}
    </>
  );
};

export default ExpiryNotification;
