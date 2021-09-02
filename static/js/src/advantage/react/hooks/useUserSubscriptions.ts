import { getUserSubscriptions } from "advantage/api/contracts";
import { UserSubscriptionType } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Find the subscription that matches the free token.
 */
export const selectFreeSubscription = (subscriptions: UserSubscription[]) =>
  subscriptions.find(
    (subscription) => subscription.type === UserSubscriptionType.Free
  ) || null;

export const useUserSubscriptions = <D = UserSubscription[]>(
  options?: UseQueryOptions<UserSubscription[], unknown, D>
) => {
  const query = useQuery(
    "userSubscriptions",
    async () => await getUserSubscriptions(),
    options
  );
  return query;
};
