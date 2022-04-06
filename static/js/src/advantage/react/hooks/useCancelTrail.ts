import { endTrial } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "react-query";

export const useCancelTrial = (accountId?: string | null) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, undefined | null>(
    () =>
      endTrial(accountId).then((response) => {
        if (response.errors) {
          throw new Error(response.errors);
        }
        return response;
      }),
    {
      onSuccess: () => {
        // Invalidate the subscriptions and last purchase ids so that
        // they reload where required.
        queryClient.invalidateQueries("userSubscriptions");
        queryClient.invalidateQueries(["lastPurchaseIds", accountId]);
      },
    }
  );
  return mutation;
};
