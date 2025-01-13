import { getLastPurchaseIds } from "advantage/api/contracts";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

/**
 * Get a the last purchase id by account id and period.
 */
export const selectPurchaseIdsByMarketplaceAndPeriod =
  (
    marketplace?: UserSubscription["marketplace"],
    period?: UserSubscription["period"],
  ) =>
  (lastPurchaseIds: LastPurchaseIds) => {
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

export const useLastPurchaseIds = <
  ID extends UserSubscription["account_id"] | null | undefined,
  D = LastPurchaseIds,
>(
  accountId: ID,
  options: Omit<
    UseQueryOptions<LastPurchaseIds, unknown, D, [string, ID]>,
    "queryKey" | "queryFn"
  > = {},
) => {
  // Don't fetch the data until the account id is provided.
  const queryOptions: UseQueryOptions<
    LastPurchaseIds,
    unknown,
    D,
    [string, ID]
  > = {
    ...options,
    queryKey: ["lastPurchaseIds", accountId],
    queryFn: async () => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      return getLastPurchaseIds(accountId);
    },
    enabled: !!accountId,
  };

  const query = useQuery(queryOptions);

  return query;
};
