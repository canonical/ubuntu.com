import { useQuery } from "react-query";
import { getPurchaseAccountStatus } from "advantage/api/contracts";

const useAccountInfo = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "accountInfo",
    async () => {
      console.log("window.marketplace", window.marketplace);
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
      const data: any = {
        accountInfo: accountStatusReq,
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
export default useAccountInfo;
