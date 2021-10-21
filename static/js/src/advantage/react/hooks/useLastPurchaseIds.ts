import { getLastPurchaseIds } from "advantage/api/contracts";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Get a the last purchase id by account id and period.
 */
export const selectPurchaseIdsByPeriod = (
  period?: UserSubscription["period"] | null
) => (lastPurchaseIds: LastPurchaseIds) =>
  period && period in lastPurchaseIds ? lastPurchaseIds[period] : null;

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
