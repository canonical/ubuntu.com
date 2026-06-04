import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { putContractEntitlements } from "advantage/api/contracts";
import {
  UserSubscription,
  UserSubscriptionEntitlementUpdate,
} from "advantage/api/types";

export const useUpdateContractEntitlementsMutation = (): UseMutationResult<
  unknown,
  Error,
  {
    contractId: UserSubscription["contract_id"];
    entitlements: UserSubscriptionEntitlementUpdate[];
  }
> => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    {
      contractId: UserSubscription["contract_id"];
      entitlements: UserSubscriptionEntitlementUpdate[];
    }
  >({
    mutationFn: async ({ contractId, entitlements }) => {
      const response = await putContractEntitlements(contractId, entitlements);
      if (response.errors || response.error) {
        throw new Error(response.errors || response.error);
      }
      return response;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
  });
  return mutation;
};
