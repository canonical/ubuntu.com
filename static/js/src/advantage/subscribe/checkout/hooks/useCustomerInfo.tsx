import { useQuery } from "react-query";
import {
  getCustomerInfo,
  getPurchaseAccountStatus,
} from "advantage/api/contracts";
import { LoginSession, UserInfo } from "../utils/types";

const useCustomerInfo = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "customerInfo",
    async () => {
      if (!window.accountId && !window.loginSession) {
        const request = await fetch(`/account.json${window.location.search}`, {
          cache: "no-store",
        });
        const response: LoginSession = await request.json();

        if (!response.account) {
          throw new Error("Account not found");
        }

        window.loginSession = response;
        const accountStatusReq = await getPurchaseAccountStatus(
          window.marketplace
        );

        if (!accountStatusReq.account) {
          window.canTrial = true;
        } else {
          window.accountId = accountStatusReq.account.id;
          const lastPurchaseIds = accountStatusReq.last_purchase_ids;
          const canTrial = accountStatusReq.can_trial;
          window.previousPurchaseIds = lastPurchaseIds?.[window.marketplace];
          window.canTrial = canTrial;
        }
      }

      if (window.accountId) {
        const response = await getCustomerInfo(window.accountId);

        if (!response.data.code) {
          const data: UserInfo = response.data;

          return data;
        }
      }

      const data: UserInfo = {
        customerInfo: {
          email: window.loginSession?.account?.email,
          name: window.loginSession?.account?.fullname,
        },
      };

      return data;
    },
    {
      retry: false,
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default useCustomerInfo;
