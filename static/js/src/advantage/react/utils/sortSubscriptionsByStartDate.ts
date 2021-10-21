import { UserSubscription } from "advantage/api/types";
import { parseJSON } from "date-fns";

export const sortSubscriptionsByStartDate = (
  subscriptions: UserSubscription[]
) =>
  [...subscriptions].sort(
    (a, b) =>
      parseJSON(b.start_date).getTime() - parseJSON(a.start_date).getTime()
  );
