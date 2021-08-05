import {
  EnterpriseContracts,
  PendingPurchaseId,
  PersonalAccount,
} from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    enterpriseContracts?: EnterpriseContracts;
    pendingPurchaseId?: PendingPurchaseId;
    personalAccount?: PersonalAccount;
    usingTestBackend?: boolean;
  }
}

const getWindowData = () => ({
  enterpriseContracts: window.enterpriseContracts,
  pendingPurchaseId:
    window.pendingPurchaseId === "None" ? null : window.pendingPurchaseId,
  personalAccount: window.personalAccount,
  usingTestBackend: window.usingTestBackend,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const {
    enterpriseContracts,
    pendingPurchaseId,
    personalAccount,
    usingTestBackend,
  } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("enterpriseContracts", enterpriseContracts);
  queryClient.setQueryData("pendingPurchaseId", pendingPurchaseId);
  queryClient.setQueryData("personalAccount", personalAccount);
  queryClient.setQueryData("usingTestBackend", usingTestBackend);
};
