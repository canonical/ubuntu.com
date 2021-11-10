import { getContractToken } from "advantage/api/contracts";
import { ContractToken, UserSubscription } from "advantage/api/types";
import { useQuery } from "react-query";

export const useContractToken = (
  contractId?: UserSubscription["contract_id"] | null,
  isTokenVisible?: boolean | false
) => {
  const query = useQuery<ContractToken>(
    ["contractToken", contractId],
    async () => await getContractToken(contractId),
    {
      enabled: !!contractId && isTokenVisible,
    }
  );
  return query;
};
