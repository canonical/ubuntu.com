import { getUserSubscriptions } from "advantage/api/contracts";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionType,
} from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Get a subscription by token.
 */
export const selectSubscriptionByToken = (token?: string | null) => (
  subscriptions: UserSubscription[]
) => {
  // TODO: Get the matching subscription once the subscription token is
  // available. For now this gets the subscription by the position provided by
  // the fake token.
  // https://github.com/canonical-web-and-design/commercial-squad/issues/210
  const position = Number(token?.replace("ua-sub-", ""));
  return Number.isNaN(position) || position >= subscriptions.length
    ? selectFreeSubscription(subscriptions)
    : subscriptions[position];
};

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
