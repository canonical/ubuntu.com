import type { PendingPurchaseId } from "advantage/api/types";
import { useQuery } from "react-query";

export const usePendingPurchaseId = () => {
  const { data: pendingPurchaseId } = useQuery<PendingPurchaseId>(
    "pendingPurchaseId"
  );
  return { pendingPurchaseId };
};
