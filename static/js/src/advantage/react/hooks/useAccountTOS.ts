import { acceptAccountTOS, getAccountTOS } from "advantage/api/contracts";
import { AccountTOS, UserSubscription } from "advantage/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type AccountId = UserSubscription["account_id"];

export const useAccountTOS = (accountId?: AccountId | null, enabled = true) =>
  useQuery<AccountTOS>({
    queryKey: ["accountTOS", accountId],
    queryFn: async () => {
      const response = await getAccountTOS(accountId);
      if (response.errors) {
        throw new Error(response.errors);
      }
      return response;
    },
    enabled: !!accountId && enabled,
  });

export const useAcceptAccountTOS = () => {
  const queryClient = useQueryClient();

  return useMutation<AccountTOS, Error, AccountId>({
    mutationFn: async (accountId) => {
      const response = await acceptAccountTOS(accountId);
      if (response.errors) {
        throw new Error(response.errors);
      }
      return response;
    },
    onSuccess: (data, accountId) => {
      queryClient.setQueryData(["accountTOS", accountId], data);
    },
  });
};
