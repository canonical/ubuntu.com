import { setAutoRenewal } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "react-query";

export const useSetAutoRenewal = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, { [key: string]: boolean }>(
    (shouldAutoRenew) =>
      setAutoRenewal(shouldAutoRenew).then((response) => {
        if (response.errors) {
          throw new Error(response.errors);
        }
        return response;
      }),
    {
      onSuccess: () => {
        // Invalidate the user subscriptions query to force a fetch of the
        // updated data.
        queryClient.invalidateQueries("userSubscriptions");
      },
    }
  );
  return mutation;
};
