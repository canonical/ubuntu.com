import { getLastPurchaseIds } from "advantage/api/contracts";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

/**
 * Get a the last purchase id by account id and period.
 */
export const selectPurchaseIdsByMarketplaceAndPeriod = (
  marketplace?: UserSubscription["marketplace"],
  period?: UserSubscription["period"]
) => (lastPurchaseIds: LastPurchaseIds) => {
  if (
    !marketplace ||
    !period ||
    marketplace === UserSubscriptionMarketplace.Free ||
    marketplace === UserSubscriptionMarketplace.CanonicalCUBE
  ) {
    return null;
  }
  return lastPurchaseIds?.[marketplace]?.[period] ?? null;
};

export const useLastPurchaseIds = <D = LastPurchaseIds>(
  accountId?: UserSubscription["account_id"] | null,
  options: UseQueryOptions<LastPurchaseIds, unknown, D> = {}
) => {
  // Don't fetch the data until the account id is provided.
  options.enabled = !!accountId;
  const query = useQuery(
    ["lastPurchaseIds", accountId],
    async () => await getLastPurchaseIds(accountId),
    options
  );
  return query;
};
