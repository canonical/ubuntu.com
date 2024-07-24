import { useState } from "react";
import { previewResizeContract } from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import { useQuery } from "@tanstack/react-query";
import { useLastPurchaseIds } from ".";
import { selectPurchaseIdsByMarketplaceAndPeriod } from "./useLastPurchaseIds";

export type PreviewResizeContractResponse = { total: number };

export const usePreviewResizeContract = (subscription?: UserSubscription) => {
  const { data: lastPurchaseId } = useLastPurchaseIds(
    subscription?.account_id,
    {
      select: selectPurchaseIdsByMarketplaceAndPeriod(
        subscription?.marketplace,
        subscription?.period
      ),
    }
  );

  const [quantity, setQuantity] = useState(0);

  const {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useQuery<PreviewResizeContractResponse>({
    queryKey: ["preview", quantity, subscription?.id],
    queryFn: async () => {
      if (!subscription?.account_id || !lastPurchaseId) {
        // Early return if required parameters are not available
        throw new Error("Missing required parameters");
      }

      const res = await previewResizeContract(
        subscription.account_id, // Ensure the correct type is passed
        lastPurchaseId,
        subscription.listing_id,
        quantity,
        subscription.period,
        subscription.marketplace
      );

      if (res.errors) {
        if (
          res.errors.includes("no invoice would be issued for this purchase") ||
          res.errors.includes("purchase does not affect subscription")
        ) {
          return; // Adjust based on what you want to return in this case
        }
        throw new Error(res.errors.join(", ")); // Join errors to make them more readable
      }
      return res;
    },
    enabled: quantity > 0 && !!subscription?.account_id && !!lastPurchaseId,
  });

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
    setQuantity: setQuantity,
  };
};
