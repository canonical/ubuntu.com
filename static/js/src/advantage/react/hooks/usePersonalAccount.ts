import type { PersonalAccount } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

/**
 * Find the contract that matches the free token.
 */
export const selectFreeContract = (personalAccount: PersonalAccount) =>
  personalAccount?.contracts.find(
    ({ token }) => token === personalAccount.free_token
  ) || null;

export const usePersonalAccount = <D = PersonalAccount>(
  options?: UseQueryOptions<PersonalAccount, unknown, D>
) => {
  const query = useQuery("personalAccount", options);
  return query;
};
