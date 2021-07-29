import type { QueryClient } from "react-query";

declare global {
  interface Window {
    enterpriseContracts?: unknown;
    pendingPurchaseId?: string;
    personalAccount?: unknown;
  }
}

const getWindowData = () => ({
  enterpriseContracts: window.enterpriseContracts,
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
  personalAccount: window.personalAccount,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const {
    enterpriseContracts,
    pendingPurchaseId,
    personalAccount,
  } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("enterpriseContracts", enterpriseContracts);
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
  queryClient.setQueryData("personalAccount", personalAccount);
};
