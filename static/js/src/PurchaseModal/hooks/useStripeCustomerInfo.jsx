import { useQuery } from "react-query";
import { getCustomerInfo } from "../../advantage/api/contracts";

const useStripeCustomerInfo = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "paymentModalUserInfo",
    async () => {
      if (window.accountId) {
        const res = await getCustomerInfo(window.accountId);
        if (!res.data.code) {
          return res.data;
        }
      }

      //fallback to SSO data if there is no stripe info
      if (!window.accountJSONRes) {
        const accountResponse = await fetch(
          `/account.json${window.location.search}`,
          {
            cache: "no-store",
          }
        );
        const accountRes = await accountResponse.json();

        if (!accountRes.account) {
          throw new Error("Account not found");
        } else {
          window.accountJSONRes = accountRes.account;
        }
      }

      return {
        customerInfo: {
          email: window.accountJSONRes.email,
          name: window.accountJSONRes.fullname,
        },
      };
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

export default useStripeCustomerInfo;
