import { setAutoRenewal } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSetAutoRenewal = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, { [key: string]: boolean }>({
    mutationFn: async (shouldAutoRenew: { [key: string]: boolean }) => {
      const response = await setAutoRenewal(shouldAutoRenew);
      if (response.errors) {
        throw new Error(response.errors);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
  });

  return mutation;
};
