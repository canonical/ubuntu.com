import { PendingPurchaseId, StripePublishableKey } from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    pendingPurchaseId?: PendingPurchaseId;
    stripePublishableKey?: StripePublishableKey;
  }
}

const getWindowData = () => ({
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
  stripePublishableKey: window.stripePublishableKey,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const { pendingPurchaseId, stripePublishableKey } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
  queryClient.setQueryData("stripePublishableKey", stripePublishableKey);
};
