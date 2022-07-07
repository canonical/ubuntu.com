import { cancelContract } from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import { useMutation, useQueryClient } from "react-query";
import { useLastPurchaseIds } from ".";
import { selectPurchaseIdsByMarketplaceAndPeriod } from "./useLastPurchaseIds";

export const useCancelContract = (subscription?: UserSubscription) => {
  const queryClient = useQueryClient();
  const { data: lastPurchaseId } = useLastPurchaseIds(
    subscription?.account_id,
    {
      select: selectPurchaseIdsByMarketplaceAndPeriod(
        subscription?.marketplace,
        subscription?.period
      ),
    }
  );
  const mutation = useMutation<unknown, Error, undefined | null>(
    () =>
      cancelContract(
        subscription?.account_id,
        lastPurchaseId,
        subscription?.listing_id,
        subscription?.marketplace
      ).then((response) => {
        if (response.errors) {
          throw new Error(response.errors);
        }
        return response;
      }),
    {
      onSuccess: () => {
        // Invalidate the subscriptions and last purchase ids so that
        // they reload where required.
        queryClient.invalidateQueries("userSubscriptions");
        queryClient.invalidateQueries("userInfo");
        queryClient.invalidateQueries([
          "lastPurchaseIds",
          subscription?.account_id,
        ]);
      },
    }
  );
  return mutation;
};
