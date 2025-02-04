import { setAutoRenewal } from "advantage/api/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    usabilla_live: (event: string, trigger: string) => void;
  }
}

export const useSetAutoRenewal = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, Error, { [key: string]: boolean }>({
    mutationFn: async (shouldAutoRenew: { [key: string]: boolean }) => {
      const response = await setAutoRenewal(shouldAutoRenew);
      if (response.errors) {
        throw new Error(response.errors);
      }
      if (!shouldAutoRenew[Object.keys(shouldAutoRenew)[0]]) {
        window.usabilla_live("trigger", "manual trigger");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate the user subscriptions query to force a fetch of the
      // updated data.
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
  });

  return mutation;
};
