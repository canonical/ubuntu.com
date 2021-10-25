import { putContractEntitlements } from "../../api/contracts";
import { UserSubscription } from "../../api/types";
import { useMutation, useQueryClient } from "react-query";

export const useUpdateContractEntitlementsMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    {
      contractId: UserSubscription["contract_id"];
      entitlements: { type: string; isEnabled: boolean }[];
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
