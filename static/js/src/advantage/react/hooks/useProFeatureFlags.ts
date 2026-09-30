import { getProFeatureFlags, ProFeatureFlags } from "advantage/api/featureFlags";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useProFeatureFlags = <D = ProFeatureFlags>(
  options?: Omit<
    UseQueryOptions<ProFeatureFlags, unknown, D, ["proFeatureFlags"]>,
    "queryKey"
  >,
) => {
  const query = useQuery({
    queryKey: ["proFeatureFlags"],
    queryFn: async () => await getProFeatureFlags(),
    ...options,
  });
  return query;
};
