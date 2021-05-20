import { useQuery } from "react-query";

const useStripeCustomerInfo = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "userInfo",
    async () => {
      if (!window.accountId) {
        throw new Error("MISSING ACCOUNT_ID");
      }
      const response = await fetch(
        `/ua-contracts/v1/accounts/${window.accountId}/customer-info/stripe`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      enabled: !!window.accountId,
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

export default useStripeCustomerInfo;
