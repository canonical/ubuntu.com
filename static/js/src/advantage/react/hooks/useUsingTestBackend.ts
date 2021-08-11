import type { UsingTestBackend } from "advantage/api/types";
import { useQuery } from "react-query";

export const useUsingTestBackend = () => {
  const { data: usingTestBackend } = useQuery<UsingTestBackend>(
    "usingTestBackend"
  );
  return { usingTestBackend };
};
