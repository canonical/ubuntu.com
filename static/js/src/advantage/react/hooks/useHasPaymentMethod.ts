import { getCustomerInfo } from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import { useQuery } from "@tanstack/react-query";

export const useHasPaymentMethod = (
  accountId: UserSubscription["account_id"] | null,
) => {
  const query = useQuery<boolean>({
    queryKey: ["hasPaymentMethod", accountId],
    queryFn: async () => {
      const response = await getCustomerInfo(accountId);
      const defaultPaymentMethod =
        response.data?.customerInfo?.defaultPaymentMethod;
      return Boolean(defaultPaymentMethod);
    },
    enabled: Boolean(accountId),
  });
  return query;
};
