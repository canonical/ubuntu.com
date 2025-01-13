import { resizeContract } from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLastPurchaseIds } from ".";
import { selectPurchaseIdsByMarketplaceAndPeriod } from "./useLastPurchaseIds";

export type ResizeContractResponse = { id: string };

export const useResizeContract = (subscription?: UserSubscription) => {
  const queryClient = useQueryClient();
  const { data: lastPurchaseId } = useLastPurchaseIds(
    subscription?.account_id,
    {
      select: selectPurchaseIdsByMarketplaceAndPeriod(
        subscription?.marketplace,
        subscription?.period,
      ),
    },
  );

  const mutation = useMutation<ResizeContractResponse, Error, number>({
    mutationFn: async (quantity: number) => {
      if (!subscription?.account_id) {
        throw new Error("Account Id is required");
      }
      const response = await resizeContract(
        subscription?.account_id,
        lastPurchaseId,
        subscription?.listing_id,
        quantity,
        subscription?.period,
        subscription?.marketplace,
      );
      if (response.errors) {
        // Sometimes the request fails because the previous purchase id
        // response has a delay before the API will return the latest value,
        // so invalidate the query here so that the newest value will be
        // available if the user tries again.
        queryClient.invalidateQueries({
          queryKey: ["lastPurchaseIds", subscription.account_id],
        });
        throw new Error(response.errors);
      }

      return response;
    },
  });
  return mutation;
};
