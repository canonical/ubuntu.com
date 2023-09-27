import { useState } from "react";
import { previewResizeContract } from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import { useQuery } from "react-query";
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
  } = useQuery<PreviewResizeContractResponse>(
    ["preview", quantity, subscription?.id],
    async () => {
      const res = await previewResizeContract(
        subscription?.account_id,
        lastPurchaseId,
        subscription?.listing_id,
        quantity,
        subscription?.period,
        subscription?.marketplace
      );

      if (res.errors) {
        if (
          res.errors.includes("no invoice would be issued for this purchase") ||
          res.errors.includes("purchase does not affect subscription")
        ) {
          return;
        }
        throw new Error(res.errors);
      }
      return res;
    },
    {
      enabled: quantity > 0,
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
    setQuantity: setQuantity,
  };
};
