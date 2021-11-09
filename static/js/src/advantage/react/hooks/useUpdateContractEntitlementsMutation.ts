import { useMutation, useQueryClient } from "react-query";
import { putContractEntitlements } from "advantage/api/contracts";
import {
  UserSubscription,
  UserSubscriptionEntitlementUpdate,
} from "advantage/api/types";

export const useUpdateContractEntitlementsMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    {
      contractId: UserSubscription["contract_id"];
      entitlements: UserSubscriptionEntitlementUpdate[];
    }
  >(
    ({ contractId, entitlements }) =>
      putContractEntitlements(contractId, entitlements).then((response) => {
        if (response.errors || response.error) {
          throw new Error(response.errors || response.error);
        }
        return response;
      }),
    {
      onSettled: () => {
        queryClient.invalidateQueries("userSubscriptions");
      },
    }
  );
  return mutation;
};
