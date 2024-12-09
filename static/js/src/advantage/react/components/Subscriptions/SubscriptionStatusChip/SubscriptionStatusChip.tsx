import type { ReactNode } from "react";
import type { UserSubscription } from "advantage/api/types";
import { UserSubscriptionType } from "advantage/api/enum";

type StatusType = "positive" | "negative" | "caution";

type Props = {
  subscription: UserSubscription;
  children: (data?: { status: string; type: StatusType }) => ReactNode;
};

export default function SubscriptionStatusChip({
  subscription,
  children,
}: Props) {
  const {
    statuses: {
      is_expired,
      is_expiring,
      is_in_grace_period,
      is_renewed,
      is_renewal_actionable,
      is_renewable,
      is_subscription_active,
      is_cancelled,
    },
    type,
    renewal_id,
  } = subscription;

  const getChip = (status: string, type: StatusType) =>
    children({ type, status });

  if (is_expired || is_in_grace_period) {
    return getChip(is_expired ? "Expired" : "Grace period", "negative");
  }

  if (is_expiring) {
    return getChip("Expiring soon", "caution");
  }

  if (type === UserSubscriptionType.Legacy && renewal_id) {
    if (is_renewed) {
      return getChip("Renewed", "positive");
    }
    if (is_renewal_actionable && is_renewable) {
      return getChip("Not renewed", "caution");
    }
  }

  if (
    [
      UserSubscriptionType.Monthly,
      UserSubscriptionType.Yearly,
      UserSubscriptionType.Trial,
    ].includes(type)
  ) {
    if (is_subscription_active && !is_cancelled) {
      return getChip(
        is_renewed ? "Auto-renewal on" : "Auto-renewal off",
        is_renewed ? "positive" : "caution",
      );
    }

    if (is_cancelled) {
      return getChip("Cancelled", "negative");
    }
  } else if (is_subscription_active) {
    return getChip("Active", "positive");
  }

  return children();
}
