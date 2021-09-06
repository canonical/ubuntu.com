import { PendingPurchaseId, UsingTestBackend } from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    pendingPurchaseId?: PendingPurchaseId;
    usingTestBackend?: UsingTestBackend;
  }
}

const getWindowData = () => ({
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
  usingTestBackend: window.usingTestBackend,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const { pendingPurchaseId, usingTestBackend } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
  queryClient.setQueryData("usingTestBackend", usingTestBackend);
};
