import { addDays } from "date-fns";
import { UserSubscription } from "../../api/types";

export const getNextCycleStart = (
  subscription?: UserSubscription,
): Date | null => {
  if (!subscription?.end_date) return null;

  return addDays(subscription.end_date, 1);
};
