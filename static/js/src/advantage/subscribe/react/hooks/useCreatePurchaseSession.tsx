import { PurchaseSessionCreateInput } from "../utils/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createPurchaseSession = async (
  purchaseSessionData: PurchaseSessionCreateInput,
) => {
  const response = await fetch(`/portal-proxy/pro/api/cart/purchase-sessions`, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(purchaseSessionData),
  });
  const data = await response.json();
  return data;
};

export const useCreatePurchaseSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purchaseSessionData: PurchaseSessionCreateInput) =>
      createPurchaseSession(purchaseSessionData),
    onSuccess: (data) => {
      queryClient.setQueryData([`purchaseSession`, data.id], data);
    },
  });
};
