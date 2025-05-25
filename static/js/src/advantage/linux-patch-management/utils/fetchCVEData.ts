import { useQuery } from "@tanstack/react-query";

export const useFetchCVEData = (release: string) => {
    return useQuery({
        queryKey: ["cveData", release],
        queryFn: async () => {
            const response = await fetch(`/pro/cve-info/${release}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        }
    });
};
