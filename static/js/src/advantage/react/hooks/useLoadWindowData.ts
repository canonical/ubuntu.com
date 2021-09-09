import { PendingPurchaseId } from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    pendingPurchaseId?: PendingPurchaseId;
  }
}

const getWindowData = () => ({
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const { pendingPurchaseId } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
};
