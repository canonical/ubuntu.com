import { useQuery } from "react-query";
import { postPurchaseData } from "../api/purchase";
import useStripeCustomerInfo from "../../PurchaseModal/hooks/useStripeCustomerInfo";

const usePreview = (productListingId: string) => {
  const { isError: isUserInfoError } = useStripeCustomerInfo();

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["preview", productListingId],
    async () => {
      if (!window.accountId) {
        throw new Error("Account ID missing");
      }

      const res = await postPurchaseData(
        window.accountId,
        productListingId,
        true
      );

      if (res.errors) {
        throw new Error(res.errors);
      }
      return res;
    },
    {
      enabled: !!window.accountId && !!productListingId && !isUserInfoError,
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  };
};

export default usePreview;
