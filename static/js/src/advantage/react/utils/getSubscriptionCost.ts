import { UserSubscriptionPeriod } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { isFreeSubscription } from "./isFreeSubscription";

export const getSubscriptionCost = (
  subscription: UserSubscription
): string | null => {
  if (isFreeSubscription(subscription)) {
    return "Free";
  }
  const formatter = new Intl.NumberFormat("en-US", {
    currency: subscription.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  });
  // The provided price is in cents, so this converts it to dollars:
  let price = (subscription.price || 0) / 100;
  if (subscription.period === UserSubscriptionPeriod.Monthly) {
    price *= 12;
  }
  return price
    ? `${formatter.format(price)} ${subscription.currency}/yr`
    : null;
};
