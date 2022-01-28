import { useQuery } from "react-query";
import { getCustomerInfo } from "../../advantage/api/contracts";

const useStripeCustomerInfo = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "paymentModalUserInfo",
    async () => {
      if (!window.accountId) {
        const response = await fetch(`/account.json${window.location.search}`, {
          cache: "no-store",
        });
        const res = await response.json();
        return {
          customerInfo: {
            email: res.account.email,
            name: res.account.fullname,
          },
        };
      }
      const res = await getCustomerInfo(window.accountId);
      if (res.data.code) {
        throw new Error(res.data.message);
      }
      return res.data;
    },
    {}
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
