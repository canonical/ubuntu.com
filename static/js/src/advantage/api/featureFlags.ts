export type ProFeatureFlags = Record<string, string>;
import { useQuery } from "@tanstack/react-query";
// Reads the Ubuntu Pro feature flags configured in the Python backend via
// APP_PRO_FEATURE* environment variables and served by /pro/feature-flags.json.
async function getProFeatureFlags(): Promise<ProFeatureFlags> {
  const response = await fetch("/pro/feature-flags.json", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load Pro feature flags: ${response.status} ${response.statusText}`,
    );
  }

  const featureFlags = await response.json();
  window.appConfig = {
    ...window.appConfig,
    featureFlags,
  };

  return featureFlags;
}

export const useGetProFeatureFlags = () => {
  return useQuery({
    queryKey: ["proFeatureFlags"],
    queryFn: getProFeatureFlags,
  });
};
