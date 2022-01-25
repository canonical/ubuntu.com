import addDays from "date-fns/addDays";
import { UserSubscription } from "../../api/types";

export const getNextCycleStart = (
  subscription?: UserSubscription
): Date | null => {
  if (!subscription?.end_date) return null;

  return addDays(new Date(subscription.end_date), 1);
};
