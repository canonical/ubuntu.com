import type { PersonalAccount } from "advantage/api/types";
import { useQuery } from "react-query";

export const usePersonalAccount = () => {
  const { data: personalAccount } = useQuery<PersonalAccount>(
    "personalAccount"
  );
  return { personalAccount };
};
