import { getUserSubscriptions } from "advantage/api/contracts";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
  UserSubscriptionType,
} from "advantage/api/enum";
import {
  UserSubscription,
  UserSubscriptionStatuses,
} from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Get a subscription by token.
 */
export const selectSubscriptionById = (id?: UserSubscription["id"] | null) => (
  subscriptions: UserSubscription[]
) => subscriptions.find((subscription) => subscription.id === id);

/**
 * Find the subscription that matches the free token.
 */
export const selectFreeSubscription = (subscriptions: UserSubscription[]) =>
  subscriptions.find(
    (subscription) => subscription.type === UserSubscriptionType.Free
  ) || null;

/**
 * Whether there is a subscription with the provided status.
 */
const hasStatus = (
  subscriptions: UserSubscription[],
  status: keyof UserSubscriptionStatuses
) => subscriptions.some(({ statuses }) => statuses[status]);

/**
 * Get a summary of statuses for all subscriptions.
 */
export const selectStatusesSummary = (
  subscriptions: UserSubscription[]
): UserSubscriptionStatuses => ({
  has_pending_purchases: hasStatus(subscriptions, "has_pending_purchases"),
  is_cancellable: hasStatus(subscriptions, "is_cancellable"),
  is_cancelled: hasStatus(subscriptions, "is_cancelled"),
  is_downsizeable: hasStatus(subscriptions, "is_downsizeable"),
  is_expired: hasStatus(subscriptions, "is_expired"),
  is_expiring: hasStatus(subscriptions, "is_expiring"),
  is_in_grace_period: hasStatus(subscriptions, "is_in_grace_period"),
  is_renewal_actionable: hasStatus(subscriptions, "is_renewal_actionable"),
  is_renewable: hasStatus(subscriptions, "is_renewable"),
  is_trialled: hasStatus(subscriptions, "is_trialled"),
  is_upsizeable: hasStatus(subscriptions, "is_upsizeable"),
  is_subscription_active: hasStatus(subscriptions, "is_subscription_active"),
  is_subscription_auto_renewing: hasStatus(
    subscriptions,
    "is_subscription_auto_renewing"
  ),
  should_present_auto_renewal: hasStatus(
    subscriptions,
    "should_present_auto_renewal"
  ),
  has_access_to_support: hasStatus(subscriptions, "has_access_to_support"),
  has_access_to_token: hasStatus(subscriptions, "has_access_to_token"),
});

export const selectUASubscriptions = (subscriptions: UserSubscription[]) =>
  subscriptions.filter(
    ({ marketplace }) => marketplace === UserSubscriptionMarketplace.CanonicalUA
  );

export const selectBlenderSubscriptions = (subscriptions: UserSubscription[]) =>
  subscriptions.filter(
    ({ marketplace }) => marketplace === UserSubscriptionMarketplace.Blender
  );

export const selectAutoRenewableSubscriptionsByMarketplace = (
  targetMarketplace: UserSubscription["marketplace"]
) => (subscriptions: UserSubscription[]) =>
  subscriptions.filter(
    ({ statuses, marketplace }) =>
      statuses.should_present_auto_renewal && marketplace === targetMarketplace
  );

/**
 * Find the subscriptions with for period.
 */
export const selectSubscriptionsForPeriod = (
  period: UserSubscriptionPeriod
) => (subscriptions: UserSubscription[]) =>
  subscriptions.filter((subscription) => subscription.period === period);

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
