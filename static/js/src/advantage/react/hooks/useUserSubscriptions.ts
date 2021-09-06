import { getUserSubscriptions } from "advantage/api/contracts";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionType,
} from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Find the subscription that matches the free token.
 */
export const selectFreeSubscription = (subscriptions: UserSubscription[]) =>
  subscriptions.find(
    (subscription) => subscription.type === UserSubscriptionType.Free
  ) || null;

/**
 * Find the UA subscriptions.
 */
export const selectUASubscriptions = (subscriptions: UserSubscription[]) =>
  subscriptions.filter(
    ({ marketplace }) => marketplace === UserSubscriptionMarketplace.CanonicalUA
  );

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
