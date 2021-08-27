import {
  PendingPurchaseId,
  PersonalAccount,
  UsingTestBackend,
} from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    pendingPurchaseId?: PendingPurchaseId;
    personalAccount?: PersonalAccount;
    usingTestBackend?: UsingTestBackend;
  }
}

const getWindowData = () => ({
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
  personalAccount: window.personalAccount,
  usingTestBackend: window.usingTestBackend,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const {
    pendingPurchaseId,
    personalAccount,
    usingTestBackend,
  } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
  queryClient.setQueryData("personalAccount", personalAccount);
  queryClient.setQueryData("usingTestBackend", usingTestBackend);
};
