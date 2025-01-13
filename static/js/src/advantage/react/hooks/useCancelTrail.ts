import { endTrial } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelTrial = (accountId?: string | null) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, undefined | null>({
    mutationFn: async () => {
      const response = await endTrial(accountId);

      if (response.errors) {
        throw new Error(response.errors);
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate the subscriptions and last purchase ids so that
      // they reload where required.
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({
        queryKey: ["lastPurchaseIds", accountId],
      });
    },
  });
  return mutation;
};
