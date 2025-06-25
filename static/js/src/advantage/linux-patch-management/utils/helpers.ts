import { useQuery } from "@tanstack/react-query";

export const useFetchCVEData = (release: string) => {
  return useQuery({
    queryKey: ["cveData", release],
    queryFn: async () => {
      const response = await fetch(
        `https://raw.githubusercontent.com/canonical/pro-cve-aggregator/refs/heads/master/${release}.json`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};

export const releaseToLTSEndYear = (release: string): number => {
  switch (release) {
    case "noble":
      return 2029;
    case "jammy":
      return 2027;
    case "focal":
      return 2025;
    case "bionic":
      return 2023;
    case "xenial":
      return 2021;
    case "trusty":
      return 2019;
    default:
      throw new Error(`Unknown release: ${release}`);
  }
};

export const releaseToProEndYear = (release: string): string => {
  switch (release) {
    case "noble":
      return "2034";
    case "jammy":
      return "2032";
    case "focal":
      return "2030";
    case "bionic":
      return "2028";
    case "xenial":
      return "2026";
    case "trusty":
      return "2024";
    default:
      throw new Error(`Unknown release: ${release}`);
  }
};

export const mapOriginToCoverage = (
  release: string,
  origin: string,
): string => {
  const LTSEndYear = releaseToLTSEndYear(release);
  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  if (thisYear >= LTSEndYear && thisMonth > 4) {
    return "Ubuntu Pro";
  }
  if (origin === "universe") {
    return "Ubuntu Pro";
  }
  return "LTS";
};

export const isEndOfLife = (release: string): boolean => {
  const endYear = releaseToLTSEndYear(release);
  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  // If the current year is after the end year, we consider it EOL
  if (thisYear > endYear) {
    return true;
  }
  // If the current month is after May, we consider it EOL for the next year
  if (thisYear === endYear && thisMonth > 4) {
    return true;
  }
  return false;
};
