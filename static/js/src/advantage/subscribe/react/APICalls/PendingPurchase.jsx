import { useState } from "react";
import { useQuery } from "react-query";
import { getPurchase } from "../../../contracts-api";

const usePendingPurchase = () => {
  const [pendingPurchaseID, setPendingPurchaseID] = useState();
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "pendingPurchase",
    async () => {
      const res = await getPurchase(pendingPurchaseID);
      return res;
    },
    {
      enabled: !!pendingPurchaseID,
    }
  );

  return {
    setPendingPurchaseID: setPendingPurchaseID,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default usePendingPurchase;
