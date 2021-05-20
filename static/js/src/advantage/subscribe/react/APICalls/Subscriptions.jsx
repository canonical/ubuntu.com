import { useQuery } from "react-query";

const useSubscriptions = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "subscriptions",
    async () => {
      const response = await fetch(
        `/ua-contracts/v1/accounts/${window.accountId}/marketplace/canonical-ua/subscriptions?status=active`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const subscriptions = {};
      const data = await response.json();

      // create a subscriptions object with periods as the keys
      data.subscriptions.forEach((subscription) => {
        subscriptions[subscription.subscription.period] = subscription;
      });
      return subscriptions;
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

export default useSubscriptions;
