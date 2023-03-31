import {
  Notification,
  NotificationSeverity,
  PropsWithSpread,
} from "@canonical/react-components";
import type { NotificationProps } from "@canonical/react-components";
import React, { ReactNode } from "react";

import { UserSubscriptionStatuses } from "advantage/api/types";
import { UserSubscriptionType } from "advantage/api/enum";

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
        default:
          "Click on renew subscription or enable auto-renewals via the renewal settings menu to ensure service continuity.",
        [UserSubscriptionType.Legacy]:
          "Click on Renew subscription to to ensure service continuity.",
        [UserSubscriptionType.Monthly]:
          "Enable auto-renewals via the renewal settings menu to ensure service continuity.",
        [UserSubscriptionType.Yearly]:
          "Enable auto-renewals via the renewal settings menu to ensure service continuity.",
        [UserSubscriptionType.Trial]:
          "Click on renew subscription to ensure service continuity.",
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
        default:
          "Click on renew subscription or enable auto-renewals via the renewal settings menu to ensure service continuity.",
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
        [UserSubscriptionType.Trial]: (
          <>Click on renew subscription to ensure service continuity.</>
        ),
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
        default:
          "Click on renew subscription or enable auto-renewals via the renewal settings menu to ensure service continuity.",
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
    return {
      children:
        subscriptionType && notification?.message[subscriptionType]
          ? notification?.message[subscriptionType]
          : notification?.message["default"],
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
