import { setAutoRenewal } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "react-query";

export const useSetAutoRenewal = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, boolean>(
    (shouldAutoRenew) =>
      setAutoRenewal(shouldAutoRenew).then((response) => {
        if (response.errors) {
          throw new Error(response.errors);
        }
        return response;
      }),
    {
      onSuccess: () => {
        // Invalidate the user info so it fetches the updated data.
        queryClient.invalidateQueries("userInfo");
      },
    }
  );
  return mutation;
};
