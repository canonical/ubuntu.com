import { UserSubscriptionPeriod } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";

export const getPeriodDisplay = (period: UserSubscription["period"]) => {
  switch (period) {
    case UserSubscriptionPeriod.Monthly:
      return "Monthly";
    case UserSubscriptionPeriod.Yearly:
      return "Yearly";
    default:
      return period;
  }
};
