import { useQuery } from "@tanstack/react-query";

export const useFetchCVEData = (release: string) => {
  return useQuery({
    queryKey: ["cveData", release],
    queryFn: async () => {
      const response = await fetch(
        `https://raw.githubusercontent.com/abhigyanghosh30/cve-aggregator/refs/heads/master/${release}.json`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};
