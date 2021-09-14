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
  let price = subscription.price || 0;
  if (subscription.period === UserSubscriptionPeriod.Monthly) {
    price *= 12;
  }
  return price
    ? `${formatter.format(price)} ${subscription.currency}/yr`
    : null;
};
